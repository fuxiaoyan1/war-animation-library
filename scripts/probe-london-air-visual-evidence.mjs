import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.FRONTEND_URL ?? "http://127.0.0.1:5177";
const outDir = path.resolve(process.argv[2] ?? "artifacts/london-air-visual-evidence");
const aircraftAssetVersion = "20260614-he111-standard-v1";

const he111QualityBand = {
  luminanceMean: { min: 80, max: 150 },
  luminanceStdDev: { min: 46, max: 88 },
  saturationMean: { min: 45, max: 95 },
  tailJoinRatio: { min: 0.028, max: 0.1 },
  tailRootRearFuselageRgbDistance: { max: 32 },
  topBottomBalanceRatio: { min: 0.82 }
};

const events = [
  { id: "opening-radar", file: "01-opening-radar.png" },
  { id: "radar-contact", titleIncludes: "雷达报告：大编队越海", file: "02-radar-contact.png" },
  { id: "morning-dogfight", titleIncludes: "伦敦南侧空域混战", file: "03-morning-dogfight.png" },
  { id: "afternoon-warning", titleIncludes: "13:45", file: "04-afternoon-warning.png" },
  { id: "afternoon-peak", titleIncludes: "下午高峰", file: "05-afternoon-peak.png" },
  { id: "channel-pursuit", titleIncludes: "海峡追击", file: "06-channel-pursuit.png" }
];

const aircraftAssets = [
  "britain-hurricane",
  "britain-spitfire",
  "luftwaffe-bf109",
  "luftwaffe-bf110",
  "luftwaffe-do17",
  "luftwaffe-he111"
];

async function ensureDir() {
  await fs.mkdir(outDir, { recursive: true });
}

function metricPass(value, band) {
  return value >= band.min && (band.max === undefined || value <= band.max);
}

function evaluateQualityBand(stats) {
  return {
    luminanceMean: metricPass(stats.luminanceMean, he111QualityBand.luminanceMean),
    luminanceStdDev: metricPass(stats.luminanceStdDev, he111QualityBand.luminanceStdDev),
    saturationMean: metricPass(stats.saturationMean, he111QualityBand.saturationMean),
    tailJoinRatio: metricPass(stats.tailJoinRatio, he111QualityBand.tailJoinRatio),
    tailRootRearFuselageRgbDistance: stats.tailRootRearFuselageRgbDistance <= he111QualityBand.tailRootRearFuselageRgbDistance.max,
    topBottomBalanceRatio: metricPass(stats.topBottomBalanceRatio, he111QualityBand.topBottomBalanceRatio)
  };
}

