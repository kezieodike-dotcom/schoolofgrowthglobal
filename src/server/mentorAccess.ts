import crypto from 'node:crypto';
import type { Request, Response as ExpressResponse, RequestHandler } from 'express';
import { CURRENCY, PLANS, isPlanCode, type PlanCode } from '../lib/pricing.js';
import { paystackSecretKey } from './paystackEnv.js';
import { getThread, type Thread } from './messageStore.js';

export class MentorApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const localSigningKey = crypto.randomBytes(32).toString('hex');
const mentorKey = () => process.env.MENTOR_INBOX_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD || process.env.MENTOR_INBOX_PASSWORD || process.env.DEMO_REVIEWER_PASSWORD ||
  (process.env.NODE_ENV !== 'production' ? localSigningKey : '');
const studentKey = () => process.env.MESSAGE_THREAD_SECRET || paystackSecretKey() || '';

function sign(payload: Record<string, unknown>, key: string): string {
  if (!key) throw new MentorApiError(503, 'Conversation access is temporarily unavailable. Please contact support.');
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${crypto.createHmac('sha256', key).update(encoded).digest('base64url')}`;
}

function decode(token: string | undefined, key: string): Record<string, any> | null {
  if (!token || !key || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', key).update(payload).digest('base64url');
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof body.exp === 'number' && body.exp > Date.now() ? body : null;
  } catch { return null; }
}

export function issueMentorToken(mentorId: string): { token: string; expiresAt: string } {
  const exp = Date.now() + 8 * 3600_000;
  return { token: sign({ sub: 'mentor', mentorId, exp }, mentorKey()), expiresAt: new Date(exp).toISOString() };
}

export function verifyMentorToken(token: string | undefined, mentorId: string): boolean {
  const body = decode(token, mentorKey());
  return body?.sub === 'mentor' && body.mentorId === mentorId;
}

export function issueStudentConversationToken(input: {
  threadId: string; email: string; mentorId: string; expiresAt: number;
}): string {
  return sign({ sub: 'student', threadId: input.threadId, email: input.email.trim().toLowerCase(),
    mentorId: input.mentorId, exp: Math.min(input.expiresAt, Date.now() + 3600_000) }, studentKey());
}

export function verifyStudentConversationToken(token: string | undefined, thread: Pick<Thread, 'id' | 'mentorId' | 'studentEmail'>): boolean {
  const body = decode(token, studentKey());
  return body?.sub === 'student' && body.threadId === thread.id && body.mentorId === thread.mentorId &&
    body.email === thread.studentEmail.trim().toLowerCase();
}

export function conversationRole(req: Request, thread: Thread): 'student' | 'mentor' {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (verifyMentorToken(token, thread.mentorId)) return 'mentor';
  if (verifyStudentConversationToken(token, thread)) return 'student';
  throw new MentorApiError(401, 'Your conversation access has expired. Reopen the conversation to continue.');
}

export async function authorizedConversation(req: Request, expected?: 'student' | 'mentor') {
  const thread = await getThread(req.params.threadId);
  if (!thread) throw new MentorApiError(404, 'No such conversation.');
  const role = conversationRole(req, thread);
  if (expected && role !== expected) throw new MentorApiError(403, 'Use your own conversation access to continue.');
  return { thread, role };
}

export function mentorEndpoint(handler: (req: Request, res: ExpressResponse) => Promise<unknown>): RequestHandler {
  return (req, res) => {
    res.set('Cache-Control', 'no-store');
    Promise.resolve(handler(req, res)).catch((error) => {
      if (!(error instanceof MentorApiError)) console.error('Mentor communication request failed:', error);
      if (!res.headersSent) res.status(error instanceof MentorApiError ? error.status : 503).json({
        error: error instanceof MentorApiError ? error.message : 'The conversation service is temporarily unavailable. Please try again.',
      });
    });
  };
}

export async function verifyMentorshipPurchase(reference: string, email: string, mentorId?: string): Promise<{
  plan: PlanCode; expiresAt: string;
}> {
  if (!reference || reference.length < 6 || reference.length > 200) {
    throw new MentorApiError(403, 'A verified mentorship payment is required to contact a mentor.');
  }
  const key = paystackSecretKey();
  if (!key) throw new MentorApiError(503, 'Payment verification is temporarily unavailable. Please contact support.');
  let response: Response;
  try {
    response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000),
    });
  } catch { throw new MentorApiError(502, 'We could not verify your payment. Please try again shortly.'); }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.status) {
    throw new MentorApiError(response.status >= 500 || response.status === 429 ? 502 : 403,
      'We could not confirm this mentorship payment. Check your enrolment reference or contact support.');
  }
  const tx = result.data;
  const paidAt = Date.parse(tx?.paid_at || tx?.paidAt || '');
  const plan = isPlanCode(tx?.metadata?.plan) ? PLANS[tx.metadata.plan] : null;
  if (tx?.status !== 'success' || tx.reference !== reference ||
      String(tx.customer?.email || '').trim().toLowerCase() !== email.trim().toLowerCase() ||
      !plan || plan.mentorshipDays <= 0 || plan.mentorSlots <= 0 ||
      tx.amount !== plan.amountKobo || tx.currency !== CURRENCY || !Number.isFinite(paidAt) ||
      paidAt > Date.now() + 60000 || (process.env.NODE_ENV === 'production' && tx.domain !== 'live')) {
    throw new MentorApiError(403, 'An active, paid mentorship plan belonging to this email is required to contact a mentor.');
  }
  if (mentorId && tx.metadata?.mentorId && tx.metadata.mentorId !== mentorId && plan.kind === 'mentorship') {
    throw new MentorApiError(403, 'This mentorship purchase is for a different mentor. Open the mentor selected at checkout.');
  }
  const expiry = paidAt + plan.mentorshipDays * 86400_000;
  if (expiry <= Date.now()) throw new MentorApiError(403, 'Your paid mentorship access has expired. Renew your plan to contact a mentor.');
  return { plan: plan.code, expiresAt: new Date(expiry).toISOString() };
}
