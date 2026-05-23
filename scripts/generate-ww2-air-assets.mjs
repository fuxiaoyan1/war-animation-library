import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const sourceDir = resolve(root, "public/assets/unit-icons/source/ww2-air");
const outputDir = resolve(root, "public/assets/unit-icons");

mkdirSync(sourceDir, { recursive: true });
mkdirSync(outputDir, { recursive: true });

const variants = [
  {
    id: "fighter",
    output: "ww2-fighter.webp",
    source: "ww2-fighter-marker.svg",
    body: "#4d5a50",
    bodyDark: "#202722",
    trim: "#b9b29a",
    canopy: "#7e9aa2",
    roundel: ["#1f3f6e", "#ece8da", "#92332e"],
    kind: "spitfire"
  },
  {
    id: "bomber",
    output: "ww2-bomber.webp",
    source: "ww2-bomber-marker.svg",
    body: "#636960",
    bodyDark: "#252b2a",
    trim: "#bbb9aa",
    canopy: "#879aa0",
    roundel: ["#233f70", "#ece8da", "#8f302b"],
    kind: "b17"
  },
  {
    id: "attack-aircraft",
    output: "ww2-attack-aircraft.webp",
    source: "ww2-attack-aircraft-marker.svg",
    body: "#4d625b",
    bodyDark: "#1f2929",
    trim: "#b8ad88",
    canopy: "#7d989f",
    roundel: ["#203f6f", "#eee8d8", "#91332c"],
    kind: "b25"
  }
];

function line(x1, y1, x2, y2, width = 2, color = "rgba(22,25,24,0.72)") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function roundel(x, y, colors, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <circle r="18" fill="${colors[0]}" stroke="rgba(12,18,20,0.38)" stroke-width="1.6"/>
    <circle r="11" fill="${colors[1]}"/>
    <circle r="5.2" fill="${colors[2]}"/>
  </g>`;
}

function propeller(x, y, radius = 24) {
  return `<g transform="translate(${x} ${y})">
    <ellipse cx="0" cy="${-radius * 0.52}" rx="4" ry="${radius * 0.56}" fill="rgba(34,33,29,0.58)" transform="rotate(0)"/>
    <ellipse cx="0" cy="${radius * 0.52}" rx="4" ry="${radius * 0.56}" fill="rgba(34,33,29,0.58)" transform="rotate(0)"/>
    <ellipse cx="${radius * 0.52}" cy="0" rx="${radius * 0.56}" ry="4" fill="rgba(34,33,29,0.58)" transform="rotate(0)"/>
    <ellipse cx="${-radius * 0.52}" cy="0" rx="${radius * 0.56}" ry="4" fill="rgba(34,33,29,0.58)" transform="rotate(0)"/>
    <circle r="6" fill="#2b2721"/>
  </g>`;
}

function renderSpitfire(variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="airframe" x1="0" x2="1">
      <stop offset="0" stop-color="${variant.bodyDark}"/>
      <stop offset="0.5" stop-color="${variant.body}"/>
      <stop offset="1" stop-color="${variant.bodyDark}"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-18%" width="124%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M420 178 C326 132 244 118 154 137 C220 177 314 197 420 204 Z" fill="url(#airframe)" stroke="#111819" stroke-width="4"/>
    <path d="M420 178 C520 131 616 120 746 139 C654 181 536 202 420 204 Z" fill="url(#airframe)" stroke="#111819" stroke-width="4"/>
    <path d="M205 186 C168 168 132 162 96 171 C132 196 168 207 206 205 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M214 192 C174 202 139 221 114 246 C156 241 190 229 220 208 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M196 185 C292 158 550 156 735 180 C782 186 809 194 825 198 C810 204 783 212 735 218 C546 243 289 239 196 210 C168 202 169 193 196 185 Z" fill="${variant.body}" stroke="#101719" stroke-width="5"/>
    <path d="M594 166 C637 166 682 174 724 185 C690 192 642 194 584 187 C584 177 587 170 594 166 Z" fill="${variant.canopy}" stroke="#12191a" stroke-width="3"/>
    ${propeller(828, 199, 24)}
    ${roundel(292, 171, variant.roundel, 0.54)}
    ${roundel(548, 171, variant.roundel, 0.54)}
    <path d="M242 198 C356 213 560 211 724 196" fill="none" stroke="${variant.trim}" stroke-width="3" opacity="0.58" stroke-linecap="round"/>
    ${line(285, 151, 552, 221, 1.3, "rgba(230,224,196,0.22)")}
    ${line(285, 221, 552, 151, 1.3, "rgba(230,224,196,0.18)")}
  </g>
</svg>`;
}

