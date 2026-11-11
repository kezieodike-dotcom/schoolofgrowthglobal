import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getIntensiveCourse } from './intensiveCourses.js';
import { getLmsCourse } from './lmsStore.js';
import { PLANS, hasCourseAccess } from '../lib/pricing.js';

test('intensives contain exactly their advertised original Foundation modules', () => {
  const foundation = getLmsCourse('growth-foundation')!;
  for (const [id, moduleIds] of [
    ['self-discovery-productivity', ['module-1', 'module-3', 'module-4']],
    ['mindset-career-development', ['module-2', 'module-5', 'module-6']],
  ] as const) {
    const intensive = getIntensiveCourse(id)!;
    assert.deepEqual(intensive.modules, moduleIds.map(id => foundation.modules.find(module => module.id === id)));
    assert.ok(intensive.modules.every(module => module.lessons.length > 0));
    assert.ok(!intensive.modules.some(module => module.id === 'module-8'));
  }
  assert.equal(getIntensiveCourse('not-a-course'), null);
});

test('an intensive purchase does not unlock the full cohort', () => {
  const now = new Date();
  const intensive = { plan: PLANS['foundation-intensive'].code, reference: 'test', email: 'test@example.com',
    purchasedAt: now.toISOString(), coursesExpireAt: new Date(now.getTime() + 86400000).toISOString(),
    mentorshipExpiresAt: now.toISOString(), levels: ['Emerging Leaders'] as const };
  assert.equal(hasCourseAccess([{ ...intensive, levels: [...intensive.levels] }], 'Emerging Leaders'), false);
});
