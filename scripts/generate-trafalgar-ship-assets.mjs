import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const sourceDir = resolve(root, "public/assets/unit-icons/source/trafalgar");
const outputDir = resolve(root, "public/assets/unit-icons");

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const variants = [
  {
    id: "british-line",
    output: "trafalgar-british-line.webp",
    source: "trafalgar-british-line-marker.svg",
    hull: "#6b3f24",
    hullDark: "#2f2017",
    stripe: "#d4a64e",
    trim: "#f0d178",
    sail: "#e9dfc6",
    flag: ["#b83d32", "#f2f0e6", "#244a89"],
    masts: [250, 428, 608]
  },
  {
    id: "hms-victory",
    output: "trafalgar-hms-victory.webp",
    source: "trafalgar-hms-victory-marker.svg",
    hull: "#55341f",
    hullDark: "#1d1814",
    stripe: "#d8a83f",
    trim: "#ffd76c",
    sail: "#efe5c9",
    flag: ["#b7352d", "#f6f0df", "#233c7c"],
    pennant: true,
    masts: [246, 428, 614]
  },
  {
    id: "royal-sovereign",
    output: "trafalgar-royal-sovereign.webp",
    source: "trafalgar-royal-sovereign-marker.svg",
    hull: "#60381f",
    hullDark: "#241915",
    stripe: "#d9a14b",
    trim: "#f2ca66",
    sail: "#eadfc3",
    flag: ["#b7352d", "#f7f0dc", "#25417f"],
    sternBlue: "#1d4774",
    masts: [238, 420, 596]
  },
  {
    id: "french-line",
    output: "trafalgar-french-line.webp",
    source: "trafalgar-french-line-marker.svg",
    hull: "#4d3c31",
    hullDark: "#191d22",
    stripe: "#c69a47",
    trim: "#e0c173",
    sail: "#ddd5c3",
    flag: ["#274b8f", "#f1ece1", "#ba3a31"],
    masts: [252, 432, 612]
  },
  {
    id: "bucentaure",
    output: "trafalgar-bucentaure.webp",
    source: "trafalgar-bucentaure-marker.svg",
    hull: "#4a352b",
    hullDark: "#151c22",
    stripe: "#c8903d",
    trim: "#e6bf68",
    sail: "#dfd5bd",
    flag: ["#264c90", "#f3eee1", "#b93430"],
    sternBlue: "#17375f",
    pennant: true,
    masts: [252, 432, 612]
  },
  {
    id: "santisima-trinidad",
    output: "trafalgar-santisima-trinidad.webp",
    source: "trafalgar-santisima-trinidad-marker.svg",
    hull: "#5b3521",
    hullDark: "#1d1512",
    stripe: "#d5a044",
    trim: "#f0c661",
    sail: "#e7dcc1",
    flag: ["#b63a2f", "#f0c64c", "#b63a2f"],
    heavy: true,
    masts: [202, 342, 486, 636]
  }
];

function line(x1, y1, x2, y2, width = 2, color = "rgba(38,28,22,0.68)") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function sail(x, y, width, height, side, fill) {
  const curve = side === "left" ? -22 : 22;
  const x2 = x + side * width;
  return `<path d="M ${x} ${y} C ${x + curve} ${y + height * 0.33} ${x + side * (width * 0.72)} ${y + height * 0.86} ${x2} ${y + height} L ${x} ${y + height * 0.88} Z" fill="${fill}" stroke="rgba(62,48,34,0.55)" stroke-width="2"/>`;
}

function squareSail(x, y, width, height, fill) {
  return `<path d="M ${x - width / 2} ${y + 6} C ${x - width * 0.34} ${y + height * 0.45} ${x - width * 0.28} ${y + height} ${x} ${y + height + 8} C ${x + width * 0.28} ${y + height} ${x + width * 0.34} ${y + height * 0.45} ${x + width / 2} ${y + 6} Z" fill="${fill}" stroke="rgba(60,47,32,0.58)" stroke-width="2"/>`;
}

function gunports(count, y, startX, gap, color) {
  return Array.from({ length: count }, (_, index) => {
    const x = startX + index * gap;
    return `<rect x="${x}" y="${y}" width="10" height="7" rx="1.5" fill="#17120f" stroke="${color}" stroke-width="1.2"/>`;
  }).join("");
}

function flag(x, y, colors, width = 54, height = 24) {
  const stripe = width / colors.length;
  const rects = colors
    .map((color, index) => `<rect x="${x + index * stripe}" y="${y}" width="${stripe}" height="${height}" fill="${color}"/>`)
    .join("");
  return `<g transform="skewY(-8)">${rects}<path d="M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z" fill="none" stroke="rgba(29,24,20,0.56)" stroke-width="1.2"/></g>`;
}

