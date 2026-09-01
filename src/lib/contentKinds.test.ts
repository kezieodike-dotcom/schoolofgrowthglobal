import type { BlogPost, BookItem, GrowthJob } from '../types';
import { CONTENT_LABEL, type ContentPayloadMap } from './content';

const labels: Pick<typeof CONTENT_LABEL, 'job' | 'insight' | 'book'> = {
  job: CONTENT_LABEL.job,
  insight: CONTENT_LABEL.insight,
  book: CONTENT_LABEL.book,
};

const jobPayload: ContentPayloadMap['job'] = {} as GrowthJob;
const insightPayload: ContentPayloadMap['insight'] = {} as BlogPost;
const bookPayload: ContentPayloadMap['book'] = {} as BookItem;

if (labels.book !== 'Books') {
  throw new Error(`Book content should be labelled Books, got ${String(labels.book)}.`);
}

void labels;
void jobPayload;
void insightPayload;
void bookPayload;
