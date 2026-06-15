import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { homedir, userInfo } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, "..");
const home = homedir();
const launchAgentsDir = resolve(home, "Library/LaunchAgents");
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
const instance = normalizeInstance(readArg("--instance") ?? process.env.WAR_ANIMATION_PREVIEW_INSTANCE ?? "");
const label = instance ? `com.asukarei.war-animation-lab-${instance}-${port}` : `com.asukarei.war-animation-lab-${port}`;
const defaultLabelForPort = `com.asukarei.war-animation-lab-${port}`;
const deployRootName = instance ? `war-animation-lab-oss-${instance}` : "war-animation-lab-oss";
const deployRoot = resolve(home, "Library/Application Support", deployRootName);
const deployDist = resolve(deployRoot, "dist");
const deployDistPrevious = resolve(deployRoot, "dist.previous");
const deployDistStaging = resolve(deployRoot, "dist.staging");
const deployServer = resolve(deployRoot, "serve-dist.mjs");
const logDir = resolve(home, "Library/Logs/war-animation-lab");
const logPrefix = instance ? `war-animation-lab-${instance}-${port}` : `war-animation-lab-${port}`;
const plistPath = resolve(launchAgentsDir, `${label}.plist`);
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

function normalizeInstance(value) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!normalized || normalized === "default" || normalized === "shared") {
    return "";
  }
  return normalized;
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

function readCommand(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return result.status === 0 ? result.stdout.trim() : "";
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
  const stdoutPath = resolve(logDir, `${logPrefix}.out.log`);
  const stderrPath = resolve(logDir, `${logPrefix}.err.log`);
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

function buildPublicationManifest() {
  const indexHtmlPath = resolve(deployDist, "index.html");
  const indexHtml = existsSync(indexHtmlPath) ? readFileSync(indexHtmlPath, "utf8") : "";
  const assetRefs = [...indexHtml.matchAll(/(?:src|href)="([^"]*\/assets\/index-[^"]+\.(?:js|css))"/g)].map((match) => match[1]);
  const gitStatus = readCommand("git", ["status", "--short"]);
  return {
    schemaVersion: 1,
    project: "war-animation-lab-oss",
    instance: instance || "default",
    sourceRoot: root,
    branch: readCommand("git", ["branch", "--show-current"]),
    commit: readCommand("git", ["rev-parse", "HEAD"]),
    dirty: gitStatus.length > 0,
    assetRefs,
    host,
    port,
    label,
    deployRoot,
    publishedAt: new Date().toISOString()
  };
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
  const publicationManifest = JSON.stringify(buildPublicationManifest(), null, 2);
  writeFileSync(resolve(deployDist, "preview-publication-manifest.json"), `${publicationManifest}\n`, "utf8");
  writeFileSync(resolve(deployRoot, "preview-publication-manifest.json"), `${publicationManifest}\n`, "utf8");
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

function servicePath(domain, serviceLabel = label) {
  return `${domain}/${serviceLabel}`;
}

function isServiceLoaded(domain, serviceLabel = label) {
  return launchctl(["print", servicePath(domain, serviceLabel)], true).status === 0;
}

async function waitForServiceUnloaded(domain, serviceLabel = label, timeoutMs = 5000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (!isServiceLoaded(domain, serviceLabel)) {
      return true;
    }
    await sleep(250);
  }
  return false;
}

async function stopConflictingServices(domain) {
  if (!instance || defaultLabelForPort === label) {
    return;
  }

  if (isServiceLoaded(domain, defaultLabelForPort)) {
    launchctl(["bootout", servicePath(domain, defaultLabelForPort)], true);
    await waitForServiceUnloaded(domain, defaultLabelForPort);
  }
}

async function restartService(domain) {
  await stopConflictingServices(domain);
  launchctl(["bootout", servicePath(domain)], true);
  await waitForServiceUnloaded(domain, label);
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
console.log(`Instance: ${instance || "default"}`);
console.log(`LaunchAgent: ${plistPath}`);
console.log(`Published dist: ${deployDist}`);
