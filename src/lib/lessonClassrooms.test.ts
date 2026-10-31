import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { getLmsCourse } from '../server/lmsStore.js';
import { CLASSROOM_ASSETS, getLessonClassroom, isClassroomLesson } from './lessonClassrooms.js';

const course = getLmsCourse('growth-foundation')!;

test('most lesson pages in every module have a topic-matched classroom image', () => {
  for (const module of course.modules) {
    const illustrated = module.lessons.filter(lesson => getLessonClassroom(course.id, lesson));
    assert.ok(illustrated.length > module.lessons.length / 2, `${module.id}: ${illustrated.length}/${module.lessons.length}`);
  }
});

test('no image is assigned more than three times and all assignments exist', () => {
  const lessons = new Map(course.modules.flatMap(module => module.lessons.map(lesson => [lesson.id, lesson] as const)));
  const usedLessons = new Set<string>();
  const usedSources = new Set<string>();
  const usedImages = new Set<string>();
  for (const asset of CLASSROOM_ASSETS) {
    assert.ok(asset.lessonIds.length > 0 && asset.lessonIds.length <= 3);
    assert.ok(!usedSources.has(asset.src), asset.src);
    usedSources.add(asset.src);
    const file = path.join(process.cwd(), 'public', asset.src);
    assert.ok(fs.existsSync(file), asset.src);
    const bytes = fs.readFileSync(file);
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.ok(!usedImages.has(hash), `Duplicate image contents: ${asset.src}`);
    usedImages.add(hash);
    assert.ok(bytes.length < 350_000, `Image should be optimized: ${asset.src}`);
    assert.ok(asset.alt.length > 30);
    for (const id of asset.lessonIds) {
      assert.ok(!usedLessons.has(id), id);
      usedLessons.add(id);
      const lesson = lessons.get(id);
      assert.ok(lesson, id);
      assert.ok(isClassroomLesson(lesson), lesson.title);
      assert.equal(getLessonClassroom(course.id, lesson)?.src, asset.src);
    }
  }
});

test('tests, projects, conclusions and activity-only pages never receive images', () => {
  for (const title of ['Objective Test Questions', 'TEST', 'Student Project', 'Project guide', 'Conclusion', 'Conclusions', 'Final module message', 'Module completion standard', 'Assessment rubric', 'Answer key', 'Quiz', 'Examination', 'Capstone', 'Reflection questions']) {
    const lesson = { id: 'module-1-lesson-3', title, blocks: [{ id: 'reading', type: 'reading' as const }] };
    assert.equal(getLessonClassroom(course.id, lesson), null, title);
  }
  for (const type of ['objective_test', 'growth_project', 'assignment', 'implementation_challenge'] as const) {
    assert.equal(getLessonClassroom(course.id, { id: 'module-1-lesson-3', title: 'An activity', blocks: [{ id: 'activity', type }] }), null);
  }
});

test('unassigned lessons and other courses do not inherit reused images', () => {
  const lesson = { id: 'module-1-lesson-3', title: 'Identity', blocks: [] };
  assert.equal(getLessonClassroom('another-course', lesson), null);
  assert.equal(getLessonClassroom(course.id, { ...lesson, id: 'new-lesson' }), null);
});
