import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import express from 'express';

test('individual checkout, verification and protected lessons work through the actual routers', async t => {
  const previousDir = process.cwd();
  const previousData = process.env.DATA_DIR;
  const previousKey = process.env.PAYSTACK_SECRET_KEY;
  const root = mkdtempSync(join(tmpdir(), 'sgg-leadership-'));
  const lmsDir = join(root, 'data', 'lms');
  const progressDir = join(root, 'progress');
  mkdirSync(lmsDir, { recursive: true });
  process.chdir(root);
  process.env.DATA_DIR = progressDir;
  process.env.PAYSTACK_SECRET_KEY = 'test-fixture-key';
  t.after(() => {
    process.chdir(previousDir);
    if (previousData === undefined) delete process.env.DATA_DIR; else process.env.DATA_DIR = previousData;
    if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
    rmSync(join(lmsDir, 'leadership-001.json'), { force: true });
    rmSync(join(progressDir, 'lms_progress.json'), { force: true });
    rmdirSync(lmsDir);
    rmdirSync(join(root, 'data'));
    if (existsProgress) rmdirSync(progressDir);
    rmdirSync(root);
  });
  let existsProgress = false;
  writeFileSync(join(lmsDir, 'leadership-001.json'), JSON.stringify({
    id: 'leadership-001', title: 'Foundations of Leadership', published: true,
    answerKey: { 'question-1': 'B', 'question-2': 'C' },
    modules: [{ id: 'module-1', title: 'One', lessons: [{ id: 'lesson-1', title: 'First lesson', blocks: [{ id: 'reading-1', type: 'reading', content: 'Private fixture lesson.' }] }] }],
  }));

  const { createPaymentRouter } = await import('./paymentRoutes.js');
  const { createLmsRouter } = await import('./lmsRoutes.js');
  const { issueLeadershipAccess } = await import('./leadershipAccess.js');
  const originalFetch = globalThis.fetch;
  let charge: { amount: number; currency: string; metadata: Record<string, string> } | null = null;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.hostname !== 'api.paystack.co') return originalFetch(input, init);
    if (url.pathname === '/transaction/initialize') {
      charge = JSON.parse(String(init?.body));
      return Response.json({ status: true, data: { authorization_url: 'https://example.test/checkout', reference: 'fixture-paid' } });
    }
    return Response.json({ status: true, data: {
      status: 'success', domain: 'live', reference: url.pathname.split('/').at(-1),
      amount: url.pathname.endsWith('fixture-wrong') ? 200 : charge?.amount,
      currency: charge?.currency, metadata: charge?.metadata, customer: { email: 'buyer@example.com' },
    } });
  });

  const app = express();
  app.use(express.json(), createPaymentRouter(), createLmsRouter());
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  t.after(() => { server.close(); server.closeAllConnections(); });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (path: string, data: unknown, token?: string) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(data),
  });
  const get = (path: string, token?: string) => fetch(base + path, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

  const catalogue = await (await get('/lms/leadership/availability')).json();
  assert.deepEqual(catalogue.available, { 'leadership-001': '/lms/leadership-001/module-1/lesson-1' });
  assert.deepEqual(catalogue.outlines, { 'leadership-001': ['One'] });
  assert.ok(!JSON.stringify(catalogue).includes('Private fixture lesson'));
  assert.equal((await post('/payments/initialize', { plan: 'leadership-002', email: 'buyer@example.com' })).status, 409);
  assert.equal(charge, null);
  assert.equal((await get('/lms/courses/leadership-001')).status, 401);
  assert.equal((await get('/lms/courses/LEADERSHIP-001')).status, 404);

  const init = await post('/payments/initialize', { plan: 'leadership-001', email: 'buyer@example.com', amount: 1, deliveryMode: 'Live class' });
  assert.equal(init.status, 200);
  const captured = charge as { amount: number; currency: string; metadata: Record<string, string> } | null;
  assert.equal(captured?.amount, 1_500_000);
  assert.equal(captured?.currency, 'NGN');
  assert.equal(captured?.metadata.deliveryMode, 'Self-paced learning');
  assert.equal((await get('/payments/verify/fixture-wrong')).status, 422);
  const verified = await get('/payments/verify/fixture-paid');
  assert.equal(verified.status, 200);
  assert.equal(verified.headers.get('cache-control'), 'no-store');
  const { entitlement } = await verified.json();
  assert.deepEqual(entitlement.levels, []);
  const token = entitlement.leadershipAccess.token;
  const course = await get('/lms/courses/leadership-001', token);
  assert.equal(course.status, 200);
  assert.equal(course.headers.get('cache-control'), 'no-store');
  const lessonData = await course.json();
  assert.equal(lessonData.modules[0].lessons[0].blocks[0].content, 'Private fixture lesson.');
  assert.ok(!('answerKey' in lessonData));
  assert.equal((await get('/lms/courses/leadership-002', token)).status, 401);

  const quiz = '/lms/leadership/leadership-001/quiz';
  const answers = { 'question-1': 'B', 'question-2': 'A' };
  assert.equal((await post(quiz, { answers })).status, 401);
  assert.equal((await post('/lms/leadership/leadership-002/quiz', { answers }, token)).status, 401);
  assert.equal((await post(quiz, { answers: { 'question-1': 'B' } }, token)).status, 400);
  const result = await post(quiz, { answers }, token);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), { score: 1, total: 2, percentage: 50 });

  const update = { userId: 'forged-user', courseId: 'leadership-001', completedLessons: ['lesson-1', 'invented-lesson'], progressPercentage: 200 };
  assert.equal((await post('/lms/progress', update)).status, 401);
  const saved = await post('/lms/progress', update, token);
  existsProgress = saved.ok;
  assert.equal(saved.status, 200);
  const progress = await (await get('/lms/progress/forged-user/leadership-001', token)).json();
  assert.notEqual(progress.userId, 'forged-user');
  assert.deepEqual(progress.completedLessons, ['lesson-1']);
  assert.equal(progress.progressPercentage, 100);
  const anotherBuyer = issueLeadershipAccess('leadership-001', 'another@example.com', 'test-fixture-key').token;
  const anotherProgress = await (await get(`/lms/progress/${progress.userId}/leadership-001`, anotherBuyer)).json();
  assert.deepEqual(anotherProgress.completedLessons, []);
});
