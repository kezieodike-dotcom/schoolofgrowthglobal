import crypto from 'node:crypto';
import { createJsonStore } from './jsonStore.js';
import { mentorDbRequest, mentorSupabaseConfig, PRIVATE_MENTOR_KIND } from './mentorPrivateStore.js';
import type { ConversationMessage, ConversationThread, VoiceNote } from '../lib/mentorCommunications.js';

export type Message = ConversationMessage;
export interface Thread extends ConversationThread { revision?: string }
const store = createJsonStore<Thread>('messages.json');
const prefix = 'mentor-thread-';
const query = (id: string) => `?kind=eq.${PRIVATE_MENTOR_KIND}&id=eq.${encodeURIComponent(prefix + id)}`;
export const isWritable = () => Boolean(mentorSupabaseConfig()) || store.isWritable();

export function threadIdFor(email: string, mentorId: string): string {
  const key = process.env.MESSAGE_THREAD_SECRET || process.env.PAYSTACK_SECRET_KEY || process.env.ADMIN_PASSWORD || 'school-of-growth-threads';
  return crypto.createHmac('sha256', key).update(`${email.trim().toLowerCase()}|${mentorId}`).digest('hex').slice(0, 32);
}

async function insert(thread: Thread): Promise<Thread> {
  if (!mentorSupabaseConfig()) {
    const rows = store.read();
    const existing = rows.find((row) => row.id === thread.id);
    if (existing) return existing;
    rows.push(thread); store.write(rows); return thread;
  }
  const rows = await mentorDbRequest<Array<{ payload: Thread }>>('?on_conflict=kind,id', {
    method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
    body: JSON.stringify({ kind: PRIVATE_MENTOR_KIND, id: prefix + thread.id, payload: { ...thread, revision: crypto.randomUUID() },
      published: false, updated_at: new Date().toISOString() }),
  });
  if (rows[0]) return rows[0].payload;
  const existing = await getThread(thread.id);
  if (!existing) throw new Error('The conversation could not be created.');
  return existing;
}

export async function getThread(id: string): Promise<Thread | null> {
  if (!/^[a-f0-9]{32}$/.test(id)) return null;
  if (!mentorSupabaseConfig()) return store.read().find((row) => row.id === id) ?? null;
  const rows = await mentorDbRequest<Array<{ payload: Thread }>>(`${query(id)}&select=payload&limit=1`);
  if (rows[0]) return rows[0].payload;
  const old = await mentorDbRequest<Array<{ payload: Thread }>>(`?kind=eq.mentor_thread&id=eq.${id}&select=payload&limit=1`);
  const legacy = old[0]?.payload || store.read().find((row) => row.id === id);
  return legacy ? insert(legacy) : null;
}

// Compare-and-swap prevents read receipts or simultaneous replies from overwriting new messages.
async function mutate(id: string, apply: (thread: Thread) => boolean): Promise<Thread | null> {
  if (!mentorSupabaseConfig()) {
    const rows = store.read();
    const thread = rows.find((row) => row.id === id);
    if (thread && apply(thread)) store.write(rows);
    return thread ?? null;
  }
  for (let attempt = 0; attempt < 6; attempt++) {
    const thread = await getThread(id);
    if (!thread || !apply(thread)) return thread;
    const previous = thread.revision;
    thread.revision = crypto.randomUUID();
    const filter = previous ? `eq.${encodeURIComponent(previous)}` : 'is.null';
    const rows = await mentorDbRequest<Array<{ payload: Thread }>>(`${query(id)}&payload->>revision=${filter}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ payload: thread, updated_at: new Date().toISOString() }),
    });
    if (rows[0]) return rows[0].payload;
  }
  throw new Error('The conversation is busy. Please retry your message.');
}

export async function openThread(input: { studentEmail: string; studentName: string; mentorId: string }): Promise<Thread> {
  const id = threadIdFor(input.studentEmail, input.mentorId);
  const existing = await getThread(id);
  if (existing) return existing;
  const now = new Date().toISOString();
  return insert({ id, studentEmail: input.studentEmail.trim().toLowerCase(), studentName: input.studentName.trim().slice(0, 160),
    mentorId: input.mentorId, createdAt: now, lastMessageAt: now, messages: [] });
}

export async function appendMessage(threadId: string, from: Message['from'], body: string, audio?: VoiceNote): Promise<Thread | null> {
  const message: Message = { id: crypto.randomUUID(), from, body: body.trim(), sentAt: new Date().toISOString(), readAt: null,
    ...(audio ? { audio } : {}) };
  return mutate(threadId, (thread) => {
    if (audio && thread.messages.some((item) => item.audio?.path === audio.path)) return false;
    thread.messages.push(message); thread.lastMessageAt = message.sentAt; return true;
  });
}

export async function markRead(id: string, reader: Message['from']): Promise<void> {
  await mutate(id, (thread) => {
    let changed = false;
    for (const message of thread.messages) if (message.from !== reader && !message.readAt) {
      message.readAt = new Date().toISOString(); changed = true;
    }
    return changed;
  });
}

export async function listThreads(): Promise<Thread[]> {
  if (!mentorSupabaseConfig()) return store.read().sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  const rows = await mentorDbRequest<Array<{ id: string; payload: Thread }>>(
    '?select=id,payload&or=(and(kind.eq.team,id.like.mentor-thread-*),kind.eq.mentor_thread)&order=updated_at.desc');
  const map = new Map<string, Thread>();
  for (const row of rows) if (row.payload?.messages && (!map.has(row.payload.id) || row.id.startsWith(prefix))) map.set(row.payload.id, row.payload);
  for (const legacy of store.read()) if (!map.has(legacy.id)) map.set(legacy.id, await insert(legacy));
  return [...map.values()].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}
export async function listThreadsForMentor(mentorId: string): Promise<Thread[]> {
  return (await listThreads()).filter((thread) => thread.mentorId === mentorId);
}
export async function countAwaitingReply(): Promise<number> {
  return (await listThreads()).filter((thread) => thread.messages.some((m) => m.from === 'student' && !m.readAt)).length;
}
export async function countAwaitingReplyForMentor(mentorId: string): Promise<number> {
  return (await listThreadsForMentor(mentorId)).filter((thread) => thread.messages.some((m) => m.from === 'student' && !m.readAt)).length;
}
