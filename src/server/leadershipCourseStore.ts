import { isLeadershipCourseId, LEADERSHIP_COURSES, type LeadershipAvailability, type LeadershipOutlines } from '../data/leadershipPricing.js';
import type { LmsCourse } from '../types.js';
import { getLmsCourse } from './lmsStore.js';
import { normalizeSupabaseUrl, readSupabaseEnv } from './supabaseEnv.js';

const validId = (id: unknown) => typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(id);
const nonempty = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

type LeadershipCourse = LmsCourse & { published: boolean; answerKey?: Record<string, string> };

export const LEADERSHIP_BUCKET = 'leadership-courses';
export const LEADERSHIP_STORAGE_UNAVAILABLE = 'Leadership courses are temporarily unavailable. Please try again shortly.';

export function leadershipStorage() {
  const url = readSupabaseEnv('SUPABASE_URL');
  const key = readSupabaseEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  const base = normalizeSupabaseUrl(url);
  return (path: string, init: RequestInit = {}) => fetch(`${base}/storage/v1${path}`, {
    ...init,
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

export function isReadyLeadershipCourse(id: string, value: unknown): value is LmsCourse {
  if (!isLeadershipCourseId(id) || !value || typeof value !== 'object') return false;
  const course = value as LmsCourse & { published?: boolean };
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  const blockIds = new Set<string>();
  return course.id === id && course.published === true && nonempty(course.title) &&
    Array.isArray(course.modules) && course.modules.length > 0 && course.modules.every(module => {
      if (!module || !validId(module.id) || moduleIds.has(module.id) || !nonempty(module.title)) return false;
      moduleIds.add(module.id);
      return Array.isArray(module.lessons) && module.lessons.length > 0 && module.lessons.every(lesson => {
        if (!lesson || !validId(lesson.id) || lessonIds.has(lesson.id) || !nonempty(lesson.title)) return false;
        lessonIds.add(lesson.id);
        return Array.isArray(lesson.blocks) && lesson.blocks.some(block => nonempty(block?.content)) && lesson.blocks.every(block => {
          if (!block || !validId(block.id) || blockIds.has(block.id) || !nonempty(block.type)) return false;
          blockIds.add(block.id);
          return true;
        });
      });
    });
}

export async function getPublishedLeadershipCourse(id: string): Promise<LeadershipCourse | null> {
  if (!isLeadershipCourseId(id)) return null;
  const storage = leadershipStorage();
  if (!storage) {
    const course = getLmsCourse(id);
    return isReadyLeadershipCourse(id, course) ? course as LeadershipCourse : null;
  }
  const response = await storage(`/object/authenticated/${LEADERSHIP_BUCKET}/${id}.json`);
  const course = await response.json();
  if (response.status === 404 || String(course?.statusCode) === '404' || course?.error === 'not_found') return null;
  if (!response.ok) throw new Error(`Leadership storage read failed (${response.status})`);
  return isReadyLeadershipCourse(id, course) ? course as LeadershipCourse : null;
}

async function collectAvailability(files?: Set<string>) {
  const available: LeadershipAvailability = {};
  const outlines: LeadershipOutlines = {};
  const entries = await Promise.all(LEADERSHIP_COURSES.filter(({ id }) => !files || files.has(`${id}.json`))
    .map(async ({ id }) => ({ id, course: await getPublishedLeadershipCourse(id) })));
  for (const { id, course } of entries) {
    if (!course) continue;
    available[id] = `/lms/${id}/${course.modules[0].id}/${course.modules[0].lessons[0].id}`;
    outlines[id] = course.modules.filter(module => /^module-\d+$/.test(module.id)).map(module => module.title);
  }
  return { available, outlines };
}

let catalogue: { expiresAt: number; promise: ReturnType<typeof collectAvailability> } | undefined;

export async function leadershipAvailability() {
  const storage = leadershipStorage();
  if (!storage) return collectAvailability();
  if (catalogue && catalogue.expiresAt > Date.now()) return catalogue.promise;

  // Share only validated public metadata between requests. Checkout always
  // reads the current private file again before opening a payment.
  const promise = (async () => {
    const response = await storage(`/object/list/${LEADERSHIP_BUCKET}`, {
      method: 'POST',
      body: JSON.stringify({ prefix: '', limit: 100 }),
    });
    if (!response.ok) throw new Error(`Leadership storage listing failed (${response.status})`);
    const files: Array<{ name: string }> = await response.json();
    return collectAvailability(new Set(files.map(file => file.name)));
  })();
  catalogue = { expiresAt: Date.now() + 30_000, promise };
  try {
    return await promise;
  } catch (error) {
    if (catalogue?.promise === promise) catalogue = undefined;
    throw error;
  }
}
