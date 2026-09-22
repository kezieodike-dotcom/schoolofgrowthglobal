import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const module = JSON.parse(
  fs.readFileSync(path.join(root, 'data/lms/growth-foundation-module-1.json'), 'utf8')
);

if (module.title !== 'Module 1 — Understanding Yourself') throw new Error('Uploaded Module 1 title is missing.');
if (module.coreQuestion !== 'Who am I?') throw new Error('Uploaded Module 1 core question is missing.');
if (module.lessons.length !== 22) throw new Error('Module 1 should have 22 source sections.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('SELF-AWARENESS AUDIT'))) throw new Error('Self-awareness audit is missing.');
if (!module.lessons.some((lesson: { title: string }) => lesson.title.includes('STUDENT PROJECT'))) throw new Error('Student project is missing.');
if (!JSON.stringify(module).includes('PERSONAL GROWTH PROFILE')) throw new Error('Personal Growth Profile content is missing.');

const store = fs.readFileSync(path.join(root, 'src/server/lmsStore.ts'), 'utf8');
if (!store.includes('growth-foundation-module-1.json')) throw new Error('Production LMS store is not loading the uploaded Module 1.');

const portal = fs.readFileSync(path.join(root, 'src/views/StudentDashboardView.tsx'), 'utf8');
if (!portal.includes('Open Growth Foundation')) throw new Error('Student dashboard does not explain where to open the course.');