function renderShip(variant) {
  const mastLines = variant.masts
    .map((x, index) => {
      const top = variant.heavy ? [58, 42, 48, 70][index] : [70, 44, 64][index];
      const deck = variant.heavy ? 226 : 222;
      return [
        line(x, top, x, deck, 4, "#573b26"),
        line(x - 55, 144, x + 60, 144, 3, "#6a482d"),
        line(x - 48, 102, x + 52, 102, 2.5, "#765034"),
        squareSail(x, 92, variant.heavy ? 92 : 84, 56, variant.sail),
        squareSail(x, 136, variant.heavy ? 108 : 98, 66, variant.sail),
        sail(x, 86, variant.heavy ? 68 : 62, 114, -1, variant.sail),
        sail(x, 92, variant.heavy ? 76 : 68, 106, 1, variant.sail)
      ].join("");
    })
    .join("");

  const rigging = [
    ...variant.masts.flatMap((x) => [
      line(x, 58, 136, 232, 1.4, "rgba(35,28,22,0.46)"),
      line(x, 58, 742, 230, 1.4, "rgba(35,28,22,0.46)"),
      line(x - 54, 104, x + 60, 222, 1.2, "rgba(35,28,22,0.34)"),
      line(x + 58, 104, x - 64, 222, 1.2, "rgba(35,28,22,0.34)")
    ]),
    line(132, 224, 780, 224, 2, "rgba(43,31,24,0.62)")
  ].join("");

  const hullTop = variant.heavy ? 218 : 224;
  const hullBottom = variant.heavy ? 282 : 274;
  const hull = `<path d="M 120 ${hullTop} C 205 ${hullTop - 22} 590 ${hullTop - 20} 738 ${hullTop - 6} L 800 ${hullTop + 24} C 718 ${hullBottom + 8} 265 ${hullBottom + 10} 148 ${hullBottom - 2} C 128 ${hullBottom - 20} 116 ${hullBottom - 42} 120 ${hullTop} Z" fill="url(#hullGradient)" stroke="#211812" stroke-width="4"/>`;
  const stripeY = variant.heavy ? 232 : 236;
  const gunY1 = variant.heavy ? 238 : 242;
  const gunY2 = variant.heavy ? 260 : 260;
  const gunY3 = variant.heavy ? 277 : 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="hullGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${variant.hull}"/>
      <stop offset="0.62" stop-color="${variant.hullDark}"/>
      <stop offset="1" stop-color="#0f1112"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M 148 232 L 116 202 L 132 242 Z" fill="${variant.trim}" stroke="#231812" stroke-width="3"/>
    <path d="M 736 220 L 826 190 L 776 238 Z" fill="${variant.hull}" stroke="#211812" stroke-width="4"/>
    ${mastLines}
    ${rigging}
    ${hull}
    <path d="M 146 ${stripeY} C 250 ${stripeY - 10} 640 ${stripeY - 12} 770 ${stripeY + 5}" fill="none" stroke="${variant.stripe}" stroke-width="${variant.heavy ? 12 : 10}" stroke-linecap="round"/>
    <path d="M 158 ${stripeY + 22} C 280 ${stripeY + 15} 626 ${stripeY + 18} 748 ${stripeY + 28}" fill="none" stroke="${variant.stripe}" stroke-width="${variant.heavy ? 8 : 6}" stroke-linecap="round" opacity="0.84"/>
    ${gunports(variant.heavy ? 27 : 24, gunY1, 176, variant.heavy ? 20 : 22, variant.trim)}
    ${gunports(variant.heavy ? 26 : 22, gunY2, 188, variant.heavy ? 20 : 23, variant.trim)}
    ${variant.heavy ? gunports(24, gunY3, 204, 20, variant.trim) : ""}
    <path d="M 662 218 L 772 218 L 788 244 L 690 240 Z" fill="${variant.sternBlue ?? variant.hullDark}" stroke="${variant.trim}" stroke-width="3" opacity="0.96"/>
    <circle cx="700" cy="228" r="5" fill="${variant.trim}"/>
    <circle cx="728" cy="229" r="5" fill="${variant.trim}"/>
    <circle cx="756" cy="231" r="5" fill="${variant.trim}"/>
    ${flag(774, 172, variant.flag)}
    ${variant.pennant ? `<path d="M ${variant.masts[1]} 42 C ${variant.masts[1] + 70} 36 ${variant.masts[1] + 112} 50 ${variant.masts[1] + 160} 42" fill="none" stroke="${variant.flag[0]}" stroke-width="5" stroke-linecap="round"/>` : ""}
  </g>
</svg>`;
}

for (const variant of variants) {
  const svgPath = resolve(sourceDir, variant.source);
  const outputPath = resolve(outputDir, variant.output);
  writeFileSync(svgPath, renderShip(variant), "utf8");

  const result = spawnSync(
    "magick",
    ["-background", "none", svgPath, "-resize", "900x360!", "-quality", "95", outputPath],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error(`Failed to generate ${variant.output}`);
  }
}
