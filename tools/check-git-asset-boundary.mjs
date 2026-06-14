import { execFile } from "node:child_process";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = resolve(new URL("../", import.meta.url).pathname);
const maxTrackedBytes = 100 * 1024 * 1024;
const maxWarnBytes = 50 * 1024 * 1024;
const forbiddenTrackedPatterns = [
  /^engine-cache\//,
  /^engine-workspaces\//,
  /^engine-exports\//,
  /^public\/prototypes\/web3d-terrain-prototype\/tiles\//,
  /^public\/prototypes\/web3d-terrain-prototype\/vendor\//,
  /^tools\/tactical-terrain-studio\/__pycache__\//,
  /\.pyc$/
];

const { stdout } = await execFileAsync("git", ["ls-files"], { cwd: root, maxBuffer: 1024 * 1024 * 12 });
const tracked = stdout.split("\n").filter(Boolean);
const failures = [];
const warnings = [];

for (const file of tracked) {
  if (forbiddenTrackedPatterns.some((pattern) => pattern.test(file))) {
    failures.push({ file, reason: "forbidden tracked generated/cache path" });
  }

  const fileStat = await stat(resolve(root, file));
  if (fileStat.size > maxTrackedBytes) {
    failures.push({ file, reason: `tracked file exceeds ${maxTrackedBytes} bytes`, size: fileStat.size });
  } else if (fileStat.size > maxWarnBytes) {
    warnings.push({ file, reason: `tracked file exceeds ${maxWarnBytes} bytes`, size: fileStat.size });
  }
}

const report = { failures, maxTrackedBytes, warnings };
console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  process.exit(1);
}
