import { expect, test, type Page } from "@playwright/test";

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

  expect(mapBox).not.toBeNull();
  expect(subtitleBox).not.toBeNull();
  expect(subtitleBox?.height).toBeLessThan((mapBox?.height ?? 0) * 0.06);
  expect((subtitleBox?.y ?? 0) - (mapBox?.y ?? 0)).toBeGreaterThanOrEqual(0);
  expect((subtitleBox?.y ?? 0) - (mapBox?.y ?? 0)).toBeLessThan((mapBox?.height ?? 0) * 0.14);
  expect((subtitleBox?.x ?? 0) - (mapBox?.x ?? 0)).toBeGreaterThan((mapBox?.width ?? 0) * 0.32);
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
    | "warship-marker",
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
    | "warship",
  expectedAssetPath:
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
    | "warship" = expectedAssetKind
) {
  const marker = page.getByTestId(markerTestId).first();
  await expect(marker).toBeVisible();
  const image = marker.locator(".unit-icon-image");
  await expect(image).toHaveAttribute("data-asset-kind", expectedAssetKind);
  await expect(image).toHaveAttribute("href", `/assets/unit-icons/${expectedAssetPath}.webp`);

  const assetResponse = await page.request.head(`/assets/unit-icons/${expectedAssetPath}.webp`);
  expect(assetResponse.ok()).toBe(true);
  expect(assetResponse.headers()["content-type"]).toContain("image");
  const minimumContentLength = expectedAssetKind === "infantry" ? 18_000 : expectedAssetKind === "infantryPva" ? 12_000 : 4_000;
  expect(Number(assetResponse.headers()["content-length"])).toBeGreaterThan(minimumContentLength);
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

async function expectVisibleTsushimaFleetRoutes(page: Page, expectedRouteIds: string[]) {
  const visibleRoutes = await page
    .locator('.tsushima-battle .front-line[data-unit-visible="true"]')
    .evaluateAll((routes) => routes.map((route) => route.getAttribute("data-route-id")).filter(Boolean));

  expect(visibleRoutes).toEqual(expectedRouteIds);
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
        sources.push(src);
      }

      pause() {}

      async play() {
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
  "tsushima",
  "midway",
  "france",
  "eastern",
  "pacific",
  "korean",
  "gulf"
] as const;

async function openCampaignFromHome(page: Page, campaignId: (typeof campaignIds)[number]) {
  await page.goto("/");
  await page.getByTestId(`open-${campaignId}`).click();
}

async function collectCampaignMusicSources(page: Page) {
  const sources: string[] = [];

  for (const campaignId of campaignIds) {
    await openCampaignFromHome(page, campaignId);
    sources.push((await page.getByTestId("score-toggle").getAttribute("data-music-source")) ?? "");
  }

  return sources;
}

test("war library home lists ancient and modern animations", async ({ page }) => {
  const { apiFailures, consoleErrors } = collectFailures(page);

  await page.goto("/");
  await expect(page.getByTestId("war-library-home")).toBeVisible();
  await expect(page.getByTestId("return-home")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "战争动画藏书馆" })).toBeVisible();
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
      "日俄对马海战",
      "中途岛海空战",
      "1940 德法战役",
      "1941-1945 苏德战争全景",
      "日美太平洋战争战史",
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
  await page.getByTestId("event-list").getByRole("button", { name: /崖山海战/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("崖山海战");
  await expectRealisticUnitIcon(page, "ship-marker", "ship");

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
  await expectUnitMarkersDoNotAnimate(page);
  await expect(page.getByTestId("event-list")).toContainText("东乡回头转向截断航路");
  await expect(page.getByTestId("event-list")).toContainText("第二合战：日军再横切北逃舰列");

  await page.getByTestId("event-list").getByRole("button", { name: /东乡回头转向截断航路/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("东乡回头转向截断航路");
  await expectCurrentEventInsideMapCore(page);
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
  await expect(page.locator(".region-labels")).toContainText("对马海峡");
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
  await expectVisibleTsushimaFleetRoutes(page, ["russian-flagship-chaos"]);
  await expectTsushimaRoutesStayOffLand(page);
  await expectUnitMarkersDoNotAnimate(page);

  await page.getByTestId("event-list").getByRole("button", { name: /第二合战：日军再横切北逃舰列/ }).click();
  await expect(page.getByTestId("active-event-card")).toContainText("第二合战：日军再横切北逃舰列");
  await expectCurrentEventInsideMapCore(page);
  await expectUnitIconFacesRoute(page, "japanese-second-turn", "-1", "-1");
  await expectVisibleTsushimaFleetRoutes(page, ["japanese-second-turn", "russian-breakout-scatter"]);
  await expectTsushimaRoutesStayOffLand(page);

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
