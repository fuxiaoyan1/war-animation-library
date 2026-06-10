import { existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const sourceRoot = resolve(root, "public/assets/unit-icons/source");
const sourceDir = resolve(sourceRoot, "cannae-baidu");
const outputDir = resolve(root, "public/assets/unit-icons");

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const variants = [
  {
    id: "roman-legion",
    source: "baidu-roman-warrior-3d.jpeg",
    output: "cannae-roman-legion.webp",
    canvas: "500x620",
    resize: "315x420",
    badge: "ROM",
    badgeColor: "#9e312b",
    trim: "#f1ca72",
    labelColor: "#fff0bd",
    accent: "#ba3f33",
    fuzz: "20%",
    modulate: "178,130,114",
    colorize: "16",
    darkLift: "#c57955",
    darkLiftFuzz: "42%",
    shift: "+4-10"
  },
  {
    id: "roman-cavalry",
    source: "baidu-roman-mounted-soldier.jpeg",
    output: "cannae-roman-cavalry.webp",
    canvas: "620x430",
    resize: "520x360",
    badge: "ROM",
    badgeColor: "#9e312b",
    trim: "#f1ca72",
    labelColor: "#fff0bd",
    accent: "#ba3f33",
    fuzz: "22%",
    modulate: "174,130,114",
    colorize: "14",
    darkLift: "#c57955",
    darkLiftFuzz: "42%",
    shift: "+8-4"
  },
  {
    id: "carthaginian-infantry",
    source: "baidu-ancient-european-soldier.jpeg",
    output: "cannae-carthaginian-infantry.webp",
    canvas: "500x620",
    resize: "315x420",
    badge: "PUN",
    badgeColor: "#12666d",
    trim: "#e5bd66",
    labelColor: "#fff0bd",
    accent: "#147d83",
    fuzz: "18%",
    modulate: "154,124,112",
    colorize: "18",
    darkLift: "#6fbeb4",
    darkLiftFuzz: "42%",
    shift: "+2-10"
  },
  {
    id: "african-infantry",
    source: "baidu-ancient-european-soldier.jpeg",
    output: "cannae-african-infantry.webp",
    canvas: "500x620",
    resize: "315x420",
    badge: "LIB",
    badgeColor: "#2b6f49",
    trim: "#ddb463",
    labelColor: "#fff0bd",
    accent: "#2d7b51",
    fuzz: "18%",
    modulate: "146,128,112",
    colorize: "20",
    darkLift: "#8fba75",
    darkLiftFuzz: "42%",
    shift: "+2-10"
  },
  {
    id: "carthaginian-cavalry",
    source: "baidu-ancient-cavalry-lancer.jpeg",
    output: "cannae-carthaginian-cavalry.webp",
    canvas: "640x430",
    resize: "540x370",
    badge: "CAV",
    badgeColor: "#12666d",
    trim: "#e5bd66",
    labelColor: "#fff0bd",
    accent: "#137b83",
    fuzz: "22%",
    modulate: "154,126,112",
    colorize: "18",
    darkLift: "#6fbeb4",
    darkLiftFuzz: "42%",
    shift: "+8-4"
  },
  {
    id: "numidian-cavalry",
    source: "baidu-ancient-cavalry-lancer.jpeg",
    output: "cannae-numidian-cavalry.webp",
    canvas: "640x430",
    resize: "540x370",
    badge: "NUM",
    badgeColor: "#93602d",
    trim: "#e0b25d",
    labelColor: "#fff0bd",
    accent: "#a76c2f",
    fuzz: "20%",
    modulate: "166,132,112",
    colorize: "18",
    darkLift: "#c99350",
    darkLiftFuzz: "42%",
    shift: "+8-4"
  },
  {
    id: "hannibal-command",
    source: "baidu-ancient-cavalry-lancer.jpeg",
    output: "cannae-hannibal-command.webp",
    canvas: "500x620",
    resize: "305x400",
    badge: "HAN",
    badgeColor: "#135b66",
    trim: "#ecc668",
    labelColor: "#fff0bd",
    accent: "#146d78",
    fuzz: "36%",
    modulate: "160,130,120",
    colorize: "18",
    darkLift: "#6fbeb4",
    darkLiftFuzz: "42%",
    shift: "+2-8"
  },
  {
    id: "paullus-command",
    source: "baidu-roman-warrior-3d.jpeg",
    output: "cannae-paullus-command.webp",
    canvas: "500x620",
    resize: "305x400",
    badge: "PAU",
    badgeColor: "#8d302b",
    trim: "#eac16a",
    labelColor: "#fff0bd",
    accent: "#9f3b34",
    fuzz: "54%",
    modulate: "174,136,122",
    brightness: "38x14",
    gamma: "0.78",
    colorize: "16",
    darkLift: "#c57955",
    darkLiftFuzz: "42%",
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
  const sourcePath = resolve(sourceRoot, fileName.includes("/") ? fileName : `cannae-baidu/${fileName}`);
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
    variant.colorize ?? "14",
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
      variant.darkLiftFuzz ?? "36%",
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