async function collectPageMetrics(page) {
  return page.evaluate((assetNames) => {
    const battle = document.querySelector(".battle-of-britain");
    const mapStage = battle?.querySelector('[data-testid="map-stage"]') ?? battle?.querySelector(".map-stage");
    const cameraLayer = battle?.querySelector(".camera-layer");
    const mapBox = (mapStage ?? battle).getBoundingClientRect();
    const currentEvent = battle?.querySelector(".current-event-marker, .event-marker.is-current, [data-current-event='true']");
    const radarRoute = battle?.querySelector('.front-line[data-route-id="morning-radar-plots"] .front-route');
    const chainHomeVector = battle?.querySelector('[data-testid="britain-chain-home-vector"]');
    const dogfight = battle?.querySelector('[data-testid="britain-morning-dogfight"], [data-testid="britain-afternoon-dogfight"], [data-testid="dogfight-clash"]');
    const surfaceLayer = battle?.querySelector(".map-surface-layer");
    const firstSurface = battle?.querySelector(".map-surface-layer .map-surface-feature");
    const firstTactical = battle?.querySelector(".tactical-terrain-layer, .fortified-line-layer, .front-line, .map-overlay-elements");
    const firstAircraft = battle?.querySelector(".ww2-aircraft-marker");
    const rectFor = (element) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        bottom: (rect.bottom - mapBox.top) / mapBox.height,
        centerX: (rect.left + rect.width / 2 - mapBox.left) / mapBox.width,
        centerY: (rect.top + rect.height / 2 - mapBox.top) / mapBox.height,
        height: rect.height,
        left: (rect.left - mapBox.left) / mapBox.width,
        right: (rect.right - mapBox.left) / mapBox.width,
        top: (rect.top - mapBox.top) / mapBox.height,
        width: rect.width
      };
    };

    const markers = Array.from(battle?.querySelectorAll(".ww2-aircraft-marker") ?? []).map((marker) => {
      const image = marker.querySelector(".unit-icon-image");
      const markerBox = marker.getBoundingClientRect();
      const imageBox = image?.getBoundingClientRect();
      return {
        assetKind: image?.getAttribute("data-asset-kind"),
        href: image?.getAttribute("href"),
        imageBox: imageBox ? { height: imageBox.height, width: imageBox.width } : null,
        markerBox: { height: markerBox.height, width: markerBox.width },
        testId: marker.getAttribute("data-testid")
      };
    });
    const surfaceFeatures = Array.from(battle?.querySelectorAll(".map-surface-feature") ?? []).map((feature) => {
      const box = feature.getBoundingClientRect();
      return {
        box: {
          height: Math.round(box.height),
          width: Math.round(box.width)
        },
        id: feature.getAttribute("data-surface-id"),
        kind: feature.getAttribute("data-surface-kind"),
        testId: feature.getAttribute("data-testid"),
        type: feature.getAttribute("data-surface-type")
      };
    });
    const visibleSurfaceLabels = Array.from(battle?.querySelectorAll(".map-surface-label") ?? []).filter((label) => getComputedStyle(label).display !== "none").length;
    const surfacePathStyles = Array.from(battle?.querySelectorAll(".map-surface-feature path") ?? []).map((path) => {
      const style = getComputedStyle(path);
      const box = path.getBoundingClientRect();
      return {
        area: Math.round(box.width * box.height),
        className: path.getAttribute("class"),
        fill: style.fill,
        filter: style.filter,
        opacity: Number.parseFloat(style.opacity || "1"),
        stroke: style.stroke,
        strokeWidth: Number.parseFloat(style.strokeWidth || "0")
      };
    });
    const darkSurfaceBlocks = surfacePathStyles.filter((item) => {
      const match = item.fill.match(/rgba?\(([^)]+)\)/);
      if (!match || item.fill === "none") return false;
      const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
      const alpha = parts[3] ?? 1;
      const luminance = parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722;
      return item.area > 16000 && item.opacity * alpha > 0.14 && luminance < 54;
    });

    const svg = battle?.querySelector("svg.battle-map");
    const darkBlocks = [];
    if (svg) {
      for (const element of Array.from(svg.querySelectorAll("path, polygon, rect, ellipse, polyline"))) {
        const rect = element.getBoundingClientRect();
        if (rect.width * rect.height < 12000) continue;
        const style = getComputedStyle(element);
        const fill = style.fill;
        const opacity = Number.parseFloat(style.opacity || "1");
        const match = fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) continue;
        const alpha = match[4] ? Number.parseFloat(match[4]) : 1;
        const r = Number(match[1]);
        const g = Number(match[2]);
        const b = Number(match[3]);
        const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
        if (luminance < 34 && opacity * alpha > 0.28) {
          darkBlocks.push({
            area: Math.round(rect.width * rect.height),
            className: element.getAttribute("class"),
            fill,
            height: Math.round(rect.height),
            tag: element.tagName,
            width: Math.round(rect.width)
          });
        }
      }
    }

    const assetMarkers = Object.fromEntries(
      assetNames.map((asset) => [asset, markers.filter((marker) => marker.href?.includes(`/assets/unit-icons/${asset}.png`)).length])
    );

    return {
      activeEvent: document.querySelector('[data-testid="active-event-card"]')?.textContent?.replace(/\s+/g, " ").trim(),
      aircraftMarkerCount: markers.length,
      assetMarkers,
      cameraFocus: cameraLayer?.getAttribute("data-map-focus"),
      chainHomeVectorBox: rectFor(chainHomeVector),
      currentEventBox: rectFor(currentEvent),
      darkBlocks,
      darkSurfaceBlocks,
      dogfightBox: rectFor(dogfight),
      genericAircraftMarkers: battle?.querySelectorAll('[data-testid="ww2-fighter-marker"], [data-testid="ww2-bomber-marker"]').length ?? 0,
      mapSurface: {
        aircraftAfterSurface: Boolean(surfaceLayer && firstAircraft && surfaceLayer.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING),
        featureCount: surfaceFeatures.length,
        features: surfaceFeatures,
        filters: [...new Set(surfacePathStyles.map((item) => item.filter))],
        maxStrokeWidth: Math.max(...surfacePathStyles.map((item) => item.strokeWidth), 0),
        surfaceBeforeTactical: Boolean(firstSurface && firstTactical && firstSurface.compareDocumentPosition(firstTactical) & Node.DOCUMENT_POSITION_FOLLOWING),
        visibleLabels: visibleSurfaceLabels
      },
      markerSample: markers.slice(0, 24),
      radarRouteBox: rectFor(radarRoute),
      title: document.querySelector('[data-testid="map-title-card"] h1, [data-testid="map-title-card"] h2')?.textContent
    };
  }, aircraftAssets);
}

