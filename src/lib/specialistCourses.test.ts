import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { PROFESSIONAL_COURSES, isProfessionalCourseId } from '../data/professionalCourses.js';
import { ACADEMIC_COURSES } from './academicCatalogue.js';
import { FEATURED_SHORT_COURSES } from '../data/featuredShortCourses.js';
import { PLANS, entitlementFor, hasMentorshipAccess } from './pricing.js';

const ids = ['ai-001', 'ai-002', 'governance-001', 'governance-005', 'governance-013', 'governance-014', 'governance-015'];

test('seven distinct manuscripts join the existing paid catalogue under the correct schools', () => {
  for (const id of ids) {
    const course = PROFESSIONAL_COURSES.find(course => String(course.id) === id);
    assert.ok(course, id);
    assert.ok(isProfessionalCourseId(id));
    const matches = ACADEMIC_COURSES.filter(entry => entry.courseId === id);
    assert.equal(matches.length, 1, id);
    assert.equal(matches[0].schoolId, id.startsWith('ai-') ? 'artificial-intelligence' : 'governance-and-public-administration');
    assert.equal(matches[0].href, `/courses/${id}`);
    assert.ok(existsSync(new URL(`../../public${course.image}`, import.meta.url)), `${id} cover`);
  }
  assert.equal(PROFESSIONAL_COURSES.filter(course => course.title === 'Public Accountability').length, 1);
  assert.equal(new Set(PROFESSIONAL_COURSES.map(course => course.id)).size, PROFESSIONAL_COURSES.length);
});

test('adding courses preserves homepage priorities and existing purchase terms', () => {
  assert.deepEqual(FEATURED_SHORT_COURSES.slice(0, 6).map(course => course.id), [
    'leadership-001', 'customer-relationship-service-excellence', 'professional-ethics-workplace-integrity',
    'leadership-005', 'leadership-006', 'leadership-004',
  ]);
  for (const id of ['customer-relationship-service-excellence', 'professional-ethics-workplace-integrity'] as const) {
    assert.equal(PLANS[id].amountKobo, 250_000);
  }
  for (const id of ids) {
    assert.ok(isProfessionalCourseId(id));
    const plan = PLANS[id];
    assert.equal(plan.kind, 'individual-course');
    assert.equal(plan.amountKobo, 1_500_000);
    const entitlement = entitlementFor(plan, { reference: 'isolated-course-fixture', email: 'buyer@example.test' });
    assert.deepEqual(entitlement.levels, []);
    assert.equal(hasMentorshipAccess([entitlement]), false);
  }
});
