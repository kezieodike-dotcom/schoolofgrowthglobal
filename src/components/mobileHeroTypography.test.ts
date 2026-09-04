import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pageHero = readFileSync(path.join(root, 'src', 'components', 'PageHero.tsx'), 'utf8');
const donate = readFileSync(path.join(root, 'src', 'views', 'DonationsView.tsx'), 'utf8');
const css = readFileSync(path.join(root, 'src', 'index.css'), 'utf8');

for (const marker of [
  'imageSrc?: string',
  'lg:hidden',
  'bg-slate-950/72',
  'font-semibold lg:font-bold',
  'text-white lg:text-slate-900',
  'text-slate-100/90 lg:text-slate-600',
]) {
  if (!pageHero.includes(marker)) {
    throw new Error(`PageHero should support mobile background-overlay heroes: ${marker}.`);
  }
}

const pageHeroFiles = [
  ['src/views/AboutView.tsx', '/scenes/leadership-meeting.jpg'],
  ['src/views/BooksView.tsx', '/scenes/hero-team.jpg'],
  ['src/views/ContactView.tsx', '/scenes/coaching-collab.jpg'],
  ['src/views/CoursesView.tsx', '/scenes/bootcamp-team.jpg'],
  ['src/views/EventsView.tsx', '/scenes/summit-audience.jpg'],
  ['src/views/GrowthJobsView.tsx', '/scenes/finance-documents.jpg'],
  ['src/views/BlogView.tsx', '/scenes/leadership-meeting.jpg'],
  ['src/views/MentorsView.tsx', '/scenes/coaching-collab.jpg'],
  ['src/views/PricingView.tsx', '/scenes/wealth-planning.jpg'],
  ['src/views/RegisterView.tsx', '/scenes/hero-team.jpg'],
  ['src/views/MentorRegistrationView.tsx', '/scenes/leadership-meeting.jpg'],
] as const;

for (const [file, image] of pageHeroFiles) {
  const source = readFileSync(path.join(root, file), 'utf8');
  if (!source.includes(`imageSrc="${image}"`)) {
    throw new Error(`${file} should pass mobile hero image ${image}.`);
  }
}

for (const marker of [
  'lg:hidden',
  'from-slate-950/82',
  'text-white lg:text-slate-950',
  'text-slate-100/90 lg:text-slate-600',
]) {
  if (!donate.includes(marker)) {
    throw new Error(`Donate hero should use a mobile background overlay: ${marker}.`);
  }
}

for (const marker of [
  'font-size: 15.5px',
  'line-height: 1.65',
  'p,',
  'li {',
  'font-weight: 400',
]) {
  if (!css.includes(marker)) {
    throw new Error(`Global typography should improve mobile body reading: ${marker}.`);
  }
}