async function collectAssetMetrics(page) {
  const metrics = await page.evaluate(async ({ assetNames, version }) => {
    const output = {};
    for (const asset of assetNames) {
      const image = new Image();
      image.src = `/assets/unit-icons/${asset}.png?v=${version}`;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("2d canvas unavailable");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let alphaSum = 0;
      let edgePixels = 0;
      let edgeVisiblePixels = 0;
      let opaquePixels = 0;
      let luminanceSum = 0;
      let luminanceSquareSum = 0;
      let saturationSum = 0;
      let visiblePixels = 0;
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = -1;
      let maxY = -1;
      const rowCounts = new Array(canvas.height).fill(0);
      const columnCounts = new Array(canvas.width).fill(0);
      const cornerAlphaValues = [
        pixels[3],
        pixels[(canvas.width - 1) * 4 + 3],
        pixels[(canvas.height - 1) * canvas.width * 4 + 3],
        pixels[(canvas.height * canvas.width - 1) * 4 + 3]
      ];
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const offset = (y * canvas.width + x) * 4;
          const alpha = pixels[offset + 3];
          alphaSum += alpha;
          if (alpha > 8) opaquePixels += 1;
          if (alpha > 16) {
            const red = pixels[offset];
            const green = pixels[offset + 1];
            const blue = pixels[offset + 2];
            const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
            luminanceSum += luminance;
            luminanceSquareSum += luminance * luminance;
            saturationSum += Math.max(red, green, blue) - Math.min(red, green, blue);
            visiblePixels += 1;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            rowCounts[y] += 1;
            columnCounts[x] += 1;
          }
          if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
            edgePixels += 1;
            if (alpha > 8) edgeVisiblePixels += 1;
          }
        }
      }
      const bboxArea = maxX >= minX && maxY >= minY ? (maxX - minX + 1) * (maxY - minY + 1) : 0;
      const midY = maxY >= minY ? minY + Math.floor((maxY - minY + 1) / 2) : 0;
      const upperHalfPixels = rowCounts.slice(minY, midY).reduce((sum, count) => sum + count, 0);
      const lowerHalfPixels = rowCounts.slice(midY, maxY + 1).reduce((sum, count) => sum + count, 0);
      const regionRgbMean = (x1f, x2f, y1f, y2f) => {
        if (maxX < minX || maxY < minY) return null;
        const bboxWidth = maxX - minX + 1;
        const bboxHeight = maxY - minY + 1;
        const x1 = minX + Math.round(bboxWidth * x1f);
        const x2 = minX + Math.round(bboxWidth * x2f);
        const y1 = minY + Math.round(bboxHeight * y1f);
        const y2 = minY + Math.round(bboxHeight * y2f);
        let count = 0;
        const sum = [0, 0, 0];
        for (let y = y1; y < y2; y += 1) {
          for (let x = x1; x < x2; x += 1) {
            const offset = (y * canvas.width + x) * 4;
            if (pixels[offset + 3] <= 32) continue;
            sum[0] += pixels[offset];
            sum[1] += pixels[offset + 1];
            sum[2] += pixels[offset + 2];
            count += 1;
          }
        }
        return count > 0 ? sum.map((value) => value / count) : null;
      };
      const rgbDistance = (a, b) => {
        if (!a || !b) return 999;
        return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
      };
      const tailRootMeanRgb = regionRgbMean(0.12, 0.3, 0.35, 0.65);
      const rearFuselageMeanRgb = regionRgbMean(0.3, 0.48, 0.35, 0.65);
      const tailJoinLeft = maxX >= minX ? minX + Math.round((maxX - minX + 1) * 0.18) : 0;
      const tailJoinRight = maxX >= minX ? minX + Math.round((maxX - minX + 1) * 0.42) : 0;
      let tailJoinPixels = 0;
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = tailJoinLeft; x < tailJoinRight; x += 1) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 16) tailJoinPixels += 1;
        }
      }
      const luminanceMean = visiblePixels > 0 ? luminanceSum / visiblePixels : 0;
      const luminanceVariance = visiblePixels > 0 ? luminanceSquareSum / visiblePixels - luminanceMean * luminanceMean : 0;
      output[asset] = {
        alphaRatio: alphaSum / (255 * canvas.width * canvas.height),
        alphaBoundingBoxRatio: bboxArea / (canvas.width * canvas.height),
        bbox: [minX, minY, maxX, maxY],
        bboxFillRatio: bboxArea > 0 ? opaquePixels / bboxArea : 0,
        cornerAlphaMax: Math.max(...cornerAlphaValues),
        edgeVisibleRatio: edgeVisiblePixels / edgePixels,
        luminanceMean,
        luminanceStdDev: Math.sqrt(Math.max(0, luminanceVariance)),
        maxColumnCoverage: Math.max(...columnCounts) / canvas.height,
        maxRowCoverage: Math.max(...rowCounts) / canvas.width,
        opaqueRatio: opaquePixels / (canvas.width * canvas.height),
        saturationMean: visiblePixels > 0 ? saturationSum / visiblePixels : 0,
        size: [canvas.width, canvas.height],
        tailJoinRatio: visiblePixels > 0 ? tailJoinPixels / visiblePixels : 0,
        tailRootMeanRgb,
        rearFuselageMeanRgb,
        tailRootRearFuselageRgbDistance: rgbDistance(tailRootMeanRgb, rearFuselageMeanRgb),
        topBottomBalanceRatio: Math.min(upperHalfPixels, lowerHalfPixels) / Math.max(upperHalfPixels, lowerHalfPixels, 1)
      };
    }
    return output;
  }, { assetNames: aircraftAssets, version: aircraftAssetVersion });

  return Object.fromEntries(
    Object.entries(metrics).map(([asset, stats]) => [
      asset,
      {
        ...stats,
        he111QualityBandPass: evaluateQualityBand(stats)
      }
    ])
  );
}

