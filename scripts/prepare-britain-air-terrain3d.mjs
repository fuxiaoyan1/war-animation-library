#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";

const root = resolve(new URL("../", import.meta.url).pathname);
const outRoot = resolve(root, "public/assets/maps/battle-of-britain-3d");
const bounds = [-1.75, 50.52, 2.12, 52.22];
const minZoom = 6;
const maxZoom = 11;
const userAgent = "war-animation-lab-oss battle-of-britain terrain3d cache";

function usage() {
  return [
    "Usage:",
    "  node scripts/prepare-britain-air-terrain3d.mjs [--skip-existing] [--max-zoom <z>]",
    "",
    "Downloads a bounded local cross-Channel map package:",
    "  public/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg",
    "  public/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png"
  ].join("\n");
}

function parseArgs(argv) {
  const args = { maxZoom, skipExisting: true };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--skip-existing") {
      args.skipExisting = true;
      continue;
    }
    if (arg === "--no-skip-existing") {
      args.skipExisting = false;
      continue;
    }
    if (arg === "--max-zoom") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < minZoom || value > 13) {
        throw new Error("--max-zoom must be an integer from 6 to 13");
      }
      args.maxZoom = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function lonLatToTileFraction(lon, lat, zoom) {
  const n = 2 ** zoom;
  const x = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;
  return [x, y];
}

function tileCoverage(maxZoomArg) {
  const [west, south, east, north] = bounds;
  const rows = [];
  for (let z = minZoom; z <= maxZoomArg; z += 1) {
    const [x0, y0] = lonLatToTileFraction(west, north, z);
    const [x1, y1] = lonLatToTileFraction(east, south, z);
    const xMin = Math.floor(x0);
    const xMax = Math.floor(x1);
    const yMin = Math.floor(y0);
    const yMax = Math.floor(y1);
    rows.push({ count: (xMax - xMin + 1) * (yMax - yMin + 1), xMax, xMin, yMax, yMin, z });
  }
  return rows;
}

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

async function download(url, target, { skipExisting }) {
  if (skipExisting && await exists(target)) {
    return { status: "skipped", target, url };
  }

  await mkdir(dirname(target), { recursive: true });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(20_000)
      });
      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }
      await pipeline(response.body, createWriteStream(target));
      return {
        bytes: Number(response.headers.get("content-length") ?? 0),
        contentType: response.headers.get("content-type"),
        status: "downloaded",
        target,
        url
      };
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 600));
    }
  }
  return { error: String(lastError), status: "failed", target, url };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const coverage = tileCoverage(args.maxZoom);
  const tasks = [];
  for (const row of coverage) {
    for (let x = row.xMin; x <= row.xMax; x += 1) {
      for (let y = row.yMin; y <= row.yMax; y += 1) {
        tasks.push({
          layer: "topo",
          target: resolve(outRoot, "topo", String(row.z), `${x}-${y}.jpg`),
          url: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${row.z}/${y}/${x}`
        });
        tasks.push({
          layer: "terrarium",
          target: resolve(outRoot, "terrarium", String(row.z), `${x}-${y}.png`),
          url: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${row.z}/${x}/${y}.png`
        });
      }
    }
  }

  const results = [];
  const concurrency = 8;
  let cursor = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (cursor < tasks.length) {
        const task = tasks[cursor];
        cursor += 1;
        const result = await download(task.url, task.target, args);
        results.push({ ...result, layer: task.layer });
        if (result.status === "failed") {
          console.error(`failed ${task.layer} ${task.url}: ${result.error}`);
        }
      }
    })
  );

  const manifest = {
    attribution: {
      dem: "AWS Terrain Tiles Terrarium, SRTM/GMTED",
      topo: "Esri World Topographic Map tile cache for local production review"
    },
    bounds,
    coverage,
    generatedAt: new Date().toISOString(),
    layers: {
      terrainTemplate: "/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png",
      topoTemplate: "/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg"
    },
    maxZoom: args.maxZoom,
    minZoom,
    results: {
      downloaded: results.filter((item) => item.status === "downloaded").length,
      failed: results.filter((item) => item.status === "failed").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      total: results.length
    }
  };
  await writeFile(resolve(outRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest.results, null, 2));
  if (manifest.results.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
