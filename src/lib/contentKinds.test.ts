import type { BlogPost, GrowthJob } from '../types';
import { CONTENT_LABEL, type ContentPayloadMap } from './content';

const labels: Pick<typeof CONTENT_LABEL, 'job' | 'insight'> = {
  job: CONTENT_LABEL.job,
  insight: CONTENT_LABEL.insight,
};

const jobPayload: ContentPayloadMap['job'] = {} as GrowthJob;
const insightPayload: ContentPayloadMap['insight'] = {} as BlogPost;

void labels;
void jobPayload;
void insightPayload;
