import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = readFileSync(path.join(root, 'src', 'components', 'GlobalFlagMarquee.tsx'), 'utf8');
const layout = readFileSync(path.join(root, 'src', 'components', 'Layout.tsx'), 'utf8');
const home = readFileSync(path.join(root, 'src', 'views', 'HomeView.tsx'), 'utf8');
const countryCount = (source.match(/country: '/g) ?? []).length;

if (countryCount < 18) {
  throw new Error('Global flag marquee should include many countries, not just a small sample.');
}

for (const country of ['Nigeria', 'United Kingdom', 'United States', 'Ghana', 'Kenya', 'South Africa']) {
  if (!source.includes(`country: '${country}'`)) {
    throw new Error(`Global flag marquee should visibly include ${country}.`);
  }
}

if (!source.includes('LEADERSHIP. STRATEGY. TRANSFORMATION ACROSS BORDERS')) {
  throw new Error('Global flag marquee should use the approved leadership strategy transformation copy.');
}

if (source.includes('Learners, mentors, donors and partners across borders')) {
  throw new Error('Global flag marquee should not use the old learner/mentor/donor partner copy.');
}

for (const marker of [
  'aria-label="Global countries marquee"',
  'duration={34}',
  'duration={42}',
  'reverse',
  'useReducedMotion',
  "style={{ position: 'relative' }}",
]) {
  if (!source.includes(marker)) {
    throw new Error(`Global flag marquee should keep the requested rolling layout behavior: ${marker}.`);
  }
}

if (/fixed|absolute/.test(source)) {
  throw new Error('Global flag marquee should stay in normal page flow and must not use fixed or absolute positioning.');
}

if (layout.includes('<GlobalFlagMarquee />') || layout.includes("from './GlobalFlagMarquee'")) {
  throw new Error('Global flag marquee should not render from the shared layout.');
}

if (!home.includes('<GlobalFlagMarquee />')) {
  throw new Error('Home page should render the global flag marquee.');
}

if (home.indexOf('<GlobalFlagMarquee />') > home.indexOf('{/* Hero Section */}')) {
  throw new Error('Global flag marquee should appear before the home hero section.');
}
