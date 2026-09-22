import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const module = JSON.parse(
  fs.readFileSync(path.join(root, 'data/lms/growth-foundation-module-2.json'), 'utf8')
);
if (!module || !module.title.includes('Growth Mindset')) throw new Error('Module 2 was not imported.');
if (module.coreQuestion !== 'How do I think, learn, adapt and improve?') throw new Error('Module 2 core question is missing.');
if (module.lessons.length < 38) throw new Error('Module 2 lessons are incomplete.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('STUDENT PROJECT'))) throw new Error('Student project lesson is missing.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('PROJECT ASSESSMENT'))) throw new Error('Project assessment lesson is missing.');
if (!JSON.stringify(module).includes('MY 30-DAY GROWTH MINDSET TRANSFORMATION PROJECT')) throw new Error('Module 2 project content is missing.');

const dashboard = fs.readFileSync(path.join(root, 'src/views/LmsStudentDashboardView.tsx'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'src/views/StudentDashboardView.tsx'), 'utf8');
if (!dashboard.includes('useEnrollment') || !dashboard.includes('enrollment.canAccessLevel')) throw new Error('LMS is not student-gated.');
if (!portal.includes('to="/lms"')) throw new Error('Student dashboard is missing the LMS entry point.');
if (!fs.readFileSync(path.join(root, 'src/server/lmsStore.ts'), 'utf8').includes('growth-foundation-module-2.json')) throw new Error('Production LMS store is not loading Module 2.');
