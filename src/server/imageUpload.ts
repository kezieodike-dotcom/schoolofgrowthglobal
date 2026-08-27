import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { ContentKind } from '../lib/content.js';
import {
  normalizeSupabaseUrl,
  readSupabaseEnv,
  readSupabaseEnvWithDefault,
} from './supabaseEnv.js';

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

interface SupabaseStorageConfig {
  url: string;
  serviceKey: string;
  bucket: string;
}

export interface ImageUploadResponse {
  url: string;
  path: string;
  storage: 'supabase' | 'local';
}

interface ImageUploadInput {
  kind: ContentKind;
  fileName: string;
  mimeType: string;
  data: string;
}

export function isAllowedImageMime(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.has(mimeType.toLowerCase());
}

function isContentKind(value: unknown): value is ContentKind {
  return value === 'course' || value === 'event' || value === 'team' || value === 'job' || value === 'insight';
}

function safeBaseName(fileName: string): string {
  const parsed = path.parse(fileName);
  const base = parsed.name || 'site-image';
  const safe = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return safe || 'site-image';
}

function extensionFor(fileName: string, mimeType: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '';
  const fromMime = IMAGE_EXTENSIONS[mimeType.toLowerCase()];
  return fromMime || safeExt || '.jpg';
}

export function buildImageUploadPath(kind: ContentKind, fileName: string, mimeType = ''): string {
  const stamp = Date.now();
  const token = randomUUID().slice(0, 8);
  return `${kind}/${stamp}-${token}-${safeBaseName(fileName)}${extensionFor(fileName, mimeType)}`;
}

function decodeImageData(data: string): Buffer {
  const base64 = data.includes(',') ? data.slice(data.indexOf(',') + 1) : data;
  return Buffer.from(base64, 'base64');
}

function supabaseStorageConfig(): SupabaseStorageConfig | null {
  const rawUrl = readSupabaseEnv('SUPABASE_URL');
  const serviceKey = readSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY');
  const bucket = readSupabaseEnvWithDefault('SUPABASE_STORAGE_BUCKET', 'site-images');

  if (!rawUrl || !serviceKey) return null;
  return { url: normalizeSupabaseUrl(rawUrl), serviceKey, bucket };
}

function publicSupabaseUrl(config: SupabaseStorageConfig, objectPath: string): string {
  const encodedBucket = encodeURIComponent(config.bucket);
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  return `${config.url}/storage/v1/object/public/${encodedBucket}/${encodedPath}`;
}

async function uploadToSupabase(
  config: SupabaseStorageConfig,
  objectPath: string,
  mimeType: string,
  file: Buffer
): Promise<ImageUploadResponse> {
  const encodedBucket = encodeURIComponent(config.bucket);
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(`${config.url}/storage/v1/object/${encodedBucket}/${encodedPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.serviceKey}`,
      apikey: config.serviceKey,
      'cache-control': '3600',
      'content-type': mimeType,
      'x-upsert': 'true',
    },
    body: file,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || 'Supabase Storage rejected the image upload.');
  }

  return {
    url: publicSupabaseUrl(config, objectPath),
    path: objectPath,
    storage: 'supabase',
  };
}

async function uploadLocally(objectPath: string, file: Buffer): Promise<ImageUploadResponse> {
  const diskPath = path.join(process.cwd(), 'data', 'uploads', objectPath);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, file);

  return {
    url: `/uploads/${objectPath}`,
    path: objectPath,
    storage: 'local',
  };
}

export async function uploadImage(input: ImageUploadInput): Promise<ImageUploadResponse> {
  if (!isContentKind(input.kind)) {
    throw new Error('Unknown content type.');
  }

  if (!input.fileName || !input.mimeType || !input.data) {
    throw new Error('Image name, type and data are required.');
  }

  if (!isAllowedImageMime(input.mimeType)) {
    throw new Error('Upload a JPG, PNG, WebP or GIF image.');
  }

  const file = decodeImageData(input.data);

  if (!file.byteLength) {
    throw new Error('The selected image is empty.');
  }

  if (file.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error('Images must be 5MB or smaller.');
  }

  const objectPath = buildImageUploadPath(input.kind, input.fileName, input.mimeType);
  const supabase = supabaseStorageConfig();

  if (supabase) {
    return uploadToSupabase(supabase, objectPath, input.mimeType, file);
  }

  return uploadLocally(objectPath, file);
}
