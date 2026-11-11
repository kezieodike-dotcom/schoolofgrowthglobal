import { normalizeSupabaseUrl, readSupabaseEnv } from './supabaseEnv.js';

export const LEARNING_BUCKET = 'student-learning';

export async function learningStorage(path: string, init: RequestInit = {}) {
  const url = readSupabaseEnv('SUPABASE_URL');
  const key = readSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Student learning storage is unavailable.');
  return fetch(`${normalizeSupabaseUrl(url)}/storage/v1${path}`, {
    ...init, redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

export async function readLearningRecord<T>(key: string): Promise<T | null> {
  const response = await learningStorage(`/object/authenticated/${LEARNING_BUCKET}/${key}.json`);
  const body = await response.json();
  if (response.status === 404 || String(body?.statusCode) === '404') return null;
  if (!response.ok) throw new Error('Student learning storage could not be read.');
  return body as T;
}

export async function writeLearningRecord(key: string, value: unknown, overwrite = true): Promise<boolean> {
  const response = await learningStorage(`/object/${LEARNING_BUCKET}/${key}.json`, {
    method: 'POST', headers: { 'x-upsert': String(overwrite) }, body: JSON.stringify(value),
  });
  if (!overwrite && (response.status === 409 || response.status === 400)) {
    const body = await response.json();
    if (String(body?.statusCode) === '409' || body?.error === 'Duplicate') return false;
  }
  if (!response.ok) throw new Error('Student learning storage could not be saved.');
  return true;
}
