import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const root = new URL("../", import.meta.url);
const generator = new URL("scripts/build-britain-air-unit-icons.py", root);
const ensureModels = new URL("scripts/ensure-segmentation-models.mjs", root);
const modelHome = new URL("engine-cache/models/segmentation/", root);

await execFileAsync("node", [ensureModels.pathname], {
  cwd: root.pathname,
  maxBuffer: 1024 * 1024 * 4
});

const { stdout, stderr } = await execFileAsync("python3", [generator.pathname], {
  cwd: root.pathname,
  env: {
    ...process.env,
    OMP_NUM_THREADS: process.env.OMP_NUM_THREADS ?? "4",
    U2NET_HOME: modelHome.pathname
  },
  maxBuffer: 1024 * 1024 * 12
});

if (stdout) {
  process.stdout.write(stdout);
}
if (stderr) {
  process.stderr.write(stderr);
}
