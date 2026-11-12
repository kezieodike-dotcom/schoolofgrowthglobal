import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { paystackSecretKey } from './paystackEnv.js';
import { intensiveStudentKey, learningKey } from './learningIdentity.js';
import { LEARNING_BUCKET, learningStorage, readLearningRecord, writeLearningRecord } from './learningStorage.js';

export interface StudentProfile { id: string; email: string; name: string; createdAt: string }
export const STUDENT_COOKIE = 'sgg_student';
const SESSION_SECONDS = 30 * 86400;

export async function ensureStudentAccount(email: string, reference: string, name = '') {
  const normalized = email.trim().toLowerCase();
  const id = intensiveStudentKey(normalized);
  const key = `students/${id}/profile`;
  let profile = await readLearningRecord<StudentProfile>(key);
  if (!profile) {
    profile = { id, email: normalized, name: name.trim().slice(0, 120), createdAt: new Date().toISOString() };
    if (!await writeLearningRecord(key, profile, false)) profile = await readLearningRecord<StudentProfile>(key);
  }
  if (!profile || profile.id !== id || profile.email !== normalized) throw new Error('Student profile could not be restored.');
  if (!profile.name && name.trim()) {
    profile = { ...profile, name: name.trim().slice(0, 120) };
    await writeLearningRecord(key, profile);
  }
  // Separate immutable entries avoid lost purchases when two webhooks arrive together.
  await writeLearningRecord(`students/${id}/purchases/${learningKey(reference)}`, { reference }, false);
  return profile;
}

export async function studentPurchaseReferences(id: string): Promise<string[]> {
  const references: string[] = [];
  const prefix = `students/${id}/purchases`;
  for (let offset = 0; ; offset += 100) {
    const response = await learningStorage(`/object/list/${LEARNING_BUCKET}`, {
      method: 'POST', body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    const files = await response.json();
    if (!response.ok || !Array.isArray(files)) throw new Error('Your course list could not be read.');
    const records = await Promise.all(files.filter(file => /^[a-f0-9]{64}\.json$/.test(file.name)).map(file =>
      readLearningRecord<{ reference: string }>(`${prefix}/${file.name.slice(0, -5)}`)));
    for (const record of records) if (typeof record?.reference === 'string') references.push(record.reference);
    if (files.length < 100) break;
  }
  return references;
}

const signature = (payload: string) => {
  const secret = paystackSecretKey();
  if (!secret) throw new Error('Student access is unavailable.');
  return createHmac('sha256', secret).update(`student-session:${payload}`).digest('base64url');
};

export function studentSessionId(req: Request, now = Date.now()): string | null {
  const token = (req.get('cookie') ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(`${STUDENT_COOKIE}=`))?.slice(STUDENT_COOKIE.length + 1);
  if (!token || token.length > 1024 || !paystackSecretKey()) return null;
  const [payload, supplied, extra] = token.split('.');
  if (!payload || !supplied || extra) return null;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(supplied);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof body.student === 'string' && /^[a-f0-9]{64}$/.test(body.student) && Number.isSafeInteger(body.exp) && body.exp > now ? body.student : null;
  } catch { return null; }
}

export function setStudentSession(req: Request, res: Response, id: string) {
  const payload = Buffer.from(JSON.stringify({ student: id, exp: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url');
  res.cookie(STUDENT_COOKIE, `${payload}.${signature(payload)}`, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' || req.secure,
    path: '/', maxAge: SESSION_SECONDS * 1000,
  });
}

export function clearStudentSession(req: Request, res: Response) {
  res.cookie(STUDENT_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' || req.secure, path: '/', maxAge: 0 });
}
