import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { SPECIALIST_COURSES } from '../data/specialistCourses.js';
import { isLeadershipPayment } from './leadershipAccess.js';
import { PLANS } from '../lib/pricing.js';

test('unconfirmed specialist fees cannot start checkout or validate a zero-value payment', async t => {
  const previous = process.env.PAYSTACK_SECRET_KEY;
  const prices = SPECIALIST_COURSES.map(course => [course.id, PLANS[course.id].amountKobo] as const);
  for (const [id] of prices) PLANS[id].amountKobo = 0;
  t.after(() => { for (const [id, amount] of prices) PLANS[id].amountKobo = amount; });
  process.env.PAYSTACK_SECRET_KEY = 'specialist-isolated-test';
  t.after(() => { if (previous === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previous; });
  const { createPaymentRouter } = await import('./paymentRoutes.js');
  const originalFetch = globalThis.fetch;
  let providerRequests = 0;
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request, init?: RequestInit) => {
    if (!String(input).startsWith('http://127.0.0.1:')) {
      providerRequests++;
      throw new Error('Pending-price checkout must not contact a provider.');
    }
    return originalFetch(input, init);
  });
  const app = express(); app.use(express.json(), createPaymentRouter());
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  for (const course of SPECIALIST_COURSES) {
    const response = await fetch(`${base}/payments/initialize`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: course.id, email: 'buyer@example.test', amount: 1 }),
    });
    assert.equal(response.status, 409, course.id);
    assert.match((await response.json()).error, /fee|price/i);
    assert.equal(isLeadershipPayment(course.id, 'pending-fixture', {
      status: 'success', reference: 'pending-fixture', amount: 0, currency: 'NGN', domain: 'live',
      customer: { email: 'buyer@example.test' }, metadata: { itemKind: 'plan', plan: course.id },
    }, true), false);
  }
  assert.equal(providerRequests, 0);
});
