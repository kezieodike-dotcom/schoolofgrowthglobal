import { createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { isPaidCourseId, type PaidCourseId } from '../data/paidCourseCatalogue.js';
import { isProfessionalCourseId } from '../data/professionalCourses.js';
import { CURRENCY, PLANS } from '../lib/pricing.js';
import { paystackSecretKey } from './paystackEnv.js';
import { readLearningRecord } from './learningStorage.js';
import type { ComplimentaryGrant } from './complimentaryAccess.js';

export function isLeadershipPayment(id: PaidCourseId, reference: string, tx: {
  status: string; reference: string; amount: number; currency: string; domain?: string;
  customer?: { email?: string }; metadata?: { plan?: string; itemKind?: string } | null;
}, production: boolean): boolean {
  return PLANS[id].amountKobo > 0 && tx.status === 'success' && tx.reference === reference && tx.amount === PLANS[id].amountKobo &&
    tx.currency === CURRENCY && (!production || tx.domain === 'live') && Boolean(tx.customer?.email?.trim()) &&
    tx.metadata?.itemKind === 'plan' && tx.metadata.plan === id;
}

const hmac = (secret: string, message: string) => createHmac('sha256', secret).update(message);
const sign = (secret: string, payload: string) => hmac(secret, `leadership-access:${payload}`).digest('base64url');
export function leadershipStudentIdentity(email: string, secret: string): string {
  if (!secret || !email.trim()) throw new Error('Verified learner identity is required.');
  return `leadership-${hmac(secret, `leadership-student:${email.trim().toLowerCase()}`).digest('hex')}`;
}

export function issueLeadershipAccess(id: PaidCourseId, email: string, secret: string, now = Date.now(), grant?: { id: string; expiresAt: string }) {
  if (!secret || !email.trim()) throw new Error('Verified payment identity is required.');
  const student = leadershipStudentIdentity(email, secret).slice('leadership-'.length);
  const exp = grant ? Date.parse(grant.expiresAt) : now + 30 * 86400_000;
  if (!Number.isSafeInteger(exp) || exp <= now || (grant && !/^[a-f0-9]{64}$/.test(grant.id))) throw new Error('Invalid access period.');
  const payload = Buffer.from(JSON.stringify({ id, student, exp, ...(grant ? { grant: grant.id } : {}) })).toString('base64url');
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

export const requireLeadershipAccess: RequestHandler = async (req, res, next) => {
  const id = req.params.courseId ?? req.params.id ?? req.body?.courseId;
  if (!isPaidCourseId(id)) return next();
  res.set('Cache-Control', 'no-store');
  const header = req.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const secret = paystackSecretKey() ?? '';
  const student = readLeadershipAccess(id, token, secret);
  if (!student) return res.status(401).json({ error: 'Course access is required. Restore your purchase or reopen your personal course invitation.' });
  // Decode only after the signature, course, identity and expiry have been verified.
  const claims = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
  if (Object.hasOwn(claims, 'grant')) {
    if (typeof claims.grant !== 'string' || !/^[a-f0-9]{64}$/.test(claims.grant)) return res.status(401).json({ error: 'Invalid course invitation.' });
    try {
      const record = await readLearningRecord<ComplimentaryGrant>(`complimentary/${claims.grant}`);
      if (!record || record.id !== claims.grant || record.courseId !== id || record.revokedAt || Date.parse(record.expiresAt) !== claims.exp ||
        `leadership-${hmac(secret, `leadership-student:${record.email}`).digest('hex')}` !== student) return res.status(401).json({ error: 'This course invitation is no longer active.' });
    } catch { return res.status(503).json({ error: 'Course access could not be checked. Please retry.' }); }
  }
  res.locals.leadershipStudent = student;
  if (isProfessionalCourseId(id)) res.locals.professionalStudent = student;
  next();
};
