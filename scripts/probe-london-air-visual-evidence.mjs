import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";

const baseUrl = process.env.FRONTEND_URL ?? "http://127.0.0.1:5177";
const outDir = path.resolve(process.argv[2] ?? "artifacts/london-air-visual-evidence");
const aircraftAssetVersion = "20260614-he111-standard-v1";
const weatherAssetVersion = "20260614-comfy-weather-v4";
const musicAssetPath = "/audio/wikimedia-holst-mercury.ogg";

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

function decodeScreenshotPng(buffer) {
  const signature = buffer.subarray(0, 8);
  if (!signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error("Screenshot was not a PNG");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const chunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === "IDAT") {
      chunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (width <= 0 || height <= 0 || bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`Unsupported PNG format: ${width}x${height}, bitDepth=${bitDepth}, colorType=${colorType}`);
  }

  const inflated = inflateSync(Buffer.concat(chunks));
  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * 4);
  let inputOffset = 0;
  const prior = Buffer.alloc(stride);
  const current = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    inflated.copy(current, 0, inputOffset, inputOffset + stride);
    inputOffset += stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? current[x - bytesPerPixel] : 0;
      const up = prior[x];
      const upLeft = x >= bytesPerPixel ? prior[x - bytesPerPixel] : 0;
      if (filter === 1) {
        current[x] = (current[x] + left) & 255;
      } else if (filter === 2) {
        current[x] = (current[x] + up) & 255;
      } else if (filter === 3) {
        current[x] = (current[x] + Math.floor((left + up) / 2)) & 255;
      } else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        current[x] = (current[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }
    }

    for (let x = 0; x < width; x += 1) {
      const source = x * bytesPerPixel;
      const target = (y * width + x) * 4;
      pixels[target] = current[source];
      pixels[target + 1] = current[source + 1];
      pixels[target + 2] = current[source + 2];
      pixels[target + 3] = colorType === 6 ? current[source + 3] : 255;
    }
    current.copy(prior);
  }

  return { data: pixels, height, width };
}

function collectRenderedStageColorGrade(buffer) {
  const png = decodeScreenshotPng(buffer);
  let bluePixels = 0;
  let cyanGreenSeaPixels = 0;
  let darkPixels = 0;
  let greenPixels = 0;
  let lowDaylightPixels = 0;
  let luminanceSquareSum = 0;
  let luminanceSum = 0;
  const luminanceValues = [];
  let nightBluePixels = 0;
  let saturationSum = 0;
  let samples = 0;

  const xStart = Math.floor(png.width * 0.06);
  const xEnd = Math.floor(png.width * 0.94);
  const yStart = Math.floor(png.height * 0.16);
  const yEnd = Math.floor(png.height * 0.88);

  for (let y = yStart; y < yEnd; y += 3) {
    for (let x = xStart; x < xEnd; x += 3) {
      const offset = (y * png.width + x) * 4;
      const red = png.data[offset];
      const green = png.data[offset + 1];
      const blue = png.data[offset + 2];
      const alpha = png.data[offset + 3];
      if (alpha < 245) {
        continue;
      }
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
      luminanceSum += luminance;
      luminanceSquareSum += luminance * luminance;
      luminanceValues.push(luminance);
      saturationSum += saturation;
      samples += 1;
      if (luminance < 34) darkPixels += 1;
      if (luminance < 95) lowDaylightPixels += 1;
      if (green > blue + 10 && green > red + 4) greenPixels += 1;
      if (blue > 70 && green > 68 && green >= blue - 2 && green > red + 18) cyanGreenSeaPixels += 1;
      if (blue > green + 8 && blue > red + 12 && saturation > 24) bluePixels += 1;
      if (blue > green + 10 && blue > red + 16 && saturation > 28 && luminance < 112) nightBluePixels += 1;
    }
  }

  const luminanceMean = samples > 0 ? luminanceSum / samples : 0;
  luminanceValues.sort((a, b) => a - b);
  const percentile = (ratio) =>
    luminanceValues.length > 0 ? luminanceValues[Math.min(luminanceValues.length - 1, Math.max(0, Math.floor(luminanceValues.length * ratio)))] : 0;
  return {
    brightnessScore100: (luminanceMean / 255) * 100,
    blueRatio: samples > 0 ? bluePixels / samples : 0,
    cyanGreenSeaRatio: samples > 0 ? cyanGreenSeaPixels / samples : 0,
    darkRatio: samples > 0 ? darkPixels / samples : 0,
    greenRatio: samples > 0 ? greenPixels / samples : 0,
    lowDaylightRatio: samples > 0 ? lowDaylightPixels / samples : 0,
    luminanceMean,
    luminanceP10: percentile(0.1),
    luminanceP25: percentile(0.25),
    luminanceStdDev: samples > 0 ? Math.sqrt(Math.max(0, luminanceSquareSum / samples - luminanceMean * luminanceMean)) : 0,
    nightBlueRatio: samples > 0 ? nightBluePixels / samples : 0,
    saturationMean: samples > 0 ? saturationSum / samples : 0
  };
}

