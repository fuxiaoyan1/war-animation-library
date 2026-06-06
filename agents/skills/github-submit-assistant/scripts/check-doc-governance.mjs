#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

const fail = [];

const requiredFiles = [
  'README.md',
  'NOTICE.md',
  'DISCLAIMER.md',
  'SOURCE_INDEX.md',
  'agents/skills/github-submit-assistant/SKILL.md',
];

for (const file of requiredFiles) {
  if (!exists(file)) fail.push(`Missing required documentation file: ${file}`);
}

const sourceDir = path.join(root, 'docs/sources');
const sourceFiles = fs.existsSync(sourceDir)
  ? fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md')).map((name) => `docs/sources/${name}`).sort()
  : [];

if (!sourceFiles.length) {
  fail.push('Missing source logs under docs/sources/*.md');
}

const hosts = new Set();
const urlPattern = /https?:\/\/[^\s<>`"，。；、]+/g;

for (const file of sourceFiles) {
  const text = read(file);
  const urls = text.match(urlPattern) || [];
  for (const rawUrl of urls) {
    const url = rawUrl.replace(/[),.;。；]+$/g, '');
    try {
      hosts.add(new URL(url).hostname);
    } catch {
      fail.push(`Invalid URL in ${file}: ${url}`);
    }
  }
}

if (exists('SOURCE_INDEX.md')) {
  const sourceIndex = read('SOURCE_INDEX.md');
  const missing = [...hosts].filter((host) => !sourceIndex.includes(host)).sort();
  if (missing.length) {
    fail.push(`SOURCE_INDEX.md missing source host(s): ${missing.join(', ')}`);
  }
}

if (exists('DISCLAIMER.md')) {
  const disclaimer = read('DISCLAIMER.md');
  const missing = [...hosts].filter((host) => !disclaimer.includes(host)).sort();
  if (missing.length) {
    fail.push(`DISCLAIMER.md missing source host(s): ${missing.join(', ')}`);
  }
}

const bilingualFiles = [
  'README.md',
  'NOTICE.md',
  'DISCLAIMER.md',
  'agents/README.md',
  'docs/animation-assistant-agent.md',
  'agents/skills/github-submit-assistant/SKILL.md',
  ...fs.existsSync(path.join(root, 'docs/updates'))
    ? fs.readdirSync(path.join(root, 'docs/updates'))
        .filter((name) => name.endsWith('.md'))
        .map((name) => `docs/updates/${name}`)
        .sort()
    : [],
];

const hasChinese = (text) => /[\u3400-\u9fff]/.test(text);
const hasEnglishWord = (text) => /\b[A-Za-z][A-Za-z-]{2,}\b/.test(text);

for (const file of bilingualFiles) {
  if (!exists(file)) {
    fail.push(`Missing bilingual documentation target: ${file}`);
    continue;
  }
  const text = read(file);
  if (!hasChinese(text) || !hasEnglishWord(text)) {
    fail.push(`Bilingual documentation target lacks Chinese or English content: ${file}`);
  }
}

if (fail.length) {
  console.error('Documentation governance check failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Documentation governance check passed: ${hosts.size} source host(s), ${bilingualFiles.length} bilingual documentation target(s).`);
