import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const module = JSON.parse(
  fs.readFileSync(path.join(root, 'data/lms/growth-foundation-module-2.json'), 'utf8')
);
if (!module || !module.title.includes('Growth Mindset')) throw new Error('Module 2 was not imported.');
if (module.coreQuestion !== 'How do I think, learn, adapt and improve?') throw new Error('Module 2 core question is missing.');
if (!module.sourceMetadata?.includes('Institutional Philosophy: Leadership. Strategy. Transformation.')) throw new Error('Module 2 source metadata is missing.');
if (module.lessons.length < 38) throw new Error('Module 2 lessons are incomplete.');
if (module.lessons[0]?.title !== '2.0 MODULE INTRODUCTION' || module.lessons[37]?.title !== '2.37 FINAL MODULE MESSAGE') throw new Error('Module 2 lessons should use 2.x numbering.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('STUDENT PROJECT'))) throw new Error('Student project lesson is missing.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('PROJECT ASSESSMENT'))) throw new Error('Project assessment lesson is missing.');
if (!JSON.stringify(module).includes('MY 30-DAY GROWTH MINDSET TRANSFORMATION PROJECT')) throw new Error('Module 2 project content is missing.');

const dashboard = fs.readFileSync(path.join(root, 'src/views/LmsStudentDashboardView.tsx'), 'utf8');
const portal = fs.readFileSync(path.join(root, 'src/views/StudentDashboardView.tsx'), 'utf8');
if (!dashboard.includes('useEnrollment') || !dashboard.includes('enrollment.canAccessLevel')) throw new Error('LMS is not student-gated.');
if (!portal.includes('to="/lms"')) throw new Error('Student dashboard is missing the LMS entry point.');
if (!fs.readFileSync(path.join(root, 'src/server/lmsStore.ts'), 'utf8').includes('growth-foundation-module-2.json')) throw new Error('Production LMS store is not loading Module 2.');
for (const [number, expectedTitle, firstTitle, lastTitle, minimumLessons] of [
  ['3', 'Purpose, Vision & Direction', '3.0 MODULE INTRODUCTION', '3.46 FINAL MODULE MESSAGE', 47],
  ['4', 'Personal Productivity', '4.0 MODULE INTRODUCTION', '4.62 FINAL MODULE MESSAGE', 63],
] as const) {
  const uploaded = JSON.parse(
    fs.readFileSync(path.join(root, `data/lms/growth-foundation-module-${number}.json`), 'utf8')
  );
  if (!uploaded.title.includes(expectedTitle)) throw new Error(`Module ${number} title is missing.`);
  if (uploaded.lessons.length < minimumLessons) throw new Error(`Module ${number} lessons are incomplete.`);
  if (uploaded.lessons[0]?.title !== firstTitle || uploaded.lessons.at(-1)?.title !== lastTitle) {
    throw new Error(`Module ${number} lessons should use ${number}.x numbering.`);
  }
  if (!uploaded.sourceMetadata?.includes('Institutional Philosophy: Leadership. Strategy. Transformation.')) {
    throw new Error(`Module ${number} source metadata is missing.`);
  }
}
const store = fs.readFileSync(path.join(root, 'src/server/lmsStore.ts'), 'utf8');
if (!store.includes('growth-foundation-module-3.json') || !store.includes('growth-foundation-module-4.json')) {
  throw new Error('Production LMS store is not loading Modules 3 and 4.');
}
