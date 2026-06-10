import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { homedir, userInfo } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const home = homedir();
const label = "com.asukarei.war-animation-lab-5177";
const launchAgentsDir = resolve(home, "Library/LaunchAgents");
const deployRoot = resolve(home, "Library/Application Support/war-animation-lab-oss");
const deployDist = resolve(deployRoot, "dist");
const deployDistPrevious = resolve(deployRoot, "dist.previous");
const deployDistStaging = resolve(deployRoot, "dist.staging");
const deployServer = resolve(deployRoot, "serve-dist.mjs");
const logDir = resolve(home, "Library/Logs/war-animation-lab");
const plistPath = resolve(launchAgentsDir, `${label}.plist`);
const sourceDist = resolve(root, "dist");
const sourceServer = resolve(root, "scripts/serve-dist.mjs");
const preferredNodeBins = [
  process.env.WAR_ANIMATION_NODE,
  resolve(home, ".nvm/versions/node/v22.22.2/bin/node"),
  "/opt/homebrew/Cellar/node/23.11.0/bin/node",
  process.execPath
].filter(Boolean);
const nodeBin = preferredNodeBins.find((candidate) => existsSync(candidate)) ?? process.execPath;
const npmBin = existsSync(resolve(dirname(nodeBin), "npm")) ? resolve(dirname(nodeBin), "npm") : "npm";

const args = new Set(process.argv.slice(2));
const host = readArg("--host") ?? "127.0.0.1";
const port = Number(readArg("--port") ?? 5177);
const shouldBuild = !args.has("--skip-build");
const shouldStart = !args.has("--no-start");

function readArg(name) {
  const prefix = `${name}=`;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length);
    }
  }
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1] && !process.argv[index + 1].startsWith("--")) {
    return process.argv[index + 1];
  }
  return undefined;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    encoding: "utf8",
    stdio: options.stdio ?? "inherit"
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${commandArgs.join(" ")} failed with status ${result.status}`);
  }
  return result;
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function plist() {
  const stdoutPath = resolve(logDir, "war-animation-lab-5177.out.log");
  const stderrPath = resolve(logDir, "war-animation-lab-5177.err.log");
  const pathValue = [
    dirname(process.execPath),
    dirname(nodeBin),
    "/usr/local/bin",
    "/opt/homebrew/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin"
  ].join(":");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${xmlEscape(label)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlEscape(nodeBin)}</string>
    <string>${xmlEscape(deployServer)}</string>
    <string>--host</string>
    <string>${xmlEscape(host)}</string>
    <string>--port</string>
    <string>${String(port)}</string>
    <string>--dist</string>
    <string>${xmlEscape(deployDist)}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xmlEscape(deployRoot)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${xmlEscape(pathValue)}</string>
  </dict>
  <key>StandardOutPath</key>
  <string>${xmlEscape(stdoutPath)}</string>
  <key>StandardErrorPath</key>
  <string>${xmlEscape(stderrPath)}</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
`;
}

function copyDeployFiles() {
  if (!existsSync(resolve(sourceDist, "index.html"))) {
    throw new Error("dist/index.html is missing; run npm run build first or omit --skip-build.");
  }
  mkdirSync(deployRoot, { recursive: true });
  rmSync(deployDistStaging, { recursive: true, force: true });
  rmSync(deployDistPrevious, { recursive: true, force: true });
  cpSync(sourceDist, deployDistStaging, { recursive: true });
  if (existsSync(deployDist)) {
    renameSync(deployDist, deployDistPrevious);
  }
  renameSync(deployDistStaging, deployDist);
  rmSync(deployDistPrevious, { recursive: true, force: true });
  cpSync(sourceServer, deployServer);
}

function launchctl(commandArgs, allowFailure = false) {
  const result = spawnSync("launchctl", commandArgs, { encoding: "utf8" });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`launchctl ${commandArgs.join(" ")} failed:\n${result.stderr || result.stdout}`);
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function servicePath(domain) {
  return `${domain}/${label}`;
}

function isServiceLoaded(domain) {
  return launchctl(["print", servicePath(domain)], true).status === 0;
}

async function waitForServiceUnloaded(domain, timeoutMs = 5000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!isServiceLoaded(domain)) {
      return true;
    }
    await sleep(250);
  }
  return false;
}

async function restartService(domain) {
  launchctl(["bootout", servicePath(domain)], true);
  await waitForServiceUnloaded(domain);
  const bootstrap = launchctl(["bootstrap", domain, plistPath], true);
  if (bootstrap.status === 0) {
    return;
  }

  if (!isServiceLoaded(domain)) {
    throw new Error(`launchctl bootstrap ${domain} ${plistPath} failed:\n${bootstrap.stderr || bootstrap.stdout}`);
  }

  launchctl(["kickstart", "-k", servicePath(domain)]);
}

function waitForHttp(url, timeoutMs = 20_000) {
  const startedAt = Date.now();
  return new Promise((resolveWait, rejectWait) => {
    const probe = () => {
      const req = request(url, { method: "HEAD", timeout: 3000 }, (res) => {
        res.resume();
        if ((res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 400) {
          resolveWait(res.statusCode);
          return;
        }
        retry();
      });
      req.on("timeout", () => {
        req.destroy();
        retry();
      });
      req.on("error", retry);
      req.end();
    };
    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        rejectWait(new Error(`${url} did not respond within ${timeoutMs}ms`));
        return;
      }
      setTimeout(probe, 500);
    };
    probe();
  });
}

if (shouldBuild) {
  run(npmBin, ["run", "build"]);
}

mkdirSync(launchAgentsDir, { recursive: true });
mkdirSync(logDir, { recursive: true });
copyDeployFiles();
writeFileSync(plistPath, plist(), "utf8");
run("plutil", ["-lint", plistPath]);

if (shouldStart) {
  const domain = `gui/${userInfo().uid}`;
  await restartService(domain);
  await waitForHttp(`http://${host}:${port}/`);
  run("curl", ["-fsSI", `http://${host}:${port}/`], { stdio: "inherit" });
}

console.log(`Local preview deployed at http://${host}:${port}/`);
console.log(`LaunchAgent: ${plistPath}`);
console.log(`Published dist: ${deployDist}`);
