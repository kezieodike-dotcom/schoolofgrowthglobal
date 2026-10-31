import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { MentorCallSession } from './mentorCallSession.js';
import type { MentorCall } from './mentorCommunications.js';

const originals = new Map<string, PropertyDescriptor | undefined>();
function replace(name: string, value: any) {
  if (!originals.has(name)) originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
afterEach(() => {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete (globalThis as any)[name];
  }
  originals.clear();
});
function browserFixture() {
  const track = { enabled: true, stopped: false, stop() { this.stopped = true; }, kind: 'audio' };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track], getVideoTracks: () => [] };
  replace('window', { isSecureContext: true });
  replace('document', { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} });
  replace('navigator', { mediaDevices: { getUserMedia: async () => stream } });
  replace('RTCPeerConnection', class {
    connectionState = 'new'; localDescription: any = null; remoteDescription: any = null;
    addTrack() {} close() { this.connectionState = 'closed'; }
    async createOffer() { return { type: 'offer', sdp: 'v=0\r\n' }; }
    async setLocalDescription(value: any) { this.localDescription = value; }
  });
  return { track, stream };
}
const makeCall = (expiresIn = 45000): MentorCall => ({ id: 'call-fixture', threadId: 'a'.repeat(32), caller: 'student',
  mode: 'audio', status: 'ringing', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + expiresIn).toISOString() });

test('an unanswered call stops capture on its local deadline even when polling is offline', async () => {
  const { track } = browserFixture(); const call = makeCall(50);
  replace('fetch', async (input: any) => {
    if (String(input).endsWith('/start')) return Response.json({ call, iceServers: [], relayConfigured: false });
    if (String(input).includes('/signals')) return Response.json({ ok: true });
    throw new Error('offline');
  });
  let state: any;
  const session = new MentorCallSession(call.threadId, 'fixture', 'student', (next) => { state = next; });
  try {
    await session.start('audio');
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.equal(track.stopped, true, 'Local expiry must stop microphone capture without a server response.');
    assert.equal(state.call.status, 'missed');
  } finally { session.dispose(); }
});

test('polling a just-created own call cannot invalidate the pending start response', async () => {
  const { track } = browserFixture(); const call = makeCall();
  let finishStart!: (response: Response) => void; let startSeen!: () => void;
  const requested = new Promise<void>((resolve) => { startSeen = resolve; });
  const statusPosts: any[] = [];
  replace('fetch', async (input: any, init: any) => {
    if (String(input).endsWith('/start')) { startSeen(); return new Promise<Response>((resolve) => { finishStart = resolve; }); }
    if (String(input).includes('/status')) statusPosts.push(JSON.parse(init.body));
    return Response.json({ call, signals: [], iceServers: [], relayConfigured: false });
  });
  const session = new MentorCallSession(call.threadId, 'fixture', 'student', () => {});
  try {
    const starting = session.start('audio');
    await requested;
    await (session as any).poll();
    finishStart(Response.json({ call, iceServers: [], relayConfigured: false }));
    await starting;
    assert.equal(track.stopped, false, 'A background poll must not stop the pending outgoing stream.');
    assert.equal((session as any).peer?.connectionState, 'new');
    assert.deepEqual(statusPosts, []);
  } finally { session.dispose(); }
});
