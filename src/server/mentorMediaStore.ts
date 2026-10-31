import crypto from 'node:crypto';
import { mentorSupabaseConfig } from './mentorPrivateStore.js';
import { MentorApiError } from './mentorAccess.js';
import { VOICE_MAX_BYTES, VOICE_MAX_DURATION_MS, type ConversationRole, type VoiceNote } from '../lib/mentorCommunications.js';

const types: Record<string, string> = { 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a' };
const bucket = () => process.env.SUPABASE_MENTOR_VOICE_BUCKET || 'mentor-voice-notes';
let bucketCheck: { key: string; until: number; promise: Promise<void> } | null = null;
function config() {
  const value = mentorSupabaseConfig();
  if (!value) throw new MentorApiError(503, 'Voice notes are temporarily unavailable. Please use a text message.');
  return value;
}
function objectPath(path: string) { return `${encodeURIComponent(bucket())}/${path.split('/').map(encodeURIComponent).join('/')}`; }

async function storageFetch(path: string, init: RequestInit = {}) {
  const c = config();
  return fetch(`${c.url}/storage/v1${path}`, { ...init, signal: AbortSignal.timeout(15000),
    headers: { apikey: c.key, Authorization: `Bearer ${c.key}`, 'Content-Type': 'application/json', ...init.headers } });
}
async function storageJson(path: string, init: RequestInit = {}) {
  const response = await storageFetch(path, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Private voice storage failed (${response.status}): ${data?.message || data?.error || ''}`);
  return data;
}

export async function ensureVoiceBucket(): Promise<void> {
  const c = config();
  const key = `${c.url}/${bucket()}`;
  if (bucketCheck?.key === key && bucketCheck.until > Date.now()) return bucketCheck.promise;
  const promise = (async () => {
    let response = await storageFetch(`/bucket/${encodeURIComponent(bucket())}`);
    let info = await response.json().catch(() => null);
    if (!response.ok && (response.status === 404 || String(info?.statusCode) === '404' || info?.error === 'not_found')) {
      const created = await storageFetch('/bucket', { method: 'POST', body: JSON.stringify({ id: bucket(), name: bucket(),
        public: false, file_size_limit: VOICE_MAX_BYTES, allowed_mime_types: Object.keys(types) }) });
      if (!created.ok && created.status !== 409 && created.status !== 400) throw new Error('Could not create private voice storage.');
      response = await storageFetch(`/bucket/${encodeURIComponent(bucket())}`);
      info = await response.json().catch(() => null);
    }
    if (!response.ok || info?.public !== false || !info.file_size_limit || Number(info.file_size_limit) > VOICE_MAX_BYTES ||
        !Array.isArray(info.allowed_mime_types) || !info.allowed_mime_types.length || info.allowed_mime_types.some((mime: string) => !types[mime])) {
      throw new Error('Voice bucket must be private with an 8 MB file limit and restricted audio MIME types.');
    }
  })();
  bucketCheck = { key, until: Date.now() + 300000, promise };
  try { await promise; } catch (error) { bucketCheck = null; throw error; }
}

export function validateVoiceInput(input: any): Omit<VoiceNote, 'path'> {
  const mimeType = typeof input?.mimeType === 'string' ? input.mimeType.split(';')[0].toLowerCase() : '';
  if (!types[mimeType]) throw new MentorApiError(400, 'Record a WebM, Ogg, or MP4 voice note.');
  const { sizeBytes, durationMs } = input;
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > VOICE_MAX_BYTES) {
    throw new MentorApiError(400, 'Voice notes must be 8 MB or smaller.');
  }
  if (!Number.isFinite(durationMs) || durationMs < 1 || durationMs > VOICE_MAX_DURATION_MS) {
    throw new MentorApiError(400, 'Voice notes must be three minutes or shorter.');
  }
  return { mimeType, sizeBytes, durationMs: Math.round(durationMs) };
}

export async function createVoiceUpload(threadId: string, role: ConversationRole, input: unknown) {
  const metadata = validateVoiceInput(input);
  await ensureVoiceBucket();
  const path = `${threadId}/${role}/${crypto.randomUUID()}.${types[metadata.mimeType]}`;
  const data = await storageJson(`/object/upload/sign/${objectPath(path)}`, { method: 'POST', body: '{}' });
  const uploadUrl = new URL(`${config().url}/storage/v1${data.url}`).toString();
  const payload = Buffer.from(JSON.stringify({ ...metadata, path, threadId, role, exp: Date.now() + 2 * 3600_000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', config().key).update(payload).digest('base64url');
  return { path, uploadUrl, uploadToken: `${payload}.${signature}` };
}

export async function completeVoiceUpload(threadId: string, role: ConversationRole, path: unknown, token: unknown): Promise<VoiceNote> {
  if (typeof token !== 'string' || token.length > 4096 || typeof path !== 'string') throw new MentorApiError(400, 'Invalid voice upload.');
  const parts = token.split('.');
  if (parts.length !== 2) throw new MentorApiError(400, 'Invalid voice upload.');
  const [encoded, signature] = parts;
  const a = Buffer.from(signature), b = Buffer.from(crypto.createHmac('sha256', config().key).update(encoded).digest('base64url'));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new MentorApiError(403, 'This voice upload is not authorized.');
  let data: any;
  try { data = JSON.parse(Buffer.from(encoded, 'base64url').toString()); } catch { throw new MentorApiError(400, 'Invalid voice upload.'); }
  if (data.threadId !== threadId || data.role !== role || data.path !== path || data.exp <= Date.now()) {
    throw new MentorApiError(403, 'This voice upload has expired or belongs to another conversation.');
  }
  await ensureVoiceBucket();
  const metadata = validateVoiceInput(data);
  const object = await storageFetch(`/object/authenticated/${objectPath(path)}`, { method: 'HEAD' });
  if (!object.ok || Number(object.headers.get('content-length')) !== metadata.sizeBytes ||
      object.headers.get('content-type')?.split(';')[0] !== metadata.mimeType) {
    throw new MentorApiError(400, 'The voice upload is incomplete. Please upload the recording again.');
  }
  return { path, ...metadata };
}

export async function voicePlaybackUrl(path: string) {
  await ensureVoiceBucket();
  const data = await storageJson(`/object/sign/${objectPath(path)}`, { method: 'POST', body: JSON.stringify({ expiresIn: 600 }) });
  return { url: `${config().url}/storage/v1${data.signedURL}`, expiresAt: new Date(Date.now() + 600000).toISOString() };
}
