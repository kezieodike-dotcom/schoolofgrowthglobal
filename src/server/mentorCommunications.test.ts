import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import express from 'express';
import { PLANS } from '../lib/pricing.js';
import { verifyMentorshipPurchase, issueStudentConversationToken, verifyStudentConversationToken, issueMentorToken,
  verifyMentorToken, MentorApiError } from './mentorAccess.js';
import { validateVoiceInput, createVoiceUpload, completeVoiceUpload } from './mentorMediaStore.js';
import { callIceConfiguration } from './mentorCallRoutes.js';
import { createMessageRouter } from './messageRoutes.js';

const nativeFetch = globalThis.fetch;
const environment = { ...process.env };
afterEach(() => {
  globalThis.fetch = nativeFetch;
  for (const key of Object.keys(process.env)) if (!(key in environment)) delete process.env[key];
  Object.assign(process.env, environment);
});
const reference = 'paid-mentorship-reference';
const thread = { id: 'a'.repeat(32), studentEmail: 'mentee@example.com', studentName: 'Mentee', mentorId: 'm1',
  createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString(), messages: [] };
const transaction = (changes: Record<string, unknown> = {}) => ({ status: 'success', domain: 'live', reference,
  amount: PLANS.medium.amountKobo, currency: 'NGN', customer: { email: thread.studentEmail },
  paid_at: new Date(Date.now() - 86400_000).toISOString(), metadata: { plan: 'medium' }, ...changes });
function paymentMock(tx: unknown) {
  process.env.PAYSTACK_SECRET_KEY = 'sk_test_fixture';
  globalThis.fetch = async () => Response.json({ status: true, data: tx });
}
const denied = (status: number) => (error: unknown) => error instanceof MentorApiError && error.status === status;

test('mentorship expiry is anchored to the verified transaction date', async () => {
  const tx = transaction(); paymentMock(tx);
  const access = await verifyMentorshipPurchase(reference, thread.studentEmail.toUpperCase());
  assert.equal(access.plan, 'medium');
  assert.equal(Date.parse(access.expiresAt), Date.parse(tx.paid_at) + PLANS.medium.mentorshipDays * 86400_000);
});

test('unpaid, wrong-email, course-only, wrong-amount, expired, future and wrong-mentor payments are denied', async () => {
  const fixtures = [
    transaction({ status: 'failed' }), transaction({ customer: { email: 'someone-else@example.com' } }),
    transaction({ metadata: { plan: 'mini' }, amount: PLANS.mini.amountKobo }), transaction({ amount: 1 }),
    transaction({ paid_at: new Date(Date.now() - 31 * 86400_000).toISOString() }),
    transaction({ paid_at: new Date(Date.now() + 86400_000).toISOString() }),
    transaction({ reference: 'another-reference' }), transaction({ currency: 'USD' }),
  ];
  for (const tx of fixtures) {
    paymentMock(tx);
    await assert.rejects(verifyMentorshipPurchase(reference, thread.studentEmail), denied(403));
  }
  paymentMock(transaction({ amount: PLANS['mentor-1-month'].amountKobo, metadata: { plan: 'mentor-1-month', mentorId: 'm2' } }));
  await assert.rejects(verifyMentorshipPurchase(reference, thread.studentEmail, 'm1'), denied(403));
});

test('production rejects test transactions and network failure does not grant access', async () => {
  process.env.NODE_ENV = 'production'; paymentMock(transaction({ domain: 'test' }));
  await assert.rejects(verifyMentorshipPurchase(reference, thread.studentEmail), denied(403));
  globalThis.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(verifyMentorshipPurchase(reference, thread.studentEmail), denied(502));
});

test('student tokens are bound to thread, email, mentor and expiry; mentor tokens cannot impersonate students', () => {
  process.env.MESSAGE_THREAD_SECRET = 'fixture-signing-secret';
  const token = issueStudentConversationToken({ threadId: thread.id, email: thread.studentEmail, mentorId: 'm1', expiresAt: Date.now() + 60000 });
  assert.equal(verifyStudentConversationToken(token, thread), true);
  assert.equal(verifyStudentConversationToken(token, { ...thread, id: 'b'.repeat(32) }), false);
  assert.equal(verifyStudentConversationToken(token, { ...thread, studentEmail: 'another@example.com' }), false);
  assert.equal(verifyStudentConversationToken(token, { ...thread, mentorId: 'm2' }), false);
  assert.equal(verifyStudentConversationToken(`${token}x`, thread), false);
  assert.equal(verifyStudentConversationToken(issueStudentConversationToken({ threadId: thread.id, email: thread.studentEmail,
    mentorId: 'm1', expiresAt: Date.now() - 1 }), thread), false);
  const mentor = issueMentorToken('m1').token;
  assert.equal(verifyMentorToken(mentor, 'm1'), true);
  assert.equal(verifyMentorToken(mentor, 'm2'), false);
  assert.equal(verifyStudentConversationToken(mentor, thread), false);
});

