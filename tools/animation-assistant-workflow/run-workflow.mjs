#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const phaseLabels = new Map([
  ["01-map-source-data-package", "地图资料层"],
  ["02-terrain-and-historical-basemap-package", "DEM/地形与历史战术底图层"],
  ["03-3d-oblique-camera-envelope", "3D/斜视镜头层"],
  ["04-unit-assets-scale-and-terrain-placement", "作战单位资产、尺度与贴地层"],
  ["05-tactical-movement-preflight", "战术动线预检层"],
  ["06-visual-evidence-and-first-draft-gate", "视觉证据与首版准入层"]
]);

function usage() {
  return [
    "Usage:",
    "  node tools/animation-assistant-workflow/run-workflow.mjs --spec <file> --out <dir>",
    "",
    "Options:",
    "  --spec <file>       Animation production spec JSON.",
    "  --out <dir>         Output artifact directory.",
    "  --visual-evidence <dir-or-metrics.json>",
    "                      Runtime keyframe screenshot/metrics evidence to review after implementation.",
    "  --mode <mode>       Workflow mode: preflight | draft. Default: preflight.",
    "  --strict            Exit non-zero unless the workflow can proceed.",
    "  --help              Show this help."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { mode: "preflight", strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--strict") {
      args.strict = true;
      continue;
    }
    if (arg === "--spec" || arg === "--out" || arg === "--mode" || arg === "--visual-evidence") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      const key = arg === "--visual-evidence" ? "visualEvidence" : arg.slice(2);
      args[key] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!["preflight", "draft"].includes(args.mode)) {
    throw new Error(`Unknown --mode ${args.mode}; expected preflight or draft`);
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

function warningCount(phase) {
  return Object.values(phase.warningSummary ?? {}).reduce((sum, value) => sum + value, 0);
}

function collectNonBlockingEnhancements(firstDraftManifest) {
  const manifestItems = firstDraftManifest.nonBlockingEnhancements ?? [];
  const pipelineLayers = firstDraftManifest.pipeline?.layers ?? firstDraftManifest.productionPipeline?.layers ?? [];
  const terrainPackageItems = firstDraftManifest.terrainPackage?.nonBlockingEnhancements ?? [];
  const layerItems = pipelineLayers.flatMap((layer) =>
    (layer.deferredEnhancements ?? []).map((item) => ({
      item,
      stage: layer.stage
    }))
  );
  const seen = new Set();
  return [...manifestItems, ...layerItems, ...terrainPackageItems].filter((entry) => {
    const key = `${entry.stage}:${entry.item}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function readOptionalJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  return readJson(filePath);
}

function selectCurrentPhase(phases) {
  return phases.find((phase) => phase.status === "blocked") ??
    phases.find((phase) => phase.status === "needs-work-before-high-quality-first-draft") ??
    phases.find((phase) => phase.status === "draftable-with-disclosure") ??
    phases.find((phase) => phase.status !== "ready") ??
    null;
}

function buildVisualReviewWorkItems(runtimeVisualReview) {
  if (!runtimeVisualReview || runtimeVisualReview.status === "runtime-visual-review-ready") {
    return [];
  }
  return (runtimeVisualReview.nextActions ?? []).map((action) => ({
    action,
    phase: "06-visual-evidence-and-first-draft-gate",
    reason: `Runtime visual review is ${runtimeVisualReview.status}; warnings: ${(runtimeVisualReview.warnings ?? []).map((item) => item.code).join(", ") || "none"}.`,
    verifyBy: "Revise the impacted production phase, rerun preview keyframe capture, and pass --visual-evidence back into npm run animation:workflow."
  }));
}

function buildWorkItems(currentPhase, runtimeVisualReview = null) {
  const visualWorkItems = buildVisualReviewWorkItems(runtimeVisualReview);
  if (visualWorkItems.length) {
    return visualWorkItems;
  }
  if (!currentPhase) {
    return [
      {
        action: "enter-animation-implementation-or-visual-review",
        reason: "All production phases are ready.",
        verifyBy: "Run implementation gates and save browser visual evidence under artifacts/."
      }
    ];
  }
  return (currentPhase.nextStrengthening ?? []).map((item) => ({
    action: item,
    phase: currentPhase.id,
    reason: `${currentPhase.id} ${phaseLabels.get(currentPhase.id) ?? ""} is ${currentPhase.status}.`.trim(),
    verifyBy: "Update the source/spec/artifacts for this phase, then rerun npm run animation:workflow."
  }));
}

function buildGuardrails(firstDraft, runtimeVisualReview = null) {
  const base = [
    "Do not start from an isolated animation component.",
    "Do not replace missing phase work with a narrow page-exists smoke test.",
    "Do not embed screenshots in chat; save visual evidence to artifacts/.",
    "Do not treat passing gates as visual quality approval."
  ];
  if (!firstDraft.highQualityReady) {
    base.push("Do not implement or repair the animation shell until the current workflow phase is completed or explicitly accepted as a disclosed rough draft.");
  }
  if (runtimeVisualReview && runtimeVisualReview.status !== "runtime-visual-review-ready") {
    base.push("Runtime visual review has reopened the workflow; fix the impacted production phases before reporting product completion.");
  }
  return base;
}

function buildWorkflowReport({ args, firstDraftManifest, run, runtimeVisualReview, runtimeVisualRun, specPath }) {
  const phases = firstDraftManifest.productionPhases ?? [];
  const currentPhase = selectCurrentPhase(phases);
  const visualReviewNeedsWork = runtimeVisualReview && runtimeVisualReview.status !== "runtime-visual-review-ready";
  const workItems = buildWorkItems(currentPhase, runtimeVisualReview);
  const canProceedToImplementation = firstDraftManifest.firstDraft?.highQualityReady === true && !visualReviewNeedsWork;
  const nonBlockingEnhancements = collectNonBlockingEnhancements(firstDraftManifest);
  return {
    artifactDir: path.resolve(args.out),
    battle: firstDraftManifest.battle,
    canProceedToImplementation,
    currentPhase: currentPhase
      ? {
          id: currentPhase.id,
          label: phaseLabels.get(currentPhase.id) ?? currentPhase.title ?? currentPhase.id,
          status: currentPhase.status,
          technicalStages: currentPhase.technicalStages ?? [],
          warningCount: warningCount(currentPhase)
        }
      : null,
    files: {
      firstDraftManifest: path.join(path.resolve(args.out), "animation-first-draft-manifest.json"),
      firstDraftReport: path.join(path.resolve(args.out), "animation-first-draft-manifest.md"),
      runtimeVisualReview: runtimeVisualReview ? path.join(path.resolve(args.out), "runtime-visual-review.json") : null,
      runtimeVisualReviewReport: runtimeVisualReview ? path.join(path.resolve(args.out), "runtime-visual-review.md") : null,
      workflowGuide: path.join(path.resolve(args.out), "animation-assistant-workflow.md"),
      workflowState: path.join(path.resolve(args.out), "animation-assistant-workflow.json")
    },
    firstDraft: firstDraftManifest.firstDraft,
    generatedAt: new Date().toISOString(),
    guardrails: buildGuardrails(firstDraftManifest.firstDraft ?? {}, runtimeVisualReview),
    mode: args.mode,
    nonBlockingEnhancements,
    phaseSummary: phases.map((phase) => ({
      id: phase.id,
      label: phaseLabels.get(phase.id) ?? phase.title ?? phase.id,
      status: phase.status,
      warningCount: warningCount(phase)
    })),
    runtimeVisualReview: runtimeVisualReview
      ? {
          nextActions: runtimeVisualReview.nextActions ?? [],
          phaseImpacts: runtimeVisualReview.phaseImpacts ?? [],
          status: runtimeVisualReview.status,
          warningCount: runtimeVisualReview.warnings?.length ?? 0,
          warnings: (runtimeVisualReview.warnings ?? []).map((item) => ({
            code: item.code,
            message: item.message,
            phase: item.phase,
            severity: item.severity
          }))
        }
      : null,
    sourceSpec: specPath,
    toolRuns: [run, ...(runtimeVisualRun ? [runtimeVisualRun] : []), ...(firstDraftManifest.commands ?? [])],
    workItems
  };
}

function buildMarkdown(report) {
  const lines = [
    `# Animation Assistant Workflow: ${report.battle?.title ?? report.battle?.id ?? "unknown"}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Mode: \`${report.mode}\``,
    `Can proceed to implementation: \`${report.canProceedToImplementation}\``,
    `First draft status: \`${report.firstDraft?.status ?? "unknown"}\``,
    report.runtimeVisualReview ? `Runtime visual review: \`${report.runtimeVisualReview.status}\`` : "Runtime visual review: `not-provided`",
    "",
    "## Current Phase",
    "",
    report.currentPhase
      ? `- ${report.currentPhase.id} ${report.currentPhase.label}: \`${report.currentPhase.status}\` (${report.currentPhase.warningCount} warnings)`
      : "- All phases ready",
    "",
    "## Work Items",
    "",
    ...report.workItems.flatMap((item, index) => [
      `${index + 1}. ${item.action}`,
      `   - Reason: ${item.reason}`,
      `   - Verify by: ${item.verifyBy}`
    ]),
    "",
    "## Non-Blocking Enhancements",
    "",
    report.nonBlockingEnhancements.length
      ? report.nonBlockingEnhancements.map((entry, index) => `${index + 1}. ${entry.stage}: ${entry.item}`).join("\n")
      : "- None declared",
    "",
    "## Phase Summary",
    "",
    "| phase | label | status | warnings |",
    "|---|---|---|---:|",
    ...report.phaseSummary.map((phase) => `| ${phase.id} | ${phase.label} | ${phase.status} | ${phase.warningCount} |`),
    "",
    "## Runtime Visual Review",
    "",
    report.runtimeVisualReview
      ? [
          `- Status: \`${report.runtimeVisualReview.status}\``,
          `- Warning count: ${report.runtimeVisualReview.warningCount}`,
          `- Phase impacts: ${report.runtimeVisualReview.phaseImpacts.join(", ") || "none"}`,
          ...(report.runtimeVisualReview.warnings.length
            ? report.runtimeVisualReview.warnings.map((item) => `- ${item.severity?.toUpperCase() ?? "WARN"} ${item.code}: ${item.message}`)
            : ["- None"])
        ].join("\n")
      : "- Not provided. After runtime preview, pass `--visual-evidence artifacts/<run>` so visual review can reopen the workflow when needed.",
    "",
    "## Guardrails",
    "",
    ...report.guardrails.map((item) => `- ${item}`),
    "",
    "## Tool Runs",
    "",
    ...report.toolRuns.map((item) => `- \`${item.command}\``),
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
  const firstDraftScript = "tools/tactical-terrain-studio/run-animation-first-draft.mjs";
  const run = runNode(firstDraftScript, ["--spec", specPath, "--out", outDir]);
  let runtimeVisualRun = null;
  let runtimeVisualReview = null;
  if (args.visualEvidence) {
    const visualScript = "tools/tactical-terrain-studio/analyze-runtime-visual-evidence.mjs";
    runtimeVisualRun = runNode(visualScript, ["--spec", specPath, "--evidence", path.resolve(args.visualEvidence), "--out", outDir]);
    runtimeVisualReview = readOptionalJson(path.join(outDir, "runtime-visual-review.json"));
  }
  const firstDraftManifest = readJson(path.join(outDir, "animation-first-draft-manifest.json"));
  const report = buildWorkflowReport({ args, firstDraftManifest, run, runtimeVisualReview, runtimeVisualRun, specPath });
  writeJson(path.join(outDir, "animation-assistant-workflow.json"), report);
  writeText(path.join(outDir, "animation-assistant-workflow.md"), buildMarkdown(report));
  console.log(JSON.stringify({
    artifactDir: outDir,
    canProceedToImplementation: report.canProceedToImplementation,
    currentPhase: report.currentPhase,
    firstDraftStatus: report.firstDraft?.status,
    workItems: report.workItems
  }, null, 2));
  if (args.strict && !report.canProceedToImplementation) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
