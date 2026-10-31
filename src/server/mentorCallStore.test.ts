import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { startCall, updateCallStatus, appendCallSignal, currentCall } from './mentorCallStore.js';
import type { MentorCall } from '../lib/mentorCommunications.js';
import { MentorApiError } from './mentorAccess.js';

const originalFetch = globalThis.fetch;
const oldUrl = process.env.SUPABASE_URL, oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (oldUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = oldUrl;
  if (oldKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
});
function mockAtomicDatabase() {
  process.env.SUPABASE_URL = 'https://call-fixture.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'fixture';
  let stored: MentorCall | null = null;
  const signals: unknown[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input)); const method = init?.method || 'GET';
    if (method === 'GET') return Response.json(stored ? [{ payload: structuredClone(stored) }] : []);
    if (method === 'DELETE') return new Response(null, { status: 204 });
    const body = JSON.parse(String(init?.body));
    if (method === 'POST' && body.id.startsWith('mentor-signal-')) { signals.push(body); return new Response(null, { status: 201 }); }
    if (method === 'POST') {
      if (stored) return Response.json([]);
      stored = structuredClone(body.payload); return Response.json([{ payload: stored }]);
    }
    if (method === 'PATCH') {
      const revision = url.searchParams.get('payload->>revision')?.slice(3);
      if (stored?.revision !== revision) return Response.json([]);
      stored = structuredClone(body.payload); return Response.json([{ payload: stored }]);
    }
    throw new Error(`Unexpected fixture request ${method}`);
  };
  return { get call() { return stored; }, set call(value: MentorCall | null) { stored = value; }, signals };
}

test('simultaneous callers claim only one call slot, including reuse after a completed call', async () => {
  mockAtomicDatabase();
  for (let round = 0; round < 2; round++) {
    const results = await Promise.allSettled([startCall('a'.repeat(32), 'student', 'video'), startCall('a'.repeat(32), 'mentor', 'audio')]);
    const successful = results.filter((result) => result.status === 'fulfilled');
    assert.equal(successful.length, 1);
    const rejected = results.find((result) => result.status === 'rejected') as PromiseRejectedResult;
    assert.ok(rejected.reason instanceof MentorApiError && rejected.reason.status === 409);
    const call = (successful[0] as PromiseFulfilledResult<MentorCall>).value;
    await updateCallStatus(call.threadId, call.id, call.caller, 'ended');
  }
});

test('only recipient answers; stale calls fail and cannot keep accepting signaling', async () => {
  const db = mockAtomicDatabase();
  const call = await startCall('a'.repeat(32), 'student', 'audio');
  await assert.rejects(updateCallStatus(call.threadId, call.id, 'student', 'accepted'), (error: any) => error.status === 403);
  const accepted = await updateCallStatus(call.threadId, call.id, 'mentor', 'accepted');
  assert.equal(accepted.status, 'accepted');
  db.call = { ...accepted, seen: { student: new Date(Date.now() - 60000).toISOString(), mentor: new Date().toISOString() } };
  assert.equal((await currentCall(call.threadId))?.status, 'failed');
  await assert.rejects(appendCallSignal(call.threadId, call.id, 'student', { type: 'offer', data: { type: 'offer', sdp: 'v=0\r\n' } }),
    (error: any) => error.status === 409);
});

test('caller cannot send an answer and recipient cannot send the offer', async () => {
  mockAtomicDatabase();
  const call = await startCall('b'.repeat(32), 'student', 'video');
  await assert.rejects(appendCallSignal(call.threadId, call.id, 'mentor', { type: 'offer', data: { type: 'offer', sdp: 'v=0\r\n' } }),
    (error: any) => error.status === 403);
  await updateCallStatus(call.threadId, call.id, 'mentor', 'accepted');
  await assert.rejects(appendCallSignal(call.threadId, call.id, 'student', { type: 'answer', data: { type: 'answer', sdp: 'v=0\r\n' } }),
    (error: any) => error.status === 403);
});
