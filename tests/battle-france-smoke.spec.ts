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
import * as caesarData from "../src/data/caesarWars";
import * as crusadesData from "../src/data/crusades";
import * as easternFrontData from "../src/data/easternFront";
import * as guadalcanalData from "../src/data/guadalcanalNavalBattle";
import * as gulfWarData from "../src/data/gulfWar1991";
import * as jutlandData from "../src/data/jutlandBattle";
import * as koreanWarData from "../src/data/koreanWar";
import * as midwayData from "../src/data/midwayBattle";
import * as mongolData from "../src/data/mongolEmpire";
import * as napoleonicData from "../src/data/napoleonicWars";
import * as pacificWarData from "../src/data/pacificWar";
import * as punicData from "../src/data/punicWars";
import * as qinData from "../src/data/qinUnification";
import * as trafalgarData from "../src/data/trafalgarBattle";
import * as tsushimaData from "../src/data/tsushimaBattle";

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
    formationUnits?: unknown[];
    from: string;
    hideUnit?: boolean;
    id: string;
    retainUnitAfterRouteEnd?: boolean;
    routeKind?: string;
    start: string;
    unitIcon?: string;
    unitGroupId?: string;
    unitVisibleFrom?: string;
    to: string;
    unitVisibleUntil?: string;
    visibleUntil?: string;
    waypoints?: Array<[number, number]>;
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
  ["alexanderConquests", alexanderData as CampaignDataModule],
  ["caesarWars", caesarData as CampaignDataModule],
  ["pacificWar", pacificWarData as CampaignDataModule],
  ["koreanWar", koreanWarData as CampaignDataModule],
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
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const eventBox = await page.locator(".event-pin.is-current").first().boundingBox();

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

async function expectLowImpactTicker(page: Page) {
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
  await expect(page.getByTestId("narration-subtitle")).toHaveCSS("background-color", /rgba\(5, 12, 14, 0\.16\)/);
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

async function expectMapCanMoveUnderPointer(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  const beforeWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.52, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.48);
  await page.mouse.wheel(0, -620);
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).y).not.toBe(beforeWheel.y);
  const afterWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  expect(afterWheel.x).toBeCloseTo(beforeWheel.x, 1);
  expect(afterWheel.scale).toBeCloseTo(beforeWheel.scale, 3);

  const beforeDrag = await cameraLayer.getAttribute("transform");
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.52, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.48);
  await page.mouse.down();
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.36, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.38, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => cameraLayer.getAttribute("transform")).not.toBe(beforeDrag);
}

async function expectMapCanMoveHorizontallyUnderPointer(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  await page.mouse.dblclick((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.5, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.5);
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");

  const beforeShiftWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.52, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.48);
  await page.keyboard.down("Shift");
  await page.mouse.wheel(0, 520);
  await page.keyboard.up("Shift");
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).x).not.toBe(beforeShiftWheel.x);
  const afterShiftWheel = parseMapTransform(await cameraLayer.getAttribute("transform"));
  expect(afterShiftWheel.y).toBeCloseTo(beforeShiftWheel.y, 1);
  expect(afterShiftWheel.scale).toBeCloseTo(beforeShiftWheel.scale, 3);

  await page.mouse.dblclick((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.5, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.5);
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");
  const beforeDrag = parseMapTransform(await cameraLayer.getAttribute("transform"));
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.58, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.48);
  await page.mouse.down();
  await page.mouse.move((mapBox?.x ?? 0) + (mapBox?.width ?? 0) * 0.36, (mapBox?.y ?? 0) + (mapBox?.height ?? 0) * 0.48, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).x).not.toBe(beforeDrag.x);
}

