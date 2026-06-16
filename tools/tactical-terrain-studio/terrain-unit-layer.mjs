#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/terrain-unit-layer.mjs --pipeline <production-pipeline.json> --out <dir>",
    "",
    "Options:",
    "  --pipeline <file>   Production pipeline JSON from Tactical Terrain Studio.",
    "  --out <dir>         Output artifact directory.",
    "  --help              Show this help."
  ].join("\n");
}

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--pipeline" || arg === "--out") {
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

function findLayer(pipeline, stage) {
  return (pipeline.layers ?? []).find((layer) => layer.stage === stage);
}

function modeForStage(lod, stage) {
  if ((stage.recommendedActions ?? []).includes("switch-to-formation-clusters-or-lod")) {
    return "formation-cluster-lod";
  }
  const metersPerPixel = stage.metersPerPixel;
  const row = [...lod].sort((a, b) => a.maxMetersPerPixel - b.maxMetersPerPixel).find((candidate) => metersPerPixel <= candidate.maxMetersPerPixel);
  return row?.mode ?? lod.at(-1)?.mode ?? "formation-token";
}

function buildTerrainUnitRuntime(pipeline) {
  const unitLayer = findLayer(pipeline, "terrain-height-tactical-unit-layer");
  const scaleLayer = findLayer(pipeline, "unit-scale-solver-layer");
  if (!unitLayer) {
    throw new Error("Pipeline does not contain terrain-height-tactical-unit-layer");
  }
  const stageScale = new Map((scaleLayer?.recommendations ?? []).map((row) => [row.stageId, row]));
  const unitContracts = unitLayer.unitContracts ?? [];
  const warnings = [];
  const runtimeStages = [...stageScale.values()].map((stage) => {
    const units = unitContracts
      .filter((unit) => !unit.stages?.length || unit.stages.includes(stage.stageId))
      .map((unit) => {
        const mode = modeForStage(unit.lod ?? [], stage);
        const markerPx = unit.markerPx ?? [36, 36];
        const readable = Math.min(markerPx[0], markerPx[1]) >= (unit.minVisiblePx ?? 24);
        if (!readable) {
          warnings.push({
            code: "UNIT_CONTRACT_UNREADABLE",
            message: `${stage.stageId}/${unit.id} marker is smaller than its minimum visible size.`,
            severity: "warn",
            stageId: stage.stageId,
            unitSetId: unit.id
          });
        }
        return {
          anchor: unit.anchor,
          billboardMode: unit.billboardMode,
          elevationSample: unit.elevationSample,
          faction: unit.faction,
          headingMode: unit.headingMode,
          id: unit.id,
          instanceCount: unit.count,
          markerPx,
          mode,
          verticalOffsetMeters: unit.verticalOffsetMeters,
          visualScale: unit.visualScale
        };
      });
    return {
      metersPerPixel: stage.metersPerPixel,
      recommendedActions: stage.recommendedActions,
      stageId: stage.stageId,
      units,
      zoom: stage.zoom
    };
  });
  return {
    battle: pipeline.battle,
    constraints: unitLayer.constraints,
    generatedAt: new Date().toISOString(),
    runtimeStages,
    stage: "terrain-height-tactical-unit-runtime",
    warnings
  };
}

function buildMarkdown(contract) {
  const lines = [
    `# Terrain-Height Tactical Unit Runtime: ${contract.battle?.title ?? contract.battle?.id ?? "unknown"}`,
    "",
    `Generated: ${contract.generatedAt}`,
    "",
    "## Constraints",
    "",
    ...contract.constraints.map((item) => `- ${item}`),
    "",
    "## Runtime Stages",
    "",
    "| stage | zoom | meters/px | unit contracts | actions |",
    "|---|---:|---:|---:|---|",
    ...contract.runtimeStages.map((stage) => `| ${stage.stageId} | ${stage.zoom ?? ""} | ${stage.metersPerPixel} | ${stage.units.length} | ${stage.recommendedActions.join(", ")} |`),
    "",
    "## Unit Modes",
    "",
    "| stage | unit | faction | count | mode | heading | elevation |",
    "|---|---|---|---:|---|---|---|",
    ...contract.runtimeStages.flatMap((stage) => stage.units.map((unit) => `| ${stage.stageId} | ${unit.id} | ${unit.faction} | ${unit.instanceCount} | ${unit.mode} | ${unit.headingMode} | ${unit.elevationSample} |`)),
    "",
    "## Warnings",
    "",
    contract.warnings.length ? contract.warnings.map((warning) => `- ${warning.severity.toUpperCase()} ${warning.code}: ${warning.message}`).join("\n") : "- None",
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
  if (!args.pipeline || !args.out) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }
  const pipeline = readJson(path.resolve(args.pipeline));
  const contract = buildTerrainUnitRuntime(pipeline);
  const outDir = path.resolve(args.out);
  writeJson(path.join(outDir, "terrain-unit-runtime.json"), contract);
  writeText(path.join(outDir, "terrain-unit-runtime.md"), buildMarkdown(contract));
  console.log(JSON.stringify({
    artifactDir: outDir,
    runtimeStages: contract.runtimeStages.length,
    warnings: contract.warnings.length
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
