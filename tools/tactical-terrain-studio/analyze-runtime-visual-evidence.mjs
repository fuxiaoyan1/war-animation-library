#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/analyze-runtime-visual-evidence.mjs --spec <file> --evidence <dir-or-metrics.json> --out <dir>",
    "",
    "Options:",
    "  --spec <file>             Animation production spec JSON.",
    "  --evidence <path>         Evidence directory containing metrics.dom.json, or the metrics JSON itself.",
    "  --out <dir>               Output artifact directory.",
    "  --strict                  Exit non-zero when runtime visual review finds issues.",
    "  --help                    Show this help."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { strict: false };
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
    if (arg === "--spec" || arg === "--evidence" || arg === "--out") {
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

function resolveMetricsPath(evidencePath) {
  const resolved = path.resolve(evidencePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Visual evidence path does not exist: ${resolved}`);
  }
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    return path.join(resolved, "metrics.dom.json");
  }
  return resolved;
}

function warning(code, message, extra = {}) {
  return {
    code,
    message,
    severity: extra.severity ?? "warn",
    ...extra
  };
}

function numeric(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function frameMarkerLoad(frame, viewportArea) {
  const averageBox = frame.averageUnitBox ?? {};
  return (numeric(frame.totalUnits) * numeric(averageBox.w) * numeric(averageBox.h)) / Math.max(1, viewportArea);
}

function maxBy(rows, selector) {
  return rows.reduce((best, row) => selector(row) > selector(best) ? row : best, rows[0]);
}

function distinct(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildThresholds(spec, references) {
  const configured = spec.visualEvidence?.runtimeReviewThresholds ?? {};
  const minReferenceUnitCount = configured.minReferenceUnitCount ?? 20;
  const referenceCounts = Object.values(references ?? {})
    .map((reference) => numeric(reference.unitCount))
    .filter((value) => value >= minReferenceUnitCount);
  const referenceAverage = referenceCounts.length
    ? referenceCounts.reduce((sum, value) => sum + value, 0) / referenceCounts.length
    : 110;
  return {
    maxAverageUnitShortSidePx: configured.maxAverageUnitShortSidePx ?? 48,
    maxFrameMarkerLoad: configured.maxFrameMarkerLoad ?? 0.36,
    maxPeakUnitsToReferenceRatio: configured.maxPeakUnitsToReferenceRatio ?? 1.65,
    maxResultMarkerLoad: configured.maxResultMarkerLoad ?? 0.32,
    maxResultUnitsToReferenceRatio: configured.maxResultUnitsToReferenceRatio ?? 1.45,
    maxUniformResultRouteCount: configured.maxUniformResultRouteCount ?? 26,
    minRuntimeHrefCoverage: configured.minRuntimeHrefCoverage ?? 1,
    minReferenceUnitCount,
    referenceAverageUnits: Number(referenceAverage.toFixed(1))
  };
}

function summarizeFrame(id, frame, viewportArea) {
  const routeBounds = frame.routeBounds ?? {};
  return {
    averageUnitBox: frame.averageUnitBox ?? null,
    carthageUnits: numeric(frame.carthageUnits),
    hrefCount: distinct(frame.hrefs ?? []).length,
    id,
    imageAssetKinds: distinct(frame.imageAssetKinds ?? []),
    markerLoad: Number(frameMarkerLoad(frame, viewportArea).toFixed(3)),
    mapZoom: numeric(frame.mapZoom),
    romanUnits: numeric(frame.romanUnits),
    routeGroups: Object.entries(routeBounds).map(([routeId, bounds]) => ({
      count: numeric(bounds.count),
      height: Number((numeric(bounds.maxY) - numeric(bounds.minY)).toFixed(1)),
      routeId,
      width: Number((numeric(bounds.maxX) - numeric(bounds.minX)).toFixed(1))
    })),
    totalUnits: numeric(frame.totalUnits),
    unitBoundsFill: frame.unitBoundsFill ?? null
  };
}

function analyzeRuntimeEvidence({ metrics, metricsPath, spec }) {
  const battleId = spec.battle?.id ?? "unknown";
  const battleMetrics = metrics[battleId];
  const warnings = [];
  if (!battleMetrics || typeof battleMetrics !== "object") {
    return {
      battle: spec.battle,
      evidence: { metricsPath },
      generatedAt: new Date().toISOString(),
      nextActions: ["capture-runtime-visual-evidence-and-rerun-workflow"],
      phaseImpacts: ["06-visual-evidence-and-first-draft-gate"],
      status: "blocked-runtime-visual-review",
      warnings: [
        warning("RUNTIME_METRICS_MISSING", `metrics.dom.json does not contain a top-level ${battleId} metrics object.`, {
          severity: "error"
        })
      ]
    };
  }

  const referenceStage = Object.values(metrics.references ?? {})[0]?.mapStage ?? {};
  const viewportArea = numeric(referenceStage.w, 1412) * numeric(referenceStage.h, 796);
  const thresholds = buildThresholds(spec, metrics.references ?? {});
  const frames = Object.entries(battleMetrics).map(([id, frame]) => summarizeFrame(id, frame, viewportArea));
  const peakFrame = maxBy(frames, (frame) => frame.totalUnits) ?? null;
  const peakLoadFrame = maxBy(frames, (frame) => frame.markerLoad) ?? null;
  const resultFrame = frames.find((frame) => frame.id.includes("result")) ?? frames.at(-1) ?? null;

  if (peakFrame && peakFrame.totalUnits > thresholds.referenceAverageUnits * thresholds.maxPeakUnitsToReferenceRatio) {
    warnings.push(warning(
      "RUNTIME_UNIT_COUNT_EXCEEDS_REFERENCE_ENVELOPE",
      `${peakFrame.id} renders ${peakFrame.totalUnits} units, ${Number((peakFrame.totalUnits / thresholds.referenceAverageUnits).toFixed(2))}x the Gaixia/Nianzhuang reference average; this often reads as fog or parade mass.`,
      {
        phase: "04-unit-assets-scale-and-terrain-placement",
        frameId: peakFrame.id,
        value: {
          referenceAverageUnits: thresholds.referenceAverageUnits,
          totalUnits: peakFrame.totalUnits
        }
      }
    ));
  }

  if (peakLoadFrame && peakLoadFrame.markerLoad > thresholds.maxFrameMarkerLoad) {
    warnings.push(warning(
      "RUNTIME_MARKER_PIXEL_LOAD_HIGH",
      `${peakLoadFrame.id} marker pixel load is ${peakLoadFrame.markerLoad}; reduce visible sprites, use LOD, enlarge the battle envelope, or stagger units before product review.`,
      {
        phase: "04-unit-assets-scale-and-terrain-placement",
        frameId: peakLoadFrame.id,
        value: {
          markerLoad: peakLoadFrame.markerLoad,
          maxMarkerLoad: thresholds.maxFrameMarkerLoad
        }
      }
    ));
  }

  if (resultFrame && resultFrame.markerLoad > thresholds.maxResultMarkerLoad) {
    warnings.push(warning(
      "RUNTIME_RESULT_FRAME_TOO_DENSE",
      `${resultFrame.id} still has marker load ${resultFrame.markerLoad}; the final battlefield should retain the winner without collapsing into a dense staged crowd.`,
      {
        phase: "05-tactical-movement-preflight",
        frameId: resultFrame.id,
        value: {
          carthageUnits: resultFrame.carthageUnits,
          markerLoad: resultFrame.markerLoad,
          romanUnits: resultFrame.romanUnits,
          totalUnits: resultFrame.totalUnits
        }
      }
    ));
  }

  if (resultFrame && resultFrame.totalUnits > thresholds.referenceAverageUnits * thresholds.maxResultUnitsToReferenceRatio) {
    warnings.push(warning(
      "RUNTIME_RESULT_UNIT_COUNT_HIGH",
      `${resultFrame.id} renders ${resultFrame.totalUnits} units in the result frame; preserve victor presence, but convert the ending to irregular retained formations, broken remnants, and controlled LOD.`,
      {
        phase: "05-tactical-movement-preflight",
        frameId: resultFrame.id,
        value: {
          referenceAverageUnits: thresholds.referenceAverageUnits,
          totalUnits: resultFrame.totalUnits
        }
      }
    ));
  }

  const oversizedFrames = frames.filter((frame) => {
    const box = frame.averageUnitBox ?? {};
    return Math.min(numeric(box.w), numeric(box.h)) > thresholds.maxAverageUnitShortSidePx;
  });
  if (oversizedFrames.length) {
    warnings.push(warning(
      "RUNTIME_AVERAGE_UNIT_BOX_TOO_LARGE",
      `${oversizedFrames.length} keyframes have average unit boxes above ${thresholds.maxAverageUnitShortSidePx}px on the short side; scale/LOD must be solved with map envelope, not only local CSS.`,
      {
        phase: "04-unit-assets-scale-and-terrain-placement",
        value: oversizedFrames.map((frame) => ({
          averageUnitBox: frame.averageUnitBox,
          frameId: frame.id
        }))
      }
    ));
  }

  const allKinds = distinct(frames.flatMap((frame) => frame.imageAssetKinds ?? []));
  const allHrefs = distinct(Object.values(battleMetrics).flatMap((frame) => frame.hrefs ?? []));
  const commandKinds = allKinds.filter((kind) => kind.includes("command"));
  const commandHrefs = allHrefs.filter((href) => href.includes("command"));
  if (commandKinds.length && commandHrefs.length < commandKinds.length) {
    warnings.push(warning(
      "RUNTIME_COMMAND_ASSET_REUSED",
      `Command unit kinds are present (${commandKinds.join(", ")}) but only ${commandHrefs.length} command-specific runtime href(s) were rendered; commanders must use source-backed command assets, not reused infantry sprites.`,
      {
        phase: "04-unit-assets-scale-and-terrain-placement",
        value: {
          commandHrefs,
          commandKinds
        }
      }
    ));
  }
  if (allHrefs.length < allKinds.length * thresholds.minRuntimeHrefCoverage) {
    warnings.push(warning(
      "RUNTIME_ASSET_KIND_HREF_COVERAGE_LOW",
      `Runtime exposes ${allKinds.length} asset kinds but only ${allHrefs.length} distinct hrefs; this hides asset reuse and weakens visual faction/type distinction.`,
      {
        phase: "04-unit-assets-scale-and-terrain-placement",
        value: {
          hrefs: allHrefs,
          imageAssetKinds: allKinds
        }
      }
    ));
  }

  if (resultFrame) {
    const uniformWinnerGroups = resultFrame.routeGroups.filter((group) => group.count >= thresholds.maxUniformResultRouteCount);
    if (uniformWinnerGroups.length >= 2 && resultFrame.markerLoad > thresholds.maxResultMarkerLoad * 0.8) {
      warnings.push(warning(
        "RUNTIME_RESULT_PARADE_GROUPS",
        `${resultFrame.id} retains multiple large route groups (${uniformWinnerGroups.map((group) => `${group.routeId}:${group.count}`).join(", ")}); final state needs irregular battlefield aftermath, not intact route ranks.`,
        {
          phase: "05-tactical-movement-preflight",
          frameId: resultFrame.id,
          value: uniformWinnerGroups
        }
      ));
    }
  }

  const phaseImpacts = distinct(warnings.map((item) => item.phase ?? "06-visual-evidence-and-first-draft-gate"));
  if (warnings.length) {
    phaseImpacts.push("06-visual-evidence-and-first-draft-gate");
  }
  const nextActions = [];
  if (phaseImpacts.includes("04-unit-assets-scale-and-terrain-placement")) {
    nextActions.push("revise-runtime-unit-density-lod-and-command-assets-from-visual-evidence");
  }
  if (phaseImpacts.includes("05-tactical-movement-preflight")) {
    nextActions.push("revise-result-compression-and-aftermath-movement-from-visual-evidence");
  }
  if (warnings.length) {
    nextActions.push("rerun-runtime-preview-capture-keyframes-and-feed-metrics-back-into-workflow");
  }
  return {
    battle: spec.battle,
    evidence: {
      metricsPath,
      referenceAnimations: metrics.references ?? {},
      viewportArea
    },
    frames,
    generatedAt: new Date().toISOString(),
    nextActions,
    phaseImpacts,
    status: warnings.length ? "needs-work-after-runtime-visual-review" : "runtime-visual-review-ready",
    thresholds,
    warnings
  };
}

function buildMarkdown(report) {
  const lines = [
    `# Runtime Visual Evidence Review: ${report.battle?.title ?? report.battle?.id ?? "unknown"}`,
    "",
    `Generated: ${report.generatedAt}`,
    `Status: \`${report.status}\``,
    `Metrics: \`${report.evidence.metricsPath}\``,
    "",
    "## Findings",
    "",
    report.warnings.length
      ? report.warnings.map((item) => `- ${item.severity.toUpperCase()} ${item.code}: ${item.message}`).join("\n")
      : "- None",
    "",
    "## Phase Impacts",
    "",
    report.phaseImpacts.length ? report.phaseImpacts.map((item) => `- ${item}`).join("\n") : "- None",
    "",
    "## Next Actions",
    "",
    report.nextActions.length ? report.nextActions.map((item) => `- ${item}`).join("\n") : "- None",
    "",
    "## Frame Summary",
    "",
    "| frame | units | roman | carthage | marker load | zoom | hrefs |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...(report.frames ?? []).map((frame) =>
      `| ${frame.id} | ${frame.totalUnits} | ${frame.romanUnits} | ${frame.carthageUnits} | ${frame.markerLoad} | ${frame.mapZoom} | ${frame.hrefCount} |`
    ),
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
  if (!args.spec || !args.evidence || !args.out) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }
  const specPath = path.resolve(args.spec);
  const metricsPath = resolveMetricsPath(args.evidence);
  if (!fs.existsSync(metricsPath)) {
    throw new Error(`Runtime visual metrics file not found: ${metricsPath}`);
  }
  const spec = readJson(specPath);
  const metrics = readJson(metricsPath);
  const report = analyzeRuntimeEvidence({ metrics, metricsPath, spec });
  const outDir = path.resolve(args.out);
  writeJson(path.join(outDir, "runtime-visual-review.json"), report);
  writeText(path.join(outDir, "runtime-visual-review.md"), buildMarkdown(report));
  console.log(JSON.stringify({
    artifactDir: outDir,
    nextActions: report.nextActions,
    status: report.status,
    warnings: report.warnings.length
  }, null, 2));
  if (args.strict && report.warnings.length) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
