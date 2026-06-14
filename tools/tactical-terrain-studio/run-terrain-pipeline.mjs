#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/run-terrain-pipeline.mjs --spec <file> --out <dir>",
    "",
    "Options:",
    "  --spec <file>       Tactical terrain spec JSON.",
    "  --out <dir>         Output artifact directory.",
    "  --strict            Exit non-zero on blocking errors or review warnings.",
    "  --help              Show this help."
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

function runPython(script, args) {
  const result = spawnSync("python3", [script, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error([
      `Command failed: python3 ${script} ${args.join(" ")}`,
      result.stdout.trim(),
      result.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
  return {
    command: `python3 ${script} ${args.join(" ")}`,
    stdout: result.stdout.trim()
  };
}

function warningsBySeverity(warnings) {
  return warnings.reduce((groups, warning) => {
    const severity = warning.severity ?? "info";
    groups[severity] = (groups[severity] ?? 0) + 1;
    return groups;
  }, {});
}

function warningsByLayer(pipeline) {
  return (pipeline.layers ?? []).map((layer) => ({
    stage: layer.stage,
    warnings: (layer.warnings ?? []).map((warning) => ({
      code: warning.code,
      message: warning.message,
      severity: warning.severity ?? "info"
    }))
  }));
}

function stageWarnings(pipeline, stages, extraWarnings = []) {
  const stageSet = new Set(stages);
  const layerWarnings = (pipeline.layers ?? [])
    .filter((layer) => stageSet.has(layer.stage))
    .flatMap((layer) => (layer.warnings ?? []).map((warning) => ({ ...warning, stage: layer.stage })));
  return [...layerWarnings, ...extraWarnings];
}

function phaseStatus(warnings, readinessStatuses = []) {
  if (warnings.some((warning) => warning.severity === "error")) {
    return "blocked";
  }
  if (
    warnings.some((warning) => warning.severity === "warn") ||
    readinessStatuses.some((status) => status && status.includes("not-ready"))
  ) {
    return "needs-work-before-high-quality-first-draft";
  }
  if (warnings.length || readinessStatuses.some((status) => status && status.includes("disclosure"))) {
    return "draftable-with-disclosure";
  }
  return "ready";
}

function nextStrengtheningForPhase(phaseId, warnings) {
  const codes = new Set((warnings ?? []).map((warning) => warning.code));
  const steps = [];
  if (phaseId === "01-map-source-data-package") {
    if (codes.has("SOURCE_REFERENCES_MISSING")) {
      steps.push("add source references and confidence notes before using the map as a production base");
    }
    if (codes.has("CONTROL_POINTS_MISSING")) {
      steps.push("add modern control points for georeferencing and repeatable map alignment");
    }
    if (codes.has("HISTORICAL_MAP_REFS_MISSING")) {
      steps.push("add historical map/reference-map inputs and uncertainty notes");
    }
    if ([...codes].some((code) => code === "REQUIRED_FEATURE_KIND_MISSING")) {
      steps.push("complete required feature inventory such as roads, settlements, high ground, camps, and battlefield boundary");
    }
  }
  if (phaseId === "02-terrain-and-historical-basemap-package") {
    if (codes.has("TERRAIN_DERIVATIVE_MISSING")) {
      steps.push("produce or register DEM derivatives: hillshade, slope, contours, river valley, high ground, corridors, obstacle zones");
    }
    if (codes.has("TACTICAL_BASEMAP_LAYER_MISSING")) {
      steps.push("produce project-style historical tactical basemap layers instead of component-local terrain drawing");
    }
  }
  if (phaseId === "03-3d-oblique-camera-envelope") {
    if (codes.has("CAMERA_STAGE_UNDERCONSTRAINED")) {
      steps.push("add tactical geometry to underconstrained camera stages");
    }
    if (codes.has("CAMERA_PITCH_TOO_STEEP")) {
      steps.push("revise pitch/bearing/zoom to keep terrain and units readable");
    }
  }
  if (phaseId === "04-unit-assets-scale-and-terrain-placement") {
    if (codes.has("UNIT_LOD_REQUIRED") || codes.has("UNIT_OVERPACKED") || codes.has("STAGE_MARKER_PIXEL_LOAD_HIGH")) {
      steps.push("revise representative unit count, marker size, map envelope, or LOD before animation implementation");
    }
    if (
      codes.has("UNIT_ASSET_PACKAGE_MISSING") ||
      codes.has("UNIT_SET_ASSET_MAPPING_MISSING") ||
      codes.has("UNIT_SET_ASSET_UNDECLARED") ||
      codes.has("ASSET_VISUAL_GATES_FAILED") ||
      codes.has("ASSET_RUNTIME_FILE_MISSING")
    ) {
      steps.push("complete source-backed unit asset package and rerun contact-sheet/alpha/readability audit");
    }
    if (codes.has("UNIT_CONTRACT_UNREADABLE") || codes.has("TERRAIN_UNIT_MIN_VISIBLE_TOO_SMALL")) {
      steps.push("revise terrain-height unit runtime marker visibility and LOD modes");
    }
  }
  if (phaseId === "05-tactical-movement-preflight") {
    if (codes.has("CONTACT_GAP_TOO_WIDE")) {
      steps.push("revise unit routes and contact points so effects occur at actual contact distance");
    }
    if (codes.has("ENCIRCLEMENT_GAP")) {
      steps.push("revise encirclement geometry and unit distribution so the pocket closes credibly");
    }
    if (codes.has("ROUTE_HANDOFF_GAP")) {
      steps.push("add route preludes or adjust endpoints so route handoffs preserve continuity");
    }
    if (codes.has("ROUTE_CROSSES_AVOID_FEATURE")) {
      steps.push("move routes around blocked terrain or document an allowed crossing");
    }
  }
  if (phaseId === "06-visual-evidence-and-first-draft-gate") {
    steps.push("after runtime preview exists, save keyframe screenshots/metrics to artifacts and compare manually with reference animations");
  }
  if (!steps.length) {
    steps.push("keep current contract, then strengthen this phase when upstream/downstream evidence exposes a real gap");
  }
  return [...new Set(steps)];
}

function buildProductionPhases({ outDir, pipeline, unitAssetPackage, unitRuntime }) {
  const unitAssetWarnings = unitAssetPackage.warnings ?? [];
  const unitRuntimeWarnings = unitRuntime.warnings ?? [];
  const files = {
    cameraStages: path.join(outDir, "camera-stages.json"),
    features: path.join(outDir, "features.geojson"),
    maplibreContract: path.join(outDir, "maplibre-contract.json"),
    movementAudit: path.join(outDir, "movement-audit.json"),
    productionPipeline: path.join(outDir, "production-pipeline.json"),
    report: path.join(outDir, "report.md"),
    terrainPackage: path.join(outDir, "terrain-package.json"),
    unitAssetPackage: path.join(outDir, "unit-asset-package/unit-asset-package.json"),
    unitAssetReport: path.join(outDir, "unit-asset-package/unit-asset-package.md"),
    unitAssetContactSheet: path.join(outDir, "unit-asset-package/contact-sheet.png"),
    unitRuntime: path.join(outDir, "terrain-unit-layer/terrain-unit-runtime.json"),
    unitRuntimeReport: path.join(outDir, "terrain-unit-layer/terrain-unit-runtime.md"),
    unitDensityAudit: path.join(outDir, "unit-density-audit.json")
  };
  const phases = [
    {
      id: "01-map-source-data-package",
      title: "地图资料层",
      enterWhen: [
        "battle scope, period, source brief, and battlefield bounds are known",
        "operator is still allowed to revise the battle map and uncertainty notes before implementation"
      ],
      toolchain: [
        "source documents under docs/sources/",
        "tools/tactical-terrain-studio/specs/*.json",
        "tactical-terrain-studio.mjs source-map-data-package audit"
      ],
      technicalStages: ["source-map-data-package"],
      outputs: [files.productionPipeline, files.features, files.report],
      exitCriteria: [
        "source references, modern control points, historical map references, and required feature kinds are declared or explicitly disclosed",
        "no component-local map drawing starts before this package exists"
      ],
      warnings: stageWarnings(pipeline, ["source-map-data-package"])
    },
    {
      id: "02-terrain-and-historical-basemap-package",
      title: "DEM/地形与历史战术底图层",
      enterWhen: [
        "map source package has a bounded battlefield and feature inventory",
        "terrain quality level is chosen for the animation scale"
      ],
      toolchain: [
        "QGIS/GDAL/OpenTopography/Copernicus/SRTM when source terrain is required",
        "generate-web3d-prototype-tiles.py or external tile tooling for local terrain caches",
        "tactical-terrain-studio.mjs DEM and historical basemap audits"
      ],
      technicalStages: ["dem-terrain-layer", "historical-tactical-basemap-layer"],
      outputs: [files.terrainPackage, files.maplibreContract, files.features],
      exitCriteria: [
        "DEM/tile cache and required derivatives are declared or intentionally waived for weak-terrain campaign scale",
        "visible basemap is project-style historical tactical map, not modern imagery or hand-drawn component wallpaper"
      ],
      warnings: stageWarnings(pipeline, ["dem-terrain-layer", "historical-tactical-basemap-layer"])
    },
    {
      id: "03-3d-oblique-camera-envelope",
      title: "3D/斜视镜头层",
      enterWhen: [
        "battlefield features, formations, routes, and stage focus points exist",
        "camera must serve tactical interpretation rather than page decoration"
      ],
      toolchain: [
        "tactical-terrain-studio.mjs camera-stage solver",
        "MapLibre pitch/bearing/zoom contract",
        "Three.js/Babylon/Cesium or game-engine camera evaluation when required"
      ],
      technicalStages: ["3d-oblique-camera-layer"],
      outputs: [files.cameraStages, files.maplibreContract],
      exitCriteria: [
        "each stage has a geometry-derived center, zoom, pitch, bearing, and battlefield envelope",
        "approved oblique viewpoint is represented as data rather than CSS skew or component-local transform"
      ],
      warnings: stageWarnings(pipeline, ["3d-oblique-camera-layer"])
    },
    {
      id: "04-unit-assets-scale-and-terrain-placement",
      title: "作战单位资产、尺度与贴地层",
      enterWhen: [
        "unit types, factions, representative counts, footprints, and visual target are known",
        "era-specific source-backed unit assets or candidate-generation tools are available"
      ],
      toolchain: [
        "unit-asset-package.py source/runtime/candidate/contact-sheet audit",
        "battle-specific generators such as London air ComfyUI/segmentation tools when applicable",
        "tactical-terrain-studio.mjs unit-scale solver",
        "terrain-unit-layer.mjs terrain-height tactical unit runtime"
      ],
      technicalStages: ["unit-scale-solver-layer", "unit-asset-production-layer", "terrain-height-tactical-unit-layer"],
      outputs: [
        files.unitDensityAudit,
        files.unitAssetPackage,
        files.unitAssetReport,
        files.unitAssetContactSheet,
        files.unitRuntime,
        files.unitRuntimeReport
      ],
      exitCriteria: [
        "unitSets map to runtime assets, assets have traceable sources/candidates, and runtime markers pass alpha/readability checks",
        "camera density, LOD, marker size, heading mode, and terrain-height placement are declared before animation implementation"
      ],
      warnings: stageWarnings(
        pipeline,
        ["unit-scale-solver-layer", "unit-asset-production-layer", "terrain-height-tactical-unit-layer"],
        [...unitAssetWarnings, ...unitRuntimeWarnings]
      ),
      readinessStatuses: [unitAssetPackage.readiness?.status]
    },
    {
      id: "05-tactical-movement-preflight",
      title: "战术动线预检层",
      enterWhen: [
        "map envelope, obstacles, unit scale, formations, contacts, and route handoffs are declared",
        "formation battles have run the five-pass movement design loop before component rendering"
      ],
      toolchain: [
        "tactical-terrain-studio.mjs movement-audit",
        "formation collision/contact review",
        "future pathfinding/crowd-pressure tools for game-engine production"
      ],
      technicalStages: ["tactical-movement-preflight-layer"],
      outputs: [files.movementAudit, files.productionPipeline],
      exitCriteria: [
        "routes do not teleport, cross forbidden features without allowance, or fire effects away from contact",
        "encirclements close within declared gap limits and result-state winner/remnant presence is checked"
      ],
      warnings: stageWarnings(pipeline, ["tactical-movement-preflight-layer"])
    },
    {
      id: "06-visual-evidence-and-first-draft-gate",
      title: "视觉证据与首版准入层",
      enterWhen: [
        "previous production phases have artifacts and no unresolved blocker",
        "the animation shell or prototype is ready for browser/runtime review"
      ],
      toolchain: [
        "visual-evidence-layer keyframe plan",
        "Playwright browser screenshots and metrics saved under artifacts/",
        "mature series gates from AGENTS.md after implementation"
      ],
      technicalStages: ["visual-evidence-layer"],
      outputs: [files.productionPipeline, path.join(outDir, "pipeline-manifest.json"), path.join(outDir, "pipeline-manifest.md")],
      exitCriteria: [
        "keyframe screenshots and metrics are saved to artifacts only",
        "manual visual inspection confirms the first draft reaches the reference animation floor before reporting completion"
      ],
      warnings: stageWarnings(pipeline, ["visual-evidence-layer"])
    }
  ];
  return phases.map((phase) => {
    const warnings = phase.warnings ?? [];
    return {
      ...phase,
      nextStrengthening: nextStrengtheningForPhase(phase.id, warnings),
      status: phaseStatus(warnings, phase.readinessStatuses ?? []),
      warningSummary: warningsBySeverity(warnings)
    };
  });
}

function nextActionsFor(pipeline, unitRuntime, unitAssetPackage = null) {
  const actions = [];
  const warnings = pipeline.warnings ?? [];
  const assetWarnings = unitAssetPackage?.warnings ?? pipeline.unitAssetPackage?.warnings ?? [];
  const codes = new Set(warnings.map((warning) => warning.code));
  const assetCodes = new Set(assetWarnings.map((warning) => warning.code));
  if (codes.has("SOURCE_REFERENCES_MISSING") || codes.has("CONTROL_POINTS_MISSING") || codes.has("HISTORICAL_MAP_REFS_MISSING")) {
    actions.push("complete-source-map-data-package");
  }
  if ([...codes].some((code) => code === "TERRAIN_DERIVATIVE_MISSING" || code === "DEM_TILE_TEMPLATE_MISSING")) {
    actions.push("produce-or-register-dem-derivative-package");
  }
  if ([...codes].some((code) => code === "TACTICAL_BASEMAP_LAYER_MISSING")) {
    actions.push("produce-historical-tactical-basemap-layers");
  }
  if ([...codes].some((code) => code === "UNIT_OVERPACKED" || code === "STAGE_MARKER_PIXEL_LOAD_HIGH" || code === "UNIT_LOD_REQUIRED")) {
    actions.push("revise-unit-density-or-lod-before-animation");
  }
  if ([...codes].some((code) => code === "CONTACT_GAP_TOO_WIDE" || code === "ENCIRCLEMENT_GAP" || code === "ROUTE_HANDOFF_GAP")) {
    actions.push("revise-tactical-movement-before-animation");
  }
  if ((unitRuntime.warnings ?? []).length) {
    actions.push("revise-terrain-height-unit-runtime");
  }
  if (
    assetCodes.has("UNIT_ASSET_PACKAGE_MISSING") ||
    assetCodes.has("UNIT_SET_ASSET_MAPPING_MISSING") ||
    assetCodes.has("UNIT_SET_ASSET_UNDECLARED") ||
    assetCodes.has("ASSET_SOURCE_MISSING") ||
    assetCodes.has("ASSET_SOURCE_FILE_MISSING") ||
    assetCodes.has("ASSET_RUNTIME_FILE_MISSING") ||
    assetCodes.has("ASSET_VISUAL_GATES_FAILED")
  ) {
    actions.push("complete-unit-asset-production-package-before-animation");
  }
  actions.push("capture-keyframe-visual-evidence-after-runtime-preview");
  return [...new Set(actions)];
}

function classifyReadiness(manifestInput) {
  const { pipeline, unitAssetPackage, unitRuntime } = manifestInput;
  const warnings = pipeline.warnings ?? [];
  const unitWarnings = unitRuntime.warnings ?? [];
  const assetWarnings = unitAssetPackage?.warnings ?? [];
  const blocking = warnings.filter((warning) => warning.severity === "error");
  const reviewWarnings = warnings.filter((warning) => warning.severity === "warn");
  const infoGaps = warnings.filter((warning) => !warning.severity || warning.severity === "info");
  const codes = new Set(warnings.map((warning) => warning.code));
  const assetCodes = new Set(assetWarnings.map((warning) => warning.code));
  const blockers = [];
  const qualityRisks = [];
  const missingPreparations = [];

  if (blocking.length) {
    blockers.push("blocking-errors-present");
  }
  if (codes.has("SOURCE_REFERENCES_MISSING") || codes.has("CONTROL_POINTS_MISSING") || codes.has("HISTORICAL_MAP_REFS_MISSING")) {
    missingPreparations.push("map-source-traceability");
  }
  if ([...codes].some((code) => code === "TERRAIN_DERIVATIVE_MISSING" || code === "DEM_TILE_TEMPLATE_MISSING")) {
    missingPreparations.push("dem-and-terrain-derivatives");
  }
  if ([...codes].some((code) => code === "TACTICAL_BASEMAP_LAYER_MISSING")) {
    missingPreparations.push("historical-tactical-basemap-layers");
  }
  if ([...codes].some((code) => code === "CONTACT_GAP_TOO_WIDE" || code === "ENCIRCLEMENT_GAP" || code === "ROUTE_HANDOFF_GAP")) {
    qualityRisks.push("movement-logic-will-lower-first-draft-quality");
  }
  if ([...codes].some((code) => code === "UNIT_OVERPACKED" || code === "STAGE_MARKER_PIXEL_LOAD_HIGH" || code === "UNIT_LOD_REQUIRED")) {
    qualityRisks.push("unit-density-or-lod-will-lower-first-draft-quality");
  }
  if (unitWarnings.length) {
    qualityRisks.push("terrain-height-unit-runtime-has-warnings");
  }
  if (assetCodes.has("UNIT_ASSET_PACKAGE_MISSING") || assetCodes.has("UNIT_SET_ASSET_MAPPING_MISSING") || assetCodes.has("UNIT_SET_ASSET_UNDECLARED")) {
    missingPreparations.push("unit-asset-production-contract");
  }
  if (
    assetCodes.has("ASSET_SOURCE_MISSING") ||
    assetCodes.has("ASSET_SOURCE_FILE_MISSING") ||
    assetCodes.has("ASSET_RUNTIME_FILE_MISSING") ||
    assetCodes.has("ASSET_IMAGE_READ_FAILED")
  ) {
    missingPreparations.push("source-backed-runtime-unit-assets");
  }
  if (assetCodes.has("ASSET_VISUAL_GATES_FAILED")) {
    qualityRisks.push("unit-assets-will-lower-first-draft-quality");
  }
  if (unitAssetPackage?.readiness?.status === "candidate-review-required") {
    missingPreparations.push("unit-asset-candidate-review-and-apply");
  }

  let status = "ready-for-high-quality-first-draft";
  if (blockers.length) {
    status = "blocked-before-first-draft";
  } else if (qualityRisks.length) {
    status = "not-ready-for-high-quality-first-draft";
  } else if (missingPreparations.length) {
    status = "research-prep-incomplete-but-draftable-with-disclosure";
  }

  return {
    blockers,
    infoGapCount: infoGaps.length,
    missingPreparations,
    qualityRisks,
    reviewWarningCount: reviewWarnings.length,
    status,
    unitAssetWarningCount: assetWarnings.length,
    unitWarningCount: unitWarnings.length
  };
}

function buildManifestV2({ assetRun, outDir, pipeline, specPath, studioRun, unitAssetPackage, unitRun, unitRuntime }) {
  const warningCounts = warningsBySeverity(pipeline.warnings ?? []);
  const unitWarningCounts = warningsBySeverity(unitRuntime.warnings ?? []);
  const assetWarningCounts = warningsBySeverity(unitAssetPackage.warnings ?? []);
  const blockingErrors = (pipeline.warnings ?? []).filter((warning) => warning.severity === "error");
  const reviewWarnings = (pipeline.warnings ?? []).filter((warning) => warning.severity === "warn");
  const infoGaps = (pipeline.warnings ?? []).filter((warning) => !warning.severity || warning.severity === "info");
  pipeline.unitAssetPackage = unitAssetPackage;
  const manifestSeed = { pipeline, unitAssetPackage, unitRuntime };
  const firstDraftReadiness = classifyReadiness(manifestSeed);
  const productionPhases = buildProductionPhases({ outDir, pipeline, unitAssetPackage, unitRuntime });
  const nonBlockingEnhancements = (pipeline.layers ?? []).flatMap((layer) =>
    (layer.deferredEnhancements ?? []).map((item) => ({
      item,
      stage: layer.stage
    }))
  );
  return {
    artifactDir: outDir,
    battle: pipeline.battle,
    commands: [studioRun, unitRun, assetRun],
    files: {
      cameraStages: path.join(outDir, "camera-stages.json"),
      features: path.join(outDir, "features.geojson"),
      maplibreContract: path.join(outDir, "maplibre-contract.json"),
      movementAudit: path.join(outDir, "movement-audit.json"),
      productionPipeline: path.join(outDir, "production-pipeline.json"),
      report: path.join(outDir, "report.md"),
      terrainPackage: path.join(outDir, "terrain-package.json"),
      unitAssetPackage: path.join(outDir, "unit-asset-package/unit-asset-package.json"),
      unitAssetPackageReport: path.join(outDir, "unit-asset-package/unit-asset-package.md"),
      terrainUnitRuntime: path.join(outDir, "terrain-unit-layer/terrain-unit-runtime.json"),
      terrainUnitRuntimeReport: path.join(outDir, "terrain-unit-layer/terrain-unit-runtime.md"),
      unitDensityAudit: path.join(outDir, "unit-density-audit.json")
    },
    generatedAt: new Date().toISOString(),
    firstDraftReadiness,
    nextActions: nextActionsFor(pipeline, unitRuntime, unitAssetPackage),
    nonBlockingEnhancements,
    pipelineStatus: pipeline.status,
    productionPhases,
    sourceSpec: specPath,
    stageOrder: pipeline.stageOrder,
    unitAssetPackage: {
      assets: unitAssetPackage.assets?.length ?? 0,
      readiness: unitAssetPackage.readiness,
      warningCounts: assetWarningCounts,
      warnings: unitAssetPackage.warnings ?? []
    },
    unitRuntime: {
      stages: unitRuntime.runtimeStages?.length ?? 0,
      warningCounts: unitWarningCounts,
      warnings: unitRuntime.warnings ?? []
    },
    warningSummary: {
      blockingErrorCount: blockingErrors.length,
      infoGapCount: infoGaps.length,
      reviewWarningCount: reviewWarnings.length,
      severityCounts: warningCounts,
      total: (pipeline.warnings ?? []).length
    },
    warningsByLayer: warningsByLayer(pipeline)
  };
}

function buildMarkdown(manifest) {
  const lines = [
    `# Terrain Production Pipeline Manifest: ${manifest.battle?.title ?? manifest.battle?.id ?? "unknown"}`,
    "",
    `Generated: ${manifest.generatedAt}`,
    `Spec: \`${manifest.sourceSpec}\``,
    `Status: \`${manifest.pipelineStatus}\``,
    `First draft readiness: \`${manifest.firstDraftReadiness.status}\``,
    "",
    "## First Draft Readiness",
    "",
    `- Status: \`${manifest.firstDraftReadiness.status}\``,
    `- Blockers: ${manifest.firstDraftReadiness.blockers.length ? manifest.firstDraftReadiness.blockers.join(", ") : "none"}`,
    `- Quality risks: ${manifest.firstDraftReadiness.qualityRisks.length ? manifest.firstDraftReadiness.qualityRisks.join(", ") : "none"}`,
    `- Missing preparations: ${manifest.firstDraftReadiness.missingPreparations.length ? manifest.firstDraftReadiness.missingPreparations.join(", ") : "none"}`,
    "",
    "## Warning Summary",
    "",
    `- Blocking errors: ${manifest.warningSummary.blockingErrorCount}`,
    `- Review warnings: ${manifest.warningSummary.reviewWarningCount}`,
    `- Info gaps: ${manifest.warningSummary.infoGapCount}`,
    `- Unit asset warnings: ${Object.values(manifest.unitAssetPackage.warningCounts).reduce((sum, value) => sum + value, 0)}`,
    `- Unit runtime warnings: ${Object.values(manifest.unitRuntime.warningCounts).reduce((sum, value) => sum + value, 0)}`,
    "",
    "## Unit Asset Package",
    "",
    `- Status: \`${manifest.unitAssetPackage.readiness?.status ?? "unknown"}\``,
    `- Assets: ${manifest.unitAssetPackage.assets}`,
    `- Missing runtime assets: ${(manifest.unitAssetPackage.readiness?.missingRuntimeAssetIds ?? []).join(", ") || "none"}`,
    `- Failed visual assets: ${(manifest.unitAssetPackage.readiness?.failedVisualAssetIds ?? []).join(", ") || "none"}`,
    "",
    "## Six Production Phases",
    "",
    "| phase | status | tools | outputs | warnings |",
    "|---|---|---|---|---:|",
    ...manifest.productionPhases.map((phase) => {
      const warningCount = Object.values(phase.warningSummary).reduce((sum, value) => sum + value, 0);
      return `| ${phase.id} | ${phase.status} | ${phase.toolchain.length} | ${phase.outputs.length} | ${warningCount} |`;
    }),
    "",
    "## Stage Order",
    "",
    ...manifest.stageOrder.map((stage, index) => `${index + 1}. \`${stage}\``),
    "",
    "## Next Actions",
    "",
    ...manifest.nextActions.map((action) => `- ${action}`),
    "",
    "## Files",
    "",
    ...Object.entries(manifest.files).map(([key, value]) => `- \`${key}\`: \`${value}\``),
    "",
    "## Warnings By Layer",
    "",
    ...manifest.warningsByLayer.flatMap((layer) => [
      `### ${layer.stage}`,
      "",
      layer.warnings.length ? layer.warnings.map((warning) => `- ${warning.severity.toUpperCase()} ${warning.code}: ${warning.message}`).join("\n") : "- None",
      ""
    ])
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
  const studioScript = "tools/tactical-terrain-studio/tactical-terrain-studio.mjs";
  const unitScript = "tools/tactical-terrain-studio/terrain-unit-layer.mjs";
  const assetScript = "tools/tactical-terrain-studio/unit-asset-package.py";
  const studioRun = runNode(studioScript, ["--spec", specPath, "--out", outDir]);
  const unitRun = runNode(unitScript, [
    "--pipeline",
    path.join(outDir, "production-pipeline.json"),
    "--out",
    path.join(outDir, "terrain-unit-layer")
  ]);
  const assetRun = runPython(assetScript, [
    "--spec",
    specPath,
    "--pipeline",
    path.join(outDir, "production-pipeline.json"),
    "--out",
    path.join(outDir, "unit-asset-package")
  ]);
  const pipeline = readJson(path.join(outDir, "production-pipeline.json"));
  const unitRuntime = readJson(path.join(outDir, "terrain-unit-layer/terrain-unit-runtime.json"));
  const unitAssetPackage = readJson(path.join(outDir, "unit-asset-package/unit-asset-package.json"));
  const manifest = buildManifestV2({ assetRun, outDir, pipeline, specPath, studioRun, unitAssetPackage, unitRun, unitRuntime });
  writeJson(path.join(outDir, "pipeline-manifest.json"), manifest);
  writeText(path.join(outDir, "pipeline-manifest.md"), buildMarkdown(manifest));

  console.log(JSON.stringify({
    artifactDir: outDir,
    nextActions: manifest.nextActions,
    firstDraftReadiness: manifest.firstDraftReadiness,
    pipelineStatus: manifest.pipelineStatus,
    stageCount: manifest.stageOrder.length,
    unitRuntimeWarnings: manifest.unitRuntime.warnings.length,
    warnings: manifest.warningSummary
  }, null, 2));

  if (args.strict && (manifest.warningSummary.blockingErrorCount || manifest.warningSummary.reviewWarningCount)) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
