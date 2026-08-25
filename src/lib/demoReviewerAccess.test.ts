import {
  createDemoReviewerAccess,
  DEMO_REVIEWER_EMAIL,
  DEMO_REVIEWER_MENTOR_ID,
  DEMO_REVIEWER_REFERENCE,
} from './demoReviewerAccess.js';
import { hasCourseAccess, hasMentorshipAccess } from './pricing.js';

const now = new Date('2026-08-25T00:00:00.000Z');
const access = createDemoReviewerAccess(now);

if (access.entitlement.plan !== 'maxi') {
  throw new Error('The reviewer should preview the full Elite student dashboard.');
}

if (access.entitlement.email !== DEMO_REVIEWER_EMAIL) {
  throw new Error('The reviewer entitlement should use the demo reviewer email.');
}

if (access.entitlement.reference !== DEMO_REVIEWER_REFERENCE) {
  throw new Error('The reviewer entitlement should use a stable non-payment reference.');
}

if (access.mentorId !== DEMO_REVIEWER_MENTOR_ID) {
  throw new Error('The reviewer should be paired with the default demo mentor.');
}

if (!hasCourseAccess([access.entitlement], 'Senior Directorate', now)) {
  throw new Error('The reviewer should be able to open top-tier courses.');
}

if (!hasMentorshipAccess([access.entitlement], now)) {
  throw new Error('The reviewer should be able to message a mentor.');
}

const expiry = new Date(access.entitlement.coursesExpireAt).getTime();
const days = Math.round((expiry - now.getTime()) / 86_400_000);

if (days !== 7) {
  throw new Error(`Demo reviewer access should last 7 days by default. Received ${days}.`);
}
