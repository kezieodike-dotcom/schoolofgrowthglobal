import { useEffect, useSyncExternalStore } from 'react';
import {
  fetchMentorReviews,
  readMentorReviews,
  subscribeMentorReviews,
  type MentorReview,
} from './mentorReviews';

const EMPTY: MentorReview[] = [];

export function useMentorReviews(): MentorReview[] {
  useEffect(() => {
    fetchMentorReviews().catch(() => {
      // Local reviews remain available if the API is not configured yet.
    });
  }, []);

  return useSyncExternalStore(subscribeMentorReviews, readMentorReviews, () => EMPTY);
}
