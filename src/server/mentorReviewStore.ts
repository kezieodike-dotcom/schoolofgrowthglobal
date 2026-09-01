import { createJsonStore } from './jsonStore.js';
import { upsertMentorReview, type MentorReview } from '../lib/mentorReviews.js';

const store = createJsonStore<MentorReview>('mentor-reviews.json');

export function listMentorReviews(): MentorReview[] {
  return store.read().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function saveStoredMentorReview(review: MentorReview): MentorReview {
  const rows = upsertMentorReview(store.read(), review);
  store.write(rows);
  return rows[rows.length - 1];
}

export function canStoreMentorReviews(): boolean {
  return store.isWritable();
}
