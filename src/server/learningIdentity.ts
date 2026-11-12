import { createHash, createHmac } from 'node:crypto';
import { paystackSecretKey } from './paystackEnv.js';

export const learningKey = (value: string) => createHash('sha256').update(value).digest('hex');

// Preserve the identity used by existing intensive exercise and progress records.
export function intensiveStudentKey(email: string) {
  const secret = paystackSecretKey();
  if (!secret) throw new Error('Student access is unavailable.');
  return createHmac('sha256', secret).update(`intensive-student:${email.trim().toLowerCase()}`).digest('hex');
}