function renderB17(variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="airframe" x1="0" x2="1">
      <stop offset="0" stop-color="${variant.bodyDark}"/>
      <stop offset="0.52" stop-color="${variant.body}"/>
      <stop offset="1" stop-color="${variant.bodyDark}"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-18%" width="124%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M196 176 L450 126 L744 175 L748 207 L450 226 L196 207 Z" fill="url(#airframe)" stroke="#111819" stroke-width="5"/>
    <path d="M190 184 C272 157 604 158 766 184 C820 193 829 202 766 216 C606 247 274 243 190 211 C160 200 161 193 190 184 Z" fill="${variant.body}" stroke="#101719" stroke-width="5"/>
    <path d="M170 184 L88 143 L232 172 L232 208 L88 247 L170 211 Z" fill="url(#airframe)" stroke="#111819" stroke-width="4"/>
    <path d="M196 170 L150 112 L242 176 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M196 224 L150 284 L242 218 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M700 170 C735 174 760 180 780 188 C748 193 712 193 676 188 C678 178 686 172 700 170 Z" fill="${variant.canopy}" stroke="#12191a" stroke-width="3"/>
    ${[304, 384, 516, 596]
      .map(
        (x) => `<g>
          <ellipse cx="${x}" cy="190" rx="23" ry="15" fill="#202323" stroke="${variant.trim}" stroke-width="2"/>
          ${propeller(x + 3, 190, 18)}
        </g>`
      )
      .join("")}
    ${roundel(304, 158, variant.roundel, 0.62)}
    ${roundel(596, 158, variant.roundel, 0.62)}
    <path d="M222 197 C358 213 574 212 746 196" fill="none" stroke="${variant.trim}" stroke-width="3" opacity="0.54" stroke-linecap="round"/>
    ${line(252, 173, 656, 219, 1.2, "rgba(232,226,200,0.18)")}
    ${line(252, 219, 656, 173, 1.2, "rgba(232,226,200,0.14)")}
  </g>
</svg>`;
}

function renderB25(variant) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="airframe" x1="0" x2="1">
      <stop offset="0" stop-color="${variant.bodyDark}"/>
      <stop offset="0.52" stop-color="${variant.body}"/>
      <stop offset="1" stop-color="${variant.bodyDark}"/>
    </linearGradient>
    <filter id="softShadow" x="-12%" y="-18%" width="124%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="5" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="M248 176 L450 138 L672 178 L674 207 L450 222 L248 207 Z" fill="url(#airframe)" stroke="#111819" stroke-width="5"/>
    <path d="M225 184 C318 160 594 162 728 184 C770 192 779 202 728 216 C594 241 318 238 225 211 C190 199 190 192 225 184 Z" fill="${variant.body}" stroke="#101719" stroke-width="5"/>
    <path d="M220 184 L128 150 L276 174 L276 206 L128 240 L220 212 Z" fill="url(#airframe)" stroke="#111819" stroke-width="4"/>
    <path d="M238 173 L184 124 L300 178 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M238 222 L184 272 L300 216 Z" fill="url(#airframe)" stroke="#111819" stroke-width="3.4"/>
    <path d="M626 169 C660 171 690 176 714 185 C686 191 648 193 604 188 C606 178 613 172 626 169 Z" fill="${variant.canopy}" stroke="#12191a" stroke-width="3"/>
    ${[360, 540]
      .map(
        (x) => `<g>
          <ellipse cx="${x}" cy="190" rx="26" ry="17" fill="#202323" stroke="${variant.trim}" stroke-width="2"/>
          ${propeller(x + 4, 190, 20)}
        </g>`
      )
      .join("")}
    ${roundel(332, 162, variant.roundel, 0.58)}
    ${roundel(568, 162, variant.roundel, 0.58)}
    <path d="M252 198 C376 214 556 212 716 196" fill="none" stroke="${variant.trim}" stroke-width="3" opacity="0.56" stroke-linecap="round"/>
    ${line(292, 169, 612, 218, 1.2, "rgba(232,226,200,0.18)")}
    ${line(292, 218, 612, 169, 1.2, "rgba(232,226,200,0.14)")}
  </g>
</svg>`;
}

function renderAircraft(variant) {
  if (variant.kind === "spitfire") {
    return renderSpitfire(variant);
  }

  if (variant.kind === "b17") {
    return renderB17(variant);
  }

  if (variant.kind === "b25") {
    return renderB25(variant);
  }

  const isBomber = variant.tail === "bomber";
  const isAttack = variant.tail === "attack";
  const wingHalf = variant.wingspan / 2;
  const bodyLength = isBomber ? 320 : isAttack ? 280 : 255;
  const bodyStart = 450 - bodyLength / 2;
  const bodyEnd = 450 + bodyLength / 2;
  const wingY = 180;
  const tailY = isBomber ? 172 : 176;
  const enginePositions = isBomber ? [330, 382, 518, 570] : isAttack ? [356, 544] : [];
  const wingShape = isBomber
    ? `M ${450 - wingHalf} ${wingY + 4} L 450 ${wingY - 30} L ${450 + wingHalf} ${wingY + 4} L ${450 + 94} ${wingY + 34} L ${450 - 94} ${wingY + 34} Z`
    : `M ${450 - wingHalf} ${wingY + 4} L 450 ${wingY - 22} L ${450 + wingHalf} ${wingY + 4} L ${450 + 76} ${wingY + 30} L ${450 - 76} ${wingY + 30} Z`;
  const tailShape = isBomber
    ? `M ${bodyStart + 18} ${tailY} L ${bodyStart - 58} ${tailY - 36} L ${bodyStart + 56} ${tailY - 10} L ${bodyStart + 56} ${tailY + 26} L ${bodyStart - 58} ${tailY + 50} Z`
    : `M ${bodyStart + 26} ${tailY} L ${bodyStart - 48} ${tailY - 34} L ${bodyStart + 54} ${tailY - 8} L ${bodyStart + 54} ${tailY + 24} L ${bodyStart - 48} ${tailY + 48} Z`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="360" viewBox="0 0 900 360">
  <defs>
    <linearGradient id="bodyGradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${variant.body}"/>
      <stop offset="0.62" stop-color="${variant.bodyDark}"/>
      <stop offset="1" stop-color="#101719"/>
    </linearGradient>
    <linearGradient id="wingGradient" x1="0" x2="1">
      <stop offset="0" stop-color="${variant.bodyDark}"/>
      <stop offset="0.5" stop-color="${variant.body}"/>
      <stop offset="1" stop-color="${variant.bodyDark}"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="7" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
  </defs>
  <g filter="url(#softShadow)">
    <path d="${tailShape}" fill="url(#wingGradient)" stroke="rgba(10,18,18,0.74)" stroke-width="4"/>
    <path d="${wingShape}" fill="url(#wingGradient)" stroke="rgba(10,18,18,0.74)" stroke-width="4"/>
    <path d="M ${bodyStart} 181 C ${bodyStart + 42} 146 ${bodyEnd - 86} 145 ${bodyEnd - 16} 174 C ${bodyEnd + 18} 188 ${bodyEnd + 18} 204 ${bodyEnd - 16} 218 C ${bodyEnd - 86} 247 ${bodyStart + 42} 247 ${bodyStart} 211 C ${bodyStart - 18} 198 ${bodyStart - 18} 192 ${bodyStart} 181 Z" fill="url(#bodyGradient)" stroke="#101719" stroke-width="5"/>
    <path d="M ${bodyEnd - 110} 160 C ${bodyEnd - 58} 156 ${bodyEnd - 30} 170 ${bodyEnd - 18} 186 C ${bodyEnd - 52} 192 ${bodyEnd - 88} 192 ${bodyEnd - 128} 185 C ${bodyEnd - 126} 174 ${bodyEnd - 122} 166 ${bodyEnd - 110} 160 Z" fill="${variant.canopy}" stroke="rgba(8,15,18,0.74)" stroke-width="3"/>
    <path d="M ${bodyEnd - 18} 174 C ${bodyEnd + 14} 184 ${bodyEnd + 15} 204 ${bodyEnd - 18} 218 C ${bodyEnd - 2} 203 ${bodyEnd - 2} 188 ${bodyEnd - 18} 174 Z" fill="${variant.nose}" stroke="rgba(8,15,18,0.62)" stroke-width="3"/>
    ${enginePositions
      .map(
        (x) => `<g>
          <ellipse cx="${x}" cy="${wingY + 18}" rx="${isBomber ? 20 : 24}" ry="${isBomber ? 14 : 16}" fill="#202323" stroke="${variant.trim}" stroke-width="2"/>
          ${propeller(x, wingY + 18, isBomber ? 18 : 20)}
        </g>`
      )
      .join("")}
    ${!isBomber && !isAttack ? propeller(bodyEnd + 4, 196, 24) : ""}
    ${roundel(450 - wingHalf * 0.46, wingY + 15, variant.roundel, isBomber ? 0.76 : 0.68)}
    ${roundel(450 + wingHalf * 0.46, wingY + 15, variant.roundel, isBomber ? 0.76 : 0.68)}
    <path d="M ${bodyStart + 34} 190 C ${bodyStart + 116} 206 ${bodyEnd - 118} 207 ${bodyEnd - 42} 192" fill="none" stroke="${variant.trim}" stroke-width="4" opacity="0.74" stroke-linecap="round"/>
    ${line(bodyStart + 80, 164, bodyEnd - 78, 223, 1.5, "rgba(235,229,190,0.3)")}
    ${line(bodyStart + 80, 224, bodyEnd - 78, 164, 1.5, "rgba(235,229,190,0.24)")}
  </g>
</svg>`;
}

for (const variant of variants) {
  const svgPath = resolve(sourceDir, variant.source);
  const outputPath = resolve(outputDir, variant.output);
  writeFileSync(svgPath, renderAircraft(variant), "utf8");

  const result = spawnSync("magick", ["-background", "none", svgPath, "-resize", "900x360!", "-quality", "92", outputPath], {
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`Failed to generate ${variant.output}`);
  }
}
