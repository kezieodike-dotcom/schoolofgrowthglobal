import crypto from "crypto";
import { createJsonStore } from "./jsonStore.js";

/**
 * Direct messages between a student and a mentor.
 *
 * IDENTITY, AND WHY IT WORKS THIS WAY
 * There are no student or mentor accounts yet, so there is no session to hang
 * a conversation off. What does exist is a verified payment: an entitlement
 * carries the email the student paid with and the Paystack reference for that
 * transaction. Those two together are the closest thing to proof of identity
 * this app has, so they are what opens a thread.
 *
 * A thread id is HMAC(studentEmail + mentorId) under a server secret. That
 * makes it deterministic — the same pair always resolves to the same thread,
 * so a student who clears their browser does not lose their history — while
 * still being unguessable from the email alone. Reading or writing needs the
 * id, and getting the id needs the payment reference. Knowing someone's email
 * is not enough to read their messages.
 *
 * This is a capability, not authentication. It is honest about that: when
 * student accounts exist, the id becomes a lookup by session and this comment
 * gets shorter. The endpoints and storage shape do not need to change.
 */

const store = createJsonStore<Thread>("messages.json");

export interface Message {
  id: string;
  from: "student" | "mentor";
  body: string;
  sentAt: string;
  /** Set when the other side has opened the thread since this arrived. */
  readAt: string | null;
}

export interface Thread {
  id: string;
  studentEmail: string;
  studentName: string;
  mentorId: string;
  createdAt: string;
  lastMessageAt: string;
  messages: Message[];
}

export const isWritable = () => store.isWritable();

/**
 * Signing key for thread ids. Derived from the Paystack secret when no
 * dedicated secret is set, so ids are stable across restarts without adding
 * another required environment variable.
 */
function threadKey(): string {
  return (
    process.env.MESSAGE_THREAD_SECRET ??
    process.env.PAYSTACK_SECRET_KEY ??
    process.env.ADMIN_PASSWORD ??
    "school-of-growth-threads"
  );
}

/** Deterministic, unguessable id for one student-mentor pair. */
export function threadIdFor(studentEmail: string, mentorId: string): string {
  return crypto
    .createHmac("sha256", threadKey())
    .update(`${studentEmail.trim().toLowerCase()}|${mentorId}`)
    .digest("hex")
    .slice(0, 32);
}

export function getThread(id: string): Thread | null {
  return store.read().find((t) => t.id === id) ?? null;
}

/** Opens the thread for a pair, creating it on first use. */
export function openThread(input: {
  studentEmail: string;
  studentName: string;
  mentorId: string;
}): Thread {
  const id = threadIdFor(input.studentEmail, input.mentorId);
  const rows = store.read();
  const existing = rows.find((t) => t.id === id);
  if (existing) {
    // A later payment may carry a name the first did not.
    if (!existing.studentName && input.studentName) {
      existing.studentName = input.studentName;
      store.write(rows);
    }
    return existing;
  }

  const now = new Date().toISOString();
  const thread: Thread = {
    id,
    studentEmail: input.studentEmail.trim(),
    studentName: input.studentName.trim(),
    mentorId: input.mentorId,
    createdAt: now,
    lastMessageAt: now,
    messages: [],
  };
  rows.push(thread);
  store.write(rows);
  return thread;
}

export function appendMessage(
  threadId: string,
  from: "student" | "mentor",
  body: string
): Thread | null {
  const rows = store.read();
  const thread = rows.find((t) => t.id === threadId);
  if (!thread) return null;

  const now = new Date().toISOString();
  thread.messages.push({
    id: crypto.randomUUID(),
    from,
    body: body.trim(),
    sentAt: now,
    readAt: null,
  });
  thread.lastMessageAt = now;

  store.write(rows);
  return thread;
}

/** Marks everything from the other side as read. */
export function markRead(threadId: string, reader: "student" | "mentor"): void {
  const rows = store.read();
  const thread = rows.find((t) => t.id === threadId);
  if (!thread) return;

  const now = new Date().toISOString();
  let changed = false;
  for (const message of thread.messages) {
    if (message.from !== reader && !message.readAt) {
      message.readAt = now;
      changed = true;
    }
  }
  if (changed) store.write(rows);
}

/** Every thread, newest activity first. For the admin inbox. */
export function listThreads(): Thread[] {
  return store.read().sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

/** Threads with at least one unread student message, for the inbox badge. */
export function countAwaitingReply(): number {
  return store
    .read()
    .filter((t) => t.messages.some((m) => m.from === "student" && !m.readAt)).length;
}
