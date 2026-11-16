import { createHmac, timingSafeEqual } from 'node:crypto';
import { isPaidCourseId, type PaidCourseId } from '../data/paidCourseCatalogue.js';
import type { Entitlement } from '../lib/pricing.js';
import { issueLeadershipAccess } from './leadershipAccess.js';
import { learningRecordKeys, readLearningRecord, writeLearningRecord } from './learningStorage.js';
import { paystackSecretKey } from './paystackEnv.js';

export interface ComplimentaryGrant {
  id: string; courseId: PaidCourseId; name: string; email: string;
  createdAt: string; expiresAt: string; revokedAt?: string;
}
interface Dependencies {
  secret: () => string; now: () => number;
  read: <T>(key: string) => Promise<T | null>;
  write: (key: string, value: unknown, overwrite?: boolean) => Promise<boolean>;
  keys: (prefix: string) => Promise<string[]>;
}
export const validGrant = (grant: ComplimentaryGrant | null, now = Date.now()): grant is ComplimentaryGrant =>
  Boolean(grant && !grant.revokedAt && Date.parse(grant.expiresAt) > now);

export function createComplimentaryAccess(deps: Dependencies) {
  const digest = (value: string) => {
    const secret = deps.secret();
    if (!secret) throw new Error('Student access is unavailable.');
    return createHmac('sha256', secret).update(value).digest('hex');
  };
  const grantId = (id: PaidCourseId, email: string) => digest(`complimentary:${id}:${email}`);
  const studentPrefix = (email: string) => `complimentary-students/${digest(`complimentary-student:${email.trim().toLowerCase()}`)}`;
  const read = (id: string) => /^[a-f0-9]{64}$/.test(id) ? deps.read<ComplimentaryGrant>(`complimentary/${id}`) : Promise.resolve(null);
  const codeFor = (record: ComplimentaryGrant) => `${record.id}.${digest(`complimentary-invitation:${record.id}:${record.createdAt}`)}`;
  async function grant(courseId: PaidCourseId, name: string, email: string) {
    const normalized = email.trim().toLowerCase();
    if (!isPaidCourseId(courseId) || !name.trim() || name.length > 120 || normalized.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('A valid course, name and email are required.');
    const id = grantId(courseId, normalized);
    let record = await read(id);
    if (!record) {
      const now = deps.now();
      const candidate: ComplimentaryGrant = { id, courseId, name: name.trim(), email: normalized,
        createdAt: new Date(now).toISOString(), expiresAt: new Date(now + 60 * 86400_000).toISOString() };
      if (await deps.write(`complimentary/${id}`, candidate, false)) record = candidate;
      else record = await read(id);
    }
    if (!record || record.id !== id || record.email !== normalized || record.courseId !== courseId) throw new Error('The invitation could not be saved.');
    await deps.write(`${studentPrefix(normalized)}/${id}`, { id }, false);
    return { record, code: codeFor(record) };
  }
  async function activate(code: string, email: string) {
    if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(code)) return null;
    const record = await read(code.slice(0, 64));
    if (!validGrant(record, deps.now()) || record.email !== email.trim().toLowerCase()) return null;
    const supplied = Buffer.from(code);
    const expected = Buffer.from(codeFor(record));
    return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? record : null;
  }
  async function forEmail(email: string) {
    const ids = await deps.keys(studentPrefix(email));
    return (await Promise.all(ids.map(read))).filter((row): row is ComplimentaryGrant => Boolean(row && row.email === email.trim().toLowerCase()));
  }
  function entitlement(record: ComplimentaryGrant): Entitlement {
    return { plan: record.courseId, reference: `complimentary-${record.id}`, email: record.email,
      purchasedAt: record.createdAt, coursesExpireAt: record.expiresAt, mentorshipExpiresAt: record.createdAt,
      levels: [], accessKind: 'complimentary',
      ...(validGrant(record, deps.now()) ? { leadershipAccess: issueLeadershipAccess(record.courseId, record.email, deps.secret(), deps.now(), { id: record.id, expiresAt: record.expiresAt }) } : {}),
    };
  }
  async function revoke(id: string) {
    const record = await read(id);
    if (!record) return false;
    if (!record.revokedAt) await deps.write(`complimentary/${id}`, { ...record, revokedAt: new Date(deps.now()).toISOString() });
    return true;
  }
  const list = async () => (await Promise.all((await deps.keys('complimentary')).map(read))).filter((row): row is ComplimentaryGrant => Boolean(row));
  return { grant, activate, forEmail, entitlement, read, revoke, codeFor, list };
}

export const complimentaryAccess = createComplimentaryAccess({
  secret: () => paystackSecretKey() ?? '', now: () => Date.now(), read: readLearningRecord, write: writeLearningRecord, keys: learningRecordKeys,
});