function evaluateDaylightMapColorGate(colorGrade) {
  return {
    brightnessScore: colorGrade.brightnessScore100 > 56 && colorGrade.brightnessScore100 < 70,
    contrast: colorGrade.luminanceStdDev > 20,
    darkRatio: colorGrade.darkRatio < 0.045,
    cyanGreenSea: colorGrade.cyanGreenSeaRatio < 0.2,
    greenWash: colorGrade.greenRatio < 0.24,
    lowDaylightRatio: colorGrade.lowDaylightRatio < 0.18,
    luminanceP10: colorGrade.luminanceP10 > 82,
    luminanceP25: colorGrade.luminanceP25 > 105,
    nightBlueRatio: colorGrade.nightBlueRatio < 0.16,
    saturation: colorGrade.saturationMean > 42,
    steelBlue: colorGrade.blueRatio > 0.14
  };
}

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
    const terrainLayer = battle?.querySelector('[data-testid="battle-of-britain-terrain-3d"]');
    const terrainCanvas = battle?.querySelector('[data-testid="battle-of-britain-terrain-3d-canvas"]');
    const weatherOverlays = Array.from(battle?.querySelectorAll(".battle-of-britain-weather-overlay") ?? []);
    const firstTactical = battle?.querySelector(".tactical-terrain-layer, .fortified-line-layer, .front-line, .map-overlay-elements");
    const firstAircraft = battle?.querySelector(".ww2-aircraft-marker");
    const countryLayer = battle?.querySelector(".country-layer");
    const countries = Array.from(battle?.querySelectorAll(".country") ?? []);
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
    const terrainTexture = (() => {
      if (!terrainCanvas) return { edgeMean: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
      const sample = document.createElement("canvas");
      sample.width = 220;
      sample.height = 140;
      const context = sample.getContext("2d", { willReadFrequently: true });
      if (!context) return { edgeMean: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
      context.drawImage(terrainCanvas, 0, 0, sample.width, sample.height);
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      const luminance = new Float32Array(sample.width * sample.height);
      let edgeSum = 0;
      let edgeCount = 0;
      let luminanceSum = 0;
      let luminanceSquareSum = 0;
      let saturationSum = 0;
      for (let y = 0; y < sample.height; y += 1) {
        for (let x = 0; x < sample.width; x += 1) {
          const offset = (y * sample.width + x) * 4;
          const value = pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
          luminance[y * sample.width + x] = value;
          luminanceSum += value;
          luminanceSquareSum += value * value;
          saturationSum += Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) - Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
        }
      }
      for (let y = 1; y < sample.height; y += 1) {
        for (let x = 1; x < sample.width; x += 1) {
          const value = luminance[y * sample.width + x];
          edgeSum += Math.abs(value - luminance[y * sample.width + x - 1]) + Math.abs(value - luminance[(y - 1) * sample.width + x]);
          edgeCount += 1;
        }
      }
      const count = sample.width * sample.height;
      const luminanceMean = luminanceSum / count;
      const variance = luminanceSquareSum / count - luminanceMean * luminanceMean;
      return {
        edgeMean: edgeSum / edgeCount,
        luminanceMean,
        luminanceStdDev: Math.sqrt(Math.max(0, variance)),
        saturationMean: saturationSum / count
      };
    })();
    const renderedColorGrade = (() => {
      if (!mapStage) {
        return { blueRatio: 0, darkRatio: 0, greenRatio: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
      }
      const stageBox = mapStage.getBoundingClientRect();
      const sample = document.createElement("canvas");
      sample.width = Math.max(1, Math.round(stageBox.width));
      sample.height = Math.max(1, Math.round(stageBox.height));
      const context = sample.getContext("2d", { willReadFrequently: true });
      const sourceCanvas = terrainCanvas;
      if (!context || !sourceCanvas) {
        return { blueRatio: 0, darkRatio: 0, greenRatio: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
      }
      context.drawImage(sourceCanvas, 0, 0, sample.width, sample.height);
      context.globalCompositeOperation = "multiply";
      const gradient = context.createLinearGradient(0, 0, sample.width, sample.height);
      gradient.addColorStop(0, "rgba(65,122,154,0.5)");
      gradient.addColorStop(0.43, "rgba(58,121,157,0.46)");
      gradient.addColorStop(0.68, "rgba(158,126,75,0.36)");
      gradient.addColorStop(1, "rgba(172,116,54,0.3)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, sample.width, sample.height);
      context.globalCompositeOperation = "soft-light";
      const sheen = context.createLinearGradient(0, 0, sample.width, sample.height);
      sheen.addColorStop(0, "rgba(47,120,158,0.24)");
      sheen.addColorStop(0.42, "rgba(61,136,164,0.22)");
      sheen.addColorStop(0.68, "rgba(177,139,73,0.2)");
      sheen.addColorStop(1, "rgba(194,125,54,0.16)");
      context.fillStyle = sheen;
      context.fillRect(0, 0, sample.width, sample.height);
      context.globalCompositeOperation = "source-over";
      const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
      let bluePixels = 0;
      let darkPixels = 0;
      let greenPixels = 0;
      let luminanceSquareSum = 0;
      let luminanceSum = 0;
      let saturationSum = 0;
      let samples = 0;
      for (let y = Math.floor(sample.height * 0.16); y < Math.floor(sample.height * 0.88); y += 3) {
        for (let x = Math.floor(sample.width * 0.06); x < Math.floor(sample.width * 0.94); x += 3) {
          const offset = (y * sample.width + x) * 4;
          const red = pixels[offset];
          const green = pixels[offset + 1];
          const blue = pixels[offset + 2];
          const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
          const saturation = Math.max(red, green, blue) - Math.min(red, green, blue);
          luminanceSum += luminance;
          luminanceSquareSum += luminance * luminance;
          saturationSum += saturation;
          samples += 1;
          if (luminance < 34) darkPixels += 1;
          if (green > blue + 10 && green > red + 4) greenPixels += 1;
          if (blue > green + 8 && blue > red + 12 && saturation > 24) bluePixels += 1;
        }
      }
      const luminanceMean = samples > 0 ? luminanceSum / samples : 0;
      return {
        blueRatio: samples > 0 ? bluePixels / samples : 0,
        darkRatio: samples > 0 ? darkPixels / samples : 0,
        greenRatio: samples > 0 ? greenPixels / samples : 0,
        luminanceMean,
        luminanceStdDev: samples > 0 ? Math.sqrt(Math.max(0, luminanceSquareSum / samples - luminanceMean * luminanceMean)) : 0,
        saturationMean: samples > 0 ? saturationSum / samples : 0
      };
    })();

    return {
      activeEvent: document.querySelector('[data-testid="active-event-card"]')?.textContent?.replace(/\s+/g, " ").trim(),
      aircraftMarkerCount: markers.length,
      assetMarkers,
      cameraFocus: cameraLayer?.getAttribute("data-map-focus"),
      chainHomeVectorBox: rectFor(chainHomeVector),
      currentEventBox: rectFor(currentEvent),
      darkBlocks,
      dogfightBox: rectFor(dogfight),
      genericAircraftMarkers: battle?.querySelectorAll('[data-testid="ww2-fighter-marker"], [data-testid="ww2-bomber-marker"]').length ?? 0,
      terrain3D: {
        aircraftAfterTerrain: firstAircraft
          ? Boolean(terrainLayer && terrainLayer.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING)
          : true,
        cameraMode: terrainLayer?.getAttribute("data-camera-mode") ?? "",
        canvasRect: rectFor(terrainCanvas),
        countryFills: countries.map((country) => getComputedStyle(country).fill),
        countryLayerOpacity: countryLayer ? getComputedStyle(countryLayer).opacity : "",
        mapCenter: terrainLayer?.getAttribute("data-map-center") ?? "",
        mapFocus: terrainLayer?.getAttribute("data-map-focus") ?? "",
        mapRegistration: terrainLayer?.getAttribute("data-map-registration") ?? "",
        mapPixelRatio: terrainLayer?.getAttribute("data-map-pixel-ratio") ?? "",
        mapZoom: Number(terrainLayer?.getAttribute("data-map-zoom") ?? 0),
        registrationMaxError: Number(terrainLayer?.getAttribute("data-registration-max-error") ?? 999),
        registrationMeanError: Number(terrainLayer?.getAttribute("data-registration-mean-error") ?? 999),
        registrationSampleCount: Number(terrainLayer?.getAttribute("data-registration-sample-count") ?? 0),
        renderer: terrainLayer?.getAttribute("data-renderer") ?? "",
        terrainLoaded: terrainLayer?.getAttribute("data-terrain-loaded") ?? "",
        terrainSource: terrainLayer?.getAttribute("data-terrain-source") ?? "",
        terrainTexture,
        renderedColorGrade,
        topoLabelsSuppressed: terrainLayer?.getAttribute("data-topo-labels-suppressed") ?? "",
        topoRasterOpacity: Number(terrainLayer?.getAttribute("data-topo-raster-opacity") ?? 999),
        topoSource: terrainLayer?.getAttribute("data-topo-source") ?? "",
        tacticalAfterTerrain: firstTactical
          ? Boolean(terrainLayer && terrainLayer.compareDocumentPosition(firstTactical) & Node.DOCUMENT_POSITION_FOLLOWING)
          : true,
        visualSurfaceContract: terrainLayer?.getAttribute("data-visual-surface-contract") ?? "",
        weatherPhase: terrainLayer?.getAttribute("data-weather-phase") ?? ""
      },
      weatherOverlays: weatherOverlays.map((overlay) => {
        const image = overlay.querySelector("image");
        const box = overlay.getBoundingClientRect();
        const coverage = (box.width * box.height) / Math.max(1, mapBox.width * mapBox.height);
        return {
          beforeAircraft: firstAircraft ? Boolean(overlay.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING) : true,
          beforeRoute: firstTactical ? Boolean(overlay.compareDocumentPosition(firstTactical) & Node.DOCUMENT_POSITION_FOLLOWING) : true,
          coverage,
          href: image?.getAttribute("href") ?? "",
          id: overlay.getAttribute("data-testid") ?? "",
          opacity: Number.parseFloat(getComputedStyle(overlay).opacity || "1"),
          phase: overlay.getAttribute("data-scene-transition-phase") ?? "",
          rect: rectFor(overlay),
          visible: box.width > 1 && box.height > 1 && Number.parseFloat(getComputedStyle(overlay).opacity || "1") > 0.04
        };
      }),
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
  const musicResponse = await page.request.head(`${baseUrl}${musicAssetPath}`);
  heads[musicAssetPath] = {
    cacheControl: musicResponse.headers()["cache-control"],
    contentLength: Number(musicResponse.headers()["content-length"]),
    contentType: musicResponse.headers()["content-type"],
    ok: musicResponse.ok(),
    status: musicResponse.status()
  };
  return heads;
}

async function collectWeatherAssetMetrics(page) {
  const records = await page.evaluate(async ({ version }) => {
    const assetPaths = [
      "/assets/weather/battle-of-britain/morning-cloud-bank.png",
      "/assets/weather/battle-of-britain/afternoon-cloud-breaks.png"
    ];
    const output = {};
    for (const assetPath of assetPaths) {
      const image = new Image();
      image.src = `${assetPath}?v=${version}`;
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
      const cornerAlphaValues = [
        pixels[3],
        pixels[(canvas.width - 1) * 4 + 3],
        pixels[(canvas.height - 1) * canvas.width * 4 + 3],
        pixels[(canvas.height * canvas.width - 1) * 4 + 3]
      ];
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const alpha = pixels[(y * canvas.width + x) * 4 + 3];
          alphaSum += alpha;
          if (alpha > 8) opaquePixels += 1;
          if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
            edgePixels += 1;
            if (alpha > 8) edgeVisiblePixels += 1;
          }
        }
      }
      output[assetPath] = {
        alphaRatio: alphaSum / (255 * canvas.width * canvas.height),
        cornerAlphaMax: Math.max(...cornerAlphaValues),
        edgeVisibleRatio: edgeVisiblePixels / edgePixels,
        height: canvas.height,
        opaqueRatio: opaquePixels / (canvas.width * canvas.height),
        width: canvas.width
      };
    }
    return output;
  }, { version: weatherAssetVersion });

  const heads = {};
  for (const assetPath of Object.keys(records)) {
    const response = await page.request.head(`${baseUrl}${assetPath}?v=${weatherAssetVersion}`);
    heads[assetPath] = {
      cacheControl: response.headers()["cache-control"],
      contentLength: Number(response.headers()["content-length"]),
      contentType: response.headers()["content-type"],
      ok: response.ok(),
      status: response.status()
    };
  }
  return { heads, records };
}

async function collectRuntimePublication(page) {
  const response = await page.request.get(baseUrl);
  const html = await response.text();
  const bundleMatch = html.match(/src="([^"]*\/assets\/index-[^"]+\.js)"/);
  const cssMatch = html.match(/href="([^"]*\/assets\/index-[^"]+\.css)"/);
  return {
    bundle: bundleMatch?.[1] ?? "",
    css: cssMatch?.[1] ?? "",
    indexCacheControl: response.headers()["cache-control"] ?? "",
    indexOk: response.ok(),
    indexStatus: response.status()
  };
}

async function collectTerrainTileHeads(page) {
  const tilePaths = [
    "/assets/maps/battle-of-britain-3d/topo/8/128-85.jpg",
    "/assets/maps/battle-of-britain-3d/terrarium/8/128-85.png"
  ];
  const heads = {};
  for (const tilePath of tilePaths) {
    const response = await page.request.head(`${baseUrl}${tilePath}`);
    heads[tilePath] = {
      cacheControl: response.headers()["cache-control"],
      contentLength: Number(response.headers()["content-length"]),
      contentType: response.headers()["content-type"],
      ok: response.ok(),
      status: response.status()
    };
  }
  return heads;
}

async function collectDenseStageJitter(page) {
  const stages = [
    { id: "morning-dogfight", titleIncludes: "伦敦南侧空域混战" },
    { id: "afternoon-peak", titleIncludes: "下午高峰" }
  ];
  const output = {};

  for (const stage of stages) {
    await clickEvent(page, stage.titleIncludes);
    await page.waitForTimeout(900);
    const samples = await page.locator(".battle-of-britain").evaluate(async (shell) => {
      const rectFor = (element) => {
        const box = element?.getBoundingClientRect();
        return box
          ? {
              height: box.height,
              left: box.left,
              top: box.top,
              width: box.width
            }
          : null;
      };
      const measure = () => {
        const cameraLayer = shell.querySelector(".camera-layer");
        const terrainLayer = shell.querySelector('[data-testid="battle-of-britain-terrain-3d"]');
        const canvas = shell.querySelector('[data-testid="battle-of-britain-terrain-3d-canvas"]');
        const stageNode = shell.querySelector('[data-testid="map-stage"]');
        const dogfight = shell.querySelector('[data-testid="britain-morning-dogfight"], [data-testid="britain-afternoon-dogfight"]');
        const activeRoute = shell.querySelector(".front-line.is-active .front-route, .front-line .front-route");
        return {
          activeRouteRect: rectFor(activeRoute),
          cameraFocus: cameraLayer?.getAttribute("data-map-focus") ?? "",
          cameraTransform: cameraLayer?.getAttribute("transform") ?? "",
          canvasRect: rectFor(canvas),
          dogfightRect: rectFor(dogfight),
          mapCenter: terrainLayer?.getAttribute("data-map-center") ?? "",
          mapZoom: terrainLayer?.getAttribute("data-map-zoom") ?? "",
          registrationMaxError: Number(terrainLayer?.getAttribute("data-registration-max-error") ?? "999"),
          stageRect: rectFor(stageNode)
        };
      };

      return new Promise((resolve) => {
        const records = [];
        const tick = () => {
          records.push(measure());
          if (records.length >= 120) {
            resolve(records);
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });

    const uniqueCameraTransforms = new Set(samples.map((sample) => sample.cameraTransform)).size;
    const uniqueMapCenters = new Set(samples.map((sample) => sample.mapCenter)).size;
    const uniqueMapZooms = new Set(samples.map((sample) => sample.mapZoom)).size;
    const rectMaxDelta = (key) => {
      const values = samples.map((sample) => sample[key]).filter(Boolean);
      if (values.length === 0) return 999;
      const deltaFor = (field) => Math.max(...values.map((rect) => rect[field])) - Math.min(...values.map((rect) => rect[field]));
      return Math.max(deltaFor("height"), deltaFor("left"), deltaFor("top"), deltaFor("width"));
    };
    const maxCenterJump = (key) => {
      const centers = samples
        .map((sample) => sample[key])
        .filter(Boolean)
        .map((rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
      let maxJump = 0;
      for (let index = 1; index < centers.length; index += 1) {
        maxJump = Math.max(maxJump, Math.hypot(centers[index].x - centers[index - 1].x, centers[index].y - centers[index - 1].y));
      }
      return maxJump;
    };

    output[stage.id] = {
      cameraFocuses: [...new Set(samples.map((sample) => sample.cameraFocus))],
      dogfightCenterMaxJump: maxCenterJump("dogfightRect"),
      maxRegistrationError: Math.max(...samples.map((sample) => sample.registrationMaxError)),
      routeCenterMaxJump: maxCenterJump("activeRouteRect"),
      sampleCount: samples.length,
      stageRectMaxDelta: rectMaxDelta("stageRect"),
      terrainCanvasRectMaxDelta: rectMaxDelta("canvasRect"),
      uniqueCameraTransforms,
      uniqueMapCenters,
      uniqueMapZooms
    };
  }

  return output;
}

async function waitForTerrainReady(page) {
  await page.waitForFunction(
    () => document.querySelector('[data-testid="battle-of-britain-terrain-3d"]')?.getAttribute("data-terrain-loaded") === "true",
    undefined,
    { timeout: 30_000 }
  );
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
  await waitForTerrainReady(page);
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
  await waitForTerrainReady(page);

  const screenshots = [];
  const stageMetrics = {};
  for (const event of events) {
    await clickEvent(page, event.titleIncludes);
    const filePath = path.join(outDir, event.file);
    await page.screenshot({ path: filePath, fullPage: false });
    screenshots.push(filePath);
    const renderedStageColorGrade = collectRenderedStageColorGrade(
      await page.locator(".battle-of-britain [data-testid='map-stage']").screenshot()
    );
    stageMetrics[event.id] = {
      ...(await collectPageMetrics(page)),
      daylightColorGate: evaluateDaylightMapColorGate(renderedStageColorGrade),
      renderedStageColorGrade
    };
  }

  const metrics = {
    aircraftAssetVersion,
    musicAssetPath,
    weatherAssetVersion,
    baseUrl,
    checkedAt: new Date().toISOString(),
    consoleErrors,
    pageErrors,
    he111QualityBand,
    runtimePublication: await collectRuntimePublication(page),
    screenshots,
    stageMetrics,
    assetHeads: await collectAssetHeads(page),
    aircraftPngMetrics: await collectAssetMetrics(page),
    terrainTileHeads: await collectTerrainTileHeads(page),
    denseStageJitter: await collectDenseStageJitter(page),
    weatherPngMetrics: await collectWeatherAssetMetrics(page)
  };
  await fs.writeFile(path.join(outDir, "metrics.browser.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
