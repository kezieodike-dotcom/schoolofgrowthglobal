import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LEADERSHIP_COURSES, isLeadershipCourseId } from '../data/leadershipPricing.js';
import { PLANS, entitlementFor, hasCourseAccess, hasMentorshipAccess, isPlanCode } from './pricing.js';
import { isReadyLeadershipCourse } from '../server/leadershipCourseStore.js';
import { issueLeadershipAccess, readLeadershipAccess, isLeadershipPayment } from '../server/leadershipAccess.js';

test('the 19 individual courses use the PDF fees, in order', () => {
  assert.deepEqual(LEADERSHIP_COURSES.map(course => course.feeNaira), [15000, 15000, 15000, 20000, 25000, 20000, 15000, 15000, 20000, 20000, 20000, 15000, 20000, 15000, 25000, 20000, 25000, 15000, 20000]);
  assert.equal(new Set(LEADERSHIP_COURSES.map(course => course.id)).size, 19);
  assert.equal(LEADERSHIP_COURSES[13].title, 'Emotional Intelligence in Leadership');
  assert.equal(LEADERSHIP_COURSES.at(-1)?.title, 'Leadership Legacy and Succession');
  for (const course of LEADERSHIP_COURSES) {
    assert.ok(isLeadershipCourseId(course.id));
    assert.equal(PLANS[course.id].amountKobo, course.feeNaira * 100);
    assert.equal(PLANS[course.id].kind, 'individual-course');
  }
  for (const invalid of ['leadership-020', 'LEADERSHIP-001', 'constructor', 'leadership-001.json']) assert.equal(isPlanCode(invalid), false);
});

test('a single-course payment does not unlock cohort levels or mentorship', () => {
  const grant = entitlementFor(PLANS['leadership-001'], { reference: 'paid-course-ref', email: 'student@example.com' });
  assert.equal(hasCourseAccess([grant], 'Emerging Leaders'), false);
  assert.equal(hasMentorshipAccess([grant]), false);
  assert.equal(PLANS.mini.amountKobo, 1_000_000);
});

test('only a published, usable LMS file for the exact catalogue ID is ready', () => {
  const course = { id: 'leadership-001', title: 'Foundations of Leadership', published: true, modules: [{ id: 'module-1', title: 'Module', lessons: [{ id: 'lesson-1', title: 'Lesson', blocks: [{ id: 'reading-1', type: 'reading', content: 'Published lesson material.' }] }] }] };
  assert.equal(isReadyLeadershipCourse('leadership-001', course), true);
  assert.equal(isReadyLeadershipCourse('leadership-002', course), false);
  assert.equal(isReadyLeadershipCourse('leadership-001', { ...course, published: false }), false);
  assert.equal(isReadyLeadershipCourse('leadership-001', { ...course, modules: [] }), false);
  assert.equal(isReadyLeadershipCourse('leadership-001', { ...course, modules: [{ id: 'module-1', title: 'Empty', lessons: [] }] }), false);
});

test('leadership payments must be successful, exact, and live in production', () => {
  const tx = { status: 'success', amount: 1500000, currency: 'NGN', domain: 'live', reference: 'reference-001', customer: { email: 'student@example.com' }, metadata: { itemKind: 'plan', plan: 'leadership-001' } };
  assert.equal(isLeadershipPayment('leadership-001', tx.reference, tx, true), true);
  for (const invalid of [{ ...tx, amount: 1 }, { ...tx, currency: 'USD' }, { ...tx, domain: 'test' }, { ...tx, status: 'pending' }, { ...tx, metadata: { itemKind: 'donation', plan: tx.metadata.plan } }]) {
    assert.equal(isLeadershipPayment('leadership-001', tx.reference, invalid, true), false);
  }
  assert.equal(isLeadershipPayment('leadership-002', tx.reference, tx, true), false);
});

test('a signed lesson grant is course-specific, time-limited and isolates each payer', () => {
  const secret = 'unit-test-only-secret';
  const now = 1_800_000_000_000;
  const grant = issueLeadershipAccess('leadership-001', 'Student@example.com', secret, now);
  const student = readLeadershipAccess('leadership-001', grant.token, secret, now);
  assert.match(student!, /^leadership-[a-f0-9]{64}$/);
  assert.equal(readLeadershipAccess('leadership-002', grant.token, secret, now), null);
  assert.equal(readLeadershipAccess('leadership-001', grant.token + 'x', secret, now), null);
  assert.equal(readLeadershipAccess('leadership-001', grant.token, secret, Date.parse(grant.expiresAt)), null);
  assert.equal(readLeadershipAccess('leadership-001', issueLeadershipAccess('leadership-001', 'student@example.com', secret, now).token, secret, now), student);
  assert.notEqual(readLeadershipAccess('leadership-001', issueLeadershipAccess('leadership-001', 'different@example.com', secret, now).token, secret, now), student);
});
