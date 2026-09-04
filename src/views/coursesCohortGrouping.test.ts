import { readFileSync } from 'node:fs';
import path from 'node:path';

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