async function collectAssetHeads(page) {
  const heads = {};
  for (const asset of aircraftAssets) {
    const response = await page.request.head(`${baseUrl}/assets/unit-icons/${asset}.png?v=${aircraftAssetVersion}`);
    heads[asset] = {
      cacheControl: response.headers()["cache-control"],
      contentLength: Number(response.headers()["content-length"]),
      contentType: response.headers()["content-type"],
      ok: response.ok(),
      status: response.status()
    };
  }
  return heads;
}

async function clickEvent(page, titleIncludes) {
  if (!titleIncludes) return;
  const clicked = await page.getByTestId("event-list").evaluate((eventList, needle) => {
    const buttons = Array.from(eventList.querySelectorAll("button"));
    const button = buttons.find((item) => (item.textContent ?? "").includes(needle) || (item.getAttribute("title") ?? "").includes(needle));
    if (!button) return false;
    button.click();
    return true;
  }, titleIncludes);
  if (!clicked) throw new Error(`Event button not found: ${titleIncludes}`);
  await page.waitForTimeout(650);
}

async function main() {
  await ensureDir();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByTestId("open-britain-air").click();
  await page.getByTestId("battle-of-britain-app").waitFor({ state: "visible" });
  await page.waitForTimeout(900);

  const screenshots = [];
  const stageMetrics = {};
  for (const event of events) {
    await clickEvent(page, event.titleIncludes);
    const filePath = path.join(outDir, event.file);
    await page.screenshot({ path: filePath, fullPage: false });
    screenshots.push(filePath);
    stageMetrics[event.id] = await collectPageMetrics(page);
  }

  const metrics = {
    aircraftAssetVersion,
    baseUrl,
    checkedAt: new Date().toISOString(),
    consoleErrors,
    pageErrors,
    he111QualityBand,
    screenshots,
    stageMetrics,
    assetHeads: await collectAssetHeads(page),
    aircraftPngMetrics: await collectAssetMetrics(page)
  };
  await fs.writeFile(path.join(outDir, "metrics.browser.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
