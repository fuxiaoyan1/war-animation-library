import { createReadStream, existsSync, statSync } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const cwd = scriptDir.endsWith(`${sep}scripts`) ? resolve(scriptDir, "..") : scriptDir;
const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg.startsWith("--")) {
    const nextArg = process.argv[index + 1];
    if (!nextArg || nextArg.startsWith("--")) {
      args.set(arg.slice(2), "true");
    } else {
      args.set(arg.slice(2), nextArg);
      index += 1;
    }
  }
}

const host = args.get("host") ?? "127.0.0.1";
const port = Number(args.get("port") ?? 5177);
const distDir = resolve(cwd, args.get("dist") ?? "dist");
const indexPath = join(distDir, "index.html");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".oga", "audio/ogg"],
  [".ogg", "audio/ogg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

function isInsideDist(filePath) {
  const normalized = normalize(filePath);
  return normalized === distDir || normalized.startsWith(`${distDir}${sep}`);
}

async function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = resolve(distDir, `.${cleanPath}`);
  const isAssetRequest = cleanPath.startsWith("/assets/");

  if (!isInsideDist(filePath)) {
    return isAssetRequest ? null : indexPath;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      return filePath;
    }
  } catch {
    return isAssetRequest ? null : indexPath;
  }

  return isAssetRequest ? null : indexPath;
}

async function ensureDistReady() {
  await access(indexPath);
}

function cacheControlFor(filePath) {
  if (filePath === indexPath) {
    return "no-cache";
  }

  if (normalize(filePath).includes(`${sep}assets${sep}unit-icons${sep}`)) {
    return "no-cache";
  }

  if (normalize(filePath).includes(`${sep}assets${sep}weather${sep}`)) {
    return "no-cache";
  }

  return "public, max-age=31536000, immutable";
}

await ensureDistReady();

const server = createServer(async (request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method Not Allowed");
    return;
  }

  const filePath = await resolveRequestPath(request.url);
  if (!filePath) {
    const message = "Not Found";
    response.writeHead(404, {
      "Cache-Control": "no-cache",
      "Content-Length": Buffer.byteLength(message),
      "Content-Type": "text/plain; charset=utf-8"
    });
    response.end(request.method === "HEAD" ? undefined : message);
    return;
  }
  const contentType = mimeTypes.get(extname(filePath)) ?? "application/octet-stream";

  try {
    const fileStat = statSync(filePath);
    response.writeHead(200, {
      "Cache-Control": cacheControlFor(filePath),
      "Content-Length": fileStat.size,
      "Content-Type": contentType
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    const fallback = await readFile(indexPath);
    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Length": fallback.length,
      "Content-Type": "text/html; charset=utf-8"
    });
    response.end(request.method === "HEAD" ? undefined : fallback);
  }
});

server.on("error", (error) => {
  console.error("war-animation-lab static server error", error);
  setImmediate(() => process.exit(1));
});

server.on("close", () => {
  console.log("war-animation-lab static server closed");
});

server.listen(port, host, () => {
  console.log(`war-animation-lab serving ${distDir} at http://${host}:${port}/`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
