#!/usr/bin/env node

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/capture-runtime-visual-evidence.mjs --spec <file> --url <url> --out <dir>",
    "",
    "Options:",
    "  --spec <file>       Animation production spec JSON with visualEvidence.capture.",
    "  --url <url>         Preview URL, normally http://127.0.0.1:5177/.",
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
    if (arg === "--spec" || arg === "--url" || arg === "--out") {
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

function sanitizeFileName(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

function resolveCaptureConfig(spec) {
  const capture = spec.visualEvidence?.capture ?? {};
  const battleId = spec.battle?.id;
  if (!battleId) {
    throw new Error("Spec must define battle.id for runtime visual evidence capture.");
  }
  return {
    campaignId: capture.campaignId ?? battleId,
    frames: capture.frames ?? [],
    mapStageTestId: capture.mapStageTestId ?? "map-stage",
    readySelector: capture.readySelector ?? `[data-testid="${battleId}-terrain-3d"]`,
    references: capture.references ?? [
      {
        campaignId: "gaixia",
        id: "gaixia",
        mapStageTestId: "map-stage",
        readySelector: '[data-testid="gaixia-terrain-3d"]',
        screenshotName: "reference-gaixia-opening.png",
        terrainTestId: "gaixia-terrain-3d",
        title: "韩信十面埋伏：垓下之战",
        unitSelector: ".gaixia-unit-holder"
      },
      {
        campaignId: "nianzhuang",
        id: "nianzhuang",
        mapStageTestId: "map-stage",
        readySelector: '[data-testid="nianzhuang-terrain-3d"]',
        screenshotName: "reference-nianzhuang-opening.png",
        terrainTestId: "nianzhuang-terrain-3d",
        title: "淮海战役：碾庄圩围歼战",
        unitSelector: ".formation-unit"
      }
    ],
    screenshotPrefix: capture.screenshotPrefix ?? battleId,
    terrainTestId: capture.terrainTestId ?? `${battleId}-terrain-3d`,
    unitSelector: capture.unitSelector ?? `.${battleId}-battle-unit`,
    viewport: capture.viewport ?? [1440, 900],
    waitAfterActionMs: capture.waitAfterActionMs ?? 1400
  };
}

async function openCampaign(page, campaignId) {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByTestId(`open-${campaignId}`).click();
}

async function applyFrameAction(page, frame) {
  if (frame.eventTitlePattern) {
    const pattern = new RegExp(frame.eventTitlePattern);
    await page.getByTestId("event-list").getByRole("button", { name: pattern }).click();
  }
  if (frame.timelineValue !== undefined) {
    await page.getByTestId("timeline").fill(String(frame.timelineValue));
  }
}

function requestRecord(response) {
  const url = response.url();
  if (!/\/assets\/unit-icons\//.test(url)) {
    return null;
  }
  return {
    cache: response.headers()["cache-control"] ?? "",
    status: response.status(),
    url
  };
}

async function collectReferenceMetrics(page, config) {
  const references = {};
  for (const reference of config.references) {
    await openCampaign(page, reference.campaignId);
    await page.waitForSelector(reference.readySelector, { timeout: 30_000 });
    await page.waitForTimeout(reference.waitAfterActionMs ?? 900);
    await applyFrameAction(page, reference);
    await page.waitForTimeout(reference.waitAfterActionMs ?? 900);
    if (reference.minUnitCount) {
      await page.waitForFunction(
        ({ selector, minUnitCount }) => document.querySelectorAll(selector).length >= minUnitCount,
        { minUnitCount: reference.minUnitCount, selector: reference.unitSelector },
        { timeout: reference.minUnitCountTimeoutMs ?? 10_000 }
      );
    }
    const screenshotName = reference.screenshotName ?? `reference-${reference.id}.png`;
    await page.getByTestId(reference.mapStageTestId ?? "map-stage").screenshot({ path: reference.screenshotPath ?? screenshotName });
    references[reference.id] = await page.evaluate((referenceConfig) => {
      const mapStage = document.querySelector(`[data-testid="${referenceConfig.mapStageTestId ?? "map-stage"}"]`)?.getBoundingClientRect();
      const terrain = document.querySelector(`[data-testid="${referenceConfig.terrainTestId}"]`);
      return {
        mapStage: mapStage ? { h: mapStage.height, w: mapStage.width } : null,
        mapZoom: terrain?.getAttribute("data-map-zoom") ?? "",
        renderer: terrain?.getAttribute("data-renderer") ?? "",
        title: referenceConfig.title ?? referenceConfig.id,
        unitCount: document.querySelectorAll(referenceConfig.unitSelector).length
      };
    }, reference);
  }
  return references;
}

async function collectFrameMetrics(page, frame, config) {
  return page.evaluate(({ frameId, mapStageTestId, terrainTestId, unitSelector }) => {
    const mapStage = document.querySelector(`[data-testid="${mapStageTestId}"]`)?.getBoundingClientRect();
    const terrain = document.querySelector(`[data-testid="${terrainTestId}"]`);
    const units = [...document.querySelectorAll(unitSelector)]
      .map((unit) => {
        const box = unit.getBoundingClientRect();
        const image = unit.querySelector("image");
        return {
          faction: unit.getAttribute("data-faction"),
          facing: unit.getAttribute("data-facing-x") ?? unit.querySelector("[data-facing-x]")?.getAttribute("data-facing-x"),
          h: box.height,
          href: image?.getAttribute("href") ?? image?.getAttribute("xlink:href") ?? "",
          imageAssetKind: image?.getAttribute("data-asset-kind") ?? "",
          routeId: unit.getAttribute("data-route-id"),
          w: box.width,
          x: box.x + box.width / 2,
          y: box.y + box.height / 2
        };
      })
      .filter((unit) => unit.w > 1 && unit.h > 1);
    const boundsOf = (items) => {
      if (!items.length) {
        return null;
      }
      return {
        maxX: Math.max(...items.map((item) => item.x + item.w / 2)),
        maxY: Math.max(...items.map((item) => item.y + item.h / 2)),
        minX: Math.min(...items.map((item) => item.x - item.w / 2)),
        minY: Math.min(...items.map((item) => item.y - item.h / 2))
      };
    };
    const routeBounds = {};
    for (const unit of units) {
      const routeId = unit.routeId ?? "unknown";
      routeBounds[routeId] ||= {
        count: 0,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY
      };
      routeBounds[routeId].count += 1;
      routeBounds[routeId].minX = Math.min(routeBounds[routeId].minX, unit.x);
      routeBounds[routeId].maxX = Math.max(routeBounds[routeId].maxX, unit.x);
      routeBounds[routeId].minY = Math.min(routeBounds[routeId].minY, unit.y);
      routeBounds[routeId].maxY = Math.max(routeBounds[routeId].maxY, unit.y);
    }
    const unitBounds = boundsOf(units);
    const unitBoundsFill = unitBounds && mapStage
      ? {
          maxX: Number(unitBounds.maxX.toFixed(1)),
          maxY: Number(unitBounds.maxY.toFixed(1)),
          minX: Number(unitBounds.minX.toFixed(1)),
          minY: Number(unitBounds.minY.toFixed(1)),
          xFill: Number(((unitBounds.maxX - unitBounds.minX) / mapStage.width).toFixed(3)),
          yFill: Number(((unitBounds.maxY - unitBounds.minY) / mapStage.height).toFixed(3))
        }
      : null;
    const unitFacingCounts = {};
    for (const unit of units) {
      const key = `${unit.routeId ?? "unknown"}:${unit.imageAssetKind || "unknown"}:${unit.facing ?? "unknown"}`;
      unitFacingCounts[key] = (unitFacingCounts[key] ?? 0) + 1;
    }
    return {
      activeEvent: document.querySelector('[data-testid="active-event-card"]')?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      averageUnitBox: units.length
        ? {
            h: Number((units.reduce((sum, unit) => sum + unit.h, 0) / units.length).toFixed(1)),
            w: Number((units.reduce((sum, unit) => sum + unit.w, 0) / units.length).toFixed(1))
          }
        : null,
      cameraBearing: terrain?.getAttribute("data-camera-bearing") ?? "",
      cameraPitch: terrain?.getAttribute("data-camera-pitch") ?? "",
      carthageUnits: units.filter((unit) => unit.faction === "carthaginian").length,
      frameId,
      hrefs: [...new Set(units.map((unit) => unit.href).filter(Boolean))],
      imageAssetKinds: [...new Set(units.map((unit) => unit.imageAssetKind).filter(Boolean))],
      leftJawUnits: Number(terrain?.getAttribute("data-left-jaw-units") ?? 0),
      mapCenter: terrain?.getAttribute("data-map-center") ?? "",
      mapPixelRatio: terrain?.getAttribute("data-map-pixel-ratio") ?? "",
      mapZoom: terrain?.getAttribute("data-map-zoom") ?? "",
      rearClosureUnits: Number(terrain?.getAttribute("data-rear-closure-units") ?? 0),
      rightJawUnits: Number(terrain?.getAttribute("data-right-jaw-units") ?? 0),
      romanUnits: units.filter((unit) => unit.faction === "roman").length,
      routeBounds,
      terrainLoaded: terrain?.getAttribute("data-terrain-loaded") ?? "",
      totalUnits: units.length,
      unitBoundsFill,
      unitFacingCounts,
      visibleCarthageUnits: Number(terrain?.getAttribute("data-visible-carthage-units") ?? 0),
      visibleRomanUnits: Number(terrain?.getAttribute("data-visible-roman-units") ?? 0)
    };
  }, {
    frameId: frame.id,
    mapStageTestId: config.mapStageTestId,
    terrainTestId: config.terrainTestId,
    unitSelector: config.unitSelector
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.spec || !args.url || !args.out) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }
  const spec = readJson(path.resolve(args.spec));
  const config = resolveCaptureConfig(spec);
  const outDir = path.resolve(args.out);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    baseURL: args.url,
    deviceScaleFactor: 1,
    viewport: { width: config.viewport[0], height: config.viewport[1] }
  });
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    const record = requestRecord(response);
    if (record) {
      requests.push(record);
    }
  });

  for (const reference of config.references) {
    reference.screenshotPath = path.join(outDir, reference.screenshotName ?? `reference-${reference.id}.png`);
  }
  const references = await collectReferenceMetrics(page, config);

  await openCampaign(page, config.campaignId);
  await page.waitForSelector(config.readySelector, { timeout: 30_000 });
  await page.waitForTimeout(config.waitAfterActionMs);

  const battleMetrics = {};
  for (const [index, frame] of config.frames.entries()) {
    await applyFrameAction(page, frame);
    await page.waitForTimeout(frame.waitAfterActionMs ?? config.waitAfterActionMs);
    const screenshotName = frame.screenshotName ?? `${config.screenshotPrefix}-${String(index + 1).padStart(2, "0")}-${sanitizeFileName(frame.id)}.png`;
    await page.getByTestId(config.mapStageTestId).screenshot({ path: path.join(outDir, screenshotName) });
    battleMetrics[frame.id] = await collectFrameMetrics(page, frame, config);
  }

  await browser.close();
  const report = {
    consoleErrors,
    pageErrors,
    requests,
    references,
    [spec.battle.id]: battleMetrics
  };
  writeJson(path.join(outDir, "metrics.dom.json"), report);
  console.log(JSON.stringify({
    artifactDir: outDir,
    battle: spec.battle.id,
    frames: config.frames.length,
    references: Object.keys(references)
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
