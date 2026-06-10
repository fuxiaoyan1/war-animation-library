import { existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const sourceDir = resolve(root, "public/assets/unit-icons/source/cannae-0ad");
const outputDir = resolve(root, "public/assets/unit-icons");

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const variants = [
  {
    id: "roman-legion",
    source: "0ad-rome-infantry-legionary.png",
    output: "cannae-roman-legion.webp",
    canvas: "420x520",
    resize: "330x420",
    badge: "ROM",
    badgeColor: "#9e312b",
    trim: "#f1ca72",
    labelColor: "#fff0bd",
    accent: "#ba3f33",
    fuzz: "32%",
    modulate: "166,132,120",
    darkLift: "#b06a48",
    shift: "+4-10"
  },
  {
    id: "roman-cavalry",
    source: "0ad-rome-cavalry-spearman.png",
    output: "cannae-roman-cavalry.webp",
    canvas: "560x400",
    resize: "450x335",
    badge: "ROM",
    badgeColor: "#9e312b",
    trim: "#f1ca72",
    labelColor: "#fff0bd",
    accent: "#ba3f33",
    fuzz: "32%",
    modulate: "164,130,120",
    darkLift: "#b06a48",
    shift: "+8-4"
  },
  {
    id: "carthaginian-infantry",
    source: "0ad-cart-infantry-spearman.png",
    output: "cannae-carthaginian-infantry.webp",
    canvas: "420x520",
    resize: "330x420",
    badge: "PUN",
    badgeColor: "#12666d",
    trim: "#e5bd66",
    labelColor: "#fff0bd",
    accent: "#147d83",
    fuzz: "32%",
    modulate: "160,132,120",
    darkLift: "#5f9a86",
    shift: "+2-10"
  },
  {
    id: "african-infantry",
    source: "0ad-cart-champion-infantry.png",
    output: "cannae-african-infantry.webp",
    canvas: "420x520",
    resize: "330x420",
    badge: "LIB",
    badgeColor: "#2b6f49",
    trim: "#ddb463",
    labelColor: "#fff0bd",
    accent: "#2d7b51",
    fuzz: "32%",
    modulate: "160,132,120",
    darkLift: "#65945f",
    shift: "+2-10"
  },
  {
    id: "carthaginian-cavalry",
    source: "0ad-cart-cavalry-spearman.png",
    output: "cannae-carthaginian-cavalry.webp",
    canvas: "560x400",
    resize: "450x335",
    badge: "CAV",
    badgeColor: "#12666d",
    trim: "#e5bd66",
    labelColor: "#fff0bd",
    accent: "#137b83",
    fuzz: "32%",
    modulate: "160,130,120",
    darkLift: "#5f9a86",
    shift: "+8-4"
  },
  {
    id: "numidian-cavalry",
    source: "0ad-cart-cavalry-javelinist.png",
    output: "cannae-numidian-cavalry.webp",
    canvas: "560x400",
    resize: "450x335",
    badge: "NUM",
    badgeColor: "#93602d",
    trim: "#e0b25d",
    labelColor: "#fff0bd",
    accent: "#a76c2f",
    fuzz: "32%",
    modulate: "164,132,120",
    darkLift: "#b18152",
    shift: "+8-4"
  },
  {
    id: "hannibal-command",
    source: "0ad-cart-hero-hannibal.png",
    output: "cannae-hannibal-command.webp",
    canvas: "420x520",
    resize: "335x420",
    badge: "HAN",
    badgeColor: "#135b66",
    trim: "#ecc668",
    labelColor: "#fff0bd",
    accent: "#146d78",
    fuzz: "36%",
    modulate: "160,130,120",
    darkLift: "#5f9a86",
    shift: "+2-8"
  },
  {
    id: "paullus-command",
    source: "0ad-rome-hero-marcellus.png",
    output: "cannae-paullus-command.webp",
    canvas: "420x520",
    resize: "335x420",
    badge: "PAU",
    badgeColor: "#8d302b",
    trim: "#eac16a",
    labelColor: "#fff0bd",
    accent: "#9f3b34",
    fuzz: "54%",
    modulate: "174,136,122",
    brightness: "38x14",
    gamma: "0.78",
    darkLift: "#b06a48",
    shift: "+2-8"
  }
];

function runMagick(args, label) {
  const result = spawnSync("magick", args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Failed to generate ${label}`);
  }
}

function requireSource(fileName) {
  const sourcePath = resolve(sourceDir, fileName);
  if (!existsSync(sourcePath)) {
    throw new Error(`Missing Cannae source image: ${sourcePath}`);
  }
  return sourcePath;
}

function badgeArgs(variant, canvasWidth, canvasHeight) {
  const markX = Math.round(canvasWidth * 0.18);
  const markY = Math.round(canvasHeight * 0.18);
  const markW = Math.round(Math.min(canvasWidth, canvasHeight) * 0.15);
  const markH = Math.round(Math.min(canvasWidth, canvasHeight) * 0.1);
  return [
    "-fill",
    `rgba(${parseInt(variant.badgeColor.slice(1, 3), 16)},${parseInt(variant.badgeColor.slice(3, 5), 16)},${parseInt(variant.badgeColor.slice(5, 7), 16)},0.78)`,
    "-stroke",
    variant.trim,
    "-strokewidth",
    "4",
    "-draw",
    `path 'M ${markX - markW / 2},${markY - markH / 2} L ${markX + markW / 2},${markY - markH / 2} L ${markX + markW * 0.33},${markY + markH / 2} L ${markX},${markY + markH * 0.72} L ${markX - markW * 0.33},${markY + markH / 2} Z'`,
    "-stroke",
    "none"
  ];
}

function processedSourceArgs(sourcePath, variant) {
  return [
    sourcePath,
    "-auto-orient",
    "-alpha",
    "set",
    "-fuzz",
    variant.fuzz,
    "-fill",
    "none",
    "-draw",
    "color 0,0 floodfill",
    "-draw",
    "color 255,0 floodfill",
    "-draw",
    "color 0,255 floodfill",
    "-draw",
    "color 255,255 floodfill",
    "-trim",
    "+repage",
    "-resize",
    variant.resize,
    "-alpha",
    "set",
    "-background",
    "none",
    "-fill",
    variant.accent,
    "-tint",
    "6",
    "-modulate",
    variant.modulate,
    "-brightness-contrast",
    variant.brightness ?? "16x10",
    "-gamma",
    variant.gamma ?? "0.82",
    "-contrast-stretch",
    "0.1%x0.1%",
    "-unsharp",
    "0x1.15+0.82+0.02"
  ];
}

function generateMarker(variant) {
  const sourcePath = requireSource(variant.source);
  const outputPath = resolve(outputDir, variant.output);
  const [canvasWidth, canvasHeight] = variant.canvas.split("x").map(Number);
  const borderWidth = Math.max(4, Math.round(Math.min(canvasWidth, canvasHeight) * 0.012));
  const shadowY = Math.round(canvasHeight * 0.82);
  const shadowRx = Math.round(canvasWidth * 0.18);
  const shadowRy = Math.round(canvasHeight * 0.028);

  runMagick(
    [
      "(",
      ...processedSourceArgs(sourcePath, variant),
      ")",
      "(",
      "+clone",
      "-alpha",
      "extract",
      "-morphology",
      "Dilate",
      `Disk:${borderWidth}`,
      "-blur",
      "0x1.1",
      "-background",
      "rgba(255,238,186,0.84)",
      "-alpha",
      "shape",
      ")",
      "-swap",
      "0,1",
      "-compose",
      "over",
      "-composite",
      "(",
      "-size",
      variant.canvas,
      "xc:none",
      "-fill",
      "rgba(32,24,16,0.12)",
      "-draw",
      `ellipse ${Math.round(canvasWidth * 0.54)},${shadowY} ${shadowRx},${shadowRy} 0,360`,
      ")",
      "+swap",
      "-gravity",
      "center",
      "-geometry",
      variant.shift,
      "-compose",
      "over",
      "-composite",
      ...badgeArgs(variant, canvasWidth, canvasHeight),
      "-alpha",
      "set",
      "-fuzz",
      variant.darkLiftFuzz ?? "10%",
      "-fill",
      variant.darkLift ?? "#5a372a",
      "-opaque",
      "black",
      "-quality",
      "94",
      outputPath
    ],
    variant.output
  );
}

for (const variant of variants) {
  generateMarker(variant);
}
