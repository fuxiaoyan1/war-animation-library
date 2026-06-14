import { inflateSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";
import {
  battleEvents as jutlandBattleEvents,
  campaignEnd as jutlandCampaignEnd,
  campaignStart as jutlandCampaignStart,
  frontLines as jutlandFrontLines,
  mapPoints as jutlandMapPoints
} from "../src/data/jutlandBattle";
import { createCampaignTimeline, toTime } from "../src/lib/campaignTimeline";
import * as alexanderData from "../src/data/alexanderConquests";
import * as atlanticConvoyData from "../src/data/atlanticConvoyBattle";
import * as battleOfFranceData from "../src/data/battleOfFrance";
import * as battleOfBritainData from "../src/data/battleOfBritain";
import * as bigWeekData from "../src/data/bigWeekAirBattle";
import * as bismarckSeaData from "../src/data/bismarckSeaAirBattle";
import * as cannaeData from "../src/data/cannaeBattle";
import * as caesarData from "../src/data/caesarWars";
import * as crusadesData from "../src/data/crusades";
import * as easternFrontData from "../src/data/easternFront";
import * as gaixiaData from "../src/data/gaixiaAmbush";
import * as guadalcanalData from "../src/data/guadalcanalNavalBattle";
import * as gulfWarData from "../src/data/gulfWar1991";
import * as jutlandData from "../src/data/jutlandBattle";
import * as koreanWarData from "../src/data/koreanWar";
import * as midwayData from "../src/data/midwayBattle";
import * as mongolData from "../src/data/mongolEmpire";
import * as napoleonicData from "../src/data/napoleonicWars";
import * as nianzhuangData from "../src/data/nianzhuangBattle";
import * as pacificWarData from "../src/data/pacificWar";
import * as punicData from "../src/data/punicWars";
import * as qinData from "../src/data/qinUnification";
import * as trafalgarData from "../src/data/trafalgarBattle";
import * as tsushimaData from "../src/data/tsushimaBattle";

const battleOfBritainAircraftAssetVersion = "20260614-he111-standard-v1";
const battleOfBritainAircraftGameIconQualityBand = {
  luminanceMean: { max: 150, min: 80 },
  luminanceStdDev: { max: 88, min: 46 },
  saturationMean: { max: 95, min: 45 },
  tailRootRearFuselageRgbDistance: { max: 32 },
  topBottomBalanceRatio: { min: 0.82 }
};

function decodeScreenshotPng(buffer: Buffer) {
  const signature = buffer.subarray(0, 8);
  if (!signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error("Playwright screenshot was not a PNG");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const chunks: Buffer[] = [];

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
    throw new Error(`Unsupported PNG screenshot format: ${width}x${height}, bitDepth=${bitDepth}, colorType=${colorType}`);
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

const jutlandTimeline = createCampaignTimeline({
  activeSpans: jutlandFrontLines.map(({ end, start }) => ({ end, start })),
  campaignEnd: jutlandCampaignEnd,
  campaignStart: jutlandCampaignStart,
  events: jutlandBattleEvents,
  points: jutlandMapPoints
});

type CampaignDataModule = {
  battleEvents: Array<{
    coordinates?: [number, number];
    date: string;
    detail?: string;
    id: string;
    mapFocus?: string[];
    phase?: string;
    summary?: string;
    title?: string;
  }>;
  campaignEnd: string;
  campaignStart: string;
  cueEventIds?: Set<string>;
  cueEventKinds?: Partial<Record<string, string>>;
  diveCueEventIds?: Set<string>;
  fragmentedLines?: Array<{
    id: string;
    revealAt?: string;
    visibleUntil?: string;
  }>;
  fortifiedLines?: Array<{
    id: string;
    revealAt?: string;
    visibleUntil?: string;
  }>;
  dogfightEffects?: Array<{
    center?: [number, number];
    end: string;
    id: string;
    routeIds?: string[];
    start: string;
    testId?: string;
    type: string;
  }>;
  torpedoAndDepthChargeEffects?: Array<{
    from: [number, number];
    fromRouteId?: string;
    id: string;
    showShellTraces?: boolean;
    to: [number, number];
    toRouteId?: string;
    type: string;
  }>;
  frontLines?: Array<{
    end: string;
    formationUnits?: Array<{
      badgeLabel?: string;
      coordinates?: [number, number];
      facingX?: -1 | 1;
      icon?: string;
      label?: string;
    }>;
    from: string;
    hideUnit?: boolean;
    id: string;
    positionAnchor?: string;
    positionAnchors?: string[];
    retainRouteTailRatio?: number;
    retainUnitAfterRouteEnd?: boolean;
    routeKind?: string;
    start: string;
    unitIcon?: string;
    unitGroupId?: string;
    unitVisibleFrom?: string;
    to: string;
    visibleFrom?: string;
    unitVisibleUntil?: string;
    visibleUntil?: string;
    waypoints?: Array<[number, number]>;
  }>;
  routes?: Array<{
    end: string;
    formationPrelude?: Array<[number, number]>;
    id: string;
    points?: Array<[number, number]>;
    positionAnchor?: string;
    routeKind?: string;
    start: string;
    unitVisibleUntil?: string;
    visibleUntil?: string;
  }>;
  mapPoints?: Array<{
    coordinates?: [number, number];
    id: string;
    revealAt?: string;
  }>;
};

const genericCampaignData: Array<[string, CampaignDataModule]> = [
  ["battleOfFrance", battleOfFranceData as CampaignDataModule],
  ["atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule],
  ["battleOfBritain", battleOfBritainData as CampaignDataModule],
  ["bigWeekAirBattle", bigWeekData as CampaignDataModule],
  ["bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule],
  ["easternFront", easternFrontData as CampaignDataModule],
  ["napoleonicWars", napoleonicData as CampaignDataModule],
  ["punicWars", punicData as CampaignDataModule],
  ["crusades", crusadesData as CampaignDataModule],
  ["mongolEmpire", mongolData as CampaignDataModule],
  ["qinUnification", qinData as CampaignDataModule],
  ["gaixiaAmbush", gaixiaData as unknown as CampaignDataModule],
  ["cannaeBattle", cannaeData as unknown as CampaignDataModule],
  ["alexanderConquests", alexanderData as CampaignDataModule],
  ["caesarWars", caesarData as CampaignDataModule],
  ["pacificWar", pacificWarData as CampaignDataModule],
  ["koreanWar", koreanWarData as CampaignDataModule],
  ["nianzhuangBattle", nianzhuangData as CampaignDataModule],
  ["gulfWar1991", gulfWarData as CampaignDataModule],
  ["tsushimaBattle", tsushimaData as CampaignDataModule],
  ["guadalcanalNavalBattle", guadalcanalData as CampaignDataModule],
  ["jutlandBattle", jutlandData as CampaignDataModule],
  ["trafalgarBattle", trafalgarData as CampaignDataModule]
];

const customCampaignData = [["midwayBattle", midwayData]] as const;

const intentionalQuietCombatLikeEvents = new Set([
  "desert-shield",
  "argument-outcome",
  "afternoon-warning",
  "evening-result",
  "fleet-contact",
  "sc122-first-contact",
  "wolfpacks-converge",
  "run-to-north",
  "battle-result",
  "songs-of-chu",
  "uxbridge-quiet-before-raid",
  "farewell"
]);

function expectDateWithinRange(label: string, date: string, start: string, end: string) {
  const value = toTime(date);
  expect(value, `${label} should not be before campaign start`).toBeGreaterThanOrEqual(toTime(start));
  expect(value, `${label} should not be after campaign end`).toBeLessThanOrEqual(toTime(end));
}

function expectEventsSortedByDate(campaignName: string, events: CampaignDataModule["battleEvents"]) {
  for (let index = 1; index < events.length; index += 1) {
    expect(
      toTime(events[index].date),
      `${campaignName} event order ${events[index - 1].id} -> ${events[index].id}`
    ).toBeGreaterThanOrEqual(toTime(events[index - 1].date));
  }
}

function eventLooksLikeCombat(event: CampaignDataModule["battleEvents"][number]) {
  const text = [event.id, event.title, event.phase, event.summary, event.detail].filter(Boolean).join(" ");
  const combatPattern = /会战|战役|战斗|攻势|反攻|突击|冲锋|合围|围攻|登陆|炮击|空袭|轰炸|雷击|命中|齐射|沉没|爆炸|巷战|决战|伏击|火控|突破|battle|strike/i;
  const quietPattern = /结束|投降|死亡|诀别|楚歌|胜利日|战果|损失|接触|侦察|起飞|启动|形成|抵达|转向|部署/i;

  return combatPattern.test(text) && !quietPattern.test(text);
}

function collectFailures(page: Page) {
  const apiFailures: string[] = [];
  const consoleErrors: string[] = [];

  page.on("response", (response) => {
    if (response.url().includes("/api/") && response.status() >= 400) {
      apiFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  return { apiFailures, consoleErrors };
}

async function expectCurrentEventInsideMapCore(page: Page) {
  if ((await page.getByTestId("gaixia-terrain-3d").count()) > 0) {
    await expect.poll(async () => Number(await page.getByTestId("gaixia-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
  }
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const eventBox = await page.locator(".event-pin.is-current > circle").first().boundingBox();

  expect(mapBox).not.toBeNull();
  expect(eventBox).not.toBeNull();

  const eventCenterX = (eventBox?.x ?? 0) + (eventBox?.width ?? 0) / 2;
  const eventCenterY = (eventBox?.y ?? 0) + (eventBox?.height ?? 0) / 2;
  const relativeX = (eventCenterX - (mapBox?.x ?? 0)) / (mapBox?.width ?? 1);
  const relativeY = (eventCenterY - (mapBox?.y ?? 0)) / (mapBox?.height ?? 1);

  expect(relativeX).toBeGreaterThan(0.18);
  expect(relativeX).toBeLessThan(0.87);
  expect(relativeY).toBeGreaterThan(0.12);
  expect(relativeY).toBeLessThan(0.84);
}

async function expectCurrentEventInBattleOfBritainCore(page: Page, options: { maxY?: number; minY?: number } = {}) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const eventBox = await page.locator(".event-pin.is-current > circle").first().boundingBox();

  expect(mapBox).not.toBeNull();
  expect(eventBox).not.toBeNull();

  const eventCenterX = (eventBox?.x ?? 0) + (eventBox?.width ?? 0) / 2;
  const eventCenterY = (eventBox?.y ?? 0) + (eventBox?.height ?? 0) / 2;
  const relativeX = (eventCenterX - (mapBox?.x ?? 0)) / (mapBox?.width ?? 1);
  const relativeY = (eventCenterY - (mapBox?.y ?? 0)) / (mapBox?.height ?? 1);

  expect(relativeX).toBeGreaterThan(0.16);
  expect(relativeX).toBeLessThan(0.84);
  expect(relativeY).toBeGreaterThan(options.minY ?? 0.14);
  expect(relativeY).toBeLessThan(options.maxY ?? 0.78);
}

async function expectLowImpactTicker(page: Page, backgroundPattern = /rgba\(5, 12, 14, 0\.16\)/) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const subtitleBox = await page.getByTestId("narration-subtitle").boundingBox();
  const legendBox = await page.locator(".map-legend").boundingBox();

  expect(mapBox).not.toBeNull();
  expect(subtitleBox).not.toBeNull();
  expect(legendBox).not.toBeNull();
  expect(subtitleBox?.height).toBeLessThan((mapBox?.height ?? 0) * 0.06);
  expect((subtitleBox?.y ?? 0) - (mapBox?.y ?? 0)).toBeGreaterThanOrEqual(0);
  expect((subtitleBox?.y ?? 0) - (mapBox?.y ?? 0)).toBeLessThan((mapBox?.height ?? 0) * 0.14);
  expect((subtitleBox?.x ?? 0) - (mapBox?.x ?? 0)).toBeGreaterThan((mapBox?.width ?? 0) * 0.32);
  expect((legendBox?.y ?? 0) - ((subtitleBox?.y ?? 0) + (subtitleBox?.height ?? 0))).toBeGreaterThanOrEqual(4);
  await expect(page.getByTestId("narration-subtitle")).toHaveCSS("background-color", backgroundPattern);
  await expect(page.getByTestId("narration-subtitle")).toHaveCSS("pointer-events", "none");
}

async function expectTimelineRailAlignedWithRange(page: Page) {
  const inputBox = await page.getByTestId("timeline").boundingBox();
  const railBox = await page.getByTestId("event-rail").boundingBox();

  expect(inputBox).not.toBeNull();
  expect(railBox).not.toBeNull();

  const inputBottom = (inputBox?.y ?? 0) + (inputBox?.height ?? 0);
  expect(Math.abs((railBox?.x ?? 0) - (inputBox?.x ?? 0))).toBeLessThan(2);
  expect(Math.abs((railBox?.width ?? 0) - (inputBox?.width ?? 0))).toBeLessThan(3);
  expect((railBox?.y ?? 0) - inputBottom).toBeGreaterThanOrEqual(-2);
  expect((railBox?.y ?? 0) - inputBottom).toBeLessThan(14);
}

async function expectMapFirstLayout(page: Page) {
  const viewport = page.viewportSize();
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const storyBox = await page.locator(".story-panel").first().boundingBox();
  const controlBox = await page.getByTestId("control-deck").boundingBox();
  const titleBox = await page.getByTestId("map-title-card").boundingBox();

  expect(viewport).not.toBeNull();
  expect(mapBox).not.toBeNull();
  expect(storyBox).not.toBeNull();
  expect(controlBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(controlBox?.height).toBeLessThan(82);
  expect(controlBox?.y).toBeLessThan(mapBox?.y ?? Number.POSITIVE_INFINITY);
  expect(mapBox?.width).toBeGreaterThan((viewport?.width ?? 0) * 0.86);
  expect(mapBox?.height).toBeGreaterThan((viewport?.height ?? 0) * 0.72);
  expect(storyBox?.y).toBeGreaterThan((mapBox?.y ?? 0) + (mapBox?.height ?? 0) - 1);
  expect(titleBox?.height).toBeLessThan(48);
  expect(titleBox?.width).toBeLessThan(460);
  await expect(page.getByTestId("map-title-card")).not.toContainText("全片按5分钟播放设计");
  await expectTimelineRailAlignedWithRange(page);
}

async function expectOnlyWarNameInMapTitle(page: Page, warName: string) {
  await expect(page.getByTestId("map-title-card")).toContainText(warName);
  await expect(page.getByTestId("map-title-card")).not.toContainText("全片按5分钟播放设计");
  await expect(page.getByTestId("map-title-card")).not.toContainText("短战争改用小时级时间轴");
  await expect(page.getByTestId("map-title-card")).not.toContainText("战术级大地图");
}

function visibleMapPoint(page: Page, mapBox: { height: number; width: number; x: number; y: number }, xRatio: number, yRatio: number) {
  const viewport = page.viewportSize();
  const x = Math.min(Math.max(mapBox.x + mapBox.width * xRatio, mapBox.x + 24), mapBox.x + mapBox.width - 24, (viewport?.width ?? mapBox.x + mapBox.width) - 24);
  const y = Math.min(Math.max(mapBox.y + mapBox.height * yRatio, mapBox.y + 24), mapBox.y + mapBox.height - 24, (viewport?.height ?? mapBox.y + mapBox.height) - 48);
  return { x, y };
}

async function expectMapCanMoveUnderPointer(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  const target = visibleMapPoint(page, mapBox!, 0.52, 0.48);
  const beforeWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  await page.mouse.move(target.x, target.y);
  await page.mouse.wheel(0, -620);
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).y).not.toBe(beforeWheel.y);
  const afterWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  expect(afterWheel.x).toBeCloseTo(beforeWheel.x, 1);
  expect(afterWheel.scale).toBeCloseTo(beforeWheel.scale, 3);

  const beforeDrag = await cameraLayer.getAttribute("transform");
  const dragStart = visibleMapPoint(page, mapBox!, 0.52, 0.48);
  const dragEnd = visibleMapPoint(page, mapBox!, 0.36, 0.38);
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => cameraLayer.getAttribute("transform")).not.toBe(beforeDrag);
}

async function expectMapCanMoveHorizontallyUnderPointer(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  const center = visibleMapPoint(page, mapBox!, 0.5, 0.5);
  await page.mouse.dblclick(center.x, center.y);
  const resetTransform = await expectMapResetSettles(page);

  const beforeShiftWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  const wheelTarget = visibleMapPoint(page, mapBox!, 0.52, 0.48);
  await page.mouse.move(wheelTarget.x, wheelTarget.y);
  await page.keyboard.down("Shift");
  await page.mouse.wheel(0, 520);
  await page.keyboard.up("Shift");
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).x).not.toBe(beforeShiftWheel.x);
  const afterShiftWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  expect(afterShiftWheel.y).toBeCloseTo(beforeShiftWheel.y, 1);
  expect(afterShiftWheel.scale).toBeCloseTo(beforeShiftWheel.scale, 3);

  await page.mouse.dblclick(center.x, center.y);
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe(resetTransform);
  const beforeDrag = parseMapTransform(await cameraLayer.getAttribute("transform"));
  const dragStart = visibleMapPoint(page, mapBox!, 0.58, 0.48);
  const dragEnd = visibleMapPoint(page, mapBox!, 0.36, 0.48);
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).x).not.toBe(beforeDrag.x);
}

async function expectMapZoomButtonsWork(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  await page.getByTestId("map-reset").click();
  const resetTransform = await expectMapResetSettles(page);
  const resetScale = parseMapTransform(resetTransform).scale;

  await page.getByTestId("map-zoom-in").click();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).scale).toBeGreaterThan(resetScale);
  await page.getByTestId("map-zoom-out").click();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).scale).toBeCloseTo(resetScale, 2);
  await page.getByTestId("map-zoom-in").click();
  await page.getByTestId("map-reset").click();
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe(resetTransform);
}

async function expectMapResetSettles(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  await expect.poll(async () => cameraLayer.getAttribute("transform")).not.toBeNull();
  const transform = await cameraLayer.getAttribute("transform");
  expect(transform).not.toBeNull();
  parseMapTransform(transform);
  return transform!;
}

function parseMapTransform(transform: string | null) {
  const match = transform?.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\) scale\((-?\d+(?:\.\d+)?)\)/);
  expect(match).not.toBeNull();
  return {
    x: Number(match?.[1]),
    y: Number(match?.[2]),
    scale: Number(match?.[3])
  };
}

async function expectTickerDoesNotBlockMapWheel(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const subtitleBox = await page.getByTestId("narration-subtitle").boundingBox();

  expect(mapBox).not.toBeNull();
  expect(subtitleBox).not.toBeNull();
  await page.mouse.dblclick((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.5, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.5);
  const resetTransform = await expectMapResetSettles(page);

  const beforeWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  const x = Math.min(
    (subtitleBox?.x ?? 0) + (subtitleBox?.width ?? 0) / 2,
    (mapBox?.x ?? 0) + (mapBox?.width ?? 0) - 24
  );
  const y = Math.min(
    (subtitleBox?.y ?? 0) + Math.min(8, (subtitleBox?.height ?? 0) / 2),
    (mapBox?.y ?? 0) + (mapBox?.height ?? 0) - 24
  );
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -420);
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).y).not.toBe(beforeWheel.y);
  const afterWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  expect(afterWheel.x).toBeCloseTo(beforeWheel.x, 1);
  expect(afterWheel.scale).toBeCloseTo(beforeWheel.scale, 3);
  await page.mouse.dblclick((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.5, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.5);
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe(resetTransform);
}

async function expectGaixiaRouteStaysInMapStage(page: Page, routeId: string) {
  const getVisibleRatio = () =>
    page.evaluate((targetRouteId) => {
      const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
      const route = document.querySelector(`[data-testid="gaixia-route-${targetRouteId}"]`)?.getBoundingClientRect();
      if (!stage || !route || route.width <= 0 || route.height <= 0) {
        return null;
      }

      const left = Math.max(stage.left, route.left);
      const right = Math.min(stage.right, route.right);
      const top = Math.max(stage.top, route.top);
      const bottom = Math.min(stage.bottom, route.bottom);
      const visibleWidth = Math.max(0, right - left);
      const visibleHeight = Math.max(0, bottom - top);
      return {
        areaRatio: (visibleWidth * visibleHeight) / Math.max(1, route.width * route.height),
        height: visibleHeight,
        width: visibleWidth
      };
    }, routeId);

  await expect
    .poll(async () => {
      const visibleRatio = await getVisibleRatio();
      return visibleRatio ? Math.min(visibleRatio.width, visibleRatio.height) : 0;
    }, {
      message: `route ${routeId} should intersect the tactical viewport after camera settles`
    })
    .toBeGreaterThan(6);
  const visibleRatio = await getVisibleRatio();

  expect(visibleRatio, `route ${routeId} should intersect the tactical viewport`).not.toBeNull();
  if (!visibleRatio) {
    throw new Error(`route ${routeId} should intersect the tactical viewport`);
  }
  expect(visibleRatio.areaRatio, `route ${routeId} should have a readable visible segment`).toBeGreaterThan(0.001);
  expect(visibleRatio.width).toBeGreaterThan(10);
  expect(visibleRatio.height).toBeGreaterThan(6);
}

async function expectGaixiaVisibleRouteCount(page: Page, minimumCount: number) {
  await expect.poll(async () => page.locator(".gaixia-route").count()).toBeGreaterThanOrEqual(minimumCount);
}

async function expectGaixiaVisibleUnitCount(page: Page, minimumCount: number) {
  await expect.poll(async () => page.locator(".gaixia-unit-holder").count()).toBeGreaterThanOrEqual(minimumCount);
}

async function expectGaixiaCurrentUnitsCentered(page: Page, label: string) {
  await page.waitForTimeout(1250);
  const placement = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    if (!stage) {
      return null;
    }
    const units = Array.from(document.querySelectorAll<SVGGElement>('.gaixia-route[data-route-current="true"] .gaixia-unit-holder'))
      .map((unit) => {
        const box = unit.getBoundingClientRect();
        return {
          x: ((box.left + box.right) / 2 - stage.left) / stage.width,
          y: ((box.top + box.bottom) / 2 - stage.top) / stage.height
        };
      })
      .filter((point) => point.x >= -0.08 && point.x <= 1.08 && point.y >= -0.08 && point.y <= 1.08);
    if (units.length === 0) {
      return null;
    }
    return {
      averageY: units.reduce((sum, unit) => sum + unit.y, 0) / units.length,
      count: units.length,
      maxY: Math.max(...units.map((unit) => unit.y)),
      minY: Math.min(...units.map((unit) => unit.y))
    };
  });

  expect(placement, `${label} should have current units in the tactical viewport`).not.toBeNull();
  expect(placement?.count, `${label} should have enough current units to judge camera centering`).toBeGreaterThanOrEqual(8);
  expect(placement?.averageY, `${label} current battle should not sit near the top edge`).toBeGreaterThanOrEqual(0.38);
  expect(placement?.averageY, `${label} current battle should not sit too low`).toBeLessThanOrEqual(0.6);
  expect(placement?.minY, `${label} current units should clear the title/subtitle band`).toBeGreaterThanOrEqual(0.18);
  expect(placement?.maxY, `${label} current units should remain in the map core`).toBeLessThanOrEqual(0.82);
}

async function expectGaixiaCompletedRouteLabelsHidden(page: Page) {
  await expect(page.locator(".gaixia-route.is-complete .gaixia-route-label")).toHaveCount(0);
}

async function expectGaixiaExpandedBattlefield(page: Page) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const gaixiaMap = page.locator(".gaixia-map");
  const svgBox = await gaixiaMap.boundingBox();
  const cameraTransform = parseMapTransform(await page.getByTestId("camera-layer").getAttribute("transform"));
  const viewport = page.viewportSize();

  expect(mapBox).not.toBeNull();
  expect(svgBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(mapBox?.height).toBeLessThan((viewport?.height ?? 900) * 1.08);
  expect(svgBox?.height).toBeLessThan((viewport?.height ?? 900) * 1.08);
  expect(cameraTransform.scale).toBeGreaterThanOrEqual(0.82);
  expect(cameraTransform.scale).toBeLessThanOrEqual(1.03);
  await expect(gaixiaMap).toHaveAttribute("viewBox", "0 0 1180 2816");
  await expect(gaixiaMap).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
  await expectCurrentEventInsideMapCore(page);
  await expectGaixiaPointInsideMapStage(page, "gaixia");
  await expectGaixiaBattlefieldFillsWideStage(page);
}

async function expectGaixiaBattlefieldFillsWideStage(page: Page) {
  const spread = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const elements = Array.from(document.querySelectorAll<SVGGraphicsElement>(".gaixia-region, .gaixia-river, .gaixia-contour, .gaixia-route, .gaixia-point"));
    const boxes = elements
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0 && stage && box.right > stage.left && box.left < stage.right && box.bottom > stage.top && box.top < stage.bottom);

    if (!stage || boxes.length === 0) {
      return null;
    }

    const left = Math.min(...boxes.map((box) => box.left));
    const right = Math.max(...boxes.map((box) => box.right));
    return {
      visibleCount: boxes.length,
      widthRatio: (right - left) / stage.width
    };
  });

  expect(spread).not.toBeNull();
  expect(spread?.visibleCount).toBeGreaterThanOrEqual(12);
  expect(spread?.widthRatio).toBeGreaterThan(0.78);
}

async function expectGaixiaUnitsUseCompactTacticalScale(page: Page) {
  const scale = await page.evaluate(() => {
    const unit = document.querySelector<SVGGElement>(".gaixia-unit-holder .gaixia-unit");
    const transform = unit ? window.getComputedStyle(unit).transform : "";
    const match = transform.match(/matrix\(([^,]+),/);
    return match ? Number(match[1]) : null;
  });

  expect(scale, "gaixia units should be scaled down for the larger tactical area").not.toBeNull();
  expect(scale).toBeGreaterThanOrEqual(0.56);
  expect(scale).toBeLessThanOrEqual(0.6);
}

async function expectGaixiaWebglTerrainIsRendered(page: Page) {
  const layer = page.getByTestId("gaixia-terrain-3d");
  await expect(layer).toBeVisible();
  await expect.poll(async () => Number(await layer.getAttribute("data-map-zoom"))).toBeGreaterThan(0);
  await expect(layer).toHaveAttribute("data-renderer", "maplibre-real-terrain");
  await expect(layer).toHaveAttribute("data-terrain-model", "real-dem-raster-terrain");
  await expect(layer).toHaveAttribute("data-tactical-renderer", "maplibre-geographic-overlay");
  await expect(layer).toHaveAttribute("data-visible-basemap", "drawn-historical-tactical-terrain");
  await expect(layer).toHaveAttribute("data-modern-imagery-visible", "false");
  await expect(layer).toHaveAttribute("data-terrain-exaggeration", "1");
  await expect(layer).toHaveAttribute("data-hillshade-exaggeration", "0.08");
  await expect(layer).toHaveAttribute("data-terrain-source", /\/assets\/maps\/gaixia-real-terrain\/terrarium\/\{z\}\/\{x\}-\{y\}\.png/);
  await expect(layer).toHaveAttribute("data-reference-imagery-source", /\/assets\/maps\/gaixia-real-terrain\/imagery\/\{z\}\/\{x\}-\{y\}\.jpg/);
  await expect(layer).toHaveAttribute("data-reference-imagery-cache-zoom", "16");
  await expect(layer).toHaveAttribute("data-reference-imagery-base-cache-zoom", "15");
  await expect(layer).toHaveAttribute("data-reference-imagery-detail-bounds", "117.14,33.02,117.82,33.58");
  await expect(layer).toHaveAttribute("data-terrain-tile-cache-zoom", "14");
  await expect(layer).toHaveAttribute("data-camera-mode", "stable-tactical-stages");
  await expect(layer).toHaveAttribute("data-camera-transition-ms", "1100");
  await expect(layer).toHaveAttribute("data-camera-zoom-boost", "0.00");
  await expect(layer).toHaveAttribute("data-camera-pitch", "54");
  await expect(layer).toHaveAttribute("data-route-fit-zoom", "disabled");
  await expect.poll(async () => await layer.getAttribute("data-map-raster-layer-ids")).toBe("");

  for (const tilePath of ["/assets/maps/gaixia-real-terrain/terrarium/14/13536-6580.png"]) {
    const response = await page.request.head(tilePath);
    expect(response.ok(), `${tilePath} should be available from the high-resolution local map cache`).toBe(true);
    expect(response.headers()["content-type"]).toContain("image");
    expect(Number(response.headers()["content-length"])).toBeGreaterThan(5_000);
  }

  const terrainStats = await page.getByTestId("gaixia-terrain-3d-canvas").evaluate((canvasElement) => {
    const canvas = canvasElement as HTMLCanvasElement;
    if (canvas.width === 0 || canvas.height === 0) {
      return null;
    }

    return {
      height: canvas.height,
      urlPrefix: canvas.toDataURL("image/png").slice(0, 30),
      width: canvas.width,
      webglContext: canvas.getContext("webgl2") ? "webgl2" : canvas.getContext("webgl") ? "webgl" : "none"
    };
  });

  expect(terrainStats).not.toBeNull();
  expect(terrainStats?.width).toBeGreaterThan(400);
  expect(terrainStats?.height).toBeGreaterThan(500);
  expect(terrainStats?.webglContext).toMatch(/webgl/);
  expect(terrainStats?.urlPrefix).toBe("data:image/png;base64,iVBORw0K");

  const mapRuntime = await layer.evaluate((element) => {
    const canvas = element.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
    return {
      canvasHeight: canvas?.height ?? 0,
      canvasWidth: canvas?.width ?? 0,
      clientHeight: canvas?.clientHeight ?? 0,
      clientWidth: canvas?.clientWidth ?? 0,
      maxZoom: Number(element.getAttribute("data-map-max-zoom") ?? 0),
      pixelRatio: Number(element.getAttribute("data-map-pixel-ratio") ?? 0),
      zoom: Number(element.getAttribute("data-map-zoom") ?? 0)
    };
  });

  expect(mapRuntime.maxZoom).toBeGreaterThanOrEqual(16);
  expect(mapRuntime.zoom).toBeGreaterThanOrEqual(10.75);
  expect(mapRuntime.pixelRatio).toBeGreaterThanOrEqual(1.95);
  expect(mapRuntime.canvasWidth).toBeGreaterThanOrEqual(mapRuntime.clientWidth * 1.95);
  expect(mapRuntime.canvasHeight).toBeGreaterThanOrEqual(mapRuntime.clientHeight * 1.95);
}

async function collectGaixiaCameraSamples(page: Page) {
  const terrain = page.getByTestId("gaixia-terrain-3d");
  const samples: Array<{ center: string; eventId: string; zoom: number }> = [];

  for (const event of gaixiaData.battleEvents) {
    await page.getByTestId("event-list").getByRole("button", { name: new RegExp(event.title) }).click();
    await expect(page.getByTestId("active-event-card")).toContainText(event.title);
    await expect.poll(async () => await terrain.getAttribute("data-map-center")).not.toBe("");
    await page.waitForTimeout(1250);
    samples.push({
      center: (await terrain.getAttribute("data-map-center")) ?? "",
      eventId: event.id,
      zoom: Number(await terrain.getAttribute("data-map-zoom"))
    });
  }

  return samples;
}

async function expectGaixiaCameraStaysSmooth(page: Page) {
  const samples = await collectGaixiaCameraSamples(page);
  const zooms = samples.map((sample) => sample.zoom);
  const maxZoom = Math.max(...zooms);
  const minZoom = Math.min(...zooms);
  const adjacentDelta = samples.slice(1).map((sample, index) => Math.abs(sample.zoom - samples[index].zoom));
  const uniqueCenters = new Set(samples.map((sample) => sample.center)).size;
  const byId = new Map(samples.map((sample) => [sample.eventId, sample]));
  const secondActClosePrep = byId.get("ten-sided-ring");
  const tenthHourClose = byId.get("songs-of-chu");
  const dawnClose = byId.get("dawn-assault");
  const pursuitStart = byId.get("xiangyu-breakout");
  const preTenthHourStageIds = ["han-counterpress-east-gap", "ten-sided-ring"];
  const closeStageIds = ["songs-of-chu", "farewell"];

  expect(secondActClosePrep, `missing pre-tenth-hour camera sample: ${JSON.stringify(samples)}`).toBeDefined();
  expect(tenthHourClose, `missing tenth-hour close camera sample: ${JSON.stringify(samples)}`).toBeDefined();
  expect(dawnClose, `missing dawn close camera sample: ${JSON.stringify(samples)}`).toBeDefined();
  expect(pursuitStart, `missing pursuit camera sample: ${JSON.stringify(samples)}`).toBeDefined();

  for (const eventId of preTenthHourStageIds) {
    const sample = byId.get(eventId);
    expect(sample, `missing pre-tenth-hour camera sample for ${eventId}: ${JSON.stringify(samples)}`).toBeDefined();
    expect(Math.abs((sample?.zoom ?? 0) - (secondActClosePrep?.zoom ?? 0)), `pre-tenth-hour events should stay at the broader encirclement zoom: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(0.04);
    expect(sample?.center, `pre-tenth-hour events should stay at the broader encirclement position: ${JSON.stringify(samples)}`).toBe(secondActClosePrep?.center);
  }

  const closeScaleRatio = Math.pow(2, (tenthHourClose?.zoom ?? 0) - (secondActClosePrep?.zoom ?? 0));
  expect(closeScaleRatio, `tenth-hour tactical zoom should be about 2x larger: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(1.9);

  for (const eventId of closeStageIds) {
    const sample = byId.get(eventId);
    expect(sample, `missing close tactical camera sample for ${eventId}: ${JSON.stringify(samples)}`).toBeDefined();
    expect(Math.abs((sample?.zoom ?? 0) - (tenthHourClose?.zoom ?? 0)), `close tactical stage should keep the same zoom from tenth hour through act three: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(0.04);
    expect(sample?.center, `close tactical stage should keep the same position from tenth hour through act three: ${JSON.stringify(samples)}`).toBe(tenthHourClose?.center);
  }
  expect(Math.abs((dawnClose?.zoom ?? 0) - (tenthHourClose?.zoom ?? 0)), `dawn close-up should keep the same 2x tactical zoom while following the action: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(0.04);
  expect(dawnClose?.center, `dawn close-up should pan, not return to the broader camera: ${JSON.stringify(samples)}`).not.toBe(secondActClosePrep?.center);

  expect(maxZoom - minZoom, `camera zoom range should stay controlled for a 2x close-up: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(1.08);
  expect(Math.max(...adjacentDelta), `adjacent event zoom jump should stay controlled for the planned tenth-hour close-up: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(1.08);
  expect(pursuitStart?.zoom, `pursuit should return to the previous broader tactical ratio: ${JSON.stringify(samples)}`).toBeLessThanOrEqual((tenthHourClose?.zoom ?? 0) - 0.65);
  expect(Math.abs((pursuitStart?.zoom ?? 0) - (secondActClosePrep?.zoom ?? 0)), `pursuit should restore the pre-close zoom ratio: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(0.12);
  expect(uniqueCenters, "gaixia should use a small number of tactical camera stages, not event-by-event reframing").toBeLessThanOrEqual(5);
}

async function expectGaixiaMapControlsDoNotCoverRealTerrain(page: Page) {
  const visualState = await page.evaluate(() => {
    const controlSvg = document.querySelector<SVGSVGElement>(".gaixia-map");
    const terrain = document.querySelector<HTMLElement>('[data-testid="gaixia-terrain-3d"]');
    const overlay = document.querySelector<SVGSVGElement>('[data-testid="gaixia-maplibre-tactical-overlay"]');
    const controlDeck = document.querySelector<HTMLElement>('[data-testid="control-deck"]');
    const timelineList = document.querySelector<HTMLElement>(".timeline-list");
    const bodyStyle = getComputedStyle(document.body);
    const controlStyle = controlSvg ? getComputedStyle(controlSvg) : null;
    const terrainStyle = terrain ? getComputedStyle(terrain) : null;
    const overlayStyle = overlay ? getComputedStyle(overlay) : null;
    const deckStyle = controlDeck ? getComputedStyle(controlDeck) : null;
    const timelineStyle = timelineList ? getComputedStyle(timelineList) : null;
    return {
      bodyBackground: bodyStyle.backgroundImage,
      controlBackground: controlStyle?.backgroundColor ?? "",
      controlDeckBackground: deckStyle?.backgroundColor ?? "",
      controlZIndex: Number(controlStyle?.zIndex ?? 0),
      overlayZIndex: Number(overlayStyle?.zIndex ?? 0),
      terrainZIndex: Number(terrainStyle?.zIndex ?? 0),
      timelineBackground: timelineStyle?.backgroundColor ?? ""
    };
  });

  expect(visualState.controlBackground).toBe("rgba(0, 0, 0, 0)");
  expect(visualState.terrainZIndex).toBeLessThan(visualState.overlayZIndex);
  expect(visualState.overlayZIndex).toBeLessThan(visualState.controlZIndex);
  expect(visualState.bodyBackground).toContain("rgb(18, 25, 24)");
  expect(visualState.controlDeckBackground).toContain("rgba(11, 18, 18, 0.72)");
  expect(visualState.timelineBackground).toContain("rgba(11, 18, 18, 0.72)");
}

async function expectGaixiaMapViewDrivesTerrainCamera(page: Page) {
  const stageBox = await page.getByTestId("map-stage").boundingBox();
  const terrain = page.getByTestId("gaixia-terrain-3d");
  expect(stageBox).not.toBeNull();

  const center = visibleMapPoint(page, stageBox!, 0.5, 0.5);
  await page.mouse.dblclick(center.x, center.y);
  await expectMapResetSettles(page);
  const before = await terrain.getAttribute("data-map-center");
  expect(before).not.toBeNull();

  const dragStart = visibleMapPoint(page, stageBox!, 0.62, 0.5);
  const dragEnd = visibleMapPoint(page, stageBox!, 0.38, 0.42);
  await page.mouse.move(dragStart.x, dragStart.y);
  await page.mouse.down();
  await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 8 });
  await page.mouse.up();

  await expect.poll(async () => await terrain.getAttribute("data-map-center")).not.toBe(before);
  await page.mouse.dblclick(center.x, center.y);
  await expectMapResetSettles(page);
}

async function expectGaixiaPointInsideMapStage(page: Page, pointId: string) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const pointBox = await page.getByTestId(`gaixia-point-${pointId}`).boundingBox();

  expect(mapBox).not.toBeNull();
  expect(pointBox).not.toBeNull();
  const centerX = (pointBox?.x ?? 0) + (pointBox?.width ?? 0) / 2;
  const centerY = (pointBox?.y ?? 0) + (pointBox?.height ?? 0) / 2;
  expect(centerX).toBeGreaterThan((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.18);
  expect(centerX).toBeLessThan((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.88);
  expect(centerY).toBeGreaterThan((mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.16);
  expect(centerY).toBeLessThan((mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.88);
}

async function expectGaixiaUsesSingleMapLibreTacticalMap(page: Page) {
  await expect(page.getByTestId("gaixia-maplibre-tactical-overlay")).toBeVisible();
  await expect(page.getByTestId("gaixia-maplibre-tactical-overlay")).toHaveAttribute("data-projection", "maplibre-real-terrain");
  await expect(page.getByTestId("camera-layer")).toHaveAttribute("data-projection", "maplibre-control-only");
  await expect(page.getByTestId("gaixia-tactical-ground")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-svg-terrain-reference")).toHaveCount(0);
  await expect(page.locator(".gaixia-sandbox-top")).toHaveCount(0);
  await expect(page.locator(".gaixia-sandbox-grid-line")).toHaveCount(0);
}

async function expectGaixiaCompletedRoutesRemainColored(page: Page) {
  const states = await page.evaluate(() =>
    Array.from(document.querySelectorAll<SVGGElement>(".gaixia-route.is-complete")).map((route) => {
      const line = route.querySelector<SVGPathElement>(".gaixia-route-line");
      const unit = route.querySelector<SVGGElement>(".gaixia-unit-holder");
      const lineStyle = line ? window.getComputedStyle(line) : null;
      const unitStyle = unit ? window.getComputedStyle(unit) : null;
      return {
        id: route.getAttribute("data-route-id"),
        routeOpacity: Number(window.getComputedStyle(route).opacity),
        lineOpacity: lineStyle ? Number(lineStyle.strokeOpacity) : 1,
        unitOpacity: unitStyle ? Number(unitStyle.opacity) : null,
        unitVisible: route.getAttribute("data-unit-visible") === "true"
      };
    })
  );

  expect(states.length, "gaixia should keep prior colored tactical routes as context").toBeGreaterThan(0);
  for (const state of states) {
    expect(state.routeOpacity, `${state.id} should not turn into a grey destroyed-route ghost`).toBeGreaterThanOrEqual(0.95);
    expect(state.lineOpacity, `${state.id} line should remain readable and faction-colored`).toBeGreaterThanOrEqual(0.6);
    if (state.unitVisible) {
      expect(state.unitOpacity, `${state.id} unit should stay fully colored while retained`).toBeGreaterThanOrEqual(0.95);
    }
  }
}

async function expectGaixiaMeleeEffectBetweenVisibleUnits(page: Page) {
  const alignment = await page.evaluate(() => {
    const effect = document.querySelector<SVGGElement>('[data-testid="gaixia-melee-effect"]');
    if (!effect) {
      return null;
    }
    const hanRouteId = effect.getAttribute("data-han-route") ?? "";
    const chuRouteId = effect.getAttribute("data-chu-route") ?? "";
    const hanUnit = document.querySelector<SVGGElement>(`[data-testid^="gaixia-route-unit-${hanRouteId}-"]`);
    const chuUnit = document.querySelector<SVGGElement>(`[data-testid^="gaixia-route-unit-${chuRouteId}-"]`);
    const pointFromMatrix = (element: SVGGElement | null) => {
      const matrix = element?.getScreenCTM();
      return matrix ? { x: matrix.e, y: matrix.f } : null;
    };
    const point = pointFromMatrix(effect);
    const han = pointFromMatrix(hanUnit);
    const chu = pointFromMatrix(chuUnit);
    if (!hanRouteId || !chuRouteId || !point || !han || !chu) {
      return null;
    }

    const midpoint = {
      x: (han.x + chu.x) / 2,
      y: (han.y + chu.y) / 2
    };
    return {
      chuRouteId,
      distanceFromMidpoint: Math.hypot(point.x - midpoint.x, point.y - midpoint.y),
      hanRouteId,
      source: effect.getAttribute("data-effect-source")
    };
  });

  expect(alignment, "gaixia melee effect should bind to visible Han and Chu units").not.toBeNull();
  expect(alignment?.source).toBe("route-contact");
  expect(alignment?.hanRouteId).not.toBe("");
  expect(alignment?.chuRouteId).not.toBe("");
  expect(alignment?.distanceFromMidpoint).toBeLessThan(6);
}

async function expectGaixiaDawnAssaultHasContestedCampBreakthrough(page: Page) {
  const contestedState = await page.evaluate(() => {
    const currentRoutes = Array.from(document.querySelectorAll<SVGGElement>('.gaixia-route[data-route-current="true"]'));
    const currentRouteIds = currentRoutes.map((route) => route.getAttribute("data-route-id") ?? "");
    const visibleChuDefenders = currentRoutes
      .filter((route) => route.getAttribute("data-unit-visible") === "true")
      .filter((route) => route.classList.contains("gaixia-route-chu"))
      .map((route) => route.getAttribute("data-route-id") ?? "");
    const contactEffects = Array.from(document.querySelectorAll<SVGGElement>('[data-testid="gaixia-melee-effect"]')).map((effect) => ({
      chuRoute: effect.getAttribute("data-chu-route") ?? "",
      hanRoute: effect.getAttribute("data-han-route") ?? "",
      source: effect.getAttribute("data-effect-source") ?? ""
    }));

    return {
      contactEffects,
      currentRouteIds,
      visibleChuDefenders
    };
  });

  expect(contestedState.currentRouteIds, "dawn assault should explicitly include Chu inner-camp resistance routes").toEqual(
    expect.arrayContaining(["chu-inner-rearguard-stand", "chu-south-gate-rearguard", "chu-east-gate-rearguard"])
  );
  expect(contestedState.visibleChuDefenders, "dawn assault should show Chu defenders in the camp, not only Xiang Yu's breakout route").toEqual(
    expect.arrayContaining(["chu-inner-rearguard-stand", "chu-south-gate-rearguard", "chu-east-gate-rearguard"])
  );
  expect(contestedState.contactEffects.length, "dawn assault should show multiple melee contact points across the camp").toBeGreaterThanOrEqual(3);
  expect(Array.from(new Set(contestedState.contactEffects.map((effect) => effect.chuRoute))), "dawn melee effects should bind to multiple Chu defenders").toEqual(
    expect.arrayContaining(["chu-inner-rearguard-stand", "chu-south-gate-rearguard", "chu-east-gate-rearguard"])
  );
  expect(contestedState.contactEffects[0]?.chuRoute, "primary dawn melee contact should not be the breakout route").not.toBe("chu-breakout-southeast");
  expect(contestedState.contactEffects.every((effect) => effect.source === "route-contact"), "dawn melee effects should be route-bound contacts").toBe(true);
}

async function expectRealisticUnitIcon(
  page: Page,
  markerTestId:
    | "cannon-marker"
    | "britain-hurricane-marker"
    | "britain-spitfire-marker"
    | "cannae-african-infantry-marker"
    | "cannae-carthaginian-cavalry-marker"
    | "cannae-carthaginian-command-marker"
    | "cannae-carthaginian-infantry-marker"
    | "cannae-iberian-gaul-infantry-marker"
    | "cannae-numidian-cavalry-marker"
    | "cannae-roman-cavalry-marker"
    | "cannae-roman-command-marker"
    | "cannae-roman-legion-marker"
    | "carrier-essex-marker"
    | "carrier-marker"
    | "cavalry-marker"
    | "chariot-marker"
    | "fighter-marker"
    | "infantry-marker"
    | "infantry-pva-marker"
    | "sabre-marker"
    | "ship-marker"
    | "tank-korean-marker"
    | "tank-marker"
    | "trafalgar-british-line-marker"
    | "trafalgar-bucentaure-marker"
    | "trafalgar-french-line-marker"
    | "trafalgar-hms-victory-marker"
    | "trafalgar-royal-sovereign-marker"
    | "trafalgar-santisima-trinidad-marker"
    | "warship-marker"
    | "luftwaffe-bf109-marker"
    | "luftwaffe-bf110-marker"
    | "luftwaffe-do17-marker"
    | "luftwaffe-he111-marker"
    | "ww2-attack-aircraft-marker"
    | "ww2-bomber-marker"
    | "ww2-escort-ship-marker"
    | "ww2-fighter-marker"
    | "ww2-submarine-marker"
    | "ww2-transport-ship-marker",
  expectedAssetKind:
    | "cannon"
    | "britainHurricane"
    | "britainSpitfire"
    | "cannaeAfricanInfantry"
    | "cannaeCarthaginianCavalry"
    | "cannaeCarthaginianCommand"
    | "cannaeCarthaginianInfantry"
    | "cannaeIberianGaulInfantry"
    | "cannaeNumidianCavalry"
    | "cannaeRomanCavalry"
    | "cannaeRomanCommand"
    | "cannaeRomanLegion"
    | "carrier"
    | "carrierEssex"
    | "cavalry"
    | "chariot"
    | "fighter"
    | "infantry"
    | "infantryPva"
    | "sabre"
    | "ship"
    | "tank"
    | "tankKorean"
    | "trafalgarBritishLine"
    | "trafalgarBucentaure"
    | "trafalgarFrenchLine"
    | "trafalgarHmsVictory"
    | "trafalgarRoyalSovereign"
    | "trafalgarSantisimaTrinidad"
    | "warship"
    | "luftwaffeBf109"
    | "luftwaffeBf110"
    | "luftwaffeDo17"
    | "luftwaffeHe111"
    | "ww2AttackAircraft"
    | "ww2Bomber"
    | "ww2EscortShip"
    | "ww2Fighter"
    | "ww2Submarine"
    | "ww2TransportShip",
  expectedAssetPath?:
    | "cannon"
    | "britain-hurricane"
    | "britain-spitfire"
    | "cannae-african-infantry"
    | "cannae-carthaginian-cavalry"
    | "cannae-carthaginian-command"
    | "cannae-carthaginian-infantry"
    | "cannae-iberian-gaul-infantry"
    | "cannae-numidian-cavalry"
    | "cannae-roman-cavalry"
    | "cannae-roman-command"
    | "cannae-roman-legion"
    | "carrier"
    | "carrier-essex"
    | "carrierEssex"
    | "cavalry"
    | "chariot"
    | "fighter"
    | "infantry"
    | "infantry-pva"
    | "infantryPva"
    | "sabre"
    | "ship"
    | "tank"
    | "tank-korean"
    | "tankKorean"
    | "trafalgar-british-line"
    | "trafalgar-bucentaure"
    | "trafalgar-french-line"
    | "trafalgar-hms-victory"
    | "trafalgar-royal-sovereign"
    | "trafalgar-santisima-trinidad"
    | "warship"
    | "luftwaffe-bf109"
    | "luftwaffe-bf110"
    | "luftwaffe-do17"
    | "luftwaffe-he111"
    | "ww2-attack-aircraft"
    | "ww2-bomber"
    | "ww2-escort-ship"
    | "ww2-fighter"
    | "ww2-submarine"
    | "ww2-transport-ship",
  extension: "png" | "webp" = "webp"
) {
  const assetPath = expectedAssetPath ?? expectedAssetKind;
  const expectedHref = `/assets/unit-icons/${assetPath}.${extension}`;
  const expectedDomHref = expectedAssetKind.startsWith("britain") || expectedAssetKind.startsWith("luftwaffe")
    ? `${expectedHref}?v=${battleOfBritainAircraftAssetVersion}`
    : expectedHref;
  const marker = page.getByTestId(markerTestId).first();
  await expect(marker).toBeVisible();
  const image = marker.locator(".unit-icon-image");
  await expect(image).toHaveAttribute("data-asset-kind", expectedAssetKind);
  await expect(image).toHaveAttribute("href", expectedDomHref);

  const assetResponse = await page.request.head(expectedHref);
  expect(assetResponse.ok()).toBe(true);
  expect(assetResponse.headers()["content-type"]).toContain("image");
  const minimumContentLength = expectedAssetKind.startsWith("trafalgar")
    ? 12_000
    : expectedAssetKind === "ww2TransportShip" || expectedAssetKind === "ww2EscortShip" || expectedAssetKind === "ww2Submarine"
      ? 6_000
    : expectedAssetKind === "infantry"
      ? 18_000
      : expectedAssetKind === "infantryPva"
        ? 12_000
        : 4_000;
  expect(Number(assetResponse.headers()["content-length"])).toBeGreaterThan(minimumContentLength);
}

async function expectTransparentTrafalgarShipAsset(page: Page, assetPath: string) {
  const stats = await page.evaluate(async (path) => {
    const image = new Image();
    image.src = path;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("2d canvas unavailable");
    }

    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let opaque = 0;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = pixels[(y * canvas.width + x) * 4 + 3];
        if (alpha > 8) {
          opaque += 1;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return {
      alphaRatio: opaque / (canvas.width * canvas.height),
      bboxHeightRatio: (maxY - minY + 1) / canvas.height,
      bboxWidthRatio: (maxX - minX + 1) / canvas.width,
      height: canvas.height,
      opaque,
      width: canvas.width
    };
  }, assetPath);

  expect(stats.width).toBe(900);
  expect(stats.height).toBe(360);
  expect(stats.opaque).toBeGreaterThan(65_000);
  expect(stats.alphaRatio).toBeGreaterThan(0.18);
  expect(stats.alphaRatio).toBeLessThan(0.31);
  expect(stats.bboxWidthRatio).toBeGreaterThan(0.7);
  expect(stats.bboxHeightRatio).toBeLessThan(0.72);
}

async function expectRouteBadgeLabels(page: Page, routeId: string, expectedLabels: string[]) {
  const labels = await page
    .locator(`.front-line[data-route-id="${routeId}"] .unit-faction-badge`)
    .evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-badge-label")));

  expect(labels).toEqual(expectedLabels);
}

async function expectNoUnitBadgeLabels(page: Page, forbiddenLabels: string[]) {
  const labels = await page
    .locator(".unit-faction-badge")
    .evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-badge-label")).filter(Boolean));

  for (const forbiddenLabel of forbiddenLabels) {
    expect(labels).not.toContain(forbiddenLabel);
  }
}

async function expectRealisticUnitAsset(
  page: Page,
  expectedAssetKind:
    | "cannon"
    | "carrier"
    | "carrier-essex"
    | "cavalry"
    | "chariot"
    | "fighter"
    | "infantry"
    | "infantry-pva"
    | "sabre"
    | "ship"
    | "tank"
    | "tank-korean"
) {
  const assetResponse = await page.request.head(`/assets/unit-icons/${expectedAssetKind}.webp`);
  expect(assetResponse.ok()).toBe(true);
  expect(assetResponse.headers()["content-type"]).toContain("image");
  expect(Number(assetResponse.headers()["content-length"])).toBeGreaterThan(12_000);
}

async function expectTransparentMarkerAsset(
  page: Page,
  assetPath: string,
  expectedSize: { height: number; width: number } = { height: 360, width: 900 },
  options: { maxAlphaRatio?: number; maxBboxHeightRatio?: number; minOpaquePixels?: number; minVisibleMean?: number } = {}
) {
  const stats = await page.evaluate(async (path) => {
    const image = new Image();
    image.src = path;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("2d canvas unavailable");
    }

    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let opaque = 0;
    let visibleLuma = 0;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = pixels[(y * canvas.width + x) * 4 + 3];
        if (alpha > 8) {
          const offset = (y * canvas.width + x) * 4;
          visibleLuma += (pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722) / 255;
          opaque += 1;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }

    return {
      alphaRatio: opaque / (canvas.width * canvas.height),
      bboxHeightRatio: (maxY - minY + 1) / canvas.height,
      bboxWidthRatio: (maxX - minX + 1) / canvas.width,
      height: canvas.height,
      meanVisibleLuma: opaque > 0 ? visibleLuma / opaque : 0,
      opaque,
      width: canvas.width
    };
  }, assetPath);

  expect(stats.width).toBe(expectedSize.width);
  expect(stats.height).toBe(expectedSize.height);
  expect(stats.opaque).toBeGreaterThan(options.minOpaquePixels ?? 18_000);
  expect(stats.alphaRatio).toBeGreaterThan(0.05);
  expect(stats.alphaRatio).toBeLessThan(options.maxAlphaRatio ?? (assetPath.includes("chariot") ? 0.38 : 0.32));
  expect(stats.bboxWidthRatio).toBeGreaterThan(0.42);
  expect(stats.bboxHeightRatio).toBeLessThan(options.maxBboxHeightRatio ?? 0.76);
  expect(stats.meanVisibleLuma, `${assetPath} should not regress to a near-black silhouette`).toBeGreaterThan(options.minVisibleMean ?? 0.16);
}

async function expectTsushimaWarshipScale(page: Page) {
  const marker = page.locator(".tsushima-battle .warship-marker").first();
  await expect(marker).toBeVisible();

  const transform = await marker.evaluate((element) => getComputedStyle(element).transform);
  const matrix = transform.match(/matrix\(([^)]+)\)/);
  expect(matrix).not.toBeNull();
  const scaleX = Number(matrix![1].split(",")[0]);
  expect(scaleX).toBeCloseTo(0.42, 2);

  const markerBox = await marker.boundingBox();
  expect(markerBox).not.toBeNull();
  expect(markerBox?.width).toBeGreaterThan(56);
  expect(markerBox?.width).toBeLessThan(88);
}

async function formationUnitCenters(page: Page, routeId: string) {
  return page.locator(`.front-line[data-route-id="${routeId}"] .formation-unit`).evaluateAll((units) =>
    units.map((unit) => {
      const transform = unit.getAttribute("transform") ?? "";
      const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
      return {
        label: unit.getAttribute("data-ship-label") ?? "",
        x: Number(match?.[1] ?? Number.NaN),
        y: Number(match?.[2] ?? Number.NaN)
      };
    })
  );
}

async function formationUnitRouteProgresses(page: Page, routeId: string) {
  return page.locator(`.front-line[data-route-id="${routeId}"] .formation-unit`).evaluateAll((units) =>
    units.map((unit) => ({
      label: unit.getAttribute("data-ship-label") ?? "",
      routeProgress: Number(unit.getAttribute("data-unit-route-progress") ?? Number.NaN)
    }))
  );
}

function expectLeadShipIsMostForward(
  units: Array<{ label: string; x: number; y: number }>,
  leadLabel: string,
  axis: "x" | "y",
  direction: "higher" | "lower" = "higher"
) {
  const lead = units.find((unit) => unit.label === leadLabel);
  expect(lead).toBeTruthy();
  const leadPosition = lead![axis];
  const otherPositions = units.filter((unit) => unit.label !== leadLabel).map((unit) => unit[axis]);

  if (direction === "higher") {
    expect(leadPosition).toBeGreaterThan(Math.max(...otherPositions));
  } else {
    expect(leadPosition).toBeLessThan(Math.min(...otherPositions));
  }
}

function expectFormationHasTravelSpread(units: Array<{ label: string; x: number; y: number }>, axis: "x" | "y", minimumSpread: number) {
  const positions = units.map((unit) => unit[axis]);
  expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(minimumSpread);
}

function expectFormationUsesColumnProgression(units: Array<{ label: string; routeProgress: number }>, minimumSpread: number) {
  expect(units.length).toBeGreaterThan(1);
  const progresses = units.map((unit) => unit.routeProgress);
  expect(progresses.every((value) => Number.isFinite(value))).toBe(true);
  expect(Math.max(...progresses) - Math.min(...progresses)).toBeGreaterThan(minimumSpread);
}

async function expectTsushimaRoutesStayOffLand(page: Page) {
  const routeHits = await page.evaluate(() => {
    const landRegions = [...document.querySelectorAll(".tsushima-battle .country-core")].filter(
      (element): element is SVGGeometryElement => element instanceof SVGGeometryElement
    );

    return [...document.querySelectorAll(".tsushima-battle .front-line.route-sea .front-route")]
      .map((route) => {
        if (!(route instanceof SVGGeometryElement)) {
          return { hits: 0, routeId: "unknown" };
        }

        const routeId = route.closest(".front-line")?.getAttribute("data-route-id") ?? "unknown";
        const length = route.getTotalLength();
        let hits = 0;

        for (let index = 1; index < 30; index += 1) {
          const point = route.getPointAtLength((length * index) / 30);
          if (landRegions.some((region) => region.isPointInFill(new DOMPoint(point.x, point.y)))) {
            hits += 1;
          }
        }

        return { hits, routeId };
      })
      .filter((route) => route.hits > 0);
  });

  expect(routeHits).toEqual([]);
}

async function expectPunicSeaRoutesAndShipsStayOffLand(page: Page) {
  const routeHits = await page.evaluate(() => {
    const landRegions = [...document.querySelectorAll(".punic-wars .country-core")].filter(
      (element): element is SVGGeometryElement => element instanceof SVGGeometryElement
    );

    return [...document.querySelectorAll(".punic-wars .front-line.route-sea")]
      .flatMap((line) => {
        const route = line.querySelector(".front-route");
        const routeId = line.getAttribute("data-route-id") ?? "unknown";
        const hits: Array<{ kind: string; routeId: string; sample: number }> = [];

        if (route instanceof SVGGeometryElement) {
          const length = route.getTotalLength();
          for (let index = 1; index < 36; index += 1) {
            const point = route.getPointAtLength((length * index) / 36);
            if (landRegions.some((region) => region.isPointInFill(new DOMPoint(point.x, point.y)))) {
              hits.push({ kind: "route", routeId, sample: index });
            }
          }
        }

        const shipTransform = line.querySelector(".formation-unit")?.getAttribute("transform") ?? "";
        const shipMatch = shipTransform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
        if (shipMatch) {
          const point = new DOMPoint(Number(shipMatch[1]), Number(shipMatch[2]));
          if (landRegions.some((region) => region.isPointInFill(point))) {
            hits.push({ kind: "ship", routeId, sample: 0 });
          }
        }

        return hits;
      });
  });

  expect(routeHits).toEqual([]);
}

async function expectUnitMarkersDoNotAnimate(page: Page) {
  const animations = await page.locator(".unit-marker").evaluateAll((markers) =>
    markers.map((marker) => getComputedStyle(marker).animationName).filter((name) => name !== "none")
  );

  expect(animations).toEqual([]);
}

async function expectActiveRoutePromptHasSmallPulse(page: Page, routeId: string) {
  const animationName = await page
    .locator(`.front-line[data-route-id="${routeId}"] > circle`)
    .first()
    .evaluate((circle) => getComputedStyle(circle).animationName);

  expect(animationName).toBe("breathe");
}

async function visibleFleetRouteIds(page: Page, shellSelector: string) {
  return page
    .locator(`${shellSelector} .front-line[data-unit-visible="true"]`)
    .evaluateAll((routes) => routes.map((route) => route.getAttribute("data-route-id")).filter((routeId): routeId is string => Boolean(routeId)));
}

async function renderedRouteIds(page: Page, shellSelector: string) {
  return page
    .locator(`${shellSelector} .front-line`)
    .evaluateAll((routes) =>
      routes
        .filter((route) => route.getAttribute("data-route-visible") !== "false")
        .map((route) => route.getAttribute("data-route-id"))
        .filter((routeId): routeId is string => Boolean(routeId))
    );
}

async function expectVisibleTsushimaFleetRoutes(page: Page, expectedRouteIds: string[]) {
  const visibleRoutes = await visibleFleetRouteIds(page, ".tsushima-battle");

  expect(visibleRoutes).toEqual(expectedRouteIds);
}

async function expectNavalRoutesStayOffLand(page: Page, shellSelector: string) {
  const routeHits = await page.evaluate((selector) => {
    const landRegions = [...document.querySelectorAll(`${selector} .country-core`)].filter(
      (element): element is SVGGeometryElement => element instanceof SVGGeometryElement
    );

    return [...document.querySelectorAll(`${selector} .front-line.route-sea`)].flatMap((line) => {
      const route = line.querySelector(".front-route");
      const routeId = line.getAttribute("data-route-id") ?? "unknown";
      const hits: Array<{ kind: string; routeId: string; sample: number }> = [];

      if (route instanceof SVGGeometryElement) {
        const length = route.getTotalLength();
        for (let index = 1; index < 48; index += 1) {
          const point = route.getPointAtLength((length * index) / 48);
          if (landRegions.some((region) => region.isPointInFill(new DOMPoint(point.x, point.y)))) {
            hits.push({ kind: "route", routeId, sample: index });
          }
        }
      }

      [...line.querySelectorAll(".formation-unit")].forEach((unit, index) => {
        const transform = unit.getAttribute("transform") ?? "";
        const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
        if (!match) {
          return;
        }

        const point = new DOMPoint(Number(match[1]), Number(match[2]));
        if (landRegions.some((region) => region.isPointInFill(point))) {
          hits.push({ kind: "ship", routeId, sample: index });
        }

        const marker = unit.querySelector(".unit-marker");
        if (marker instanceof SVGGraphicsElement) {
          const box = marker.getBBox();
          const matrix = marker.getCTM();
          if (!matrix) {
            return;
          }

          const samplePoints = [
            [box.x, box.y],
            [box.x + box.width, box.y],
            [box.x, box.y + box.height],
            [box.x + box.width, box.y + box.height],
            [box.x + box.width / 2, box.y],
            [box.x + box.width / 2, box.y + box.height],
            [box.x, box.y + box.height / 2],
            [box.x + box.width, box.y + box.height / 2]
          ];
          const touchesLand = samplePoints
            .map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix))
            .some((samplePoint) => landRegions.some((region) => region.isPointInFill(samplePoint)));
          if (touchesLand) {
            hits.push({ kind: "ship-bbox", routeId, sample: index });
          }
        }
      });

      return hits;
    });
  }, shellSelector);

  expect(routeHits).toEqual([]);
}

async function expectWarshipScale(page: Page, shellSelector: string, expectedScale: number) {
  const marker = page.locator(`${shellSelector} .warship-marker`).first();
  await expect(marker).toBeVisible();

  const transform = await marker.evaluate((element) => getComputedStyle(element).transform);
  const matrix = transform.match(/matrix\(([^)]+)\)/);
  expect(matrix).not.toBeNull();
  const scaleX = Number(matrix![1].split(",")[0]);
  expect(scaleX).toBeCloseTo(expectedScale, 2);

  const markerBox = await marker.boundingBox();
  expect(markerBox).not.toBeNull();
  expect(markerBox?.width).toBeGreaterThan(42);
  expect(markerBox?.width).toBeLessThan(108);
}

async function expectRouteHasPolylineComplexity(page: Page, shellSelector: string, routeId: string, minimumSegments: number) {
  const segmentCount = await page
    .locator(`${shellSelector} .front-line[data-route-id="${routeId}"]`)
    .evaluate((route) => Number(route.getAttribute("data-route-point-count") ?? 0) - 1);

  expect(segmentCount).toBeGreaterThanOrEqual(minimumSegments);
}

async function expectRoutesUseReadableBattleArea(
  page: Page,
  shellSelector: string,
  routeIds: string[],
  minimumWidthRatio: number,
  minimumHeightRatio: number
) {
  const spread = await page.evaluate(
    ({ routes, selector }) => {
      const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
      const routeBoxes = routes
        .map((routeId) => {
          const box = document.querySelector(`${selector} .front-line[data-route-id="${routeId}"] .front-route`)?.getBoundingClientRect();
          return box && box.width > 0 && box.height > 0
            ? {
                bottom: box.bottom,
                left: box.left,
                right: box.right,
                top: box.top
              }
            : null;
        })
        .filter((box): box is { bottom: number; left: number; right: number; top: number } => box !== null);

      if (!stage || routeBoxes.length === 0) {
        return null;
      }

      const bounds = routeBoxes.reduce(
        (accumulator, box) => ({
          bottom: Math.max(accumulator.bottom, box.bottom),
          left: Math.min(accumulator.left, box.left),
          right: Math.max(accumulator.right, box.right),
          top: Math.min(accumulator.top, box.top)
        }),
        {
          bottom: Number.NEGATIVE_INFINITY,
          left: Number.POSITIVE_INFINITY,
          right: Number.NEGATIVE_INFINITY,
          top: Number.POSITIVE_INFINITY
        }
      );

      return {
        heightRatio: (bounds.bottom - bounds.top) / stage.height,
        widthRatio: (bounds.right - bounds.left) / stage.width
      };
    },
    { routes: routeIds, selector: shellSelector }
  );

  expect(spread).not.toBeNull();
  expect(spread?.widthRatio).toBeGreaterThan(minimumWidthRatio);
  expect(spread?.heightRatio).toBeGreaterThan(minimumHeightRatio);
}

async function expectVisibleUnitsUseReadableBattleArea(
  page: Page,
  shellSelector: string,
  routeIds: string[],
  minimumWidthRatio: number,
  minimumHeightRatio: number
) {
  const spread = await page.evaluate(
    ({ routes, selector }) => {
      const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
      const wanted = new Set(routes);
      const unitBoxes = [...document.querySelectorAll(`${selector} .front-line[data-unit-visible="true"]`)]
        .filter((route) => wanted.has(route.getAttribute("data-route-id") ?? ""))
        .flatMap((route) => [...route.querySelectorAll(".formation-unit")])
        .map((unit) => unit.getBoundingClientRect())
        .filter((box) => box.width > 0 && box.height > 0)
        .map((box) => ({
          bottom: box.bottom,
          left: box.left,
          right: box.right,
          top: box.top
        }));

      if (!stage || unitBoxes.length === 0) {
        return null;
      }

      const bounds = unitBoxes.reduce(
        (accumulator, box) => ({
          bottom: Math.max(accumulator.bottom, box.bottom),
          left: Math.min(accumulator.left, box.left),
          right: Math.max(accumulator.right, box.right),
          top: Math.min(accumulator.top, box.top)
        }),
        {
          bottom: Number.NEGATIVE_INFINITY,
          left: Number.POSITIVE_INFINITY,
          right: Number.NEGATIVE_INFINITY,
          top: Number.POSITIVE_INFINITY
        }
      );

      return {
        heightRatio: (bounds.bottom - bounds.top) / stage.height,
        widthRatio: (bounds.right - bounds.left) / stage.width
      };
    },
    { routes: routeIds, selector: shellSelector }
  );

  expect(spread).not.toBeNull();
  expect(spread?.widthRatio).toBeGreaterThan(minimumWidthRatio);
  expect(spread?.heightRatio).toBeGreaterThan(minimumHeightRatio);
}

async function expectVisibleFleetRoutes(page: Page, shellSelector: string, expectedRouteIds: string[]) {
  const visibleRoutes = await visibleFleetRouteIds(page, shellSelector);

  expect(visibleRoutes).toEqual(expectedRouteIds);
}

async function expectVisibleFleetRoutesInclude(page: Page, shellSelector: string, expectedRouteIds: string[]) {
  const visibleRoutes = await visibleFleetRouteIds(page, shellSelector);

  for (const routeId of expectedRouteIds) {
    expect(visibleRoutes).toContain(routeId);
  }
}

async function expectRenderedRoutesInclude(page: Page, shellSelector: string, routeIds: string[]) {
  const visibleRoutes = await renderedRouteIds(page, shellSelector);

  for (const routeId of routeIds) {
    expect(visibleRoutes).toContain(routeId);
  }
}

async function expectRenderedRoutesExclude(page: Page, shellSelector: string, routeIds: string[]) {
  const visibleRoutes = await renderedRouteIds(page, shellSelector);

  for (const routeId of routeIds) {
    expect(visibleRoutes).not.toContain(routeId);
  }
}

async function expectJutlandFleetGroupsContinuous(page: Page) {
  const missing = await page.locator(".jutland-battle .front-line").evaluateAll((routes) => {
    const visibleByGroup = new Map<string, string[]>();
    routes.forEach((route) => {
      const routeId = route.getAttribute("data-route-id") ?? "";
      const groupId =
        routeId === "run-to-the-north" || routeId === "beatty-night-screen"
          ? "beatty"
          : routeId === "hipper-rejoins-main-fleet" || routeId === "battlecruiser-death-ride" || routeId === "hipper-night-retreat"
            ? "hipper"
            : routeId === "high-seas-fleet-north" || routeId === "scheer-battle-turn" || routeId === "german-main-night-retreat"
              ? "german-main"
              : routeId === "grand-fleet-approach" ||
                  routeId === "grand-fleet-closing" ||
                  routeId === "grand-fleet-deploys" ||
                  routeId === "british-night-pursuit-route"
                ? "grand-fleet"
                : "";

      if (!groupId || route.getAttribute("data-unit-visible") !== "true") {
        return;
      }

      visibleByGroup.set(groupId, [...(visibleByGroup.get(groupId) ?? []), routeId]);
    });

    return ["beatty", "hipper", "german-main", "grand-fleet"].filter((groupId) => !visibleByGroup.has(groupId));
  });

  expect(missing).toEqual([]);
}

async function expectMapPointsHidden(page: Page, shellSelector: string, pointIds: string[]) {
  for (const pointId of pointIds) {
    await expect(page.locator(`${shellSelector} [data-testid="map-point-${pointId}"]`)).toHaveCount(0);
  }
}

async function expectNoTerrainZones(page: Page, shellSelector: string) {
  await expect(page.locator(`${shellSelector} .terrain-layer ellipse`)).toHaveCount(0);
}

async function expectNoDarkTacticalTerrainBlocks(page: Page, shellSelector: string) {
  const darkBlocks = await page.locator(`${shellSelector} .tactical-terrain-feature path`).evaluateAll((paths) =>
    paths
      .map((path) => {
        const style = getComputedStyle(path);
        const box = path.getBoundingClientRect();
        return {
          area: box.width * box.height,
          className: path.getAttribute("class") ?? "",
          display: style.display,
          fill: style.fill,
          opacity: Number(style.opacity)
        };
      })
      .filter(
        (path) =>
          path.display !== "none" &&
          path.area > 25_000 &&
          path.opacity > 0.2 &&
          (path.fill === "rgb(0, 0, 0)" || path.fill === "rgba(0, 0, 0, 1)")
      )
  );

  expect(darkBlocks).toEqual([]);
}

async function expectNoLargeDarkRenderedBlocks(page: Page, shellSelector: string) {
  const darkBlocks = await page.locator(`${shellSelector} [data-testid="map-stage"]`).evaluate((map, selector) => {
    const mapBox = map.getBoundingClientRect();
    const parseColor = (value: string) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) {
        return undefined;
      }
      const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
      return {
        alpha: parts[3] ?? 1,
        blue: parts[2] ?? 0,
        green: parts[1] ?? 0,
        red: parts[0] ?? 0
      };
    };
    const effectiveOpacity = (element: Element) => {
      let opacity = 1;
      let node: Element | null = element;
      while (node && node !== document.body) {
        const value = Number.parseFloat(getComputedStyle(node).opacity || "1");
        if (Number.isFinite(value)) {
          opacity *= value;
        }
        node = node.parentElement;
      }
      return opacity;
    };

    return [...document.querySelectorAll<SVGElement>(`${selector} svg path, ${selector} svg polygon, ${selector} svg polyline, ${selector} svg rect, ${selector} svg ellipse`)]
      .map((element) => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        const fill = parseColor(style.fill);
        const opacity = effectiveOpacity(element);
        const fillAlpha = fill ? fill.alpha * opacity : 0;
        const luminance = fill ? (fill.red * 0.2126 + fill.green * 0.7152 + fill.blue * 0.0722) : 255;
        const relativeArea = (box.width * box.height) / (mapBox.width * mapBox.height);
        return {
          className: element.getAttribute("class") ?? "",
          fill: style.fill,
          luminance,
          opacity,
          relativeArea,
          tagName: element.tagName,
          testId: element.getAttribute("data-testid") ?? element.closest("[data-testid]")?.getAttribute("data-testid") ?? ""
        };
      })
      .filter(
        (item) =>
          item.relativeArea > 0.018 &&
          item.opacity > 0.08 &&
          item.fill !== "none" &&
          item.fill !== "rgba(0, 0, 0, 0)" &&
          item.luminance < 48 &&
          !item.className.includes("unit-icon-shadow")
      );
  }, shellSelector);

  expect(darkBlocks).toEqual([]);
}

async function expectBattleOfBritainNoDecorativeCinematicJitter(page: Page) {
  const metrics = await page.locator(".battle-of-britain").evaluate((shell) => {
    const visibleDecorativeSpecks = [...shell.querySelectorAll(".cinematic-map-effects circle:not(.cinematic-focus-glow)")].filter(
      (element) => getComputedStyle(element).display !== "none"
    );
    const focusGlow = shell.querySelector(".cinematic-focus-glow");
    const frontHaze = shell.querySelector(".cinematic-front-haze");
    const dogfightAnimatedElements = [...shell.querySelectorAll(".battle-dogfight-effect *, .dogfight-clash *")].filter(
      (element) => getComputedStyle(element).animationName !== "none"
    );
    const weatherAnimatedElements = [...shell.querySelectorAll(".battle-of-britain-weather-overlay .map-overlay-image")].filter(
      (element) => getComputedStyle(element).animationName !== "none"
    );
    const terrainLayer = shell.querySelector<HTMLElement>('[data-testid="battle-of-britain-terrain-3d"]');
    const terrainAfterStyle = terrainLayer ? getComputedStyle(terrainLayer, "::after") : null;
    const terrainBeforeStyle = terrainLayer ? getComputedStyle(terrainLayer, "::before") : null;
    return {
      dogfightAnimatedElementCount: dogfightAnimatedElements.length,
      focusGlowFilter: focusGlow ? getComputedStyle(focusGlow).filter : "missing",
      frontHazeFilter: frontHaze ? getComputedStyle(frontHaze).filter : "missing",
      terrainAfterContent: terrainAfterStyle?.content ?? "",
      terrainBeforeContent: terrainBeforeStyle?.content ?? "",
      weatherAnimatedElementCount: weatherAnimatedElements.length,
      visibleDecorativeSpecks: visibleDecorativeSpecks.length
    };
  });

  expect(metrics.visibleDecorativeSpecks, "Battle of Britain should not render decorative drifting specks over the tactical map").toBe(0);
  expect(metrics.focusGlowFilter, "Battle of Britain cinematic focus glow should not use heavy blur during playback").toBe("none");
  expect(metrics.frontHazeFilter, "Battle of Britain front haze should not use heavy blur during playback").toBe("none");
  expect(metrics.terrainAfterContent, "Battle of Britain terrain layer must not reintroduce a full-map multiply/soft-light veil").toBe("none");
  expect(metrics.terrainBeforeContent, "Battle of Britain terrain layer must not reintroduce a full-map fog/color wash").toBe("none");
  expect(metrics.weatherAnimatedElementCount, "clouds are local weather units; CSS drift should not create screen shimmer during dense combat review").toBe(0);
  expect(metrics.dogfightAnimatedElementCount, "dogfight effects should be data-timed, not infinite CSS flicker that reads as screen flashing").toBe(0);
}

async function expectBattleOfBritainTacticalCoreVisible(page: Page, options: { bottomMax?: number; leftMin?: number; rightMax?: number; topMax?: number; topMin?: number } = {}) {
  const ratios = await page.locator(".battle-of-britain .tactical-terrain-layer, .battle-of-britain .front-line, .battle-of-britain .map-overlay-elements").evaluateAll((elements) => {
    const map = document.querySelector<HTMLElement>('[data-testid="map-stage"]');
    if (!map) {
      throw new Error("map-stage not found");
    }
    const mapBox = map.getBoundingClientRect();
    const boxes = elements
      .flatMap((element) => {
        const descendants = [element, ...Array.from(element.querySelectorAll("*"))] as Element[];
        return descendants
          .filter((item) => {
            const style = getComputedStyle(item);
            return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || "1") > 0.05;
          })
          .map((item) => item.getBoundingClientRect());
      })
      .filter((box) => box.width > 2 && box.height > 2);
    const left = Math.min(...boxes.map((box) => box.left));
    const right = Math.max(...boxes.map((box) => box.right));
    const top = Math.min(...boxes.map((box) => box.top));
    const bottom = Math.max(...boxes.map((box) => box.bottom));

    return {
      bottom: (bottom - mapBox.top) / mapBox.height,
      left: (left - mapBox.left) / mapBox.width,
      right: (right - mapBox.left) / mapBox.width,
      top: (top - mapBox.top) / mapBox.height
    };
  });

  if (options.topMin !== undefined) {
    expect(ratios.top).toBeGreaterThan(options.topMin);
  }
  expect(ratios.top).toBeLessThan(options.topMax ?? 0.2);
  if (options.leftMin !== undefined) {
    expect(ratios.left).toBeGreaterThan(options.leftMin);
  }
  if (options.rightMax !== undefined) {
    expect(ratios.right).toBeLessThan(options.rightMax);
  }
  expect(ratios.bottom).toBeLessThan(options.bottomMax ?? 0.9);
}

async function expectBattleOfBritainElementInMapCore(
  page: Page,
  selector: string,
  options: { maxX?: number; maxY?: number; minX?: number; minY?: number } = {}
) {
  await expect(page.locator(selector).first()).toBeVisible();
  const ratios = await page.locator(selector).first().evaluate((element) => {
    const map = document.querySelector<HTMLElement>('[data-testid="map-stage"]');
    if (!map) {
      throw new Error("map-stage not found");
    }
    const mapBox = map.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;

    return {
      x: (centerX - mapBox.left) / mapBox.width,
      y: (centerY - mapBox.top) / mapBox.height
    };
  });

  expect(ratios.x).toBeGreaterThan(options.minX ?? 0.16);
  expect(ratios.x).toBeLessThan(options.maxX ?? 0.86);
  expect(ratios.y).toBeGreaterThan(options.minY ?? 0.1);
  expect(ratios.y).toBeLessThan(options.maxY ?? 0.82);
}

async function expectBattleOfBritainFortifiedLinesDoNotFill(page: Page) {
  const filledLines = await page.locator(".battle-of-britain .fortified-line polyline").evaluateAll((lines) =>
    lines
      .map((line) => {
        const style = getComputedStyle(line);
        return {
          className: line.getAttribute("class") ?? "",
          fill: style.fill,
          fillAttribute: line.getAttribute("fill")
        };
      })
      .filter((line) => line.fill !== "none" || line.fillAttribute !== "none")
  );

  expect(filledLines).toEqual([]);
}

async function expectBattleOfBritainRenderedMapColorGrade(page: Page) {
  const stage = page.locator(".battle-of-britain [data-testid='map-stage']");
  const png = decodeScreenshotPng(await stage.screenshot());
  let cyanGreenSeaPixels = 0;
  let darkPixels = 0;
  let greenDominantPixels = 0;
  let lowDaylightPixels = 0;
  let metalBlueDominantPixels = 0;
  let luminanceSquareSum = 0;
  let luminanceSum = 0;
  const luminanceValues: number[] = [];
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
      if (luminance < 34) {
        darkPixels += 1;
      }
      if (luminance < 95) {
        lowDaylightPixels += 1;
      }
      if (green > blue + 10 && green > red + 4) {
        greenDominantPixels += 1;
      }
      if (blue > 70 && green > 68 && green >= blue - 2 && green > red + 18) {
        cyanGreenSeaPixels += 1;
      }
      if (blue > green + 8 && blue > red + 12 && saturation > 24) {
        metalBlueDominantPixels += 1;
      }
      if (blue > green + 10 && blue > red + 16 && saturation > 28 && luminance < 112) {
        nightBluePixels += 1;
      }
    }
  }

  luminanceValues.sort((a, b) => a - b);
  const percentile = (ratio: number) => luminanceValues[Math.min(luminanceValues.length - 1, Math.max(0, Math.floor(luminanceValues.length * ratio)))] ?? 0;
  const luminanceMean = luminanceSum / samples;
  const luminanceStdDev = Math.sqrt(Math.max(0, luminanceSquareSum / samples - luminanceMean * luminanceMean));
  const saturationMean = saturationSum / samples;
  const brightnessScore100 = (luminanceMean / 255) * 100;
  const cyanGreenSeaRatio = cyanGreenSeaPixels / samples;
  const darkRatio = darkPixels / samples;
  const greenDominantRatio = greenDominantPixels / samples;
  const lowDaylightRatio = lowDaylightPixels / samples;
  const metalBlueRatio = metalBlueDominantPixels / samples;
  const nightBlueRatio = nightBluePixels / samples;

  expect(brightnessScore100, "Battle of Britain rendered map should read as a daylight battle, not a night-blue map with a passing mean score").toBeGreaterThan(56);
  expect(brightnessScore100, "Battle of Britain rendered map is too pale when its 0-100 brightness score climbs above the palette target band").toBeLessThan(70);
  expect(luminanceStdDev, "Battle of Britain rendered map needs enough contrast for 3D terrain texture").toBeGreaterThan(20);
  expect(percentile(0.1), "Battle of Britain daylight map should not have a night-like low-luminance tail").toBeGreaterThan(82);
  expect(percentile(0.25), "Battle of Britain daylight map should keep at least the lower quarter out of black/night territory").toBeGreaterThan(105);
  expect(saturationMean, "Battle of Britain rendered map should keep richer color after CSS compositing").toBeGreaterThan(42);
  expect(metalBlueRatio, "Battle of Britain sea should read as daylight steel-blue, not pale green or flat gray").toBeGreaterThan(0.14);
  expect(greenDominantRatio, "Battle of Britain sea should not read as a green wash").toBeLessThan(0.24);
  expect(cyanGreenSeaRatio, "Battle of Britain sea should not drift into cyan/green map software coloring").toBeLessThan(0.2);
  expect(darkRatio, "Battle of Britain daylight map should not introduce black/night-looking regions").toBeLessThan(0.045);
  expect(lowDaylightRatio, "Battle of Britain daylight map should not hide large areas below daylight luminance even when not pure black").toBeLessThan(0.18);
  expect(nightBlueRatio, "Battle of Britain sea/background should not read as night-blue mass").toBeLessThan(0.16);
}

async function expectBattleOfBritainDenseStageNoMapJitter(page: Page, label: string) {
  await page.waitForTimeout(900);
  const samples = await page.locator(".battle-of-britain").evaluate(async (shell) => {
    const measure = () => {
      const rectFor = (element: Element | null) => {
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
      const cameraLayer = shell.querySelector<SVGGElement>(".camera-layer");
      const terrainLayer = shell.querySelector<HTMLElement>('[data-testid="battle-of-britain-terrain-3d"]');
      const canvas = shell.querySelector<HTMLCanvasElement>('[data-testid="battle-of-britain-terrain-3d-canvas"]');
      const stage = shell.querySelector<HTMLElement>('[data-testid="map-stage"]');
      const dogfight = shell.querySelector<SVGGraphicsElement>('[data-testid="britain-morning-dogfight"], [data-testid="britain-afternoon-dogfight"]');
      const route = shell.querySelector<SVGGraphicsElement>(".front-line.is-active .front-route, .front-line .front-route");
      return {
        cameraFocus: cameraLayer?.getAttribute("data-map-focus") ?? "",
        cameraTransform: cameraLayer?.getAttribute("transform") ?? "",
        canvasRect: rectFor(canvas),
        dogfightRect: rectFor(dogfight),
        mapCenter: terrainLayer?.getAttribute("data-map-center") ?? "",
        mapZoom: terrainLayer?.getAttribute("data-map-zoom") ?? "",
        registrationMaxError: Number(terrainLayer?.getAttribute("data-registration-max-error") ?? "999"),
        routeRect: rectFor(route),
        stageRect: rectFor(stage)
      };
    };

    return new Promise<ReturnType<typeof measure>[]>((resolve) => {
      const output: ReturnType<typeof measure>[] = [];
      const tick = () => {
        output.push(measure());
        if (output.length >= 90) {
          resolve(output);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });

  const first = samples[0];
  const last = samples[samples.length - 1];
  const uniqueCameraTransforms = new Set(samples.map((sample) => sample.cameraTransform));
  const uniqueMapCenters = new Set(samples.map((sample) => sample.mapCenter));
  const uniqueMapZooms = new Set(samples.map((sample) => sample.mapZoom));
  const rectMaxDelta = (key: "canvasRect" | "stageRect") => {
    const values = samples
      .map((sample) => sample[key])
      .filter((rect): rect is NonNullable<typeof rect> => rect !== null);
    const deltaFor = (field: "height" | "left" | "top" | "width") => Math.max(...values.map((rect) => rect[field])) - Math.min(...values.map((rect) => rect[field]));
    return Math.max(deltaFor("height"), deltaFor("left"), deltaFor("top"), deltaFor("width"));
  };
  const routeCenterJump = (() => {
    const centers = samples
      .map((sample) => sample.routeRect)
      .filter((rect): rect is NonNullable<typeof rect> => rect !== null)
      .map((rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }));
    let maxJump = 0;
    for (let index = 1; index < centers.length; index += 1) {
      maxJump = Math.max(maxJump, Math.hypot(centers[index].x - centers[index - 1].x, centers[index].y - centers[index - 1].y));
    }
    return maxJump;
  })();

  expect(first.cameraFocus, `${label} dense stage should keep the tactical air-combat camera focus`).toBe("britainAirCombat");
  expect(last.cameraFocus, `${label} dense stage should not drift out of the tactical air-combat camera focus`).toBe("britainAirCombat");
  expect(uniqueCameraTransforms.size, `${label} camera-layer transform should be stable after event jump settles`).toBe(1);
  expect(uniqueMapCenters.size, `${label} MapLibre terrain should not resync/jump center every frame`).toBeLessThanOrEqual(1);
  expect(uniqueMapZooms.size, `${label} MapLibre terrain should not resync/jump zoom every frame`).toBeLessThanOrEqual(1);
  expect(rectMaxDelta("stageRect"), `${label} map-stage layout should not jitter`).toBeLessThan(0.5);
  expect(rectMaxDelta("canvasRect"), `${label} terrain canvas should not jitter against tactical routes`).toBeLessThan(0.5);
  expect(Math.max(...samples.map((sample) => sample.registrationMaxError)), `${label} terrain registration should stay locked to the battle layer`).toBeLessThan(24);
  expect(routeCenterJump, `${label} active tactical route geometry should not visibly jump after the camera settles`).toBeLessThan(1.2);
}

async function expectBattleOfBritainForegroundReadable(page: Page) {
  const foregroundContrast = await page.locator(".battle-of-britain").evaluate(() => {
    const stage = document.querySelector<HTMLElement>('[data-testid="map-stage"]');
    const aircraft = document.querySelector<SVGGraphicsElement>(".ww2-aircraft-marker");
    const routes = Array.from(document.querySelectorAll<SVGGraphicsElement>(".front-line .front-route"));
    if (!stage || !aircraft || routes.length === 0) {
      return { aircraftFilter: "", aircraftVisible: false, routeStrokeWidths: [] as number[] };
    }
    const aircraftStyle = getComputedStyle(aircraft);
    return {
      aircraftFilter: aircraftStyle.filter,
      aircraftVisible: aircraft.getBoundingClientRect().width > 20 && aircraft.getBoundingClientRect().height > 20,
      routeStrokeWidths: routes.slice(0, 8).map((route) => Number.parseFloat(getComputedStyle(route).strokeWidth || "0"))
    };
  });

  expect(foregroundContrast.aircraftVisible, "aircraft icons must remain readable above the richer map color grade").toBe(true);
  expect(foregroundContrast.aircraftFilter, "aircraft icons should keep a separation glow against the darker terrain").toContain("drop-shadow");
  expect(Math.max(...foregroundContrast.routeStrokeWidths), "tactical routes should remain visible over the richer map without becoming thick arrows").toBeGreaterThanOrEqual(2.4);
  expect(Math.max(...foregroundContrast.routeStrokeWidths), "tactical routes should remain thin enough not to cover aircraft or labels").toBeLessThanOrEqual(4.2);
}

async function expectBattleOfBritainTerrain3DMap(page: Page) {
  const terrain = page.getByTestId("battle-of-britain-terrain-3d");
  await expect(terrain).toBeVisible();
  await expect(terrain).toHaveAttribute("data-renderer", "maplibre-real-terrain");
  await expect(terrain).toHaveAttribute("data-terrain-model", "real-dem-raster-terrain");
  await expect(terrain).toHaveAttribute("data-tactical-renderer", "maplibre-underlay-svg-tactical-overlay");
  await expect(terrain).toHaveAttribute("data-camera-mode", "svg-projection-registered-terrain");
  await expect(terrain).toHaveAttribute("data-map-registration", "svg-projection");
  await expect(terrain).toHaveAttribute("data-projection", "registered-web-mercator-hillshade");
  await expect(terrain).toHaveAttribute("data-terrain-source", "/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png");
  await expect(terrain).toHaveAttribute("data-topo-source", "/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg");
  await expect(terrain).toHaveAttribute("data-terrain-exaggeration", "1.35");
  await expect(terrain).toHaveAttribute("data-hillshade-exaggeration", "0.72");
  await expect(terrain).toHaveAttribute("data-visible-basemap", "local-cached-world-topographic-map");
  await expect(terrain).toHaveAttribute("data-visual-surface-contract", "maplibre-typed-terrain-palette-country-boundaries-only");
  await expect(terrain).toHaveAttribute("data-terrain-color-model", "typed-regional-palette-v2");
  await expect(terrain).toHaveAttribute("data-terrain-color-zones", "channel,channel-lane,england-downs,thames-lowland,france-chalk,france-inland");
  await expect(terrain).toHaveAttribute(
    "data-terrain-color-layer-ids",
    "battle-of-britain-channel-color,battle-of-britain-channel-lane-color,battle-of-britain-england-downs-color,battle-of-britain-thames-lowland-color,battle-of-britain-france-chalk-color,battle-of-britain-france-inland-color"
  );
  await expect(terrain).toHaveAttribute("data-cloud-animation", "progress-linked-local-weather-units");
  await expect(terrain).toHaveAttribute("data-cloud-renderer", "svg-camera-layer-comfy-weather-png");
  await expect(terrain).toHaveAttribute("data-maplibre-fill-veil", "removed");
  await expect(terrain).toHaveAttribute("data-camera-update-threshold", "0.025-zoom");
  await expect(terrain).toHaveAttribute("data-topo-labels-suppressed", "true");
  await expect(terrain).toHaveAttribute("data-topo-raster-opacity", "0.20");
  await expect(page.getByTestId("battle-of-britain-weather-overlay-morning")).toBeVisible();
  await expect(page.getByTestId("battle-of-britain-terrain-3d-canvas")).toBeVisible();
  await expect.poll(async () => Number(await terrain.getAttribute("data-map-zoom"))).toBeGreaterThan(0);
  await expect.poll(async () => await terrain.getAttribute("data-map-center")).not.toBe("");
  await expect.poll(async () => await terrain.getAttribute("data-terrain-loaded"), { timeout: 30_000 }).toBe("true");
  await expect.poll(async () => Number(await terrain.getAttribute("data-registration-sample-count"))).toBeGreaterThanOrEqual(6);
  await expect
    .poll(async () => Number(await terrain.getAttribute("data-registration-max-error")), { timeout: 30_000 })
    .toBeLessThan(24);
  const topoTileResponse = await page.request.head("/assets/maps/battle-of-britain-3d/topo/8/128-85.jpg");
  expect(topoTileResponse.ok(), "Battle of Britain topographic tile should be present in the deployed preview").toBe(true);
  expect(topoTileResponse.headers()["content-type"], "topographic tile should be served as a real JPEG, not an SPA fallback").toContain("image/jpeg");
  const demTileResponse = await page.request.head("/assets/maps/battle-of-britain-3d/terrarium/8/128-85.png");
  expect(demTileResponse.ok(), "Battle of Britain DEM tile should be present in the deployed preview").toBe(true);
  expect(demTileResponse.headers()["content-type"], "DEM tile should be served as a PNG Terrarium tile").toContain("image/png");

  const visualState = await page.locator(".battle-of-britain").evaluate((shell) => {
    const terrainLayer = shell.querySelector<HTMLElement>('[data-testid="battle-of-britain-terrain-3d"]');
    const svg = shell.querySelector<SVGSVGElement>("svg.battle-map");
    const countryLayer = shell.querySelector<SVGGElement>(".country-layer");
    const countries = Array.from(shell.querySelectorAll<SVGPathElement>(".country"));
    const firstAircraft = shell.querySelector<SVGGraphicsElement>(".ww2-aircraft-marker");
    const firstRoute = shell.querySelector<SVGGraphicsElement>(".front-line");
    const firstWeatherOverlay = shell.querySelector<SVGGraphicsElement>(".battle-of-britain-weather-overlay");
    const weatherOverlays = Array.from(shell.querySelectorAll<SVGGraphicsElement>(".battle-of-britain-weather-overlay"));
    const mapPointLabels = Array.from(shell.querySelectorAll<SVGTextElement>(".map-point text"));
    const mapPointLabelPlates = Array.from(shell.querySelectorAll<SVGRectElement>(".map-point-label-plate"));
    const windPath = shell.querySelector<SVGPathElement>('[data-testid="britain-chain-home-vector"] path');
    const stage = shell.querySelector<HTMLElement>('[data-testid="map-stage"]');
    const canvas = shell.querySelector<HTMLCanvasElement>('[data-testid="battle-of-britain-terrain-3d-canvas"]');
    const stageStyle = stage ? getComputedStyle(stage) : null;
    const terrainStyle = terrainLayer ? getComputedStyle(terrainLayer) : null;
    const svgStyle = svg ? getComputedStyle(svg) : null;
    const canvasBox = canvas?.getBoundingClientRect();
    const stageBox = stage?.getBoundingClientRect();
    return {
      aircraftAfterTerrain: firstAircraft
        ? Boolean(terrainLayer && terrainLayer.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING)
        : true,
      canvasCoverage: canvasBox && stageBox ? (canvasBox.width * canvasBox.height) / (stageBox.width * stageBox.height) : 0,
      weatherAfterTerrain: Boolean(terrainLayer && firstWeatherOverlay && terrainLayer.compareDocumentPosition(firstWeatherOverlay) & Node.DOCUMENT_POSITION_FOLLOWING),
      weatherBeforeAircraft: firstAircraft
        ? Boolean(firstWeatherOverlay && firstWeatherOverlay.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING)
        : true,
      weatherOpacity: Number.parseFloat(firstWeatherOverlay ? getComputedStyle(firstWeatherOverlay).opacity : "0"),
      weatherPointerEvents: firstWeatherOverlay ? getComputedStyle(firstWeatherOverlay).pointerEvents : "",
      weatherCoverage: (() => {
        if (!stage) {
          return { max: 0, total: 0 };
        }
        const stageBox = stage.getBoundingClientRect();
        const stageArea = Math.max(1, stageBox.width * stageBox.height);
        const visibleAreas = weatherOverlays
          .map((overlay) => {
            const box = overlay.getBoundingClientRect();
            const opacity = Number.parseFloat(getComputedStyle(overlay).opacity || "0");
            return box.width > 12 && box.height > 12 && opacity > 0.06 ? (box.width * box.height) / stageArea : 0;
          })
          .filter((area) => area > 0);
        return {
          max: Math.max(0, ...visibleAreas),
          total: visibleAreas.reduce((sum, area) => sum + area, 0)
        };
      })(),
      countryFills: countries.map((country) => getComputedStyle(country).fill),
      countryLayerOpacity: countryLayer ? getComputedStyle(countryLayer).opacity : "",
      mapPointLabels: mapPointLabels.map((label) => {
        const style = getComputedStyle(label);
        return {
          fill: style.fill,
          fontSize: Number.parseFloat(style.fontSize),
          stroke: style.stroke,
          strokeWidth: Number.parseFloat(style.strokeWidth)
        };
      }),
      mapPointLabelPlates: mapPointLabelPlates.map((plate) => {
        const box = plate.getBoundingClientRect();
        const style = getComputedStyle(plate);
        return {
          display: style.display,
          fill: style.fill,
          height: box.height,
          opacity: Number.parseFloat(style.opacity || "1"),
          stroke: style.stroke,
          width: box.width
        };
      }),
      terrainTexture: (() => {
        if (!canvas) {
          return { edgeMean: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
        }
        const sample = document.createElement("canvas");
        sample.width = 220;
        sample.height = 140;
        const context = sample.getContext("2d", { willReadFrequently: true });
        if (!context) {
          return { edgeMean: 0, luminanceMean: 0, luminanceStdDev: 0, saturationMean: 0 };
        }
        context.drawImage(canvas, 0, 0, sample.width, sample.height);
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
      })(),
      registrationMaxError: Number.parseFloat(terrainLayer?.getAttribute("data-registration-max-error") ?? "999"),
      registrationMeanError: Number.parseFloat(terrainLayer?.getAttribute("data-registration-mean-error") ?? "999"),
      routeAfterTerrain: firstRoute
        ? Boolean(terrainLayer && terrainLayer.compareDocumentPosition(firstRoute) & Node.DOCUMENT_POSITION_FOLLOWING)
        : true,
      stageOverflow: stageStyle?.overflow ?? "",
      svgBackground: svgStyle?.backgroundColor ?? "",
      svgZIndex: Number(svgStyle?.zIndex ?? 0),
      terrainPointerEvents: terrainStyle?.pointerEvents ?? "",
      terrainZIndex: Number(terrainStyle?.zIndex ?? 0),
      visibleWeatherOverlayCount: weatherOverlays.filter((overlay) => {
        const box = overlay.getBoundingClientRect();
        const style = getComputedStyle(overlay);
        return box.width > 12 && box.height > 12 && Number.parseFloat(style.opacity || "0") > 0.06;
      }).length,
      windVector: windPath
        ? {
            stroke: getComputedStyle(windPath).stroke,
            strokeWidth: Number.parseFloat(getComputedStyle(windPath).strokeWidth)
          }
        : null
    };
  });

  expect(visualState.canvasCoverage, "Battle of Britain MapLibre terrain canvas should fill the map stage").toBeGreaterThan(0.92);
  expect(visualState.terrainPointerEvents).toBe("none");
  expect(visualState.weatherPointerEvents).toBe("none");
  expect(visualState.stageOverflow).toBe("hidden");
  expect(visualState.countryLayerOpacity).toBe("1");
  expect(visualState.countryFills.every((fill) => fill === "none" || fill === "rgba(0, 0, 0, 0)"), "SVG countries must be boundary-only so the 3D basemap remains visible").toBe(true);
  expect(
    visualState.mapPointLabelPlates.filter((plate) => plate.display !== "none" && plate.width > 24 && plate.height > 12 && plate.opacity > 0.2).length,
    "Battle of Britain place labels need actual label plates, not black text lost on a complex basemap"
  ).toBeGreaterThanOrEqual(8);
  expect(visualState.registrationMaxError, "MapLibre terrain must follow the SVG battle projection instead of behaving like an independent background").toBeLessThan(24);
  expect(visualState.registrationMeanError, "MapLibre terrain average registration error should stay tight enough for tactical geography").toBeLessThan(12);
  expect(visualState.terrainTexture.luminanceStdDev, "3D basemap must not collapse into a single flat color field").toBeGreaterThan(9);
  expect(visualState.terrainTexture.edgeMean, "3D basemap must expose enough local relief/topographic variation to be visible beneath the tactical layer").toBeGreaterThan(5);
  expect(visualState.terrainTexture.saturationMean, "raw MapLibre canvas should contain nonzero color data; final color grade is checked from rendered pixels").toBeGreaterThan(1);
  expect(visualState.terrainTexture.luminanceMean, "raw MapLibre canvas should be populated before CSS color grading is applied").toBeGreaterThan(52);
  expect(
    visualState.mapPointLabels.filter((label) => label.fontSize >= 12 && label.strokeWidth >= 3.5).length,
    "Battle of Britain key place labels need a readable halo on both overview and zoomed camera stages"
  ).toBeGreaterThanOrEqual(8);
  expect(visualState.windVector?.strokeWidth ?? 99, "radar command vector should not read as a heavy black coastline/connector line").toBeLessThanOrEqual(1.4);
  expect(visualState.visibleWeatherOverlayCount, "Battle of Britain should show multiple ComfyUI cloud banks, not one barely visible weather stamp").toBeGreaterThanOrEqual(2);
  expect(visualState.weatherAfterTerrain, "ComfyUI weather overlay should sit above the terrain canvas").toBe(true);
  expect(visualState.weatherBeforeAircraft, "ComfyUI weather overlay must stay below aircraft markers").toBe(true);
  expect(visualState.weatherOpacity, "ComfyUI cloud units should be visible without becoming a full-screen weather veil").toBeGreaterThanOrEqual(0.16);
  expect(visualState.weatherOpacity, "ComfyUI cloud units must stay below map-color grading strength").toBeLessThanOrEqual(0.3);
  expect(visualState.weatherCoverage.max, "a single cloud unit should not cover the tactical map like a weather blanket").toBeLessThan(0.075);
  expect(visualState.weatherCoverage.total, "cloud units should remain local tactical/weather assets, not a full-map color layer").toBeLessThan(0.16);
  expect(visualState.routeAfterTerrain, "tactical routes must render above the terrain underlay").toBe(true);
  expect(visualState.aircraftAfterTerrain, "aircraft must render above the terrain underlay").toBe(true);
  expect(visualState.svgBackground).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  expect(visualState.terrainZIndex).toBeLessThan(visualState.svgZIndex);
}

async function expectBattleOfBritainWeatherAssets(page: Page, expectedVisible: "afternoon" | "morning" = "morning") {
  const expectedAssets = [
    { path: "/assets/weather/battle-of-britain/morning-cloud-bank.png", testId: "battle-of-britain-weather-overlay-morning" },
    { path: "/assets/weather/battle-of-britain/afternoon-cloud-breaks.png", testId: "battle-of-britain-weather-overlay-afternoon" }
  ];
  const activeAsset = expectedAssets.find((asset) => asset.testId.includes(expectedVisible));
  if (!activeAsset) {
    throw new Error(`Unknown expected weather phase: ${expectedVisible}`);
  }

  for (const asset of expectedAssets) {
    const response = await page.request.head(asset.path);
    expect(response.ok(), `${asset.path} should be served as a runtime weather asset`).toBe(true);
    expect(response.headers()["content-type"], `${asset.path} should be a PNG image`).toContain("image/png");
    expect(response.headers()["cache-control"], `${asset.path} should not hide regenerated weather assets behind immutable local cache`).toBe("no-cache");
    expect(Number(response.headers()["content-length"]), `${asset.path} should be a finished bitmap asset, not a tiny CSS/geometry placeholder`).toBeGreaterThan(240_000);
  }
  const activeOverlay = page.getByTestId(activeAsset.testId);
  await expect(activeOverlay.locator("image.map-overlay-image")).toHaveAttribute("href", `${activeAsset.path}?v=20260614-comfy-weather-v4`);

  const weatherVisualState = await page.locator(".battle-of-britain").evaluate((shell, activeTestId) => {
    const morning = shell.querySelector<SVGGraphicsElement>('[data-testid="battle-of-britain-weather-overlay-morning"]');
    const afternoon = shell.querySelector<SVGGraphicsElement>('[data-testid="battle-of-britain-weather-overlay-afternoon"]');
      const active = shell.querySelector<SVGGraphicsElement>(`[data-testid="${activeTestId}"]`);
      const stage = shell.querySelector<HTMLElement>('[data-testid="map-stage"]');
      const visibleOverlays = [...shell.querySelectorAll<SVGGraphicsElement>(".battle-of-britain-weather-overlay")].filter((overlay) => {
        const box = overlay.getBoundingClientRect();
        const opacity = Number.parseFloat(getComputedStyle(overlay).opacity || "0");
        return box.width > 12 && box.height > 12 && opacity > 0.06;
      });
    const mapOverlayElements = shell.querySelector<SVGGraphicsElement>('[data-testid="map-overlay-elements"]');
    const firstRoute = shell.querySelector<SVGGraphicsElement>(".front-line");
    const firstAircraft = shell.querySelector<SVGGraphicsElement>(".ww2-aircraft-marker");
      const stateFor = (element: SVGGraphicsElement | null) => {
        const box = element?.getBoundingClientRect();
        const style = element ? getComputedStyle(element) : null;
        const stageBox = stage?.getBoundingClientRect();
        const stageArea = stageBox ? Math.max(1, stageBox.width * stageBox.height) : 1;
        return {
          coverage: box ? (box.width * box.height) / stageArea : 0,
          height: box?.height ?? 0,
          href: element?.querySelector("image")?.getAttribute("href") ?? "",
          opacity: Number.parseFloat(style?.opacity ?? "0"),
        phase: element?.getAttribute("data-scene-transition-phase") ?? "",
        pointerEvents: style?.pointerEvents ?? "",
        width: box?.width ?? 0
      };
    };
    return {
      active: stateFor(active),
      afternoon: stateFor(afternoon),
      imageOverlayCount: shell.querySelectorAll(".battle-of-britain-weather-overlay image.map-overlay-image").length,
      morning: stateFor(morning),
      overlayInsideCameraLayer: Boolean(mapOverlayElements && mapOverlayElements.closest(".camera-layer")),
      visibleOverlayCount: visibleOverlays.length,
      weatherBeforeAircraft: firstAircraft && active
        ? Boolean(active.compareDocumentPosition(firstAircraft) & Node.DOCUMENT_POSITION_FOLLOWING)
        : true,
      weatherBeforeRoutes: firstRoute && active ? Boolean(active.compareDocumentPosition(firstRoute) & Node.DOCUMENT_POSITION_FOLLOWING) : true
    };
  }, activeAsset.testId);

  expect(weatherVisualState.imageOverlayCount, "weather should render multiple ComfyUI bitmap overlays in the tactical SVG layer").toBeGreaterThanOrEqual(2);
  expect(weatherVisualState.visibleOverlayCount, "weather should have more than one visible cloud bank in the active phase").toBeGreaterThanOrEqual(2);
  expect(weatherVisualState.overlayInsideCameraLayer, "weather overlays must follow the battle camera layer, not sit as an independent background").toBe(true);
  const visibleWeather = weatherVisualState.active;
  expect(weatherVisualState.active.href).toBe(activeAsset.path + "?v=20260614-comfy-weather-v4");
  expect(visibleWeather.pointerEvents).toBe("none");
  expect(visibleWeather.width).toBeGreaterThan(95);
  expect(visibleWeather.width).toBeLessThan(340);
  expect(visibleWeather.height).toBeGreaterThan(32);
  expect(visibleWeather.height).toBeLessThan(125);
  expect(visibleWeather.opacity).toBeGreaterThanOrEqual(0.16);
  expect(visibleWeather.opacity).toBeLessThanOrEqual(0.3);
  expect(visibleWeather.coverage, "active cloud should behave like a local weather unit, not a full-map overlay").toBeLessThan(0.075);
  expect(weatherVisualState.weatherBeforeRoutes, "weather must stay under tactical routes").toBe(true);
  expect(weatherVisualState.weatherBeforeAircraft, "weather must stay under aircraft markers").toBe(true);

  const stats = await page.evaluate(async () => {
    const paths = ["/assets/weather/battle-of-britain/morning-cloud-bank.png", "/assets/weather/battle-of-britain/afternoon-cloud-breaks.png"];
    const output: Record<string, { alphaRatio: number; cornerAlphaMax: number; edgeVisibleRatio: number; height: number; opaqueRatio: number; width: number }> = {};
    for (const path of paths) {
      const image = new Image();
      image.src = path;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        throw new Error("2d canvas unavailable");
      }
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let alphaSum = 0;
      let edgePixels = 0;
      let edgeVisiblePixels = 0;
      let opaquePixels = 0;
      const cornerAlphaValues = [
        pixels[3],
        pixels[(canvas.width - 1) * 4 + 3],
        pixels[((canvas.height - 1) * canvas.width) * 4 + 3],
        pixels[(canvas.height * canvas.width - 1) * 4 + 3]
      ];
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const alpha = pixels[(y * canvas.width + x) * 4 + 3];
          alphaSum += alpha;
          if (alpha > 8) {
            opaquePixels += 1;
          }
          if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
            edgePixels += 1;
            if (alpha > 8) {
              edgeVisiblePixels += 1;
            }
          }
        }
      }
      output[path] = {
        alphaRatio: alphaSum / (255 * canvas.width * canvas.height),
        cornerAlphaMax: Math.max(...cornerAlphaValues),
        edgeVisibleRatio: edgeVisiblePixels / edgePixels,
        height: canvas.height,
        opaqueRatio: opaquePixels / (canvas.width * canvas.height),
        width: canvas.width
      };
    }
    return output;
  });

  expect(stats["/assets/weather/battle-of-britain/morning-cloud-bank.png"].width).toBe(1216);
  expect(stats["/assets/weather/battle-of-britain/morning-cloud-bank.png"].height).toBe(512);
  expect(stats["/assets/weather/battle-of-britain/morning-cloud-bank.png"].alphaRatio).toBeGreaterThan(0.035);
  expect(stats["/assets/weather/battle-of-britain/morning-cloud-bank.png"].alphaRatio).toBeLessThan(0.095);
  expect(stats["/assets/weather/battle-of-britain/afternoon-cloud-breaks.png"].alphaRatio).toBeGreaterThan(0.03);
  expect(stats["/assets/weather/battle-of-britain/afternoon-cloud-breaks.png"].alphaRatio).toBeLessThan(0.085);
  for (const [path, item] of Object.entries(stats)) {
    expect(item.opaqueRatio, `${path} should have visible cloud material`).toBeGreaterThan(0.08);
    expect(item.opaqueRatio, `${path} should leave tactical gaps and not become a full fog blanket`).toBeLessThan(0.48);
    expect(item.edgeVisibleRatio, `${path} should not have a rectangular image edge`).toBeLessThan(0.02);
    expect(item.cornerAlphaMax, `${path} should keep transparent corners`).toBeLessThanOrEqual(8);
  }
}

type TransparentAircraftPngOptions = {
  maxAlphaBoundingBoxRatio?: number;
  maxAlphaRatio?: number;
  maxBBoxFillRatio?: number;
  maxColumnCoverage?: number;
  maxTailJoinRatio?: number;
  maxLuminanceMean?: number;
  maxLuminanceStdDev?: number;
  maxRowCoverage?: number;
  maxSaturationMean?: number;
  maxTailRootRearFuselageRgbDistance?: number;
  minLuminanceMean?: number;
  minLuminanceStdDev?: number;
  minSaturationMean?: number;
  minTailJoinRatio?: number;
  minTopBottomBalanceRatio?: number;
};

async function expectTransparentAircraftPng(page: Page, assetPath: string, options: TransparentAircraftPngOptions = {}) {
  const maxAlphaRatio = options.maxAlphaRatio ?? 0.24;
  const maxAlphaBoundingBoxRatio = options.maxAlphaBoundingBoxRatio ?? 0.5;
  const maxBBoxFillRatio = options.maxBBoxFillRatio ?? 0.48;
  const maxRowCoverage = options.maxRowCoverage ?? 0.78;
  const maxColumnCoverage = options.maxColumnCoverage ?? 0.88;
  const minLuminanceMean = options.minLuminanceMean ?? battleOfBritainAircraftGameIconQualityBand.luminanceMean.min;
  const maxLuminanceMean = options.maxLuminanceMean ?? battleOfBritainAircraftGameIconQualityBand.luminanceMean.max;
  const minLuminanceStdDev = options.minLuminanceStdDev ?? battleOfBritainAircraftGameIconQualityBand.luminanceStdDev.min;
  const maxLuminanceStdDev = options.maxLuminanceStdDev ?? battleOfBritainAircraftGameIconQualityBand.luminanceStdDev.max;
  const minSaturationMean = options.minSaturationMean ?? battleOfBritainAircraftGameIconQualityBand.saturationMean.min;
  const maxSaturationMean = options.maxSaturationMean ?? battleOfBritainAircraftGameIconQualityBand.saturationMean.max;
  const minTailJoinRatio = options.minTailJoinRatio ?? 0.028;
  const maxTailJoinRatio = options.maxTailJoinRatio ?? 0.1;
  const maxTailRootRearFuselageRgbDistance =
    options.maxTailRootRearFuselageRgbDistance ?? battleOfBritainAircraftGameIconQualityBand.tailRootRearFuselageRgbDistance.max;
  const minTopBottomBalanceRatio = options.minTopBottomBalanceRatio ?? battleOfBritainAircraftGameIconQualityBand.topBottomBalanceRatio.min;
  const stats = await page.evaluate(async (path) => {
    const image = new Image();
    image.src = path;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("2d canvas unavailable");
    }
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
    const rowCounts = new Array<number>(canvas.height).fill(0);
    const columnCounts = new Array<number>(canvas.width).fill(0);
    const cornerAlphaValues = [
      pixels[3],
      pixels[(canvas.width - 1) * 4 + 3],
      pixels[((canvas.height - 1) * canvas.width) * 4 + 3],
      pixels[(canvas.height * canvas.width - 1) * 4 + 3]
    ];
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = pixels[(y * canvas.width + x) * 4 + 3];
        alphaSum += alpha;
        if (alpha > 8) {
          opaquePixels += 1;
        }
        if (alpha > 16) {
          const offset = (y * canvas.width + x) * 4;
          const luminance = pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
          luminanceSum += luminance;
          luminanceSquareSum += luminance * luminance;
          saturationSum += Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) - Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
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
          if (alpha > 8) {
            edgeVisiblePixels += 1;
          }
        }
      }
    }

    const bboxArea = maxX >= minX && maxY >= minY ? (maxX - minX + 1) * (maxY - minY + 1) : 0;
    const midY = maxY >= minY ? minY + Math.floor((maxY - minY + 1) / 2) : 0;
    const upperHalfPixels = rowCounts.slice(minY, midY).reduce((sum, count) => sum + count, 0);
    const lowerHalfPixels = rowCounts.slice(midY, maxY + 1).reduce((sum, count) => sum + count, 0);
    const regionRgbMean = (x1f: number, x2f: number, y1f: number, y2f: number) => {
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
    const rgbDistance = (a: number[] | null, b: number[] | null) => {
      if (!a || !b) return 999;
      return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
    };
    const tailRootMeanRgb = regionRgbMean(0.12, 0.3, 0.35, 0.65);
    const rearFuselageMeanRgb = regionRgbMean(0.3, 0.48, 0.35, 0.65);
    const tailJoinLeft = maxX >= minX ? minX + Math.round((maxX - minX + 1) * 0.18) : 0;
    const tailJoinRight = maxX >= minX ? minX + Math.round((maxX - minX + 1) * 0.42) : 0;
    let tailJoinPixels = 0;
    if (visiblePixels > 0) {
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = tailJoinLeft; x < tailJoinRight; x += 1) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 16) {
            tailJoinPixels += 1;
          }
        }
      }
    }
    const luminanceMean = visiblePixels > 0 ? luminanceSum / visiblePixels : 0;
    const luminanceVariance = visiblePixels > 0 ? luminanceSquareSum / visiblePixels - luminanceMean * luminanceMean : 0;

    return {
      alphaRatio: alphaSum / (255 * canvas.width * canvas.height),
      alphaBoundingBoxRatio: bboxArea / (canvas.width * canvas.height),
      bboxFillRatio: bboxArea > 0 ? opaquePixels / bboxArea : 0,
      cornerAlphaMax: Math.max(...cornerAlphaValues),
      edgeVisibleRatio: edgeVisiblePixels / edgePixels,
      luminanceMean,
      luminanceStdDev: Math.sqrt(Math.max(0, luminanceVariance)),
      maxColumnCoverage: Math.max(...columnCounts) / canvas.height,
      maxRowCoverage: Math.max(...rowCounts) / canvas.width,
      opaqueRatio: opaquePixels / (canvas.width * canvas.height),
      saturationMean: visiblePixels > 0 ? saturationSum / visiblePixels : 0,
      tailJoinRatio: visiblePixels > 0 ? tailJoinPixels / visiblePixels : 0,
      tailRootMeanRgb,
      rearFuselageMeanRgb,
      tailRootRearFuselageRgbDistance: rgbDistance(tailRootMeanRgb, rearFuselageMeanRgb),
      topBottomBalanceRatio: Math.min(upperHalfPixels, lowerHalfPixels) / Math.max(upperHalfPixels, lowerHalfPixels, 1)
    };
  }, assetPath);

  expect(stats.alphaRatio, `${assetPath} should be a cutout, not a rectangular photo`).toBeLessThan(maxAlphaRatio);
  expect(stats.opaqueRatio, `${assetPath} should retain a readable aircraft body`).toBeGreaterThan(0.05);
  expect(stats.alphaBoundingBoxRatio, `${assetPath} should be a compact aircraft cutout, not a page-size photo card`).toBeLessThan(maxAlphaBoundingBoxRatio);
  expect(stats.bboxFillRatio, `${assetPath} should keep aircraft-specific transparent shape inside its bounding box, not a filled photo rectangle`).toBeLessThan(maxBBoxFillRatio);
  expect(stats.maxRowCoverage, `${assetPath} should not contain a full-width rectangular alpha row`).toBeLessThan(maxRowCoverage);
  expect(stats.maxColumnCoverage, `${assetPath} should not contain a full-height rectangular alpha column`).toBeLessThan(maxColumnCoverage);
  expect(stats.edgeVisibleRatio, `${assetPath} should not keep a visible rectangular photo edge`).toBeLessThan(0.02);
  expect(stats.cornerAlphaMax, `${assetPath} should have transparent corners`).toBeLessThanOrEqual(8);
  expect(stats.luminanceMean, `${assetPath} should stay inside the He 111-derived game icon brightness band: ${JSON.stringify(stats)}`).toBeGreaterThan(minLuminanceMean);
  expect(stats.luminanceMean, `${assetPath} should not become a washed-out flat plate: ${JSON.stringify(stats)}`).toBeLessThan(maxLuminanceMean);
  expect(stats.luminanceStdDev, `${assetPath} should retain He 111-level aircraft skin/material detail instead of a flat fill: ${JSON.stringify(stats)}`).toBeGreaterThan(minLuminanceStdDev);
  expect(stats.luminanceStdDev, `${assetPath} should not become over-contrasted noise: ${JSON.stringify(stats)}`).toBeLessThan(maxLuminanceStdDev);
  expect(stats.saturationMean, `${assetPath} should keep the richer game-unit color band established by He 111: ${JSON.stringify(stats)}`).toBeGreaterThan(minSaturationMean);
  expect(stats.saturationMean, `${assetPath} should not become over-saturated arcade noise: ${JSON.stringify(stats)}`).toBeLessThan(maxSaturationMean);
  expect(stats.tailJoinRatio, `${assetPath} should keep the tail physically integrated with the rear fuselage: ${JSON.stringify(stats)}`).toBeGreaterThan(minTailJoinRatio);
  expect(stats.tailJoinRatio, `${assetPath} should not turn the tail into an oversized detached blob: ${JSON.stringify(stats)}`).toBeLessThan(maxTailJoinRatio);
  expect(
    stats.tailRootRearFuselageRgbDistance,
    `${assetPath} tail color should stay unified with the rear fuselage, not read as a separate patch: ${JSON.stringify(stats)}`
  ).toBeLessThan(maxTailRootRearFuselageRgbDistance);
  expect(stats.topBottomBalanceRatio, `${assetPath} should keep a complete top-down aircraft planform, not a missing upper/lower wing: ${JSON.stringify(stats)}`).toBeGreaterThan(minTopBottomBalanceRatio);
}

async function expectAircraftMarkersHaveNoPhotoCardBackground(
  page: Page,
  markerTestId: string,
  options: { maxImageHeight?: number; maxImageWidth?: number } = {}
) {
  const maxImageWidth = options.maxImageWidth ?? 72;
  const maxImageHeight = options.maxImageHeight ?? 62;
  const findings = await page.getByTestId(markerTestId).evaluateAll((markers) =>
    markers.map((marker) => {
      const image = marker.querySelector<SVGImageElement>(".unit-icon-image");
      const imageBox = image?.getBoundingClientRect();
      const markerBox = marker.getBoundingClientRect();
      const markerTransform = getComputedStyle(marker).transform;
      const scaleMatch = markerTransform.match(/^matrix\(([^,]+),[^,]+,[^,]+,([^,]+),/);
      const markerScaleX = scaleMatch ? Math.abs(Number(scaleMatch[1])) : 1;
      const markerScaleY = scaleMatch ? Math.abs(Number(scaleMatch[2])) : markerScaleX;
      const usesRouteRotation = marker.getAttribute("data-uses-route-rotation") === "true";
      const intrinsicImageWidth = Number(image?.getAttribute("width") ?? 0);
      const intrinsicImageHeight = Number(image?.getAttribute("height") ?? 0);
      return {
        imageHeight: usesRouteRotation ? intrinsicImageHeight * markerScaleY : imageBox?.height ?? 0,
        imageWidth: usesRouteRotation ? intrinsicImageWidth * markerScaleX : imageBox?.width ?? 0,
        markerHeight: markerBox.height,
        markerWidth: markerBox.width
      };
    })
  );

  expect(findings.length).toBeGreaterThan(0);
  for (const finding of findings) {
    expect(finding.imageWidth).toBeLessThanOrEqual(finding.markerWidth + 4);
    expect(finding.imageHeight).toBeLessThanOrEqual(finding.markerHeight + 4);
    expect(finding.imageWidth, `${markerTestId} should be a compact aircraft cutout on the map, not a photo card`).toBeLessThanOrEqual(maxImageWidth);
    expect(finding.imageHeight, `${markerTestId} should be a compact aircraft cutout on the map, not a photo card`).toBeLessThanOrEqual(maxImageHeight);
  }
}

async function expectAirRouteKeepsTrackButAircraftExit(page: Page, shellSelector: string, routeId: string) {
  const route = page.locator(`${shellSelector} .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveClass(/route-air/);
  await expect(route).toHaveAttribute("data-unit-visible", "false");
  await expect(route.locator(".formation-unit")).toHaveCount(0);
  await expect(route.locator(".front-route")).toBeVisible();
  await expect(route).toHaveAttribute("data-route-state", "is-complete");
}

function expectAirRoutesHaveShortUnitWindows(campaignName: string, data: CampaignDataModule, maxHours: number) {
  for (const line of data.frontLines ?? []) {
    if (line.routeKind !== "air" || line.hideUnit) {
      continue;
    }

    expect(line.unitVisibleUntil, `${campaignName} air route ${line.id} should hide aircraft after its sortie`).toBeTruthy();
    const unitStart = toTime(line.unitVisibleFrom ?? line.start);
    const unitEnd = toTime(line.unitVisibleUntil!);
    expect(unitEnd - unitStart, `${campaignName} air route ${line.id} aircraft should not loiter like land/sea units`).toBeLessThanOrEqual(
      maxHours * 60 * 60 * 1000
    );

    if (line.visibleUntil) {
      expect(
        toTime(line.visibleUntil),
        `${campaignName} air route ${line.id} should keep the sortie trail after aircraft leave`
      ).toBeGreaterThanOrEqual(unitEnd);
    }
  }
}

function expectAirRouteUnitsMoveUntilExit(campaignName: string, data: CampaignDataModule) {
  for (const line of data.frontLines ?? []) {
    if (line.routeKind !== "air" || line.hideUnit) {
      continue;
    }

    expect(line.unitVisibleUntil, `${campaignName} air route ${line.id} should define aircraft exit time`).toBeTruthy();
    expect(
      toTime(line.unitVisibleUntil!),
      `${campaignName} air route ${line.id} should not leave aircraft loitering after route motion ends`
    ).toBeLessThanOrEqual(toTime(line.end));
  }
}

function expectBattleOfBritainUsesRealAircraftAndAnchoredAirspace(data: CampaignDataModule) {
  const validAnchors = new Set([
    ...((battleOfBritainData.tacticalTerrainFeatures ?? []) as Array<{ id: string; anchorIds?: string[] }>).flatMap((feature) => [
      feature.id,
      ...(feature.anchorIds ?? [])
    ]),
    ...((battleOfBritainData.fortifiedLines ?? []) as Array<{ id: string }>).map((line) => line.id)
  ]);
  const requiredAircraftIcons = new Set(["britainHurricane", "britainSpitfire", "luftwaffeBf109", "luftwaffeBf110", "luftwaffeDo17", "luftwaffeHe111"]);
  const usedAircraftIcons = new Set<string>();

  for (const line of data.frontLines ?? []) {
    if (line.routeKind !== "air" || line.hideUnit) {
      continue;
    }

    const routeIcons = [line.unitIcon, ...(line.formationUnits ?? []).map((unit) => unit.icon)].filter((icon): icon is string => Boolean(icon));
    expect(routeIcons.length, `battleOfBritain route ${line.id} should explicitly declare real aircraft icons`).toBeGreaterThan(0);
    expect(
      routeIcons.every((icon) => icon !== "ww2Fighter" && icon !== "ww2Bomber"),
      `battleOfBritain route ${line.id} should use real aircraft-type icons, not generic WW2 placeholders`
    ).toBe(true);
    for (const icon of routeIcons) {
      usedAircraftIcons.add(icon);
    }

    expect(line.positionAnchor, `battleOfBritain air route ${line.id} should bind to tactical airspace/sector geometry`).toBeTruthy();
    expect(validAnchors.has(line.positionAnchor!), `battleOfBritain air route ${line.id} anchor ${line.positionAnchor} should exist`).toBe(true);
    for (const extraAnchor of line.positionAnchors ?? []) {
      expect(validAnchors.has(extraAnchor), `battleOfBritain air route ${line.id} secondary anchor ${extraAnchor} should exist`).toBe(true);
    }
  }

  for (const icon of requiredAircraftIcons) {
    expect(usedAircraftIcons.has(icon), `battleOfBritain should display ${icon} as a real aircraft asset`).toBe(true);
  }
}

function expectAtlanticConvoySeaUnitsStayOnline(data: CampaignDataModule) {
  const attackDiscontinued = toTime("1943-03-19T23:00");
  const continuousSeaRoutes = ["raubgraf", "sturmer", "dranger", "allied-escort"];

  for (const groupName of continuousSeaRoutes) {
    const groupRoutes = (data.frontLines ?? []).filter((line) => line.routeKind === "sea" && line.unitGroupId?.includes(groupName));
    expect(groupRoutes.length, `atlantic convoy ${groupName} should have continuous sea route handoffs`).toBeGreaterThan(1);
    expect(
      groupRoutes.some((line) => toTime(line.end) >= attackDiscontinued),
      `atlantic convoy ${groupName} should keep units online until the disengagement/arrival phase`
    ).toBe(true);
  }

  for (const line of data.frontLines ?? []) {
    if (line.routeKind !== "sea" || line.hideUnit) {
      continue;
    }

    if (line.unitIcon === "ww2Submarine" && line.id !== "u384-continuous-track") {
      if (line.hideUnit) {
        continue;
      }
      expect(line.unitVisibleUntil, `atlantic convoy submarine route ${line.id} should not disappear before it sinks or hands off`).toBeFalsy();
      expect(line.retainUnitAfterRouteEnd, `atlantic convoy submarine route ${line.id} should retain through handoff`).toBe(true);
      expect(line.unitGroupId, `atlantic convoy submarine route ${line.id} should declare a continuous group`).toBeTruthy();
    }

    if (line.unitIcon === "ww2EscortShip") {
      expect(line.unitVisibleUntil, `atlantic convoy escort route ${line.id} should not disappear while afloat`).toBeFalsy();
      expect(line.retainUnitAfterRouteEnd, `atlantic convoy escort route ${line.id} should retain through handoff`).toBe(true);
      expect(line.unitGroupId, `atlantic convoy escort route ${line.id} should declare a continuous group`).toBeTruthy();
    }
  }

  const u384Route = (data.frontLines ?? []).find((line) => line.id === "u384-continuous-track");
  expect(u384Route, "atlantic convoy should model U-384 as its own continuous submarine track").toBeTruthy();
  expect(u384Route!.unitIcon).toBe("ww2Submarine");
  expect(u384Route!.start).toBe(data.campaignStart);
  expect(u384Route!.end).toBe("1943-03-19T17:45");
  expect(u384Route!.unitVisibleUntil).toBe("1943-03-19T17:45");
  expect(
    u384Route!.formationUnits?.some((unit) => (unit as { label?: string }).label === "U-384"),
    "atlantic convoy U-384 should be labeled on the continuous route"
  ).toBe(true);

  for (const line of data.frontLines ?? []) {
    if (line.id === "u384-continuous-track") {
      continue;
    }

    expect(
      line.formationUnits?.some((unit) => (unit as { label?: string }).label === "U-384"),
      `atlantic convoy route ${line.id} should not duplicate U-384`
    ).not.toBe(true);
  }
}

function expectAtlanticConvoyEffectsAlignWithTargets(data: CampaignDataModule) {
  const routeTargets: Record<string, { maxDistance: number; routeId: string; times: string[] }> = {
    "hx229-torpedo-spread": {
      routeId: "hx229-convoy-track",
      times: ["1943-03-17T00:45", "1943-03-17T01:30", "1943-03-17T02:15"],
      maxDistance: 0.01
    },
    "sc122-torpedo-spread": {
      routeId: "sc122-convoy-track",
      times: ["1943-03-17T02:00", "1943-03-17T02:10", "1943-03-17T02:25"],
      maxDistance: 0.01
    },
    "u384-depth-charge-attack": { routeId: "u384-continuous-track", times: ["1943-03-19T17:35", "1943-03-19T17:45"], maxDistance: 0.01 }
  };

  for (const effect of data.torpedoAndDepthChargeEffects ?? []) {
    const target = routeTargets[effect.id];
    expect(target, `atlantic convoy effect ${effect.id} should have a checked target route`).toBeTruthy();
    expect(effect.toRouteId, `atlantic convoy effect ${effect.id} should bind impact to the live target route`).toBe(target!.routeId);
    expect(effect.showShellTraces, `atlantic convoy effect ${effect.id} should avoid focus-fire trace animation`).toBe(false);
    const line = (data.frontLines ?? []).find((item) => item.id === target!.routeId);
    expect(line, `atlantic convoy effect ${effect.id} target route exists`).toBeTruthy();
    for (const time of target!.times) {
      const targetPoint = routePointAtDate(data, line!, time);
      const boundImpactPoint = effect.toRouteId ? targetPoint : effect.to;
      const distance = Math.hypot(boundImpactPoint[0] - targetPoint[0], boundImpactPoint[1] - targetPoint[1]);
      expect(distance, `atlantic convoy effect ${effect.id} should hit the live route position at ${time}`).toBeLessThanOrEqual(target!.maxDistance);
    }
  }
}

function pointCoordinatesById(data: CampaignDataModule) {
  return new Map(
    (data.mapPoints ?? [])
      .filter((point): point is { id: string; coordinates: [number, number]; revealAt?: string } => Boolean(point.coordinates))
      .map((point) => [point.id, point.coordinates])
  );
}

function routeCoordinates(data: CampaignDataModule, line: NonNullable<CampaignDataModule["frontLines"]>[number]) {
  const points = pointCoordinatesById(data);
  const from = points.get(line.from);
  const to = points.get(line.to);
  expect(from, `route ${line.id} from coordinate exists`).toBeTruthy();
  expect(to, `route ${line.id} to coordinate exists`).toBeTruthy();
  return [from!, ...(line.waypoints ?? []), to!];
}

function routeDistance(points: Array<[number, number]>) {
  return points.slice(0, -1).reduce((sum, point, index) => {
    const next = points[index + 1];
    return sum + Math.hypot(next[0] - point[0], next[1] - point[1]);
  }, 0);
}

function routePointAtProgress(points: Array<[number, number]>, progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  const total = routeDistance(points);
  let remaining = total * clamped;

  for (let index = 0; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    const segmentLength = Math.hypot(next[0] - point[0], next[1] - point[1]);
    if (remaining <= segmentLength || index === points.length - 2) {
      const ratio = segmentLength === 0 ? 0 : remaining / segmentLength;
      return [point[0] + (next[0] - point[0]) * ratio, point[1] + (next[1] - point[1]) * ratio] as [number, number];
    }
    remaining -= segmentLength;
  }

  return points.at(-1)!;
}

function routeProgressAtDate(line: NonNullable<CampaignDataModule["frontLines"]>[number], date: string) {
  const start = toTime(line.start);
  const end = toTime(line.end);
  return Math.min(1, Math.max(0, (toTime(date) - start) / Math.max(1, end - start)));
}

function dateAtRatio(start: string, end: string, ratio: number) {
  return new Date(toTime(start) + (toTime(end) - toTime(start)) * ratio).toISOString().slice(0, 16);
}

function routePointAtDate(data: CampaignDataModule, line: NonNullable<CampaignDataModule["frontLines"]>[number], date: string) {
  return routePointAtProgress(routeCoordinates(data, line), routeProgressAtDate(line, date));
}

function expectDogfightEffectsHaveLiveAircraft(campaignName: string, data: CampaignDataModule, maxCenterDistanceDegrees: number) {
  for (const effect of data.dogfightEffects ?? []) {
    expect(effect.type, `${campaignName} effect ${effect.id} should use air dogfight visuals`).toBe("dogfight");
    expect(effect.testId, `${campaignName} effect ${effect.id} should expose a stable smoke selector`).toBeTruthy();
    expect(effect.center, `${campaignName} dogfight effect ${effect.id} should declare its contact center`).toBeTruthy();
    expect(effect.routeIds?.length ?? 0, `${campaignName} dogfight effect ${effect.id} should bind to live aircraft routes`).toBeGreaterThanOrEqual(2);
    expectDateWithinRange(`${campaignName} dogfight effect ${effect.id} start`, effect.start, data.campaignStart, data.campaignEnd);
    expectDateWithinRange(`${campaignName} dogfight effect ${effect.id} end`, effect.end, data.campaignStart, data.campaignEnd);
    expect(toTime(effect.end), `${campaignName} dogfight effect ${effect.id} should not end before start`).toBeGreaterThan(toTime(effect.start));

    const midpoint = dateAtRatio(effect.start, effect.end, 0.5);
    const liveRoutes = effect.routeIds!.map((routeId) => {
      const line = (data.frontLines ?? []).find((item) => item.id === routeId);
      expect(line, `${campaignName} dogfight effect ${effect.id} route ${routeId} exists`).toBeTruthy();
      expect(line!.routeKind, `${campaignName} dogfight effect ${effect.id} route ${routeId} should be air`).toBe("air");
      expect(line!.hideUnit, `${campaignName} dogfight effect ${effect.id} route ${routeId} should render aircraft`).not.toBe(true);
      expect(toTime(midpoint), `${campaignName} dogfight effect ${effect.id} route ${routeId} should have started by effect midpoint`).toBeGreaterThanOrEqual(
        toTime(line!.unitVisibleFrom ?? line!.start)
      );
      expect(toTime(midpoint), `${campaignName} dogfight effect ${effect.id} route ${routeId} should still show aircraft at effect midpoint`).toBeLessThanOrEqual(
        toTime(line!.unitVisibleUntil ?? line!.end)
      );
      return line!;
    });

    for (const line of liveRoutes) {
      const point = routePointAtDate(data, line, midpoint);
      const distance = Math.hypot(point[0] - effect.center![0], point[1] - effect.center![1]);
      expect(distance, `${campaignName} dogfight effect ${effect.id} route ${line.id} should be near contact center`).toBeLessThanOrEqual(
        maxCenterDistanceDegrees
      );
    }
  }
}

function expectEventHasActiveRoute(campaignName: string, data: CampaignDataModule, eventId: string, expectedRouteIds: string[]) {
  const event = data.battleEvents.find((item) => item.id === eventId);
  expect(event, `${campaignName} event ${eventId} exists`).toBeTruthy();
  const eventTime = toTime(event!.date);
  const activeRouteIds = (data.frontLines ?? [])
    .filter((line) => eventTime >= toTime(line.start) && eventTime <= toTime(line.end))
    .map((line) => line.id);

  for (const routeId of expectedRouteIds) {
    expect(activeRouteIds, `${campaignName} event ${eventId} should have active route ${routeId}`).toContain(routeId);
  }
}

function expectGaixiaEventHasRoutes(eventId: string, expectedRouteIds: string[]) {
  const event = gaixiaData.battleEvents.find((item) => item.id === eventId);
  expect(event, `gaixia event ${eventId} exists`).toBeTruthy();
  for (const routeId of expectedRouteIds) {
    expect(event!.routeIds, `gaixia event ${eventId} should reference route ${routeId}`).toContain(routeId);
  }
}

function expectGaixiaRouteWindow(routeId: string, expectation: { start?: string; end?: string; visibleUntil?: string; unitVisibleUntil?: string }) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  if (expectation.start) {
    expect(route!.start, `gaixia route ${routeId} start`).toBe(expectation.start);
  }
  if (expectation.end) {
    expect(route!.end, `gaixia route ${routeId} end`).toBe(expectation.end);
  }
  if (expectation.visibleUntil) {
    expect(route!.visibleUntil, `gaixia route ${routeId} visibleUntil`).toBe(expectation.visibleUntil);
  }
  if (expectation.unitVisibleUntil) {
    expect(route!.unitVisibleUntil, `gaixia route ${routeId} unitVisibleUntil`).toBe(expectation.unitVisibleUntil);
  }
}

function expectGaixiaRoutePositionAnchor(routeId: string, expectedAnchor: string) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  expect(route!.positionAnchor, `gaixia route ${routeId} should be tied to a visible position or fieldwork`).toBe(expectedAnchor);
}

function expectGaixiaRouteHasPrelude(routeId: string, minimumPreludePoints: number) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  expect(route!.formationPrelude?.length ?? 0, `gaixia route ${routeId} should keep formation prelude continuity`).toBeGreaterThanOrEqual(
    minimumPreludePoints
  );
}

function routeCoordinate(routeId: string, index: number) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  const point = route!.points[index < 0 ? route!.points.length + index : index];
  expect(point, `gaixia route ${routeId} point ${index} exists`).toBeTruthy();
  return point;
}

function gaixiaRouteCoordinates(routeId: string) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  return route!.points;
}

function minRouteDistance(routeIdA: string, routeIdB: string) {
  const routeA = gaixiaRouteCoordinates(routeIdA);
  const routeB = gaixiaRouteCoordinates(routeIdB);
  return Math.min(...routeA.flatMap((pointA) => routeB.map((pointB) => Math.hypot(pointA[0] - pointB[0], pointA[1] - pointB[1]))));
}

function gaixiaRoutePointAtDate(routeId: string, date: string) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  const progress = Math.min(1, Math.max(0, (toTime(date) - toTime(route!.start)) / Math.max(1, toTime(route!.end) - toTime(route!.start))));
  return routePointAtProgress(route!.points, progress);
}

function expectRouteEndsBehind(frontRouteId: string, rearRouteId: string) {
  const front = routeCoordinate(frontRouteId, -1);
  const rear = routeCoordinate(rearRouteId, -1);
  expect(front[0], `${frontRouteId} should end farther east than ${rearRouteId}`).toBeGreaterThan(rear[0]);
  expect(front[1], `${frontRouteId} should end farther south than ${rearRouteId}`).toBeLessThan(rear[1]);
}

function pointInPolygon(point: [number, number], polygon: Array<[number, number]>) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const crosses =
      currentPoint[1] > point[1] !== previousPoint[1] > point[1] &&
      point[0] < ((previousPoint[0] - currentPoint[0]) * (point[1] - currentPoint[1])) / (previousPoint[1] - currentPoint[1]) + currentPoint[0];
    if (crosses) {
      inside = !inside;
    }
  }
  return inside;
}

function expectRouteOutsidePolygon(routeId: string, polygon: Array<[number, number]>, label: string) {
  const route = gaixiaData.routes.find((item) => item.id === routeId);
  expect(route, `gaixia route ${routeId} exists`).toBeTruthy();
  for (const point of route!.points) {
    expect(pointInPolygon(point, polygon), `${routeId} point ${point.join(",")} should stay outside ${label}`).toBe(false);
  }
}

function expectFormationOutsidePolygon(formationId: string, polygon: Array<[number, number]>, label: string) {
  const formation = gaixiaData.formations.find((item) => item.id === formationId);
  expect(formation, `gaixia formation ${formationId} exists`).toBeTruthy();
  for (const point of formation!.coordinates) {
    expect(pointInPolygon(point, polygon), `${formationId} point ${point.join(",")} should stay outside ${label}`).toBe(false);
  }
}

function expectRouteNearEvent(
  campaignName: string,
  data: CampaignDataModule,
  eventId: string,
  routeId: string,
  maxDistanceDegrees: number,
  minProgress = 0.05
) {
  const event = data.battleEvents.find((item) => item.id === eventId);
  const line = (data.frontLines ?? []).find((item) => item.id === routeId);
  expect(event?.coordinates, `${campaignName} event ${eventId} has coordinates`).toBeTruthy();
  expect(line, `${campaignName} route ${routeId} exists`).toBeTruthy();

  const progress = routeProgressAtDate(line!, event!.date);
  expect(progress, `${campaignName} route ${routeId} should have started before ${eventId}`).toBeGreaterThan(minProgress);
  expect(progress, `${campaignName} route ${routeId} should not have completed long before ${eventId}`).toBeLessThanOrEqual(1);

  const point = routePointAtProgress(routeCoordinates(data, line!), progress);
  const distance = Math.hypot(point[0] - event!.coordinates![0], point[1] - event!.coordinates![1]);
  expect(distance, `${campaignName} route ${routeId} should be near event ${eventId}`).toBeLessThanOrEqual(maxDistanceDegrees);
}

function expectRoutesNearEachOtherAtEvent(
  campaignName: string,
  data: CampaignDataModule,
  eventId: string,
  firstRouteId: string,
  secondRouteId: string,
  maxDistanceDegrees: number
) {
  const event = data.battleEvents.find((item) => item.id === eventId);
  const firstLine = (data.frontLines ?? []).find((item) => item.id === firstRouteId);
  const secondLine = (data.frontLines ?? []).find((item) => item.id === secondRouteId);
  expect(event, `${campaignName} event ${eventId} exists`).toBeTruthy();
  expect(firstLine, `${campaignName} route ${firstRouteId} exists`).toBeTruthy();
  expect(secondLine, `${campaignName} route ${secondRouteId} exists`).toBeTruthy();

  const firstPoint = routePointAtProgress(routeCoordinates(data, firstLine!), routeProgressAtDate(firstLine!, event!.date));
  const secondPoint = routePointAtProgress(routeCoordinates(data, secondLine!), routeProgressAtDate(secondLine!, event!.date));
  const distance = Math.hypot(firstPoint[0] - secondPoint[0], firstPoint[1] - secondPoint[1]);
  expect(distance, `${campaignName} routes ${firstRouteId} and ${secondRouteId} should align at ${eventId}`).toBeLessThanOrEqual(
    maxDistanceDegrees
  );
}

function formationCenter(units: Array<{ label: string; x: number; y: number }>) {
  expect(units.length).toBeGreaterThan(0);
  return {
    x: units.reduce((sum, unit) => sum + unit.x, 0) / units.length,
    y: units.reduce((sum, unit) => sum + unit.y, 0) / units.length
  };
}

function formationBounds(units: Array<{ label: string; x: number; y: number }>) {
  expect(units.length).toBeGreaterThan(0);
  return {
    xMax: Math.max(...units.map((unit) => unit.x)),
    xMin: Math.min(...units.map((unit) => unit.x)),
    yMax: Math.max(...units.map((unit) => unit.y)),
    yMin: Math.min(...units.map((unit) => unit.y))
  };
}

function formationDistance(
  first: Array<{ label: string; x: number; y: number }>,
  second: Array<{ label: string; x: number; y: number }>
) {
  const firstCenter = formationCenter(first);
  const secondCenter = formationCenter(second);
  return Math.hypot(firstCenter.x - secondCenter.x, firstCenter.y - secondCenter.y);
}

async function setTimeline(page: Page, value: number) {
  await page.getByTestId("timeline").fill(String(value));
  await page.waitForTimeout(30);
}

async function expectCannaeActivePinInsideMapCore(page: Page) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const pinBox = await page.locator(".cannae-battle .event-pin.is-current circle").first().boundingBox();
  expect(mapBox).not.toBeNull();
  expect(pinBox).not.toBeNull();
  const centerX = (pinBox?.x ?? 0) + (pinBox?.width ?? 0) / 2;
  const centerY = (pinBox?.y ?? 0) + (pinBox?.height ?? 0) / 2;
  const relativeX = (centerX - (mapBox?.x ?? 0)) / (mapBox?.width ?? 1);
  const relativeY = (centerY - (mapBox?.y ?? 0)) / (mapBox?.height ?? 1);
  expect(relativeX).toBeGreaterThan(0.16);
  expect(relativeX).toBeLessThan(0.86);
  expect(relativeY).toBeGreaterThan(0.12);
  expect(relativeY).toBeLessThan(0.86);
}

async function expectCannaeVisibleUnitCounts(page: Page, minimumRome: number, minimumCarthage: number) {
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-roman-units"))).toBeGreaterThanOrEqual(minimumRome);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-carthage-units"))).toBeGreaterThanOrEqual(minimumCarthage);
}

async function expectCannaeMatureUnitRendering(page: Page, minimumVisibleUnits = 90, maximumVisibleUnits = 170) {
  const renderedIcons = await page.locator(".cannae-battle-unit").count();
  expect(renderedIcons, "Cannae must render independently controlled tactical units, not a few representative blocks").toBeGreaterThanOrEqual(minimumVisibleUnits);
  expect(renderedIcons, "Cannae should not pass by overpacking tiny unreadable units into a visual fog").toBeLessThanOrEqual(maximumVisibleUnits);
  await expect(page.locator(".cannae-density-mark")).toHaveCount(0);
  await expect(page.locator(".cannae-battle .formation-unit.has-force-echelon")).toHaveCount(0);
  await expect(page.locator(".cannae-battle .force-echelon-marker")).toHaveCount(0);
}

async function expectCannaeDoubleEnvelopmentClosed(page: Page) {
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-left-jaw-units"))).toBeGreaterThanOrEqual(4);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-right-jaw-units"))).toBeGreaterThanOrEqual(4);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-rear-closure-units"))).toBeGreaterThanOrEqual(4);
}

async function expectCannaeSideJawsEngaged(page: Page) {
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-left-jaw-units"))).toBeGreaterThanOrEqual(4);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-right-jaw-units"))).toBeGreaterThanOrEqual(4);
}

async function expectCannaeUnitFacing(page: Page, selector: string, expectedFacing: "-1" | "1") {
  await expect(page.locator(selector).first()).toHaveAttribute("data-facing-x", expectedFacing);
}

async function expectCannaeEffectBoundToVisibleRoutes(page: Page, effectTestId: string, routeIds: string[]) {
  await expect(page.getByTestId(effectTestId).first()).toBeVisible();
  for (const routeId of routeIds) {
    const route = page.locator(`.cannae-battle .cannae-route[data-route-id="${routeId}"]`).first();
    await expect(route).toHaveAttribute("data-unit-visible", "true");
    await expect.poll(async () => page.locator(`[data-testid^="cannae-route-unit-${routeId}-"]`).count()).toBeGreaterThan(0);
  }
  const effectRoutes = await page.getByTestId(effectTestId).evaluateAll((effects) =>
    effects.flatMap((effect) => [effect.getAttribute("data-roman-route"), effect.getAttribute("data-carthaginian-route")].filter(Boolean))
  );
  for (const routeId of routeIds) {
    expect(effectRoutes, `Cannae effect ${effectTestId} should bind to ${routeId}`).toContain(routeId);
  }
}

async function clickCannaeEvent(page: Page, name: RegExp) {
  const button = page.getByTestId("event-list").getByRole("button", { name }).first();
  await expect(button).toBeVisible({ timeout: 10_000 });
  await button.click();
}

async function expectCannaeStageUnitEnvelope(page: Page, minimumXFill: number, minimumYFill: number) {
  const fill = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const units = [...document.querySelectorAll(".cannae-battle-unit")]
      .map((unit) => unit.getBoundingClientRect())
      .filter((box) => box.width > 1 && box.height > 1);
    if (!stage || units.length === 0) {
      return null;
    }
    const minX = Math.min(...units.map((box) => box.left + box.width / 2));
    const maxX = Math.max(...units.map((box) => box.left + box.width / 2));
    const minY = Math.min(...units.map((box) => box.top + box.height / 2));
    const maxY = Math.max(...units.map((box) => box.top + box.height / 2));
    return {
      xFill: (maxX - minX) / stage.width,
      yFill: (maxY - minY) / stage.height
    };
  });
  expect(fill, "Cannae visible units should be measurable inside the map stage").not.toBeNull();
  expect(fill!.xFill, "Cannae active battle area should not sit as a small cluster in empty map").toBeGreaterThanOrEqual(minimumXFill);
  expect(fill!.yFill, "Cannae active battle area should fill the oblique tactical viewport").toBeGreaterThanOrEqual(minimumYFill);
}

async function expectCannaeRenderedAsset(page: Page, assetKind: string, assetPath: string) {
  const image = page.locator(`.cannae-unit-image[data-asset-kind="${assetKind}"]`).first();
  await expect(image).toBeVisible();
  const href = await image.getAttribute("href");
  expect(href, `Cannae asset ${assetKind} should use the mature unit image path`).toMatch(
    new RegExp(`^/assets/unit-icons/${assetPath}\\.webp(?:\\?v=[\\w-]+)?$`)
  );
  const response = await page.request.head(`/assets/unit-icons/${assetPath}.webp`);
  expect(response.ok(), `Cannae asset ${assetPath}.webp should be served`).toBe(true);
  expect(response.headers()["content-type"], `Cannae asset ${assetPath}.webp should be an image`).toContain("image");
}

async function expectCannaeNearestUnitDistance(page: Page, firstRouteId: string, secondRouteId: string, maximumDistance: number) {
  const distance = await page.evaluate(
    ([firstRouteId, secondRouteId]) => {
      const boxesFor = (routeId: string) =>
        [...document.querySelectorAll(`[data-testid^="cannae-route-unit-${routeId}-"]`)]
          .map((node) => node.getBoundingClientRect())
          .filter((box) => box.width > 1 && box.height > 1);
      const boxDistance = (first: DOMRect, second: DOMRect) => {
        const dx = Math.max(0, Math.max(first.left - second.right, second.left - first.right));
        const dy = Math.max(0, Math.max(first.top - second.bottom, second.top - first.bottom));
        return Math.hypot(dx, dy);
      };
      const first = boxesFor(firstRouteId);
      const second = boxesFor(secondRouteId);
      if (first.length === 0 || second.length === 0) {
        return null;
      }
      let closest = Number.POSITIVE_INFINITY;
      for (const firstBox of first) {
        for (const secondBox of second) {
          closest = Math.min(closest, boxDistance(firstBox, secondBox));
        }
      }
      return closest;
    },
    [firstRouteId, secondRouteId]
  );
  expect(distance, `Cannae nearest unit distance ${firstRouteId} to ${secondRouteId} should be measurable`).not.toBeNull();
  expect(distance!, `Cannae nearest units ${firstRouteId} to ${secondRouteId} should visibly touch`).toBeLessThanOrEqual(maximumDistance);
}

async function expectCannaeRouteEnvelopeDistance(page: Page, firstRouteId: string, secondRouteId: string, maximumDistance: number) {
  const distance = await page.evaluate(
    ([firstRouteId, secondRouteId]) => {
      const boundsFor = (routeId: string) => {
        const boxes = [...document.querySelectorAll(`[data-testid^="cannae-route-unit-${routeId}-"]`)]
          .map((node) => node.getBoundingClientRect())
          .filter((box) => box.width > 1 && box.height > 1);
        if (boxes.length === 0) {
          return null;
        }
        return {
          maxX: Math.max(...boxes.map((box) => box.left + box.width / 2)),
          maxY: Math.max(...boxes.map((box) => box.top + box.height / 2)),
          minX: Math.min(...boxes.map((box) => box.left + box.width / 2)),
          minY: Math.min(...boxes.map((box) => box.top + box.height / 2))
        };
      };
      const first = boundsFor(firstRouteId);
      const second = boundsFor(secondRouteId);
      if (!first || !second) {
        return null;
      }
      const dx = Math.max(0, Math.max(first.minX - second.maxX, second.minX - first.maxX));
      const dy = Math.max(0, Math.max(first.minY - second.maxY, second.minY - first.maxY));
      return Math.hypot(dx, dy);
    },
    [firstRouteId, secondRouteId]
  );
  expect(distance, `Cannae route distance ${firstRouteId} to ${secondRouteId} should be measurable`).not.toBeNull();
  expect(distance!, `Cannae route distance ${firstRouteId} to ${secondRouteId}`).toBeLessThanOrEqual(maximumDistance);
}

async function setJutlandTimelineDate(page: Page, date: string, bias: "before" | "after" | "nearest" = "nearest") {
  const rawValue = jutlandTimeline.dateToProgress(date) * 1000;
  const value = bias === "before" ? Math.floor(rawValue) : bias === "after" ? Math.ceil(rawValue) + 1 : Math.round(rawValue);
  await setTimeline(page, value);
}

async function expectTrafalgarRepresentativeFleetCount(page: Page, expectedCount: number) {
  await expect(page.locator(".trafalgar-battle .formation-unit")).toHaveCount(expectedCount);
}

async function expectVisibleTrafalgarFleetRoutes(page: Page, expectedRouteIds: string[]) {
  const visibleRoutes = await page
    .locator('.trafalgar-battle .front-line[data-unit-visible="true"]')
    .evaluateAll((routes) => routes.map((route) => route.getAttribute("data-route-id")).filter(Boolean));

  expect(visibleRoutes).toEqual(expectedRouteIds);
}

async function expectTrafalgarLegendIsOneLine(page: Page) {
  const geometry = await page.locator(".trafalgar-battle .map-legend").evaluate((legend) => {
    const legendBox = legend.getBoundingClientRect();
    const itemTops = [...legend.querySelectorAll("span")].map((item) => Math.round(item.getBoundingClientRect().top));
    return {
      height: legendBox.height,
      uniqueRows: new Set(itemTops).size
    };
  });

  expect(geometry.height).toBeLessThan(34);
  expect(geometry.uniqueRows).toBe(1);
}

async function expectTrafalgarShipsStayAtSea(page: Page) {
  const landHits = await page.evaluate(() => {
    const landRegions = [...document.querySelectorAll(".trafalgar-battle .country-core")].filter(
      (element): element is SVGGeometryElement => element instanceof SVGGeometryElement
    );

    return [...document.querySelectorAll(".trafalgar-battle .formation-unit")]
      .map((unit) => {
        const transform = unit.getAttribute("transform") ?? "";
        const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
        if (!match) {
          return null;
        }

        const point = new DOMPoint(Number(match[1]), Number(match[2]));
        const isOnLand = landRegions.some((region) => region.isPointInFill(point));
        return isOnLand ? unit.getAttribute("data-ship-label") : null;
      })
      .filter(Boolean);
  });

  expect(landHits).toEqual([]);
}

async function expectTrafalgarFleetUsesCloseBattleView(page: Page, minimumWidthRatio: number, minimumHeightRatio: number) {
  const spread = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const unitBoxes = [...document.querySelectorAll(".trafalgar-battle .formation-unit")]
      .map((unit) => unit.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0);

    if (!stage || unitBoxes.length === 0) {
      return null;
    }

    const bounds = unitBoxes.reduce(
      (accumulator, box) => ({
        bottom: Math.max(accumulator.bottom, box.bottom),
        left: Math.min(accumulator.left, box.left),
        right: Math.max(accumulator.right, box.right),
        top: Math.min(accumulator.top, box.top)
      }),
      {
        bottom: Number.NEGATIVE_INFINITY,
        left: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        top: Number.POSITIVE_INFINITY
      }
    );

    return {
      heightRatio: (bounds.bottom - bounds.top) / stage.height,
      widthRatio: (bounds.right - bounds.left) / stage.width
    };
  });

  expect(spread).not.toBeNull();
  expect(spread?.widthRatio).toBeGreaterThan(minimumWidthRatio);
  expect(spread?.heightRatio).toBeGreaterThan(minimumHeightRatio);
}

async function midwayCarrierCenters(page: Page, carrierIds: string[]) {
  return page.locator(".midway-carrier-marker:not(.is-sunk)").evaluateAll((markers, ids) => {
    const wanted = new Set(ids);
    return markers
      .filter((marker) => wanted.has(marker.getAttribute("data-carrier-id") ?? ""))
      .map((marker) => {
        const transform = marker.getAttribute("transform") ?? "";
        const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
        return {
          facingX: marker.getAttribute("data-facing-x") ?? "",
          formationId: marker.getAttribute("data-formation-id") ?? "",
          id: marker.getAttribute("data-carrier-id") ?? "",
          offsetAlong: Number(marker.getAttribute("data-unit-offset-along")),
          x: Number(match?.[1] ?? Number.NaN),
          y: Number(match?.[2] ?? Number.NaN)
        };
      });
  }, carrierIds);
}

function expectCarrierSpread(carriers: Array<{ x: number; y: number }>, minimumSpread: number) {
  const xs = carriers.map((carrier) => carrier.x);
  const ys = carriers.map((carrier) => carrier.y);
  const spread = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  expect(spread).toBeGreaterThan(minimumSpread);
}

async function expectMidwayCarrierNearCurrentEvent(page: Page, carrierId: "yorktown" | "hiryu", maxDistance: number) {
  const [carrier] = await midwayCarrierCenters(page, [carrierId]);
  expect(carrier).toBeTruthy();
  const currentEventPoint = await page.locator(".midway-battle .event-pin.is-current > circle[cx][cy]").first().evaluate((circle) => ({
    x: Number(circle.getAttribute("cx")),
    y: Number(circle.getAttribute("cy"))
  }));

  expect(Math.hypot(carrier.x - currentEventPoint.x, carrier.y - currentEventPoint.y)).toBeLessThan(maxDistance);
}

async function expectMapPointInsideHistoricalRegion(page: Page, pointId: string, regionId: string) {
  await expectMapPointInsideSvgFill(page, pointId, `historical-region-${regionId}`);
}

async function expectMapPointInsideExactlyOneHistoricalRegion(page: Page, pointId: string, expectedRegionId: string) {
  const matchingRegions = await page.evaluate((targetPointId) => {
    const pointCircle = document.querySelector(`[data-testid="map-point-${targetPointId}"] circle`);
    const regions = [...document.querySelectorAll('[data-testid^="historical-region-"]')];

    if (!(pointCircle instanceof SVGCircleElement)) {
      return [];
    }

    const point = new DOMPoint(Number(pointCircle.getAttribute("cx")), Number(pointCircle.getAttribute("cy")));
    return regions
      .filter((region): region is SVGGeometryElement => region instanceof SVGGeometryElement)
      .filter((region) => region.isPointInFill(point))
      .map((region) => region.getAttribute("data-testid")?.replace("historical-region-", ""));
  }, pointId);

  expect(matchingRegions).toEqual([expectedRegionId]);
}

async function expectHistoricalRegionsDoNotOverlap(page: Page) {
  const overlaps = await page.evaluate(() => {
    const regions = [...document.querySelectorAll('[data-testid^="historical-region-"]')].filter(
      (region): region is SVGGeometryElement => region instanceof SVGGeometryElement
    );
    const mapStage = document.querySelector('[data-testid="map-stage"]');

    if (!(mapStage instanceof HTMLElement)) {
      return ["missing-map-stage"];
    }

    const mapBox = mapStage.getBoundingClientRect();
    const regionBoxes = regions.map((region) => ({
      id: region.getAttribute("data-testid")?.replace("historical-region-", "") ?? "unknown",
      box: region.getBBox(),
      region
    }));
    const minX = Math.max(0, Math.min(...regionBoxes.map(({ box }) => box.x)));
    const maxX = Math.min(mapBox.width, Math.max(...regionBoxes.map(({ box }) => box.x + box.width)));
    const minY = Math.max(0, Math.min(...regionBoxes.map(({ box }) => box.y)));
    const maxY = Math.min(mapBox.height, Math.max(...regionBoxes.map(({ box }) => box.y + box.height)));
    const found: string[] = [];

    for (let y = minY; y <= maxY; y += 18) {
      for (let x = minX; x <= maxX; x += 18) {
        const point = new DOMPoint(x, y);
        const hits = regionBoxes.filter(({ region }) => region.isPointInFill(point)).map(({ id }) => id);
        if (hits.length > 1) {
          found.push(`${hits.join("+")}@${Math.round(x)},${Math.round(y)}`);
        }
      }
    }

    return found.slice(0, 10);
  });

  expect(overlaps).toEqual([]);
}

async function expectMapPointInsideHistoricalControl(page: Page, pointId: string, regionId: string) {
  await expectMapPointInsideSvgFill(page, pointId, `historical-control-${regionId}`);
}

async function expectMapPointInsideSvgFill(page: Page, pointId: string, testId: string) {
  const isInside = await page.evaluate(
    ({ pointId: targetPointId, targetTestId }) => {
      const region = document.querySelector(`[data-testid="${targetTestId}"]`);
      const pointCircle = document.querySelector(`[data-testid="map-point-${targetPointId}"] circle`);

      if (!(region instanceof SVGGeometryElement) || !(pointCircle instanceof SVGCircleElement)) {
        return false;
      }

      const point = new DOMPoint(Number(pointCircle.getAttribute("cx")), Number(pointCircle.getAttribute("cy")));
      return region.isPointInFill(point);
    },
    { pointId, targetTestId: testId }
  );

  expect(isInside).toBe(true);
}

async function expectUnitIconFacesRoute(
  page: Page,
  routeId: string,
  expectedFacingX: "-1" | "1",
  expectedMirrorX: "-1" | "1"
) {
  const orientation = page.locator(`.front-line[data-route-id="${routeId}"] .unit-icon-orientation`).first();
  const marker = orientation.locator(".unit-marker").first();

  await expect(marker).toBeVisible();
  const transform = await orientation.getAttribute("transform");
  expect(transform).toMatch(/^translate\(-?\d+(?:\.\d+)? -?\d+(?:\.\d+)?\)$/);
  expect(transform).not.toContain("rotate");
  await expect(orientation).toHaveAttribute("data-facing-x", expectedFacingX);
  await expect(marker).toHaveAttribute("data-facing-x", expectedFacingX);
  await expect(marker).toHaveAttribute("data-mirror-x", expectedMirrorX);
}

function angularDistanceDegrees(a: number, b: number) {
  return Math.abs((((a - b + 180) % 360) + 360) % 360 - 180);
}

async function battleOfBritainRouteRotation(page: Page, routeId: string) {
  const marker = page
    .locator(`.battle-of-britain .front-line[data-route-id="${routeId}"][data-unit-visible="true"] .unit-icon-orientation .unit-marker[data-uses-route-rotation="true"]`)
    .first();
  await expect(marker).toBeVisible();

  const sample = await marker.evaluate((unitMarker) => {
    const orientation = unitMarker.closest(".unit-icon-orientation");
    const facingGroup = unitMarker.querySelector(".unit-icon-facing");
    return {
      markerRotation: Number(unitMarker.getAttribute("data-rotation-deg")),
      mirrorX: unitMarker.getAttribute("data-mirror-x") ?? "",
      orientationRotation: Number(orientation?.getAttribute("data-route-rotation-deg")),
      transform: facingGroup?.getAttribute("transform") ?? ""
    };
  });

  expect(Number.isFinite(sample.markerRotation), `${routeId} should expose a finite aircraft route rotation`).toBe(true);
  expect(angularDistanceDegrees(sample.markerRotation, sample.orientationRotation), `${routeId} marker rotation should match route direction`).toBeLessThan(0.5);
  expect(sample.mirrorX, `${routeId} top-down aircraft should not use left/right mirror as its main heading logic`).toBe("1");
  expect(sample.transform, `${routeId} top-down aircraft image should rotate with its current route segment`).toMatch(/^rotate\(-?\d+(?:\.\d+)?\)$/);
  return sample.markerRotation;
}

async function expectBattleOfBritainAircraftRotatesWithRoutes(page: Page) {
  const samples = await page.evaluate(() => {
    const signedDegrees = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;

    return [...document.querySelectorAll('.battle-of-britain .front-line[data-unit-visible="true"] .unit-icon-orientation')]
      .map((orientation) => {
        const unitMarker = orientation.querySelector('.unit-marker[data-uses-route-rotation="true"]');
        const facingGroup = unitMarker?.querySelector(".unit-icon-facing");
        const route = orientation.closest(".front-line");
        const markerRotation = Number(unitMarker?.getAttribute("data-rotation-deg"));
        const routeRotation = Number(orientation.getAttribute("data-route-rotation-deg"));
        return {
          assetKind: unitMarker?.querySelector(".unit-icon-image")?.getAttribute("data-asset-kind") ?? "",
          markerRotation,
          mirrorX: unitMarker?.getAttribute("data-mirror-x") ?? "",
          routeId: route?.getAttribute("data-route-id") ?? "",
          routeRotation,
          signedRotation: signedDegrees(markerRotation),
          transform: facingGroup?.getAttribute("transform") ?? "",
          usesRouteRotation: unitMarker?.getAttribute("data-uses-route-rotation") ?? ""
        };
      })
      .filter((sample) => sample.usesRouteRotation === "true" && Number.isFinite(sample.markerRotation) && Number.isFinite(sample.routeRotation));
  });

  expect(samples.length, "Battle of Britain should expose route-rotating top-down aircraft markers during combat").toBeGreaterThan(8);
  for (const sample of samples) {
    expect(sample.assetKind, `Unexpected non-London aircraft marker in route-rotation set: ${JSON.stringify(sample)}`).toMatch(/^(britain|luftwaffe)/);
    expect(sample.mirrorX, `Top-down aircraft should rotate, not flip, for route ${sample.routeId}`).toBe("1");
    expect(sample.transform, `Aircraft image should use SVG rotation for route ${sample.routeId}`).toMatch(/^rotate\(-?\d+(?:\.\d+)?\)$/);
    expect(angularDistanceDegrees(sample.markerRotation, sample.routeRotation), `Aircraft marker rotation should match route ${sample.routeId}: ${JSON.stringify(sample)}`).toBeLessThan(0.5);
  }

  const roundedHeadings = new Set(samples.map((sample) => Math.round(sample.signedRotation / 10) * 10));
  expect(roundedHeadings.size, `Battle of Britain aircraft should not all fly at one fixed heading: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(4);
  expect(samples.filter((sample) => Math.abs(sample.signedRotation) > 8).length, `Battle of Britain should include non-horizontal aircraft headings: ${JSON.stringify(samples)}`).toBeGreaterThan(4);
}

async function expectCompactAircraftMarkers(
  page: Page,
  markerTestId:
    | "britain-hurricane-marker"
    | "britain-spitfire-marker"
    | "luftwaffe-bf109-marker"
    | "luftwaffe-bf110-marker"
    | "luftwaffe-do17-marker"
    | "luftwaffe-he111-marker"
    | "ww2-attack-aircraft-marker"
    | "ww2-bomber-marker"
    | "ww2-fighter-marker"
) {
  const boxes = await page
    .getByTestId(markerTestId)
    .evaluateAll((markers) =>
      markers.map((marker) => {
        const box = marker.getBoundingClientRect();
        const image = marker.querySelector(".unit-icon-image");
        const usesRouteRotation = marker.getAttribute("data-uses-route-rotation") === "true";
        return {
          height: box.height,
          imageHeight: Number(image?.getAttribute("height")),
          imageWidth: Number(image?.getAttribute("width")),
          usesRouteRotation,
          width: box.width
        };
      })
    );

  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    if (box.usesRouteRotation) {
      expect(box.imageWidth).toBeLessThan(82);
      expect(box.imageHeight).toBeLessThan(70);
      expect(box.width).toBeLessThan(104);
      expect(box.height).toBeLessThan(104);
    } else {
      expect(box.width).toBeLessThan(126);
      expect(box.height).toBeLessThan(74);
    }
  }
}

async function expectBattleOfBritainAircraftProportions(page: Page) {
  const boxes = await page.evaluate(() => {
    const markerIds = [
      "luftwaffe-bf109-marker",
      "britain-spitfire-marker",
      "britain-hurricane-marker",
      "luftwaffe-bf110-marker",
      "luftwaffe-do17-marker",
      "luftwaffe-he111-marker"
    ];
    return Object.fromEntries(
      markerIds.map((markerId) => {
        const marker = document.querySelector(`[data-testid="${markerId}"]`);
        const image = marker?.querySelector(".unit-icon-image");
        return [markerId, { height: Number(image?.getAttribute("height") ?? 0), width: Number(image?.getAttribute("width") ?? 0) }];
      })
    );
  });

  const bf109 = boxes["luftwaffe-bf109-marker"];
  const spitfire = boxes["britain-spitfire-marker"];
  const hurricane = boxes["britain-hurricane-marker"];
  const bf110 = boxes["luftwaffe-bf110-marker"];
  const do17 = boxes["luftwaffe-do17-marker"];
  const he111 = boxes["luftwaffe-he111-marker"];

  for (const [markerId, box] of Object.entries(boxes)) {
    expect(box.width, `${markerId} should be visible before checking relative aircraft scale`).toBeGreaterThan(20);
    expect(box.height, `${markerId} should be visible before checking relative aircraft scale`).toBeGreaterThan(8);
  }
  expect(spitfire.height, "Spitfire should not be smaller than the compact Bf 109 marker").toBeGreaterThan(bf109.height);
  expect(hurricane.height, "Hurricane should not be smaller than the compact Bf 109 marker").toBeGreaterThan(bf109.height);
  expect(bf110.height, "Bf 110 should read as a larger twin-engine fighter in top-down view").toBeGreaterThan(spitfire.height * 1.1);
  expect(do17.height, "Do 17 bomber should be visibly larger than RAF single-engine fighters").toBeGreaterThan(spitfire.height * 1.18);
  expect(he111.height, "He 111 should be the largest London aircraft marker").toBeGreaterThan(do17.height);
  expect(he111.width, "He 111 should keep broad bomber wing presence in top-down view").toBeGreaterThan(bf109.width * 1.35);
  expect(he111.height, "He 111 marker should stay compact enough for air-combat clusters").toBeLessThan(74);
}

async function eventRailPositionByTitle(page: Page, titlePattern: RegExp) {
  return page
    .getByTestId("event-rail")
    .locator("button")
    .evaluateAll((buttons, patternSource) => {
      const pattern = new RegExp(patternSource);
      const button = buttons.find((item) => pattern.test(item.getAttribute("title") ?? ""));
      return button ? Number.parseFloat((button as HTMLElement).style.left) : Number.NaN;
    }, titlePattern.source);
}

async function expectScoreUsesMusic(page: Page, expectedSource: string) {
  await expect(page.getByTestId("score-toggle")).toHaveAttribute("data-music-source", expectedSource);
  const response = await page.request.head(expectedSource);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/audio|ogg|mpeg/);
  expect(Number(response.headers()["content-length"])).toBeGreaterThan(900_000);
}

function nianzhuangEvent(eventId: string) {
  const event = nianzhuangData.battleEvents.find((item) => item.id === eventId);
  expect(event, `nianzhuang event ${eventId} exists`).toBeTruthy();
  return event!;
}

function nianzhuangRoute(routeId: string) {
  const route = nianzhuangData.frontLines.find((item) => item.id === routeId);
  expect(route, `nianzhuang route ${routeId} exists`).toBeTruthy();
  return route!;
}

function expectNianzhuangEventFocus(eventId: string, routeIds: string[]) {
  const event = nianzhuangEvent(eventId);
  for (const routeId of routeIds) {
    expect(event.mapFocus, `nianzhuang event ${eventId} should reference ${routeId}`).toContain(routeId);
  }
}

function expectNianzhuangRouteWindow(
  routeId: string,
  expectation: Partial<
    Pick<
      NonNullable<CampaignDataModule["frontLines"]>[number],
      "end" | "retainRouteTailRatio" | "start" | "unitVisibleFrom" | "unitVisibleUntil" | "visibleFrom" | "visibleUntil"
    >
  >
) {
  const route = nianzhuangRoute(routeId);
  if (expectation.start) {
    expect(route.start, `nianzhuang route ${routeId} start`).toBe(expectation.start);
  }
  if (expectation.end) {
    expect(route.end, `nianzhuang route ${routeId} end`).toBe(expectation.end);
  }
  if (expectation.visibleUntil) {
    expect(route.visibleUntil, `nianzhuang route ${routeId} visibleUntil`).toBe(expectation.visibleUntil);
  }
  if (expectation.visibleFrom) {
    expect(route.visibleFrom, `nianzhuang route ${routeId} visibleFrom`).toBe(expectation.visibleFrom);
  }
  if (expectation.unitVisibleUntil) {
    expect(route.unitVisibleUntil, `nianzhuang route ${routeId} unitVisibleUntil`).toBe(expectation.unitVisibleUntil);
  }
  if (expectation.unitVisibleFrom) {
    expect(route.unitVisibleFrom, `nianzhuang route ${routeId} unitVisibleFrom`).toBe(expectation.unitVisibleFrom);
  }
  if (expectation.retainRouteTailRatio) {
    expect(route.retainRouteTailRatio, `nianzhuang route ${routeId} retainRouteTailRatio`).toBe(expectation.retainRouteTailRatio);
  }
}

function expectNianzhuangRouteNotVisibleBeforeUnit(routeId: string) {
  const route = nianzhuangRoute(routeId);
  expect(route.unitVisibleFrom, `nianzhuang route ${routeId} should delay unit visibility instead of crowding at deployment start`).toBeTruthy();
  expect(toTime(route.unitVisibleFrom!), `nianzhuang route ${routeId} unitVisibleFrom should be after route start`).toBeGreaterThan(toTime(route.start));
}

function expectNianzhuangRouteUsesSource(routeId: string, from: string, to: string, minimumWaypoints = 0) {
  const route = nianzhuangRoute(routeId);
  expect(route.from, `nianzhuang route ${routeId} source`).toBe(from);
  expect(route.to, `nianzhuang route ${routeId} target`).toBe(to);
  expect(route.waypoints?.length ?? 0, `nianzhuang route ${routeId} waypoint count`).toBeGreaterThanOrEqual(minimumWaypoints);
}

function expectNianzhuangRouteHasPrelude(routeId: string, minimumPreludePoints: number) {
  const route = nianzhuangRoute(routeId);
  expect(route.formationPrelude?.length ?? 0, `nianzhuang route ${routeId} should keep formation prelude continuity`).toBeGreaterThanOrEqual(minimumPreludePoints);
}

function expectNianzhuangCommunistUnitHandoff(fromRouteId: string, toRouteIds: string[]) {
  const fromRoute = nianzhuangRoute(fromRouteId);
  expect(fromRoute.faction, `${fromRouteId} should be a PLA handoff source`).toBe("communist");
  expect(fromRoute.unitVisibleUntil, `${fromRouteId} should keep its unit visible until handoff`).toBeTruthy();
  const fromExit = toTime(fromRoute.unitVisibleUntil!);

  const hasContinuousSuccessor = toRouteIds.some((toRouteId) => {
    const toRoute = nianzhuangRoute(toRouteId);
    expect(toRoute.faction, `${toRouteId} should be a PLA handoff successor`).toBe("communist");
    const successorEntry = toTime(toRoute.unitVisibleFrom ?? toRoute.start);
    return successorEntry <= fromExit;
  });

  expect(hasContinuousSuccessor, `${fromRouteId} should hand off before its unit disappears`).toBe(true);
}

function expectNianzhuangNationalistUnitHandoff(fromRouteId: string, toRouteIds: string[]) {
  const fromRoute = nianzhuangRoute(fromRouteId);
  expect(fromRoute.faction, `${fromRouteId} should be a Huang force handoff source`).toBe("nationalist");
  expect(fromRoute.unitVisibleUntil, `${fromRouteId} should keep its unit visible until handoff or destruction`).toBeTruthy();
  const fromExit = toTime(fromRoute.unitVisibleUntil!);

  const hasContinuousSuccessor = toRouteIds.some((toRouteId) => {
    const toRoute = nianzhuangRoute(toRouteId);
    expect(toRoute.faction, `${toRouteId} should be a Huang force handoff successor`).toBe("nationalist");
    const successorEntry = toTime(toRoute.unitVisibleFrom ?? toRoute.start);
    return successorEntry <= fromExit;
  });

  expect(hasContinuousSuccessor, `${fromRouteId} should hand off to a later Huang force route before disappearing`).toBe(true);
}

function expectNianzhuangRouteHasBadges(routeId: string, badges: string[]) {
  const route = nianzhuangRoute(routeId);
  const routeBadges = new Set((route.formationUnits ?? []).map((unit) => unit.badgeLabel).filter(Boolean));
  for (const badge of badges) {
    expect(routeBadges.has(badge), `${routeId} should keep ${badge} as a visible residual unit`).toBe(true);
  }
}

function expectNianzhuangRouteHasUnitCount(routeId: string, minimumCount: number) {
  const route = nianzhuangRoute(routeId);
  expect(route.formationUnits?.length ?? 0, `${routeId} should carry enough visible combat units`).toBeGreaterThanOrEqual(minimumCount);
}

function expectNianzhuangRoutePositionAnchor(routeId: string, expectedAnchor: string) {
  const route = nianzhuangRoute(routeId);
  expect(route.positionAnchor, `nianzhuang route ${routeId} should bind to terrain or fieldwork`).toBe(expectedAnchor);
}

function expectNianzhuangAllRoutesUseVisibleAnchors() {
  const validAnchors = new Set([
    ...nianzhuangData.mapPoints.map((point) => point.id),
    ...(nianzhuangData.fortifiedLines ?? []).map((line) => line.id),
    ...(nianzhuangData.fragmentedLines ?? []).map((line) => line.id),
    ...(nianzhuangData.tacticalTerrainFeatures ?? []).flatMap((feature) => [feature.id, ...(feature.anchorIds ?? [])])
  ]);
  for (const route of nianzhuangData.frontLines) {
    expect(route.positionAnchor, `nianzhuang route ${route.id} should declare a tactical anchor`).toBeTruthy();
    expect(validAnchors.has(route.positionAnchor!), `nianzhuang route ${route.id} anchor ${route.positionAnchor} should exist`).toBe(true);
  }
}

async function expectNianzhuangRouteAnchorHighlighted(page: Page, routeId: string) {
  const anchor = nianzhuangRoute(routeId).positionAnchor;
  expect(anchor, `${routeId} should have a position anchor`).toBeTruthy();
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toHaveAttribute("data-position-anchor", anchor!);

  const lineAnchor = page.getByTestId(`fortified-line-${anchor}`);
  if ((await lineAnchor.count()) > 0) {
    await expect(lineAnchor).toHaveAttribute("data-route-anchor", "true");
    return;
  }

  const terrainAnchor = page.locator(`.nianzhuang-battle .tactical-terrain-feature[data-terrain-id="${anchor}"]`);
  await expect(terrainAnchor).toBeVisible();
  await expect(terrainAnchor).toHaveAttribute("data-route-anchor", "true");
}

function expectNianzhuangDestructionSite(id: string, label: string, revealAt = "1948-11-22T18:00") {
  const marker = nianzhuangData.mapOverlays.find((overlay) => overlay.id === id);
  expect(marker, `Nianzhuang destruction marker ${id} exists`).toBeTruthy();
  expect(marker?.type).toBe("marker");
  expect(marker?.label, `Nianzhuang destruction marker ${id} label`).toBe(label);
  expect(marker?.revealAt, `Nianzhuang destruction marker ${id} should not reveal before final outcome`).toBe(revealAt);
}

function expectNianzhuangTimelinePacing() {
  const timeline = createCampaignTimeline({
    activeSpans: nianzhuangData.timelineActiveSpans,
    campaignEnd: nianzhuangData.campaignEnd,
    campaignStart: nianzhuangData.campaignStart,
    dateAnchors: nianzhuangData.timelineDateAnchors,
    events: nianzhuangData.battleEvents,
    gapOverrides: nianzhuangData.timelineGapOverrides,
    inactiveGapDisplayDays: nianzhuangData.timelineInactiveGapDisplayDays,
    points: nianzhuangData.mapPoints,
    timingMode: "compressed"
  });
  const progressSpan = (start: string, end: string) => timeline.dateToProgress(end) - timeline.dateToProgress(start);
  const generalAssaultShare = progressSpan("1948-11-19T10:00", nianzhuangData.campaignEnd);
  const nightAssaultShare = progressSpan("1948-11-19T21:15", nianzhuangData.campaignEnd);
  const firstWall = progressSpan("1948-11-19T21:15", "1948-11-19T22:30");
  const secondWall = progressSpan("1948-11-19T22:30", "1948-11-20T03:30");
  const finalCore = progressSpan("1948-11-20T03:30", "1948-11-20T05:15");
  const remnantCleanup = progressSpan("1948-11-20T05:30", "1948-11-22T16:00");

  expect(generalAssaultShare, "Nianzhuang general assault and aftermath should be about half the film, not most of it").toBeGreaterThan(0.48);
  expect(generalAssaultShare, "Nianzhuang general assault and aftermath should be about half the film, not most of it").toBeLessThan(0.54);
  expect(nightAssaultShare, "Nianzhuang night assault should still leave meaningful room for pursuit and encirclement setup").toBeLessThan(0.5);
  expect(firstWall, "first wall breach should get visible playback time").toBeGreaterThan(0.04);
  expect(secondWall, "second wall breach should be slower than the first-wall rush").toBeGreaterThan(firstWall);
  expect(finalCore, "inner core compression should be readable").toBeGreaterThan(0.05);
  expect(remnantCleanup, "remnant cleanup should remain long enough to show village-by-village movement").toBeGreaterThan(0.22);
  expect(timeline.dateToProgress("1948-11-22T16:00"), "final pursuit should not start at the very end of playback").toBeLessThan(0.92);
}

async function expectNianzhuangNoResultSpoilers(page: Page) {
  const mapText = await page
    .locator(".nianzhuang-battle .map-stage")
    .evaluate((stage) => stage.textContent ?? "");

  expect(mapText, "Nianzhuang map should not reveal destruction sites before final outcome").not.toMatch(/被歼|覆灭|终局点/);
  await expect(page.getByTestId("nianzhuang-destruction-site-25")).toHaveCount(0);
  await expect(page.getByTestId("nianzhuang-destruction-site-64")).toHaveCount(0);
  await expect(page.getByTestId("nianzhuang-destruction-site-44-100")).toHaveCount(0);
  await expect(page.getByTestId("nianzhuang-destruction-site-command")).toHaveCount(0);
  await expect(page.getByTestId("nianzhuang-huang-death-site")).toHaveCount(0);
}

function expectNianzhuangEffectUsesRoutes(effectId: string, fromRouteId: string, toRouteId: string) {
  const effect = nianzhuangData.battleEffects.find((item) => item.id === effectId);
  expect(effect, `nianzhuang effect ${effectId} exists`).toBeTruthy();
  expect(effect?.type).toBe("salvo");
  if (effect?.type === "salvo") {
    expect(effect.fromRouteId).toBe(fromRouteId);
    expect(effect.toRouteId).toBe(toRouteId);
  }
}
async function expectRouteVisibleWithUnit(page: Page, routeId: string) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("data-route-visible", "true");
  await expect(route).toHaveAttribute("data-unit-visible", "true");
  await expect(route.locator(".formation-unit").first()).toBeVisible();
}

async function expectRouteUnitLabels(page: Page, routeId: string, labels: RegExp[]) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  for (const label of labels) {
    await expect(route.locator(".formation-unit-label").filter({ hasText: label }).first()).toBeVisible();
  }
}

async function expectRouteVisible(page: Page, routeId: string) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("data-route-visible", "true");
}

async function expectRouteVisibleState(page: Page, routeId: string) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toHaveCount(1);
  await expect(route).toHaveAttribute("data-route-visible", "true");
  await expect(route).toHaveAttribute("data-route-rendered", "true");
}

async function expectNianzhuangRouteHeadDotsRemoved(page: Page) {
  await expect(page.locator(".nianzhuang-battle .route-stroke-shell > circle")).toHaveCount(0);
}

async function expectNianzhuangFormationDotsRemoved(page: Page) {
  await expect(page.locator(".nianzhuang-battle .nianzhuang-formation-ranks circle")).toHaveCount(0);
  await expect(page.locator(".nianzhuang-battle .nianzhuang-command-post-icon circle")).toHaveCount(0);
  await expect(page.locator(".nianzhuang-battle .nianzhuang-formation-rank-mark").first()).toBeVisible();
}

async function expectRouteTransitionPhase(page: Page, routeId: string, phase: "entering" | "exiting" | "present") {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("data-route-rendered", "true");
  await expect(route).toHaveAttribute("data-scene-transition-phase", phase);
  const opacity = Number(await route.getAttribute("data-scene-transition-opacity"));
  if (phase === "present") {
    expect(opacity, `${routeId} should be fully present`).toBeGreaterThan(0.98);
  } else {
    expect(opacity, `${routeId} should be visually blended during ${phase}`).toBeGreaterThan(0.05);
    expect(opacity, `${routeId} should not hard-cut during ${phase}`).toBeLessThan(0.98);
  }
}

async function expectRouteShellWithUnitOnly(page: Page, routeId: string) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("data-route-visible", "false");
  await expect(route).toHaveAttribute("data-unit-rendered", "true");
  await expect(route.locator(".front-route")).toHaveCount(0);
  await expect(route.locator(".formation-unit").first()).toBeVisible();
}

async function expectRouteNotCurrentWithRenderedUnit(page: Page, routeId: string) {
  const route = page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
  await expect(route).toBeVisible();
  await expect(route).toHaveAttribute("data-route-visible", "false");
  await expect(route).toHaveAttribute("data-unit-rendered", "true");
  await expect(route.locator(".formation-unit").first()).toBeVisible();
}

async function expectFortifiedLineTransitionPhase(page: Page, lineId: string, phase: "entering" | "exiting" | "present") {
  const line = page.getByTestId(`fortified-line-${lineId}`);
  await expect(line).toBeVisible();
  await expect(line).toHaveAttribute("data-scene-transition-phase", phase);
}

async function expectNianzhuangLargeBattlefield(page: Page) {
  const viewBox = await page.locator(".nianzhuang-battle .battle-map").getAttribute("viewBox");
  expect(viewBox).toBe("0 0 4800 2880");
}

async function expectNianzhuangFortifiedLineColor(page: Page, lineId: string, side: "nationalist" | "pla") {
  const color = await page.getByTestId(`fortified-line-${lineId}`).locator(".fortified-line-body").evaluate((node) => {
    const stroke = window.getComputedStyle(node).stroke;
    const match = stroke.match(/rgba?\(([^)]+)\)/);
    const parts = match ? match[1].split(",").map((part) => Number.parseFloat(part.trim())) : [0, 0, 0, 1];
    return { alpha: parts.length >= 4 ? parts[3] : 1, b: parts[2] ?? 0, g: parts[1] ?? 0, r: parts[0] ?? 0, stroke };
  });

  if (side === "pla") {
    expect(color.r - color.b, `${lineId} should read as PLA encirclement red, not the same color as defensive rings: ${JSON.stringify(color)}`).toBeGreaterThan(70);
    expect(color.alpha, `${lineId} should remain visible after color separation`).toBeGreaterThan(0.7);
    return;
  }

  expect(color.b - color.r, `${lineId} should read as Nationalist defensive blue/gray, not PLA red/yellow: ${JSON.stringify(color)}`).toBeGreaterThan(25);
  expect(color.alpha, `${lineId} should remain visible after color separation`).toBeGreaterThan(0.7);
}

async function expectNianzhuangEncirclementAndOuterDefense(page: Page) {
  await expect(page.getByTestId("fortified-line-layer")).toBeVisible();
  await expect(page.getByTestId("fortified-line-pla-encirclement")).toContainText("华野包围圈");
  await expect(page.getByTestId("fortified-line-outer-defense")).toContainText("第一道村落防线");
  await expectNianzhuangFortifiedLineColor(page, "pla-encirclement", "pla");
  await expectNianzhuangFortifiedLineColor(page, "outer-defense", "nationalist");
}

async function expectNianzhuangInnerDefense(page: Page) {
  await expect(page.getByTestId("fortified-line-second-defense")).toContainText("第二道围墙");
  await expectNianzhuangFortifiedLineColor(page, "second-defense", "nationalist");
}

async function expectNianzhuangFinalCoreDefense(page: Page) {
  await expect(page.getByTestId("fortified-line-final-core")).toContainText("内圩最后据点");
  await expectNianzhuangFortifiedLineColor(page, "final-core", "nationalist");
}

async function expectNianzhuangFragmentedOuterDefense(page: Page) {
  for (const fragmentId of [
    "outer-defense-west-break",
    "outer-defense-north-fragment",
    "outer-defense-east-fragment",
    "outer-defense-south-fragment"
  ]) {
    await expect(page.getByTestId(`fortified-line-${fragmentId}`)).toBeVisible();
  }
}

async function expectNianzhuangFragmentedSecondDefense(page: Page) {
  for (const fragmentId of ["second-defense-north-fragment", "second-defense-east-breach", "second-defense-south-fragment"]) {
    await expect(page.getByTestId(`fortified-line-${fragmentId}`)).toBeVisible();
  }
}

async function expectNianzhuangFragmentedFinalCore(page: Page) {
  await expect(page.getByTestId("fortified-line-final-core-east-break")).toBeVisible();
}

async function expectNianzhuangReadableIcons(page: Page) {
  const stage = await page.getByTestId("map-stage").boundingBox();
  expect(stage).not.toBeNull();

  const sizes = await page.locator(".nianzhuang-battle .unit-marker").evaluateAll((markers) =>
    markers.map((marker) => {
      const box = marker.getBoundingClientRect();
      return { height: box.height, width: box.width };
    })
  );

  expect(sizes.length).toBeGreaterThan(0);
  for (const size of sizes) {
    expect(size.width).toBeGreaterThan(12);
    expect(size.height).toBeGreaterThan(14);
    expect(size.width).toBeLessThan(70);
    expect(size.height).toBeLessThan(90);
  }

  const labels = await page.locator(".nianzhuang-battle .formation-unit-label").evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      return {
        fontSize: Number.parseFloat(style.fontSize),
        height: box.height,
        isMapLibreOverlay: Boolean(node.closest(".nianzhuang-maplibre-tactical-overlay")),
        width: box.width
      };
    })
  );

  for (const label of labels) {
    if (label.isMapLibreOverlay) {
      expect(label.fontSize).toBeGreaterThanOrEqual(10);
      expect(label.fontSize).toBeLessThanOrEqual(14);
    } else {
      expect(label.fontSize).toBeGreaterThanOrEqual(60);
      expect(label.fontSize).toBeLessThanOrEqual(96);
    }
    expect(label.height).toBeGreaterThan(8);
    expect(label.height).toBeLessThan(42);
    expect(label.width).toBeGreaterThan(18);
    expect(label.width).toBeLessThan((stage?.width ?? 1) * 0.34);
  }
}

async function expectNianzhuangReadableMapText(page: Page) {
  const stage = await page.getByTestId("map-stage").boundingBox();
  expect(stage).not.toBeNull();

  const selectors: Array<{
    maxFontSize: number;
    minFontSize: number;
    maxHeightRatio?: number;
    maxWidthRatio?: number;
    requireLabels?: boolean;
    selector: string;
  }> = [
    {
      selector: ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .map-point text",
      minFontSize: 11,
      maxFontSize: 16,
      maxHeightRatio: 0.055,
      maxWidthRatio: 0.22
    },
    {
      selector: ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .terrain-label",
      minFontSize: 10,
      maxFontSize: 18,
      maxHeightRatio: 0.045,
      maxWidthRatio: 0.24
    },
    {
      selector: ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .historical-region-name",
      minFontSize: 20,
      maxFontSize: 28,
      maxHeightRatio: 0.075,
      maxWidthRatio: 0.34,
      requireLabels: false
    },
    {
      selector: ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .wind-overlay.rail-overlay text",
      minFontSize: 10,
      maxFontSize: 18,
      maxHeightRatio: 0.05,
      maxWidthRatio: 0.26
    },
    {
      selector: ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .fortified-line text",
      minFontSize: 10,
      maxFontSize: 18,
      maxHeightRatio: 0.05,
      maxWidthRatio: 0.24,
      requireLabels: false
    }
  ];

  for (const { maxFontSize, maxHeightRatio = 0.16, maxWidthRatio = 0.52, minFontSize, requireLabels = true, selector } of selectors) {
    const labels = await page.locator(selector).evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        const fillMatch = style.fill.match(/rgba?\(([^)]+)\)/);
        const fillAlpha = fillMatch?.[1]?.split(",").map((part) => Number.parseFloat(part.trim()))[3] ?? 1;
        return {
          fillAlpha,
          fontSize: Number.parseFloat(style.fontSize),
          height: box.height,
          opacity: Number.parseFloat(style.opacity || "1"),
          text: node.textContent?.trim() ?? "",
          width: box.width
        };
      })
    );

    if (requireLabels) {
      expect(labels.length, `${selector} should render readable tactical labels`).toBeGreaterThan(0);
    }
    for (const label of labels) {
      expect(label.fontSize, `${selector} ${label.text} label font size`).toBeGreaterThanOrEqual(minFontSize);
      expect(label.fontSize, `${selector} ${label.text} label font size`).toBeLessThanOrEqual(maxFontSize);
      expect(label.height, `${selector} ${label.text} label height`).toBeGreaterThan(6);
      expect(label.height, `${selector} ${label.text} label height`).toBeLessThan((stage?.height ?? 1) * maxHeightRatio);
      expect(label.width, `${selector} ${label.text} label width`).toBeGreaterThan(8);
      expect(label.width, `${selector} ${label.text} label width`).toBeLessThan((stage?.width ?? 1) * maxWidthRatio);
      if (selector.includes("historical-region-name")) {
        expect(label.fillAlpha * label.opacity, `${selector} ${label.text} should stay in the background`).toBeLessThanOrEqual(0.52);
      }
    }
  }
}

async function expectNianzhuangTacticalLabelsNotCrowded(page: Page) {
  const sampleDates = ["1948-11-19T22:00", "1948-11-19T22:30", "1948-11-20T01:45", "1948-11-20T03:30"];
  const samples: Array<{
    date: string;
    labelCount: number;
    legendOverflow: { bottom: number; left: number; right: number; top: number; widthRatio: number } | null;
    majorOverlapCount: number;
    textAreaRatio: number;
    topOverlaps: Array<{ a: string; b: string; ratio: number }>;
  }> = [];

  for (const date of sampleDates) {
    await jumpNianzhuangTimelineTo(page, date);
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
    await page.waitForTimeout(1_650);
    samples.push(
      await page.evaluate((currentDate) => {
        const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
        const selectors = [
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .map-point text",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .active-event-label",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .historical-region-name",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .terrain-label",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .tactical-terrain-label",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .river text",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .fortified-line text",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .wind-overlay text",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .annotation-marker text",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .line-label",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .formation-unit-label",
          ".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .salvo-label"
        ];
        const labels = selectors
          .flatMap((selector) =>
            [...document.querySelectorAll(selector)].map((node) => {
              const box = node.getBoundingClientRect();
              const style = window.getComputedStyle(node);
              return {
                bottom: box.bottom,
                display: style.display,
                height: box.height,
                left: box.left,
                opacity: Number.parseFloat(style.opacity || "1"),
                right: box.right,
                text: node.textContent?.trim() ?? "",
                top: box.top,
                visibility: style.visibility,
                width: box.width
              };
            })
          )
          .filter((label) => label.display !== "none" && label.visibility !== "hidden" && label.opacity > 0.05 && label.width > 4 && label.height > 4);

        const overlaps: Array<{ a: string; b: string; ratio: number }> = [];
        for (let firstIndex = 0; firstIndex < labels.length; firstIndex += 1) {
          for (let secondIndex = firstIndex + 1; secondIndex < labels.length; secondIndex += 1) {
            const first = labels[firstIndex];
            const second = labels[secondIndex];
            const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
            const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));
            const overlapArea = width * height;
            const smallerArea = Math.max(1, Math.min(first.width * first.height, second.width * second.height));
            const ratio = overlapArea / smallerArea;
            if (ratio > 0.36) {
              overlaps.push({ a: first.text, b: second.text, ratio });
            }
          }
        }

        const stageArea = Math.max(1, (stage?.width ?? 1) * (stage?.height ?? 1));
        const legend = document.querySelector(".nianzhuang-battle .map-legend")?.getBoundingClientRect();
        return {
          date: currentDate,
          labelCount: labels.length,
          legendOverflow:
            stage && legend
              ? {
                  bottom: legend.bottom - stage.bottom,
                  left: stage.left - legend.left,
                  right: legend.right - stage.right,
                  top: stage.top - legend.top,
                  widthRatio: legend.width / stage.width
                }
              : null,
          majorOverlapCount: overlaps.length,
          textAreaRatio: labels.reduce((sum, label) => sum + label.width * label.height, 0) / stageArea,
          topOverlaps: overlaps.sort((first, second) => second.ratio - first.ratio).slice(0, 8)
        };
      }, date)
    );
  }

  for (const sample of samples) {
    expect(sample.labelCount, `${sample.date} should not crowd the tactical map with too many simultaneous labels: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(62);
    expect(sample.majorOverlapCount, `${sample.date} tactical labels should not overlap heavily: ${JSON.stringify(sample.topOverlaps)}`).toBeLessThanOrEqual(18);
    expect(sample.textAreaRatio, `${sample.date} visible text should not dominate the map: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.125);
    expect(sample.legendOverflow?.right ?? 0, `${sample.date} legend should stay inside the map stage`).toBeLessThanOrEqual(0);
    expect(sample.legendOverflow?.left ?? 0, `${sample.date} legend should stay inside the map stage`).toBeLessThanOrEqual(0);
    expect(sample.legendOverflow?.top ?? 0, `${sample.date} legend should stay inside the map stage`).toBeLessThanOrEqual(0);
    expect(sample.legendOverflow?.bottom ?? 0, `${sample.date} legend should stay inside the map stage`).toBeLessThanOrEqual(0);
    expect(sample.legendOverflow?.widthRatio ?? 0, `${sample.date} legend should not consume the tactical viewport`).toBeLessThanOrEqual(0.26);
  }
}

async function collectNianzhuangCameraSamples(page: Page) {
  const terrain = page.getByTestId("nianzhuang-terrain-3d");
  const originalTimelineValue = await page.getByTestId("timeline").inputValue();
  const samples: Array<{ center: string; date: string; zoom: number }> = [];
  const sampleDates = [
    "1948-11-07T06:00",
    "1948-11-09T12:00",
    "1948-11-10T18:00",
    "1948-11-11T12:30",
    "1948-11-13T18:00",
    "1948-11-19T10:00",
    "1948-11-19T22:00",
    "1948-11-19T23:30",
    "1948-11-20T03:30",
    "1948-11-20T05:30",
    "1948-11-20T18:00",
    "1948-11-22T17:00"
  ];

  await expect(terrain).toHaveAttribute("data-camera-zoom-policy", "stage-fixed-tactical-overview");
  try {
    for (const date of sampleDates) {
      await jumpNianzhuangTimelineTo(page, date);
      await expect.poll(async () => Number(await terrain.getAttribute("data-map-zoom"))).toBeGreaterThan(0);
      await page.waitForTimeout(750);
      samples.push({
        center: (await terrain.getAttribute("data-map-center")) ?? "",
        date,
        zoom: Number(await terrain.getAttribute("data-map-zoom"))
      });
    }
  } finally {
    await page.getByTestId("timeline").fill(originalTimelineValue);
    await page.waitForTimeout(750);
  }

  return samples;
}

function parseCameraCenter(center: string) {
  const [lng, lat] = center.split(",").map((value) => Number(value));
  return { lat, lng };
}

async function expectNianzhuangCameraStaysTactical(page: Page) {
  const samples = await collectNianzhuangCameraSamples(page);
  const zooms = samples.map((sample) => sample.zoom);
  const adjacentDelta = samples.slice(1).map((sample, index) => Math.abs(sample.zoom - samples[index].zoom));
  const pursuitSamples = samples.filter((sample) => sample.date <= "1948-11-10T18:00").map((sample) => ({ ...sample, ...parseCameraCenter(sample.center) }));
  const pocketSample = samples.find((sample) => sample.date === "1948-11-10T18:00");
  const assaultSamples = samples.filter((sample) => sample.date >= "1948-11-19T10:00");

  expect(Math.max(...zooms), `Nianzhuang camera should keep the second-wall close-up bounded: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(12.28);
  expect(Math.min(...zooms), `Nianzhuang camera should keep enough terrain detail: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(10.15);
  expect(Math.min(...assaultSamples.map((sample) => sample.zoom)), `Nianzhuang assault and encirclement stages should zoom in after the pocket battle begins: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(
    11.05
  );
  expect(pocketSample ? Math.max(...assaultSamples.map((sample) => sample.zoom)) - pocketSample.zoom : 0, `Nianzhuang assault map should be at least about one zoom level tighter than the pre-assault pocket: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(0.95);
  expect(Math.max(...zooms) - Math.min(...zooms), `Nianzhuang camera should keep visible stage-to-stage zoom changes: ${JSON.stringify(samples)}`).toBeGreaterThanOrEqual(
    0.8
  );
  expect(Math.max(...zooms) - Math.min(...zooms), `Nianzhuang camera zoom range should stay controlled: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(2.08);
  expect(Math.max(...adjacentDelta), `Nianzhuang adjacent camera zoom jumps should stay smooth: ${JSON.stringify(samples)}`).toBeLessThanOrEqual(0.92);
  expect(samples.find((sample) => sample.date === "1948-11-20T03:30")?.zoom ?? 0, `Second-wall assault should zoom tighter than the first-line breakthrough stage: ${JSON.stringify(samples)}`).toBeGreaterThan(
    (samples.find((sample) => sample.date === "1948-11-19T22:00")?.zoom ?? 0) + 0.5
  );
  expect(samples.find((sample) => sample.date === "1948-11-20T05:30")?.zoom ?? Number.POSITIVE_INFINITY, `Cleanup should return to the final-pocket tactical ratio: ${JSON.stringify(samples)}`).toBeLessThan(
    (samples.find((sample) => sample.date === "1948-11-20T03:30")?.zoom ?? 0) - 0.45
  );
  expect(pursuitSamples[0].lng - pursuitSamples.at(-1)!.lng, `Pursuit camera should follow the westward moving armies: ${JSON.stringify(pursuitSamples)}`).toBeGreaterThan(0.08);
  expect(pursuitSamples.every((sample) => sample.lng >= 117.86 && sample.lng <= 118.22), `Pursuit camera should stay between the mobile column and Nianzhuang context: ${JSON.stringify(pursuitSamples)}`).toBe(true);
}

async function expectNianzhuangNoLargeDarkOverlayBlocks(page: Page) {
  const sampleDates = [
    "1948-11-07T06:00",
    "1948-11-13T18:00",
    "1948-11-19T10:00",
    "1948-11-19T21:15",
    "1948-11-19T22:30",
    "1948-11-20T00:30",
    "1948-11-20T18:00",
    "1948-11-22T17:00"
  ];
  const samples: Array<{
    areaRatio: number;
    className: string;
    date: string;
    effectiveFillAlpha: number;
    effectiveStrokeAlpha: number;
    fill: string;
    filter: string;
    hasDarkFill: boolean;
    hasDarkStroke: boolean;
    heightRatio: number;
    parentClassName: string;
    selector: string;
    stroke: string;
    testId: string;
    widthRatio: number;
  }> = [];
  const pixelSamples: Array<{
    areaRatio: number;
    date: string;
    heightRatio: number;
    maxPixels: number;
    widthRatio: number;
    xRatio: number;
    yRatio: number;
  }> = [];

  for (const date of sampleDates) {
    await jumpNianzhuangTimelineTo(page, date);
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
    await page.waitForTimeout(1_050);
    samples.push(
      ...(await page.evaluate((currentDate) => {
        const parseColor = (color: string) => {
          if (color === "none" || color === "transparent") {
            return { alpha: 0, b: 0, g: 0, r: 0 };
          }
          const rgba = color.match(/rgba?\(([^)]+)\)/);
          if (!rgba) {
            return { alpha: 1, b: 0, g: 0, r: 0 };
          }
          const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
          return { alpha: parts.length >= 4 ? parts[3] : 1, b: parts[2] ?? 0, g: parts[1] ?? 0, r: parts[0] ?? 0 };
        };
        const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
        if (!stage) {
          return [];
        }
        const selectors = [
          ".nianzhuang-battle .tactical-terrain-shadow",
          ".nianzhuang-battle .tactical-terrain-skirt",
          ".nianzhuang-battle .tactical-terrain-wall",
          ".nianzhuang-battle .fortified-line-shadow",
          ".nianzhuang-battle .annotation-marker circle",
          ".nianzhuang-battle .battle-salvo-effect circle",
          ".nianzhuang-battle .nianzhuang-formation-shadow",
          ".nianzhuang-battle .nianzhuang-formation-body",
          ".nianzhuang-battle .nianzhuang-formation-front-line",
          ".nianzhuang-battle .nianzhuang-formation-rank-guide"
        ];

        return selectors.flatMap((selector) =>
          [...document.querySelectorAll(selector)]
            .map((node) => {
              const box = node.getBoundingClientRect();
              const style = window.getComputedStyle(node);
              const fill = parseColor(style.fill);
              const stroke = parseColor(style.stroke);
              const opacity = Number.parseFloat(style.opacity || "1");
              const effectiveFillAlpha = fill.alpha * opacity;
              const effectiveStrokeAlpha = stroke.alpha * opacity;
              const hasDarkFill = effectiveFillAlpha > 0.08 && fill.r <= 85 && fill.g <= 75 && fill.b <= 65;
              const hasDarkStroke = effectiveStrokeAlpha > 0.18 && stroke.r <= 85 && stroke.g <= 75 && stroke.b <= 65;
              return {
                areaRatio: (box.width * box.height) / Math.max(1, stage.width * stage.height),
                className: (node as Element).getAttribute("class") ?? "",
                date: currentDate,
                effectiveFillAlpha,
                effectiveStrokeAlpha,
                fill: style.fill,
                filter: style.filter,
                hasDarkFill,
                hasDarkStroke,
                heightRatio: box.height / stage.height,
                parentClassName: (node as Element).parentElement?.getAttribute("class") ?? "",
                selector,
                stroke: style.stroke,
                testId: (node as Element).closest("[data-testid]")?.getAttribute("data-testid") ?? "",
                widthRatio: box.width / stage.width
              };
            })
            .filter((sample) => sample.hasDarkFill || sample.hasDarkStroke)
            .filter((sample) => sample.areaRatio > 0.02 || sample.widthRatio > 0.14 || sample.heightRatio > 0.14)
        );
      }, date))
    );

    const screenshot = await page.getByTestId("map-stage").screenshot();
    pixelSamples.push(await largestDarkPixelBlock(page, date, screenshot));
  }

  for (const sample of samples) {
    expect(sample.effectiveFillAlpha, `Large Nianzhuang overlay terrain element should not read as a dark block: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.08);
    expect(sample.effectiveStrokeAlpha, `Large Nianzhuang overlay stroke should not read as a dark block: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.18);
    expect(sample.filter, `Large Nianzhuang overlay terrain element should not use blurred block shadows: ${JSON.stringify(sample)}`).toBe("none");
  }

  for (const sample of pixelSamples) {
    expect(sample.areaRatio, `Nianzhuang map screenshot should not contain a large contiguous black block: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.006);
    expect(sample.widthRatio, `Nianzhuang map screenshot should not contain a wide black rectangle: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.12);
    expect(sample.heightRatio, `Nianzhuang map screenshot should not contain a tall black rectangle: ${JSON.stringify(sample)}`).toBeLessThanOrEqual(0.12);
  }
}

async function largestDarkPixelBlock(page: Page, date: string, screenshot: Buffer) {
  return await page.evaluate(
    async ({ currentDate, imageDataUrl }) => {
      const image = new Image();
      image.src = imageDataUrl;
      await image.decode();
      const sampleScale = 0.28;
      const width = Math.max(1, Math.floor(image.naturalWidth * sampleScale));
      const height = Math.max(1, Math.floor(image.naturalHeight * sampleScale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        return { areaRatio: 0, date: currentDate, heightRatio: 0, maxPixels: 0, widthRatio: 0, xRatio: 0, yRatio: 0 };
      }
      context.drawImage(image, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      const visited = new Uint8Array(width * height);
      const queue = new Int32Array(width * height);
      let largest = { maxPixels: 0, maxX: 0, maxY: 0, minX: 0, minY: 0 };
      const isDark = (index: number) => {
        const offset = index * 4;
        const alpha = pixels[offset + 3] / 255;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];
        return alpha > 0.92 && r < 22 && g < 22 && b < 22;
      };

      for (let index = 0; index < width * height; index += 1) {
        if (visited[index] || !isDark(index)) {
          visited[index] = 1;
          continue;
        }

        let head = 0;
        let tail = 0;
        let count = 0;
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        queue[tail] = index;
        tail += 1;
        visited[index] = 1;
        while (head < tail) {
          const current = queue[head];
          head += 1;
          count += 1;
          const x = current % width;
          const y = Math.floor(current / width);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          const neighbors = [current - 1, current + 1, current - width, current + width];
          for (const neighbor of neighbors) {
            if (neighbor < 0 || neighbor >= width * height || visited[neighbor]) {
              continue;
            }
            const nx = neighbor % width;
            const ny = Math.floor(neighbor / width);
            if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) {
              continue;
            }
            visited[neighbor] = 1;
            if (isDark(neighbor)) {
              queue[tail] = neighbor;
              tail += 1;
            }
          }
        }

        if (count > largest.maxPixels) {
          largest = { maxPixels: count, maxX, maxY, minX, minY };
        }
      }

      return {
        areaRatio: largest.maxPixels / Math.max(1, width * height),
        date: currentDate,
        heightRatio: (largest.maxY - largest.minY + 1) / height,
        maxPixels: largest.maxPixels,
        widthRatio: (largest.maxX - largest.minX + 1) / width,
        xRatio: largest.minX / width,
        yRatio: largest.minY / height
      };
    },
    { currentDate: date, imageDataUrl: `data:image/png;base64,${screenshot.toString("base64")}` }
  );
}

async function expectNianzhuangFullVisualIntegrity(page: Page) {
  const samples = [
    { date: "1948-11-07T08:00", expectedFocus: "nianzhuangPursuit", maximumZoom: 10.7, minimumUnits: 4, minimumZoom: 10.1 },
    { date: "1948-11-09T12:00", expectedFocus: "nianzhuangPursuit", maximumZoom: 10.85, minimumUnits: 8, minimumZoom: 10.1 },
    { date: "1948-11-10T22:45", expectedFocus: "nianzhuangPocket", maximumZoom: 11.25, minimumUnits: 8, minimumZoom: 10.35 },
    { date: "1948-11-11T16:00", expectedFocus: "nianzhuangRelief", maximumZoom: 11.15, minimumUnits: 16, minimumZoom: 10.15 },
    { date: "1948-11-13T18:00", expectedFocus: "nianzhuangPocket", maximumZoom: 11.25, minimumUnits: 18, minimumZoom: 10.9 },
    { date: "1948-11-18T01:00", expectedFocus: "nianzhuangPocket", maximumZoom: 11.25, minimumUnits: 24, minimumZoom: 10.9 },
    { date: "1948-11-19T22:00", expectedFocus: "nianzhuangCompression", maximumZoom: 11.55, minimumUnits: 30, minimumZoom: 11.1 },
    { date: "1948-11-20T01:45", expectedFocus: "nianzhuangSecondWall", maximumZoom: 12.28, minimumUnits: 30, minimumZoom: 12.05 },
    { date: "1948-11-20T03:30", expectedFocus: "nianzhuangSecondWall", maximumZoom: 12.28, minimumUnits: 30, minimumZoom: 12.05 },
    { date: "1948-11-20T06:00", expectedFocus: "nianzhuangFinal", maximumZoom: 11.55, minimumUnits: 24, minimumZoom: 11.0 },
    { date: "1948-11-21T12:00", expectedFocus: "nianzhuangFinal", maximumZoom: 11.55, minimumUnits: 24, minimumZoom: 11.0 },
    { date: "1948-11-22T16:30", expectedFocus: "nianzhuangFinal", maximumZoom: 11.55, minimumUnits: 24, minimumZoom: 11.0 },
    { date: "1948-11-22T20:00", expectedFocus: "nianzhuangFinal", maximumZoom: 11.55, minimumUnits: 14, minimumZoom: 11.0 }
  ];
  const visualSamples: Array<{
    brokenImages: Array<{ height: number; href: string; routeId: string; width: number }>;
    date: string;
    focus: string | null;
    formationPathProblems: Array<{ className: string; fill: string; stroke: string; testId: string }>;
    maxContextRoute: { heightRatio: number; routeId: string; widthRatio: number } | null;
    maxRoute: { heightRatio: number; routeId: string; widthRatio: number } | null;
    maxUnit: { height: number; routeId: string; width: number } | null;
    offscreenUnitRatio: number;
    primaryUnitCount: number;
    routeCount: number;
    suspiciousDarkFills: Array<{ areaRatio: number; className: string; fill: string; opacity: number; testId: string }>;
    unstyledSalvoCircles: Array<{ className: string; fill: string; stroke: string; testId: string }>;
    unitCount: number;
    zoom: number;
  }> = [];

  for (const sample of samples) {
    await jumpNianzhuangTimelineTo(page, sample.date);
    await expect(page.locator(".nianzhuang-battle .camera-layer")).toHaveAttribute("data-map-focus", sample.expectedFocus);
    await expect(page.getByTestId("nianzhuang-terrain-3d")).toHaveAttribute("data-map-focus", sample.expectedFocus);
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
    await page.waitForTimeout(1_200);

    const visualState = await page.evaluate((date) => {
      const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
      const terrain = document.querySelector('[data-testid="nianzhuang-terrain-3d"]');
      const parseColor = (color: string) => {
        if (color === "none" || color === "transparent") {
          return { alpha: 0, b: 0, g: 0, r: 0 };
        }
        const rgba = color.match(/rgba?\(([^)]+)\)/);
        if (!rgba) {
          return { alpha: 1, b: 0, g: 0, r: 0 };
        }
        const parts = rgba[1].split(",").map((part) => Number.parseFloat(part.trim()));
        return { alpha: parts.length >= 4 ? parts[3] : 1, b: parts[2] ?? 0, g: parts[1] ?? 0, r: parts[0] ?? 0 };
      };
      const stageArea = Math.max(1, (stage?.width ?? 1) * (stage?.height ?? 1));
      const relativeBox = (box: DOMRect) => ({
        centerX: stage ? ((box.left + box.right) / 2 - stage.left) / stage.width : Number.NaN,
        centerY: stage ? ((box.top + box.bottom) / 2 - stage.top) / stage.height : Number.NaN,
        heightRatio: stage ? box.height / stage.height : Number.NaN,
        widthRatio: stage ? box.width / stage.width : Number.NaN
      });

      const suspiciousDarkFills = [...document.querySelectorAll(".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay path, .nianzhuang-battle .nianzhuang-maplibre-tactical-overlay polygon, .nianzhuang-battle .nianzhuang-maplibre-tactical-overlay rect, .nianzhuang-battle .nianzhuang-maplibre-tactical-overlay ellipse")]
        .flatMap((node) => {
          const box = node.getBoundingClientRect();
          if (!stage || box.width <= 0 || box.height <= 0) {
            return [];
          }
          const style = window.getComputedStyle(node);
          const fill = parseColor(style.fill);
          const opacity = Number.parseFloat(style.opacity || "1");
          const effectiveAlpha = fill.alpha * opacity;
          const areaRatio = (box.width * box.height) / stageArea;
          const relative = relativeBox(box);
          const isLargeShape = areaRatio > 0.02 || relative.widthRatio > 0.18 || relative.heightRatio > 0.18;
          const isDarkFill = isLargeShape && fill.r <= 45 && fill.g <= 45 && fill.b <= 45 && effectiveAlpha >= 0.18;
          const isLargeMutedFill = fill.r <= 85 && fill.g <= 75 && fill.b <= 65 && effectiveAlpha >= 0.2 && areaRatio > 0.08;
          if (!isDarkFill && !isLargeMutedFill) {
            return [];
          }
          return [
            {
              areaRatio,
              className: (node as Element).getAttribute("class") ?? "",
              fill: style.fill,
              opacity,
              testId: (node as Element).closest("[data-testid]")?.getAttribute("data-testid") ?? ""
            }
          ];
        });

      const formationPathProblems = [...document.querySelectorAll(".nianzhuang-battle .nianzhuang-formation-shadow, .nianzhuang-battle .nianzhuang-formation-body, .nianzhuang-battle .nianzhuang-formation-front-line, .nianzhuang-battle .nianzhuang-formation-rank-guide")]
        .flatMap((node) => {
          const box = node.getBoundingClientRect();
          if (box.width <= 0 || box.height <= 0) {
            return [];
          }
          const style = window.getComputedStyle(node);
          const fill = parseColor(style.fill);
          const stroke = parseColor(style.stroke);
          const hasDefaultBlackFill = fill.alpha >= 0.18 && fill.r <= 12 && fill.g <= 12 && fill.b <= 12;
          const hasNoStroke = stroke.alpha === 0 || style.stroke === "none";
          const needsStroke = (node as Element).classList.contains("nianzhuang-formation-body") ||
            (node as Element).classList.contains("nianzhuang-formation-front-line") ||
            (node as Element).classList.contains("nianzhuang-formation-rank-guide");
          if (!hasDefaultBlackFill && (!needsStroke || !hasNoStroke)) {
            return [];
          }
          return [
            {
              className: (node as Element).getAttribute("class") ?? "",
              fill: style.fill,
              stroke: style.stroke,
              testId: (node as Element).closest("[data-testid]")?.getAttribute("data-testid") ?? ""
            }
          ];
        });

      const unstyledSalvoCircles = [...document.querySelectorAll(".nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .battle-salvo-effect circle")]
        .flatMap((node) => {
          const box = node.getBoundingClientRect();
          if (box.width <= 0 || box.height <= 0) {
            return [];
          }
          const style = window.getComputedStyle(node);
          const fill = parseColor(style.fill);
          const stroke = parseColor(style.stroke);
          const hasDefaultBlackFill = fill.alpha >= 0.18 && fill.r <= 12 && fill.g <= 12 && fill.b <= 12;
          const hasNoStroke = stroke.alpha === 0 || style.stroke === "none";
          if (!hasDefaultBlackFill && !hasNoStroke) {
            return [];
          }
          return [
            {
              className: (node as Element).getAttribute("class") ?? "",
              fill: style.fill,
              stroke: style.stroke,
              testId: (node as Element).closest("[data-testid]")?.getAttribute("data-testid") ?? ""
            }
          ];
        });

      const visibleUnits = [...document.querySelectorAll('.nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .front-line[data-unit-visible="true"] .formation-unit')]
        .map((unit) => {
          const box = unit.getBoundingClientRect();
          const route = unit.closest(".front-line");
          const isCurrentRoute = route?.getAttribute("data-route-current") === "true";
          const relative = relativeBox(box);
          return {
            ...relative,
            height: box.height,
            isCurrentRoute,
            routeId: route?.getAttribute("data-route-id") ?? "",
            width: box.width
          };
        })
        .filter((unit) => unit.width > 0 && unit.height > 0);

      const primaryVisibleUnits = visibleUnits.filter((unit) => unit.isCurrentRoute);
      const offscreenUnits = primaryVisibleUnits.filter((unit) => unit.centerX < -0.08 || unit.centerX > 1.08 || unit.centerY < -0.1 || unit.centerY > 1.1);
      const maxUnit = visibleUnits.reduce<{ height: number; routeId: string; width: number } | null>(
        (current, unit) => (!current || unit.width * unit.height > current.width * current.height ? { height: unit.height, routeId: unit.routeId, width: unit.width } : current),
        null
      );

      const brokenImages = [...document.querySelectorAll<SVGImageElement>('.nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .front-line[data-unit-visible="true"] image.unit-icon-image')]
        .flatMap((image) => {
          const box = image.getBoundingClientRect();
          const href = image.getAttribute("href") ?? "";
          if (href && box.width >= 8 && box.height >= 12) {
            return [];
          }
          return [{ height: box.height, href, routeId: image.closest(".front-line")?.getAttribute("data-route-id") ?? "", width: box.width }];
        });

      const routes = [...document.querySelectorAll('.nianzhuang-battle .nianzhuang-maplibre-tactical-overlay .front-line .front-route')]
        .map((route) => {
          const box = route.getBoundingClientRect();
          const relative = relativeBox(box);
          return {
            heightRatio: relative.heightRatio,
            routeId: route.closest(".front-line")?.getAttribute("data-route-id") ?? "",
            widthRatio: relative.widthRatio
          };
        })
        .filter((route) => route.widthRatio > 0 && route.heightRatio > 0);
      const contextRingRouteIds = new Set(["pla-encirclement-ring", "huang-nianzhuang-defense-ring"]);
      const maxRoute = routes.filter((route) => !contextRingRouteIds.has(route.routeId)).reduce<{ heightRatio: number; routeId: string; widthRatio: number } | null>(
        (current, route) => (!current || route.widthRatio * route.heightRatio > current.widthRatio * current.heightRatio ? route : current),
        null
      );
      const maxContextRoute = routes.filter((route) => contextRingRouteIds.has(route.routeId)).reduce<{ heightRatio: number; routeId: string; widthRatio: number } | null>(
        (current, route) => (!current || route.widthRatio * route.heightRatio > current.widthRatio * current.heightRatio ? route : current),
        null
      );

      return {
        brokenImages,
        date,
        focus: terrain?.getAttribute("data-map-focus") ?? null,
        formationPathProblems,
        maxContextRoute,
        maxRoute,
        maxUnit,
        offscreenUnitRatio: primaryVisibleUnits.length > 0 ? offscreenUnits.length / primaryVisibleUnits.length : 1,
        primaryUnitCount: primaryVisibleUnits.length,
        routeCount: routes.length,
        suspiciousDarkFills,
        unstyledSalvoCircles,
        unitCount: visibleUnits.length,
        zoom: Number(terrain?.getAttribute("data-map-zoom") ?? 0)
      };
    }, sample.date);

    visualSamples.push(visualState);
    expect(visualState.focus, `${sample.date} should keep the WebGL terrain camera on the expected tactical stage`).toBe(sample.expectedFocus);
    expect(visualState.zoom, `${sample.date} should keep a readable tactical overview`).toBeGreaterThanOrEqual(sample.minimumZoom);
    expect(visualState.zoom, `${sample.date} should not zoom into a local close-up`).toBeLessThanOrEqual(sample.maximumZoom);
    expect(visualState.unitCount, `${sample.date} should keep enough operational units visible: ${JSON.stringify(visualState)}`).toBeGreaterThanOrEqual(sample.minimumUnits);
    expect(visualState.primaryUnitCount, `${sample.date} should keep current-event operational units visible instead of only historical traces: ${JSON.stringify(visualState)}`).toBeGreaterThan(0);
    expect(visualState.offscreenUnitRatio, `${sample.date} should not push most units outside the camera: ${JSON.stringify(visualState)}`).toBeLessThanOrEqual(0.32);
    expect(visualState.brokenImages, `${sample.date} should not render broken or zero-size unit images`).toEqual([]);
    expect(visualState.formationPathProblems, `${sample.date} should not contain default black or unstyled formation paths`).toEqual([]);
    expect(visualState.suspiciousDarkFills, `${sample.date} should not contain large dark filled SVG blocks`).toEqual([]);
    expect(visualState.unstyledSalvoCircles, `${sample.date} should not contain default black or unstyled salvo circles`).toEqual([]);
    expect(visualState.routeCount, `${sample.date} should render tactical routes on the terrain overlay`).toBeGreaterThan(0);
    expect(visualState.maxRoute?.widthRatio ?? 0, `${sample.date} should not render a runaway route line: ${JSON.stringify(visualState.maxRoute)}`).toBeLessThanOrEqual(1.3);
    expect(visualState.maxRoute?.heightRatio ?? 0, `${sample.date} should not render a runaway route line: ${JSON.stringify(visualState.maxRoute)}`).toBeLessThanOrEqual(1.05);
    expect(visualState.maxContextRoute?.widthRatio ?? 0, `${sample.date} context encirclement rings should not take over the full tactical viewport: ${JSON.stringify(visualState.maxContextRoute)}`).toBeLessThanOrEqual(1.18);
    expect(visualState.maxContextRoute?.heightRatio ?? 0, `${sample.date} context encirclement rings should remain bounded even when kept visible across camera stages: ${JSON.stringify(visualState.maxContextRoute)}`).toBeLessThanOrEqual(1.35);
    expect(visualState.maxUnit?.width ?? 0, `${sample.date} unit markers should stay compact after scaling: ${JSON.stringify(visualState.maxUnit)}`).toBeLessThanOrEqual(105);
    expect(visualState.maxUnit?.height ?? 0, `${sample.date} unit markers should stay compact after scaling: ${JSON.stringify(visualState.maxUnit)}`).toBeLessThanOrEqual(78);
  }

  expect(visualSamples.map((sample) => sample.focus)).toEqual(samples.map((sample) => sample.expectedFocus));
}

async function expectNianzhuangPursuitUnitsStayInCameraCore(page: Page) {
  const routeIds = ["huang-xinan-west-withdrawal", "pla-east-pursuit-main", "pla-north-pursuit", "pla-south-pursuit"];
  const sampleDates = ["1948-11-07T06:00", "1948-11-09T12:00", "1948-11-10T18:00"];
  const samples: Array<{ date: string; maxX: number; minX: number; routes: number }> = [];

  for (const date of sampleDates) {
    await jumpNianzhuangTimelineTo(page, date);
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
    await page.waitForTimeout(750);
    samples.push(
      await page.evaluate((wantedRouteIds) => {
        const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
        const boxes = wantedRouteIds.flatMap((routeId) =>
          [...document.querySelectorAll(`.nianzhuang-battle .front-line[data-route-id="${routeId}"][data-unit-visible="true"] .formation-unit`)]
            .map((unit) => unit.getBoundingClientRect())
            .filter((box) => box.width > 0 && box.height > 0)
        );
        const centers = boxes.map((box) => ({
          x: stage ? ((box.left + box.right) / 2 - stage.left) / stage.width : Number.NaN,
          y: stage ? ((box.top + box.bottom) / 2 - stage.top) / stage.height : Number.NaN
        }));
        const xValues = centers.map((center) => center.x);

        return {
          maxX: xValues.length > 0 ? Math.max(...xValues) : Number.NaN,
          minX: xValues.length > 0 ? Math.min(...xValues) : Number.NaN,
          routes: boxes.length
        };
      }, routeIds).then((sample) => ({ ...sample, date }))
    );
  }

  for (const sample of samples) {
    expect(sample.routes, `${sample.date} should render pursuit unit markers`).toBeGreaterThan(0);
    expect(sample.minX, `${sample.date} pursuit units should not be left offscreen: ${JSON.stringify(samples)}`).toBeGreaterThan(0.08);
    expect(sample.maxX, `${sample.date} pursuit units should not lag beyond the right edge: ${JSON.stringify(samples)}`).toBeLessThan(1.03);
  }
}

async function expectNianzhuangPursuitUnitsAttachToRouteHeads(page: Page) {
  const routeIds = ["huang-xinan-west-withdrawal", "pla-east-pursuit-main", "pla-north-pursuit", "pla-south-pursuit"];
  const sampleDates = ["1948-11-07T06:00", "1948-11-09T12:00"];
  const samples: Array<{ date: string; maxDistance: number; routeId: string; unitCount: number }> = [];

  for (const date of sampleDates) {
    await jumpNianzhuangTimelineTo(page, date);
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
    await page.waitForTimeout(750);

    for (const routeId of routeIds) {
      const sample = await page.evaluate((id) => {
        const route = document.querySelector(`.nianzhuang-battle .front-line[data-route-id="${id}"][data-unit-visible="true"]`);
        const routeHead = route?.querySelector("circle");
        const headBox = routeHead?.getBoundingClientRect();
        const units = [...(route?.querySelectorAll(".formation-unit") ?? [])].map((unit) => unit.getBoundingClientRect()).filter((box) => box.width > 0 && box.height > 0);
        const head = headBox
          ? {
              x: (headBox.left + headBox.right) / 2,
              y: (headBox.top + headBox.bottom) / 2
            }
          : null;
        const distances = head
          ? units.map((box) =>
              Math.hypot((box.left + box.right) / 2 - head.x, (box.top + box.bottom) / 2 - head.y)
            )
          : [];
        return {
          maxDistance: distances.length > 0 ? Math.max(...distances) : Number.NaN,
          routeId: id,
          unitCount: units.length
        };
      }, routeId);

      if (sample.unitCount > 0) {
        samples.push({ ...sample, date });
      }
    }
  }

  expect(samples.length).toBeGreaterThan(0);
  for (const sample of samples) {
    expect(sample.maxDistance, `${sample.date} ${sample.routeId} units should stay attached to the current route head: ${JSON.stringify(samples)}`).toBeLessThan(190);
  }
}

async function expectNianzhuangTacticalTerrainAndForceBlocks(page: Page) {
  await expect(page.getByTestId("tactical-grid-layer")).toBeVisible();
  await expect(page.getByTestId("tactical-terrain-layer")).toBeVisible();
  await expect(page.getByTestId("tactical-reference-panel")).toContainText("约10公里");
  await expect(page.getByTestId("nianzhuang-relief-shelf")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-daxujia-relief-ridge")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-waterlogged-lowland")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-inner-fortified-platform")).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-contour")).toHaveCount(3);
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-shadow").first()).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-skirt").first()).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-wall").first()).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-highlight").first()).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .tactical-terrain-surface").first()).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .force-echelon-communist").first()).toBeVisible();

  const visualState = await page.evaluate(() => {
    const terrainKinds = [...document.querySelectorAll(".nianzhuang-battle .tactical-terrain-feature")]
      .map((node) => ({
        height: Number(node.getAttribute("data-terrain-height") ?? 0),
        kind: node.getAttribute("data-terrain-kind") ?? "",
        hasShadow: Boolean(node.querySelector(".tactical-terrain-shadow")),
        hasSkirt: Boolean(node.querySelector(".tactical-terrain-skirt")),
        hasSurface: Boolean(node.querySelector(".tactical-terrain-surface")),
        hasWall: Boolean(node.querySelector(".tactical-terrain-wall"))
      }))
      .filter((feature) => feature.kind);
    const forceBlocks = [...document.querySelectorAll(".nianzhuang-battle .formation-unit.has-force-echelon")]
      .map((node) => {
        const box = node.getBoundingClientRect();
        return {
          hasForceBlock: Boolean(node.querySelector(".force-echelon-marker")),
          height: box.height,
          width: box.width
        };
      })
      .filter((box) => box.width > 0 && box.height > 0);

    return { forceBlocks, terrainKinds };
  });

  expect(visualState.terrainKinds.map((feature) => feature.kind)).toEqual(expect.arrayContaining(["contour", "lowland", "relief"]));
  expect(visualState.terrainKinds.every((feature) => feature.hasShadow && feature.hasSurface)).toBe(true);
  expect(visualState.terrainKinds.some((feature) => feature.kind === "relief" && feature.hasWall && feature.hasSkirt && feature.height >= 76)).toBe(true);
  expect(visualState.forceBlocks.length).toBeGreaterThan(0);
  expect(visualState.forceBlocks.every((block) => block.hasForceBlock)).toBe(true);
  for (const block of visualState.forceBlocks.slice(0, 12)) {
    expect(block.width).toBeGreaterThan(20);
    expect(block.height).toBeGreaterThan(20);
    expect(block.width).toBeLessThan(150);
    expect(block.height).toBeLessThan(150);
  }
}

async function expectNianzhuangCompletedLabelsHidden(page: Page) {
  const visibleCompletedLabels = await page
    .locator(".nianzhuang-battle .front-line.is-complete .line-label")
    .evaluateAll((labels) => labels.filter((label) => window.getComputedStyle(label).display !== "none").length);

  expect(visibleCompletedLabels, "completed route labels should not clutter the Nianzhuang pocket").toBe(0);
}

async function expectNianzhuangCoreBattlefieldZoom(page: Page, minimumWidthRatio: number, minimumHeightRatio: number) {
  const spread = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const coreSelectors = [
      ".nianzhuang-battle [data-testid=\"fortified-line-pla-encirclement\"] .fortified-line-body",
      ".nianzhuang-battle [data-testid=\"fortified-line-outer-defense\"] .fortified-line-body"
    ];
    const boxes: Array<{ bottom: number; left: number; right: number; selector: string; top: number }> = [];
    for (const selector of coreSelectors) {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      if (box && box.width > 0 && box.height > 0) {
        boxes.push({
          bottom: box.bottom,
          left: box.left,
          right: box.right,
          selector,
          top: box.top
        });
      }
    }

    if (!stage || boxes.length === 0) {
      return null;
    }

    const bounds = boxes.reduce(
      (accumulator, box) => ({
        bottom: Math.max(accumulator.bottom, box.bottom),
        left: Math.min(accumulator.left, box.left),
        right: Math.max(accumulator.right, box.right),
        top: Math.min(accumulator.top, box.top)
      }),
      {
        bottom: Number.NEGATIVE_INFINITY,
        left: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        top: Number.POSITIVE_INFINITY
      }
    );

    return {
      heightRatio: (bounds.bottom - bounds.top) / stage.height,
      selectors: boxes.map((box) => box.selector),
      widthRatio: (bounds.right - bounds.left) / stage.width
    };
  });

  expect(spread).not.toBeNull();
  expect(spread?.widthRatio, `Nianzhuang full encirclement and defensive rings should occupy the tactical battlefield after zoom-in: ${JSON.stringify(spread)}`).toBeGreaterThan(minimumWidthRatio);
  expect(spread?.heightRatio, `Nianzhuang full encirclement and defensive rings should occupy the tactical battlefield after zoom-in: ${JSON.stringify(spread)}`).toBeGreaterThan(minimumHeightRatio);
}

async function expectNianzhuangRouteStopsWestOf(page: Page, routeId: string, boundaryPointId: string) {
  const state = await page.evaluate(
    ({ boundaryPointId, routeId }) => {
      const point = document.querySelector(`.nianzhuang-battle [data-testid="map-point-${boundaryPointId}"]`);
      const route = document.querySelector(`.nianzhuang-battle .front-line[data-route-id="${routeId}"] .front-route`);
      const pointBox = point?.getBoundingClientRect();
      const routeBox = route?.getBoundingClientRect();
      return {
        pointLeft: pointBox?.left ?? Number.NaN,
        rendered: Boolean(pointBox && routeBox),
        routeRight: routeBox?.right ?? Number.NaN
      };
    },
    { boundaryPointId, routeId }
  );

  expect(state.rendered, `${routeId} and ${boundaryPointId} should both be rendered`).toBe(true);
  expect(state.routeRight, `${routeId} should not visually break through to ${boundaryPointId}`).toBeLessThan(state.pointLeft);
}

async function expectNianzhuangRoutesMakeContact(page: Page, firstRouteId: string, secondRouteId: string, maxDistancePx: number) {
  const state = await page.evaluate(
    ({ firstRouteId, secondRouteId }) => {
      const firstUnits = [
        ...document.querySelectorAll(`.nianzhuang-battle .front-line[data-route-id="${firstRouteId}"] .formation-unit`)
      ];
      const secondUnits = [
        ...document.querySelectorAll(`.nianzhuang-battle .front-line[data-route-id="${secondRouteId}"] .formation-unit`)
      ];
      const centers = (units: Element[]) =>
        units.flatMap((unit) => {
          const box = unit.getBoundingClientRect();
          return box.width > 0 && box.height > 0
            ? [
                {
                  x: box.left + box.width / 2,
                  y: box.top + box.height / 2
                }
              ]
            : [];
        });
      const firstCenters = centers(firstUnits);
      const secondCenters = centers(secondUnits);
      const distances = firstCenters.flatMap((first) =>
        secondCenters.map((second) => Math.hypot(first.x - second.x, first.y - second.y))
      );

      return {
        firstCount: firstCenters.length,
        minimumDistance: Math.min(...distances),
        secondCount: secondCenters.length
      };
    },
    { firstRouteId, secondRouteId }
  );

  expect(state.firstCount, `${firstRouteId} should have visible units`).toBeGreaterThan(0);
  expect(state.secondCount, `${secondRouteId} should have visible units`).toBeGreaterThan(0);
  expect(state.minimumDistance, `${firstRouteId} should visually meet ${secondRouteId}`).toBeLessThan(maxDistancePx);
}

async function expectNianzhuangClosingRoutesStayLocal(page: Page) {
  const routeState = await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const routeIds = ["pla-east-closing-position", "pla-north-closing-position", "pla-south-closing-position", "pla-southwest-closing-position"];
    const routes = routeIds.map((routeId) => {
      const line = document.querySelector(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`);
      const route = line?.querySelector(".front-route");
      const box = route?.getBoundingClientRect();
      return {
        routeId,
        heightRatio: stage && box ? box.height / stage.height : Number.NaN,
        rendered: Boolean(line),
        unitVisible: line?.getAttribute("data-unit-visible"),
        widthRatio: stage && box ? box.width / stage.width : Number.NaN
      };
    });

    return { routes };
  });

  expect(routeState.routes.every((route) => route.rendered && route.unitVisible === "true")).toBe(true);
  for (const route of routeState.routes) {
    expect(route.widthRatio, `${route.routeId} should be a local landing segment, not an old long pursuit line`).toBeLessThan(0.6);
    expect(route.heightRatio, `${route.routeId} should be a local landing segment, not an old long pursuit line`).toBeLessThan(0.82);
  }
}

async function expectNianzhuangMapFocus(page: Page, expectedFocus: string) {
  await expect(page.locator(".nianzhuang-battle .camera-layer")).toHaveAttribute("data-map-focus", expectedFocus);
  await expect(page.getByTestId("nianzhuang-terrain-3d")).toHaveAttribute("data-map-focus", expectedFocus);
}

async function expectNianzhuangStageInView(page: Page) {
  const placement = await page.getByTestId("map-stage").evaluate((stage) => {
    const box = stage.getBoundingClientRect();
    return {
      bottom: box.bottom,
      height: box.height,
      top: box.top,
      viewportHeight: window.innerHeight
    };
  });

  expect(placement.top, "event jumps should return the tactical map to the viewport").toBeGreaterThanOrEqual(0);
  expect(placement.top, "event jumps should not leave the map below the fold").toBeLessThan(placement.viewportHeight * 0.28);
  expect(placement.bottom, "most of the tactical map should remain visible after an event jump").toBeGreaterThan(placement.viewportHeight * 0.72);
  expect(placement.height, "Nianzhuang tactical map should keep a large working area").toBeGreaterThan(placement.viewportHeight * 0.72);
}

async function expectNianzhuangLocalBattlefieldSpread(
  page: Page,
  routeIds: string[],
  minimumWidthRatio: number,
  minimumHeightRatio: number,
  maximumWidthRatio = 0.82,
  maximumHeightRatio = 0.72
) {
  const spread = await page.evaluate((routes) => {
    const stage = document.querySelector('[data-testid="map-stage"]')?.getBoundingClientRect();
    const routeBoxes = routes
      .flatMap((routeId) =>
        [
          ...document.querySelectorAll(
            `.nianzhuang-battle .front-line[data-route-id="${routeId}"] .front-route, ` +
              `.nianzhuang-battle .front-line[data-route-id="${routeId}"] .formation-unit`
          )
        ].map((node) => {
          const box = node.getBoundingClientRect();
          return box && box.width > 0 && box.height > 0
            ? {
                bottom: box.bottom,
                left: box.left,
                right: box.right,
                top: box.top
              }
            : null;
        })
      )
      .filter((box): box is { bottom: number; left: number; right: number; top: number } => box !== null);

    if (!stage || routeBoxes.length === 0) {
      return null;
    }

    const bounds = routeBoxes.reduce(
      (accumulator, box) => ({
        bottom: Math.max(accumulator.bottom, box.bottom),
        left: Math.min(accumulator.left, box.left),
        right: Math.max(accumulator.right, box.right),
        top: Math.min(accumulator.top, box.top)
      }),
      {
        bottom: Number.NEGATIVE_INFINITY,
        left: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        top: Number.POSITIVE_INFINITY
      }
    );

    return {
      heightRatio: (bounds.bottom - bounds.top) / stage.height,
      widthRatio: (bounds.right - bounds.left) / stage.width
    };
  }, routeIds);

  expect(spread).not.toBeNull();
  expect(spread?.widthRatio).toBeGreaterThan(minimumWidthRatio);
  expect(spread?.heightRatio).toBeGreaterThan(minimumHeightRatio);
  expect(spread?.widthRatio, `${routeIds.join(", ")} should not force a close-up camera`).toBeLessThan(maximumWidthRatio);
  expect(spread?.heightRatio, `${routeIds.join(", ")} should not force a close-up camera`).toBeLessThan(maximumHeightRatio);
}

async function jumpToEventByName(page: Page, name: RegExp) {
  await page.getByTestId("event-list").getByRole("button", { name }).click();
}

async function jumpNianzhuangTimelineTo(page: Page, date: string) {
  const timeline = createCampaignTimeline({
    activeSpans: nianzhuangData.timelineActiveSpans,
    campaignEnd: nianzhuangData.campaignEnd,
    campaignStart: nianzhuangData.campaignStart,
    dateAnchors: nianzhuangData.timelineDateAnchors,
    events: nianzhuangData.battleEvents,
    gapOverrides: nianzhuangData.timelineGapOverrides,
    inactiveGapDisplayDays: nianzhuangData.timelineInactiveGapDisplayDays,
    points: nianzhuangData.mapPoints,
    timingMode: "compressed"
  });
  const timelineValue = String(Math.round(timeline.dateToProgress(date) * 1000));
  await page.getByTestId("timeline").fill(timelineValue);
  await expect(page.getByTestId("timeline")).toHaveValue(timelineValue);
  const currentZoom = Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"));
  if (currentZoom <= 0) {
    await expect.poll(async () => Number(await page.getByTestId("nianzhuang-terrain-3d").getAttribute("data-map-zoom"))).toBeGreaterThan(0);
  }
}

async function expectAncientEventClickPlaysMeleeCue(page: Page, clickEvent: () => Promise<void>) {
  await installAudioSpy(page);
  await clickEvent();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/swords-clashing.mp3")).toBeGreaterThan(0);
}

async function expectAncientBattleEventsPlayMeleeCue(page: Page, eventNames: RegExp[]) {
  await installAudioSpy(page);

  for (const [index, eventName] of eventNames.entries()) {
    await page.evaluate(() => {
      const win = window as typeof window & { __playedAudioSources?: string[] };
      if (win.__playedAudioSources) {
        win.__playedAudioSources.length = 0;
      }
    });
    await page.getByTestId("event-list").getByRole("button", { name: eventName }).click();
    await expect.poll(() => countPlayedAudio(page, "/audio/sfx/swords-clashing.mp3")).toBeGreaterThan(0);
  }
}

async function installAudioSpy(page: Page) {
  await page.evaluate(() => {
    const win = window as typeof window & { __playedAudioSources?: string[]; __audioSpyInstalled?: boolean };
    if (win.__audioSpyInstalled) {
      if (win.__playedAudioSources) {
        win.__playedAudioSources.length = 0;
      }
      return;
    }

    const sources: string[] = [];

    class FakeAudio extends EventTarget {
      currentTime = 0;
      loop = false;
      preload = "";
      src: string;
      volume = 1;

      constructor(src = "") {
        super();
        this.src = src;
      }

      pause() {}

      async play() {
        sources.push(this.src);
        return Promise.resolve();
      }
    }

    win.__playedAudioSources = sources;
    win.__audioSpyInstalled = true;
    window.Audio = FakeAudio as unknown as typeof Audio;
  });
}

async function countPlayedAudio(page: Page, sourceFragment: string) {
  return page.evaluate((fragment) => {
    const win = window as typeof window & { __playedAudioSources?: string[] };
    return win.__playedAudioSources?.filter((source) => source.includes(fragment)).length ?? 0;
  }, sourceFragment);
}

const campaignIds = [
  "alexander",
  "punic",
  "cannae",
  "qin",
  "gaixia",
  "caesar",
  "crusades",
  "mongol",
  "napoleonic",
  "trafalgar",
  "tsushima",
  "jutland",
  "france",
  "britain-air",
  "eastern",
  "pacific",
  "midway",
  "bismarck-sea",
  "atlantic-convoy",
  "guadalcanal",
  "big-week",
  "nianzhuang",
  "korean",
  "gulf"
] as const;

const temporarySharedMusicCampaignIds = new Set<(typeof campaignIds)[number]>(["big-week", "bismarck-sea"]);

async function openCampaignFromHome(page: Page, campaignId: (typeof campaignIds)[number]) {
  await page.goto("/");
  await page.getByTestId(`open-${campaignId}`).click();
}

async function collectCampaignMusicSources(page: Page) {
  const sources: string[] = [];

  for (const campaignId of campaignIds) {
    if (temporarySharedMusicCampaignIds.has(campaignId)) {
      continue;
    }

    await openCampaignFromHome(page, campaignId);
    sources.push((await page.getByTestId("score-toggle").getAttribute("data-music-source")) ?? "");
  }

  return sources;
}

test("campaign data quality gates keep timelines routes and cues coherent", async () => {
  for (const [campaignName, data] of genericCampaignData) {
    const points = new Set((data.mapPoints ?? []).map((point) => point.id));

    expect(toTime(data.campaignEnd), `${campaignName} campaign end should be after start`).toBeGreaterThan(toTime(data.campaignStart));
    expectEventsSortedByDate(campaignName, data.battleEvents);

    for (const event of data.battleEvents) {
      expectDateWithinRange(`${campaignName} event ${event.id}`, event.date, data.campaignStart, data.campaignEnd);
      if (eventLooksLikeCombat(event) && data.cueEventIds && !intentionalQuietCombatLikeEvents.has(event.id)) {
        expect(data.cueEventIds.has(event.id), `${campaignName} combat event ${event.id} should have an audio cue`).toBe(true);
      }
    }

    for (const point of data.mapPoints ?? []) {
      if (point.revealAt) {
        expectDateWithinRange(`${campaignName} point ${point.id} revealAt`, point.revealAt, data.campaignStart, data.campaignEnd);
      }
    }

    for (const line of data.frontLines ?? []) {
      expect(points.has(line.from), `${campaignName} route ${line.id} from point exists`).toBe(true);
      expect(points.has(line.to), `${campaignName} route ${line.id} to point exists`).toBe(true);
      expectDateWithinRange(`${campaignName} route ${line.id} start`, line.start, data.campaignStart, data.campaignEnd);
      expectDateWithinRange(`${campaignName} route ${line.id} end`, line.end, data.campaignStart, data.campaignEnd);
      expect(toTime(line.end), `${campaignName} route ${line.id} should not end before start`).toBeGreaterThanOrEqual(toTime(line.start));
      if (line.visibleUntil) {
        expect(toTime(line.visibleUntil), `${campaignName} route ${line.id} visibleUntil should not be before start`).toBeGreaterThanOrEqual(
          toTime(line.start)
        );
      }
      if (line.unitVisibleUntil) {
        expect(toTime(line.unitVisibleUntil), `${campaignName} route ${line.id} unitVisibleUntil should not be before start`).toBeGreaterThanOrEqual(
          toTime(line.start)
        );
      }
      if (line.formationUnits && line.formationUnits.length > 1) {
        expect(line.routeKind, `${campaignName} multi-unit route ${line.id} should declare routeKind`).toBeTruthy();
      }
    }

    for (const route of data.routes ?? []) {
      expectDateWithinRange(`${campaignName} route ${route.id} start`, route.start, data.campaignStart, data.campaignEnd);
      expectDateWithinRange(`${campaignName} route ${route.id} end`, route.end, data.campaignStart, data.campaignEnd);
      expect(toTime(route.end), `${campaignName} route ${route.id} should not end before start`).toBeGreaterThanOrEqual(toTime(route.start));
      if (route.visibleUntil) {
        expect(toTime(route.visibleUntil), `${campaignName} route ${route.id} visibleUntil should not be before start`).toBeGreaterThanOrEqual(
          toTime(route.start)
        );
      }
      if (route.unitVisibleUntil) {
        expect(toTime(route.unitVisibleUntil), `${campaignName} route ${route.id} unitVisibleUntil should not be before start`).toBeGreaterThanOrEqual(
          toTime(route.start)
        );
      }
    }

    if (["battleOfBritain", "bigWeekAirBattle", "bismarckSeaAirBattle"].includes(campaignName)) {
      expectAirRoutesHaveShortUnitWindows(campaignName, data, campaignName === "bigWeekAirBattle" ? 12 : 8);
    }

    if (campaignName === "atlanticConvoyBattle") {
      expectAirRoutesHaveShortUnitWindows(campaignName, data, 12);
      expectAirRouteUnitsMoveUntilExit(campaignName, data);
      expectAtlanticConvoySeaUnitsStayOnline(data);
      expectAtlanticConvoyEffectsAlignWithTargets(data);
    }
  }

  expectAirRouteUnitsMoveUntilExit("battleOfBritain", battleOfBritainData as CampaignDataModule);
  expectBattleOfBritainUsesRealAircraftAndAnchoredAirspace(battleOfBritainData as CampaignDataModule);

  expectEventHasActiveRoute("battleOfBritain", battleOfBritainData as CampaignDataModule, "afternoon-warning", [
    "midday-raf-refuel-patrol",
    "afternoon-radar-warning"
  ]);
  expectEventHasActiveRoute("battleOfBritain", battleOfBritainData as CampaignDataModule, "morning-dogfight-london", [
    "morning-raid-first-wave",
    "morning-raid-second-wave",
    "eleven-group-morning-scramble",
    "twelve-group-morning-wing",
    "morning-raf-dogfight-weave",
    "morning-luftwaffe-cover-break"
  ]);
  expectEventHasActiveRoute("battleOfBritain", battleOfBritainData as CampaignDataModule, "afternoon-all-squadrons-engaged", [
    "afternoon-raid-main-wave",
    "afternoon-raid-follow-wave",
    "eleven-group-afternoon-all-in",
    "big-wing-afternoon-commitment",
    "afternoon-raf-dogfight-weave",
    "afternoon-luftwaffe-cover-split"
  ]);
  expectEventHasActiveRoute("bigWeekAirBattle", bigWeekData as CampaignDataModule, "operation-argument-start", ["argument-first-wave"]);
  expectEventHasActiveRoute("bigWeekAirBattle", bigWeekData as CampaignDataModule, "deep-escort-lesson", [
    "deep-escort-chain",
    "schweinfurt-regensburg-lesson",
    "loss-belt-luftwaffe-intercept",
    "ruhr-flak-belt-fire",
    "damaged-bomber-return"
  ]);
  expectEventHasActiveRoute("bigWeekAirBattle", bigWeekData as CampaignDataModule, "aircraft-industry-targets", [
    "feb-24-industrial-strike",
    "feb-24-escort-cover",
    "feb-24-luftwaffe-defense"
  ]);
  expectEventHasActiveRoute("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "recon-contact", [
    "japanese-convoy-rabaul-lae",
    "allied-search-shadow"
  ]);
  expectEventHasActiveRoute("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "skip-bombing-breakup", [
    "japanese-convoy-rabaul-lae",
    "skip-bombing-attack",
    "convoy-breakup"
  ]);
  expectGaixiaEventHasRoutes("chu-forms-camp-array", ["chu-camp-array-center", "chu-camp-array-east", "chu-camp-array-south"]);
  expectGaixiaEventHasRoutes("hanxin-deploys", ["chu-camp-array-center", "han-west-infantry", "han-east-crossbow-net"]);
  expectGaixiaEventHasRoutes("west-counterpush-yield", ["chu-west-counterpush", "han-west-fallback"]);
  expectGaixiaEventHasRoutes("han-counterpress-east-gap", ["han-west-counterpress", "chu-east-counterpush", "han-east-cavalry-yield"]);
  expectGaixiaEventHasRoutes("ten-sided-ring", ["han-east-counterpress", "chu-probe-east-gap", "han-west-counterpress", "chu-south-screen-recoil", "han-south-locking-line"]);
  expectGaixiaEventHasRoutes("songs-of-chu", ["chu-night-breakout-check", "han-night-east-gap-block"]);
  expectGaixiaEventHasRoutes("farewell", ["chu-camp-array-center", "chu-camp-fragmentation"]);
  expectGaixiaEventHasRoutes("dawn-assault", ["chu-inner-rearguard-stand", "chu-south-gate-rearguard", "chu-east-gate-rearguard"]);
  expectGaixiaEventHasRoutes("xiangyu-breakout", ["chu-east-gate-rearguard", "chu-breakout-southeast", "han-cavalry-pursuit-yinling"]);
  expectGaixiaEventHasRoutes("wujiang-end", ["chu-wujiang-final-flight", "han-cavalry-pursuit-wujiang"]);
  expectGaixiaRouteWindow("chu-retreat-gaixia", { unitVisibleUntil: "BCE-0202-12-01T18:19" });
  expectGaixiaRouteWindow("chu-camp-array-center", { start: "BCE-0202-12-01T18:00", visibleUntil: "BCE-0202-12-02T04:20" });
  expectGaixiaRouteWindow("chu-west-counterpush", { start: "BCE-0202-12-01T19:20", end: "BCE-0202-12-01T20:10" });
  expectGaixiaRouteWindow("han-west-fallback", { start: "BCE-0202-12-01T20:05", end: "BCE-0202-12-01T20:45" });
  expectGaixiaRouteWindow("han-west-counterpress", { start: "BCE-0202-12-01T20:45", visibleUntil: "BCE-0202-12-02T04:20" });
  expectGaixiaRouteWindow("chu-east-counterpush", { start: "BCE-0202-12-01T20:40", end: "BCE-0202-12-01T21:20" });
  expectGaixiaRouteWindow("han-east-cavalry-yield", { start: "BCE-0202-12-01T20:45", end: "BCE-0202-12-01T21:30" });
  expectGaixiaRouteWindow("han-east-counterpress", { start: "BCE-0202-12-01T21:30", visibleUntil: "BCE-0202-12-02T04:20" });
  expectGaixiaRouteWindow("chu-camp-array-south", { unitVisibleUntil: "BCE-0202-12-01T21:59" });
  expectGaixiaRouteWindow("chu-south-screen-recoil", { start: "BCE-0202-12-01T21:50", end: "BCE-0202-12-02T00:30" });
  expectGaixiaRouteWindow("han-south-locking-line", { start: "BCE-0202-12-01T21:50", visibleUntil: "BCE-0202-12-02T05:00" });
  expectGaixiaRoutePositionAnchor("chu-camp-array-center", "chu-center-block");
  expectGaixiaRoutePositionAnchor("chu-camp-array-east", "chu-east-cavalry-screen");
  expectGaixiaRoutePositionAnchor("chu-camp-array-south", "chu-south-infantry-line");
  expectGaixiaRoutePositionAnchor("han-west-infantry", "han-west-infantry-block");
  expectGaixiaRoutePositionAnchor("han-east-crossbow-net", "han-east-crossbow-line");
  expectGaixiaRoutePositionAnchor("han-south-infantry", "chu-south-infantry-line");
  expectGaixiaRoutePositionAnchor("han-tighten-west", "bawangcheng-outer-rampart");
  expectGaixiaRoutePositionAnchor("han-tighten-north", "chu-inner-rampart");
  expectGaixiaRoutePositionAnchor("han-south-locking-line", "old-channel-ditch");
  expectGaixiaRoutePositionAnchor("han-tighten-east", "east-gap-gate");
  expectGaixiaRoutePositionAnchor("han-night-east-gap-block", "east-gap-gate");
  expectGaixiaRoutePositionAnchor("chu-night-breakout-check", "east-gap-gate");
  expectGaixiaRoutePositionAnchor("chu-inner-rearguard-stand", "chu-inner-rampart");
  expectGaixiaRoutePositionAnchor("chu-south-gate-rearguard", "chu-south-infantry-line");
  expectGaixiaRoutePositionAnchor("chu-east-gate-rearguard", "east-gap-gate");
  expectGaixiaRoutePositionAnchor("han-dawn-cavalry-cutoff", "han-southeast-cavalry-ambush");
  for (const [routeId, minimumPreludePoints] of [
    ["chu-camp-array-center", 3],
    ["chu-camp-array-east", 3],
    ["chu-camp-array-south", 3],
    ["han-west-fallback", 2],
    ["han-west-counterpress", 3],
    ["chu-east-counterpush", 3],
    ["han-east-cavalry-yield", 3],
    ["chu-probe-east-gap", 3],
    ["han-east-counterpress", 2],
    ["chu-south-screen-recoil", 2],
    ["han-tighten-west", 3],
    ["han-tighten-north", 3],
    ["han-south-locking-line", 3],
    ["han-tighten-east", 3],
    ["han-night-east-gap-block", 4],
    ["chu-night-breakout-check", 4],
    ["chu-camp-fragmentation", 3],
    ["han-dawn-assault-north", 4],
    ["han-dawn-assault-south", 4],
    ["han-dawn-assault-west", 4],
    ["han-dawn-cavalry-cutoff", 5],
    ["chu-inner-rearguard-stand", 3],
    ["chu-south-gate-rearguard", 3],
    ["chu-east-gate-rearguard", 3],
    ["chu-breakout-southeast", 3],
    ["han-cavalry-pursuit-yinling", 4],
    ["chu-dongcheng-last-stand", 2],
    ["chu-wujiang-final-flight", 3],
    ["han-cavalry-pursuit-wujiang", 2]
  ] as const) {
    expectGaixiaRouteHasPrelude(routeId, minimumPreludePoints);
  }
  const chuInnerRampart = gaixiaData.fieldworks.find((fieldwork) => fieldwork.id === "chu-inner-rampart")!.coordinates;
  for (const routeId of [
    "han-west-infantry",
    "han-northwest-shield",
    "han-east-crossbow-net",
    "han-east-cavalry",
    "han-south-infantry",
    "han-command-center",
    "han-feigned-gap-east",
    "han-west-counterpress",
    "han-east-counterpress",
    "han-tighten-west",
    "han-tighten-north",
    "han-south-locking-line",
    "han-tighten-east",
    "han-night-east-gap-block"
  ]) {
    expectRouteOutsidePolygon(routeId, chuInnerRampart, "Chu inner rampart before dawn assault");
  }
  for (const formationId of ["han-west-infantry-block", "han-east-crossbow-line", "han-command-post"]) {
    expectFormationOutsidePolygon(formationId, chuInnerRampart, "Chu inner rampart before dawn assault");
  }
  expect(routeCoordinate("han-tighten-west", -1)[0], "west compression should halt outside the Chu center").toBeLessThanOrEqual(117.415);
  expect(routeCoordinate("han-west-infantry", -1)[0], "initial west infantry should stage outside the west camp gate").toBeLessThanOrEqual(117.36);
  expect(routeCoordinate("han-east-crossbow-net", -1)[0], "initial east crossbow net should stage outside the east gate").toBeGreaterThanOrEqual(117.545);
  expect(routeCoordinate("han-south-infantry", -1)[1], "initial south infantry should stop outside the southern Chu line").toBeLessThanOrEqual(33.26);
  expect(routeCoordinate("han-command-center", -1)[0], "Han command center should remain outside the Chu inner camp").toBeLessThanOrEqual(117.4);
  expect(routeCoordinate("han-tighten-north", -1)[1], "north compression should halt on the inner-rampart edge before dawn").toBeGreaterThanOrEqual(33.36);
  expect(routeCoordinate("han-south-locking-line", -1)[1], "south blockade should hold the south mouth rather than enter the camp center").toBeLessThanOrEqual(33.28);
  expect(routeCoordinate("han-tighten-east", -1)[0], "east compression should hold the east gate edge before dawn").toBeGreaterThanOrEqual(117.52);
  expect(routeCoordinate("han-night-east-gap-block", -1)[0], "night cavalry block should remain on the east gate line").toBeGreaterThanOrEqual(117.545);
  const chuNightBreakout = gaixiaData.routes.find((route) => route.id === "chu-night-breakout-check")!;
  expect(chuNightBreakout.unitKind, "night breakout should show Chu cavalry probing the east gate").toBe("chu-cavalry");
  for (let index = 1; index < chuNightBreakout.points.length; index += 1) {
    expect(chuNightBreakout.points[index][0], "Chu night breakout should not reverse after crossing the gate contact line").toBeGreaterThanOrEqual(chuNightBreakout.points[index - 1][0]);
  }
  expect(routeCoordinate("chu-night-breakout-check", -1)[0], "Chu night breakout should be checked before it clears the east gate").toBeLessThanOrEqual(117.535);
  expect(routeCoordinate("chu-night-breakout-check", -1)[1], "Chu night breakout should stay near the east gate contact line").toBeGreaterThanOrEqual(33.315);
  expectGaixiaRouteWindow("han-dawn-assault-north", { start: "BCE-0202-12-02T03:05", end: "BCE-0202-12-02T04:50" });
  expectGaixiaRouteWindow("han-dawn-assault-south", { start: "BCE-0202-12-02T03:10", end: "BCE-0202-12-02T05:00" });
  expectGaixiaRouteWindow("han-dawn-assault-west", { start: "BCE-0202-12-02T03:10", end: "BCE-0202-12-02T05:05" });
  expectGaixiaRouteWindow("han-dawn-cavalry-cutoff", { start: "BCE-0202-12-02T04:18", end: "BCE-0202-12-02T05:35" });
  expectGaixiaRouteWindow("chu-inner-rearguard-stand", {
    start: "BCE-0202-12-02T04:05",
    end: "BCE-0202-12-02T04:55",
    unitVisibleUntil: "BCE-0202-12-02T05:05",
    visibleUntil: "BCE-0202-12-02T05:20"
  });
  expectGaixiaRouteWindow("chu-south-gate-rearguard", {
    start: "BCE-0202-12-02T04:10",
    end: "BCE-0202-12-02T05:10",
    unitVisibleUntil: "BCE-0202-12-02T05:10",
    visibleUntil: "BCE-0202-12-02T05:25"
  });
  expectGaixiaRouteWindow("chu-east-gate-rearguard", {
    start: "BCE-0202-12-02T04:18",
    end: "BCE-0202-12-02T05:30",
    unitVisibleUntil: "BCE-0202-12-02T05:31",
    visibleUntil: "BCE-0202-12-02T05:40"
  });
  expectGaixiaRouteWindow("han-cavalry-pursuit-yinling", { start: "BCE-0202-12-02T04:40", end: "BCE-0202-12-02T06:30" });
  expectGaixiaRouteWindow("chu-breakout-southeast", { end: "BCE-0202-12-02T06:20", unitVisibleUntil: "BCE-0202-12-02T06:20" });
  expectGaixiaRouteWindow("chu-dongcheng-last-stand", { start: "BCE-0202-12-02T06:20", unitVisibleUntil: "BCE-0202-12-02T07:05" });
  expectGaixiaRouteWindow("chu-wujiang-final-flight", { start: "BCE-0202-12-02T07:05", end: "BCE-0202-12-02T08:00" });
  expectGaixiaRouteWindow("han-cavalry-pursuit-wujiang", { start: "BCE-0202-12-02T06:10", end: "BCE-0202-12-02T07:50" });
  expect(routeCoordinate("han-dawn-cavalry-cutoff", -1)[0], "dawn cavalry cutoff should hold the outer southeast escape lane, not pierce back through the Chu camp").toBeGreaterThanOrEqual(117.64);
  expect(routeCoordinate("han-dawn-cavalry-cutoff", -1)[1], "dawn cavalry cutoff should tail the breakout route instead of driving deep into the camp center").toBeLessThanOrEqual(33.18);
  expect(minRouteDistance("han-dawn-cavalry-cutoff", "chu-breakout-southeast"), "dawn cavalry cutoff should coordinate with the Chu breakout lane").toBeLessThanOrEqual(0.035);
  expect(minRouteDistance("han-dawn-cavalry-cutoff", "han-cavalry-pursuit-yinling"), "dawn cavalry cutoff should hand off naturally to the pursuit cavalry").toBeLessThanOrEqual(0.035);
  expect(minRouteDistance("han-dawn-assault-north", "chu-inner-rearguard-stand"), "north dawn assault should contact Chu inner rearguard instead of entering an empty camp").toBeLessThanOrEqual(0.035);
  expect(minRouteDistance("han-dawn-assault-west", "chu-inner-rearguard-stand"), "west dawn assault should contact Chu inner rearguard instead of entering an empty camp").toBeLessThanOrEqual(0.035);
  expect(minRouteDistance("han-dawn-assault-south", "chu-south-gate-rearguard"), "south dawn assault should hit the Chu south-gate rearguard").toBeLessThanOrEqual(0.035);
  expect(minRouteDistance("han-dawn-cavalry-cutoff", "chu-east-gate-rearguard"), "dawn cutoff should meet Chu east-gate rearguard before the pursuit handoff").toBeLessThanOrEqual(0.035);
  const dawnCutoffRoute = gaixiaData.routes.find((route) => route.id === "han-dawn-cavalry-cutoff")!;
  for (let index = 1; index < dawnCutoffRoute.points.length; index += 1) {
    expect(dawnCutoffRoute.points[index][0], "dawn cutoff cavalry should move southeast with the pursuit lane, not reverse through the Chu camp").toBeGreaterThanOrEqual(dawnCutoffRoute.points[index - 1][0]);
    expect(dawnCutoffRoute.points[index][1], "dawn cutoff cavalry should press down the escape lane, not climb back toward the camp center").toBeLessThanOrEqual(dawnCutoffRoute.points[index - 1][1]);
  }
  const dawnCutoffPoint = gaixiaRoutePointAtDate("han-dawn-cavalry-cutoff", "BCE-0202-12-02T04:20");
  const dawnChuPoint = gaixiaRoutePointAtDate("chu-breakout-southeast", "BCE-0202-12-02T04:20");
  expect(Math.hypot(dawnCutoffPoint[0] - dawnChuPoint[0], dawnCutoffPoint[1] - dawnChuPoint[1]), "dawn cutoff cavalry should be in near contact with the breakout point, not far down the road").toBeLessThanOrEqual(0.03);
  expect(dawnCutoffPoint[1] - dawnChuPoint[1], "dawn cutoff cavalry should sit on the outer southeast side, not above or behind the Chu center").toBeLessThanOrEqual(0);
  const pursuitHandOffCutoffPoint = gaixiaRoutePointAtDate("han-dawn-cavalry-cutoff", "BCE-0202-12-02T05:30");
  const pursuitHandOffHanPoint = gaixiaRoutePointAtDate("han-cavalry-pursuit-yinling", "BCE-0202-12-02T05:30");
  const pursuitHandOffChuPoint = gaixiaRoutePointAtDate("chu-breakout-southeast", "BCE-0202-12-02T05:30");
  expect(Math.hypot(pursuitHandOffCutoffPoint[0] - pursuitHandOffChuPoint[0], pursuitHandOffCutoffPoint[1] - pursuitHandOffChuPoint[1]), "cutoff cavalry should still tail the Chu breakout at the pursuit handoff").toBeLessThanOrEqual(0.05);
  expect(Math.hypot(pursuitHandOffHanPoint[0] - pursuitHandOffChuPoint[0], pursuitHandOffHanPoint[1] - pursuitHandOffChuPoint[1]), "pursuit cavalry should be the unit taking over close contact by Xiang Yu's breakout event").toBeLessThanOrEqual(0.03);
  expectRouteEndsBehind("chu-wujiang-final-flight", "han-cavalry-pursuit-wujiang");
  expect(gaixiaData.terrainReliefSurfaces, "gaixia should model terrain as raised tactical surfaces").toHaveLength(7);
  expect(gaixiaData.terrainReliefSurfaces.every((surface) => surface.elevation >= surface.baseElevation)).toBe(true);
  expect(gaixiaData.terrainReliefSurfaces.map((surface) => surface.tacticalRole)).toEqual(
    expect.arrayContaining(["key-terrain", "obstacle", "avenue", "camp-shelf"])
  );
  expect(gaixiaData.tacticalGraphics.map((graphic) => graphic.kind)).toEqual(
    expect.arrayContaining(["key-terrain", "obstacle", "avenue", "engagement-area", "blocking-line"])
  );
  expect(gaixiaData.fieldworks.map((fieldwork) => fieldwork.kind)).toEqual(expect.arrayContaining(["earthwork", "ditch", "gate", "camp-line"]));
  expect(gaixiaData.formations.map((formation) => formation.kind)).toEqual(
    expect.arrayContaining(["infantry-block", "cavalry-screen", "crossbow-line", "command-post", "ambush-line"])
  );
  for (const graphic of gaixiaData.tacticalGraphics.filter((item) => item.revealAt)) {
    expectDateWithinRange(`gaixia tactical graphic ${graphic.id} revealAt`, graphic.revealAt!, gaixiaData.campaignStart, gaixiaData.campaignEnd);
  }
  for (const fieldwork of gaixiaData.fieldworks.filter((item) => item.revealAt)) {
    expectDateWithinRange(`gaixia fieldwork ${fieldwork.id} revealAt`, fieldwork.revealAt!, gaixiaData.campaignStart, gaixiaData.campaignEnd);
  }
  for (const formation of gaixiaData.formations) {
    expectDateWithinRange(`gaixia formation ${formation.id} start`, formation.start, gaixiaData.campaignStart, gaixiaData.campaignEnd);
    if (formation.end) {
      expectDateWithinRange(`gaixia formation ${formation.id} end`, formation.end, gaixiaData.campaignStart, gaixiaData.campaignEnd);
      expect(toTime(formation.end), `gaixia formation ${formation.id} should not end before it starts`).toBeGreaterThan(toTime(formation.start));
    }
  }
  const dawnEventTime = toTime(gaixiaData.battleEvents.find((event) => event.id === "dawn-assault")!.date);
  for (const routeId of ["han-dawn-assault-north", "han-dawn-assault-south", "han-dawn-assault-west", "han-dawn-cavalry-cutoff"]) {
    const route = gaixiaData.routes.find((item) => item.id === routeId)!;
    expect(toTime(route.start), `gaixia route ${routeId} should enter before dawn assault event`).toBeLessThan(dawnEventTime);
  }
  expect(toTime(gaixiaData.battleEvents.find((event) => event.id === "chu-forms-camp-array")!.date)).toBeLessThan(
    toTime(gaixiaData.battleEvents.find((event) => event.id === "west-counterpush-yield")!.date)
  );
  expect(toTime(gaixiaData.battleEvents.find((event) => event.id === "west-counterpush-yield")!.date)).toBeLessThan(
    toTime(gaixiaData.battleEvents.find((event) => event.id === "han-counterpress-east-gap")!.date)
  );
  expect(toTime(gaixiaData.battleEvents.find((event) => event.id === "songs-of-chu")!.date)).toBeLessThan(
    toTime(gaixiaData.battleEvents.find((event) => event.id === "farewell")!.date)
  );
  expect(nianzhuangData.campaignStart).toBe("1948-11-06T18:00");
  expect(nianzhuangData.campaignEnd).toBe("1948-11-22T20:00");
  expect(nianzhuangEvent("campaign-opens").date).toBe("1948-11-06T18:00");
  expect(nianzhuangEvent("huang-withdraws").date).toBe("1948-11-07T06:00");
  expect(nianzhuangEvent("hold-and-relief").date).toBe("1948-11-11T12:00");
  expect(nianzhuangEvent("preliminary-attacks").date).toBe("1948-11-13T06:00");
  expect(nianzhuangEvent("trench-approach").date).toBe("1948-11-15T02:00");
  expect(nianzhuangEvent("general-assault").date).toBe("1948-11-19T10:00");
  expect(nianzhuangEvent("first-line-broken").date).toBe("1948-11-19T22:30");
  expect(nianzhuangEvent("second-line-broken").date).toBe("1948-11-20T03:30");
  expect(nianzhuangEvent("final-pocket").date).toBe("1948-11-20T05:30");
  expect(nianzhuangEvent("huang-end").date).toBe("1948-11-22T18:00");
  expect(nianzhuangData.timelineActiveSpans).toEqual([{ start: "1948-11-19T10:00", end: "1948-11-22T20:00" }]);
  expect(nianzhuangData.timelineInactiveGapDisplayDays).toBe(0.1);
  expect(nianzhuangData.timelineGapOverrides.map((gap) => `${gap.start}->${gap.end}`)).toEqual([
    "1948-11-06T18:00->1948-11-07T06:00",
    "1948-11-07T06:00->1948-11-10T20:00",
    "1948-11-10T20:00->1948-11-11T12:00",
    "1948-11-11T12:00->1948-11-13T06:00",
    "1948-11-13T06:00->1948-11-13T18:00",
    "1948-11-13T18:00->1948-11-15T02:00",
    "1948-11-15T02:00->1948-11-17T20:00",
    "1948-11-17T20:00->1948-11-19T10:00",
    "1948-11-19T10:00->1948-11-19T21:15",
    "1948-11-19T21:15->1948-11-19T22:30",
    "1948-11-19T22:30->1948-11-20T03:30",
    "1948-11-20T03:30->1948-11-20T05:15",
    "1948-11-20T05:15->1948-11-20T05:30",
    "1948-11-20T05:30->1948-11-20T18:00",
    "1948-11-20T18:00->1948-11-21T08:00",
    "1948-11-21T08:00->1948-11-21T18:00",
    "1948-11-21T18:00->1948-11-21T22:00",
    "1948-11-21T22:00->1948-11-22T10:00",
    "1948-11-22T10:00->1948-11-22T16:00",
    "1948-11-22T16:00->1948-11-22T16:20",
    "1948-11-22T16:20->1948-11-22T18:00",
    "1948-11-22T18:00->1948-11-22T18:50",
    "1948-11-22T18:50->1948-11-22T20:00"
  ]);
  expect(nianzhuangData.timelineDateAnchors).toContain("1948-11-22T16:00");
  expect(nianzhuangData.tacticalTerrainFeatures.map((feature) => feature.id)).toEqual([
    "nianzhuang-relief-shelf",
    "daxujia-relief-ridge",
    "waterlogged-lowland",
    "outer-village-worksites",
    "north-contour",
    "center-contour",
    "south-contour",
    "west-trench-line",
    "east-water-ditch-line",
    "inner-fortified-platform",
    "east-remnant-village-worksites",
    "north-remnant-worksite",
    "south-remnant-worksite"
  ]);
  expect(nianzhuangData.tacticalTerrainFeatures.map((feature) => feature.kind)).toEqual(
    expect.arrayContaining(["contour", "ditch", "lowland", "relief", "village"])
  );
  expect(nianzhuangData.tacticalTerrainFeatures.every((feature) => typeof feature.height === "number" && feature.height > 0)).toBe(true);
  expect(nianzhuangData.tacticalTerrainFeatures.find((feature) => feature.id === "west-trench-line")?.revealAt).toBe("1948-11-15T02:00");
  expect(nianzhuangData.tacticalTerrainFeatures.find((feature) => feature.id === "east-water-ditch-line")?.revealAt).toBe("1948-11-15T02:00");
  expectNianzhuangAllRoutesUseVisibleAnchors();
  expectNianzhuangRoutePositionAnchor("xuzhou-relief-second-thrust", "relief-forward-sap");
  expectNianzhuangRoutePositionAnchor("pla-general-assault-west", "outer-defense-west-break");
  expectNianzhuangRoutePositionAnchor("pla-second-wall-east", "second-defense-east-breach");
  expectNianzhuangRoutePositionAnchor("huang-final-core-defense", "final-core");
  expectNianzhuangRoutePositionAnchor("pla-nizhuang-pursuit", "nizhuang-final-corridor");
  for (const overlayId of ["west-tug-note", "east-tug-note", "night-breakthrough-note", "remnant-tug-note"]) {
    const overlay = nianzhuangData.mapOverlays.find((item) => item.id === overlayId);
    expect(overlay, `nianzhuang tactical tug note ${overlayId} should be present`).toBeTruthy();
    expect(overlay?.type).toBe("marker");
    expect(overlay?.className).toContain("tug-of-war-callout");
  }
  expectNianzhuangTimelinePacing();
  expectNianzhuangEventFocus("hold-and-relief", [
    "huang-nianzhuang-defense-ring",
    "pla-encirclement-ring",
    "xuzhou-relief-east",
    "xuzhou-relief-second-thrust",
    "pla-relief-block-line",
    "pla-relief-depth-line"
  ]);
  expectNianzhuangEventFocus("pocket-closes", [
    "huang-deploy-north",
    "huang-deploy-east",
    "huang-deploy-south",
    "huang-deploy-west",
    "huang-deploy-command",
    "huang-outer-destroyed-column",
    "pla-east-closing-position",
    "pla-north-closing-position",
    "pla-south-closing-position",
    "pla-southwest-closing-position",
    "pla-encirclement-ring"
  ]);
  expectNianzhuangEventFocus("preliminary-attacks", [
    "pla-4th-preliminary-daxingzhuang",
    "pla-13th-preliminary-songzhuang",
    "pla-6th-preliminary-pengzhuang",
    "pla-encirclement-ring",
    "huang-nianzhuang-defense-ring"
  ]);
  expectNianzhuangEventFocus("relief-blocked", [
    "xuzhou-relief-east",
    "xuzhou-relief-second-thrust",
    "xuzhou-relief-contained",
    "pla-relief-block-line",
    "pla-relief-depth-line",
    "pla-relief-lateral-seal",
    "pla-relief-counterpush",
    "daxujia"
  ]);
  expectNianzhuangEventFocus("trench-approach", ["pla-west-trench-approach", "pla-north-trench-approach", "huang-nianzhuang-defense-ring"]);
  expectNianzhuangEventFocus("general-assault", ["pla-artillery-zhoujiazhai", "pla-west-trench-approach", "huang-nianzhuang-defense-ring"]);
  expectNianzhuangEventFocus("first-line-broken", [
    "pla-general-assault-west",
    "huang-west-night-counterattack",
    "pla-west-night-counterpress",
    "huang-east-night-counterattack",
    "pla-east-night-counterpress",
    "huang-inner-recoil",
    "huang-north-fragment-recoil",
    "huang-east-fragment-recoil",
    "huang-south-fragment-recoil",
    "inner-west-line"
  ]);
  expectNianzhuangEventFocus("second-line-broken", [
    "pla-second-wall-west",
    "pla-second-wall-north",
    "pla-second-wall-south",
    "pla-second-wall-east",
    "huang-final-core-defense",
    "huang-second-wall-collapse"
  ]);
  expectNianzhuangEventFocus("final-pocket", [
    "pla-remnant-mop-up-north",
    "pla-remnant-mop-up-east",
    "pla-remnant-mop-up-south",
    "pla-remnant-mop-up-west",
    "huang-north-remnant-sortie",
    "pla-north-remnant-counterpress",
    "huang-south-remnant-sortie",
    "pla-south-remnant-counterpress",
    "huang-remnant-fallback-east",
    "huang-east-remnant-defense",
    "xuzhou-relief-contained",
    "pla-relief-depth-line",
    "pla-relief-counterpush"
  ]);
  expectNianzhuangRouteWindow("huang-xinan-west-withdrawal", {
    start: "1948-11-07T06:00",
    end: "1948-11-10T20:00",
    unitVisibleUntil: "1948-11-10T20:30",
    visibleUntil: "1948-11-10T20:30"
  });
  expectNianzhuangRouteWindow("huang-nianzhuang-defense-ring", {
    start: "1948-11-11T12:00",
    end: "1948-11-11T18:00",
    visibleFrom: "1948-11-11T11:59",
    unitVisibleFrom: "1948-11-11T11:59",
    unitVisibleUntil: "1948-11-19T22:30",
    visibleUntil: "1948-11-19T22:29"
  });
  for (const routeId of ["huang-deploy-north", "huang-deploy-east", "huang-deploy-south", "huang-deploy-west", "huang-deploy-command"]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-10T20:00",
      end: "1948-11-11T12:00",
      unitVisibleUntil: "1948-11-11T11:59",
      visibleUntil: "1948-11-11T11:59"
    });
  }
  expectNianzhuangRouteWindow("huang-deploy-north", { unitVisibleFrom: "1948-11-10T22:30" });
  expectNianzhuangRouteWindow("huang-deploy-east", { unitVisibleFrom: "1948-11-10T23:00" });
  expectNianzhuangRouteWindow("huang-deploy-south", { unitVisibleFrom: "1948-11-10T23:30" });
  expectNianzhuangRouteWindow("huang-deploy-west", { unitVisibleFrom: "1948-11-11T00:00" });
  for (const routeId of ["huang-deploy-north", "huang-deploy-east", "huang-deploy-south", "huang-deploy-west"]) {
    expectNianzhuangRouteNotVisibleBeforeUnit(routeId);
  }
  expectNianzhuangRouteWindow("huang-outer-destroyed-column", {
    start: "1948-11-10T20:00",
    end: "1948-11-13T18:00",
    unitVisibleUntil: "1948-11-13T18:00",
    visibleUntil: "1948-11-15T01:59"
  });
  expectNianzhuangRouteWindow("pla-encirclement-ring", {
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitVisibleFrom: "1948-11-11T11:59",
    visibleUntil: "1948-11-22T20:00"
  });
  for (const routeId of ["pla-east-pursuit-main", "pla-north-pursuit", "pla-south-pursuit", "pla-southwest-closing-line"]) {
    expectNianzhuangRouteWindow(routeId, {
      unitVisibleUntil: "1948-11-11T06:00",
      visibleUntil: "1948-11-10T20:30"
    });
  }
  for (const routeId of ["pla-east-closing-position", "pla-north-closing-position", "pla-south-closing-position", "pla-southwest-closing-position"]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-10T20:00",
      end: "1948-11-11T06:00",
      unitVisibleUntil: "1948-11-11T12:10",
      visibleUntil: "1948-11-11T11:59"
    });
  }
  expectNianzhuangRouteWindow("pla-east-closing-position", { retainRouteTailRatio: 0.32 });
  expectNianzhuangRouteWindow("pla-southwest-closing-position", { retainRouteTailRatio: 0.38 });
  expectNianzhuangRouteWindow("xuzhou-relief-east", {
    start: "1948-11-11T12:00",
    end: "1948-11-13T06:00",
    unitVisibleUntil: "1948-11-13T06:00"
  });
  expectNianzhuangRouteWindow("xuzhou-relief-second-thrust", {
    start: "1948-11-13T06:00",
    end: "1948-11-13T18:00",
    unitVisibleUntil: "1948-11-14T12:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("xuzhou-relief-contained", {
    start: "1948-11-13T18:00",
    end: "1948-11-14T12:00",
    unitVisibleUntil: "1948-11-22T18:00"
  });
  expectNianzhuangRouteWindow("pla-relief-block-line", {
    start: "1948-11-11T12:00",
    end: "1948-11-13T18:00",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("pla-relief-depth-line", {
    start: "1948-11-13T06:00",
    end: "1948-11-13T18:00",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("pla-relief-lateral-seal", {
    start: "1948-11-13T18:00",
    end: "1948-11-14T12:00",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("pla-west-trench-approach", { start: "1948-11-15T02:00", end: "1948-11-19T09:30", visibleUntil: "1948-11-19T22:29" });
  expectNianzhuangRouteWindow("pla-4th-preliminary-daxingzhuang", { start: "1948-11-11T20:00", end: "1948-11-13T23:00" });
  expectNianzhuangRouteWindow("pla-13th-preliminary-songzhuang", { start: "1948-11-11T20:00", end: "1948-11-13T23:00" });
  expectNianzhuangRouteWindow("pla-6th-preliminary-pengzhuang", { start: "1948-11-13T06:00", end: "1948-11-15T20:00" });
  expectNianzhuangRouteWindow("pla-9th-southeast-advance", { start: "1948-11-13T06:00", end: "1948-11-17T20:00" });
  expectNianzhuangRouteWindow("huang-west-counterpush", { start: "1948-11-15T08:00", end: "1948-11-15T20:00", unitVisibleUntil: "1948-11-15T20:00" });
  expectNianzhuangRouteWindow("pla-west-yield-and-hold", { start: "1948-11-15T18:00", end: "1948-11-16T08:00", unitVisibleUntil: "1948-11-16T08:00" });
  expectNianzhuangRouteWindow("pla-west-counterpress", { start: "1948-11-16T08:00", end: "1948-11-17T20:00", unitVisibleUntil: "1948-11-19T10:00" });
  expectNianzhuangRouteWindow("huang-east-counterpush", { start: "1948-11-16T20:00", end: "1948-11-17T08:00", unitVisibleUntil: "1948-11-17T08:00" });
  expectNianzhuangRouteWindow("pla-east-counterpress", { start: "1948-11-17T08:00", end: "1948-11-19T09:30", unitVisibleUntil: "1948-11-19T09:30" });
  for (const routeId of [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "pla-general-assault-northeast",
    "pla-general-assault-southeast"
  ]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-19T21:15",
      end: "1948-11-19T22:30",
      unitVisibleUntil: "1948-11-20T03:30",
      visibleUntil: "1948-11-20T03:30"
    });
  }
  for (const routeId of ["pla-second-wall-west", "pla-second-wall-north", "pla-second-wall-south", "pla-second-wall-east"]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-19T22:30",
      end: "1948-11-20T03:30",
      unitVisibleFrom: "1948-11-19T22:31",
      unitVisibleUntil: "1948-11-20T05:29",
      visibleUntil: "1948-11-20T05:29"
    });
  }
  expectNianzhuangRouteWindow("huang-west-night-counterattack", {
    start: "1948-11-19T23:15",
    end: "1948-11-20T00:40",
    unitVisibleUntil: "1948-11-20T00:40",
    visibleUntil: "1948-11-20T03:30"
  });
  expectNianzhuangRouteWindow("pla-west-night-counterpress", {
    start: "1948-11-20T00:40",
    end: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:29",
    visibleUntil: "1948-11-20T05:29"
  });
  expectNianzhuangRouteWindow("huang-east-night-counterattack", {
    start: "1948-11-20T00:20",
    end: "1948-11-20T02:00",
    unitVisibleUntil: "1948-11-20T02:20",
    visibleUntil: "1948-11-20T03:30"
  });
  expectNianzhuangRouteWindow("pla-east-night-counterpress", {
    start: "1948-11-20T02:00",
    end: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:29",
    visibleUntil: "1948-11-20T05:29"
  });
  for (const routeId of ["huang-north-fragment-recoil", "huang-east-fragment-recoil", "huang-south-fragment-recoil"]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-19T22:30",
      end: "1948-11-20T03:30",
      unitVisibleUntil: "1948-11-20T03:45",
      visibleUntil: "1948-11-20T05:30"
    });
  }
  expectNianzhuangRouteWindow("huang-inner-recoil", {
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:45",
    visibleUntil: "1948-11-20T05:30"
  });
  expectNianzhuangRouteWindow("huang-final-core-defense", {
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T18:00",
    visibleUntil: "1948-11-20T18:00"
  });
  expectNianzhuangRouteWindow("huang-second-wall-collapse", {
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T18:00",
    visibleUntil: "1948-11-20T18:00"
  });
  for (const routeId of ["pla-final-compression-ring", "pla-final-compression-east", "pla-final-compression-south", "pla-final-compression-west"]) {
    expectNianzhuangRouteWindow(routeId, {
      start: "1948-11-20T03:30",
      end: "1948-11-20T05:15",
      unitVisibleFrom: "1948-11-20T03:30",
      unitVisibleUntil: "1948-11-20T05:30",
      visibleUntil: "1948-11-20T05:30"
    });
  }
  expectNianzhuangRouteWindow("huang-east-remnant-defense", {
    start: "1948-11-21T08:00",
    end: "1948-11-22T16:00",
    visibleFrom: "1948-11-21T08:00",
    unitVisibleFrom: "1948-11-21T08:00",
    unitVisibleUntil: "1948-11-22T18:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-remnant-fallback-east", {
    start: "1948-11-20T05:30",
    end: "1948-11-21T08:00",
    unitVisibleUntil: "1948-11-21T08:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-remnant-fallback-north", {
    start: "1948-11-20T05:30",
    end: "1948-11-21T08:00",
    unitVisibleUntil: "1948-11-21T08:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-remnant-fallback-south", {
    start: "1948-11-20T05:30",
    end: "1948-11-21T08:00",
    unitVisibleUntil: "1948-11-21T08:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("pla-relief-counterpush", {
    start: "1948-11-13T18:00",
    end: "1948-11-20T18:00",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("pla-nizhuang-pursuit", {
    start: "1948-11-22T16:20",
    end: "1948-11-22T18:50",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-north-remnant-sortie", {
    start: "1948-11-21T08:00",
    end: "1948-11-21T12:00",
    unitVisibleUntil: "1948-11-21T12:30",
    visibleUntil: "1948-11-21T18:00"
  });
  expectNianzhuangRouteWindow("pla-north-remnant-counterpress", {
    start: "1948-11-21T12:00",
    end: "1948-11-21T18:00",
    unitVisibleUntil: "1948-11-22T16:20",
    visibleUntil: "1948-11-22T16:20"
  });
  expectNianzhuangRouteWindow("huang-south-remnant-sortie", {
    start: "1948-11-21T18:00",
    end: "1948-11-21T22:00",
    unitVisibleUntil: "1948-11-21T22:30",
    visibleUntil: "1948-11-22T10:00"
  });
  expectNianzhuangRouteWindow("pla-south-remnant-counterpress", {
    start: "1948-11-21T22:00",
    end: "1948-11-22T10:00",
    unitVisibleUntil: "1948-11-22T16:20",
    visibleUntil: "1948-11-22T16:20"
  });
  expectNianzhuangRouteWindow("huang-final-north-collapse", {
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitVisibleUntil: "1948-11-22T18:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-final-east-collapse", {
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitVisibleUntil: "1948-11-22T18:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteWindow("huang-final-south-collapse", {
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitVisibleUntil: "1948-11-22T18:00",
    visibleUntil: "1948-11-22T20:00"
  });
  for (const [fromRouteId, toRouteIds] of [
    ["pla-east-pursuit-main", ["pla-east-closing-position"]],
    ["pla-north-pursuit", ["pla-north-closing-position"]],
    ["pla-south-pursuit", ["pla-south-closing-position"]],
    ["pla-southwest-closing-line", ["pla-southwest-closing-position"]],
    ["pla-east-closing-position", ["pla-encirclement-ring"]],
    ["pla-north-closing-position", ["pla-encirclement-ring"]],
    ["pla-south-closing-position", ["pla-encirclement-ring"]],
    ["pla-southwest-closing-position", ["pla-encirclement-ring"]],
    ["pla-relief-block-line", ["pla-relief-depth-line", "pla-relief-lateral-seal", "pla-relief-counterpush"]],
    ["pla-relief-depth-line", ["pla-relief-lateral-seal", "pla-relief-counterpush"]],
    ["pla-relief-lateral-seal", ["pla-relief-counterpush"]],
    ["pla-4th-preliminary-daxingzhuang", ["pla-north-trench-approach", "pla-encirclement-ring"]],
    ["pla-13th-preliminary-songzhuang", ["pla-west-trench-approach", "pla-north-trench-approach", "pla-encirclement-ring"]],
    ["pla-6th-preliminary-pengzhuang", ["pla-west-trench-approach", "pla-encirclement-ring"]],
    ["pla-8th-east-fix-youfang", ["pla-east-trench-approach", "pla-encirclement-ring"]],
    ["pla-9th-southeast-advance", ["pla-general-assault-southeast", "pla-encirclement-ring"]],
    ["pla-west-yield-and-hold", ["pla-west-counterpress", "pla-west-trench-approach"]],
    ["pla-west-counterpress", ["pla-west-trench-approach"]],
    ["pla-east-counterpress", ["pla-east-trench-approach"]],
    ["pla-general-assault-west", ["pla-second-wall-west"]],
    ["pla-general-assault-north", ["pla-second-wall-north"]],
    ["pla-general-assault-south", ["pla-second-wall-south"]],
    ["pla-general-assault-east", ["pla-second-wall-east"]],
    ["pla-general-assault-northeast", ["pla-second-wall-north", "pla-final-compression-ring"]],
    ["pla-general-assault-southeast", ["pla-second-wall-south", "pla-final-compression-south"]],
    ["pla-second-wall-west", ["pla-final-compression-west"]],
    ["pla-west-night-counterpress", ["pla-final-compression-west"]],
    ["pla-second-wall-north", ["pla-final-compression-ring"]],
    ["pla-second-wall-south", ["pla-final-compression-south"]],
    ["pla-second-wall-east", ["pla-final-compression-east"]],
    ["pla-east-night-counterpress", ["pla-final-compression-east"]],
    ["pla-final-compression-west", ["pla-remnant-mop-up-west"]],
    ["pla-final-compression-ring", ["pla-remnant-mop-up-north", "pla-remnant-mop-up-east"]],
    ["pla-final-compression-south", ["pla-remnant-mop-up-south"]],
    ["pla-final-compression-east", ["pla-remnant-mop-up-east"]],
    ["pla-remnant-mop-up-north", ["pla-nizhuang-pursuit"]],
    ["pla-north-remnant-counterpress", ["pla-nizhuang-pursuit"]],
    ["pla-remnant-mop-up-east", ["pla-nizhuang-pursuit"]],
    ["pla-remnant-mop-up-south", ["pla-nizhuang-pursuit"]],
    ["pla-south-remnant-counterpress", ["pla-nizhuang-pursuit"]],
    ["pla-remnant-mop-up-west", ["pla-nizhuang-pursuit"]],
    ["pla-relief-counterpush", ["pla-relief-block-line"]]
  ] as Array<[string, string[]]>) {
    expectNianzhuangCommunistUnitHandoff(fromRouteId, toRouteIds);
  }
  expectNianzhuangRouteHasPrelude("pla-east-closing-position", 4);
  expectNianzhuangRouteHasPrelude("pla-north-closing-position", 3);
  expectNianzhuangRouteHasPrelude("pla-south-closing-position", 3);
  expectNianzhuangRouteHasPrelude("pla-southwest-closing-position", 3);
  for (const [fromRouteId, toRouteIds] of [
    ["huang-preliminary-counterattack", ["huang-nianzhuang-defense-ring", "huang-west-counterpush"]],
    ["xuzhou-relief-east", ["xuzhou-relief-second-thrust"]],
    ["xuzhou-relief-second-thrust", ["xuzhou-relief-contained"]],
    ["huang-west-counterpush", ["huang-nianzhuang-defense-ring"]],
    ["huang-east-counterpush", ["huang-nianzhuang-defense-ring"]],
    ["huang-nianzhuang-defense-ring", ["huang-inner-recoil", "huang-north-fragment-recoil", "huang-east-fragment-recoil", "huang-south-fragment-recoil"]],
    ["huang-west-night-counterattack", ["huang-inner-recoil", "huang-final-core-defense"]],
    ["huang-east-night-counterattack", ["huang-east-fragment-recoil", "huang-second-wall-collapse"]],
    ["huang-inner-recoil", ["huang-final-core-defense", "huang-second-wall-collapse"]],
    ["huang-north-fragment-recoil", ["huang-second-wall-collapse"]],
    ["huang-east-fragment-recoil", ["huang-second-wall-collapse"]],
    ["huang-south-fragment-recoil", ["huang-second-wall-collapse"]],
    ["huang-final-core-defense", ["huang-remnant-fallback-east", "huang-remnant-fallback-north", "huang-remnant-fallback-south"]],
    ["huang-second-wall-collapse", ["huang-remnant-fallback-east", "huang-remnant-fallback-north", "huang-remnant-fallback-south"]],
    ["huang-remnant-fallback-east", ["huang-east-remnant-defense"]],
    ["huang-remnant-fallback-north", ["huang-east-remnant-defense"]],
    ["huang-remnant-fallback-south", ["huang-east-remnant-defense"]],
    ["huang-north-remnant-sortie", ["huang-east-remnant-defense", "huang-final-north-collapse"]],
    ["huang-south-remnant-sortie", ["huang-east-remnant-defense", "huang-final-south-collapse"]],
    ["huang-east-remnant-defense", ["huang-final-north-collapse", "huang-final-east-collapse", "huang-final-south-collapse", "huang-nizhuang-final-flight"]]
  ] as Array<[string, string[]]>) {
    expectNianzhuangNationalistUnitHandoff(fromRouteId, toRouteIds);
  }
  for (const routeId of ["pla-remnant-mop-up-north", "pla-remnant-mop-up-east", "pla-remnant-mop-up-south", "pla-remnant-mop-up-west"]) {
    expect(toTime(nianzhuangRoute(routeId).start), `${routeId} should start after inner core falls`).toBeGreaterThanOrEqual(
      toTime("1948-11-20T05:30")
    );
    expect(nianzhuangRoute(routeId).visibleUntil, `${routeId} should retain remnant cleanup track to the end`).toBe("1948-11-22T20:00");
    expect(nianzhuangRoute(routeId).unitVisibleUntil, `${routeId} should keep PLA mop-up units online through the final destruction markers`).toBe(
      "1948-11-22T18:50"
    );
  }
  expectNianzhuangRouteWindow("huang-nizhuang-final-flight", {
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  });
  expectNianzhuangRouteWindow("pla-nizhuang-pursuit", {
    start: "1948-11-22T16:20",
    end: "1948-11-22T18:50",
    unitVisibleUntil: "1948-11-22T20:00",
    visibleUntil: "1948-11-22T20:00"
  });
  expectNianzhuangRouteUsesSource("huang-xinan-west-withdrawal", "xinanzhen", "nianzhuang", 4);
  expectNianzhuangRouteUsesSource("xuzhou-relief-east", "xuzhou", "relief-first-belt", 3);
  expectNianzhuangRouteUsesSource("xuzhou-relief-second-thrust", "relief-first-belt", "relief-forward-edge", 2);
  expectNianzhuangRouteUsesSource("xuzhou-relief-contained", "relief-forward-edge", "relief-stopped-pocket", 2);
  expectNianzhuangRouteUsesSource("pla-relief-block-line", "northwest-block-entry", "southwest-block-entry", 4);
  expectNianzhuangRouteUsesSource("pla-relief-depth-line", "relief-second-belt-north", "relief-second-belt-south", 3);
  expectNianzhuangRouteUsesSource("pla-relief-lateral-seal", "relief-second-belt-north", "daxujia", 3);
  expectNianzhuangRouteUsesSource("pla-relief-counterpush", "relief-second-belt-north", "relief-stopped-pocket", 3);
  expectNianzhuangRouteUsesSource("huang-outer-destroyed-column", "canal-bridge", "louzhuang", 3);
  expectNianzhuangRouteUsesSource("huang-deploy-north", "nianzhuang", "nianzhuang-north", 2);
  expectNianzhuangRouteUsesSource("huang-deploy-east", "nianzhuang", "nianzhuang-east", 2);
  expectNianzhuangRouteUsesSource("huang-deploy-south", "nianzhuang", "nianzhuang-south", 2);
  expectNianzhuangRouteUsesSource("huang-deploy-west", "nianzhuang", "nianzhuang-west", 2);
  expectNianzhuangRouteUsesSource("huang-deploy-command", "nianzhuang", "inner-pocket", 2);
  expectNianzhuangRouteUsesSource("pla-encirclement-ring", "nianzhuang-west", "nianzhuang-west", 8);
  expectNianzhuangRouteUsesSource("pla-4th-preliminary-daxingzhuang", "north-pla-entry", "daxingzhuang", 3);
  expectNianzhuangRouteUsesSource("pla-13th-preliminary-songzhuang", "zhaozhuang", "songzhuang-large", 2);
  expectNianzhuangRouteUsesSource("pla-6th-preliminary-pengzhuang", "zhaozhuang", "pengzhuang", 2);
  expectNianzhuangRouteUsesSource("pla-9th-southeast-advance", "south-pla-entry", "xujingwa", 3);
  expectNianzhuangRouteUsesSource("huang-west-counterpush", "nianzhuang-west", "pengzhuang", 2);
  expectNianzhuangRouteUsesSource("pla-west-yield-and-hold", "pengzhuang", "zhaozhuang", 2);
  expectNianzhuangRouteUsesSource("pla-west-counterpress", "zhaozhuang", "pengzhuang", 2);
  expectNianzhuangRouteUsesSource("huang-east-counterpush", "nianzhuang-east", "luliang-line", 2);
  expectNianzhuangRouteUsesSource("pla-east-counterpress", "luliang-line", "nianzhuang-east", 2);
  expectNianzhuangRouteUsesSource("pla-general-assault-west", "nianzhuang-west", "inner-west-line", 3);
  expectNianzhuangRouteUsesSource("pla-general-assault-north", "songzhuang-large", "inner-north-line", 3);
  expectNianzhuangRouteUsesSource("pla-general-assault-south", "wulou", "inner-south-line", 3);
  expectNianzhuangRouteUsesSource("pla-general-assault-east", "youfang", "inner-east-line", 3);
  expectNianzhuangRouteUsesSource("pla-general-assault-northeast", "nianzhuang-north", "inner-northeast-line", 3);
  expectNianzhuangRouteUsesSource("pla-general-assault-southeast", "xujingwa", "inner-southeast-line", 3);
  expectNianzhuangRouteUsesSource("pla-second-wall-west", "inner-west-line", "final-west-core", 3);
  expectNianzhuangRouteUsesSource("pla-second-wall-north", "inner-north-line", "final-north-core", 3);
  expectNianzhuangRouteUsesSource("pla-second-wall-south", "inner-south-line", "final-south-core", 3);
  expectNianzhuangRouteUsesSource("pla-second-wall-east", "inner-east-line", "final-east-core", 3);
  expectNianzhuangRouteUsesSource("huang-west-night-counterattack", "final-west-core", "inner-west-line", 2);
  expectNianzhuangRouteUsesSource("pla-west-night-counterpress", "inner-west-line", "final-west-core", 2);
  expectNianzhuangRouteUsesSource("huang-east-night-counterattack", "final-east-core", "inner-east-line", 2);
  expectNianzhuangRouteUsesSource("pla-east-night-counterpress", "inner-east-line", "final-east-core", 2);
  expectNianzhuangRouteUsesSource("huang-inner-recoil", "inner-west-line", "final-west-core", 2);
  expectNianzhuangRouteUsesSource("huang-north-fragment-recoil", "inner-north-line", "final-north-core", 2);
  expectNianzhuangRouteUsesSource("huang-east-fragment-recoil", "inner-east-line", "final-east-core", 2);
  expectNianzhuangRouteUsesSource("huang-south-fragment-recoil", "inner-south-line", "final-south-core", 2);
  expectNianzhuangRouteUsesSource("huang-second-wall-collapse", "final-north-core", "inner-pocket", 3);
  expectNianzhuangRouteUsesSource("pla-final-compression-ring", "inner-north-line", "final-east-core", 3);
  expectNianzhuangRouteUsesSource("pla-final-compression-east", "inner-east-line", "final-east-core", 3);
  expectNianzhuangRouteUsesSource("pla-final-compression-south", "inner-south-line", "final-south-core", 3);
  expectNianzhuangRouteUsesSource("pla-final-compression-west", "inner-west-line", "final-west-core", 3);
  expectNianzhuangRouteUsesSource("huang-remnant-fallback-east", "final-east-core", "east-remnant-pocket", 4);
  expectNianzhuangRouteHasPrelude("huang-remnant-fallback-east", 3);
  expectNianzhuangRouteUsesSource("huang-remnant-fallback-north", "final-north-core", "remnant-north-village", 2);
  expectNianzhuangRouteHasPrelude("huang-remnant-fallback-north", 2);
  expectNianzhuangRouteUsesSource("huang-remnant-fallback-south", "final-south-core", "remnant-south-village", 3);
  expectNianzhuangRouteHasPrelude("huang-remnant-fallback-south", 2);
  expectNianzhuangRouteUsesSource("huang-east-remnant-defense", "east-remnant-pocket", "east-remnant-pocket", 4);
  expectNianzhuangRouteUsesSource("pla-remnant-mop-up-north", "final-north-core", "remnant-north-village", 2);
  expectNianzhuangRouteUsesSource("pla-remnant-mop-up-east", "final-east-core", "east-remnant-pocket", 4);
  expectNianzhuangRouteHasPrelude("pla-remnant-mop-up-east", 3);
  expectNianzhuangRouteUsesSource("pla-remnant-mop-up-south", "final-south-core", "remnant-south-village", 2);
  expectNianzhuangRouteUsesSource("pla-remnant-mop-up-west", "final-west-core", "remnant-southwest-block", 4);
  expectNianzhuangRouteUsesSource("huang-north-remnant-sortie", "remnant-north-village", "final-north-core", 2);
  expectNianzhuangRouteUsesSource("pla-north-remnant-counterpress", "final-north-core", "remnant-north-village", 2);
  expectNianzhuangRouteUsesSource("huang-south-remnant-sortie", "remnant-south-village", "final-south-core", 2);
  expectNianzhuangRouteUsesSource("pla-south-remnant-counterpress", "final-south-core", "remnant-south-village", 2);
  expectNianzhuangRouteUsesSource("huang-final-north-collapse", "remnant-north-village", "remnant-north-village", 2);
  expectNianzhuangRouteUsesSource("huang-final-east-collapse", "east-remnant-pocket", "east-remnant-pocket", 2);
  expectNianzhuangRouteUsesSource("huang-final-south-collapse", "remnant-southwest-block", "remnant-south-village", 2);
  expectNianzhuangRouteUsesSource("huang-nizhuang-final-flight", "east-remnant-pocket", "nizhuang", 1);
  expectNianzhuangRouteUsesSource("pla-nizhuang-pursuit", "east-remnant-pocket", "nizhuang", 1);
  const reliefEnd = nianzhuangData.mapPoints.find((point) => point.id === nianzhuangRoute("xuzhou-relief-second-thrust").to)!;
  const nianzhuangPoint = nianzhuangData.mapPoints.find((point) => point.id === "nianzhuang")!;
  expect(reliefEnd.coordinates[0], "xuzhou relief should stop west of Nianzhuang").toBeLessThan(nianzhuangPoint.coordinates[0] - 0.2);
  expect(nianzhuangRoute("xuzhou-relief-contained").to, "xuzhou relief should be shown contained after the failed thrust").toBe("relief-stopped-pocket");
  for (const route of nianzhuangData.frontLines.filter((line) => line.id.includes("trench-approach"))) {
    expect(toTime(route.start), `nianzhuang trench route ${route.id} should not appear before Nov 15`).toBeGreaterThanOrEqual(
      toTime("1948-11-15T02:00")
    );
  }
  for (const routeId of [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "pla-general-assault-northeast",
    "pla-general-assault-southeast"
  ]) {
    expect(toTime(nianzhuangRoute(routeId).start), `nianzhuang assault route ${routeId} should start around general assault`).toBeGreaterThanOrEqual(
      toTime("1948-11-19T21:15")
    );
    expect(nianzhuangRoute(routeId).to, `nianzhuang assault route ${routeId} should stop at the inner line before compression`).not.toBe("inner-pocket");
    expectNianzhuangRouteHasUnitCount(routeId, 3);
  }
  for (const routeId of ["pla-second-wall-west", "pla-second-wall-north", "pla-second-wall-south", "pla-second-wall-east"]) {
    expect(toTime(nianzhuangRoute(routeId).start), `${routeId} should only start after first wall breach`).toBeGreaterThanOrEqual(
      toTime("1948-11-19T22:30")
    );
    expectNianzhuangRouteHasUnitCount(routeId, 3);
  }
  for (const routeId of ["pla-final-compression-ring", "pla-final-compression-east", "pla-final-compression-south", "pla-final-compression-west"]) {
    expect(toTime(nianzhuangRoute(routeId).start), `${routeId} should only start after second wall breach and entry into the walled village`).toBeGreaterThanOrEqual(
      toTime("1948-11-20T03:30")
    );
    expect(toTime(nianzhuangRoute(routeId).end), `${routeId} should finish before remnant cleanup begins`).toBeLessThan(
      toTime("1948-11-20T05:30")
    );
    expectNianzhuangRouteHasUnitCount(routeId, 3);
  }
  const huangDefenseRoute = nianzhuangRoute("huang-nianzhuang-defense-ring");
  expect(huangDefenseRoute.formationUnits?.length, "huang defense should show division-level deployment").toBeGreaterThanOrEqual(10);
  for (const unit of huangDefenseRoute.formationUnits ?? []) {
    expect(unit.coordinates, `huang defense unit ${unit.label} should have fixed coordinates`).toBeTruthy();
    expect(unit.facingX, `huang defense unit ${unit.label} should not spin around the ring`).toBeTruthy();
  }
  expect(huangDefenseRoute.formationUnits?.map((unit) => unit.label).join(" ")).toContain("师");
  expect(toTime(huangDefenseRoute.start), "huang static division positions should wait until hold order instead of popping open at encirclement").toBeGreaterThan(
    toTime("1948-11-10T20:00")
  );
  const outerColumnLabels = nianzhuangRoute("huang-outer-destroyed-column").formationUnits?.map((unit) => unit.label).join(" ") ?? "";
  expect(outerColumnLabels, "outer column should not be labeled destroyed before fighting finishes").not.toMatch(/覆没|受歼/);
  expectNianzhuangRouteHasBadges("huang-west-counterpush", ["反", "炮"]);
  expectNianzhuangRouteHasBadges("pla-west-counterpress", ["压", "炮"]);
  expectNianzhuangRouteHasBadges("huang-east-counterpush", ["反", "炮"]);
  expectNianzhuangRouteHasBadges("pla-east-counterpress", ["压", "炮"]);
  expectNianzhuangRouteHasBadges("huang-west-night-counterattack", ["反", "炮"]);
  expectNianzhuangRouteHasBadges("pla-west-night-counterpress", ["压", "炮"]);
  expectNianzhuangRouteHasBadges("huang-east-night-counterattack", ["反", "炮"]);
  expectNianzhuangRouteHasBadges("pla-east-night-counterpress", ["压", "炮"]);
  expect(nianzhuangRoute("huang-inner-recoil").formationUnits?.length, "huang recoil should show the west breach and command fallback").toBeGreaterThanOrEqual(
    2
  );
  for (const routeId of ["huang-inner-recoil", "huang-north-fragment-recoil", "huang-east-fragment-recoil", "huang-south-fragment-recoil"]) {
    const labels = nianzhuangRoute(routeId).formationUnits?.map((unit) => unit.label).join(" ") ?? "";
    expect(labels, `${routeId} should label broken or withdrawing fragments`).toMatch(/碎裂|后撤|割裂|破口|内缩|北退|南退|退守|回缩|退入/);
  }
  expect(nianzhuangRoute("huang-final-core-defense").formationUnits?.length, "huang final core should preserve remnants").toBeGreaterThanOrEqual(4);
  expect(nianzhuangRoute("huang-second-wall-collapse").formationUnits?.length, "huang second wall collapse should show retreating fragments").toBeGreaterThanOrEqual(
    4
  );
  expect(nianzhuangRoute("huang-final-core-defense").unitVisibleUntil, "huang final core should remain visible through the first remnant fallback window").toBe(
    "1948-11-20T18:00"
  );
  expect(nianzhuangRoute("huang-second-wall-collapse").unitVisibleUntil, "huang second wall collapse should not disappear immediately at the pocket event").toBe(
    "1948-11-20T18:00"
  );
  expect(nianzhuangRoute("huang-remnant-fallback-east").formationUnits?.length, "huang east fallback should keep command and east remnants moving from the core").toBeGreaterThanOrEqual(
    2
  );
  expect(nianzhuangRoute("huang-remnant-fallback-east").unitVisibleUntil, "huang remnant fallback should hand over to fixed remnant positions after arrival").toBe(
    "1948-11-21T08:00"
  );
  expect(nianzhuangRoute("huang-remnant-fallback-north").formationUnits?.length, "huang north fallback should explain where north remnants came from").toBeGreaterThanOrEqual(2);
  expect(nianzhuangRoute("huang-remnant-fallback-south").formationUnits?.length, "huang south fallback should explain where south remnants came from").toBeGreaterThanOrEqual(3);
  expect(nianzhuangRoute("huang-east-remnant-defense").formationUnits?.length, "huang remnant defense should keep east village remnants visible").toBeGreaterThanOrEqual(
    4
  );
  expectNianzhuangRouteHasBadges("huang-remnant-fallback-east", ["64", "黄"]);
  expectNianzhuangRouteHasBadges("huang-remnant-fallback-north", ["25", "108"]);
  expectNianzhuangRouteHasBadges("huang-remnant-fallback-south", ["44", "100", "159"]);
  expectNianzhuangRouteHasBadges("huang-east-remnant-defense", ["25", "44", "64", "100", "黄"]);
  expectNianzhuangRouteHasBadges("pla-remnant-mop-up-north", ["突", "炮"]);
  expectNianzhuangRouteHasBadges("pla-remnant-mop-up-east", ["突", "炮", "封"]);
  expectNianzhuangRouteHasBadges("pla-remnant-mop-up-south", ["突", "封"]);
  expectNianzhuangRouteHasBadges("pla-remnant-mop-up-west", ["封", "突", "炮"]);
  expectNianzhuangRouteHasBadges("huang-north-remnant-sortie", ["25"]);
  expectNianzhuangRouteHasBadges("pla-north-remnant-counterpress", ["压", "炮"]);
  expectNianzhuangRouteHasBadges("huang-south-remnant-sortie", ["44", "100"]);
  expectNianzhuangRouteHasBadges("pla-south-remnant-counterpress", ["压", "炮"]);
  expectNianzhuangRouteHasBadges("huang-final-north-collapse", ["25"]);
  expectNianzhuangRouteHasBadges("huang-final-east-collapse", ["64"]);
  expectNianzhuangRouteHasBadges("huang-final-south-collapse", ["44", "100"]);
  expectNianzhuangRouteHasBadges("xuzhou-relief-second-thrust", ["邱", "李"]);
  expectNianzhuangRouteHasBadges("xuzhou-relief-contained", ["邱", "李"]);
  expectNianzhuangRouteHasBadges("pla-relief-block-line", ["一", "阻", "炮"]);
  expectNianzhuangRouteHasBadges("pla-relief-depth-line", ["二", "纵", "炮"]);
  expectNianzhuangRouteHasBadges("pla-relief-lateral-seal", ["阻", "炮"]);
  expectNianzhuangRouteHasBadges("pla-relief-counterpush", ["阻", "反", "炮"]);
  expectNianzhuangRouteHasBadges("pla-nizhuang-pursuit", ["追", "封", "炮"]);
  expectNianzhuangDestructionSite("destroyed-site-25", "25军残部被歼地");
  expectNianzhuangDestructionSite("destroyed-site-64", "64军残部被歼地");
  expectNianzhuangDestructionSite("destroyed-site-44-100", "44/100军残部被歼地");
  expectNianzhuangDestructionSite("destroyed-site-command", "兵团部终局点");
  expectNianzhuangDestructionSite("huang-baitao-death-site", "黄百韬自戕地点");
  expect(nianzhuangData.fortifiedLines.map((line) => line.id)).toEqual([
    "pla-encirclement",
    "outer-defense",
    "second-defense",
    "final-core",
    "relief-first-line",
    "relief-depth-line",
    "relief-forward-sap",
    "relief-stop-line",
    "north-approach-sap",
    "south-approach-sap",
    "nizhuang-final-corridor"
  ]);
  expect(nianzhuangData.fragmentedLines.map((line) => line.id)).toEqual([
    "outer-defense-west-break",
    "outer-defense-north-fragment",
    "outer-defense-east-fragment",
    "outer-defense-south-fragment",
    "second-defense-north-fragment",
    "second-defense-east-breach",
    "second-defense-south-fragment",
    "final-core-east-break"
  ]);
  expect(nianzhuangData.fortifiedLines.find((line) => line.id === "outer-defense")?.visibleUntil).toBe("1948-11-19T22:29");
  expect(nianzhuangData.fortifiedLines.find((line) => line.id === "second-defense")?.visibleUntil).toBe("1948-11-20T03:29");
  expect(nianzhuangData.fortifiedLines.find((line) => line.id === "final-core")?.visibleUntil).toBe("1948-11-20T05:29");
  expectNianzhuangEffectUsesRoutes("relief-blocked-salvo", "pla-relief-block-line", "xuzhou-relief-east");
  expectNianzhuangEffectUsesRoutes("relief-depth-block-salvo", "pla-relief-depth-line", "xuzhou-relief-second-thrust");
  expectNianzhuangEffectUsesRoutes("opening-assault-salvo", "pla-artillery-zhoujiazhai", "huang-nianzhuang-defense-ring");
  expectNianzhuangEffectUsesRoutes("first-line-break-salvo", "pla-general-assault-west", "huang-inner-recoil");
  expectNianzhuangEffectUsesRoutes("north-fragment-break-salvo", "pla-general-assault-north", "huang-north-fragment-recoil");
  expectNianzhuangEffectUsesRoutes("east-fragment-break-salvo", "pla-general-assault-east", "huang-east-fragment-recoil");
  expectNianzhuangEffectUsesRoutes("south-fragment-break-salvo", "pla-general-assault-south", "huang-south-fragment-recoil");
  expectNianzhuangEffectUsesRoutes("final-pocket-salvo", "pla-remnant-mop-up-east", "huang-remnant-fallback-east");
  expectNianzhuangEffectUsesRoutes("remnant-village-salvo", "pla-remnant-mop-up-east", "huang-east-remnant-defense");
  expectNianzhuangEffectUsesRoutes("north-destruction-salvo", "pla-remnant-mop-up-north", "huang-final-north-collapse");
  expectNianzhuangEffectUsesRoutes("east-destruction-salvo", "pla-remnant-mop-up-east", "huang-final-east-collapse");
  expectNianzhuangEffectUsesRoutes("south-destruction-salvo", "pla-remnant-mop-up-west", "huang-final-south-collapse");
  expect(nianzhuangData.battleEvents.map((event) => event.title).join(" ")).not.toContain("双堆集");
  expect(nianzhuangData.battleEvents.map((event) => `${event.summary} ${event.detail}`).join(" ")).not.toContain("黄维");
  expectRouteNearEvent("bigWeekAirBattle", bigWeekData as CampaignDataModule, "operation-argument-start", "argument-first-wave", 1.2, 0.35);
  expect((bigWeekData as CampaignDataModule).cueEventIds?.has("operation-argument-start")).toBe(true);
  expect((bigWeekData as CampaignDataModule).cueEventKinds?.["operation-argument-start"]).toBe("bombing");
  expectRouteNearEvent("bigWeekAirBattle", bigWeekData as CampaignDataModule, "deep-escort-lesson", "schweinfurt-regensburg-lesson", 0.8, 0.2);
  expectRouteNearEvent("bigWeekAirBattle", bigWeekData as CampaignDataModule, "deep-escort-lesson", "loss-belt-luftwaffe-intercept", 0.9, 0.25);
  expectRouteNearEvent("bigWeekAirBattle", bigWeekData as CampaignDataModule, "deep-escort-lesson", "ruhr-flak-belt-fire", 0.9, 0.25);
  expectRouteNearEvent("bigWeekAirBattle", bigWeekData as CampaignDataModule, "aircraft-industry-targets", "feb-24-industrial-strike", 1.4, 0.25);
  expectRouteNearEvent("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "recon-contact", "allied-search-shadow", 1.0, 0.25);
  expectRouteNearEvent("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "coordinated-air-attack", "high-level-bombing-wave", 0.9, 0.25);
  expectRouteNearEvent("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "skip-bombing-breakup", "skip-bombing-attack", 0.9, 0.35);
  expectRouteNearEvent("bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule, "mopping-up", "mopping-up-strikes", 0.5, 0.3);
  expectRoutesNearEachOtherAtEvent(
    "bismarckSeaAirBattle",
    bismarckSeaData as CampaignDataModule,
    "recon-contact",
    "japanese-convoy-rabaul-lae",
    "allied-search-shadow",
    0.25
  );
  expectRoutesNearEachOtherAtEvent(
    "bismarckSeaAirBattle",
    bismarckSeaData as CampaignDataModule,
    "coordinated-air-attack",
    "japanese-convoy-rabaul-lae",
    "high-level-bombing-wave",
    0.5
  );
  expectRoutesNearEachOtherAtEvent(
    "bismarckSeaAirBattle",
    bismarckSeaData as CampaignDataModule,
    "skip-bombing-breakup",
    "japanese-convoy-rabaul-lae",
    "skip-bombing-attack",
    0.55
  );
  expectRoutesNearEachOtherAtEvent(
    "bismarckSeaAirBattle",
    bismarckSeaData as CampaignDataModule,
    "mopping-up",
    "convoy-breakup",
    "mopping-up-strikes",
    0.45
  );
  expectEventHasActiveRoute("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "hx229-first-contact", [
    "hx229-convoy-track",
    "raubgraf-hx229-contact"
  ]);
  expectEventHasActiveRoute("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "night-torpedo-attacks", [
    "hx229-convoy-track",
    "sc122-convoy-track",
    "raubgraf-hx229-contact",
    "sturmer-sc122-attack",
    "escort-counterattack-screen"
  ]);
  expectEventHasActiveRoute("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "second-night-battle", [
    "hx229-convoy-track",
    "sc122-convoy-track",
    "second-night-submarine-screen",
    "raubgraf-second-night-shadow",
    "sturmer-second-night-shadow",
    "dranger-second-night-shadow",
    "escort-counterattack-screen"
  ]);
  expectEventHasActiveRoute("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "u384-sunk", [
    "u384-continuous-track",
    "u384-hunt-by-air"
  ]);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "sc122-first-contact", "sturmer-sc122-attack", 0.8, 0.3);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "night-torpedo-attacks", "raubgraf-hx229-contact", 0.8, 0.4);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "second-night-battle", "second-night-submarine-screen", 0.25, 0.95);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "second-night-battle", "raubgraf-second-night-shadow", 0.55, 0.9);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "second-night-battle", "sturmer-second-night-shadow", 0.45, 0.9);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "second-night-battle", "dranger-second-night-shadow", 0.45, 0.9);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "u384-sunk", "u384-hunt-by-air", 0.25, 0.45);
  expectRouteNearEvent("atlanticConvoyBattle", atlanticConvoyData as CampaignDataModule, "u384-sunk", "u384-continuous-track", 0.05, 0.85);
  expectRoutesNearEachOtherAtEvent(
    "atlanticConvoyBattle",
    atlanticConvoyData as CampaignDataModule,
    "night-torpedo-attacks",
    "hx229-convoy-track",
    "raubgraf-hx229-contact",
    2.0
  );
  expectRoutesNearEachOtherAtEvent(
    "atlanticConvoyBattle",
    atlanticConvoyData as CampaignDataModule,
    "night-torpedo-attacks",
    "sc122-convoy-track",
    "sturmer-sc122-attack",
    2.7
  );
  expectRoutesNearEachOtherAtEvent(
    "atlanticConvoyBattle",
    atlanticConvoyData as CampaignDataModule,
    "second-night-battle",
    "hx229-convoy-track",
    "raubgraf-second-night-shadow",
    1.6
  );
  expectRoutesNearEachOtherAtEvent(
    "atlanticConvoyBattle",
    atlanticConvoyData as CampaignDataModule,
    "second-night-battle",
    "sc122-convoy-track",
    "sturmer-second-night-shadow",
    1.0
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "morning-dogfight-london",
    "morning-raid-first-wave",
    "eleven-group-morning-scramble",
    0.25
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "morning-dogfight-london",
    "morning-raf-dogfight-weave",
    "morning-luftwaffe-cover-break",
    0.25
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "morning-return-fire",
    "morning-raid-second-wave",
    "morning-return-pursuit",
    0.5
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "afternoon-all-squadrons-engaged",
    "afternoon-raf-dogfight-weave",
    "afternoon-luftwaffe-cover-split",
    0.25
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "afternoon-bombers-broken",
    "afternoon-return-broken-raid",
    "late-pursuit-over-channel",
    0.25
  );
  expectRoutesNearEachOtherAtEvent(
    "battleOfBritain",
    battleOfBritainData as CampaignDataModule,
    "channel-pursuit-closes",
    "afternoon-return-broken-raid",
    "late-pursuit-over-channel",
    0.25
  );

  for (const [campaignName, data] of [
    ["battleOfBritain", battleOfBritainData as CampaignDataModule],
    ["bigWeekAirBattle", bigWeekData as CampaignDataModule],
    ["bismarckSeaAirBattle", bismarckSeaData as CampaignDataModule]
  ] as const) {
    expect(data.diveCueEventIds?.size ?? 0, `${campaignName} air war should not use generic dive cues after explicit cue kinds`).toBe(0);
  }

  expectDogfightEffectsHaveLiveAircraft("battleOfBritain", battleOfBritainData as CampaignDataModule, 0.85);
  expectDogfightEffectsHaveLiveAircraft("bigWeekAirBattle", bigWeekData as CampaignDataModule, 1.1);

  for (const [campaignName, data] of customCampaignData) {
    expect(toTime(data.campaignEnd), `${campaignName} campaign end should be after start`).toBeGreaterThan(toTime(data.campaignStart));
    expectEventsSortedByDate(campaignName, data.battleEvents);
    for (const event of data.battleEvents) {
      expectDateWithinRange(`${campaignName} event ${event.id}`, event.date, data.campaignStart, data.campaignEnd);
    }
    for (const carrier of data.carriers) {
      for (let index = 1; index < carrier.track.length; index += 1) {
        expect(
          toTime(carrier.track[index].date),
          `${campaignName} carrier ${carrier.id} track order ${carrier.track[index - 1].date} -> ${carrier.track[index].date}`
        ).toBeGreaterThanOrEqual(toTime(carrier.track[index - 1].date));
      }
    }
    for (const wave of data.airWaves) {
      expectDateWithinRange(`${campaignName} wave ${wave.id} start`, wave.start, data.campaignStart, data.campaignEnd);
      expectDateWithinRange(`${campaignName} wave ${wave.id} end`, wave.end, data.campaignStart, data.campaignEnd);
      expect(toTime(wave.end), `${campaignName} wave ${wave.id} should not end before start`).toBeGreaterThanOrEqual(toTime(wave.start));
    }
  }
});

test("war library home lists ancient and modern animations", async ({ page }) => {
  test.setTimeout(90_000);
  const { apiFailures, consoleErrors } = collectFailures(page);

  await page.goto("/");
  await expect(page.getByTestId("war-library-home")).toBeVisible();
  await expect(page).toHaveTitle("战争动画藏书馆");
  await expect(page.getByTestId("return-home")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "战争动画藏书馆" })).toBeVisible();
  await expect(page.getByTestId("war-library-home")).toContainText("Codex Bellorum / 战争动画藏书馆");
  await expect(page.locator("body")).not.toContainText("War Animation Lab");
  await expect(page.locator("body")).not.toContainText("战争动画实验室");
  await expect(page.getByRole("heading", { name: "古代战争" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "现代战争" })).toBeVisible();
  await expect(page.locator(".campaign-switcher")).toHaveCount(0);
  await expect(page.getByTestId("sunzi-motto-banner")).toContainText("孫子曰：兵者，國之大事，死生之地，存亡之道，不可不察也。");
  await expect(page.getByTestId("sunzi-motto-banner")).toContainText("《孙子兵法·始计第一》");
  await expect(page.getByTestId("sunzi-book-icon")).toBeVisible();
  await expect(page.getByTestId("sunzi-seal-script-text")).toHaveCSS("font-family", /ChongXiSmallSealSubset/);
  for (const fontFile of ["2c490c911d9a49ab.woff2", "9bf3168ffa22394e.woff2", "b10b07f9d71f7dfa.woff2"]) {
    const sealFontResponse = await page.request.head(`/assets/fonts/chongxi/${fontFile}`);
    expect(sealFontResponse.ok()).toBe(true);
    expect(sealFontResponse.headers()["content-type"]).toMatch(/font|octet-stream|binary/);
  }
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.fonts.check(
          "32px ChongXiSmallSealSubset",
          "孫子曰：兵者，國之大事，死生之地，存亡之道，不可不察也。"
        )
      )
    )
    .toBe(true);
  await expect
    .poll(() => page.locator(".war-shelf").first().locator(".war-card strong").evaluateAll((cards) => cards.map((card) => card.textContent?.trim())))
    .toEqual([
      "亚历山大大帝征服史",
      "罗马与迦太基：三次布匿战争史",
      "坎尼会战：双重围歼",
      "大秦统一中国战史",
      "韩信十面埋伏：垓下之战",
      "凯撒大帝战争史",
      "十字军东征",
      "蒙古帝国征服史"
    ]);
  await expect
    .poll(() => page.locator(".war-shelf").nth(1).locator(".war-card strong").evaluateAll((cards) => cards.map((card) => card.textContent?.trim())))
    .toEqual([
      "拿破仑争战史",
      "特拉法尔加大海战",
      "日俄对马海战",
      "日德兰海战",
      "1940 德法战役",
      "伦敦上空的鹰",
      "1941-1945 苏德战争全景",
      "日美太平洋战争战史",
      "中途岛海空战",
      "俾斯麦海海空战",
      "HX 229 / SC 122：大西洋狼群战",
      "第二次瓜岛海战",
      "大周行动：欧洲昼间制空权争夺",
      "淮海战役：碾庄圩围歼战",
      "抗美援朝战争",
      "1991年第一次海湾战争"
    ]);

  await page.getByTestId("open-punic").click();
  await expect(page.getByTestId("punic-app")).toBeVisible();
  await expect(page.getByTestId("return-home")).toBeVisible();
  await page.getByTestId("return-home").click();
  await expect(page.getByTestId("war-library-home")).toBeVisible();
  await page.getByTestId("open-punic").click();
  await expect(page.getByTestId("punic-app")).toBeVisible();

  const musicSources = await collectCampaignMusicSources(page);
  expect(new Set(musicSources).size).toBe(musicSources.length);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("interactive battle of france animation still works", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "france");
  await expect(page.getByTestId("battle-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1940 德法战役" })).toBeVisible();
  await expect(page.locator("body")).toContainText("战争动画藏书馆 / 现代战争");
  await expect(page.locator("body")).not.toContainText("War Animation Lab");
  await expect(page.locator("body")).not.toContainText("战争动画实验室");
  await expect(page.getByTestId("active-event-card")).toContainText("黄色方案启动");
  await expect(page.getByTestId("score-toggle")).toContainText("配乐待播放");

  const titleCard = await page.getByTestId("map-title-card").boundingBox();
  expect(titleCard?.width).toBeLessThan(460);
  expect(titleCard?.height).toBeLessThan(150);

  await expectScoreUsesMusic(page, "/audio/directory-audio-military-exercise.mp3");

  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const viewport = page.viewportSize();
  expect(mapBox?.width).toBeGreaterThan((viewport?.width ?? 0) * 0.68);
  await expectMapFirstLayout(page);

  await page.getByTestId("play-pause").click();
  await expect(page.getByTestId("play-pause")).toContainText("暂停");
  await page.getByTestId("play-pause").click();
  await expect(page.getByTestId("play-pause")).toContainText("播放");

  await page.getByText("色当渡河与空袭震慑").click();
  await expectRealisticUnitIcon(page, "tank-marker", "tank");
  await expectUnitIconFacesRoute(page, "sickle-cut", "-1", "1");
  const germanRoute = page.locator(".faction-germany .front-route").first();
  const alliedRoute = page.locator(".faction-allies .front-route").first();
  await expect(germanRoute).toBeVisible();
  await expect(alliedRoute).toBeVisible();
  const germanStroke = await germanRoute.evaluate((route) => getComputedStyle(route).stroke);
  const alliedStroke = await alliedRoute.evaluate((route) => getComputedStyle(route).stroke);
  expect(germanStroke).not.toEqual(alliedStroke);

  await page.getByTestId("event-list").getByRole("button", { name: /装甲前锋抵达英吉利海峡/ }).click();
  await expect(page.locator('.front-line[data-route-id="allied-dyle"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="allied-dyle"]').getByTestId("infantry-marker")).toHaveCount(0);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("贡比涅停战协定签署");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("soviet german panoramic animation uses five minute pacing", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "eastern");
  await expect(page.getByTestId("eastern-front-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1941-1945 苏德战争全景" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "1941-1945 苏德战争全景");
  await expect(page.getByTestId("active-event-card")).toContainText("巴巴罗萨行动爆发");
  await expect(page.getByTestId("cinematic-map-effects")).toBeVisible();
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 边境崩裂");
  await expect(page.getByTestId("narration-card")).toContainText("凌晨的边境被炮火撕开");
  await expectMapFirstLayout(page);
  await expectRouteBadgeLabels(page, "army-group-north", ["德"]);

  await expectLowImpactTicker(page);
  await expectCurrentEventInsideMapCore(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectTickerDoesNotBlockMapWheel(page);

  await expectScoreUsesMusic(page, "/audio/fiftysounds-false-flag.mp3");

  await page.getByText("斯大林格勒巷战白热化").click();
  await expect(page.getByTestId("active-event-card")).toContainText("斯大林格勒巷战白热化");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第三幕 / 伏尔加陷阱");
  await expect(page.getByTestId("narration-subtitle")).toContainText("斯大林格勒的火光");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("tank-marker").first()).toBeVisible();
  await expectRealisticUnitIcon(page, "tank-marker", "tank");
  await expectUnitIconFacesRoute(page, "case-blue", "1", "-1");
  await expect(page.getByTestId("explosion-burst").first()).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /蓝色方案启动/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("蓝色方案启动");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /天王星行动合围第6集团军/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("天王星行动合围第6集团军");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /斯大林格勒德军投降/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("斯大林格勒德军投降");
  await expectUnitIconFacesRoute(page, "uranus-encirclement", "-1", "1");
  await expectRouteBadgeLabels(page, "uranus-encirclement", ["苏"]);
  await expect(page.locator('.front-line[data-route-id="case-blue"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="case-blue"]').getByTestId("tank-marker")).toHaveCount(0);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("德国无条件投降生效");
  await expect(page.getByText("柏林", { exact: true }).first()).toBeVisible();

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("napoleonic and punic animations load and label repeated theaters", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "napoleonic");
  await expect(page.getByTestId("napoleonic-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "拿破仑争战史" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "拿破仑争战史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 意大利与埃及");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectScoreUsesMusic(page, "/audio/radetzky-march.mp3");
  await expect(page.getByTestId("event-list")).toContainText("意大利第1次作战开始");
  await page.getByTestId("event-list").getByRole("button", { name: /伊比利亚第1次作战爆发/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("伊比利亚第1次作战爆发");
  await expectRealisticUnitIcon(page, "cannon-marker", "cannon");
  await expectRouteBadgeLabels(page, "peninsular-first-operation", ["法"]);

  await openCampaignFromHome(page, "punic");
  await expect(page.getByTestId("punic-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "罗马与迦太基：三次布匿战争史" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "罗马与迦太基：三次布匿战争史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 西西里与海权");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectScoreUsesMusic(page, "/audio/fiftysounds-only-the-braves.mp3");
  const meleeSfx = await page.request.head("/audio/sfx/swords-clashing.mp3");
  expect(meleeSfx.ok()).toBe(true);
  expect(meleeSfx.headers()["content-type"]).toContain("audio");
  expect(Number(meleeSfx.headers()["content-length"])).toBeGreaterThan(900_000);
  await expect(page.getByTestId("event-list")).toContainText("西西里第2次作战：阿格里真托");
  await page.getByTestId("event-list").getByRole("button", { name: /海上第1次作战：米莱/ }).click();
  await expectRealisticUnitIcon(page, "ship-marker", "ship");
  await expectUnitIconFacesRoute(page, "naval-operation", "1", "1");
  await expectPunicSeaRoutesAndShipsStayOffLand(page);
  await expect(page.getByTestId("melee-clash").first()).toBeVisible();
  await expect(page.getByTestId("explosion-burst")).toHaveCount(0);
  const seaRoute = page.locator(".route-sea .front-route").first();
  await expect(seaRoute).toBeVisible();
  const seaRouteDash = await seaRoute.evaluate((route) => getComputedStyle(route).strokeDasharray);
  expect(seaRouteDash).not.toBe("none");
  await expectAncientBattleEventsPlayMeleeCue(page, [
    /第一次布匿战争：墨西拿危机/,
    /西西里第2次作战：阿格里真托/,
    /海上第1次作战：米莱/,
    /第一次布匿战争结束/,
    /第二次布匿战争：萨贡托/,
    /汉尼拔越过阿尔卑斯/,
    /意大利第1次作战：特雷比亚/,
    /意大利第2次作战：特拉西梅诺/,
    /意大利第3次作战：坎尼/,
    /意大利第4次作战：罗马消耗反击/,
    /伊比利亚第2次作战：新迦太基/,
    /梅陶罗河阻援/,
    /非洲第1次作战：扎马/,
    /第三次布匿战争：围攻开始/,
    /迦太基陷落/
  ]);
  await page.getByTestId("event-list").getByRole("button", { name: /意大利第3次作战：坎尼/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("意大利第3次作战：坎尼");
  await expectRealisticUnitIcon(page, "cavalry-marker", "cavalry");
  await expectUnitIconFacesRoute(page, "italy-third-operation", "1", "-1");
  await expectRouteBadgeLabels(page, "italy-third-operation", ["迦"]);
  await expectRealisticUnitAsset(page, "chariot");

  const eventPositions = await page.getByTestId("event-rail").locator("button").evaluateAll((buttons) =>
    buttons.map((button) => ({
      left: Number.parseFloat((button as HTMLElement).style.left),
      title: button.getAttribute("title") ?? ""
    }))
  );
  const eventLeft = (title: string) => eventPositions.find((event) => event.title.includes(title))?.left ?? -1;
  expect(eventLeft("第二次布匿战争：萨贡托") - eventLeft("第一次布匿战争结束")).toBeLessThan(0.2);
  expect(eventLeft("第三次布匿战争：围攻开始") - eventLeft("非洲第1次作战：扎马")).toBeLessThan(0.2);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("crusades animation uses five minute pacing and low impact subtitles", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "crusades");
  await expect(page.getByTestId("crusades-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "十字军东征" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "十字军东征");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 远征成形");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectTickerDoesNotBlockMapWheel(page);

  await expectScoreUsesMusic(page, "/audio/wikimedia-washington-post.ogg");
  await expect(page.getByTestId("event-list")).toContainText("克莱蒙号召");
  await expect(page.getByTestId("active-event-card")).toContainText("克莱蒙号召");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /第四次十字军攻陷君士坦丁堡/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("第四次十字军攻陷君士坦丁堡");
  await expectRealisticUnitIcon(page, "ship-marker", "ship");
  await expect(page.locator(".route-sea .front-route").first()).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /哈丁会战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("哈丁会战");
  await expectRealisticUnitIcon(page, "cavalry-marker", "cavalry");
  await expectUnitIconFacesRoute(page, "hattin-saladin", "-1", "1");
  await expectRouteBadgeLabels(page, "hattin-saladin", ["穆"]);
  await expectNoUnitBadgeLabels(page, ["罗", "迦"]);
  await expect(page.getByTestId("melee-clash").first()).toBeVisible();
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("阿卡陷落");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("mongol and qin animations load with ancient warfare pacing", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "mongol");
  await expect(page.getByTestId("mongol-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "蒙古帝国征服史" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/gutenberg-stars-and-stripes.mp3");
  await expectOnlyWarNameInMapTitle(page, "蒙古帝国征服史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 草原成军");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await page.getByTestId("event-list").getByRole("button", { name: /撒马尔罕陷落/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("撒马尔罕陷落");
  await expectRealisticUnitIcon(page, "cavalry-marker", "cavalry");
  await expectUnitIconFacesRoute(page, "khwarezm-opening", "-1", "1");
  await expectRouteBadgeLabels(page, "khwarezm-opening", ["蒙"]);
  await expectNoUnitBadgeLabels(page, ["迦"]);
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("event-list").getByRole("button", { name: /崖山海战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("崖山海战");
  await expectRealisticUnitIcon(page, "ship-marker", "ship");
  await expectCurrentEventInsideMapCore(page);

  await openCampaignFromHome(page, "qin");
  await expect(page.getByTestId("qin-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "大秦统一中国战史" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/fiftysounds-invincible.mp3");
  await expectOnlyWarNameInMapTitle(page, "大秦统一中国战史");
  await expect(page.locator(".qin-unification .map-base")).toHaveAttribute("fill", "url(#oceanGradient)");
  await expect(page.locator(".qin-unification .map-texture")).toHaveAttribute("opacity", "0.72");
  await expect(page.locator(".qin-unification .country-layer .country-china")).toBeVisible();
  await expect(page.getByTestId("historical-map-layer")).toBeVisible();
  await expect(page.locator(".camera-layer > .historical-map-layer")).toBeVisible();
  await expect(page.getByTestId("ancient-map-ornaments")).toHaveCount(0);
  await expect(page.getByTestId("historical-region-qin")).toBeVisible();
  await expectMapPointInsideHistoricalRegion(page, "xianyang", "qin");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "xianyang", "qin");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "yangdi", "han");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "handan", "zhao");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "daliang", "wei");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "shouchun", "chu");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "jicheng", "yan");
  await expectMapPointInsideExactlyOneHistoricalRegion(page, "linzi", "qi");
  await expectHistoricalRegionsDoNotOverlap(page);
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 函谷东出");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectNoUnitBadgeLabels(page, ["迦", "罗"]);
  await expectRouteBadgeLabels(page, "qin-han", ["秦"]);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await page.getByTestId("event-list").getByRole("button", { name: /王翦灭楚/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("王翦灭楚");
  await expect(page.locator('.front-line[data-route-id="qin-chu-first"]')).toHaveCount(0);
  await expect(page.getByTestId("historical-control-han")).toBeVisible();
  await expect(page.getByTestId("historical-control-zhao")).toBeVisible();
  await expect(page.getByTestId("historical-control-wei")).toBeVisible();
  await expectMapPointInsideHistoricalControl(page, "yangdi", "han");
  await expectMapPointInsideHistoricalControl(page, "handan", "zhao");
  await expectMapPointInsideHistoricalControl(page, "daliang", "wei");
  await expectRealisticUnitIcon(page, "chariot-marker", "chariot");
  await expectUnitIconFacesRoute(page, "qin-chu", "1", "1");
  await expectRouteBadgeLabels(page, "qin-chu", ["秦"]);
  await expectTransparentMarkerAsset(page, "/assets/unit-icons/chariot.webp");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("gaixia ambush uses terrain map ten-sided formations and pipa score", async ({ page }) => {
  test.setTimeout(140_000);
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "gaixia");
  await expect(page.getByTestId("gaixia-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "韩信十面埋伏：垓下之战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "韩信十面埋伏：垓下之战");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 河边高地");
  await expectMapFirstLayout(page);
  await expectGaixiaExpandedBattlefield(page);
  await expectLowImpactTicker(page, /rgba\(245, 233, 196, 0\.72\)/);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectScoreUsesMusic(page, "/audio/shi-mian-mai-fu-pipa.mp3");

  await expectGaixiaWebglTerrainIsRendered(page);
  await expectGaixiaUsesSingleMapLibreTacticalMap(page);
  await expectGaixiaMapControlsDoNotCoverRealTerrain(page);
  await expectGaixiaMapViewDrivesTerrainCamera(page);
  await expect(page.getByTestId("gaixia-terrain-layer")).toBeVisible();
  await expect(page.locator('.gaixia-ground[href="/assets/maps/gaixia-terrain-dem.webp"]')).toHaveCount(0);
  await expect(page.locator(".gaixia-sandbox-side-wall")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-relief-terrain-layer")).toBeVisible();
  await expect(page.getByTestId("gaixia-relief-terrain-layer")).toHaveAttribute("data-render-mode", "maplibre-geographic-reference");
  await expect(page.locator(".gaixia-relief-surface")).toHaveCount(7);
  await expect(page.locator(".gaixia-relief-wall")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-back-wall")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-underside")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-shade")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-shadow")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-edge-face")).toHaveCount(0);
  await expect(page.locator(".gaixia-relief-layer")).toHaveCSS("filter", "none");
  await expect.poll(async () =>
    page.locator(".gaixia-relief-top").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).fill === "none"))
  ).toBe(true);
  await expect(page.getByTestId("gaixia-relief-gaixia-east-ridge")).toHaveAttribute("data-elevation", "42");
  await expect(page.getByTestId("gaixia-relief-east-breakout-corridor")).toContainText("东口诱隙通道");
  await expect(page.getByTestId("gaixia-tactical-graphics-layer")).toBeVisible();
  await expect(page.getByTestId("gaixia-tactical-graphic-key-north-crossbow-ridge")).toContainText("K1");
  await expect(page.getByTestId("gaixia-tactical-graphic-obstacle-old-channel")).toContainText("O1");
  await expect(page.getByTestId("gaixia-tactical-graphic-avenue-east-gap")).toContainText("AA");
  await expect(page.getByTestId("gaixia-tactical-graphic-ea-east-gap")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-terrain-north-bank-ridge")).toContainText("北岸岗脊");
  await expect(page.getByTestId("gaixia-terrain-gaixia-east-ridge")).toContainText("垓下东岗 42m");
  await expect(page.getByTestId("gaixia-terrain-south-lowland")).toContainText("南侧洼地");
  await expect(page.getByTestId("gaixia-terrain-east-breakout-corridor")).toContainText("东口通道");
  await expect(page.locator(".gaixia-contour-ridge .gaixia-contour-buffer")).toHaveCount(3);
  await expect(page.locator(".gaixia-contour-corridor .gaixia-contour-line")).toHaveCount(2);
  await expect(page.getByTestId("gaixia-terrain-layer")).toContainText("垓下高地");
  await expect(page.getByTestId("gaixia-terrain-layer")).toContainText("旧河汊低地");
  await expect(page.getByTestId("gaixia-river-layer")).toContainText("沱河");
  await expect(page.locator(".gaixia-river-bank")).toHaveCount(2);
  await expect(page.locator(".gaixia-river-water")).toHaveCount(2);
  await expect(page.getByTestId("gaixia-region-sishui-commandery")).toContainText("秦属泗水郡旧界");
  await expect(page.getByTestId("gaixia-region-han-outer-ring")).toContainText("汉军合围态势");
  await expect(page.getByTestId("gaixia-region-chu-pocket")).toContainText("楚军垓下营垒");
  await expect.poll(async () =>
    page.locator(".gaixia-region path").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).fill === "none"))
  ).toBe(true);
  await expect(page.getByTestId("gaixia-fortification-layer")).toContainText("霸王城");
  await expect(page.getByTestId("gaixia-fieldwork-layer")).toBeVisible();
  await expect(page.getByTestId("gaixia-fieldwork-bawangcheng-outer-rampart")).toContainText("外土垒");
  await expect(page.getByTestId("gaixia-fieldwork-chu-inner-rampart")).toContainText("内营土垒");
  await expect(page.getByTestId("gaixia-fieldwork-west-camp-gate")).toContainText("西营门");
  await expect(page.getByTestId("gaixia-fieldwork-east-gap-gate")).toContainText("东口营门");
  await expect(page.getByTestId("gaixia-fieldwork-old-channel-ditch")).toContainText("旧河汊壕沟");
  await expect(page.getByTestId("gaixia-fieldwork-han-forward-camp-line")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-formation-layer")).toHaveCount(1);
  await expect(page.getByTestId("gaixia-formation-chu-center-block")).toHaveCount(0);
  await expect(page.locator(".gaixia-fieldwork-tower")).toHaveCount(6);
  await expect(page.locator(".gaixia-gate-post")).toHaveCount(4);
  await expect(page.locator(".gaixia-fieldwork-trench-rib")).toHaveCount(4);
  await expect(page.getByTestId("gaixia-ambush-sector-layer")).toContainText("东南伏兵");
  await expect(page.getByTestId("gaixia-point-gaixia")).toContainText("垓下");
  await expect(page.getByTestId("gaixia-point-crossbow-ridge")).toContainText("弩阵高地");
  await expect(page.getByTestId("gaixia-point-east-gap")).toContainText("东口诱隙");
  await expect(page.getByTestId("gaixia-point-south-marsh-mouth")).toContainText("南侧洼地口");
  await expect(page.getByTestId("gaixia-route-chu-retreat-gaixia")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-retreat-gaixia")).toHaveAttribute("data-ground-elevation", /\d+/);
  await expect(page.getByTestId("gaixia-unit-chu-command").first()).toBeVisible();
  await expectGaixiaUnitsUseCompactTacticalScale(page);
  await expect(page.getByTestId("gaixia-route-unit-chu-retreat-gaixia-0")).toHaveAttribute("data-ground-elevation", /\d+/);
  await expect(page.getByTestId("gaixia-unit-chu-command").first().locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-chu-command.webp");
  for (const icon of ["chu-command", "chu-cavalry", "chu-infantry", "han-cavalry", "han-crossbow", "han-infantry"]) {
    const response = await page.request.head(`/assets/unit-icons/gaixia-${icon}.webp`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image");
    expect(Number(response.headers()["content-length"])).toBeGreaterThan(35_000);
  }

  await page.getByTestId("event-list").getByRole("button", { name: /楚军布成垓下营阵/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("楚军布成垓下营阵");
  await expect(page.getByTestId("active-event-card")).toContainText("先以步卒收拢中军");
  await expect(page.getByTestId("gaixia-route-unit-chu-retreat-gaixia-0")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-array-east")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-array-south")).toBeVisible();
  await expect(page.getByTestId("gaixia-formation-chu-center-block")).toContainText("楚中军步阵");
  await expect(page.getByTestId("gaixia-formation-chu-east-cavalry-screen")).toContainText("楚骑东侧屏卫");
  await expect(page.getByTestId("gaixia-formation-chu-south-infantry-line")).toContainText("楚南侧步阵");
  await expect(page.locator(".gaixia-formation-rank-dot")).toHaveCount(0);
  await expect.poll(async () => page.locator(".gaixia-formation-rank-mark").count()).toBeGreaterThanOrEqual(120);
  await expect(page.getByTestId("gaixia-formation-ranks-chu-center-block").locator(".gaixia-formation-rank-mark")).toHaveCount(42);
  await expect.poll(async () => page.locator(".gaixia-formation-front-line").count()).toBeGreaterThanOrEqual(3);
  await expect.poll(async () => page.locator(".gaixia-formation-rank-guide").count()).toBeGreaterThanOrEqual(10);
  await expect.poll(async () => page.locator(".gaixia-formation-front-standard").count()).toBeGreaterThanOrEqual(2);
  await expect.poll(async () => page.locator(".gaixia-formation-shield-icon").count()).toBeGreaterThanOrEqual(12);
  await expect(page.locator(".gaixia-formation-cavalry-icon")).toHaveCount(3);
  await expect(page.getByTestId("gaixia-route-unit-chu-camp-array-center-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-camp-array-east-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-camp-array-south-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toHaveAttribute("data-position-anchor", "chu-center-block");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-east")).toHaveAttribute("data-position-anchor", "chu-east-cavalry-screen");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-south")).toHaveAttribute("data-position-anchor", "chu-south-infantry-line");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expectGaixiaVisibleUnitCount(page, 9);
  await expectGaixiaRouteStaysInMapStage(page, "chu-camp-array-center");
  await expectGaixiaRouteStaysInMapStage(page, "chu-camp-array-east");
  await expectGaixiaRouteStaysInMapStage(page, "chu-camp-array-south");

  await page.getByTestId("event-list").getByRole("button", { name: /韩信布成合围态势/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("韩信布成合围态势");
  await expect(page.locator(".detail-card")).toContainText("楚军营阵仍然完整");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-array-east")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-array-south")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-west-infantry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-north-crossbow")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-northwest-shield")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-east-crossbow-net")).toBeVisible();
  await expect(page.getByTestId("gaixia-fieldwork-han-forward-camp-line")).toContainText("汉军前出营线");
  await expect(page.getByTestId("gaixia-formation-han-west-infantry-block")).toContainText("汉西路步阵");
  await expect(page.getByTestId("gaixia-formation-han-north-crossbow-line")).toContainText("汉北岸弩阵");
  await expect(page.getByTestId("gaixia-formation-han-east-crossbow-line")).toContainText("东口交叉弩网");
  await expect(page.getByTestId("gaixia-formation-han-command-post")).toContainText("韩信中军");
  await expect(page.locator(".gaixia-formation-rank-dot")).toHaveCount(0);
  await expect.poll(async () => page.locator(".gaixia-formation-rank-mark").count()).toBeGreaterThanOrEqual(140);
  await expect(page.getByTestId("gaixia-formation-ranks-han-north-crossbow-line").locator(".gaixia-formation-rank-mark")).toHaveCount(24);
  await expect.poll(async () => page.locator(".gaixia-formation-rank-guide").count()).toBeGreaterThanOrEqual(18);
  await expect(page.locator(".gaixia-camp-tent")).toHaveCount(4);
  await expect(page.locator(".gaixia-formation-crossbow-icon")).toHaveCount(6);
  await expect(page.locator(".gaixia-formation-command-icon")).toHaveCount(1);
  await expect(page.getByTestId("gaixia-route-unit-chu-camp-array-center-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-infantry").first()).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-crossbow").first()).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-infantry").first().locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-infantry.webp");
  await expect(page.getByTestId("gaixia-unit-han-crossbow").first().locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-crossbow.webp");
  await expect(page.getByTestId("gaixia-route-han-west-infantry")).toHaveAttribute("data-position-anchor", "han-west-infantry-block");
  await expect(page.getByTestId("gaixia-route-han-east-crossbow-net")).toHaveAttribute("data-position-anchor", "han-east-crossbow-line");
  await expect(page.getByTestId("gaixia-formation-han-west-infantry-block")).toHaveAttribute("data-route-anchor", "true");
  await expect(page.getByTestId("gaixia-formation-han-east-crossbow-line")).toHaveAttribute("data-route-anchor", "true");
  await expect(page.getByTestId("gaixia-formation-han-command-post")).toHaveAttribute("data-route-anchor", "true");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expectGaixiaVisibleRouteCount(page, 8);
  await expectGaixiaVisibleUnitCount(page, 16);
  await expectGaixiaRouteStaysInMapStage(page, "han-west-infantry");
  await expectGaixiaRouteStaysInMapStage(page, "han-north-crossbow");
  await expectGaixiaRouteStaysInMapStage(page, "han-east-crossbow-net");

  await page.getByTestId("event-list").getByRole("button", { name: /楚军西侧外推，汉军后退稳住/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("楚军西侧外推，汉军后退稳住");
  await expect(page.getByTestId("active-event-card")).toContainText("后退半步稳住阵脚");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-west-counterpush")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-west-fallback")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-northwest-shield")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-west-counterpush-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-han-west-fallback-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-west-counterpush")).toHaveAttribute("data-position-anchor", "west-camp-gate");
  await expect(page.getByTestId("gaixia-fieldwork-west-camp-gate")).toHaveAttribute("data-route-anchor", "true");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expectGaixiaVisibleRouteCount(page, 10);
  await expectGaixiaVisibleUnitCount(page, 20);
  await expectGaixiaRouteStaysInMapStage(page, "chu-west-counterpush");
  await expectGaixiaRouteStaysInMapStage(page, "han-west-fallback");

  await page.getByTestId("event-list").getByRole("button", { name: /汉军西路再压回，东口诱隙展开/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("汉军西路再压回，东口诱隙展开");
  await expect(page.locator(".detail-card")).toContainText("骑兵假退和弩网等待");
  await expect(page.getByTestId("gaixia-route-han-west-counterpress")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-east-counterpush")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-east-cavalry-yield")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-feigned-gap-east")).toBeVisible();
  await expect(page.getByTestId("gaixia-tactical-graphic-ea-east-gap")).toContainText("EA 东口弩骑杀伤区");
  await expect(page.getByTestId("gaixia-route-unit-han-west-counterpress-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-east-counterpush-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-han-east-cavalry-yield-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-west-counterpress")).toHaveAttribute("data-position-anchor", "west-camp-gate");
  await expect(page.getByTestId("gaixia-route-han-west-counterpress")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-route-chu-east-counterpush")).toHaveAttribute("data-position-anchor", "chu-east-cavalry-screen");
  await expect(page.getByTestId("gaixia-route-chu-east-counterpush")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-fieldwork-west-camp-gate")).toHaveAttribute("data-route-anchor", "true");
  await expect(page.getByTestId("gaixia-formation-chu-east-cavalry-screen")).toHaveAttribute("data-route-anchor", "true");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expectGaixiaVisibleRouteCount(page, 13);
  await expectGaixiaVisibleUnitCount(page, 25);
  await expectGaixiaRouteStaysInMapStage(page, "han-west-counterpress");
  await expectGaixiaRouteStaysInMapStage(page, "chu-east-counterpush");
  await expectGaixiaRouteStaysInMapStage(page, "han-east-cavalry-yield");
  await expectGaixiaMeleeEffectBetweenVisibleUnits(page);
  await expectGaixiaCompletedRoutesRemainColored(page);

  await page.getByTestId("event-list").getByRole("button", { name: /十面伏兵完成闭合/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("东口诱隙被弩骑反压回去");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-east-cavalry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-south-infantry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-southeast-cavalry")).toBeVisible();
  await expect(page.getByTestId("gaixia-formation-han-southeast-cavalry-ambush")).toContainText("东南伏骑阵");
  await expect(page.locator(".gaixia-formation-ambush-icon")).toHaveCount(2);
  await expect(page.getByTestId("gaixia-route-han-feigned-gap-east")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-probe-east-gap")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-west-counterpress")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-east-counterpress")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-west")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-north")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-south-screen-recoil")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-south-locking-line")).toBeVisible();
  await expect(page.getByTestId("gaixia-tactical-graphic-bl-south-mouth")).toContainText("BL 南口封锁线");
  await expect(page.getByTestId("gaixia-route-unit-chu-camp-array-south-0")).toHaveCount(0);
  await expect(page.getByTestId("gaixia-route-unit-chu-south-screen-recoil-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-han-south-locking-line-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-west")).toHaveAttribute("data-position-anchor", "bawangcheng-outer-rampart");
  await expect(page.getByTestId("gaixia-route-han-tighten-north")).toHaveAttribute("data-position-anchor", "chu-inner-rampart");
  await expect(page.getByTestId("gaixia-route-han-south-locking-line")).toHaveAttribute("data-position-anchor", "old-channel-ditch");
  await expect(page.getByTestId("gaixia-route-chu-south-screen-recoil")).toHaveAttribute("data-position-anchor", "chu-south-infantry-line");
  await expect(page.getByTestId("gaixia-fieldwork-bawangcheng-outer-rampart")).toHaveAttribute("data-route-anchor", "true");
  await expect(page.getByTestId("gaixia-fieldwork-chu-inner-rampart")).toHaveAttribute("data-route-anchor", "true");
  await expect(page.getByTestId("gaixia-fieldwork-old-channel-ditch")).toHaveAttribute("data-route-anchor", "true");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expect(page.getByTestId("gaixia-unit-han-cavalry").first()).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-cavalry").first().locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-cavalry.webp");
  await expect(page.locator(".gaixia-route[data-route-kind='ambush']")).toHaveCount(4);
  await expectGaixiaVisibleRouteCount(page, 16);
  await expectGaixiaVisibleUnitCount(page, 34);
  await expectGaixiaRouteStaysInMapStage(page, "han-east-cavalry");
  await expectGaixiaRouteStaysInMapStage(page, "han-south-infantry");
  await expectGaixiaRouteStaysInMapStage(page, "han-southeast-cavalry");
  await expectGaixiaRouteStaysInMapStage(page, "chu-probe-east-gap");
  await expectGaixiaMeleeEffectBetweenVisibleUnits(page);

  await page.getByTestId("event-list").getByRole("button", { name: /四面楚歌瓦解军心/ }).click();
  await expect(page.getByTestId("gaixia-song-effect")).toBeVisible();
  await expect(page.getByTestId("active-event-card")).toContainText("四面楚歌瓦解军心");
  await expect(page.getByTestId("active-event-card")).toContainText("营阵开始动摇");
  await expect(page.getByTestId("gaixia-route-chu-night-breakout-check")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-night-breakout-check-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-night-breakout-check-0").locator('[data-testid="gaixia-unit-chu-cavalry"]')).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-night-east-gap-block")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-east")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-south-locking-line")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-song-cordons")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-han-night-east-gap-block-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-east")).toHaveAttribute("data-position-anchor", "east-gap-gate");
  await expect(page.getByTestId("gaixia-route-han-night-east-gap-block")).toHaveAttribute("data-position-anchor", "east-gap-gate");
  await expect(page.getByTestId("gaixia-route-chu-night-breakout-check")).toHaveAttribute("data-position-anchor", "east-gap-gate");
  await expect(page.getByTestId("gaixia-route-chu-night-breakout-check")).toHaveAttribute("data-formation-prelude-count", "4");
  await expect(page.getByTestId("gaixia-fieldwork-east-gap-gate")).toHaveAttribute("data-route-anchor", "true");
  await expectGaixiaCompletedRouteLabelsHidden(page);
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-fragmentation")).toHaveCount(0);
  await expect(page.locator(".gaixia-route[data-route-kind='song']")).toHaveCount(1);
  await expectGaixiaVisibleUnitCount(page, 24);
  await expectGaixiaCurrentUnitsCentered(page, "four-sided Chu songs");

  await page.getByTestId("event-list").getByRole("button", { name: /楚军营阵碎裂与霸王别姬/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("楚军营阵碎裂与霸王别姬");
  await expect(page.getByTestId("active-event-card")).toContainText("原本收拢的中军");
  await expect(page.getByTestId("gaixia-route-chu-camp-array-center")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-camp-fragmentation")).toBeVisible();
  await expectGaixiaVisibleUnitCount(page, 24);
  await expectGaixiaCurrentUnitsCentered(page, "farewell camp fragmentation");

  await page.getByTestId("event-list").getByRole("button", { name: /黎明合击与楚军溃散/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("楚军内营后卫");
  await expect(page.locator(".detail-card")).toContainText("先看到接触与阻击");
  await expect(page.getByTestId("gaixia-route-han-dawn-assault-north")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-dawn-assault-south")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-dawn-assault-west")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-dawn-cavalry-cutoff")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-inner-rearguard-stand")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-south-gate-rearguard")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-east-gate-rearguard")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-inner-rearguard-stand-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-south-gate-rearguard-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-east-gate-rearguard-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-inner-rearguard-stand")).toHaveAttribute("data-position-anchor", "chu-inner-rampart");
  await expect(page.getByTestId("gaixia-route-chu-south-gate-rearguard")).toHaveAttribute("data-position-anchor", "chu-south-infantry-line");
  await expect(page.getByTestId("gaixia-route-chu-east-gate-rearguard")).toHaveAttribute("data-position-anchor", "east-gap-gate");
  await expect(page.getByTestId("gaixia-route-han-dawn-assault-west")).toHaveAttribute("data-formation-prelude-count", "4");
  await expect(page.getByTestId("gaixia-route-han-dawn-cavalry-cutoff")).toHaveAttribute("data-formation-prelude-count", "5");
  await expect(page.getByTestId("gaixia-route-chu-inner-rearguard-stand")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-route-chu-south-gate-rearguard")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-route-chu-east-gate-rearguard")).toHaveAttribute("data-formation-prelude-count", "3");
  await expect(page.getByTestId("gaixia-tactical-graphic-ea-dawn-pocket")).toContainText("EA 黎明合击切割区");
  await expectGaixiaVisibleRouteCount(page, 15);
  await expectGaixiaVisibleUnitCount(page, 28);
  await expectGaixiaRouteStaysInMapStage(page, "han-dawn-assault-west");
  await expectGaixiaRouteStaysInMapStage(page, "han-dawn-cavalry-cutoff");
  await expectGaixiaRouteStaysInMapStage(page, "chu-inner-rearguard-stand");
  await expectGaixiaRouteStaysInMapStage(page, "chu-south-gate-rearguard");
  await expectGaixiaRouteStaysInMapStage(page, "chu-east-gate-rearguard");
  await expectGaixiaMeleeEffectBetweenVisibleUnits(page);
  await expectGaixiaDawnAssaultHasContestedCampBreakthrough(page);
  await expectGaixiaCurrentUnitsCentered(page, "dawn assault");

  await page.getByTestId("event-list").getByRole("button", { name: /项羽率骑兵东南突围/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("东口护退骑卒");
  await expect(page.getByTestId("gaixia-route-chu-east-gate-rearguard")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-east-gate-rearguard-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-chu-breakout-southeast")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-yinling")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-yinling")).toContainText("阴陵");
  await expectGaixiaRouteStaysInMapStage(page, "han-cavalry-pursuit-yinling");

  await page.getByTestId("event-list").getByRole("button", { name: /东城快战与汉骑追逼/ }).click();
  await expect(page.getByTestId("gaixia-route-chu-dongcheng-last-stand")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-wujiang")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-dongcheng-last-stand-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-dongcheng")).toContainText("东城");
  await expect(page.getByTestId("gaixia-point-wujiang-road")).toContainText("乌江");
  await expectGaixiaPointInsideMapStage(page, "dongcheng");

  await page.getByTestId("event-list").getByRole("button", { name: /乌江方向终局/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("乌江方向终局");
  await expect(page.getByTestId("gaixia-route-chu-wujiang-final-flight")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-wujiang")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-unit-chu-wujiang-final-flight-0")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-wujiang-road")).toContainText("乌江");
  await expectGaixiaPointInsideMapStage(page, "wujiang-road");
  await expectGaixiaCameraStaysSmooth(page);

  await expectAncientBattleEventsPlayMeleeCue(page, [
    /楚军退至垓下/,
    /韩信布成合围态势/,
    /楚军西侧外推，汉军后退稳住/,
    /汉军西路再压回，东口诱隙展开/,
    /十面伏兵完成闭合/,
    /黎明合击与楚军溃散/,
    /项羽率骑兵东南突围/,
    /东城快战与汉骑追逼/,
    /乌江方向终局/
  ]);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("alexander conquests animation follows the campaign east", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "alexander");
  await expect(page.getByTestId("alexander-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "亚历山大大帝征服史" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/wikimedia-holst-mars.ogg");
  await expectOnlyWarNameInMapTitle(page, "亚历山大大帝征服史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 马其顿出海");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);

  await expectAncientBattleEventsPlayMeleeCue(page, [
    /底比斯被毁/,
    /格拉尼库斯河战役/,
    /伊苏斯击败大流士三世/,
    /推罗围城/,
    /高加米拉决战/,
    /波斯波利斯陷落/,
    /大流士三世之死/,
    /中亚山地平定/,
    /希达斯佩斯河战役/,
    /希法西斯河兵变/
  ]);

  await page.getByTestId("event-list").getByRole("button", { name: /格拉尼库斯河战役/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("格拉尼库斯河战役");
  await expectRealisticUnitIcon(page, "ship-marker", "ship");
  await expectUnitIconFacesRoute(page, "hellespont-crossing", "1", "1");
  await expectRouteBadgeLabels(page, "hellespont-crossing", ["马"]);
  await expectNoUnitBadgeLabels(page, ["罗", "迦"]);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /进入埃及并奠基亚历山大港/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("进入埃及并奠基亚历山大港");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /高加米拉决战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("高加米拉决战");
  await expectRealisticUnitIcon(page, "cavalry-marker", "cavalry");
  await expect(page.getByTestId("melee-clash").first()).toBeVisible();
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /中亚山地平定/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("中亚山地平定");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /希达斯佩斯河战役/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("希达斯佩斯河战役");
  await expectCurrentEventInsideMapCore(page);
  await expectUnitIconFacesRoute(page, "hydaspes-campaign", "1", "-1");

  await page.getByTestId("event-list").getByRole("button", { name: /希法西斯河兵变/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("希法西斯河兵变");
  await expectRouteBadgeLabels(page, "hyphasis-mutiny", ["拒"]);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("巴比伦病逝");
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("caesar wars animation covers gaul and the civil war", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "caesar");
  await expect(page.getByTestId("caesar-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "凯撒大帝战争史" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/wikimedia-1812-overture.ogg");
  await expectOnlyWarNameInMapTitle(page, "凯撒大帝战争史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 高卢成军");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);

  await expectAncientBattleEventsPlayMeleeCue(page, [
    /比布拉克特击败赫尔维蒂/,
    /孚日击退阿里奥维斯图斯/,
    /萨比斯河苦战/,
    /首次登陆不列颠/,
    /阿莱西亚围城/,
    /越过卢比孔/,
    /伊莱尔达解除西班牙威胁/,
    /法萨卢斯决战/,
    /亚历山大里亚战争/,
    /泽拉：我来我见我胜/,
    /塔普苏斯击溃北非共和派/,
    /蒙达终战/
  ]);

  await page.getByTestId("event-list").getByRole("button", { name: /首次登陆不列颠/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("首次登陆不列颠");
  await expectRealisticUnitIcon(page, "ship-marker", "ship");
  await expectUnitIconFacesRoute(page, "britain-crossing", "-1", "-1");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /阿莱西亚围城/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("阿莱西亚围城");
  await expectRealisticUnitIcon(page, "cavalry-marker", "cavalry");
  await expect(page.getByTestId("melee-clash").first()).toBeVisible();
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /伊莱尔达解除西班牙威胁/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("伊莱尔达解除西班牙威胁");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /法萨卢斯决战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("法萨卢斯决战");
  await expectCurrentEventInsideMapCore(page);
  await expectUnitIconFacesRoute(page, "pharsalus-campaign", "1", "-1");

  await page.getByTestId("event-list").getByRole("button", { name: /蒙达终战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("蒙达终战");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("三月十五日遇刺");
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("battle of britain shows radar directed compact air formations", async ({ page }) => {
  test.setTimeout(120_000);

  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "britain-air");
  await expect(page.getByTestId("battle-of-britain-app")).toBeVisible();
  await installAudioSpy(page);
  await expect(page.getByTestId("map-title-card").getByRole("heading", { name: "伦敦上空的鹰" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "伦敦上空的鹰");
  await expect(page.locator(".battle-of-britain .day-counter")).toContainText("小时");
  await expect(page.locator(".battle-of-britain .day-counter")).not.toContainText("周");
  await expectScoreUsesMusic(page, "/audio/wikimedia-wagner-ride-valkyries.ogg");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 雷达报来袭");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await page.getByTestId("map-reset").click();
  await expectMapResetSettles(page);
  await expectNoTerrainZones(page, ".battle-of-britain");
  await expect(page.locator(".battle-of-britain .camera-layer")).toHaveAttribute("data-map-focus", "britainAirRadar");
  await expectNoDarkTacticalTerrainBlocks(page, ".battle-of-britain");
  await expectBattleOfBritainFortifiedLinesDoNotFill(page);
  await expectBattleOfBritainTerrain3DMap(page);
  await expectBattleOfBritainRenderedMapColorGrade(page);
  await expectBattleOfBritainWeatherAssets(page);
  await expectNoLargeDarkRenderedBlocks(page, ".battle-of-britain");
  await expectBattleOfBritainNoDecorativeCinematicJitter(page);
  await expect(page.locator(".battle-of-britain").getByTestId("ancient-map-ornaments")).toHaveCount(0);
  await expectCurrentEventInBattleOfBritainCore(page, { maxY: 0.32 });
  await expectBattleOfBritainTacticalCoreVisible(page, { bottomMax: 0.86, leftMin: 0.04, rightMax: 1.12, topMax: 0.12 });
  await expect(page.getByTestId("britain-london-defense-belt")).toBeVisible();
  await expect(page.getByTestId("britain-kent-radar-belt")).toBeVisible();
  await expect(page.getByTestId("britain-bomber-stream-corridor")).toBeVisible();
  await expect(page.getByTestId("britain-raf-intercept-screen")).toBeVisible();
  await expect(page.getByTestId("britain-channel-return-corridor")).toBeVisible();
  await expect(page.getByTestId("britain-eleven-group-sector-line")).toBeVisible();
  await expect(page.getByTestId("britain-chain-home-vector")).toBeVisible();
  await expect(page.getByTestId("britain-sector-control-marker")).toBeVisible();
  await expectMapPointsHidden(page, ".battle-of-britain", ["brenchley", "south-london", "buckingham-palace", "victoria", "duxford", "southampton"]);
  await page.getByTestId("event-list").getByRole("button", { name: /雷达报告：大编队越海/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("雷达报告");
  await expect(page.locator(".battle-of-britain .camera-layer")).toHaveAttribute("data-map-focus", "britainAirRadar");
  await expectCurrentEventInBattleOfBritainCore(page, { minY: 0.46, maxY: 0.76 });
  await expectBattleOfBritainElementInMapCore(page, '.front-line[data-route-id="morning-radar-plots"] .front-route', { minX: 0.32, maxX: 0.7, minY: 0.28, maxY: 0.64 });
  await expectBattleOfBritainElementInMapCore(page, '[data-testid="britain-chain-home-vector"]', { minX: 0.28, maxX: 0.72, minY: 0.28, maxY: 0.64 });
  await expectBattleOfBritainTacticalCoreVisible(page, { bottomMax: 0.86, leftMin: 0.04, rightMax: 1.12, topMax: 0.12 });
  await expect(page.locator('.front-line[data-route-id="morning-radar-plots"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-raid-first-wave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-raid-first-wave"]')).toHaveAttribute("data-route-to", "calais");
  await expectRouteHasPolylineComplexity(page, ".battle-of-britain", "morning-raid-first-wave", 5);
  await page.getByTestId("event-list").getByRole("button", { name: /11群连续下令升空/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("11群连续下令升空");
  await expectBattleOfBritainTerrain3DMap(page);
  await expectBattleOfBritainWeatherAssets(page);
  await expect(page.locator('.front-line[data-route-id="eleven-group-morning-scramble"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="eleven-group-morning-scramble"]')).toHaveAttribute("data-route-to", "biggin-hill");
  const scrambleRotation = await battleOfBritainRouteRotation(page, "eleven-group-morning-scramble");
  await expectRealisticUnitIcon(page, "luftwaffe-do17-marker", "luftwaffeDo17", "luftwaffe-do17", "png");
  await expectRealisticUnitIcon(page, "luftwaffe-he111-marker", "luftwaffeHe111", "luftwaffe-he111", "png");
  await expectRealisticUnitIcon(page, "luftwaffe-bf109-marker", "luftwaffeBf109", "luftwaffe-bf109", "png");
  await expectRealisticUnitIcon(page, "luftwaffe-bf110-marker", "luftwaffeBf110", "luftwaffe-bf110", "png");
  await expectRealisticUnitIcon(page, "britain-spitfire-marker", "britainSpitfire", "britain-spitfire", "png");
  await expectRealisticUnitIcon(page, "britain-hurricane-marker", "britainHurricane", "britain-hurricane", "png");
  await expectTransparentAircraftPng(page, "/assets/unit-icons/luftwaffe-do17.png", { maxAlphaRatio: 0.27, maxBBoxFillRatio: 0.62 });
  await expectTransparentAircraftPng(page, "/assets/unit-icons/luftwaffe-he111.png", { maxBBoxFillRatio: 0.66 });
  await expectTransparentAircraftPng(page, "/assets/unit-icons/luftwaffe-bf109.png", { maxBBoxFillRatio: 0.5 });
  await expectTransparentAircraftPng(page, "/assets/unit-icons/luftwaffe-bf110.png", { maxBBoxFillRatio: 0.66 });
  await expectTransparentAircraftPng(page, "/assets/unit-icons/britain-spitfire.png");
  await expectTransparentAircraftPng(page, "/assets/unit-icons/britain-hurricane.png", { maxBBoxFillRatio: 0.52 });
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "luftwaffe-do17-marker", { maxImageHeight: 58, maxImageWidth: 70 });
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "luftwaffe-he111-marker", { maxImageHeight: 62, maxImageWidth: 72 });
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "luftwaffe-bf109-marker");
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "luftwaffe-bf110-marker", { maxImageHeight: 55, maxImageWidth: 66 });
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "britain-spitfire-marker");
  await expectAircraftMarkersHaveNoPhotoCardBackground(page, "britain-hurricane-marker");
  await expect(page.locator(".battle-of-britain .ww2-aircraft-marker .unit-icon-shadow").first()).not.toBeVisible();
  await expect(page.locator(".battle-of-britain").getByTestId("ww2-bomber-marker")).toHaveCount(0);
  await expect(page.locator(".battle-of-britain").getByTestId("ww2-fighter-marker")).toHaveCount(0);
  await expectCompactAircraftMarkers(page, "luftwaffe-do17-marker");
  await expectCompactAircraftMarkers(page, "luftwaffe-he111-marker");
  await expectCompactAircraftMarkers(page, "luftwaffe-bf109-marker");
  await expectCompactAircraftMarkers(page, "luftwaffe-bf110-marker");
  await expectCompactAircraftMarkers(page, "britain-spitfire-marker");
  await expectCompactAircraftMarkers(page, "britain-hurricane-marker");
  await expectBattleOfBritainAircraftProportions(page);
  await expectRouteBadgeLabels(page, "morning-raid-first-wave", ["德", "德", "德", "德", "德"]);

  await page.getByTestId("event-list").getByRole("button", { name: /伦敦南侧空域混战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("伦敦南侧空域混战");
  await expect(page.locator(".battle-of-britain .camera-layer")).toHaveAttribute("data-map-focus", "britainAirCombat");
  await expectCurrentEventInBattleOfBritainCore(page, { minY: 0.24, maxY: 0.62 });
  await expectBattleOfBritainElementInMapCore(page, '[data-testid="britain-morning-dogfight"]', { minX: 0.3, maxX: 0.68, minY: 0.22, maxY: 0.62 });
  await expect(page.getByTestId("britain-morning-dogfight")).toBeVisible();
  await expect(page.locator('.battle-of-britain .battle-salvo-effect')).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="morning-raid-second-wave"]')).toHaveAttribute("data-route-to", "boulogne");
  await expect(page.locator('.front-line[data-route-id="twelve-group-morning-wing"]')).toHaveAttribute("data-route-to", "duxford");
  await expect(page.locator('.front-line[data-route-id="morning-raf-dogfight-weave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-luftwaffe-cover-break"]')).toHaveClass(/route-air/);
  const morningDogfightRotation = await battleOfBritainRouteRotation(page, "morning-raf-dogfight-weave");
  expect(angularDistanceDegrees(scrambleRotation, morningDogfightRotation), "RAF aircraft heading should change between scramble and dogfight route segments").toBeGreaterThan(20);
  await expectBattleOfBritainAircraftRotatesWithRoutes(page);
  await expectBattleOfBritainForegroundReadable(page);
  await expectBattleOfBritainDenseStageNoMapJitter(page, "morning London dogfight");
  await expect(page.getByTestId("dogfight-clash")).toBeVisible();

  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const win = window as typeof window & { __playedAudioSources?: string[] };
    if (win.__playedAudioSources) {
      win.__playedAudioSources.length = 0;
    }
  });
  await page.getByTestId("event-list").getByRole("button", { name: /13:45 第二次大空袭预警/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("第二次大空袭预警");
  await expect(page.locator(".battle-of-britain .camera-layer")).toHaveAttribute("data-map-focus", "britainAirRadar");
  await expectBattleOfBritainWeatherAssets(page, "afternoon");
  await expectCurrentEventInBattleOfBritainCore(page, { minY: 0.34, maxY: 0.64 });
  await expectBattleOfBritainElementInMapCore(page, '.front-line[data-route-id="afternoon-radar-warning"]', { minX: 0.36, maxX: 0.84, minY: 0.28, maxY: 0.68 });
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3")).toBe(0);

  await page.getByTestId("event-list").getByRole("button", { name: /白金汉宫方向/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("白金汉宫方向");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="buckingham-palace-dornier"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="ray-holmes-intercept"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="buckingham-palace-dornier"]')).toHaveAttribute("data-unit-visible-until", "1940-09-15T11:52");
  await expect(page.locator('.front-line[data-route-id="ray-holmes-intercept"]')).toHaveAttribute("data-unit-visible-until", "1940-09-15T11:52");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBeGreaterThan(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3")).toBeGreaterThan(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);

  await page.getByTestId("event-list").getByRole("button", { name: /下午高峰/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("下午高峰");
  await expect(page.locator(".battle-of-britain .camera-layer")).toHaveAttribute("data-map-focus", "britainAirCombat");
  await expectCurrentEventInBattleOfBritainCore(page, { minY: 0.2, maxY: 0.58 });
  await expectBattleOfBritainElementInMapCore(page, '[data-testid="britain-afternoon-dogfight"]', { minX: 0.32, maxX: 0.7, minY: 0.22, maxY: 0.62 });
  await expect(page.getByTestId("britain-afternoon-dogfight")).toBeVisible();
  await expect(page.locator('.battle-of-britain .battle-salvo-effect')).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="afternoon-raf-dogfight-weave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="afternoon-luftwaffe-cover-split"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="afternoon-raid-main-wave"]')).toHaveAttribute("data-route-to", "calais");
  await expect(page.locator('.front-line[data-route-id="afternoon-raid-follow-wave"]')).toHaveAttribute("data-route-to", "cap-gris-nez");
  await expect(page.locator('.front-line[data-route-id="eleven-group-afternoon-all-in"]')).toHaveAttribute("data-route-to", "kenley");
  await expect(page.locator('.front-line[data-route-id="big-wing-afternoon-commitment"]')).toHaveAttribute("data-route-to", "duxford");
  await battleOfBritainRouteRotation(page, "afternoon-raid-main-wave");
  await battleOfBritainRouteRotation(page, "afternoon-raf-dogfight-weave");
  await expectBattleOfBritainAircraftRotatesWithRoutes(page);
  await expectBattleOfBritainForegroundReadable(page);
  await expectBattleOfBritainDenseStageNoMapJitter(page, "afternoon London dogfight");
  await expect(page.getByTestId("britain-twelve-group-big-wing-approach")).toBeVisible();
  await expectRouteBadgeLabels(page, "eleven-group-afternoon-all-in", ["英", "英", "英", "英", "英"]);
  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("傍晚：伦敦守住白昼");
  const londonAirCueCount = await countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3");
  const londonGunCueCount = await countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3");
  const londonExplosionCueCount = await countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /傍晚：伦敦守住白昼/ }).click();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBe(londonAirCueCount);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3")).toBe(londonGunCueCount);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(londonExplosionCueCount);
  await expectAirRouteKeepsTrackButAircraftExit(page, ".battle-of-britain", "morning-raid-first-wave");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".battle-of-britain", "eleven-group-morning-scramble");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".battle-of-britain", "afternoon-raid-main-wave");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("big week air battle shows bomber streams escorts and interceptors", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "big-week");
  await expect(page.getByTestId("big-week-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "大周行动：欧洲昼间制空权争夺" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "大周行动：欧洲昼间制空权争夺");
  await expectScoreUsesMusic(page, "/audio/wikimedia-holst-uranus.ogg");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 逼迫迎战");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectNoTerrainZones(page, ".big-week-air-battle");
  await expectMapPointsHidden(page, ".big-week-air-battle", [
    "brunswick",
    "leipzig",
    "regensburg",
    "schweinfurt",
    "berlin",
    "luftwaffe-intercept",
    "fighter-rendezvous",
    "bomber-loss-zone",
    "ruhr-flak-belt",
    "western-flak-belt",
    "mainz-flak-belt",
    "damaged-return-lane",
    "north-sea-return",
    "berlin-return-lane"
  ]);
  await expect(page.locator('.front-line[data-route-id="argument-first-wave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="argument-first-wave"]')).toHaveAttribute("data-route-to", "east-anglia");
  await expectRouteHasPolylineComplexity(page, ".big-week-air-battle", "argument-first-wave", 4);
  await expectRealisticUnitIcon(page, "ww2-bomber-marker", "ww2Bomber", "ww2-bomber");
  await expectCompactAircraftMarkers(page, "ww2-bomber-marker");
  await expect(page.locator('.front-line[data-route-id="argument-first-wave"] .formation-unit')).toHaveCount(4);
  await expect(page.getByTestId("outcome-panel")).toContainText("轰炸机流往返");

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /首日轰炸机流抵达目标区/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("首日轰炸机流抵达目标区");
  await expectCurrentEventInsideMapCore(page);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBeGreaterThan(0);

  await page.getByTestId("event-list").getByRole("button", { name: /远程护航改变深袭生存率/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("受损轰炸机有返航机会");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("big-week-loss-belt-dogfight")).toBeVisible();
  await expect(page.locator(".big-week-air-battle .battle-salvo-effect")).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="deep-escort-chain"]')).toHaveAttribute("data-route-to", "east-anglia");
  await expect(page.locator('.front-line[data-route-id="schweinfurt-regensburg-lesson"]')).toHaveAttribute("data-route-to", "east-anglia");
  await expect(page.locator('.front-line[data-route-id="loss-belt-luftwaffe-intercept"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="ruhr-flak-belt-fire"]')).toHaveClass(/route-air/);
  await expect(page.getByTestId("map-point-ruhr-flak-belt")).toBeVisible();
  await expect(page.getByTestId("map-point-western-flak-belt")).toBeVisible();
  await expect(page.getByTestId("map-point-mainz-flak-belt")).toBeVisible();
  await expectRouteBadgeLabels(page, "deep-escort-chain", ["美", "美", "美"]);
  await expectRouteBadgeLabels(page, "loss-belt-luftwaffe-intercept", ["德", "德", "德"]);
  await page.getByTestId("timeline").fill("395");
  await expect(page.locator('.front-line[data-route-id="damaged-bomber-return"]')).toHaveAttribute("data-route-to", "east-anglia");
  await expectRouteHasPolylineComplexity(page, ".big-week-air-battle", "damaged-bomber-return", 4);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBeGreaterThan(0);

  await page.getByTestId("event-list").getByRole("button", { name: /德国截击机群被拖入消耗/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("截击机群");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="luftwaffe-rises"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="luftwaffe-rises"]')).toHaveAttribute("data-route-to", "brunswick");
  await expect(page.locator('.front-line[data-route-id="escort-fighter-sweep"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="escort-fighter-sweep"]')).toHaveAttribute("data-route-to", "east-anglia");
  await expect(page.locator('.front-line[data-route-id="escort-sweep-dogfight-weave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="luftwaffe-dogfight-break"]')).toHaveClass(/route-air/);
  await expectRealisticUnitIcon(page, "ww2-fighter-marker", "ww2Fighter", "ww2-fighter");
  await expectCompactAircraftMarkers(page, "ww2-fighter-marker");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBeGreaterThan(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3")).toBeGreaterThan(0);
  await expectRouteBadgeLabels(page, "escort-fighter-sweep", ["美", "美", "美", "美"]);
  await expect(page.getByTestId("big-week-escort-dogfight")).toBeVisible();
  await expect(page.locator(".big-week-air-battle .battle-salvo-effect")).toHaveCount(0);

  await page.getByTestId("event-list").getByRole("button", { name: /航空工业目标遭连续打击/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("爆炸点必须落在工业目标");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("big-week-industrial-dogfight")).toBeVisible();
  await expect(page.locator(".big-week-air-battle .battle-salvo-effect")).toHaveCount(0);
  await expect(page.locator(".big-week-air-battle .salvo-impact")).toHaveCount(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBeGreaterThan(0);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("远程返航分散");
  await expectCurrentEventInsideMapCore(page);
  const bigWeekExplosionCueCount = await countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /大周行动收束/ }).click();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(bigWeekExplosionCueCount);
  await expect(page.getByTestId("active-event-card")).toContainText("纵深航线不到柏林投弹");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "argument-first-wave");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "deep-escort-chain");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "schweinfurt-regensburg-lesson");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "damaged-bomber-return");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "luftwaffe-rises");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "escort-fighter-sweep");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".big-week-air-battle", "loss-belt-luftwaffe-intercept");
  await expect(page.locator('.front-line[data-route-id="berlin-feint-and-return"]')).toHaveAttribute("data-route-to", "east-anglia");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("bismarck sea air battle shows skip bombing and convoy breakup", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "bismarck-sea");
  await expect(page.getByTestId("bismarck-sea-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "俾斯麦海海空战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "俾斯麦海海空战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expectScoreUsesMusic(page, "/audio/wikimedia-liberty-bell.ogg");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 海上运输线");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectNoTerrainZones(page, ".bismarck-sea-air-battle");
  await expectMapPointsHidden(page, ".bismarck-sea-air-battle", ["convoy-sighting", "skip-bombing-zone", "vitiaz-strait", "lae-approach"]);
  await expect(page.locator('.front-line[data-route-id="japanese-convoy-rabaul-lae"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="japanese-convoy-rabaul-lae"]')).toHaveAttribute("data-route-from", "rabaul-roadstead");
  await expect(page.locator('.front-line[data-route-id="japanese-convoy-rabaul-lae"]')).toHaveAttribute("data-route-to", "convoy-breakup-sea");
  await expectRouteHasPolylineComplexity(page, ".bismarck-sea-air-battle", "japanese-convoy-rabaul-lae", 6);
  await expectRealisticUnitIcon(page, "ww2-transport-ship-marker", "ww2TransportShip", "ww2-transport-ship");
  await expectRealisticUnitIcon(page, "ww2-escort-ship-marker", "ww2EscortShip", "ww2-escort-ship");
  await expectNavalRoutesStayOffLand(page, ".bismarck-sea-air-battle");
  await page.getByTestId("event-list").getByRole("button", { name: /盟军侦察发现并跟踪船队/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("侦察发现");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="allied-search-shadow"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="allied-search-shadow"]')).toHaveAttribute("data-route-to", "dobodura");
  await expectRouteHasPolylineComplexity(page, ".bismarck-sea-air-battle", "allied-search-shadow", 4);

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /高空轰炸先压迫船队/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("高空轰炸");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "ww2-bomber-marker", "ww2Bomber", "ww2-bomber");
  await expect(page.locator('.front-line[data-route-id="high-level-bombing-wave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="high-level-bombing-wave"]')).toHaveAttribute("data-route-to", "port-moresby");
  await expect(page.locator('.front-line[data-route-id="skip-bombing-attack"]')).toHaveCount(0);
  await expect(page.locator(".bismarck-sea-air-battle .battle-salvo-effect")).toHaveCount(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBeGreaterThan(0);

  await page.getByTestId("event-list").getByRole("button", { name: /跳弹轰炸撕裂船队/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("跳弹轰炸");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "ww2-attack-aircraft-marker", "ww2AttackAircraft", "ww2-attack-aircraft");
  await expectCompactAircraftMarkers(page, "ww2-attack-aircraft-marker");
  await expect(page.locator(".bismarck-sea-air-battle .battle-salvo-effect")).toHaveCount(0);
  await expect(page.locator(".bismarck-sea-air-battle .salvo-shell-trace")).toHaveCount(0);
  await expect(page.locator(".bismarck-sea-air-battle .salvo-impact")).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="skip-bombing-attack"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="convoy-breakup"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="convoy-breakup"]')).toHaveAttribute("data-route-to", "lae-approach");
  await expectNavalRoutesStayOffLand(page, ".bismarck-sea-air-battle");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/machine-gun-vulcan.mp3")).toBeGreaterThan(0);

  await page.getByTestId("event-list").getByRole("button", { name: /后续追击终结运输企图/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("后续追击");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="mopping-up-strikes"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="mopping-up-strikes"]')).toHaveAttribute("data-route-to", "dobodura");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".bismarck-sea-air-battle", "high-level-bombing-wave");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".bismarck-sea-air-battle", "skip-bombing-attack");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".bismarck-sea-air-battle", "allied-search-shadow");
  await expectNavalRoutesStayOffLand(page, ".bismarck-sea-air-battle");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("atlantic convoy battle shows wolfpack submarine and anti-submarine timeline", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "atlantic-convoy");
  await expect(page.getByTestId("atlantic-convoy-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "HX 229 / SC 122：大西洋狼群战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "HX 229 / SC 122：大西洋狼群战");
  await expectScoreUsesMusic(page, "/audio/wikimedia-heart-of-oak.ogg");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 发现船队");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectNoTerrainZones(page, ".atlantic-convoy-battle");
  await expectVisibleUnitsUseReadableBattleArea(
    page,
    ".atlantic-convoy-battle",
    ["hx229-convoy-track", "sc122-convoy-track", "raubgraf-hx229-contact", "u384-continuous-track"],
    0.4,
    0.12
  );
  await expectMapPointsHidden(page, ".atlantic-convoy-battle", [
    "sc122-contact",
    "hx229-night-attack",
    "sc122-night-attack",
    "liberator-patrol-zone",
    "second-night-attack",
    "u384-sinking",
    "attack-discontinued"
  ]);
  await expect(page.getByTestId("outcome-panel")).toContainText("U艇参战口径");
  await expect(page.locator('.front-line[data-route-id="hx229-convoy-track"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="sc122-convoy-track"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="raubgraf-hx229-contact"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="u384-continuous-track"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="u384-continuous-track"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.getByTestId("formation-unit-u384-continuous-track-u384")).toBeVisible();
  await expectRouteHasPolylineComplexity(page, ".atlantic-convoy-battle", "hx229-convoy-track", 8);
  await expectRouteHasPolylineComplexity(page, ".atlantic-convoy-battle", "sc122-convoy-track", 8);
  await expectRouteHasPolylineComplexity(page, ".atlantic-convoy-battle", "raubgraf-hx229-contact", 4);
  await expectRouteHasPolylineComplexity(page, ".atlantic-convoy-battle", "u384-continuous-track", 8);
  await expectRealisticUnitIcon(page, "ww2-transport-ship-marker", "ww2TransportShip", "ww2-transport-ship");
  await expectRealisticUnitIcon(page, "ww2-escort-ship-marker", "ww2EscortShip", "ww2-escort-ship");
  await expectRealisticUnitIcon(page, "ww2-submarine-marker", "ww2Submarine", "ww2-submarine");
  await expectNavalRoutesStayOffLand(page, ".atlantic-convoy-battle");

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /夜间鱼雷攻击高峰/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("夜间鱼雷攻击");
  await expectCurrentEventInsideMapCore(page);
  await expectRoutesUseReadableBattleArea(
    page,
    ".atlantic-convoy-battle",
    ["hx229-convoy-track", "sc122-convoy-track", "raubgraf-hx229-contact", "sturmer-sc122-attack", "dranger-hx229-converge", "u384-continuous-track"],
    0.62,
    0.28
  );
  await expect(page.locator('.front-line[data-route-id="raubgraf-hx229-contact"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.locator('.front-line[data-route-id="sturmer-sc122-attack"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.locator('.front-line[data-route-id="dranger-hx229-converge"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.getByTestId("atlantic-hx229-torpedo-salvo")).toBeVisible();
  await expect(page.getByTestId("atlantic-hx229-torpedo-salvo").locator(".salvo-shell-trace")).toHaveCount(0);
  await expect(page.getByTestId("atlantic-hx229-torpedo-salvo").locator(".salvo-shell-head")).toHaveCount(0);
  await expect(page.locator(".atlantic-convoy-battle .salvo-shell-trace")).toHaveCount(0);
  await expect(page.getByTestId("atlantic-sc122-torpedo-salvo")).toHaveCount(0);
  await setTimeline(page, 217);
  await expect(page.getByTestId("atlantic-sc122-torpedo-salvo")).toBeVisible();
  await expect(page.getByTestId("atlantic-sc122-torpedo-salvo").locator(".salvo-impact")).toHaveCount(4);
  await expect(page.locator(".atlantic-convoy-battle .salvo-shell-trace")).toHaveCount(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBeGreaterThan(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBeGreaterThan(0);
  await expect(page.locator('.front-line[data-route-id="escort-counterattack-screen"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="escort-counterattack-screen"]')).toHaveAttribute("data-route-to", "second-night-attack");

  await page.getByTestId("event-list").getByRole("button", { name: /远程巡逻机进入空隙边缘/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("远程巡逻机");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="vlr-liberator-first-patrol"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="vlr-liberator-first-patrol"]')).toHaveAttribute("data-route-to", "iceland-patrol-base");
  await expectRealisticUnitIcon(page, "ww2-bomber-marker", "ww2Bomber", "ww2-bomber");
  await expectCompactAircraftMarkers(page, "ww2-bomber-marker");

  await page.getByTestId("event-list").getByRole("button", { name: /U-384 被 RAF 206中队击沉/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("U-384");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("atlantic-u384-depth-charge")).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="u384-continuous-track"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.getByTestId("formation-unit-u384-continuous-track-u384")).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="u384-hunt-by-air"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="u384-hunt-by-air"]')).toHaveAttribute("data-route-to", "northern-ireland-patrol-base");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBeGreaterThan(1);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("终止攻击");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="u-boat-disengagement"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="u384-continuous-track"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="raubgraf-disengagement"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.locator('.front-line[data-route-id="sturmer-disengagement"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.locator('.front-line[data-route-id="dranger-disengagement"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.locator('.front-line[data-route-id="u-boat-disengagement"]')).toHaveAttribute("data-unit-visible", "true");
  await expect(page.getByTestId("formation-unit-u-boat-disengagement-u-withdraw-a")).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="escort-eastern-cover"]')).toHaveAttribute("data-unit-visible", "true");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".atlantic-convoy-battle", "vlr-liberator-first-patrol");
  await expectAirRouteKeepsTrackButAircraftExit(page, ".atlantic-convoy-battle", "u384-hunt-by-air");
  await expectNavalRoutesStayOffLand(page, ".atlantic-convoy-battle");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("cannae battle uses mature tactical structure and closes the double envelopment", async ({ page }) => {
  test.setTimeout(180_000);
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "cannae");
  await expect(page.getByTestId("cannae-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "坎尼会战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "坎尼会战");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page, /rgba\(246, 234, 196, 0\.72\)/);
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-renderer", "maplibre-real-terrain");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-terrain-model", "real-dem-raster-terrain");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-tactical-renderer", "maplibre-geographic-overlay");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-projection", "webgl-gis-terrain");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-terrain-source", "/assets/maps/cannae-real-terrain/terrarium/{z}/{x}-{y}.png");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-terrain-exaggeration", "1");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-hillshade-exaggeration", "0.08");
  await expect(page.getByTestId("cannae-terrain-3d")).toHaveAttribute("data-camera-pitch", "60");
  await expect(page.getByTestId("cannae-maplibre-tactical-overlay")).toBeVisible();
  await expect(page.getByTestId("cannae-terrain-3d-canvas")).toBeVisible();
  await expect(page.getByTestId("cannae-river-layer")).toBeVisible();
  await expect(page.locator(".cannae-river-water").first()).not.toHaveCSS("stroke", "rgb(0, 0, 0)");
  await expectCannaeVisibleUnitCounts(page, 35, 40);
  await expectCannaeMatureUnitRendering(page, 80, 150);
  await expectCannaeRenderedAsset(page, "roman-legion", "cannae-roman-legion");
  await expectCannaeRenderedAsset(page, "african-infantry", "cannae-african-infantry");
  await expectCannaeRenderedAsset(page, "numidian-cavalry", "cannae-numidian-cavalry");
  await expectCannaeRenderedAsset(page, "hannibal-command", "cannae-carthaginian-command");
  await expectCannaeActivePinInsideMapCore(page);

  await clickCannaeEvent(page, /罗马纵深集团向中军压入/);
  await expect(page.getByTestId("active-event-card")).toContainText("罗马纵深集团向中军压入");
  await expect(page.getByTestId("cannae-formation-roman-deep-mass")).toContainText("罗马重步兵纵深集团");
  await expect(page.getByTestId("cannae-formation-carthaginian-convex-center")).toContainText("汉尼拔凸月形中军");
  await expectCannaeEffectBoundToVisibleRoutes(page, "cannae-melee-effect", ["roman-deep-advance", "carthaginian-center-forward"]);
  await expectCannaeMatureUnitRendering(page, 80, 150);
  await expectCannaeRouteEnvelopeDistance(page, "roman-deep-advance", "carthaginian-center-forward", 20);
  await expectCannaeActivePinInsideMapCore(page);

  await clickCannaeEvent(page, /迦太基骑兵清理两翼/);
  await expect(page.getByTestId("active-event-card")).toContainText("迦太基骑兵清理两翼");
  await expectCannaeRenderedAsset(page, "carthaginian-cavalry", "cannae-carthaginian-cavalry");

  await clickCannaeEvent(page, /非洲重步兵从两翼内折/);
  await expect(page.getByTestId("active-event-card")).toContainText("非洲重步兵从两翼内折");
  await expectCannaeEffectBoundToVisibleRoutes(page, "cannae-melee-effect", ["roman-core-compression", "african-left-inward-turn", "african-right-inward-turn"]);
  await expectCannaeSideJawsEngaged(page);
  await expectCannaeRouteEnvelopeDistance(page, "roman-core-compression", "african-left-inward-turn", 8);
  await expectCannaeRouteEnvelopeDistance(page, "roman-core-compression", "african-right-inward-turn", 8);

  await clickCannaeEvent(page, /骑兵绕后封闭罗马后口/);
  await expect(page.getByTestId("active-event-card")).toContainText("骑兵绕后封闭罗马后口");
  await expectCannaeEffectBoundToVisibleRoutes(page, "cannae-melee-effect", ["roman-core-compression", "heavy-cavalry-rear-ride", "numidian-rear-pressure"]);
  await expectCannaeDoubleEnvelopmentClosed(page);
  await expectCannaeRouteEnvelopeDistance(page, "roman-core-compression", "heavy-cavalry-rear-ride", 8);
  await expectCannaeRouteEnvelopeDistance(page, "roman-core-compression", "numidian-rear-pressure", 8);
  await expectCannaeNearestUnitDistance(page, "roman-core-compression", "heavy-cavalry-rear-ride", 18);
  await expectCannaeNearestUnitDistance(page, "roman-core-compression", "numidian-rear-pressure", 18);
  await expectCannaeVisibleUnitCounts(page, 24, 55);
  await expectCannaeStageUnitEnvelope(page, 0.4, 0.46);

  await clickCannaeEvent(page, /包围圈压缩，罗马集团失去展开空间/);
  await expect(page.getByTestId("active-event-card")).toContainText("包围圈压缩");
  await expectCannaeEffectBoundToVisibleRoutes(page, "cannae-melee-effect", ["roman-core-compression", "carthaginian-center-hold", "carthaginian-pocket-tighten"]);
  await expectCannaeRouteEnvelopeDistance(page, "roman-core-compression", "carthaginian-center-hold", 8);
  await expectCannaeNearestUnitDistance(page, "roman-core-compression", "carthaginian-center-hold", 18);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("坎尼成为双重包围的惨烈范例");
  await expectCannaeDoubleEnvelopmentClosed(page);
  await expectCannaeMatureUnitRendering(page, 80, 125);
  await expectCannaeRenderedAsset(page, "paullus-command", "cannae-roman-command");
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-roman-units"))).toBeGreaterThanOrEqual(18);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-roman-units"))).toBeLessThanOrEqual(40);
  await expect.poll(async () => page.locator(".cannae-battle-unit.cannae-unit-carthage").count()).toBeGreaterThanOrEqual(58);
  await expect.poll(async () => page.locator(".cannae-battle-unit.cannae-unit-carthage").count()).toBeLessThanOrEqual(92);
  await expect.poll(async () => page.locator(".cannae-battle-unit.cannae-unit-rome").count()).toBeGreaterThanOrEqual(18);
  await expect.poll(async () => page.locator(".cannae-battle-unit.cannae-unit-rome").count()).toBeLessThanOrEqual(40);
  await expect(page.locator(".cannae-density-mark")).toHaveCount(0);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-carthage-units"))).toBeGreaterThanOrEqual(58);
  await expect.poll(async () => Number(await page.getByTestId("cannae-terrain-3d").getAttribute("data-visible-carthage-units"))).toBeLessThanOrEqual(95);
  await expectCannaeStageUnitEnvelope(page, 0.44, 0.44);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors.filter((message) => !message.includes("GL Driver Message"))).toEqual([]);
});

test("pacific war animation uses aircraft carrier markers", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "pacific");
  await expect(page.getByTestId("pacific-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "日美太平洋战争战史" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/semper-fidelis-march.mp3");
  await expectOnlyWarNameInMapTitle(page, "日美太平洋战争战史");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 航母突袭与南进");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await page.getByTestId("event-list").getByRole("button", { name: /中途岛海战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("中途岛海战");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "carrier-marker", "carrier");
  await expectUnitIconFacesRoute(page, "midway-counter", "-1", "-1");
  await expectRouteBadgeLabels(page, "midway-counter", ["美"]);
  await expect(page.locator('.front-line[data-route-id="pearl-harbor-strike"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="pearl-harbor-strike"]').getByTestId("carrier-marker")).toHaveCount(0);
  await page.getByTestId("event-list").getByRole("button", { name: /瓜达尔卡纳尔登陆/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("瓜达尔卡纳尔登陆");
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("event-list").getByRole("button", { name: /塔拉瓦登陆/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("塔拉瓦登陆");
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("event-list").getByRole("button", { name: /塞班岛陷落/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("塞班岛陷落");
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("event-list").getByRole("button", { name: /莱特湾海战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("莱特湾海战");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "carrier-marker", "carrier");
  await expect(page.locator(".route-sea .front-route").first()).toBeVisible();
  await page.getByTestId("event-list").getByRole("button", { name: /硫磺岛登陆/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("硫磺岛登陆");
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("event-list").getByRole("button", { name: /冲绳战役/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("冲绳战役");
  await expectCurrentEventInsideMapCore(page);
  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("东京湾受降");
  await expectCurrentEventInsideMapCore(page);

  const guadalcanalPosition = await eventRailPositionByTitle(page, /瓜达尔卡纳尔登陆/);
  const tarawaPosition = await eventRailPositionByTitle(page, /塔拉瓦登陆/);
  const saipanPosition = await eventRailPositionByTitle(page, /塞班岛陷落/);
  const leytePosition = await eventRailPositionByTitle(page, /莱特湾海战/);
  expect(tarawaPosition - guadalcanalPosition).toBeLessThan(18);
  expect(saipanPosition - tarawaPosition).toBeLessThan(14);
  expect(leytePosition - saipanPosition).toBeLessThan(5);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("korean war animation uses era matched carrier aircraft infantry and tank markers", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "korean");
  await expect(page.getByTestId("korean-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "抗美援朝战争" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/wikimedia-holst-jupiter.ogg");
  await expectOnlyWarNameInMapTitle(page, "抗美援朝战争");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 南进与釜山");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);

  await page.getByTestId("event-list").getByRole("button", { name: /1950年9月15[\s\S]*仁川登陆/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("仁川登陆");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "carrier-essex-marker", "carrierEssex", "carrier-essex");
  const incheonRoute = page.locator('.front-line[data-route-id="incheon-landing"]');
  await expect(incheonRoute).toHaveClass(/route-sea/);
  await expect(incheonRoute.getByTestId("carrier-essex-marker")).toBeVisible();
  await expect(incheonRoute.getByTestId("unit-faction-badge-un")).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /中国人民志愿军入朝/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("中国人民志愿军入朝");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="un-to-yalu"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="pva-first-phase"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="pva-first-phase"]').getByTestId("unit-faction-badge-communist")).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="pva-first-phase"]')).toHaveAttribute("data-route-label", /北部接触/);
  await expect(page.locator('.front-line[data-route-id="pva-first-phase"]')).toHaveAttribute("data-route-to", "unsan");
  await expectRealisticUnitIcon(page, "infantry-pva-marker", "infantryPva", "infantry-pva");
  await expect(page.locator('.front-line[data-route-id="un-to-yalu"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="un-to-yalu"]').getByTestId("infantry-marker")).toHaveCount(0);

  await page.getByTestId("event-list").getByRole("button", { name: /长津湖战役/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("长津湖战役");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.locator('.front-line[data-route-id="un-to-yalu"]')).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="pva-second-phase-west"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="chosin-campaign"]')).toHaveClass(/is-active/);
  await expectRealisticUnitIcon(page, "infantry-pva-marker", "infantryPva", "infantry-pva");
  await expect(page.locator('.front-line[data-route-id="chosin-campaign"]').getByTestId("infantry-marker")).toHaveCount(0);

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /米格走廊喷气空战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("米格走廊喷气空战");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBeGreaterThan(0);
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "sabre-marker", "sabre");
  await expectUnitIconFacesRoute(page, "mig-alley-air-war", "-1", "-1");
  const airRoute = page.locator('.front-line[data-route-id="mig-alley-air-war"]');
  await expect(airRoute).toHaveClass(/route-air/);
  await expect(airRoute.getByTestId("sabre-marker")).toBeVisible();
  await expect(airRoute.getByTestId("fighter-marker")).toHaveCount(0);
  await expect(airRoute.getByTestId("tank-marker")).toHaveCount(0);

  await page.getByTestId("event-list").getByRole("button", { name: /联合国军再占汉城/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("联合国军再占汉城");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "tank-korean-marker", "tankKorean", "tank-korean");
  await expect(page.locator('.front-line[data-route-id="un-counteroffensive-seoul"]').getByTestId("unit-faction-badge-un")).toBeVisible();

  const talksPosition = await eventRailPositionByTitle(page, /停战谈判开始/);
  const migPosition = await eventRailPositionByTitle(page, /米格走廊喷气空战/);
  const trianglePosition = await eventRailPositionByTitle(page, /上甘岭战役/);
  expect(migPosition - talksPosition).toBeLessThan(10);
  expect(trianglePosition - migPosition).toBeLessThan(18);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("朝鲜停战协定签署");
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
test("nianzhuang battle shows Huang Baitao pocket relief blocking trenches and final pursuit", async ({ page }) => {
  test.setTimeout(360_000);
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "nianzhuang");
  await expect(page.getByTestId("nianzhuang-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "淮海战役：碾庄圩围歼战" })).toBeVisible();
  await expect(page.locator("body")).toContainText("战争动画藏书馆 / 解放战争");
  await expect(page.locator("body")).not.toContainText("双堆集");
  await expect(page.locator("body")).not.toContainText("黄维");
  await expectOnlyWarNameInMapTitle(page, "淮海战役：碾庄圩围歼战");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectScoreUsesMusic(page, "/audio/wikimedia-the-thunderer-us-army.ogg");
  await expect(page.getByTestId("historical-region-nianzhuang-pocket")).toBeVisible();
  await expect(page.getByTestId("historical-region-daxujia-blocking-zone")).toBeVisible();
  await expect(page.getByTestId("historical-region-waterlogged-villages")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-longhai-rail")).toContainText("陇海铁路");
  await expect(page.getByTestId("map-point-nianzhuang")).toContainText("碾庄圩");
  await expect(page.getByTestId("map-point-xinanzhen")).toContainText("新安镇");
  await expect(page.getByTestId("map-point-xuzhou")).toContainText("徐州");
  await expect(page.getByTestId("map-point-daxujia")).toContainText("大许家");
  await expect(page.getByTestId("map-point-yunhe")).toContainText("运河与水网");
  await expect(page.locator(".nianzhuang-battle .river-yunhe-water-net")).toBeVisible();
  await expect(page.locator(".nianzhuang-battle .river-nianzhuang-ditches")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-terrain-3d")).toHaveAttribute("data-renderer", "maplibre-real-terrain");
  await expect(page.getByTestId("nianzhuang-terrain-3d")).toHaveAttribute("data-modern-imagery-visible", "false");
  await expect(page.getByTestId("nianzhuang-terrain-3d")).toHaveCSS("background-color", /rgb\(208, 191, 143\)/);
  await expect(page.locator(".nianzhuang-battle .battle-map")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expectNianzhuangLargeBattlefield(page);
  await expectRouteVisibleWithUnit(page, "pla-east-pursuit-main");
  await expectNianzhuangTacticalTerrainAndForceBlocks(page);
  await expectNianzhuangReadableIcons(page);
  await expectNianzhuangReadableMapText(page);
  await expectNianzhuangCameraStaysTactical(page);
  await expectNianzhuangNoLargeDarkOverlayBlocks(page);
  await expectNianzhuangTacticalLabelsNotCrowded(page);
  await expectNianzhuangFullVisualIntegrity(page);
  await expectNianzhuangPursuitUnitsStayInCameraCore(page);
  await expectNianzhuangPursuitUnitsAttachToRouteHeads(page);
  await expectNianzhuangNoResultSpoilers(page);
  await expectNianzhuangCompletedLabelsHidden(page);
  await expectNianzhuangMapFocus(page, "nianzhuangPursuit");

  await jumpToEventByName(page, /黄百韬兵团西撤/);
  await jumpNianzhuangTimelineTo(page, "1948-11-09T12:00");
  await expectRouteVisibleWithUnit(page, "huang-xinan-west-withdrawal");
  await expect(page.locator(".nianzhuang-battle .force-echelon-nationalist").first()).toBeVisible();
  await expectRouteVisibleWithUnit(page, "pla-east-pursuit-main");
  await expectRouteVisibleWithUnit(page, "pla-north-pursuit");
  await expectRouteVisibleWithUnit(page, "pla-south-pursuit");
  await expectRouteUnitLabels(page, "pla-east-pursuit-main", [/8纵前卫/]);
  await expectRouteUnitLabels(page, "pla-north-pursuit", [/9纵北追/]);
  await expectRouteUnitLabels(page, "pla-south-pursuit", [/4纵南截/]);
  await expectRoutesUseReadableBattleArea(page, ".nianzhuang-battle", ["huang-xinan-west-withdrawal", "pla-east-pursuit-main", "pla-north-pursuit"], 0.26, 0.14);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["xuzhou-relief-east", "pla-west-trench-approach"]);
  await expectNianzhuangNoResultSpoilers(page);

  await jumpToEventByName(page, /碾庄圩合围形成/);
  await expectNianzhuangStageInView(page);
  await expect(page.getByTestId("nianzhuang-outer-village-worksites")).toBeVisible();
  for (const routeId of ["pla-east-closing-position", "pla-north-closing-position", "pla-south-closing-position", "pla-southwest-closing-position"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectRouteUnitLabels(page, "pla-east-closing-position", [/封口前卫|合围梯队/]);
  for (const routeId of ["huang-deploy-north", "huang-deploy-east", "huang-deploy-south", "huang-deploy-west"]) {
    await expectRouteVisibleState(page, routeId);
    await expect(page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`)).toHaveAttribute("data-unit-visible", "false");
  }
  await expectRouteVisibleWithUnit(page, "huang-deploy-command");
  await jumpNianzhuangTimelineTo(page, "1948-11-11T06:00");
  for (const routeId of ["huang-deploy-north", "huang-deploy-east", "huang-deploy-south", "huang-deploy-west", "huang-deploy-command"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  for (const routeId of ["pla-east-closing-position", "pla-north-closing-position", "pla-south-closing-position", "pla-southwest-closing-position"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["pla-east-pursuit-main", "pla-north-pursuit", "pla-south-pursuit", "pla-southwest-closing-line"]);
  for (const routeId of ["pla-east-pursuit-main", "pla-north-pursuit", "pla-south-pursuit", "pla-southwest-closing-line"]) {
    await expectRouteShellWithUnitOnly(page, routeId);
  }
  await expectNianzhuangClosingRoutesStayLocal(page);
  await expectRouteVisible(page, "pla-encirclement-ring");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="pla-encirclement-ring"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator(".nianzhuang-battle .camera-layer")).toHaveAttribute("data-focus-from", "nianzhuangPursuit");
  await expectNianzhuangMapFocus(page, "nianzhuangPocket");
  const pursuitZoomRatio = Number(await page.locator(".nianzhuang-battle .camera-layer").getAttribute("data-focus-transition-ratio"));
  expect(pursuitZoomRatio).toBeGreaterThan(0.2);
  expect(pursuitZoomRatio).toBeLessThan(0.98);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["huang-xinan-west-withdrawal"]);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["huang-nianzhuang-defense-ring"]);
  await expectNoUnitBadgeLabels(page, ["覆没", "受歼"]);
  await expectNianzhuangNoResultSpoilers(page);
  await expectNianzhuangCompletedLabelsHidden(page);

  await jumpNianzhuangTimelineTo(page, "1948-11-11T12:30");
  await expect(page.locator(".nianzhuang-battle .camera-layer")).toHaveAttribute("data-focus-from", "nianzhuangPocket");
  await expectNianzhuangMapFocus(page, "nianzhuangRelief");
  const reliefTransitionRatio = Number(await page.locator(".nianzhuang-battle .camera-layer").getAttribute("data-focus-transition-raw-ratio"));
  expect(reliefTransitionRatio).toBeGreaterThan(0.01);
  expect(reliefTransitionRatio).toBeLessThan(0.98);
  await expectRouteTransitionPhase(page, "huang-deploy-north", "exiting");
  await expectRouteTransitionPhase(page, "huang-nianzhuang-defense-ring", "entering");
  await expectRouteTransitionPhase(page, "pla-encirclement-ring", "present");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["pla-east-closing-position", "pla-north-closing-position"]);
  await expectRouteNotCurrentWithRenderedUnit(page, "pla-east-closing-position");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-deploy-north"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expectRouteVisibleWithUnit(page, "pla-encirclement-ring");
  await expectNianzhuangNoResultSpoilers(page);

  await jumpToEventByName(page, /固守待援与徐州东援/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangEncirclementAndOuterDefense(page);
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expectRouteVisibleWithUnit(page, "pla-encirclement-ring");
  await expectRouteVisibleWithUnit(page, "huang-outer-destroyed-column");
  await expectRouteVisibleWithUnit(page, "xuzhou-relief-east");
  await expectRouteVisibleWithUnit(page, "pla-relief-block-line");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["xuzhou-relief-contained"]);
  await expect(page.getByTestId("tank-korean-marker").first()).toBeVisible();
  await expect(page.getByTestId("infantry-pva-marker").first()).toBeVisible();
  await expectNoUnitBadgeLabels(page, ["黄维"]);
  await expect(page.getByTestId("nianzhuang-force-scale-note")).toContainText("黄兵团师级阵地展开");
  await expectNianzhuangRouteAnchorHighlighted(page, "huang-nianzhuang-defense-ring");
  await expectRouteTransitionPhase(page, "huang-deploy-north", "exiting");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "huang-xinan-west-withdrawal",
    "pla-east-pursuit-main",
    "pla-north-pursuit",
    "pla-south-pursuit",
    "pla-southwest-closing-line"
  ]);
  await expectNianzhuangCoreBattlefieldZoom(page, 0.48, 0.68);
  await expectNianzhuangNoResultSpoilers(page);
  await expectVisibleUnitsUseReadableBattleArea(
    page,
    ".nianzhuang-battle",
    ["huang-nianzhuang-defense-ring", "pla-encirclement-ring"],
    0.16,
    0.12
  );

  await jumpNianzhuangTimelineTo(page, "1948-11-11T16:00");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-east-closing-position",
    "pla-north-closing-position",
    "pla-south-closing-position",
    "pla-southwest-closing-position",
    "huang-deploy-north",
    "huang-deploy-east",
    "huang-deploy-south",
    "huang-deploy-west",
    "huang-deploy-command"
  ]);

  await jumpToEventByName(page, /试攻受挫，转入攻坚判断/);
  await expectNianzhuangStageInView(page);
  await expectRouteVisibleWithUnit(page, "pla-4th-preliminary-daxingzhuang");
  await expectRouteVisibleWithUnit(page, "pla-13th-preliminary-songzhuang");
  await expectRouteVisibleWithUnit(page, "pla-6th-preliminary-pengzhuang");
  await expectRouteVisibleWithUnit(page, "pla-8th-east-fix-youfang");
  await expectRouteVisibleWithUnit(page, "pla-9th-southeast-advance");
  await expectRouteVisibleWithUnit(page, "huang-preliminary-counterattack");
  await expect(page.getByTestId("map-point-daxingzhuang")).toContainText("大兴庄");
  await expect(page.getByTestId("map-point-songzhuang-large")).toContainText("大宋庄");
  await expect(page.getByTestId("map-point-pengzhuang")).toContainText("彭庄");
  await expect(page.getByTestId("map-point-luliang-line")).toContainText("鲁楼-梁庄线");
  await expectRoutesUseReadableBattleArea(
    page,
    ".nianzhuang-battle",
    [
      "pla-4th-preliminary-daxingzhuang",
      "pla-13th-preliminary-songzhuang",
      "pla-6th-preliminary-pengzhuang",
      "pla-8th-east-fix-youfang",
      "pla-9th-southeast-advance"
    ],
    0.16,
    0.15
  );
  await expectRouteVisibleWithUnit(page, "pla-encirclement-ring");
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expectNianzhuangNoResultSpoilers(page);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "huang-deploy-north",
    "huang-deploy-east",
    "huang-deploy-south",
    "huang-deploy-west",
    "huang-xinan-west-withdrawal"
  ]);
  await expectNianzhuangMapFocus(page, "nianzhuangPocket");

  await jumpToEventByName(page, /大许家阻援线钉住东援/);
  await expectNianzhuangStageInView(page);
  await expectRouteVisible(page, "xuzhou-relief-east");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="xuzhou-relief-east"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisibleWithUnit(page, "xuzhou-relief-second-thrust");
  await expectRouteVisibleWithUnit(page, "xuzhou-relief-contained");
  await expectRouteVisibleWithUnit(page, "pla-relief-block-line");
  await expectRouteVisibleWithUnit(page, "pla-relief-depth-line");
  await expectRouteVisibleWithUnit(page, "pla-relief-lateral-seal");
  await expectRouteVisibleWithUnit(page, "pla-relief-counterpush");
  await expect(page.getByTestId("nianzhuang-effect-relief-blocked")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-relief-depth-blocked")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-relief-block-note")).toContainText("两层阻援带");
  await expectNianzhuangRoutesMakeContact(page, "pla-relief-block-line", "xuzhou-relief-second-thrust", 190);
  await expectNianzhuangRoutesMakeContact(page, "pla-relief-depth-line", "xuzhou-relief-second-thrust", 190);
  await expectNianzhuangRoutesMakeContact(page, "pla-relief-counterpush", "xuzhou-relief-contained", 170);
  await expectRoutesUseReadableBattleArea(
    page,
    ".nianzhuang-battle",
    ["xuzhou-relief-east", "xuzhou-relief-second-thrust", "pla-relief-block-line", "pla-relief-depth-line"],
    0.14,
    0.18
  );
  await expectNianzhuangRouteStopsWestOf(page, "xuzhou-relief-second-thrust", "nianzhuang");
  await expectNianzhuangNoResultSpoilers(page);

  await jumpToEventByName(page, /对壕近迫开始/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangInnerDefense(page);
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expect(page.getByTestId("nianzhuang-west-trench-line")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-east-water-ditch-line")).toBeVisible();
  for (const routeId of ["pla-west-trench-approach", "pla-north-trench-approach", "pla-south-trench-approach", "pla-east-trench-approach"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectNianzhuangRouteAnchorHighlighted(page, "pla-west-trench-approach");
  await expectNianzhuangRouteAnchorHighlighted(page, "pla-east-trench-approach");
  await expect(page.getByTestId("nianzhuang-trench-note")).toContainText("纵横壕沟近迫");
  await expectNianzhuangNoResultSpoilers(page);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["pla-general-assault-west"]);
  await jumpNianzhuangTimelineTo(page, "1948-11-15T19:00");
  await expectRouteVisibleWithUnit(page, "huang-west-counterpush");
  await expectRouteVisibleWithUnit(page, "pla-west-yield-and-hold");
  await expect(page.getByTestId("nianzhuang-west-tug-note")).toContainText("反扑-稳住-再压回");
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-17T12:00");
  await expectRouteVisibleWithUnit(page, "pla-west-counterpress");
  await expectRouteVisible(page, "huang-east-counterpush");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-east-counterpush"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisibleWithUnit(page, "pla-east-counterpress");
  await expect(page.getByTestId("nianzhuang-east-tug-note")).toContainText("东侧水沟拉锯");
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expectNianzhuangNoResultSpoilers(page);

  await jumpToEventByName(page, /粟裕下达总攻令/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangMapFocus(page, "nianzhuangBreakthrough");
  await expectNianzhuangLocalBattlefieldSpread(
    page,
    ["huang-nianzhuang-defense-ring", "pla-west-trench-approach", "pla-north-trench-approach", "pla-east-trench-approach"],
    0.3,
    0.36
  );
  await expectRouteVisibleWithUnit(page, "pla-artillery-zhoujiazhai");
  for (const routeId of ["pla-west-trench-approach", "pla-north-trench-approach", "pla-south-trench-approach", "pla-east-trench-approach"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectRouteVisibleWithUnit(page, "huang-nianzhuang-defense-ring");
  await expect(page.getByTestId("nianzhuang-effect-general-assault")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-assault-axis-note")).toContainText("华野5个纵队四面向心突击");
  await expectNianzhuangNoResultSpoilers(page);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "pla-general-assault-northeast",
    "pla-general-assault-southeast",
    "pla-second-wall-west",
    "pla-second-wall-north",
    "pla-second-wall-south",
    "pla-second-wall-east"
  ]);
  await expectNianzhuangLocalBattlefieldSpread(
    page,
    [
      "huang-nianzhuang-defense-ring",
      "pla-west-trench-approach",
      "pla-north-trench-approach",
      "pla-south-trench-approach",
      "pla-east-trench-approach"
    ],
    0.3,
    0.42
  );

  await jumpToEventByName(page, /第一道围墙被突破/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangMapFocus(page, "nianzhuangSecondWall");
  await expectNianzhuangInnerDefense(page);
  await expectNianzhuangFragmentedOuterDefense(page);
  await expectRouteVisibleWithUnit(page, "huang-inner-recoil");
  await expectRouteVisibleWithUnit(page, "huang-north-fragment-recoil");
  await expectRouteVisibleWithUnit(page, "huang-east-fragment-recoil");
  await expectRouteVisibleWithUnit(page, "huang-south-fragment-recoil");
  await expectRouteVisibleWithUnit(page, "pla-general-assault-west");
  await expectNianzhuangRouteAnchorHighlighted(page, "pla-general-assault-west");
  for (const routeId of [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "pla-general-assault-northeast",
    "pla-general-assault-southeast"
  ]) {
    await expect(page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`)).not.toHaveAttribute("data-route-to", "inner-pocket");
  }
  await expectRouteTransitionPhase(page, "huang-nianzhuang-defense-ring", "exiting");
  await expectFortifiedLineTransitionPhase(page, "outer-defense", "exiting");
  await expect(page.getByTestId("nianzhuang-effect-first-line")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-north-fragment")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-east-fragment")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-south-fragment")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-night-breakthrough-note")).toContainText("夜战破口仍有反扑");
  await expectNianzhuangNoResultSpoilers(page);
  await expectVisibleUnitsUseReadableBattleArea(
    page,
    ".nianzhuang-battle",
    ["huang-inner-recoil", "huang-north-fragment-recoil", "huang-east-fragment-recoil", "huang-south-fragment-recoil"],
    0.12,
    0.24
  );
  await jumpNianzhuangTimelineTo(page, "1948-11-19T23:30");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["huang-nianzhuang-defense-ring"]);
  await expect(page.getByTestId("fortified-line-outer-defense")).toHaveCount(0);
  await jumpNianzhuangTimelineTo(page, "1948-11-20T01:30");
  await expectRouteVisibleWithUnit(page, "huang-east-night-counterattack");
  await jumpNianzhuangTimelineTo(page, "1948-11-20T02:00");
  await expectNianzhuangMapFocus(page, "nianzhuangSecondWall");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "xuzhou-relief-east",
    "xuzhou-relief-second-thrust",
    "xuzhou-relief-contained",
    "pla-relief-block-line",
    "pla-relief-depth-line",
    "pla-relief-counterpush"
  ]);
  for (const routeId of ["pla-second-wall-west", "pla-second-wall-north", "pla-second-wall-south", "pla-second-wall-east"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectNianzhuangRouteAnchorHighlighted(page, "pla-second-wall-east");
  await expectRouteVisible(page, "huang-west-night-counterattack");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-west-night-counterattack"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisibleWithUnit(page, "pla-west-night-counterpress");
  await expectRouteVisibleWithUnit(page, "huang-east-night-counterattack");
  await expectRouteVisibleWithUnit(page, "pla-east-night-counterpress");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-final-compression-ring",
    "pla-final-compression-east",
    "pla-final-compression-south",
    "pla-final-compression-west",
    "huang-east-remnant-defense",
    "huang-final-north-collapse",
    "huang-final-east-collapse",
    "huang-final-south-collapse"
  ]);
  await expectNianzhuangNoResultSpoilers(page);

  await jumpToEventByName(page, /第二道围墙被突破/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangMapFocus(page, "nianzhuangSecondWall");
  await expect(page.getByTestId("current-date")).toContainText("1948年11月20日 03:30");
  await expectNianzhuangLocalBattlefieldSpread(
    page,
    ["pla-second-wall-west", "pla-second-wall-north", "pla-second-wall-south", "pla-second-wall-east", "huang-final-core-defense"],
    0.18,
    0.22
  );
  await expectNianzhuangFinalCoreDefense(page);
  await expectNianzhuangFragmentedSecondDefense(page);
  for (const routeId of ["pla-second-wall-west", "pla-second-wall-north", "pla-second-wall-south", "pla-second-wall-east"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectNianzhuangNoResultSpoilers(page);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "huang-nianzhuang-defense-ring",
    "pla-west-trench-approach",
    "pla-north-trench-approach",
    "pla-south-trench-approach",
    "pla-east-trench-approach",
    "pla-4th-preliminary-daxingzhuang",
    "pla-13th-preliminary-songzhuang",
    "pla-6th-preliminary-pengzhuang"
  ]);

  await jumpNianzhuangTimelineTo(page, "1948-11-20T03:45");
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectNianzhuangNoResultSpoilers(page);

  await jumpNianzhuangTimelineTo(page, "1948-11-20T04:30");
  await expectNianzhuangMapFocus(page, "nianzhuangSecondWall");
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectRouteBadgeLabels(page, "pla-final-compression-ring", ["突", "炮", "封"]);
  for (const routeId of ["pla-final-compression-ring", "pla-final-compression-east", "pla-final-compression-south", "pla-final-compression-west"]) {
    await expectRouteVisibleWithUnit(page, routeId);
  }
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "huang-east-remnant-defense",
    "huang-final-north-collapse",
    "huang-final-east-collapse",
    "huang-final-south-collapse",
    "pla-remnant-mop-up-east"
  ]);
  await expectNianzhuangNoResultSpoilers(page);
  await expectNianzhuangLocalBattlefieldSpread(
    page,
    ["pla-final-compression-ring", "pla-final-compression-east", "pla-final-compression-south", "pla-final-compression-west"],
    0.15,
    0.24
  );

  await jumpNianzhuangTimelineTo(page, "1948-11-20T18:00");
  await expectNianzhuangMapFocus(page, "nianzhuangFinal");
  await expectNianzhuangFragmentedFinalCore(page);
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-east");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-north");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-north");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-east");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-west");
  await expectNianzhuangNoResultSpoilers(page);
  for (const routeId of ["huang-final-core-defense", "huang-second-wall-collapse"]) {
    await expectRouteVisible(page, routeId);
    await expect(page.locator(`.nianzhuang-battle .front-line[data-route-id="${routeId}"]`)).toHaveAttribute("data-unit-visible", "true");
  }
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-second-wall-west",
    "pla-second-wall-north",
    "pla-second-wall-south",
    "pla-second-wall-east",
    "pla-final-compression-ring",
    "pla-final-compression-east",
    "pla-final-compression-south",
    "pla-final-compression-west",
    "huang-final-north-collapse",
    "huang-final-east-collapse",
    "huang-final-south-collapse",
    "huang-east-remnant-defense"
  ]);
  await expectNianzhuangLocalBattlefieldSpread(
    page,
    [
      "huang-remnant-fallback-east",
      "huang-remnant-fallback-north",
      "huang-remnant-fallback-south",
      "pla-remnant-mop-up-north",
      "pla-remnant-mop-up-east",
      "pla-remnant-mop-up-south",
      "pla-remnant-mop-up-west"
    ],
    0.16,
    0.24
  );

  await jumpToEventByName(page, /内圩核心失守/);
  await expectNianzhuangStageInView(page);
  await expectNianzhuangMapFocus(page, "nianzhuangFinal");
  await expect(page.getByTestId("current-date")).toContainText("1948年11月20日 05:30");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-north");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-east");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-west");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-east");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-north");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-south");
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectRouteVisible(page, "xuzhou-relief-east");
  await expectRouteVisibleWithUnit(page, "xuzhou-relief-contained");
  await expectRouteVisibleWithUnit(page, "pla-relief-depth-line");
  await expectRouteVisibleWithUnit(page, "pla-relief-counterpush");
  await expectNianzhuangRouteStopsWestOf(page, "xuzhou-relief-contained", "nianzhuang");
  await expect(page.getByTestId("nianzhuang-effect-final-pocket")).toBeVisible();
  await expectNianzhuangNoResultSpoilers(page);
  await expectRouteTransitionPhase(page, "pla-second-wall-west", "exiting");
  await expectRouteTransitionPhase(page, "pla-second-wall-north", "exiting");
  await expectRouteTransitionPhase(page, "pla-final-compression-ring", "present");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-general-assault-west",
    "pla-general-assault-north",
    "pla-general-assault-south",
    "pla-general-assault-east",
    "huang-east-remnant-defense"
  ]);
  await jumpNianzhuangTimelineTo(page, "1948-11-20T08:00");
  await expectRouteVisibleWithUnit(page, "huang-final-core-defense");
  await expectRouteVisibleWithUnit(page, "huang-second-wall-collapse");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-east");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-north");
  await expectRouteVisibleWithUnit(page, "huang-remnant-fallback-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-east");
  await expectNianzhuangRoutesMakeContact(page, "pla-remnant-mop-up-east", "huang-remnant-fallback-east", 180);
  await expectNianzhuangRoutesMakeContact(page, "pla-remnant-mop-up-north", "huang-remnant-fallback-north", 190);
  await expectNianzhuangRoutesMakeContact(page, "pla-remnant-mop-up-south", "huang-remnant-fallback-south", 190);
  await expectNianzhuangRouteHeadDotsRemoved(page);
  await expectNianzhuangFormationDotsRemoved(page);
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "pla-second-wall-west",
    "pla-second-wall-north",
    "pla-second-wall-south",
    "pla-second-wall-east",
    "pla-final-compression-ring",
    "pla-final-compression-east",
    "pla-final-compression-south",
    "pla-final-compression-west",
    "huang-east-remnant-defense"
  ]);
  await jumpNianzhuangTimelineTo(page, "1948-11-21T12:00");
  await expectNianzhuangMapFocus(page, "nianzhuangFinal");
  await expectRouteVisibleWithUnit(page, "huang-east-remnant-defense");
  await expectRouteVisible(page, "huang-remnant-fallback-east");
  await expectRouteVisibleWithUnit(page, "huang-north-remnant-sortie");
  await expectRouteVisibleWithUnit(page, "pla-north-remnant-counterpress");
  await expect(page.getByTestId("nianzhuang-remnant-tug-note")).toContainText("残点清剿不是单向推进");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-north");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-east");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-west");
  await expectNianzhuangRoutesMakeContact(page, "pla-remnant-mop-up-east", "huang-east-remnant-defense", 210);
  await expectNianzhuangFormationDotsRemoved(page);
  await expectRouteBadgeLabels(page, "pla-remnant-mop-up-east", ["突", "炮", "封"]);
  await expectRouteBadgeLabels(page, "pla-remnant-mop-up-west", ["封", "突", "炮"]);
  await expectRouteBadgeLabels(page, "huang-east-remnant-defense", ["64", "25", "159", "44", "100", "黄"]);
  await expectNianzhuangRouteAnchorHighlighted(page, "huang-east-remnant-defense");
  await expect(page.getByTestId("nianzhuang-effect-remnant-village")).toBeVisible();
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", [
    "huang-final-north-collapse",
    "huang-final-east-collapse",
    "huang-final-south-collapse"
  ]);
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-21T20:00");
  await expectRouteVisibleWithUnit(page, "huang-south-remnant-sortie");
  await expectRenderedRoutesExclude(page, ".nianzhuang-battle", ["pla-south-remnant-counterpress"]);
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-21T22:10");
  await expectRouteVisibleWithUnit(page, "huang-south-remnant-sortie");
  await expectRouteVisibleWithUnit(page, "pla-south-remnant-counterpress");
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-22T06:00");
  await expectRouteVisible(page, "huang-south-remnant-sortie");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-south-remnant-sortie"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisibleWithUnit(page, "pla-south-remnant-counterpress");
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-22T17:00");
  await expectNianzhuangMapFocus(page, "nianzhuangFinal");
  await expectRouteVisibleWithUnit(page, "huang-east-remnant-defense");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-north");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-east");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-south");
  await expectRouteVisibleWithUnit(page, "pla-remnant-mop-up-west");
  await expectRouteVisibleWithUnit(page, "huang-final-north-collapse");
  await expectRouteVisibleWithUnit(page, "huang-final-east-collapse");
  await expectRouteVisibleWithUnit(page, "huang-final-south-collapse");
  await expectRouteVisibleWithUnit(page, "huang-nizhuang-final-flight");
  await expectRouteVisibleWithUnit(page, "pla-nizhuang-pursuit");
  await expect(page.getByTestId("nianzhuang-effect-north-destruction")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-east-destruction")).toBeVisible();
  await expect(page.getByTestId("nianzhuang-effect-south-destruction")).toBeVisible();
  await expectNianzhuangNoResultSpoilers(page);
  await jumpNianzhuangTimelineTo(page, "1948-11-22T18:10");
  await expectRouteVisible(page, "huang-final-north-collapse");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-final-north-collapse"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisible(page, "huang-final-east-collapse");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-final-east-collapse"]')).toHaveAttribute("data-unit-visible", "false");
  await expectRouteVisible(page, "huang-final-south-collapse");
  await expect(page.locator('.nianzhuang-battle .front-line[data-route-id="huang-final-south-collapse"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.getByTestId("nianzhuang-destruction-site-25")).toContainText("25军残部被歼地");
  await expect(page.getByTestId("nianzhuang-destruction-site-64")).toContainText("64军残部被歼地");
  await expect(page.getByTestId("nianzhuang-destruction-site-44-100")).toContainText("44/100军残部被歼地");
  await expect(page.getByTestId("nianzhuang-huang-death-site")).toContainText("黄百韬自戕地点");
  await jumpToEventByName(page, /倪庄终局/);
  await expectNianzhuangStageInView(page);
  await expectRouteVisible(page, "huang-nizhuang-final-flight");
  await expectRouteVisibleWithUnit(page, "pla-nizhuang-pursuit");
  await expect(page.getByTestId("map-point-nizhuang")).toContainText("倪庄");
  await expect(page.getByTestId("nianzhuang-destruction-site-25")).toContainText("25军残部被歼地");
  await expect(page.getByTestId("nianzhuang-destruction-site-64")).toContainText("64军残部被歼地");
  await expect(page.getByTestId("nianzhuang-destruction-site-44-100")).toContainText("44/100军残部被歼地");
  await expect(page.getByTestId("nianzhuang-destruction-site-command")).toContainText("兵团部终局点");
  await expect(page.getByTestId("nianzhuang-huang-death-site")).toContainText("黄百韬自戕地点");
  await expect(page.locator(".nianzhuang-battle .ww2-aircraft-marker")).toHaveCount(0);
  await expect(page.locator(".nianzhuang-battle .fighter-marker")).toHaveCount(0);
  await expect(page.locator(".nianzhuang-battle .carrier-marker")).toHaveCount(0);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("gulf war animation uses compressed modern armored pacing", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "gulf");
  await expect(page.getByTestId("gulf-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "1991年第一次海湾战争" })).toBeVisible();
  await expectScoreUsesMusic(page, "/audio/wikimedia-holst-uranus.ogg");
  await expectOnlyWarNameInMapTitle(page, "1991年第一次海湾战争");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 科威特危机");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /沙漠风暴空袭开始/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("沙漠风暴空袭开始");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/airplane-in-flight.mp3")).toBeGreaterThan(0);
  await expect(page.getByTestId("explosion-burst").first()).toBeVisible();
  await expectRealisticUnitIcon(page, "fighter-marker", "fighter");
  await expectUnitIconFacesRoute(page, "strategic-air-war", "-1", "-1");
  const airStrikeRoute = page.locator('.front-line[data-route-id="strategic-air-war"]');
  await expect(airStrikeRoute).toHaveClass(/route-air/);
  await expect(airStrikeRoute.getByTestId("fighter-marker")).toBeVisible();
  await expect(airStrikeRoute.getByTestId("tank-marker")).toHaveCount(0);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /地面战开始/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("地面战开始");
  await expectRealisticUnitIcon(page, "tank-marker", "tank");
  await expectRouteBadgeLabels(page, "iraq-kuwait-invasion", ["伊"]);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /西翼左勾拳展开/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("西翼左勾拳展开");
  await expectUnitIconFacesRoute(page, "left-hook", "-1", "1");
  await expectRouteBadgeLabels(page, "left-hook", ["联"]);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /80号公路撤退遭打击/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("80号公路撤退遭打击");
  await expectUnitIconFacesRoute(page, "highway-80-retreat", "-1", "1");
  await expectCurrentEventInsideMapCore(page);

  const shieldPosition = await eventRailPositionByTitle(page, /沙漠盾牌部署/);
  const airWarPosition = await eventRailPositionByTitle(page, /沙漠风暴空袭开始/);
  const khafjiPosition = await eventRailPositionByTitle(page, /海夫吉战斗/);
  expect(airWarPosition - shieldPosition).toBeLessThan(8);
  expect(khafjiPosition - airWarPosition).toBeGreaterThan(20);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("停火生效");
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("tsushima battle uses close strait viewport and hourly naval pacing", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "tsushima");
  await expect(page.getByTestId("tsushima-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "日俄对马海战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "日俄对马海战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expect(page.getByTestId("current-date")).toContainText("1905年5月27日 12:00");
  await expect(page.locator('.front-line[data-route-id="russian-night-approach"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="russian-night-approach"]').getByTestId("warship-marker")).toHaveCount(4);
  await expect(page.locator('.front-line[data-route-id="japanese-sortie-sasebo"]')).toBeVisible();
  await expectMapPointsHidden(page, ".tsushima-battle", [
    "togo-turn",
    "first-battle",
    "second-battle",
    "night-attack",
    "takeshima"
  ]);
  await expectVisibleTsushimaFleetRoutes(page, ["russian-night-approach", "japanese-sortie-sasebo"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectScoreUsesMusic(page, "/audio/wikimedia-hands-across-the-sea.ogg");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);

  await expect(page.locator(".terrain-layer .sea-zone")).toHaveCount(0);
  await expect(page.locator(".region-labels")).toContainText("朝鲜半岛");
  await expect(page.locator(".region-labels")).toContainText("对马海峡");
  await expect(page.locator(".region-labels")).toContainText("九州");
  await expect(page.locator(".region-labels")).not.toContainText("TSUSHIMA STRAIT");
  const russianBadges = page.locator('.front-line[data-route-id="russian-night-approach"]').getByTestId("unit-faction-badge-germany");
  const japaneseBadges = page.locator('.front-line[data-route-id="japanese-sortie-sasebo"]').getByTestId("unit-faction-badge-allies");
  await expect(russianBadges).toHaveCount(4);
  await expect(japaneseBadges).toHaveCount(4);
  expect(await russianBadges.evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-badge-label")))).toEqual([
    "俄",
    "俄",
    "俄",
    "俄"
  ]);
  expect(await japaneseBadges.evaluateAll((badges) => badges.map((badge) => badge.getAttribute("data-badge-label")))).toEqual([
    "日",
    "日",
    "日",
    "日"
  ]);
  for (const shipName of ["三笠", "敷岛", "富士", "朝日", "苏沃洛夫", "奥斯利亚比亚", "亚历山大三世", "博罗季诺"] as const) {
    await expect(page.locator(".tsushima-battle .formation-unit-label", { hasText: shipName }).first()).toBeVisible();
  }
  await expect(page.locator(".tsushima-battle .formation-unit").filter({ hasText: /三笠|敷岛|富士|朝日/ })).toHaveCount(4);
  await expect(page.locator(".tsushima-battle .formation-unit").filter({ hasText: /苏沃洛夫|奥斯利亚比亚|亚历山大三世|博罗季诺/ })).toHaveCount(4);
  const initialRussianFormation = await formationUnitCenters(page, "russian-night-approach");
  expectFormationHasTravelSpread(initialRussianFormation, "y", 44);
  expectLeadShipIsMostForward(initialRussianFormation, "苏沃洛夫", "y", "lower");
  const initialRussianAlongOffsets = await page
    .locator('.front-line[data-route-id="russian-night-approach"] .formation-unit')
    .evaluateAll((units) => units.map((unit) => Number(unit.getAttribute("data-unit-offset-along"))));
  expect(initialRussianAlongOffsets).toEqual([0, 0, -62, -62]);
  await setTimeline(page, 50);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "russian-night-approach"), 0.4);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "japanese-sortie-sasebo"), 0.3);
  await setTimeline(page, 0);
  await expectUnitMarkersDoNotAnimate(page);
  await expect(page.getByTestId("event-list")).toContainText("东乡回头转向截断航路");
  await expect(page.getByTestId("event-list")).toContainText("第二合战：日军再横切北逃舰列");

  await page.getByTestId("event-list").getByRole("button", { name: /东乡回头转向截断航路/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("东乡回头转向截断航路");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("map-point-togo-turn")).toBeVisible();
  await expectMapPointsHidden(page, ".tsushima-battle", ["first-battle", "second-battle", "night-attack", "takeshima"]);
  const togoTurnGeometry = await page.evaluate(() => {
    const routePoint = (routeId: string) => {
      const transform = document
        .querySelector(`.front-line[data-route-id="${routeId}"] .unit-icon-orientation`)
        ?.getAttribute("transform");
      const match = transform?.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\)/);
      return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
    };
    return {
      japanese: routePoint("togo-loop-turn"),
      russian: routePoint("russian-column-north")
    };
  });
  expect(togoTurnGeometry.japanese).not.toBeNull();
  expect(togoTurnGeometry.russian).not.toBeNull();
  expect(togoTurnGeometry.russian!.x).toBeLessThan(togoTurnGeometry.japanese!.x - 60);
  expect(togoTurnGeometry.russian!.y).toBeGreaterThan(togoTurnGeometry.japanese!.y + 18);
  await expectUnitIconFacesRoute(page, "togo-loop-turn", "-1", "-1");
  await expectVisibleTsushimaFleetRoutes(page, ["russian-column-north", "togo-loop-turn"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectUnitMarkersDoNotAnimate(page);
  await expectActiveRoutePromptHasSmallPulse(page, "togo-loop-turn");

  await page.getByTestId("event-list").getByRole("button", { name: /第一合战：T字炮火压前导/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("第一合战：T字炮火压前导");
  await expectCurrentEventInsideMapCore(page);
  await expectRealisticUnitIcon(page, "warship-marker", "warship");
  await expectTsushimaWarshipScale(page);
  await expectUnitIconFacesRoute(page, "crossing-the-t", "-1", "-1");
  await expect(page.locator('.front-line[data-route-id="crossing-the-t"]')).toHaveClass(/route-sea/);
  await expect(page.locator('.front-line[data-route-id="togo-loop-turn"]')).toHaveAttribute("data-route-to", "togo-turn");
  await expect(page.getByTestId("map-point-tsushima")).toBeVisible();
  await expect(page.getByTestId("map-point-first-battle")).toBeVisible();
  await expectMapPointsHidden(page, ".tsushima-battle", ["second-battle", "night-attack", "takeshima"]);
  await expect(page.locator(".region-labels")).toContainText("对马海峡");
  await expect(page.getByTestId("tsushima-first-crossing-salvo")).toBeVisible();
  await expect(page.getByTestId("tsushima-first-crossing-salvo").locator(".salvo-shell-trace")).toHaveCount(4);
  await expect(page.getByTestId("tsushima-first-crossing-salvo").locator(".salvo-impact")).toHaveCount(4);
  await expectVisibleTsushimaFleetRoutes(page, ["crossing-the-t", "russian-flagship-chaos"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectUnitMarkersDoNotAnimate(page);

  await page.getByTestId("event-list").getByRole("button", { name: /奥斯利亚比亚沉没、苏沃洛夫号失控/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("奥斯利亚比亚沉没、苏沃洛夫号失控");
  const reorderedRussianFormation = await formationUnitCenters(page, "russian-flagship-chaos");
  expect(reorderedRussianFormation.map((unit) => unit.label)).toEqual(["亚历山大三世", "博罗季诺", "鹰号", "尼古拉一世"]);
  expectFormationHasTravelSpread(reorderedRussianFormation, "y", 120);
  expectLeadShipIsMostForward(reorderedRussianFormation, "亚历山大三世", "y", "lower");
  const reorderedAlongOffsets = await page
    .locator('.front-line[data-route-id="russian-flagship-chaos"] .formation-unit')
    .evaluateAll((units) => units.map((unit) => Number(unit.getAttribute("data-unit-offset-along"))));
  expect(reorderedAlongOffsets).toEqual([0, -58, -116, -174]);
  await expect(page.locator(".tsushima-battle .formation-unit", { hasText: "苏沃洛夫" })).toHaveCount(0);
  await expect(page.locator(".tsushima-battle .formation-unit", { hasText: "奥斯利亚比亚" })).toHaveCount(0);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "russian-flagship-chaos"), 0.12);
  await expectVisibleTsushimaFleetRoutes(page, ["russian-flagship-chaos"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectUnitMarkersDoNotAnimate(page);

  await page.getByTestId("event-list").getByRole("button", { name: /第二合战：日军再横切北逃舰列/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("第二合战：日军再横切北逃舰列");
  await expectCurrentEventInsideMapCore(page);
  await expectUnitIconFacesRoute(page, "japanese-second-turn", "-1", "-1");
  await expect(page.getByTestId("tsushima-second-crossing-salvo")).toBeVisible();
  await expect(page.getByTestId("tsushima-second-crossing-salvo").locator(".salvo-shell-trace")).toHaveCount(4);
  await expect(page.getByTestId("tsushima-second-crossing-salvo").locator(".salvo-impact")).toHaveCount(4);
  await expectVisibleTsushimaFleetRoutes(page, ["japanese-second-turn", "russian-breakout-scatter"]);
  await expectTsushimaRoutesStayOffLand(page);

  await page.getByTestId("event-list").getByRole("button", { name: /夜战雷击与追击/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("夜战雷击与追击");
  await expectVisibleTsushimaFleetRoutes(page, ["torpedo-night-attack"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /俄舰残部投降/ }).click();
  await expect(page.locator('.front-line[data-route-id="japanese-dawn-envelopment"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="russian-remnants-surrender"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.front-line[data-route-id="russian-remnants-surrender"]').getByTestId("warship-marker")).toHaveCount(0);
  await expectVisibleTsushimaFleetRoutes(page, ["japanese-dawn-envelopment"]);
  await expectTsushimaRoutesStayOffLand(page);
  const retainedRouteStates = await page
    .locator(".tsushima-battle .front-line")
    .evaluateAll((routes) => routes.map((route) => route.getAttribute("data-route-state")));
  expect(retainedRouteStates.filter((state) => state === "is-complete").length).toBeGreaterThanOrEqual(9);
  for (const routeLabel of [
    "东乡回头转向抢占前方",
    "第一合战：横切俄前导",
    "第二合战：再横切北逃舰列",
    "夜战：驱逐舰与鱼雷艇夹击"
  ] as const) {
    await expect(page.locator(".tsushima-battle .line-label", { hasText: routeLabel }).first()).toBeVisible();
  }
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("guadalcanal naval battle emphasizes radar night action", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "guadalcanal");
  await expect(page.getByTestId("guadalcanal-naval-app")).toBeVisible();
  await expect(page.getByTestId("map-title-card").getByRole("heading", { name: "第二次瓜岛海战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "第二次瓜岛海战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expect(page.getByTestId("current-date")).toContainText("1942年11月14日 22:30");
  await expectScoreUsesMusic(page, "/audio/wikimedia-anchors-aweigh-2009.oga");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expect(page.locator(".region-labels")).toContainText("铁底湾");
  await expectMapPointsHidden(page, ".guadalcanal-naval-battle", [
    "south-dakota-blackout",
    "washington-radar-firing",
    "kirishima-hit",
    "american-west-sound",
    "japanese-north-savo",
    "japanese-retreat"
  ]);
  await expectVisibleFleetRoutes(page, ".guadalcanal-naval-battle", ["japanese-approach-slot", "american-battleships-enter"]);
  await expectNavalRoutesStayOffLand(page, ".guadalcanal-naval-battle");
  await expectWarshipScale(page, ".guadalcanal-naval-battle", 0.5);
  await expectRouteHasPolylineComplexity(page, ".guadalcanal-naval-battle", "japanese-approach-slot", 3);
  await expect(page.locator(".guadalcanal-naval-battle .formation-unit", { hasText: "华盛顿号" })).toBeVisible();
  await expect(page.locator(".guadalcanal-naval-battle .formation-unit", { hasText: "雾岛号" })).toBeVisible();
  await setTimeline(page, 140);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "japanese-approach-slot"), 0.5);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "american-battleships-enter"), 0.5);
  await setTimeline(page, 0);
  await expectUnitMarkersDoNotAnimate(page);

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /日军撤退，铁底湾夜战结束/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("撤退");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);

  await page.getByTestId("event-list").getByRole("button", { name: /华盛顿号用雷达火控锁定雾岛号/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("雷达火控");
  await expect(page.getByTestId("map-point-japanese-north-savo")).toBeVisible();
  await expect(page.getByTestId("map-point-washington-radar-firing")).toBeVisible();
  await expect(page.getByTestId("map-point-kirishima-hit")).toBeVisible();
  await expect(page.getByTestId("guadalcanal-radar-salvo")).toBeVisible();
  await expect(page.getByTestId("guadalcanal-radar-salvo").locator(".salvo-shell-trace")).toHaveCount(4);
  await expect(page.getByTestId("guadalcanal-radar-salvo").locator(".salvo-impact")).toHaveCount(4);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(1);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);
  await expectVisibleFleetRoutes(page, ".guadalcanal-naval-battle", ["south-dakota-exposed", "washington-radar-attack", "kirishima-disabled"]);
  await expectNavalRoutesStayOffLand(page, ".guadalcanal-naval-battle");
  await expectCurrentEventInsideMapCore(page);

  const combatCueCount = await countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /日军撤退，铁底湾夜战结束/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("撤退");
  await expect(page.getByTestId("map-point-japanese-retreat")).toBeVisible();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(combatCueCount);
  await expectVisibleFleetRoutes(page, ".guadalcanal-naval-battle", ["japanese-withdrawal"]);
  await expectNavalRoutesStayOffLand(page, ".guadalcanal-naval-battle");
  await expectCurrentEventInsideMapCore(page);
  await setTimeline(page, 520);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "japanese-withdrawal"), 0.12);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("jutland battle shows fleet deployment and battle turns", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "jutland");
  await expect(page.getByTestId("jutland-app")).toBeVisible();
  await expect(page.getByTestId("map-title-card").getByRole("heading", { name: "日德兰海战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "日德兰海战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expect(page.getByTestId("current-date")).toContainText("1916年5月31日 14:20");
  await expectScoreUsesMusic(page, "/audio/wikimedia-eternal-father-instrumental.ogg");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expect(page.locator(".region-labels")).toContainText("北海");
  await expectMapPointsHidden(page, ".jutland-battle", [
    "contact-zone",
    "run-south-start",
    "queen-mary-loss",
    "run-north-turn",
    "high-seas-offshore",
    "grand-fleet-north-approach",
    "grand-fleet-offshore",
    "grand-fleet-deployment",
    "crossing-t-zone",
    "scheer-first-turn",
    "death-ride",
    "night-escape"
  ]);
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "beatty-scouting-east",
    "hipper-scouting-west",
    "high-seas-fleet-north",
    "grand-fleet-approach"
  ]);
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expectWarshipScale(page, ".jutland-battle", 0.5);
  await expectRouteHasPolylineComplexity(page, ".jutland-battle", "beatty-scouting-east", 4);
  await expect(page.locator(".jutland-battle .formation-unit", { hasText: "狮号" })).toBeVisible();
  await expect(page.locator(".jutland-battle .formation-unit", { hasText: "吕措夫号" })).toBeVisible();
  await expect(page.locator(".jutland-battle .front-line[data-route-id='grand-fleet-approach'] .formation-unit", { hasText: "铁公爵号" })).toBeVisible();
  await expectUnitMarkersDoNotAnimate(page);
  const initialGrandFleet = await formationUnitCenters(page, "grand-fleet-approach");
  const initialHipperScouts = await formationUnitCenters(page, "hipper-scouting-west");
  const initialBeattyScouts = await formationUnitCenters(page, "beatty-scouting-east");
  expect(formationDistance(initialGrandFleet, initialHipperScouts)).toBeGreaterThan(250);
  expect(formationDistance(initialGrandFleet, initialBeattyScouts)).toBeGreaterThan(185);
  await setJutlandTimelineDate(page, "1916-05-31T15:50");
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "run-to-the-south",
    "beatty-south-pursuit",
    "high-seas-fleet-north",
    "grand-fleet-approach"
  ]);
  const focusTransitionOffsetScale = await page.getByTestId("camera-layer").getAttribute("data-formation-offset-scale");
  expect(Number(focusTransitionOffsetScale)).toBeLessThan(0.82);
  const beattyEnteringRunSouth = await formationUnitCenters(page, "beatty-south-pursuit");
  expect(formationBounds(beattyEnteringRunSouth).yMax - formationBounds(beattyEnteringRunSouth).yMin).toBeLessThan(56);
  await setJutlandTimelineDate(page, "1916-05-31T15:55");
  const beattyEarlySouth = await formationUnitCenters(page, "beatty-south-pursuit");
  const hipperEarlySouth = await formationUnitCenters(page, "run-to-the-south");
  const beattyEarlySouthCenter = formationCenter(beattyEarlySouth);
  const hipperEarlySouthCenter = formationCenter(hipperEarlySouth);
  expect(beattyEarlySouthCenter.x).toBeGreaterThan(hipperEarlySouthCenter.x - 120);
  expect(beattyEarlySouthCenter.y).toBeGreaterThan(hipperEarlySouthCenter.y - 65);
  expect(formationDistance(beattyEarlySouth, hipperEarlySouth)).toBeLessThan(230);
  expect(formationBounds(beattyEarlySouth).yMax - formationBounds(beattyEarlySouth).yMin).toBeLessThan(80);
  await setJutlandTimelineDate(page, "1916-05-31T16:00", "before");
  const grandFleetBeforeClosing = await formationUnitCenters(page, "grand-fleet-approach");
  await setJutlandTimelineDate(page, "1916-05-31T16:00", "after");
  const grandFleetAfterFirstHandoff = await formationUnitCenters(page, "grand-fleet-closing");
  expect(formationDistance(grandFleetBeforeClosing, grandFleetAfterFirstHandoff)).toBeLessThan(90);
  await setJutlandTimelineDate(page, "1916-05-31T18:15", "before");
  const grandFleetBeforeDeploy = await formationUnitCenters(page, "grand-fleet-closing");
  await setJutlandTimelineDate(page, "1916-05-31T18:15", "after");
  const grandFleetAfterDeploy = await formationUnitCenters(page, "grand-fleet-deploys");
  expect(formationDistance(grandFleetBeforeDeploy, grandFleetAfterDeploy)).toBeLessThan(90);
  await setJutlandTimelineDate(page, "1916-05-31T16:40", "before");
  const beattyBeforeNorthTurn = await formationUnitCenters(page, "beatty-south-pursuit");
  await setJutlandTimelineDate(page, "1916-05-31T16:35", "before");
  const hipperBeforeRejoin = await formationUnitCenters(page, "run-to-the-south");
  await setJutlandTimelineDate(page, "1916-05-31T16:35", "after");
  const hipperAfterRejoin = await formationUnitCenters(page, "hipper-rejoins-main-fleet");
  expect(formationDistance(hipperBeforeRejoin, hipperAfterRejoin)).toBeLessThan(42);
  await setJutlandTimelineDate(page, "1916-05-31T16:40", "after");
  const beattyAfterNorthTurn = await formationUnitCenters(page, "run-to-the-north");
  expect(formationDistance(beattyBeforeNorthTurn, beattyAfterNorthTurn)).toBeLessThan(95);
  const hipperEarlyRejoin = await formationUnitCenters(page, "hipper-rejoins-main-fleet");
  const highSeasEarlyNorth = await formationUnitCenters(page, "high-seas-fleet-north");
  const hipperEarlyRejoinCenter = formationCenter(hipperEarlyRejoin);
  const highSeasEarlyNorthCenter = formationCenter(highSeasEarlyNorth);
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "hipper-rejoins-main-fleet"), 0.14);
  expect(formationDistance(hipperEarlyRejoin, highSeasEarlyNorth)).toBeGreaterThan(82);
  expect(hipperEarlyRejoinCenter.x).toBeGreaterThan(highSeasEarlyNorthCenter.x + 58);
  expect(hipperEarlyRejoinCenter.y).toBeLessThan(highSeasEarlyNorthCenter.y - 32);
  await setTimeline(page, 0);
  await expect(page.getByTestId("current-date")).toContainText("1916年5月31日 14:20");

  await installAudioSpy(page);
  await page.getByTestId("event-list").getByRole("button", { name: /玛丽女王号爆炸沉没/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("玛丽女王号");
  await expect(page.getByTestId("map-point-queen-mary-loss")).toBeVisible();
  await expect(page.getByTestId("map-point-contact-zone")).toBeVisible();
  await expect(page.locator(".jutland-battle .formation-unit", { hasText: "玛丽女王号" })).toHaveCount(0);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(1);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(1);
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "run-to-the-south",
    "beatty-south-pursuit",
    "high-seas-fleet-north",
    "grand-fleet-closing"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", ["beatty-scouting-east", "hipper-scouting-west"]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["grand-fleet-approach"]);
  await expect(page.locator('.jutland-battle .front-line[data-route-id="grand-fleet-approach"]')).toHaveAttribute("data-unit-visible", "false");
  await expectMapPointsHidden(page, ".jutland-battle", ["grand-fleet-deployment", "crossing-t-zone", "scheer-first-turn", "death-ride"]);
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="high-seas-fleet-north"] .formation-unit')).toHaveCount(5);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /Jellicoe大舰队展开/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("展开");
  await expect(page.getByTestId("map-point-grand-fleet-deployment")).toBeVisible();
  await expectMapPointsHidden(page, ".jutland-battle", ["crossing-t-zone", "scheer-first-turn", "death-ride"]);
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "run-to-the-north",
    "hipper-rejoins-main-fleet",
    "high-seas-fleet-north",
    "grand-fleet-deploys"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", ["run-to-the-south", "beatty-south-pursuit"]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["grand-fleet-closing"]);
  await expect(page.locator('.jutland-battle .front-line[data-route-id="grand-fleet-closing"]')).toHaveAttribute("data-unit-visible", "false");
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expectRouteHasPolylineComplexity(page, ".jutland-battle", "grand-fleet-deploys", 5);
  const grandFleetRouteLength = await page
    .locator('.jutland-battle .front-line[data-route-id="grand-fleet-deploys"] .front-route')
    .evaluate((route) => (route instanceof SVGGeometryElement ? route.getTotalLength() : 0));
  expect(grandFleetRouteLength).toBeLessThan(520);
  const grandFleetFormation = await formationUnitCenters(page, "grand-fleet-deploys");
  const highSeasFleetBeforeTurn = await formationUnitCenters(page, "high-seas-fleet-north");
  const beattyRunNorthFormation = await formationUnitCenters(page, "run-to-the-north");
  const hipperRejoiningFormation = await formationUnitCenters(page, "hipper-rejoins-main-fleet");
  expect(grandFleetFormation.map((unit) => unit.label)).toContain("铁公爵号");
  expect(beattyRunNorthFormation.map((unit) => unit.label)).toEqual(["狮号", "皇家公主号", "虎号"]);
  expect(hipperRejoiningFormation.map((unit) => unit.label)).toEqual(["吕措夫号", "德弗林格号", "塞德利茨号", "毛奇号"]);
  expectFormationHasTravelSpread(grandFleetFormation, "x", 140);
  expectFormationHasTravelSpread(highSeasFleetBeforeTurn, "y", 92);
  const grandFleetCenter = formationCenter(grandFleetFormation);
  const highSeasCenterBeforeTurn = formationCenter(highSeasFleetBeforeTurn);
  const beattyRunNorthCenter = formationCenter(beattyRunNorthFormation);
  const hipperRejoiningCenter = formationCenter(hipperRejoiningFormation);
  expect(highSeasCenterBeforeTurn.y).toBeGreaterThan(grandFleetCenter.y + 32);
  expect(beattyRunNorthCenter.y).toBeLessThan(hipperRejoiningCenter.y + 35);
  expect(beattyRunNorthCenter.x).toBeLessThan(hipperRejoiningCenter.x + 60);
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /Scheer全舰队转向/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("全舰队转向");
  await expect(page.getByTestId("map-point-crossing-t-zone")).toBeVisible();
  await expect(page.getByTestId("map-point-scheer-first-turn")).toBeVisible();
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "run-to-the-north",
    "hipper-rejoins-main-fleet",
    "grand-fleet-deploys",
    "scheer-battle-turn"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", ["beatty-scouting-east", "hipper-scouting-west", "run-to-the-south", "beatty-south-pursuit"]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["grand-fleet-approach", "grand-fleet-closing"]);
  await expectMapPointsHidden(page, ".jutland-battle", ["death-ride", "night-escape"]);
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expectRouteHasPolylineComplexity(page, ".jutland-battle", "scheer-battle-turn", 4);
  await expect(page.getByTestId("jutland-crossing-salvo")).toBeVisible();
  await expect(page.getByTestId("jutland-crossing-salvo").locator(".salvo-shell-trace")).toHaveCount(5);
  await expect(page.getByTestId("jutland-crossing-salvo").locator(".salvo-impact")).toHaveCount(5);
  const grandFleetCrossing = await formationUnitCenters(page, "grand-fleet-deploys");
  const scheerTurning = await formationUnitCenters(page, "scheer-battle-turn");
  await setJutlandTimelineDate(page, "1916-05-31T18:35", "before");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="high-seas-fleet-north"]')).toHaveAttribute("data-unit-visible", "true");
  const highSeasFleetBeforeTurnHandoff = await formationUnitCenters(page, "high-seas-fleet-north");
  await setJutlandTimelineDate(page, "1916-05-31T18:36", "after");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="scheer-battle-turn"]')).toHaveAttribute("data-unit-visible", "true");
  const highSeasFleetAfterTurnHandoff = await formationUnitCenters(page, "scheer-battle-turn");
  expect(formationDistance(highSeasFleetBeforeTurnHandoff, highSeasFleetAfterTurnHandoff)).toBeLessThan(120);
  expectFormationHasTravelSpread(grandFleetCrossing, "x", 140);
  expectFormationHasTravelSpread(scheerTurning, "y", 86);
  await setJutlandTimelineDate(page, "1916-05-31T18:50");
  expectFormationUsesColumnProgression(await formationUnitRouteProgresses(page, "scheer-battle-turn"), 0.08);
  await setJutlandTimelineDate(page, "1916-05-31T18:36", "after");
  const grandFleetCrossingCenter = formationCenter(grandFleetCrossing);
  const scheerTurningCenter = formationCenter(scheerTurning);
  const grandFleetCrossingBounds = formationBounds(grandFleetCrossing);
  const scheerTurningBounds = formationBounds(scheerTurning);
  expect(scheerTurningCenter.y).toBeGreaterThan(grandFleetCrossingCenter.y + 44);
  expect(scheerTurningBounds.xMin).toBeGreaterThan(grandFleetCrossingBounds.xMin);
  expect(scheerTurningBounds.xMin).toBeLessThan(grandFleetCrossingBounds.xMax + 8);
  expect(grandFleetCrossingBounds.yMax).toBeLessThan(scheerTurningBounds.yMin - 90);
  const impactToTurnDistance = await page.evaluate(() => {
    const impact = document.querySelector('[data-testid="jutland-crossing-salvo"] .salvo-impact')?.parentElement;
    const turnPointCircle = document.querySelector('[data-testid="map-point-scheer-first-turn"] circle');
    return {
      dx: Math.abs(Number(impact?.getAttribute("data-impact-x")) - Number(turnPointCircle?.getAttribute("cx"))),
      dy: Math.abs(Number(impact?.getAttribute("data-impact-y")) - Number(turnPointCircle?.getAttribute("cy")))
    };
  });
  expect(impactToTurnDistance.dx).toBeLessThan(80);
  expect(impactToTurnDistance.dy).toBeLessThan(80);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(3);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(2);
  await expectJutlandFleetGroupsContinuous(page);
  await expectCurrentEventInsideMapCore(page);

  const deathRideCueCount = await countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3");
  const deathRideExplosionCount = await countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /战列巡洋舰与驱逐舰掩护主力脱离/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("掩护");
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "run-to-the-north",
    "grand-fleet-deploys",
    "scheer-battle-turn",
    "battlecruiser-death-ride"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", ["beatty-scouting-east", "hipper-scouting-west", "run-to-the-south", "beatty-south-pursuit"]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", ["high-seas-fleet-north"]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["grand-fleet-approach", "grand-fleet-closing"]);
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expectRouteHasPolylineComplexity(page, ".jutland-battle", "battlecruiser-death-ride", 2);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(deathRideCueCount + 1);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(deathRideExplosionCount + 1);
  await setJutlandTimelineDate(page, "1916-05-31T19:18", "before");
  const beattyBeforeNightScreen = await formationUnitCenters(page, "run-to-the-north");
  const grandFleetBeforeNightSearch = await formationUnitCenters(page, "grand-fleet-deploys");
  const hipperBeforeNightRetreat = await formationUnitCenters(page, "battlecruiser-death-ride");
  await setJutlandTimelineDate(page, "1916-05-31T19:18", "after");
  const beattyAfterNightScreen = await formationUnitCenters(page, "beatty-night-screen");
  const grandFleetAfterNightSearch = await formationUnitCenters(page, "british-night-pursuit-route");
  const hipperAfterNightRetreat = await formationUnitCenters(page, "hipper-night-retreat");
  expect(formationDistance(beattyBeforeNightScreen, beattyAfterNightScreen)).toBeLessThan(65);
  expect(formationDistance(grandFleetBeforeNightSearch, grandFleetAfterNightSearch)).toBeLessThan(80);
  expect(formationDistance(hipperBeforeNightRetreat, hipperAfterNightRetreat)).toBeLessThan(65);
  await expectJutlandFleetGroupsContinuous(page);
  await expectCurrentEventInsideMapCore(page);

  const combatCueCount = await countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3");
  const explosionCueCount = await countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /夜间接触混乱/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("夜间");
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(combatCueCount);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(explosionCueCount);
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "hipper-night-retreat",
    "beatty-night-screen",
    "british-night-pursuit-route",
    "german-main-night-retreat",
    "night-escape-route"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", [
    "beatty-scouting-east",
    "hipper-scouting-west",
    "run-to-the-south",
    "beatty-south-pursuit",
    "high-seas-fleet-north"
  ]);
  await expectRenderedRoutesExclude(page, ".jutland-battle", [
    "run-to-the-north",
    "hipper-rejoins-main-fleet",
    "grand-fleet-closing",
    "grand-fleet-deploys",
    "scheer-battle-turn",
    "battlecruiser-death-ride"
  ]);
  await expect(page.locator('.jutland-battle .front-line[data-route-id="beatty-night-screen"]')).toHaveAttribute("data-route-state", "is-active");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="british-night-pursuit-route"]')).toHaveAttribute("data-route-state", "is-active");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="german-main-night-retreat"]')).toHaveAttribute("data-route-state", "is-active");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="hipper-night-retreat"]')).toHaveAttribute("data-route-state", "is-active");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="beatty-night-screen"]')).toHaveAttribute(
    "data-route-from",
    "grand-fleet-deployment"
  );
  await expect(page.locator('.jutland-battle .front-line[data-route-id="british-night-pursuit-route"]')).toHaveAttribute(
    "data-route-from",
    "crossing-t-zone"
  );
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("timeline").fill("1000");
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "hipper-night-retreat",
    "beatty-night-screen",
    "british-night-pursuit-route",
    "german-main-night-retreat",
    "night-escape-route"
  ]);
  await expectNavalRoutesStayOffLand(page, ".jutland-battle");

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("trafalgar battle shows dense age-of-sail fleet maneuvers and losses", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "trafalgar");
  await expect(page.getByTestId("trafalgar-app")).toBeVisible();
  await expect(page.getByTestId("map-title-card").getByRole("heading", { name: "特拉法尔加大海战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "特拉法尔加大海战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expect(page.getByTestId("current-date")).toContainText("1805年10月21日 11:30");
  await expectScoreUsesMusic(page, "/audio/wikimedia-rule-britannia.ogg");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectTrafalgarLegendIsOneLine(page);

  await expect(page.getByTestId("trafalgar-wind")).toBeVisible();
  await expect(page.getByTestId("trafalgar-wind")).toContainText("轻风 / 西北偏西");
  await expect(page.getByTestId("nelson-shot-marker")).toHaveCount(0);
  await expect(page.getByTestId("map-point-redoutable-victory")).toHaveCount(0);
  await expect(page.getByTestId("map-point-nelson-fall")).toHaveCount(0);
  await expect(page.getByTestId("map-point-melee-center")).toHaveCount(0);
  await expect(page.getByTestId("map-point-captured-line")).toHaveCount(0);
  await expect(page.locator(".trafalgar-battle .event-pin")).toHaveCount(1);
  await expect(page.getByTestId("outcome-panel")).toContainText("449亡 / 1241伤");
  await expect(page.getByTestId("outcome-panel")).toContainText("约4400亡 / 2500伤");
  await expect(page.getByTestId("outcome-panel")).toContainText("约7000人");
  await expect(page.getByTestId("outcome-panel")).toContainText("英0艘 / 法西约18艘");

  await expect(page.locator('.front-line[data-route-id="nelson-weather-column"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="collingwood-lee-column"]')).toBeVisible();
  await expect(page.locator('.front-line[data-route-id="nelson-weather-column"] .formation-unit')).toHaveCount(7);
  await expect(page.locator('.front-line[data-route-id="collingwood-lee-column"] .formation-unit')).toHaveCount(7);
  await expect(page.locator('.front-line[data-route-id="allied-line-before-turn"] .formation-unit')).toHaveCount(9);
  await expect(page.locator('.front-line[data-route-id="allied-rear-disorder"] .formation-unit')).toHaveCount(6);
  await expectTrafalgarRepresentativeFleetCount(page, 29);
  await expectTrafalgarShipsStayAtSea(page);
  await expectRouteBadgeLabels(page, "nelson-weather-column", ["英", "英", "英", "英", "英", "英", "英"]);
  await expectRouteBadgeLabels(page, "collingwood-lee-column", ["英", "英", "英", "英", "英", "英", "英"]);
  await expectRouteBadgeLabels(page, "allied-line-before-turn", ["法", "西", "法", "法", "法", "西", "法", "法", "西"]);
  await expectRouteBadgeLabels(page, "allied-rear-disorder", ["法", "西", "法", "西", "法", "法"]);

  for (const shipName of ["胜利号", "皇家主权号", "布桑托尔号", "可畏号", "圣三位一体号", "圣安娜号"] as const) {
    await expect(page.locator(".trafalgar-battle .formation-unit-label", { hasText: shipName }).first()).toBeVisible();
  }

  await expectRealisticUnitIcon(page, "trafalgar-hms-victory-marker", "trafalgarHmsVictory", "trafalgar-hms-victory");
  await expectRealisticUnitIcon(page, "trafalgar-british-line-marker", "trafalgarBritishLine", "trafalgar-british-line");
  await expectRealisticUnitIcon(page, "trafalgar-french-line-marker", "trafalgarFrenchLine", "trafalgar-french-line");
  await expectRealisticUnitIcon(page, "trafalgar-bucentaure-marker", "trafalgarBucentaure", "trafalgar-bucentaure");
  await expectRealisticUnitIcon(page, "trafalgar-santisima-trinidad-marker", "trafalgarSantisimaTrinidad", "trafalgar-santisima-trinidad");
  await expectRealisticUnitIcon(page, "trafalgar-royal-sovereign-marker", "trafalgarRoyalSovereign", "trafalgar-royal-sovereign");
  for (const asset of [
    "trafalgar-hms-victory",
    "trafalgar-royal-sovereign",
    "trafalgar-bucentaure",
    "trafalgar-santisima-trinidad",
    "trafalgar-british-line",
    "trafalgar-french-line"
  ] as const) {
    await expectTransparentTrafalgarShipAsset(page, `/assets/unit-icons/${asset}.webp`);
  }

  await installAudioSpy(page);

  await page.getByTestId("event-list").getByRole("button", { name: /纳尔逊在胜利号上中弹/ }).click();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(1);
  await page.waitForTimeout(550);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);
  await expectTrafalgarRepresentativeFleetCount(page, 29);
  await expectTrafalgarShipsStayAtSea(page);
  await expectTrafalgarFleetUsesCloseBattleView(page, 0.3, 0.5);
  await expect(page.locator('.front-line[data-route-id="victory-redoutable-melee"] .formation-unit')).toHaveCount(15);
  await expect(page.locator('.front-line[data-route-id="british-central-melee"] .formation-unit')).toHaveCount(14);
  await expect(page.getByTestId("nelson-shot-marker")).toBeVisible();
  await expect(page.getByTestId("map-point-redoutable-victory")).toBeVisible();
  await expect(page.getByTestId("map-point-nelson-fall")).toBeVisible();
  await expect(page.getByTestId("map-point-melee-center")).toHaveCount(0);
  await expect(page.getByTestId("nelson-shot-marker")).toContainText("纳尔逊中弹");
  await expect(page.getByTestId("active-event-card")).toContainText("这里标注的是中弹位置，不是死亡时间");
  await expect(page.getByTestId("current-date")).toContainText("1805年10月21日 13:15");
  await expectCurrentEventInsideMapCore(page);

  const combatCueCount = await countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3");
  await page.getByTestId("event-list").getByRole("button", { name: /纳尔逊确认胜利后死亡/ }).click();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(combatCueCount);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);
  await expectTrafalgarRepresentativeFleetCount(page, 41);
  await expectTrafalgarShipsStayAtSea(page);
  await expectTrafalgarFleetUsesCloseBattleView(page, 0.54, 0.62);
  await expect(page.locator('.front-line[data-route-id="captured-hulks-drift"] .formation-unit')).toHaveCount(7);
  await expect(page.locator('.front-line[data-route-id="allied-retreat-cadiz"] .formation-unit')).toHaveCount(5);
  await expect(page.getByTestId("active-event-card")).toContainText("16:30");
  await expect(page.getByTestId("active-event-card")).toContainText("去世");
  await expect(page.getByTestId("current-date")).toContainText("1805年10月21日 16:30");
  await expectCurrentEventInsideMapCore(page);

  await page.getByTestId("event-list").getByRole("button", { name: /战果与损失/ }).click();
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(combatCueCount);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(0);
  await expectTrafalgarRepresentativeFleetCount(page, 12);
  await expectTrafalgarShipsStayAtSea(page);
  await expectTrafalgarFleetUsesCloseBattleView(page, 0.4, 0.66);
  await expectVisibleTrafalgarFleetRoutes(page, ["captured-hulks-drift", "allied-retreat-cadiz"]);
  await expect(page.locator('.front-line[data-route-id="captured-hulks-drift"] .formation-unit')).toHaveCount(7);
  await expect(page.locator('.front-line[data-route-id="allied-retreat-cadiz"] .formation-unit')).toHaveCount(5);
  await expect(page.getByTestId("active-event-card")).toContainText("英军无战列舰损失");
  await expect(page.getByTestId("outcome-panel")).toContainText("英0艘 / 法西约18艘");
  await expect(page.getByTestId("map-point-melee-center")).toBeVisible();
  await expect(page.getByTestId("map-point-captured-line")).toBeVisible();
  await expectCurrentEventInsideMapCore(page);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("midway battle uses named carrier icons waves and sinking points", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "midway");
  await expect(page.getByTestId("midway-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "中途岛海空战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "中途岛海空战");
  await expect(page.locator(".day-counter")).toContainText("小时");
  await expect(page.getByTestId("current-date")).toContainText("1942年6月4日 04:30");
  await expectScoreUsesMusic(page, "/audio/wikimedia-liberty-bell.ogg");
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectMapFirstLayout(page);
  const midwayMapBox = await page.getByTestId("map-stage").boundingBox();
  expect(midwayMapBox?.width).toBeGreaterThan(1300);
  expect(midwayMapBox?.height).toBeGreaterThan(800);
  await expect(page.getByTestId("midway-point-yorktown-sink")).toHaveCount(0);
  await expect(page.getByTestId("midway-point-akagi-hit")).toHaveCount(0);

  for (const carrier of ["enterprise", "hornet", "yorktown", "akagi", "kaga", "soryu", "hiryu"] as const) {
    await expect(page.getByTestId(`midway-carrier-${carrier}`).first()).toBeVisible();
    const image = page.getByTestId(`midway-carrier-asset-${carrier}`).first();
    await expect(image).toHaveAttribute("href", `/assets/unit-icons/midway-${carrier}.webp`);
    await expect(image).toHaveAttribute("data-asset-kind", "midway-carrier");
    const response = await page.request.head(`/assets/unit-icons/midway-${carrier}.webp`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image");
    expect(Number(response.headers()["content-length"])).toBeGreaterThan(8_000);
    await expectTransparentMarkerAsset(page, `/assets/unit-icons/midway-${carrier}.webp`, { height: 360, width: 900 });
  }
  for (const carrierName of ["企业号", "大黄蜂号", "约克城号", "赤城", "加贺", "苍龙", "飞龙"] as const) {
    await expect(page.locator(".midway-carrier-label", { hasText: carrierName }).first()).toBeVisible();
  }
  const initialJapaneseCarriers = await midwayCarrierCenters(page, ["akagi", "kaga", "soryu", "hiryu"]);
  expect(initialJapaneseCarriers.map((carrier) => carrier.formationId)).toEqual([
    "japan-kido-butai",
    "japan-kido-butai",
    "japan-kido-butai",
    "japan-hiryu"
  ]);
  expect(initialJapaneseCarriers.map((carrier) => carrier.offsetAlong)).toEqual([0, -72, -144, 0]);
  expectCarrierSpread(initialJapaneseCarriers, 120);
  expect(initialJapaneseCarriers.every((carrier) => carrier.facingX === "1")).toBe(true);

  const initialUsCarriers = await midwayCarrierCenters(page, ["enterprise", "hornet", "yorktown"]);
  expect(initialUsCarriers.map((carrier) => carrier.formationId)).toEqual(["us-tf16", "us-tf16", "us-tf17"]);
  expect(initialUsCarriers.map((carrier) => carrier.offsetAlong)).toEqual([0, -70, 0]);
  expectCarrierSpread(initialUsCarriers, 100);

  const initialCarrierBoxes = await page.locator(".midway-carrier-image").evaluateAll((images) =>
    images.map((image) => {
      const box = image.getBoundingClientRect();
      return { height: box.height, width: box.width };
    })
  );
  expect(initialCarrierBoxes.length).toBeGreaterThanOrEqual(7);
  expect(Math.min(...initialCarrierBoxes.map((box) => box.width))).toBeGreaterThan(130);

  const carrierAssets = await page
    .locator(".midway-carrier-image")
    .evaluateAll((images) => images.map((image) => image.getAttribute("href")).filter(Boolean));
  expect(new Set(carrierAssets).size).toBeGreaterThanOrEqual(7);

  await expect(page.getByTestId("midway-wave-tomonaga-midway-strike")).toBeVisible();
  await expect(page.getByText("友永队 B5N/D3A/A6M")).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /VT-8、VT-6、VT-3低空突击/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("VT-8、VT-6、VT-3低空突击");
  await expect(page.getByTestId("midway-wave-hornet-vt8")).toBeVisible();
  await expect(page.getByTestId("midway-wave-enterprise-vt6")).toBeVisible();
  await expect(page.getByTestId("midway-wave-yorktown-vt3")).toBeVisible();
  await expect(page.getByTestId("midway-wave-hornet-vt8").getByText("VT-8 / 大黄蜂号")).toBeVisible();
  await expect(page.getByTestId("midway-wave-enterprise-vt6").getByText("VT-6 / 企业号")).toBeVisible();
  await expect(page.getByTestId("midway-wave-yorktown-vt3").getByText("VT-3 / 约克城号")).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /赤城、加贺、苍龙被重创/ }).click();
  await expect(page.getByTestId("midway-point-akagi-hit")).toBeVisible();
  await expect(page.getByTestId("midway-point-kaga-hit")).toBeVisible();
  await expect(page.getByTestId("midway-point-soryu-hit")).toBeVisible();
  await expect(page.getByTestId("midway-point-yorktown-sink")).toHaveCount(0);
  await expect(page.getByTestId("midway-wave-enterprise-vb6-vs6")).toBeVisible();
  await expect(page.getByTestId("midway-wave-yorktown-vb3")).toBeVisible();
  await expect(page.getByTestId("midway-wave-enterprise-vb6-vs6").getByText("VB-6/VS-6 → 加贺/赤城")).toBeVisible();
  await expect(page.getByTestId("midway-wave-yorktown-vb3").getByText("VB-3 → 苍龙")).toBeVisible();
  const hitJapaneseCarriers = await midwayCarrierCenters(page, ["akagi", "kaga", "soryu", "hiryu"]);
  expectCarrierSpread(hitJapaneseCarriers, 150);
  expect(hitJapaneseCarriers.find((carrier) => carrier.id === "hiryu")?.formationId).toBe("japan-hiryu");
  const akagiAtHit = hitJapaneseCarriers.find((carrier) => carrier.id === "akagi");
  const hiryuAtHit = hitJapaneseCarriers.find((carrier) => carrier.id === "hiryu");
  expect(akagiAtHit).toBeTruthy();
  expect(hiryuAtHit).toBeTruthy();
  expect(Math.hypot((akagiAtHit?.x ?? 0) - (hiryuAtHit?.x ?? 0), (akagiAtHit?.y ?? 0) - (hiryuAtHit?.y ?? 0))).toBeGreaterThan(80);

  await page.getByTestId("event-list").getByRole("button", { name: /飞龙第一反击命中约克城号/ }).click();
  await expect(page.getByTestId("midway-wave-hiryu-first-counterstrike")).toBeVisible();
  await expect(page.getByTestId("midway-wave-hiryu-first-counterstrike").getByText("飞龙反击 I / D3A")).toBeVisible();
  await expectMidwayCarrierNearCurrentEvent(page, "yorktown", 12);
  const hiryuCounter = await midwayCarrierCenters(page, ["hiryu"]);
  expect(hiryuCounter[0]?.formationId).toBe("japan-hiryu");
  await expect(page.getByTestId("midway-track-hiryu")).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /飞龙第二波鱼雷机再击约克城号/ }).click();
  await expect(page.getByTestId("midway-wave-hiryu-second-counterstrike")).toBeVisible();
  await expect(page.getByTestId("midway-wave-hiryu-second-counterstrike").getByText("飞龙反击 II / B5N")).toBeVisible();
  await expectMidwayCarrierNearCurrentEvent(page, "yorktown", 12);

  await page.getByTestId("timeline").fill("1000");
  await expect(page.getByTestId("active-event-card")).toContainText("约克城号沉没，战役结束");
  await expect(page.getByTestId("midway-point-yorktown-sink")).toBeVisible();
  const retainedWaveStates = await page
    .locator(".midway-air-wave")
    .evaluateAll((waves) => waves.map((wave) => wave.getAttribute("data-route-state")));
  expect(retainedWaveStates.length).toBeGreaterThanOrEqual(11);
  expect(retainedWaveStates.every((state) => state === "is-complete")).toBe(true);
  await expect(page.getByTestId("midway-wave-tomonaga-midway-strike").getByText("友永队 B5N/D3A/A6M")).toBeVisible();
  await expect(page.getByTestId("midway-wave-enterprise-vb6-vs6").getByText("VB-6/VS-6 → 加贺/赤城")).toBeVisible();
  await expect(page.getByTestId("midway-wave-i168-yorktown").getByText("I-168 → 约克城号")).toBeVisible();
  for (const carrier of ["akagi", "kaga", "soryu", "hiryu", "yorktown"] as const) {
    await expect(page.getByTestId(`midway-sunk-${carrier}`)).toBeVisible();
  }
  for (const carrierName of ["赤城", "加贺", "苍龙", "飞龙", "约克城号"] as const) {
    await expect(page.locator(".midway-sunk-label", { hasText: carrierName }).first()).toBeVisible();
  }
  await expect(page.getByTestId("midway-sunk-explosion")).toHaveCount(5);

  expect(apiFailures).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
