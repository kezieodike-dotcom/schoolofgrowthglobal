import type { ContentKind, ContentRecord } from './content.js';

export type NotifiableContentKind = Exclude<ContentKind, 'team'>;

export interface ContentNotification {
  id: string;
  kind: NotifiableContentKind;
  title: string;
  message: string;
  href: string;
  updatedAt: string;
}

const MESSAGE_BY_KIND: Record<NotifiableContentKind, string> = {
  course: 'New course update',
  event: 'New event update',
  job: 'New career job update',
  insight: 'New insight update',
  book: 'New book update',
};

function isNotifiableKind(kind: ContentKind): kind is NotifiableContentKind {
  return kind === 'course' || kind === 'event' || kind === 'job' || kind === 'insight' || kind === 'book';
}

function notificationHref(record: ContentRecord<NotifiableContentKind>): string {
  switch (record.kind) {
    case 'course':
      return `/courses/${record.payload.id}`;
    case 'insight':
      return `/blog/${(record as ContentRecord<'insight'>).payload.slug}`;
    case 'event':
      return '/events';
    case 'job':
      return '/jobs';
    case 'book':
      return '/books';
  }
}

export function toContentNotification(record: ContentRecord): ContentNotification | null {
  if (!record.published || !isNotifiableKind(record.kind)) return null;

  const next = record as ContentRecord<NotifiableContentKind>;
  return {
    id: `${next.kind}:${next.id}:${next.updatedAt}`,
    kind: next.kind,
    title: next.payload.title,
    message: MESSAGE_BY_KIND[next.kind],
    href: notificationHref(next),
    updatedAt: next.updatedAt,
  };
}
