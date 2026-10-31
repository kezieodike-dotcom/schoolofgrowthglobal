import { normalizeSupabaseUrl, readSupabaseEnv, readSupabaseEnvWithDefault } from './supabaseEnv.js';

// Private mentor applications already use team/mentor-* records. Public content excludes this namespace.
export const PRIVATE_MENTOR_KIND = 'team';

export function mentorSupabaseConfig() {
  const url = readSupabaseEnv('SUPABASE_URL');
  const key = readSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY');
  return url && key ? { url: normalizeSupabaseUrl(url), key,
    table: readSupabaseEnvWithDefault('SUPABASE_CONTENT_TABLE', 'sog_content_items') } : null;
}

export async function mentorDbRequest<T>(query: string, init: RequestInit = {}): Promise<T> {
  const config = mentorSupabaseConfig();
  if (!config) throw new Error('Conversation storage is not configured.');
  const res = await fetch(`${config.url}/rest/v1/${config.table}${query}`, {
    ...init, signal: init.signal ?? AbortSignal.timeout(15000),
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json', ...init.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Mentor storage request failed (${res.status}): ${body?.message || 'no detail'}`);
  return body as T;
}
