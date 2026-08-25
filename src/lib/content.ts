import type { BlogPost, Course, EventItem, FacultyMember, GrowthJob } from '../types';

export type ContentKind = 'course' | 'event' | 'team' | 'job' | 'insight';

export interface ContentPayloadMap {
  course: Course;
  event: EventItem;
  team: FacultyMember;
  job: GrowthJob;
  insight: BlogPost;
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
};

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
  records: ContentRecord[]
): T[] {
  const merged = new Map(seed.map((item) => [item.id, item]));

  for (const record of records) {
    if (!record.published) {
      merged.delete(record.id);
      continue;
    }
    merged.set(record.id, record.payload as unknown as T);
  }

  return Array.from(merged.values());
}