async function expectMapZoomButtonsWork(page: Page) {
  const cameraLayer = page.getByTestId("camera-layer");
  const mapBox = await page.getByTestId("map-stage").boundingBox();

  expect(mapBox).not.toBeNull();
  await page.getByTestId("map-reset").click();
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");

  await page.getByTestId("map-zoom-in").click();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).scale).toBeGreaterThan(1);
  await page.getByTestId("map-zoom-out").click();
  await expect.poll(async () => parseMapTransform(await cameraLayer.getAttribute("transform")).scale).toBeCloseTo(1, 2);
  await page.getByTestId("map-zoom-in").click();
  await page.getByTestId("map-reset").click();
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");
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
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");

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
  await expect.poll(async () => cameraLayer.getAttribute("transform")).toBe("translate(0.00 0.00) scale(1.000)");
}

async function expectGaixiaRouteStaysInMapStage(page: Page, routeId: string) {
  const mapBox = await page.getByTestId("map-stage").boundingBox();
  const routeBox = await page.getByTestId(`gaixia-route-${routeId}`).locator(".gaixia-route-line").boundingBox();

  expect(mapBox).not.toBeNull();
  expect(routeBox).not.toBeNull();
  expect(routeBox?.x).toBeGreaterThan((mapBox?.x ?? 0) + 6);
  expect((routeBox?.x ?? 0) + (routeBox?.width ?? 0)).toBeLessThan((mapBox?.x ?? 0) + (mapBox?.width ?? 0) - 6);
  expect(routeBox?.y).toBeGreaterThan((mapBox?.y ?? 0) - 18);
  expect((routeBox?.y ?? 0) + (routeBox?.height ?? 0)).toBeLessThan((mapBox?.y ?? 0) + (mapBox?.height ?? 0) - 6);
}

async function expectRealisticUnitIcon(
  page: Page,
  markerTestId:
    | "cannon-marker"
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
    | "ww2-attack-aircraft-marker"
    | "ww2-bomber-marker"
    | "ww2-escort-ship-marker"
    | "ww2-fighter-marker"
    | "ww2-submarine-marker"
    | "ww2-transport-ship-marker",
  expectedAssetKind:
    | "cannon"
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
    | "ww2AttackAircraft"
    | "ww2Bomber"
    | "ww2EscortShip"
    | "ww2Fighter"
    | "ww2Submarine"
    | "ww2TransportShip",
  expectedAssetPath?:
    | "cannon"
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
    | "ww2-attack-aircraft"
    | "ww2-bomber"
    | "ww2-escort-ship"
    | "ww2-fighter"
    | "ww2-submarine"
    | "ww2-transport-ship"
) {
  const assetPath = expectedAssetPath ?? expectedAssetKind;
  const marker = page.getByTestId(markerTestId).first();
  await expect(marker).toBeVisible();
  const image = marker.locator(".unit-icon-image");
  await expect(image).toHaveAttribute("data-asset-kind", expectedAssetKind);
  await expect(image).toHaveAttribute("href", `/assets/unit-icons/${assetPath}.webp`);

  const assetResponse = await page.request.head(`/assets/unit-icons/${assetPath}.webp`);
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
  expectedSize: { height: number; width: number } = { height: 360, width: 900 }
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

  expect(stats.width).toBe(expectedSize.width);
  expect(stats.height).toBe(expectedSize.height);
  expect(stats.opaque).toBeGreaterThan(18_000);
  expect(stats.alphaRatio).toBeGreaterThan(0.05);
  expect(stats.alphaRatio).toBeLessThan(assetPath.includes("chariot") ? 0.38 : 0.32);
  expect(stats.bboxWidthRatio).toBeGreaterThan(0.42);
  expect(stats.bboxHeightRatio).toBeLessThan(0.76);
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
    .evaluateAll((routes) => routes.map((route) => route.getAttribute("data-route-id")).filter((routeId): routeId is string => Boolean(routeId)));
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

async function expectCompactAircraftMarkers(page: Page, markerTestId: "ww2-attack-aircraft-marker" | "ww2-bomber-marker" | "ww2-fighter-marker") {
  const boxes = await page
    .getByTestId(markerTestId)
    .evaluateAll((markers) => markers.map((marker) => marker.getBoundingClientRect()).map((box) => ({ height: box.height, width: box.width })));

  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(box.width).toBeLessThan(105);
    expect(box.height).toBeLessThan(46);
  }
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
  "korean",
  "gulf"
] as const;