test('voice limits reject oversized files, invalid duration and non-audio MIME', () => {
  assert.equal(validateVoiceInput({ mimeType: 'audio/webm;codecs=opus', sizeBytes: 1024, durationMs: 2000 }).mimeType, 'audio/webm');
  for (const input of [
    { mimeType: 'text/html', sizeBytes: 1024, durationMs: 2000 },
    { mimeType: 'audio/webm', sizeBytes: 8 * 1024 * 1024 + 1, durationMs: 2000 },
    { mimeType: 'audio/webm', sizeBytes: 1024, durationMs: 180001 },
    { mimeType: 'audio/webm', sizeBytes: 0, durationMs: 2000 },
  ]) assert.throws(() => validateVoiceInput(input), denied(400));
});

test('signed voice upload receipts cannot be reused in another conversation or by the other participant', async () => {
  process.env.SUPABASE_URL = 'https://voice-fixture.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture-service-key';
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('/object/upload/sign/')) return Response.json({ url: '/object/upload/sign/voice?token=upload-fixture' });
    if (options?.method === 'HEAD') return new Response(null, { headers: { 'content-length': '1024', 'content-type': 'audio/webm' } });
    return Response.json({ public: false, file_size_limit: 8 * 1024 * 1024, allowed_mime_types: ['audio/webm', 'audio/ogg', 'audio/mp4'] });
  };
  const upload = await createVoiceUpload(thread.id, 'student', { mimeType: 'audio/webm', sizeBytes: 1024, durationMs: 2000 });
  await assert.rejects(completeVoiceUpload('b'.repeat(32), 'student', upload.path, upload.uploadToken), denied(403));
  await assert.rejects(completeVoiceUpload(thread.id, 'mentor', upload.path, upload.uploadToken), denied(403));
  await assert.rejects(completeVoiceUpload(thread.id, 'student', upload.path + 'x', upload.uploadToken), denied(403));
  const audio = await completeVoiceUpload(thread.id, 'student', upload.path, upload.uploadToken);
  assert.equal(audio.sizeBytes, 1024); assert.equal(audio.path, upload.path);
});

test('TURN configuration exposes temporary credentials rather than its shared secret', () => {
  process.env.TURN_URLS = 'turn:relay.example.com:3478'; process.env.TURN_SHARED_SECRET = 'relay-private-fixture';
  const config = callIceConfiguration();
  assert.equal(config.relayConfigured, true);
  assert.ok(Number(String(config.iceServers[1].username).split(':')[0]) > Date.now() / 1000);
  assert.notEqual(config.iceServers[1].credential, process.env.TURN_SHARED_SECRET);
  assert.ok(!JSON.stringify(config).includes('relay-private-fixture'));
});

test('student text, voice and call routes require authorization even when a thread ID is known', async (t) => {
  process.env.SUPABASE_URL = 'https://routes-fixture.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture-service-key';
  globalThis.fetch = async (url, init) => String(url).startsWith('https://routes-fixture')
    ? Response.json([{ payload: thread }]) : nativeFetch(url, init);
  const app = express(); app.use(express.json()); app.use('/api', createMessageRouter((_req, res) => res.sendStatus(401)));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}/api`;
  for (const [suffix, method, body] of [
    [`/messages/${thread.id}`, 'GET', undefined], [`/messages/${thread.id}`, 'POST', { body: 'Hello' }],
    [`/messages/${thread.id}/voice/upload-url`, 'POST', { mimeType: 'audio/webm', sizeBytes: 100, durationMs: 1000 }],
    [`/mentor-calls/${thread.id}/start`, 'POST', { mode: 'audio' }],
  ] as const) {
    const response = await nativeFetch(base + suffix, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    assert.equal(response.status, 401, `${method} ${suffix} should reject unauthenticated access`);
  }
});
