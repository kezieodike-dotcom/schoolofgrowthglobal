import { entitlementFor, PLANS, type Entitlement } from './pricing';

export const DEMO_REVIEWER_EMAIL = 'reviewer@schoolofgrowth.demo';
export const DEMO_REVIEWER_REFERENCE = 'demo-reviewer-preview';
export const DEMO_REVIEWER_MENTOR_ID = 'm2';
export const DEMO_REVIEWER_DAYS = 7;

export interface DemoReviewerAccess {
  entitlement: Entitlement;
  mentorId: string;
}

export function createDemoReviewerAccess(now: Date = new Date()): DemoReviewerAccess {
  const entitlement = entitlementFor(PLANS.maxi, {
    reference: DEMO_REVIEWER_REFERENCE,
    email: DEMO_REVIEWER_EMAIL,
    now,
  });
  const expiresAt = new Date(now.getTime() + DEMO_REVIEWER_DAYS * 86_400_000).toISOString();

  return {
    entitlement: {
      ...entitlement,
      coursesExpireAt: expiresAt,
      mentorshipExpiresAt: expiresAt,
    },
    mentorId: DEMO_REVIEWER_MENTOR_ID,
  };
}
