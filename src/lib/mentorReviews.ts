export interface MentorReview {
  mentorId: string;
  studentEmail: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MentorRatingSummary {
  rating: number;
  reviewCount: number;
  latest: MentorReview[];
}

const STORAGE_KEY = 'sog.mentor-reviews.v1';
const CHANGE_EVENT = 'sog.mentor-reviews.changed';
const EMPTY: MentorReview[] = [];
let cache: MentorReview[] | null = null;

function notifyReviewsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function writeLocalReviews(reviews: MentorReview[]): void {
  if (typeof window === 'undefined') return;
  cache = reviews;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  notifyReviewsChanged();
}

function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}

function reviewOwnerKey(review: Pick<MentorReview, 'mentorId' | 'studentEmail'>): string {
  return `${review.mentorId}:${review.studentEmail.trim().toLowerCase()}`;
}

export function upsertMentorReview(
  reviews: MentorReview[],
  review: MentorReview
): MentorReview[] {
  const clean: MentorReview = {
    ...review,
    studentEmail: review.studentEmail.trim().toLowerCase(),
    studentName: review.studentName.trim() || 'Mentee',
    rating: clampRating(review.rating),
    comment: review.comment.trim(),
  };
  const ownerKey = reviewOwnerKey(clean);
  return [
    ...reviews.filter((item) => reviewOwnerKey(item) !== ownerKey),
    clean,
  ];
}

export function summarizeMentorReviews(
  mentorId: string,
  baseRating: number,
  baseReviewCount: number,
  reviews: MentorReview[]
): MentorRatingSummary {
  const relevant = reviews
    .filter((review) => review.mentorId === mentorId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const safeBaseCount = Math.max(0, Math.round(baseReviewCount));
  const safeBaseRating = Math.min(5, Math.max(0, baseRating));
  const reviewCount = safeBaseCount + relevant.length;
  const rating =
    reviewCount === 0
      ? 0
      : Number(
          (
            (safeBaseRating * safeBaseCount +
              relevant.reduce((total, review) => total + review.rating, 0)) /
            reviewCount
          ).toFixed(2)
        );

  return {
    rating,
    reviewCount,
    latest: relevant,
  };
}

export function readMentorReviews(): MentorReview[] {
  if (cache) return cache;
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return EMPTY;
    cache = parsed.filter(
      (item): item is MentorReview =>
        typeof item?.mentorId === 'string' &&
        typeof item?.studentEmail === 'string' &&
        typeof item?.studentName === 'string' &&
        typeof item?.rating === 'number' &&
        typeof item?.comment === 'string' &&
        typeof item?.createdAt === 'string'
    );
    return cache;
  } catch {
    return EMPTY;
  }
}

function saveMentorReviewLocally(review: MentorReview): MentorReview {
  if (typeof window === 'undefined') return review;
  const next = upsertMentorReview(readMentorReviews(), review);
  writeLocalReviews(next);
  return next[next.length - 1];
}

export async function fetchMentorReviews(): Promise<MentorReview[]> {
  if (typeof window === 'undefined') return EMPTY;
  const res = await fetch('/api/mentor-reviews');
  if (!res.ok) throw new Error('Could not load mentor reviews.');
  const body = await res.json();
  const reviews = Array.isArray(body?.reviews) ? (body.reviews as MentorReview[]) : EMPTY;
  const merged = reviews.reduce(
    (items, review) => upsertMentorReview(items, review),
    readMentorReviews()
  );
  writeLocalReviews(merged);
  return merged;
}

export async function saveMentorReview(review: MentorReview): Promise<MentorReview> {
  if (typeof window === 'undefined') return review;

  try {
    const res = await fetch('/api/mentor-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(body?.error ?? 'Could not save mentor review.');
    const saved = body?.review as MentorReview;
    const reviews = Array.isArray(body?.reviews)
      ? (body.reviews as MentorReview[])
      : upsertMentorReview(readMentorReviews(), saved);
    writeLocalReviews(reviews);
    return saved;
  } catch {
    return saveMentorReviewLocally(review);
  }
}

export function subscribeMentorReviews(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      callback();
    }
  };
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
