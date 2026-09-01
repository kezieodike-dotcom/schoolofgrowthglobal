import { Router } from 'express';
import {
  canStoreMentorReviews,
  listMentorReviews,
  saveStoredMentorReview,
} from './mentorReviewStore.js';
import type { MentorReview } from '../lib/mentorReviews.js';

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeReview(input: unknown): MentorReview {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('That does not look like a mentor review.');
  }

  const source = input as Record<string, unknown>;
  const mentorId = text(source.mentorId);
  const studentEmail = text(source.studentEmail).toLowerCase();
  const studentName = text(source.studentName, 'Mentee');
  const rating = Number(source.rating);
  const comment = text(source.comment).slice(0, 1000);

  if (!mentorId) throw new Error('A mentor is required.');
  if (!studentEmail || !studentEmail.includes('@')) throw new Error('A valid mentee email is required.');
  if (!Number.isFinite(rating)) throw new Error('Choose a rating from 1 to 5.');

  return {
    mentorId,
    studentEmail,
    studentName,
    rating,
    comment,
    createdAt: text(source.createdAt, new Date().toISOString()),
  };
}

export function createMentorReviewRouter(): Router {
  const router = Router();

  router.get('/mentor-reviews', (_req, res) => {
    res.json({ reviews: listMentorReviews(), writable: canStoreMentorReviews() });
  });

  router.post('/mentor-reviews', (req, res) => {
    if (!canStoreMentorReviews()) {
      return res.status(503).json({
        error: 'Mentor reviews cannot be saved on this host until persistent storage is configured.',
      });
    }

    try {
      const review = sanitizeReview(req.body?.review);
      const saved = saveStoredMentorReview(review);
      res.json({ review: saved, reviews: listMentorReviews() });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Could not save mentor review.',
      });
    }
  });

  return router;
}
