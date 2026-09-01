import type { ContentRecord } from './content.js';
import { toContentNotification } from './contentNotifications.js';

const base = {
  id: 'growth-leadership',
  createdAt: '2026-08-26T08:00:00.000Z',
  updatedAt: '2026-08-26T09:00:00.000Z',
  published: true,
};

const cases: Array<[ContentRecord, string, string]> = [
  [
    {
      ...base,
      kind: 'course',
      payload: { id: 'growth-leadership', title: 'Growth Leadership' } as ContentRecord<'course'>['payload'],
    },
    '/courses/growth-leadership',
    'New course update',
  ],
  [
    {
      ...base,
      kind: 'event',
      payload: { id: 'strategy-room', title: 'Strategy Room' } as ContentRecord<'event'>['payload'],
    },
    '/events',
    'New event update',
  ],
  [
    {
      ...base,
      kind: 'job',
      payload: { id: 'operations-lead', title: 'Operations Lead' } as ContentRecord<'job'>['payload'],
    },
    '/jobs',
    'New career job update',
  ],
  [
    {
      ...base,
      kind: 'insight',
      payload: { id: 'brand-growth', slug: 'brand-growth', title: 'Brand Growth' } as ContentRecord<'insight'>['payload'],
    },
    '/blog/brand-growth',
    'New insight update',
  ],
  [
    {
      ...base,
      kind: 'book',
      payload: { id: 'growth-book', title: 'Growth Book' } as ContentRecord<'book'>['payload'],
    },
    '/books',
    'New book update',
  ],
];

for (const [record, href, message] of cases) {
  const notification = toContentNotification(record);
  if (!notification) throw new Error(`${record.kind} should create a notification.`);
  if (notification.href !== href) {
    throw new Error(`${record.kind} notification should link to ${href}, got ${notification.href}.`);
  }
  if (notification.message !== message) {
    throw new Error(`${record.kind} notification should say "${message}", got "${notification.message}".`);
  }
}

const hidden = toContentNotification({
  ...base,
  kind: 'course',
  published: false,
  payload: { id: 'hidden-course', title: 'Hidden Course' } as ContentRecord<'course'>['payload'],
});

if (hidden) throw new Error('Hidden content should not create a notification.');

const team = toContentNotification({
  ...base,
  kind: 'team',
  payload: { id: 'advisor', name: 'Advisor' } as ContentRecord<'team'>['payload'],
});

if (team) throw new Error('Team updates should not create public content notifications.');

const quiet = toContentNotification({
  ...base,
  kind: 'job',
  payload: {
    id: 'quiet-job',
    title: 'Quiet Job',
    organization: 'School of Growth Global',
    location: 'Lagos, Nigeria',
    workMode: 'Hybrid',
    type: 'Full-time',
    level: 'Professional',
    salary: 'Competitive',
    posted: 'Aug 26, 2026',
    closes: 'Open until filled',
    summary: 'A stored job from the old notification-control flow.',
    requirements: ['Experience required'],
    tags: ['Operations'],
    image: '/career-jobs/store-keeper.png',
    notifyUsers: false,
  } as unknown as ContentRecord<'job'>['payload'],
});

if (!quiet) throw new Error('Published content should notify users automatically, even if an old payload has notifyUsers false.');
