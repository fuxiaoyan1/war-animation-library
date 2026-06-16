import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(new URL("../../", import.meta.url).pathname);
const prototypeRoot = resolve(root, "public/prototypes/web3d-terrain-prototype");
const vendorDir = resolve(prototypeRoot, "vendor");

async function copyVendor() {
  await mkdir(vendorDir, { recursive: true });
  const copies = [
    ["node_modules/maplibre-gl/dist/maplibre-gl.css", "maplibre-gl.css"],
    ["node_modules/maplibre-gl/dist/maplibre-gl.js", "maplibre-gl.js"],
    ["node_modules/three/build/three.module.js", "three.module.js"]
  ];

  for (const [from, to] of copies) {
    await copyFile(resolve(root, from), resolve(vendorDir, to));
  }
}

async function generateTiles() {
  await execFileAsync("python3", [resolve(root, "tools/tactical-terrain-studio/generate-web3d-prototype-tiles.py")], {
    cwd: root,
    maxBuffer: 1024 * 1024 * 16
  });
}

await copyVendor();
await generateTiles();
console.log(`prepared Web 3D prototype vendor and synthetic tiles under ${prototypeRoot}`);