const temporarySharedMusicCampaignIds = new Set<(typeof campaignIds)[number]>(["big-week", "bismarck-sea", "britain-air"]);

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
  const { apiFailures, consoleErrors } = collectFailures(page);
  await page.setViewportSize({ width: 1440, height: 900 });

  await openCampaignFromHome(page, "gaixia");
  await expect(page.getByTestId("gaixia-app")).toBeVisible();
  await expect(page.getByRole("heading", { name: "韩信十面埋伏：垓下之战" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "韩信十面埋伏：垓下之战");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 河边高地");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectScoreUsesMusic(page, "/audio/shi-mian-mai-fu-pipa.mp3");

  await expect(page.getByTestId("gaixia-terrain-layer")).toBeVisible();
  await expect(page.locator('.gaixia-ground[href="/assets/maps/gaixia-terrain-dem.webp"]')).toBeVisible();
  await expect(page.getByTestId("gaixia-contour-layer")).toContainText("42m");
  await expect(page.getByTestId("gaixia-terrain-layer")).toContainText("垓下高地");
  await expect(page.getByTestId("gaixia-terrain-layer")).toContainText("旧河汊低地");
  await expect(page.getByTestId("gaixia-river-layer")).toContainText("沱河");
  await expect(page.getByTestId("gaixia-region-sishui-commandery")).toContainText("秦属泗水郡旧界");
  await expect(page.getByTestId("gaixia-region-han-outer-ring")).toContainText("汉军合围态势");
  await expect(page.getByTestId("gaixia-region-chu-pocket")).toContainText("楚军垓下营垒");
  await expect(page.getByTestId("gaixia-fortification-layer")).toContainText("霸王城");
  await expect(page.getByTestId("gaixia-ambush-sector-layer")).toContainText("东南伏兵");
  await expect(page.getByTestId("gaixia-point-gaixia")).toContainText("垓下");
  await expect(page.getByTestId("gaixia-route-chu-retreat-gaixia")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-chu-command")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-chu-command").locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-chu-command.webp");
  for (const icon of ["chu-command", "chu-cavalry", "chu-infantry", "han-cavalry", "han-crossbow", "han-infantry"]) {
    const response = await page.request.head(`/assets/unit-icons/gaixia-${icon}.webp`);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image");
    expect(Number(response.headers()["content-length"])).toBeGreaterThan(35_000);
  }
  await expectGaixiaRouteStaysInMapStage(page, "chu-retreat-gaixia");

  await page.getByTestId("event-list").getByRole("button", { name: /韩信布成合围态势/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("韩信布成合围态势");
  await expect(page.getByTestId("gaixia-route-han-west-infantry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-north-crossbow")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-infantry")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-crossbow")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-infantry").locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-infantry.webp");
  await expect(page.getByTestId("gaixia-unit-han-crossbow").locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-crossbow.webp");
  await expectGaixiaRouteStaysInMapStage(page, "han-west-infantry");
  await expectGaixiaRouteStaysInMapStage(page, "han-north-crossbow");

  await page.getByTestId("event-list").getByRole("button", { name: /十面伏兵完成闭合/ }).click();
  await expect(page.getByTestId("gaixia-route-han-east-cavalry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-south-infantry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-southeast-cavalry")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-west")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-tighten-north")).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-cavalry").first()).toBeVisible();
  await expect(page.getByTestId("gaixia-unit-han-cavalry").first().locator(".gaixia-unit-image")).toHaveAttribute("href", "/assets/unit-icons/gaixia-han-cavalry.webp");
  await expectGaixiaRouteStaysInMapStage(page, "han-east-cavalry");
  await expectGaixiaRouteStaysInMapStage(page, "han-south-infantry");
  await expectGaixiaRouteStaysInMapStage(page, "han-southeast-cavalry");

  await page.getByTestId("event-list").getByRole("button", { name: /四面楚歌瓦解军心/ }).click();
  await expect(page.getByTestId("gaixia-song-effect")).toBeVisible();
  await expect(page.getByTestId("active-event-card")).toContainText("四面楚歌瓦解军心");
  await expect(page.getByTestId("gaixia-route-chu-night-breakout-check")).toBeVisible();

  await page.getByTestId("event-list").getByRole("button", { name: /项羽率骑兵东南突围/ }).click();
  await expect(page.getByTestId("gaixia-route-chu-breakout-southeast")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-yinling")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-yinling")).toContainText("阴陵");
  await expectGaixiaRouteStaysInMapStage(page, "han-cavalry-pursuit-yinling");

  await page.getByTestId("event-list").getByRole("button", { name: /东城快战与汉骑追逼/ }).click();
  await expect(page.getByTestId("gaixia-route-chu-dongcheng-last-stand")).toBeVisible();
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-wujiang")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-dongcheng")).toContainText("东城");
  await expect(page.getByTestId("gaixia-point-wujiang-road")).toContainText("乌江");
  await expectGaixiaRouteStaysInMapStage(page, "han-cavalry-pursuit-wujiang");

  await page.getByTestId("event-list").getByRole("button", { name: /乌江方向终局/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("乌江方向终局");
  await expect(page.getByTestId("gaixia-route-han-cavalry-pursuit-wujiang")).toBeVisible();
  await expect(page.getByTestId("gaixia-point-wujiang-road")).toContainText("乌江");
  await expectGaixiaRouteStaysInMapStage(page, "han-cavalry-pursuit-wujiang");

  await expectAncientBattleEventsPlayMeleeCue(page, [
    /楚军退至垓下/,
    /韩信布成合围态势/,
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
  const { apiFailures, consoleErrors } = collectFailures(page);

  await openCampaignFromHome(page, "britain-air");
  await expect(page.getByTestId("battle-of-britain-app")).toBeVisible();
  await installAudioSpy(page);
  await expect(page.getByTestId("map-title-card").getByRole("heading", { name: "伦敦上空的鹰" })).toBeVisible();
  await expectOnlyWarNameInMapTitle(page, "伦敦上空的鹰");
  await expectScoreUsesMusic(page, "/audio/wikimedia-rule-britannia.ogg");
  await expect(page.getByTestId("narration-subtitle")).toContainText("第一幕 / 雷达报来袭");
  await expectMapFirstLayout(page);
  await expectLowImpactTicker(page);
  await expectMapCanMoveUnderPointer(page);
  await expectMapCanMoveHorizontallyUnderPointer(page);
  await expectMapZoomButtonsWork(page);
  await expectNoTerrainZones(page, ".battle-of-britain");
  await expectMapPointsHidden(page, ".battle-of-britain", ["brenchley", "south-london", "buckingham-palace", "victoria", "duxford", "southampton"]);
  await page.getByTestId("event-list").getByRole("button", { name: /雷达报告：大编队越海/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("雷达报告");
  await expect(page.locator('.front-line[data-route-id="morning-radar-plots"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-raid-first-wave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-raid-first-wave"]')).toHaveAttribute("data-route-to", "calais");
  await expectRouteHasPolylineComplexity(page, ".battle-of-britain", "morning-raid-first-wave", 5);
  await page.getByTestId("event-list").getByRole("button", { name: /11群连续下令升空/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("11群连续下令升空");
  await expect(page.locator('.front-line[data-route-id="eleven-group-morning-scramble"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="eleven-group-morning-scramble"]')).toHaveAttribute("data-route-to", "biggin-hill");
  await expectRealisticUnitIcon(page, "ww2-bomber-marker", "ww2Bomber", "ww2-bomber");
  await expectRealisticUnitIcon(page, "ww2-fighter-marker", "ww2Fighter", "ww2-fighter");
  await expectCompactAircraftMarkers(page, "ww2-bomber-marker");
  await expectCompactAircraftMarkers(page, "ww2-fighter-marker");
  await expectRouteBadgeLabels(page, "morning-raid-first-wave", ["德", "德", "德", "德", "德"]);

  await page.getByTestId("event-list").getByRole("button", { name: /伦敦南侧空域混战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("伦敦南侧空域混战");
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("britain-morning-dogfight")).toBeVisible();
  await expect(page.locator('.battle-of-britain .battle-salvo-effect')).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="morning-raid-second-wave"]')).toHaveAttribute("data-route-to", "boulogne");
  await expect(page.locator('.front-line[data-route-id="twelve-group-morning-wing"]')).toHaveAttribute("data-route-to", "duxford");
  await expect(page.locator('.front-line[data-route-id="morning-raf-dogfight-weave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="morning-luftwaffe-cover-break"]')).toHaveClass(/route-air/);
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
  await expectCurrentEventInsideMapCore(page);
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
  await expectCurrentEventInsideMapCore(page);
  await expect(page.getByTestId("britain-afternoon-dogfight")).toBeVisible();
  await expect(page.locator('.battle-of-britain .battle-salvo-effect')).toHaveCount(0);
  await expect(page.locator('.front-line[data-route-id="afternoon-raf-dogfight-weave"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="afternoon-luftwaffe-cover-split"]')).toHaveClass(/route-air/);
  await expect(page.locator('.front-line[data-route-id="afternoon-raid-main-wave"]')).toHaveAttribute("data-route-to", "calais");
  await expect(page.locator('.front-line[data-route-id="afternoon-raid-follow-wave"]')).toHaveAttribute("data-route-to", "cap-gris-nez");
  await expect(page.locator('.front-line[data-route-id="eleven-group-afternoon-all-in"]')).toHaveAttribute("data-route-to", "kenley");
  await expect(page.locator('.front-line[data-route-id="big-wing-afternoon-commitment"]')).toHaveAttribute("data-route-to", "duxford");
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
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["beatty-scouting-east", "hipper-scouting-west", "grand-fleet-approach"]);
  await expect(page.locator('.jutland-battle .front-line[data-route-id="beatty-scouting-east"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="hipper-scouting-west"]')).toHaveAttribute("data-unit-visible", "false");
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
  await expectRenderedRoutesInclude(page, ".jutland-battle", ["run-to-the-south", "beatty-south-pursuit", "grand-fleet-closing"]);
  await expect(page.locator('.jutland-battle .front-line[data-route-id="run-to-the-south"]')).toHaveAttribute("data-unit-visible", "false");
  await expect(page.locator('.jutland-battle .front-line[data-route-id="beatty-south-pursuit"]')).toHaveAttribute("data-unit-visible", "false");
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
  await expectRenderedRoutesInclude(page, ".jutland-battle", [
    "beatty-scouting-east",
    "hipper-scouting-west",
    "grand-fleet-approach",
    "grand-fleet-closing",
    "run-to-the-south",
    "beatty-south-pursuit"
  ]);
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
  await expectRenderedRoutesInclude(page, ".jutland-battle", [
    "beatty-scouting-east",
    "hipper-scouting-west",
    "grand-fleet-approach",
    "grand-fleet-closing",
    "run-to-the-south",
    "beatty-south-pursuit",
    "high-seas-fleet-north"
  ]);
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
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/cannon-howitzer.mp3")).toBe(combatCueCount + 1);
  await expect.poll(() => countPlayedAudio(page, "/audio/sfx/explosion-heavy.mp3")).toBe(explosionCueCount);
  await expectVisibleFleetRoutes(page, ".jutland-battle", [
    "hipper-night-retreat",
    "beatty-night-screen",
    "british-night-pursuit-route",
    "german-main-night-retreat",
    "night-escape-route"
  ]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", [
    "beatty-scouting-east",
    "hipper-scouting-west",
    "grand-fleet-approach",
    "run-to-the-south",
    "beatty-south-pursuit",
    "run-to-the-north",
    "hipper-rejoins-main-fleet",
    "high-seas-fleet-north",
    "grand-fleet-closing",
    "grand-fleet-deploys"
  ]);
  await expectRenderedRoutesInclude(page, ".jutland-battle", [
    "run-to-the-north",
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
