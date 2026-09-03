import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = readFileSync(path.join(root, 'src', 'index.css'), 'utf8');

for (const marker of [
  '@keyframes scroll-card-rise',
  '.scroll-card-grid > *',
  '.scroll-card',
  '.scroll-card-image',
  'animation-timeline: view()',
  'animation-range: entry 0% cover 32%',
  'prefers-reduced-motion: reduce',
]) {
  if (!css.includes(marker)) {
    throw new Error(`Scroll card entrance CSS should include ${marker}.`);
  }
}

const pages = [
  'src/views/CoursesView.tsx',
  'src/views/GrowthJobsView.tsx',
  'src/views/BlogView.tsx',
];

for (const file of pages) {
  const source = readFileSync(path.join(root, file), 'utf8');
  if (!source.includes('scroll-card-grid')) {
    throw new Error(`${file} should reveal card grids on scroll with scroll-card-grid.`);
  }
  if (!source.includes('scroll-card')) {
    throw new Error(`${file} should apply scroll-card to its clickable cards.`);
  }
}

if (css.includes('sharp-card')) {
  throw new Error('Use scroll-card motion classes instead of the rejected sharp-card names.');
}
