import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { isPaidCourseId, type PaidCourseId } from '../data/paidCourseCatalogue.js';
import { isProfessionalCourseId } from '../data/professionalCourses.js';
import { CURRENCY, PLANS } from '../lib/pricing.js';
import { paystackSecretKey } from './paystackEnv.js';

export function isLeadershipPayment(id: PaidCourseId, reference: string, tx: {
  status: string; reference: string; amount: number; currency: string; domain?: string;
  customer?: { email?: string }; metadata?: { plan?: string; itemKind?: string } | null;
}, production: boolean): boolean {
  return tx.status === 'success' && tx.reference === reference && tx.amount === PLANS[id].amountKobo &&
    tx.currency === CURRENCY && (!production || tx.domain === 'live') && Boolean(tx.customer?.email?.trim()) &&
    tx.metadata?.itemKind === 'plan' && tx.metadata.plan === id;
}

const hmac = (secret: string, message: string) => createHmac('sha256', secret).update(message);
const sign = (secret: string, payload: string) => hmac(secret, `leadership-access:${payload}`).digest('base64url');

export function issueLeadershipAccess(id: PaidCourseId, email: string, secret: string, now = Date.now()) {
  if (!secret || !email.trim()) throw new Error('Verified payment identity is required.');
  const student = hmac(secret, `leadership-student:${email.trim().toLowerCase()}`).digest('hex');
  const exp = now + 30 * 86400_000;
  const payload = Buffer.from(JSON.stringify({ id, student, exp })).toString('base64url');
  return { token: `${payload}.${sign(secret, payload)}`, expiresAt: new Date(exp).toISOString() };
}

export function readLeadershipAccess(id: PaidCourseId, token: string, secret: string, now = Date.now()): string | null {
  if (!secret || !token || token.length > 1024) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = Buffer.from(sign(secret, payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return body.id === id && Number.isSafeInteger(body.exp) && body.exp > now &&
      typeof body.student === 'string' && /^[a-f0-9]{64}$/.test(body.student) ? `leadership-${body.student}` : null;
  } catch { return null; }
}

export const requireLeadershipAccess: RequestHandler = (req, res, next) => {
  const id = req.params.courseId ?? req.params.id ?? req.body?.courseId;
  if (!isPaidCourseId(id)) return next();
  res.set('Cache-Control', 'no-store');
  const header = req.get('authorization') ?? '';
  const student = readLeadershipAccess(id, header.startsWith('Bearer ') ? header.slice(7) : '', paystackSecretKey() ?? '');
  if (!student) return res.status(401).json({ error: 'A verified purchase for this course is required. Reopen your payment confirmation to restore access.' });
  res.locals.leadershipStudent = student;
  if (isProfessionalCourseId(id)) res.locals.professionalStudent = student;
  next();
};
