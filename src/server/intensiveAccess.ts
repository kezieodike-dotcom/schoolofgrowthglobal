import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { INTENSIVE_PATHWAYS, isIntensiveCourseId, type IntensiveCourseId } from '../data/intensiveCourses.js';
import { CURRENCY, entitlementFor, PLANS, type Entitlement } from '../lib/pricing.js';
import { paystackSecretKey } from './paystackEnv.js';
import { readLearningRecord, writeLearningRecord } from './learningStorage.js';

export interface IntensivePayment {
  reference: string; status: string; amount: number; currency: string; domain?: string;
  customer?: { email?: string };
  metadata?: { plan?: string; itemKind?: string; intensiveCourseId?: string } | null;
}
interface PaidIntensive {
  version: 1;
  entitlement: Entitlement;
  courseIds: IntensiveCourseId[];
}
export const learningKey = (value: string) => createHash('sha256').update(value).digest('hex');
const signature = (payload: string, secret: string) => createHmac('sha256', secret).update(`intensive-access:${payload}`).digest('base64url');

export function validIntensivePayment(tx: IntensivePayment, reference = tx.reference) {
  return tx.reference === reference && typeof reference === 'string' && reference.length > 0 && reference.length <= 200 &&
    tx.status === 'success' && tx.metadata?.plan === 'foundation-intensive' && tx.metadata?.itemKind === 'plan' &&
    tx.amount === PLANS['foundation-intensive'].amountKobo && tx.currency === CURRENCY &&
    (process.env.NODE_ENV !== 'production' || tx.domain === 'live') && Boolean(tx.customer?.email?.trim()) &&
    (!tx.metadata.intensiveCourseId || isIntensiveCourseId(tx.metadata.intensiveCourseId));
}

export async function grantPaidIntensive(tx: IntensivePayment, reference = tx.reference): Promise<Entitlement> {
  if (!validIntensivePayment(tx, reference)) throw new Error('The intensive payment could not be verified.');
  const key = `enrolments/${learningKey(reference)}`;
  let record = await readLearningRecord<PaidIntensive>(key);
  if (!record) {
    const entitlement = entitlementFor(PLANS['foundation-intensive'], { reference, email: tx.customer!.email!.trim().toLowerCase() });
    entitlement.levels = [];
    // Old generic checkouts did not record a pathway. Honour those purchases
    // with the two advertised Foundation extracts, never the whole cohort.
    const courseIds = tx.metadata?.intensiveCourseId
      ? [tx.metadata.intensiveCourseId as IntensiveCourseId] : INTENSIVE_PATHWAYS.map(course => course.id);
    record = { version: 1, entitlement, courseIds };
    if (!await writeLearningRecord(key, record, false)) record = await readLearningRecord<PaidIntensive>(key);
  }
  if (!record || record.entitlement.reference !== reference || record.entitlement.plan !== 'foundation-intensive' ||
      record.entitlement.email !== tx.customer!.email!.trim().toLowerCase()) throw new Error('Paid enrolment could not be restored.');
  const exp = Date.parse(record.entitlement.coursesExpireAt);
  const secret = paystackSecretKey();
  if (!secret || !Number.isFinite(exp)) throw new Error('Student access is unavailable.');
  const student = createHmac('sha256', secret).update(`intensive-student:${record.entitlement.email}`).digest('hex');
  const payload = Buffer.from(JSON.stringify({ courseIds: record.courseIds, student, exp })).toString('base64url');
  return { ...record.entitlement, levels: [], intensiveAccess: {
    courseIds: record.courseIds, expiresAt: record.entitlement.coursesExpireAt,
    token: `${payload}.${signature(payload, secret)}`,
  } };
}

export function readIntensiveAccess(id: IntensiveCourseId, token: string, secret: string, now = Date.now()): string | null {
  if (!secret || token.length > 2048) return null;
  const [payload, provided, extra] = token.split('.');
  if (!payload || !provided || extra) return null;
  const expected = Buffer.from(signature(payload, secret));
  const actual = Buffer.from(provided);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Array.isArray(body.courseIds) && body.courseIds.includes(id) && Number.isSafeInteger(body.exp) && body.exp > now &&
      typeof body.student === 'string' && /^[a-f0-9]{64}$/.test(body.student) ? `intensive-${body.student}` : null;
  } catch { return null; }
}

export const requireIntensiveAccess: RequestHandler = (req, res, next) => {
  const id = req.params.courseId ?? req.params.id ?? req.body?.courseId;
  if (!isIntensiveCourseId(id)) return next();
  res.set('Cache-Control', 'no-store');
  const header = req.get('authorization') ?? '';
  const student = readIntensiveAccess(id, header.startsWith('Bearer ') ? header.slice(7) : '', paystackSecretKey() ?? '');
  if (!student) return res.status(401).json({ error: 'Verified, active access to this intensive is required. Restore access with your payment reference.' });
  res.locals.intensiveStudent = student;
  next();
};
