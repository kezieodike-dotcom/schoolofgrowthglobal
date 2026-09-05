import { readFileSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const searchRoots = ['src', 'components'];
const files: string[] = [];

function collectFiles(dir: string) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectFiles(fullPath);
    } else if (/\.(tsx|ts|css)$/.test(entry) && !entry.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
}

for (const dir of searchRoots) collectFiles(path.join(root, dir));

const bannedPatterns = [
  /\banimate-(?!spin\b)/,
  /\bmotion-card/,
  /\bmotion-orbit-drift/,
  /\bmotion-float-lift/,
  /\bmotion-accent-sweep/,
  /<motion\.(?!div|article)/,
];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const pattern of bannedPatterns) {
    if (pattern.test(source)) {
      throw new Error(`${path.relative(root, file)} still contains animation marker ${pattern}.`);
    }
  }
}

const css = readFileSync(path.join(root, 'src', 'index.css'), 'utf8');
if (!css.includes('@keyframes scroll-card-rise')) {
  throw new Error('Global CSS should keep the approved scroll card entrance animation.');
}

if (css.includes('@keyframes card-breathe') || css.includes('@keyframes card-spotlight-sweep')) {
  throw new Error('Old heavy card motion utilities should stay removed.');
}
