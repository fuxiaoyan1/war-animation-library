import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const expectedBase = process.env.GITHUB_PAGES_BASE ?? "/war-animation-library/";
const terrainComponentPath = resolve(root, "src/components/BattleOfBritainTerrain3D.tsx");
const indexPath = resolve(root, "dist/index.html");

const terrainSource = await readFile(terrainComponentPath, "utf8");
const indexHtml = await readFile(indexPath, "utf8");

const sourceChecks = [
  {
    label: "imports publicPath",
    pattern: /import \{ publicPath \} from "\.\.\/lib\/publicPath";/
  },
  {
    label: "resolves terrain tiles",
    pattern: /const resolvedTerrainTileUrl = publicPath\(terrainTileUrl\);/
  },
  {
    label: "resolves topo tiles",
    pattern: /const resolvedTopoTileUrl = publicPath\(topoTileUrl\);/
  },
  {
    label: "resolves runtime contours",
    pattern: /const resolvedRuntimeContourUrl = publicPath\(runtimeContourUrl\);/
  },
  {
    label: "resolves runtime relief texture",
    pattern: /const resolvedRuntimeReliefTextureUrl = publicPath\(runtimeReliefTextureUrl\);/
  },
  {
    label: "resolves runtime transport texture",
    pattern: /const resolvedRuntimeTransportReferenceUrl = publicPath\(runtimeTransportReferenceUrl\);/
  },
  {
    label: "MapLibre topo source uses resolved URL",
    pattern: /tiles:\s*\[resolvedTopoTileUrl\]/
  },
  {
    label: "MapLibre real DEM source uses resolved URL",
    pattern: /tiles:\s*\[resolvedTerrainTileUrl\]/
  },
  {
    label: "MapLibre runtime contour source uses resolved URL",
    pattern: /data:\s*resolvedRuntimeContourUrl/
  },
  {
    label: "MapLibre runtime relief image uses resolved URL",
    pattern: /url:\s*resolvedRuntimeReliefTextureUrl/
  },
  {
    label: "MapLibre runtime transport image uses resolved URL",
    pattern: /url:\s*resolvedRuntimeTransportReferenceUrl/
  },
  {
    label: "DOM exposes resolved terrain source for browser regression",
    pattern: /data-resolved-terrain-source=\{resolvedTerrainTileUrl\}/
  },
  {
    label: "DOM exposes resolved topo source for browser regression",
    pattern: /data-resolved-topo-source=\{resolvedTopoTileUrl\}/
  }
];

const failures = sourceChecks
  .filter((check) => !check.pattern.test(terrainSource))
  .map((check) => ({
    label: check.label,
    reason: "BattleOfBritainTerrain3D no longer satisfies the GitHub Pages base-path asset contract"
  }));

if (!indexHtml.includes(`src="${expectedBase}assets/`) || !indexHtml.includes(`href="${expectedBase}assets/`)) {
  failures.push({
    label: "dist index asset refs use GitHub Pages base",
    reason: `dist/index.html should reference bundled JS/CSS under ${expectedBase}assets/ after GITHUB_PAGES=true build`
  });
}

const report = {
  expectedBase,
  failures,
  sourceChecks: sourceChecks.length
};
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  process.exit(1);
}
