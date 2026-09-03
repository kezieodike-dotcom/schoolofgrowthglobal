import type { PlanCode } from './pricing';

export const LADDER_PAYMENT_PLANS: Record<string, PlanCode> = {
  'Quick Clarity': 'consult-quick-clarity',
  'Strategic Consultation': 'consult-strategic-consultation',
  'Growth Strategy Session': 'consult-growth-strategy-session',
  'Growth Audit': 'consult-growth-audit',
  Blueprint: 'consult-blueprint',
  '30-Day Mentorship': 'mentor-30-day',
  '90-Day Mentorship': 'mentor-90-day',
  '6-Month Mentorship': 'mentor-6-month',
  '12-Month Mentorship': 'mentor-12-month',
};

export function planCodeForLadder(title: string): PlanCode {
  const code = LADDER_PAYMENT_PLANS[title];
  if (!code) throw new Error(`No payment plan exists for ${title}.`);
  return code;
}

export function paymentLinkForLadder(title: string, mentorId?: string): string {
  const path = `/checkout/${planCodeForLadder(title)}`;
  return mentorId ? `${path}?mentor=${encodeURIComponent(mentorId)}` : path;
}

