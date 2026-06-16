import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const manifestPath = resolve(root, "tools/models/segmentation/model-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

async function hashFile(path, algorithm) {
  const hash = createHash(algorithm);
  await new Promise((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolvePromise);
  });
  return hash.digest("hex");
}

async function verifyModel(model) {
  const path = resolve(root, model.cachePath);
  try {
    await access(path);
  } catch {
    await mkdir(dirname(path), { recursive: true });
    throw new Error(
      [
        `Missing segmentation model: ${model.cachePath}`,
        `Expected file: ${model.file}`,
        `Place it under ${model.cachePath}.`,
        "This large model is intentionally kept outside Git; see tools/models/segmentation/model-manifest.json."
      ].join("\n")
    );
  }

  const fileStat = await stat(path);
  if (fileStat.size !== model.size) {
    throw new Error(`Bad model size for ${model.cachePath}: ${fileStat.size}, expected ${model.size}`);
  }

  const sha256 = await hashFile(path, "sha256");
  if (sha256 !== model.sha256) {
    throw new Error(`Bad SHA256 for ${model.cachePath}: ${sha256}, expected ${model.sha256}`);
  }

  const md5 = await hashFile(path, "md5");
  if (md5 !== model.md5) {
    throw new Error(`Bad MD5 for ${model.cachePath}: ${md5}, expected ${model.md5}`);
  }

  return { ...model, path, verified: true };
}

const verified = [];
for (const model of manifest.models) {
  verified.push(await verifyModel(model));
}

console.log(JSON.stringify({ models: verified.map(({ cachePath, file, id, md5, sha256, size }) => ({ cachePath, file, id, md5, sha256, size })) }, null, 2));
