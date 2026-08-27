import { createJsonStore } from './jsonStore.js';
import {
  type ContentKind,
  type ContentPayloadMap,
  type ContentRecord,
} from '../lib/content.js';
import {
  normalizeSupabaseUrl,
  readSupabaseEnv,
  readSupabaseEnvWithDefault,
} from './supabaseEnv.js';

const localStore = createJsonStore<ContentRecord>('content.json');

const DEFAULT_TABLE = 'sog_content_items';

interface SupabaseRow {
  id: string;
  kind: ContentKind;
  payload: unknown;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

function supabaseConfig() {
  const rawUrl = readSupabaseEnv('SUPABASE_URL');
  const serviceKey = readSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!rawUrl || !serviceKey) return null;
  return {
    url: normalizeSupabaseUrl(rawUrl),
    serviceKey,
    table: readSupabaseEnvWithDefault('SUPABASE_CONTENT_TABLE', DEFAULT_TABLE),
  };
}

export function contentStoreMode(): 'supabase' | 'local-json' {
  return supabaseConfig() ? 'supabase' : 'local-json';
}

export function isContentWritable(): boolean {
  return Boolean(supabaseConfig()) || localStore.isWritable();
}

function normalizeRow(row: SupabaseRow): ContentRecord {
  const now = new Date().toISOString();
  return {
    id: row.id,
    kind: row.kind,
    payload: row.payload as ContentPayloadMap[ContentKind],
    published: row.published,
    createdAt: row.created_at ?? now,
    updatedAt: row.updated_at ?? row.created_at ?? now,
  };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error('Supabase is not configured.');

  const res = await fetch(`${config.url}/rest/v1/${config.table}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(body?.message ?? body?.error ?? 'Supabase content request failed.');
  }
  return body as T;
}

export async function listContent(kind?: ContentKind): Promise<ContentRecord[]> {
  const config = supabaseConfig();
  if (!config) {
    const rows = localStore.read();
    return kind ? rows.filter((row) => row.kind === kind) : rows;
  }

  const filter = kind ? `&kind=eq.${kind}` : '';
  const rows = await supabaseRequest<SupabaseRow[]>(
    `?select=id,kind,payload,published,created_at,updated_at${filter}&order=updated_at.desc`
  );
  return rows.map(normalizeRow);
}

export async function upsertContent<K extends ContentKind>(
  kind: K,
  payload: ContentPayloadMap[K],
  published = true
): Promise<ContentRecord<K>> {
  const now = new Date().toISOString();
  const record: ContentRecord<K> = {
    id: payload.id,
    kind,
    payload,
    published,
    createdAt: now,
    updatedAt: now,
  };

  const config = supabaseConfig();
  if (!config) {
    const rows = localStore.read();
    const existing = rows.findIndex((row) => row.kind === kind && row.id === payload.id);
    const next =
      existing >= 0 ? { ...rows[existing], ...record, createdAt: rows[existing].createdAt } : record;
    if (existing >= 0) rows[existing] = next;
    else rows.push(next);
    localStore.write(rows);
    return next as ContentRecord<K>;
  }

  const [saved] = await supabaseRequest<SupabaseRow[]>('?on_conflict=kind,id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      id: record.id,
      kind: record.kind,
      payload: record.payload,
      published: record.published,
      updated_at: record.updatedAt,
    }),
  });
  return normalizeRow(saved) as ContentRecord<K>;
}

export async function setContentPublished(
  kind: ContentKind,
  id: string,
  published: boolean,
  fallbackPayload?: ContentPayloadMap[ContentKind]
): Promise<ContentRecord | null> {
  const rows = await listContent(kind);
  const existing = rows.find((row) => row.id === id);
  if (!existing && !fallbackPayload) return null;

  return upsertContent(kind, (existing?.payload ?? fallbackPayload) as any, published);
}

export async function deleteContentOverride(kind: ContentKind, id: string): Promise<void> {
  const config = supabaseConfig();
  if (!config) {
    localStore.write(localStore.read().filter((row) => !(row.kind === kind && row.id === id)));
    return;
  }

  await supabaseRequest(`?kind=eq.${kind}&id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
