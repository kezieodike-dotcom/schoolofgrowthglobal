export type ConversationRole = 'student' | 'mentor';
export interface VoiceNote { path: string; mimeType: string; durationMs: number; sizeBytes: number }
export interface ConversationMessage {
  id: string; from: ConversationRole; body: string; sentAt: string; readAt: string | null; audio?: VoiceNote;
}
export interface ConversationThread {
  id: string; studentEmail: string; studentName: string; mentorId: string;
  createdAt: string; lastMessageAt: string; messages: ConversationMessage[];
}
export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed' | 'failed';
export interface MentorCall {
  id: string; threadId: string; caller: ConversationRole; mode: 'audio' | 'video'; status: CallStatus;
  createdAt: string; expiresAt: string; acceptedAt?: string; endedAt?: string;
  revision?: string;
  seen?: Partial<Record<ConversationRole, string>>;
}
export interface CallSignal {
  id: string; callId: string; threadId: string; from: ConversationRole;
  type: 'offer' | 'answer' | 'ice'; data: RTCSessionDescriptionInit | RTCIceCandidateInit; createdAt: string;
}
export const VOICE_MAX_DURATION_MS = 180000;
export const VOICE_MAX_BYTES = 8 * 1024 * 1024;

export async function communicationRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init, cache: 'no-store', signal: init.signal ?? AbortSignal.timeout(20000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload) throw new Error(payload?.error || 'Could not reach the conversation. Please try again.');
  return payload as T;
}

export async function uploadVoiceNote(threadId: string, token: string, audio: Blob, durationMs: number): Promise<ConversationThread> {
  const { path, uploadUrl, uploadToken } = await communicationRequest<{ path: string; uploadUrl: string; uploadToken: string }>(
    `/api/messages/${threadId}/voice/upload-url`, token,
    { method: 'POST', body: JSON.stringify({ mimeType: audio.type, sizeBytes: audio.size, durationMs }) });
  const uploaded = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': audio.type.split(';')[0], 'x-upsert': 'false' },
    body: audio, signal: AbortSignal.timeout(90000) });
  if (!uploaded.ok) throw new Error('The voice note did not upload. Your recording is still available to retry.');
  const result = await communicationRequest<{ thread: ConversationThread }>(`/api/messages/${threadId}/voice/complete`, token,
    { method: 'POST', body: JSON.stringify({ path, uploadToken }) });
  return result.thread;
}
