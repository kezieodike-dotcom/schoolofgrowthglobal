import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('admin invitations activate a private dashboard, protect lessons, persist progress and enforce revocation', async t => {
  const root = mkdtempSync(join(tmpdir(), 'sgg-complimentary-http-'));
  const env = { PAYSTACK_SECRET_KEY: 'complimentary-http-fixture', SUPABASE_URL: 'https://complimentary-fixture.example.test', SUPABASE_SERVICE_ROLE_KEY: 'fixture-service-key', DATA_DIR: root };
  const previous = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]));
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    rmSync(join(root, 'lms_progress.json'), { force: true }); rmSync(join(root, 'lms_submissions.json'), { force: true }); rmdirSync(root);
  });
  const objects = new Map<string, unknown>();
  const course = { id: 'leadership-001', title: 'Foundations of Leadership', published: true, answerKey: { 'question-1': 'B' }, modules: [{ id: 'module-1', title: 'Principles', lessons: [
    { id: 'lesson-1', title: 'Introduction', blocks: [{ id: 'reading-1', type: 'reading', content: 'Private teaching fixture.' }] },
    { id: 'lesson-2', title: 'Practice', blocks: [{ id: 'reading-2', type: 'reading', content: 'Second fixture.' }] },
  ] }] };
  const original = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.hostname !== 'complimentary-fixture.example.test') return original(input, init);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer fixture-service-key');
    if (url.pathname.endsWith('/leadership-courses/leadership-001.json')) return Response.json(course);
    if (url.pathname.includes('/leadership-courses/')) return Response.json({ statusCode: '404' }, { status: 404 });
    if (url.pathname.endsWith('/object/list/student-learning')) {
      const { prefix, offset = 0, limit = 100 } = JSON.parse(String(init?.body));
      return Response.json([...objects.keys()].filter(key => key.startsWith(prefix + '/')).map(key => key.slice(prefix.length + 1)).filter(key => !key.includes('/')).sort().slice(offset, offset + limit).map(name => ({ name: name + '.json' })));
    }
    const path = url.pathname.replace(/^.*\/student-learning\//, '').replace(/\.json$/, '');
    if (init?.method === 'POST') {
      if (objects.has(path) && new Headers(init.headers).get('x-upsert') === 'false') return Response.json({ statusCode: '409' }, { status: 409 });
      objects.set(path, JSON.parse(String(init.body))); return Response.json({ ok: true });
    }
    const result = objects.has(path) ? Response.json(objects.get(path)) : Response.json({ statusCode: '404' }, { status: 404 });
    if (path.startsWith('submissions/')) await new Promise(resolve => setTimeout(resolve, 25));
    return result;
  });
  const { createStudentRouter } = await import('./studentRoutes.js');
  const { createComplimentaryRouter } = await import('./complimentaryRoutes.js');
  const { createLmsRouter } = await import('./lmsRoutes.js');
  const app = express();
  app.use(express.json(), createStudentRouter(), createComplimentaryRouter((req, res, next) => req.get('authorization') === 'Bearer admin-fixture' ? next() : res.status(401).json({ error: 'Sign in' })), createLmsRouter());
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => { server.close(); server.closeAllConnections(); });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const admin = { Authorization: 'Bearer admin-fixture' };
  const batch = { courseId: 'leadership-001', learners: [{ name: 'Fixture Learner', email: 'learner@example.com' }] };
  assert.equal((await post('/admin/complimentary', batch)).status, 401);
  assert.equal((await post('/admin/complimentary', { ...batch, learners: [...batch.learners, ...batch.learners] }, admin)).status, 400);
  assert.equal((await post('/admin/complimentary', { ...batch, courseId: 'leadership-002' }, admin)).status, 409);
  const granted = await post('/admin/complimentary', batch, admin);
  assert.equal(granted.status, 200);
  const invitation = (await granted.json()).grants[0];
  const repeated = await (await post('/admin/complimentary', batch, admin)).json();
  assert.equal(repeated.grants[0].code, invitation.code);
  assert.equal((await post('/students/activate', { code: invitation.code, email: 'learner@example.com' }, { Origin: 'https://other.example.test' })).status, 403);
  assert.equal((await post('/students/activate', { code: invitation.code, email: 'wrong@example.com' })).status, 401);
  const activated = await post('/students/activate', { code: invitation.code, email: 'LEARNER@example.com' });
  assert.equal(activated.status, 200);
  const cookie = activated.headers.get('set-cookie')!.split(';')[0];
  const dashboard = await activated.json();
  assert.equal(dashboard.profile.email, 'learner@example.com');
  assert.equal(dashboard.courses[0].id, 'leadership-001');
  assert.equal(dashboard.courses[0].completedLessons, 0);
  const token = dashboard.entitlements[0].leadershipAccess.token;
  assert.equal((await fetch(base + '/students/me')).status, 401);
  assert.equal((await fetch(base + '/students/me', { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await fetch(base + '/lms/courses/leadership-001')).status, 401);
  const protectedHeaders = { Authorization: `Bearer ${token}` };
  const content = await (await fetch(base + '/lms/courses/leadership-001', { headers: protectedHeaders })).json();
  assert.equal(content.modules[0].lessons[0].blocks[0].content, 'Private teaching fixture.');
  assert.equal(content.answerKey, undefined);
  assert.equal((await fetch(base + '/lms/courses/leadership-002', { headers: protectedHeaders })).status, 401);
  const progress = await post('/lms/progress', { userId: 'forged', courseId: 'leadership-001', completedLessons: ['lesson-1', 'invented'], progressPercentage: 100 }, protectedHeaders);
  assert.equal(progress.status, 200);
  assert.ok([...objects.keys()].some(key => key.startsWith('progress/')), 'Leadership progress must survive production function restarts');
  const resumed = await (await fetch(base + '/students/me', { headers: { Cookie: cookie } })).json();
  assert.equal(resumed.courses[0].completedLessons, 1);
  assert.equal(resumed.courses[0].resumePath, '/lms/leadership-001/module-1/lesson-2');
  const savedAnswers = await Promise.all(['reading-1', 'reading-2'].map((blockId, index) => post('/lms/submission', {
    userId: 'forged', courseId: 'leadership-001', moduleId: 'module-1', lessonId: `lesson-${index + 1}`, blockId, data: { answer: blockId },
  }, protectedHeaders)));
  assert.ok(savedAnswers.every(response => response.status === 200));
  const work = await (await fetch(base + '/lms/submissions/forged/leadership-001', { headers: protectedHeaders })).json();
  assert.deepEqual(work.map((row: any) => row.blockId).sort(), ['reading-1', 'reading-2']);
  const other = await (await post('/admin/complimentary', { courseId: 'leadership-001', learners: [{ name: 'Another Fixture', email: 'another@example.com' }] }, admin)).json();
  const otherDashboard = await (await post('/students/activate', { code: other.grants[0].code, email: 'another@example.com' })).json();
  assert.equal(otherDashboard.courses[0].completedLessons, 0);
  assert.equal(otherDashboard.profile.email, 'another@example.com');
  assert.notEqual(otherDashboard.entitlements[0].leadershipAccess.token, token);
  assert.equal((await post(`/admin/complimentary/${invitation.record.id}/revoke`, {}, admin)).status, 200);
  assert.equal((await fetch(base + '/lms/courses/leadership-001', { headers: protectedHeaders })).status, 401);
  assert.equal((await post('/students/activate', { code: invitation.code, email: 'learner@example.com' })).status, 401);
  const revoked = await (await fetch(base + '/students/me', { headers: { Cookie: cookie } })).json();
  assert.equal(revoked.courses[0].active, false);
  assert.equal(revoked.courses[0].completedLessons, 1, 'Access ending must preserve the saved progress display');
  assert.equal(revoked.entitlements[0].leadershipAccess, undefined);
});
