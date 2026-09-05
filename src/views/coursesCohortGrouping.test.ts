import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { COURSES } from '../data/mockData';

const root = process.cwd();
const source = readFileSync(path.join(root, 'src', 'views', 'CoursesView.tsx'), 'utf8');

for (const phrase of [
  'COHORT_COURSE_IDS',
  'COHORT_CARD_STYLES',
  'Cohort Programs',
  'Specialized Growth Courses',
  'growth-foundation-cohort',
  'growth-accelerator',
  'executive-circle',
  'elite-council',
  'isCohortCourse',
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Courses page should separate cohort programs from specialized courses: ${phrase}.`);
  }
}

if (!source.includes('Four packages')) {
  throw new Error('Courses page should describe the four available course packages.');
}

if (
  !source.includes(
    'Two-weeks fast track intensive transformation programmes designed to solve a specific problem or develop a specific capability are available for selected modules'
  )
) {
  throw new Error('Courses page should explain the selected-module fast track transformation programmes.');
}

for (const phrase of [
  'cohortStyle ? \'text-xl sm:text-2xl\'',
  'text-sm sm:text-[15px] line-clamp-3',
  'cohortStyle ? \'text-xs\'',
  'px-2.5 py-1.5 text-[11px]',
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Cohort programme cards should use larger typography: ${phrase}.`);
  }
}

if (source.includes("card: 'border-amber-500 bg-slate-950")) {
  throw new Error('Elite Council card should use a lighter premium treatment, not a dark slate background.');
}

if (!source.includes("eliteSurfaceClass = isEliteCohort ? 'bg-white/90 border-amber-200'")) {
  throw new Error('Elite Council inner panels should stay light and readable.');
}

const eliteCouncil = COURSES.find((course) => course.id === 'elite-council');
if (!eliteCouncil) {
  throw new Error('Elite Council course should be present in the course catalogue.');
}

if (eliteCouncil.heroImage !== '/scenes/summit-audience.jpg') {
  throw new Error('Elite Council should use the summit audience image for a suitable premium visual.');
}

if (!existsSync(path.join(root, 'public', eliteCouncil.heroImage))) {
  throw new Error(`Elite Council hero image is missing: ${eliteCouncil.heroImage}`);
}
