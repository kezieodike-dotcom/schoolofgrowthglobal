import type { BlogPost, BookItem, Course, EventItem, FacultyMember, GrowthJob } from '../types';
import { isSuspendedPublicProfile, publicFacultyProfile } from './publicProfiles';

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
  if (kind === 'team') {
    return items.flatMap(item => {
      const member = publicFacultyProfile(item);
      return member && !RETIRED_TEAM_IDS.has(member.id) && !isSuspendedPublicProfile(member) ? [member] : [];
    }) as unknown as T[];
  }
  return items;
}
