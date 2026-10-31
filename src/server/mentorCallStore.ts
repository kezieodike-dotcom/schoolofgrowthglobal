import crypto from 'node:crypto';
import { mentorDbRequest, mentorSupabaseConfig, PRIVATE_MENTOR_KIND } from './mentorPrivateStore.js';
import { MentorApiError } from './mentorAccess.js';
import type { MentorCall, CallSignal, ConversationRole, CallStatus } from '../lib/mentorCommunications.js';

const slot = (threadId: string) => `?kind=eq.${PRIVATE_MENTOR_KIND}&id=eq.mentor-call-${threadId}`;
const isActive = (call: MentorCall) => call.status === 'ringing' || call.status === 'accepted';

async function rawCall(threadId: string): Promise<MentorCall | null> {
  if (!mentorSupabaseConfig()) throw new MentorApiError(503, 'Calling is temporarily unavailable. Please use a text message.');
  const rows = await mentorDbRequest<Array<{ payload: MentorCall }>>(`${slot(threadId)}&select=payload&limit=1`);
  return rows[0]?.payload ?? null;
}

async function compareAndSwap(previous: MentorCall, next: MentorCall): Promise<MentorCall | null> {
  next.revision = crypto.randomUUID();
  const rows = await mentorDbRequest<Array<{ payload: MentorCall }>>(
    `${slot(previous.threadId)}&payload->>revision=eq.${previous.revision}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ payload: next, updated_at: new Date().toISOString() }),
    });
  return rows[0]?.payload ?? null;
}

export async function currentCall(threadId: string, reader?: ConversationRole): Promise<MentorCall | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const call = await rawCall(threadId);
    if (!call || !isActive(call)) return call;
    const now = Date.now();
    const stalePeer = call.status === 'accepted' && ['student', 'mentor'].some((side) =>
      now - Date.parse(call.seen?.[side] || call.acceptedAt || call.createdAt) > 45000);
    if (Date.parse(call.expiresAt) <= now || stalePeer) {
      const next = { ...call, status: call.status === 'ringing' ? 'missed' as const : 'failed' as const,
        endedAt: new Date().toISOString() };
      const saved = await compareAndSwap(call, next);
      if (saved) return saved;
      continue;
    }
    if (reader && call.status === 'accepted' && now - Date.parse(call.seen?.[reader] || '') > 8000) {
      const next = { ...call, seen: { ...call.seen, [reader]: new Date().toISOString() } };
      const saved = await compareAndSwap(call, next);
      if (saved) return saved;
      continue;
    }
    return call;
  }
  return rawCall(threadId);
}

export async function startCall(threadId: string, caller: ConversationRole, mode: 'audio' | 'video'): Promise<MentorCall> {
  const previous = await currentCall(threadId);
  if (previous && isActive(previous)) throw new MentorApiError(409, 'A call is already active in this conversation.');
  const now = new Date().toISOString();
  const call: MentorCall = { id: crypto.randomUUID(), threadId, caller, mode, status: 'ringing', createdAt: now,
    expiresAt: new Date(Date.now() + 45000).toISOString(), revision: crypto.randomUUID() };
  let saved: MentorCall | null;
  if (previous) saved = await compareAndSwap(previous, call);
  else {
    const rows = await mentorDbRequest<Array<{ payload: MentorCall }>>('?on_conflict=kind,id', {
      method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({ id: `mentor-call-${threadId}`, kind: PRIVATE_MENTOR_KIND, published: false,
        payload: call, updated_at: now }),
    });
    saved = rows[0]?.payload ?? null;
  }
  if (!saved) throw new MentorApiError(409, 'Another call just started. Please answer it or try again.');
  // Limit signaling retention. This only deletes this application's expired private signal records.
  const cutoff = new Date(Date.now() - 86400_000).toISOString();
  await mentorDbRequest(`?kind=eq.${PRIVATE_MENTOR_KIND}&id=like.mentor-signal-*&created_at=lt.${encodeURIComponent(cutoff)}`,
    { method: 'DELETE' }).catch((error) => console.error('Call signaling cleanup failed:', error));
  return saved;
}

export async function updateCallStatus(threadId: string, callId: string, actor: ConversationRole, status: CallStatus): Promise<MentorCall> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const call = await currentCall(threadId);
    if (!call || call.id !== callId) throw new MentorApiError(404, 'This call has ended.');
    if (!isActive(call)) return call;
    if ((status === 'accepted' || status === 'declined') && (call.caller === actor || call.status !== 'ringing')) {
      throw new MentorApiError(403, 'Only the recipient can answer an incoming call.');
    }
    if (!['accepted', 'declined', 'ended', 'failed'].includes(status)) throw new MentorApiError(400, 'Invalid call status.');
    const now = new Date().toISOString();
    const next: MentorCall = { ...call, status, ...(status === 'accepted' ? { acceptedAt: now,
      seen: { student: now, mentor: now }, expiresAt: new Date(Date.now() + 4 * 3600_000).toISOString() } : { endedAt: now }) };
    const saved = await compareAndSwap(call, next);
    if (saved) return saved;
  }
  throw new MentorApiError(409, 'The call state changed. Please retry.');
}

export function validateCallSignal(type: unknown, data: any): { type: CallSignal['type']; data: CallSignal['data'] } {
  if (type === 'offer' || type === 'answer') {
    if (data?.type !== type || typeof data.sdp !== 'string' || data.sdp.length > 64000 || !data.sdp.startsWith('v=0')) {
      throw new MentorApiError(400, 'Invalid call connection details.');
    }
    return { type, data: { type, sdp: data.sdp } };
  }
  if (type === 'ice' && typeof data?.candidate === 'string' && data.candidate.length <= 2048 &&
      (data.sdpMid == null || (typeof data.sdpMid === 'string' && data.sdpMid.length < 64)) &&
      (data.sdpMLineIndex == null || (Number.isInteger(data.sdpMLineIndex) && data.sdpMLineIndex >= 0 && data.sdpMLineIndex < 32))) {
    return { type, data: { candidate: data.candidate, sdpMid: data.sdpMid ?? null, sdpMLineIndex: data.sdpMLineIndex ?? null,
      ...(typeof data.usernameFragment === 'string' && data.usernameFragment.length < 256 ? { usernameFragment: data.usernameFragment } : {}) } };
  }
  throw new MentorApiError(400, 'Invalid call signal.');
}

export async function appendCallSignal(threadId: string, callId: string, from: ConversationRole, input: any) {
  const call = await currentCall(threadId, from);
  if (!call || call.id !== callId || !isActive(call)) throw new MentorApiError(409, 'This call is no longer active.');
  const signal = validateCallSignal(input?.type, input?.data);
  if ((signal.type === 'offer' && from !== call.caller) || (signal.type === 'answer' && (from === call.caller || call.status !== 'accepted'))) {
    throw new MentorApiError(403, 'This call signal is not allowed for your participant.');
  }
  const id = signal.type === 'ice' ? crypto.randomUUID() : signal.type;
  const event: CallSignal = { ...signal, id, callId, threadId, from, createdAt: new Date().toISOString() };
  await mentorDbRequest('?on_conflict=kind,id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ id: `mentor-signal-${callId}-${id}`, kind: PRIVATE_MENTOR_KIND, published: false, payload: event }) });
}

export async function callSignals(threadId: string, callId: string, reader: ConversationRole, after?: string): Promise<CallSignal[]> {
  let filter = '';
  if (after) {
    const date = new Date(after);
    if (Number.isFinite(date.getTime())) filter = `&created_at=gte.${encodeURIComponent(date.toISOString())}`;
  }
  const rows = await mentorDbRequest<Array<{ payload: CallSignal; created_at: string }>>(
    `?kind=eq.${PRIVATE_MENTOR_KIND}&id=like.mentor-signal-${callId}-*&payload->>threadId=eq.${threadId}` +
    `&payload->>from=neq.${reader}&select=payload,created_at&order=created_at.asc,id.asc&limit=500${filter}`);
  return rows.map((row) => ({ ...row.payload, createdAt: row.created_at }));
}
