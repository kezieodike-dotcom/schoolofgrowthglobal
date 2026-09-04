import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = readFileSync(path.join(root, 'src', 'index.css'), 'utf8');
const app = readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');

for (const marker of [
  '@keyframes scroll-card-rise',
  '.scroll-card-grid > *',
  '.scroll-card-reveal',
  '.scroll-card-reveal-in',
  '.scroll-card',
  '.scroll-card-image',
  'translate3d(0, 44px, 0) scale(0.965)',
  '920ms',
  'calc(var(--scroll-index, 0) * 80ms)',
  '.motion-search:focus-within',
  'translate3d(0, -2px, 0)',
  '.motion-pressable:active',
  'prefers-reduced-motion: reduce',
]) {
  if (!css.includes(marker)) {
    throw new Error(`Scroll card entrance CSS should include ${marker}.`);
  }
}

for (const marker of [
  'useLocation',
  'useScrollReveal',
  'IntersectionObserver',
  'threshold: 0.12',
  'MutationObserver',
  'scroll-card-reveal',
  'scroll-card-reveal-in',
  '* 80',
]) {
  if (!app.includes(marker)) {
    throw new Error(`App should control scroll reveals with ${marker}.`);
  }
}

const pages = [
  'src/views/HomeView.tsx',
  'src/views/CoursesView.tsx',
  'src/views/GrowthJobsView.tsx',
  'src/views/EventsView.tsx',
  'src/views/BlogView.tsx',
  'src/views/DonationsView.tsx',
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
