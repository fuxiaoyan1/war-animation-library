import { expect, test, type Page } from "@playwright/test";

async function installAudioSpy(page: Page) {
  await page.addInitScript(() => {
    const win = window as typeof window & {
      __audioSpyInstalled?: boolean;
      __playedAudioSources?: string[];
    };
    if (win.__audioSpyInstalled) {
      return;
    }

    const sources: string[] = [];

    class FakeAudio extends EventTarget {
      currentTime = 0;
      loop = false;
      preload = "";
      src = "";
      volume = 1;

      constructor(src?: string) {
        super();
        if (src) {
          this.src = src;
        }
      }

      pause() {}

      play() {
        sources.push(this.src);
        return Promise.resolve();
      }
    }

    win.__playedAudioSources = sources;
    win.__audioSpyInstalled = true;
    window.Audio = FakeAudio as unknown as typeof Audio;
  });
}

async function openCannae(page: Page) {
  await page.goto("/");
  await page.getByTestId("open-cannae").click();
  await expect(page.getByTestId("cannae-app")).toBeVisible();
  await expect(page.getByTestId("cannae-formation-map")).toBeVisible();
}

async function clickPhase(page: Page, phaseId: string, title: RegExp) {
  await page.getByTestId("event-list").locator(`button[data-phase-id="${phaseId}"]`).click();
  await expect(page.getByTestId("active-event-card")).toContainText(title);
  await expect(page.getByTestId("cannae-formation-map")).toHaveAttribute("data-phase", phaseId);
}

async function blockBox(page: Page, testId: string) {
  const box = await page.getByTestId(testId).first().boundingBox();
  expect(box, `${testId} should be visible`).not.toBeNull();
  return box!;
}

async function blockModelBox(page: Page, testId: string) {
  return page.getByTestId(testId).first().locator("path").first().evaluate((element) => {
    const box = (element as SVGGraphicsElement).getBBox();
    return {
      height: box.height,
      width: box.width,
      x: box.x,
      y: box.y
    };
  });
}

test("cannae formation animation shows double envelopment geometry and melee cues", async ({ page }) => {
  await installAudioSpy(page);
  await openCannae(page);

  await expect(page.getByRole("heading", { name: "坎尼会战：双重合围" })).toBeVisible();
  await expect(page.getByTestId("score-toggle")).toHaveAttribute("data-music-source", "/audio/wikimedia-holst-mars.ogg");
  await expect(page.getByTestId("cannae-formation-map")).toHaveAttribute("data-center-curvature", "convex");
  await expect(page.getByTestId("cannae-formation-map")).toHaveAttribute("data-roman-compression", "1.00");

  const initialRoman = await blockModelBox(page, "roman-infantry-mass");
  const initialArea = initialRoman.width * initialRoman.height;
  const initialWingWidth = await page.getByTestId("african-infantry-wings").evaluateAll((wings) => {
    const boxes = wings.map((wing) => wing.getBoundingClientRect());
    return Math.max(...boxes.map((box) => box.right)) - Math.min(...boxes.map((box) => box.left));
  });

  await clickPhase(page, "centerYields", /中军后退/);
  await expect(page.getByTestId("cannae-formation-map")).toHaveAttribute("data-center-curvature", "concave");
  await expect(page.getByTestId("cannae-center-curvature-guide")).toHaveAttribute("data-center-curvature", "concave");

  await clickPhase(page, "africanWingsTurn", /非洲重步兵内折/);
  const turnedWingWidth = await page.getByTestId("african-infantry-wings").evaluateAll((wings) => {
    const boxes = wings.map((wing) => wing.getBoundingClientRect());
    return Math.max(...boxes.map((box) => box.right)) - Math.min(...boxes.map((box) => box.left));
  });
  expect(turnedWingWidth, "African infantry wings should visibly close inward").toBeLessThan(initialWingWidth * 0.9);
  expect(Number(await page.getByTestId("cannae-formation-map").getAttribute("data-wing-closure"))).toBeGreaterThanOrEqual(0.7);

  await clickPhase(page, "encirclement", /双重合围/);
  const enclosedRoman = await blockModelBox(page, "roman-infantry-mass");
  const enclosedArea = enclosedRoman.width * enclosedRoman.height;
  expect(enclosedArea, "Roman mass should be compressed after envelopment").toBeLessThan(initialArea * 0.54);
  expect(Number(await page.getByTestId("cannae-formation-map").getAttribute("data-roman-compression"))).toBeLessThanOrEqual(0.5);
  expect(Number(await page.getByTestId("cannae-formation-map").getAttribute("data-wing-closure"))).toBeGreaterThanOrEqual(0.9);
  await expect(page.getByTestId("cannae-encirclement-ring")).toBeVisible();
  await expect(page.getByTestId("cannae-melee-sparks")).toBeVisible();

  const playedMelee = await page.evaluate(() => {
    const win = window as typeof window & { __playedAudioSources?: string[] };
    return win.__playedAudioSources?.filter((source) => source.includes("/audio/sfx/swords-clashing.mp3")).length ?? 0;
  });
  expect(playedMelee, "manual phase jumps should trigger ancient melee SFX").toBeGreaterThanOrEqual(3);
});

test("cannae layout keeps the battle surface readable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCannae(page);
  await clickPhase(page, "encirclement", /双重合围/);

  const stage = await page.getByTestId("cannae-map-stage").boundingBox();
  const roman = await page.getByTestId("roman-infantry-mass").boundingBox();
  const subtitle = await page.getByTestId("narration-subtitle").boundingBox();
  const metrics = await page.getByTestId("cannae-tactical-metrics").boundingBox();

  expect(stage).not.toBeNull();
  expect(roman).not.toBeNull();
  expect(subtitle).not.toBeNull();
  expect(metrics).not.toBeNull();
  expect(stage?.height).toBeGreaterThan(520);

  const romanCenterX = (roman!.x + roman!.width / 2 - stage!.x) / stage!.width;
  const romanCenterY = (roman!.y + roman!.height / 2 - stage!.y) / stage!.height;
  expect(romanCenterX).toBeGreaterThan(0.32);
  expect(romanCenterX).toBeLessThan(0.68);
  expect(romanCenterY).toBeGreaterThan(0.34);
  expect(romanCenterY).toBeLessThan(0.68);
  expect((subtitle?.y ?? 0) + (subtitle?.height ?? 0)).toBeLessThan(roman!.y);
  expect(metrics?.y).toBeGreaterThan(roman!.y + roman!.height);
});
