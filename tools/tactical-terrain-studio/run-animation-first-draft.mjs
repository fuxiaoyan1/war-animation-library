#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/run-animation-first-draft.mjs --spec <file> --out <dir>",
    "",
    "Options:",
    "  --spec <file>       Animation production spec JSON.",
    "  --out <dir>         Output artifact directory.",
    "  --allow-draft       Allow non-ready phases to remain as disclosed first-draft risks.",
    "  --strict            Exit non-zero unless all six phases are ready.",
    "  --help              Show this help."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { allowDraft: false, strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--allow-draft") {
      args.allowDraft = true;
      continue;
    }
    if (arg === "--strict") {
      args.strict = true;
      continue;
    }
    if (arg === "--spec" || arg === "--out") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[arg.slice(2)] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error([
      `Command failed: node ${script} ${args.join(" ")}`,
      result.stdout.trim(),
      result.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
  return {
    command: `node ${script} ${args.join(" ")}`,
    stdout: result.stdout.trim()
  };
}

function phaseWarningCount(phase) {
  return Object.values(phase.warningSummary ?? {}).reduce((sum, value) => sum + value, 0);
}

function classifyFirstDraft(manifest, allowDraft) {
  const phases = manifest.productionPhases ?? [];
  const notReadyPhases = phases.filter((phase) => phase.status !== "ready");
  const blockedPhases = phases.filter((phase) => phase.status === "blocked");
  const highQualityReady = manifest.firstDraftReadiness?.status === "ready-for-high-quality-first-draft" && !notReadyPhases.length;
  let status = "ready-for-animation-first-draft-implementation";
  if (blockedPhases.length) {
    status = "blocked-before-animation-first-draft";
  } else if (!highQualityReady && !allowDraft) {
    status = "not-ready-for-high-quality-first-draft";
  } else if (!highQualityReady && allowDraft) {
    status = "draftable-only-with-explicit-risk-disclosure";
  }
  return {
    blockedPhases: blockedPhases.map((phase) => phase.id),
    highQualityReady,
    notReadyPhases: notReadyPhases.map((phase) => ({
      id: phase.id,
      status: phase.status,
      warningCount: phaseWarningCount(phase)
    })),
    status
  };
}

function buildHandoff(manifest, readiness) {
  return {
    implementationRule: readiness.highQualityReady
      ? "Animation implementation may start from the generated contracts; component edits must consume these artifacts."
      : "Do not start component-local animation work. Complete the listed phase contracts first, or use --allow-draft only for an explicitly disclosed rough draft.",
    mustConsumeArtifacts: [
      manifest.files?.productionPipeline,
      manifest.files?.cameraStages,
      manifest.files?.features,
      manifest.files?.unitDensityAudit,
      manifest.files?.movementAudit,
      manifest.files?.unitAssetPackage,
      manifest.files?.terrainUnitRuntime,
      "visual evidence screenshots/metrics under artifacts/ after runtime preview"
    ].filter(Boolean),
    prohibitedShortcuts: [
      "starting from an isolated React component",
      "hand-tuning CSS/skew/pixel maps instead of camera and terrain contracts",
      "using untraceable, toy-like, black-silhouette, photo-card, or same-looking unit markers",
      "using file size as an asset quality proxy",
      "claiming quality from gates without saved visual evidence and manual review"
    ]
  };
}

function buildMarkdown(report) {
  const phaseDetails = report.productionPhases.flatMap((phase) => {
    const warnings = phase.warnings ?? [];
    return [
      `### ${phase.id} ${phase.title ?? ""}`.trim(),
      "",
      `- Status: \`${phase.status}\``,
      `- Technical stages: ${(phase.technicalStages ?? []).map((stage) => `\`${stage}\``).join(", ") || "none"}`,
      "- Enter when:",
      ...phase.enterWhen.map((item) => `  - ${item}`),
      "- Toolchain:",
      ...phase.toolchain.map((item) => `  - ${item}`),
      "- Outputs:",
      ...phase.outputs.map((item) => `  - \`${item}\``),
      "- Exit criteria:",
      ...phase.exitCriteria.map((item) => `  - ${item}`),
      "- Warnings:",
      ...(warnings.length
        ? warnings.map((item) => `  - ${item.severity?.toUpperCase() ?? "INFO"} ${item.code}: ${item.message}`)
        : ["  - None"]),
      "- Next strengthening:",
      ...(phase.nextStrengthening ?? []).map((item) => `  - ${item}`),
      ""
    ];
  });
  const lines = [
    `# Animation First Draft Orchestration: ${report.battle?.title ?? report.battle?.id ?? "unknown"}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Status: \`${report.firstDraft.status}\``,
    `High-quality ready: \`${report.firstDraft.highQualityReady}\``,
    "",
    "## Six Production Phases",
    "",
    "| phase | status | warnings | enter | tools | outputs | exit |",
    "|---|---|---:|---:|---:|---:|---:|",
    ...report.productionPhases.map((phase) =>
      `| ${phase.id} | ${phase.status} | ${phaseWarningCount(phase)} | ${phase.enterWhen.length} | ${phase.toolchain.length} | ${phase.outputs.length} | ${phase.exitCriteria.length} |`
    ),
    "",
    "## Phase Details",
    "",
    ...phaseDetails,
    "",
    "## Next Actions",
    "",
    ...report.nextActions.map((action) => `- ${action}`),
    "",
    "## Implementation Rule",
    "",
    report.implementationHandoff.implementationRule,
    "",
    "## Prohibited Shortcuts",
    "",
    ...report.implementationHandoff.prohibitedShortcuts.map((item) => `- ${item}`),
    "",
    "## Files",
    "",
    ...Object.entries(report.files).map(([key, value]) => `- \`${key}\`: \`${value}\``),
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.spec || !args.out) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }

  const specPath = path.resolve(args.spec);
  const outDir = path.resolve(args.out);
  const pipelineScript = "tools/tactical-terrain-studio/run-terrain-pipeline.mjs";
  const pipelineRun = runNode(pipelineScript, ["--spec", specPath, "--out", outDir]);
  const manifest = readJson(path.join(outDir, "pipeline-manifest.json"));
  const firstDraft = classifyFirstDraft(manifest, args.allowDraft);
  const report = {
    allowDraft: args.allowDraft,
    battle: manifest.battle,
    commands: [pipelineRun, ...(manifest.commands ?? [])],
    files: {
      firstDraftManifest: path.join(outDir, "animation-first-draft-manifest.json"),
      firstDraftReport: path.join(outDir, "animation-first-draft-manifest.md"),
      pipelineManifest: path.join(outDir, "pipeline-manifest.json"),
      pipelineReport: path.join(outDir, "pipeline-manifest.md"),
      ...manifest.files
    },
    firstDraft,
    generatedAt: new Date().toISOString(),
    implementationHandoff: buildHandoff(manifest, firstDraft),
    nextActions: manifest.nextActions ?? [],
    nonBlockingEnhancements: manifest.nonBlockingEnhancements ?? [],
    pipelineStatus: manifest.pipelineStatus,
    productionPhases: manifest.productionPhases ?? [],
    sourceSpec: specPath
  };
  writeJson(path.join(outDir, "animation-first-draft-manifest.json"), report);
  writeText(path.join(outDir, "animation-first-draft-manifest.md"), buildMarkdown(report));
  console.log(JSON.stringify({
    artifactDir: outDir,
    firstDraft: report.firstDraft,
    nextActions: report.nextActions,
    productionPhaseCount: report.productionPhases.length
  }, null, 2));
  if (args.strict && !firstDraft.highQualityReady) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
