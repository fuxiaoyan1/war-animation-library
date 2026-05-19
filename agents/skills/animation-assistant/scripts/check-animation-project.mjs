#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const projectDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const requiredPaths = [
  "package.json",
  "src",
  "src/data",
  "src/lib",
  "docs/sources",
  "tests"
];

const result = {
  projectDir,
  missing: [],
  packageScripts: {},
  hasDataTestIds: false,
  sourceDocs: []
};

for (const relativePath of requiredPaths) {
  if (!fs.existsSync(path.join(projectDir, relativePath))) {
    result.missing.push(relativePath);
  }
}

const packagePath = path.join(projectDir, "package.json");
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  result.packageScripts = pkg.scripts ?? {};
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "dist") {
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

for (const file of walk(path.join(projectDir, "src"))) {
  if (/\.(tsx?|jsx?|vue|svelte)$/.test(file)) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("data-testid")) {
      result.hasDataTestIds = true;
      break;
    }
  }
}

result.sourceDocs = walk(path.join(projectDir, "docs", "sources"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => path.relative(projectDir, file));

console.log(JSON.stringify(result, null, 2));

if (result.missing.length > 0 || !result.hasDataTestIds) {
  process.exitCode = 1;
}
