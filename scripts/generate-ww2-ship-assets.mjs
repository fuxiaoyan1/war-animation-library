import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const sourceDir = resolve(root, "public/assets/unit-icons/source/ww2-ships");
const outputDir = resolve(root, "public/assets/unit-icons");

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const variants = [
  {
    id: "transport",
    output: "ww2-transport-ship.webp",
    source: "ww2-transport-ship-marker.svg",
    hull: "#3f4a48",
    hullDark: "#1a2021",
    deck: "#777267",
    trim: "#b8b09a"
  },
  {
    id: "escort",
    output: "ww2-escort-ship.webp",
    source: "ww2-escort-ship-marker.svg",
    hull: "#465457",
    hullDark: "#1a2226",
    deck: "#7c817b",
    trim: "#b8b6a6"
  }
];

function renderTransport(variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="hullGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${variant.hull}"/>
      <stop offset="0.72" stop-color="${variant.hullDark}"/>
      <stop offset="1" stop-color="#0d1112"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-20%" width="124%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="6" flood-color="#000000" flood-opacity="0.34"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M118 196 C210 220 638 221 784 198 L832 168 C690 190 286 188 102 166 Z" fill="url(#hullGradient)" stroke="#101719" stroke-width="6"/>
    <path d="M165 163 C280 148 596 148 746 162 L784 198 C624 218 266 216 118 196 Z" fill="${variant.deck}" stroke="#202829" stroke-width="4"/>
    <path d="M288 123 H474 L496 158 H252 Z" fill="#b7b3a5" stroke="#1d2526" stroke-width="4"/>
    <path d="M514 133 H646 L674 162 H486 Z" fill="#aaa799" stroke="#1d2526" stroke-width="4"/>
    <path d="M356 89 H418 L432 123 H340 Z" fill="#c0bbab" stroke="#1d2526" stroke-width="4"/>
    <path d="M550 98 H608 L620 133 H534 Z" fill="#bab5a6" stroke="#1d2526" stroke-width="4"/>
    <rect x="332" y="73" width="18" height="56" fill="#2a3031"/>
    <rect x="580" y="82" width="16" height="54" fill="#2a3031"/>
    <path d="M182 184 C300 198 616 198 792 178" fill="none" stroke="${variant.trim}" stroke-width="5" opacity="0.72" stroke-linecap="round"/>
    <path d="M238 141 H716" fill="none" stroke="rgba(236,229,196,0.36)" stroke-width="3" stroke-dasharray="18 14"/>
    <circle cx="264" cy="179" r="9" fill="#121819" opacity="0.72"/>
    <circle cx="338" cy="184" r="9" fill="#121819" opacity="0.72"/>
    <circle cx="412" cy="186" r="9" fill="#121819" opacity="0.72"/>
  </g>
</svg>`;
}

function renderEscort(variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="hullGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${variant.hull}"/>
      <stop offset="0.72" stop-color="${variant.hullDark}"/>
      <stop offset="1" stop-color="#0d1112"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-20%" width="124%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="6" flood-color="#000000" flood-opacity="0.34"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M118 190 C242 212 620 211 770 192 L834 158 C650 178 304 176 94 154 Z" fill="url(#hullGradient)" stroke="#101719" stroke-width="6"/>
    <path d="M170 156 C292 143 604 143 746 156 L770 192 C612 208 284 207 118 190 Z" fill="${variant.deck}" stroke="#202829" stroke-width="4"/>
    <path d="M390 112 H560 L596 156 H352 Z" fill="#b7b7aa" stroke="#1d2526" stroke-width="4"/>
    <path d="M466 76 H514 L536 112 H440 Z" fill="#c0c0b4" stroke="#1d2526" stroke-width="4"/>
    <rect x="496" y="55" width="14" height="58" fill="#252c2f"/>
    <path d="M606 136 L724 118" stroke="#1d2526" stroke-width="9" stroke-linecap="round"/>
    <path d="M250 139 L342 126" stroke="#1d2526" stroke-width="8" stroke-linecap="round"/>
    <path d="M194 176 C318 190 608 190 786 170" fill="none" stroke="${variant.trim}" stroke-width="5" opacity="0.72" stroke-linecap="round"/>
    <path d="M228 137 H720" fill="none" stroke="rgba(236,229,196,0.34)" stroke-width="3" stroke-dasharray="16 13"/>
    <circle cx="302" cy="176" r="8" fill="#121819" opacity="0.72"/>
    <circle cx="374" cy="179" r="8" fill="#121819" opacity="0.72"/>
  </g>
</svg>`;
}

function renderShip(variant) {
  return variant.id === "escort" ? renderEscort(variant) : renderTransport(variant);
}

for (const variant of variants) {
  const svgPath = resolve(sourceDir, variant.source);
  const outputPath = resolve(outputDir, variant.output);
  writeFileSync(svgPath, renderShip(variant), "utf8");

  const result = spawnSync("magick", ["-background", "none", svgPath, "-resize", "900x360!", "-quality", "92", outputPath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`Failed to generate ${variant.output}`);
  }
}
