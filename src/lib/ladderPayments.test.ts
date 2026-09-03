import { PLANS, formatNaira } from './pricing.js';
import { paymentLinkForLadder, planCodeForLadder } from './ladderPayments.js';

const quickClarityCode = planCodeForLadder('Quick Clarity');
if (quickClarityCode !== 'consult-quick-clarity') {
  throw new Error(`Quick Clarity should map to its consultation payment plan, got ${quickClarityCode}.`);
}

if (formatNaira(PLANS[quickClarityCode].amountKobo) !== '₦10,000') {
  throw new Error('Quick Clarity should start at ₦10,000.');
}

const flagshipMentorshipCode = planCodeForLadder('90-Day Mentorship');
if (flagshipMentorshipCode !== 'mentor-90-day') {
  throw new Error(`90-Day Mentorship should map to its payment plan, got ${flagshipMentorshipCode}.`);
}

if (paymentLinkForLadder('90-Day Mentorship', 'm2') !== '/checkout/mentor-90-day?mentor=m2') {
  throw new Error('Ladder payment links should carry the selected mentor when one exists.');
}

if (PLANS[flagshipMentorshipCode].amountKobo !== 75_000_00) {
  throw new Error('90-Day Mentorship should use the suggested starting price of ₦75,000.');
}

