import {
  summarizeMentorReviews,
  upsertMentorReview,
  type MentorReview,
} from './mentorReviews.js';

const first: MentorReview = {
  mentorId: 'm1',
  studentEmail: 'ada@example.com',
  studentName: 'Ada',
  rating: 5,
  comment: 'Very practical mentorship.',
  createdAt: '2026-09-01T10:00:00.000Z',
};

const second: MentorReview = {
  mentorId: 'm1',
  studentEmail: 'tunde@example.com',
  studentName: 'Tunde',
  rating: 4,
  comment: 'Helpful follow-up.',
  createdAt: '2026-09-01T11:00:00.000Z',
};

const otherMentor: MentorReview = {
  mentorId: 'm2',
  studentEmail: 'ada@example.com',
  studentName: 'Ada',
  rating: 1,
  comment: 'Different mentor.',
  createdAt: '2026-09-01T12:00:00.000Z',
};

const reviews = [first, second, otherMentor];
const summary = summarizeMentorReviews('m1', 4, 3, reviews);

if (summary.reviewCount !== 5) {
  throw new Error(`Expected 5 total reviews, got ${summary.reviewCount}.`);
}

if (summary.rating !== 4.2) {
  throw new Error(`Expected weighted rating 4.2, got ${summary.rating}.`);
}

if (summary.latest[0]?.studentName !== 'Tunde') {
  throw new Error('Latest mentor reviews should be newest first.');
}

const updated = upsertMentorReview(reviews, {
  ...first,
  rating: 3,
  comment: 'Updated after another session.',
  createdAt: '2026-09-02T10:00:00.000Z',
});

const adaReviews = updated.filter(
  (item) => item.mentorId === 'm1' && item.studentEmail === 'ada@example.com'
);

if (adaReviews.length !== 1) {
  throw new Error('A mentee should have one active review per mentor.');
}

if (adaReviews[0].rating !== 3 || adaReviews[0].comment !== 'Updated after another session.') {
  throw new Error('Submitting another review should replace the mentee previous review.');
}
