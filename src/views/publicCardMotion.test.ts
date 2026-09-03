import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = readFileSync(path.join(root, 'src', 'index.css'), 'utf8');
const publicCardFiles = [
  'src/views/HomeView.tsx',
  'src/views/CoursesView.tsx',
  'src/views/PricingView.tsx',
  'src/views/BooksView.tsx',
  'src/views/EventsView.tsx',
  'src/views/GrowthJobsView.tsx',
  'src/views/BlogView.tsx',
  'src/views/MentorsView.tsx',
];

for (const utility of ['motion-card', 'motion-card-grid', 'motion-card-image', 'motion-card-orbit']) {
  if (!css.includes(`.${utility}`)) {
    throw new Error(`Global CSS should define ${utility}.`);
  }
}

for (const marker of ['@keyframes card-spotlight-sweep', 'animation-timeline: view()', 'rotateX', 'perspective']) {
  if (!css.includes(marker)) {
    throw new Error(`Card motion should include visible Spaceship-style ${marker}.`);
  }
}

for (const file of publicCardFiles) {
  const source = readFileSync(path.join(root, file), 'utf8');
  if (!source.includes('motion-card')) {
    throw new Error(`${file} should apply card motion to public cards.`);
  }
}
