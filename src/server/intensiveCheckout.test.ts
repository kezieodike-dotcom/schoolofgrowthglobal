import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import express from 'express';

test('paid intensives survive missed callbacks, restore securely, expire once, and save private work', async t => {
  const env = { PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY, SUPABASE_URL: process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY };
  process.env.PAYSTACK_SECRET_KEY = 'intensive-test-secret';
  process.env.SUPABASE_URL = 'https://intensive-storage.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'private-fixture-key';
  t.after(() => { for (const [name, value] of Object.entries(env)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; } });
  const { createPaymentRouter, captureRawBody } = await import('./paymentRoutes.js');
  const { createLmsRouter } = await import('./lmsRoutes.js');
  const { readIntensiveAccess } = await import('./intensiveAccess.js');
  const records = new Map<string, unknown>();
  let unavailable = false;
  let charge: any = null;
  const transaction = (reference = 'paid-intensive') => ({
    reference, status: 'success', domain: 'live', amount: reference === 'underpaid' ? 1 : 500_000, currency: 'NGN',
    customer: { email: reference === 'another-student' ? 'other@example.com' : 'buyer@example.com' },
    metadata: { plan: 'foundation-intensive', itemKind: 'plan', ...(reference === 'legacy-intensive' ? {} : { intensiveCourseId: 'self-discovery-productivity' }) },
  });
  const originalFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.hostname === 'intensive-storage.example.test') {
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer private-fixture-key');
      if (unavailable) return Response.json({ error: 'Unavailable' }, { status: 503 });
      const key = url.pathname.replace('/storage/v1/object/authenticated/', '').replace('/storage/v1/object/', '');
      if (init?.method === 'POST') {
        if (records.has(key) && new Headers(init.headers).get('x-upsert') === 'false') return Response.json({ statusCode: '409' }, { status: 400 });
        records.set(key, JSON.parse(String(init.body)));
        return Response.json({ Key: key });
      }
      return records.has(key) ? Response.json(records.get(key)) : Response.json({ statusCode: '404' }, { status: 400 });
    }
    if (url.hostname === 'api.paystack.co') {
      if (url.pathname === '/transaction/initialize') {
        charge = JSON.parse(String(init?.body));
        return Response.json({ status: true, data: { reference: 'checkout-reference', authorization_url: 'https://checkout.example.test' } });
      }
      const reference = url.pathname.split('/').at(-1)!;
      return Response.json({ status: true, data: reference === 'unpaid' ? { ...transaction(reference), status: 'abandoned' } : transaction(reference) });
    }
    return originalFetch(input, init);
  });
  const app = express();
  app.use(express.json({ verify: captureRawBody }), createPaymentRouter(), createLmsRouter());
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => { server.close(); server.closeAllConnections(); });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const get = (path: string, token?: string) => fetch(base + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const post = (path: string, body: unknown, token?: string) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
  });
  const webhook = (tx: unknown, signature?: string) => {
    const body = JSON.stringify({ event: 'charge.success', data: tx });
    return fetch(base + '/payments/webhook', { method: 'POST', body, headers: {
      'Content-Type': 'application/json', 'x-paystack-signature': signature ?? createHmac('sha512', 'intensive-test-secret').update(body).digest('hex'),
    } });
  };

  assert.equal((await get('/lms/courses/self-discovery-productivity')).status, 401);
  assert.equal((await post('/payments/initialize', { plan: 'accelerator-intensive', email: 'buyer@example.com' })).status, 409);
  assert.equal((await post('/payments/initialize', { plan: 'foundation-intensive', email: 'buyer@example.com' })).status, 400);
  assert.equal((await post('/payments/initialize', { plan: 'foundation-intensive', intensiveCourseId: 'fake', email: 'buyer@example.com' })).status, 400);
  assert.equal(charge, null);
  assert.equal((await post('/payments/initialize', { plan: 'foundation-intensive', intensiveCourseId: 'self-discovery-productivity', email: 'buyer@example.com', amount: 1 })).status, 200);
  assert.equal(charge.amount, 500_000);
  assert.equal(charge.metadata.intensiveCourseId, 'self-discovery-productivity');
  assert.equal((await webhook(transaction(), 'forged')).status, 401);
  assert.equal((await webhook(transaction('underpaid'))).status, 422);
  assert.equal(records.size, 0);
  unavailable = true;
  assert.equal((await webhook(transaction())).status, 503);
  unavailable = false;
  // No browser callback has occurred: the signed event alone persists access.
  assert.equal((await webhook(transaction())).status, 200);
  assert.equal(records.size, 1);
  assert.equal((await webhook(transaction())).status, 200);
  assert.equal(records.size, 1);
  const receipt = await get('/payments/verify/paid-intensive');
  assert.equal(receipt.status, 200);
  const { entitlement } = await receipt.json();
  assert.deepEqual(entitlement.levels, []);
  assert.deepEqual(entitlement.intensiveAccess.courseIds, ['self-discovery-productivity']);
  assert.equal(Date.parse(entitlement.coursesExpireAt) - Date.parse(entitlement.purchasedAt), 14 * 86400_000);
  assert.equal(Date.parse(entitlement.mentorshipExpiresAt), Date.parse(entitlement.purchasedAt));
  const token = entitlement.intensiveAccess.token;
  const restored = await (await get('/payments/verify/paid-intensive')).json();
  assert.equal(restored.entitlement.coursesExpireAt, entitlement.coursesExpireAt);
  assert.equal(records.size, 1);
  assert.equal((await get('/payments/verify/underpaid')).status, 422);
  assert.equal((await (await get('/payments/verify/unpaid')).json()).paid, false);
  const course = await get('/lms/courses/self-discovery-productivity', token);
  assert.equal(course.status, 200);
  assert.equal(course.headers.get('cache-control'), 'no-store');
  const content = await course.json();
  assert.deepEqual(content.modules.map((m: any) => m.id), ['module-1', 'module-3', 'module-4']);
  assert.equal((await get('/lms/courses/mindset-career-development', token)).status, 401);
  assert.equal((await get('/lms/courses/self-discovery-productivity', token + 'x')).status, 401);
  assert.equal(readIntensiveAccess('self-discovery-productivity', token, 'intensive-test-secret', Date.parse(entitlement.coursesExpireAt)), null);

  const progress = { userId: 'student-demo', courseId: content.id, completedLessons: [content.modules[0].lessons[0].id, 'fake-lesson'], progressPercentage: 100 };
  assert.equal((await post('/lms/progress', progress)).status, 401);
  assert.equal((await post('/lms/progress', progress, token)).status, 200);
  const saved = await (await get('/lms/progress/student-demo/self-discovery-productivity', token)).json();
  assert.notEqual(saved.userId, 'student-demo');
  assert.deepEqual(saved.completedLessons, [content.modules[0].lessons[0].id]);
  assert.ok(saved.progressPercentage < 100);
  const another = (await (await get('/payments/verify/another-student')).json()).entitlement;
  const separate = await (await get('/lms/progress/' + saved.userId + '/self-discovery-productivity', another.intensiveAccess.token)).json();
  assert.deepEqual(separate.completedLessons, []);
  const block = content.modules[0].lessons[0].blocks[0];
  const submission = { userId: 'forged', courseId: content.id, moduleId: 'module-1', lessonId: '', blockId: block.id, data: { notes: 'My exercise' } };
  assert.equal((await post('/lms/submission', submission, token)).status, 200);
  assert.equal((await post('/lms/submission', { ...submission, blockId: 'unknown' }, token)).status, 400);
  const work = await (await get('/lms/submission/forged/self-discovery-productivity/' + block.id, token)).json();
  assert.equal(work.userId, saved.userId);
  assert.deepEqual(work.data, submission.data);
  const legacy = (await (await get('/payments/verify/legacy-intensive')).json()).entitlement;
  assert.deepEqual(legacy.intensiveAccess.courseIds, ['self-discovery-productivity', 'mindset-career-development']);
});
