import type { BlogPost, BookItem, Course, EventItem, FacultyMember, GrowthJob } from '../types';
import { isSuspendedPublicProfile, publicFacultyProfile } from './publicProfiles.js';
import { normalizeCourseTitle } from './courseIdentity.js';

export type ContentKind = 'course' | 'event' | 'team' | 'job' | 'insight' | 'book';

export interface ContentPayloadMap {
  course: Course;
  event: EventItem;
  team: FacultyMember;
  job: GrowthJob;
  insight: BlogPost;
  book: BookItem;
}

export interface ContentRecord<K extends ContentKind = ContentKind> {
  id: string;
  kind: K;
  payload: ContentPayloadMap[K];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export const CONTENT_LABEL: Record<ContentKind, string> = {
  course: 'Courses',
  event: 'Events',
  team: 'Team',
  job: 'Jobs',
  insight: 'Insights',
  book: 'Books',
};

// This legacy team record was removed from the approved public faculty list.
const RETIRED_TEAM_IDS = new Set(['f1']);


export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || cryptoFallbackId()
  );
}

export function cryptoFallbackId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now().toString(36)}`;
}

export function mergeContent<T extends { id: string }>(
  seed: T[],
  records: ContentRecord[],
  kind?: ContentKind
): T[] {
  const merged = new Map(seed.map((item) => [item.id, item]));

  for (const record of records) {
    if (record.kind === 'team' && RETIRED_TEAM_IDS.has(record.id)) {
      continue;
    }
    if (!record.published) {
      merged.delete(record.id);
      continue;
    }
    merged.set(record.id, record.payload as unknown as T);
  }

  const items = Array.from(merged.values());
  if (kind === 'course') {
    const courses = new Map<string, T>();
    const overrides = new Set(records.filter(record => record.published).map(record => record.id));
    for (const item of items) {
      const title = (item as T & { title?: string }).title;
      const key = typeof title === 'string' ? normalizeCourseTitle(title) : item.id;
      const existing = courses.get(key);
      if (!existing) courses.set(key, item);
      else if (overrides.has(item.id) && !overrides.has(existing.id)) {
        // Use the updated published details while retaining the established URL.
        courses.set(key, { ...existing, ...item, id: existing.id });
      }
    }
    return [...courses.values()];
  }
  if (kind === 'team') {
    return items.flatMap(item => {
      const member = publicFacultyProfile(item);
      return member && !RETIRED_TEAM_IDS.has(member.id) && !isSuspendedPublicProfile(member) ? [member] : [];
    }) as unknown as T[];
  }
  return items;
}

export function findCourseById(courses: Course[], records: ContentRecord[], id: string | undefined): Course | undefined {
  const exact = courses.find(course => course.id === id);
  if (exact) return exact;
  const alias = records.find(record => record.kind === 'course' && record.published && record.id === id)?.payload as Course | undefined;
  return alias ? courses.find(course => normalizeCourseTitle(course.title) === normalizeCourseTitle(alias.title)) : undefined;
}
