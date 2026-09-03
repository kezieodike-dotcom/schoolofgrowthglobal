import {
  CONSULTATION_LADDER,
  CORPORATE_PRICING_BANDS,
  MASTER_GROWTH_DIVISIONS,
  MENTORSHIP_LADDER,
  REVENUE_SPLIT,
  calculateMentorshipRevenueSplit,
  formatPriceRange,
} from './mentorshipCatalogue.js';

if (MASTER_GROWTH_DIVISIONS.length !== 12) {
  throw new Error(`Expected 12 master growth divisions, found ${MASTER_GROWTH_DIVISIONS.length}.`);
}

for (const title of [
  'Life, Purpose & Personal Growth',
  'Career, Jobs & Professional Growth',
  'Organizational & Corporate Growth',
  'Specialized Industry Consulting',
]) {
  if (!MASTER_GROWTH_DIVISIONS.some((division) => division.title === title)) {
    throw new Error(`Missing growth division: ${title}.`);
  }
}

const consultationLevels = CONSULTATION_LADDER.map((item) => item.title);
for (const title of [
  'Quick Clarity',
  'Strategic Consultation',
  'Growth Strategy Session',
  'Growth Audit',
  'Blueprint',
]) {
  if (!consultationLevels.includes(title)) {
    throw new Error(`Missing consultation ladder product: ${title}.`);
  }
}

const mentorshipDurations = MENTORSHIP_LADDER.map((item) => item.duration);
for (const duration of ['30 Days', '90 Days', '6 Months', '12 Months']) {
  if (!mentorshipDurations.includes(duration)) {
    throw new Error(`Missing mentorship duration: ${duration}.`);
  }
}

const relationshipDivision = MASTER_GROWTH_DIVISIONS.find(
  (division) => division.id === 'relationships'
);
if (!relationshipDivision?.services.includes('Wedding Planning')) {
  throw new Error('Relationship services should include Wedding Planning.');
}

if (!CORPORATE_PRICING_BANDS.some((band) => band.name === 'Annual Consulting Retainer')) {
  throw new Error('Corporate pricing should include annual consulting retainers.');
}

if (REVENUE_SPLIT.expertPercent !== 80 || REVENUE_SPLIT.companyPercent !== 20) {
  throw new Error('Mentorship revenue should split 80% to expert and 20% to School of Growth Global.');
}

const split = calculateMentorshipRevenueSplit(100_000_00);
if (split.expertKobo !== 80_000_00 || split.companyKobo !== 20_000_00) {
  throw new Error('Revenue split should calculate exact 80/20 kobo amounts.');
}

if (formatPriceRange({ min: 10_000, max: 25_000 }) !== '\u20a610k-\u20a625k') {
  throw new Error('Price ranges should render compact Naira ranges.');
}

if (formatPriceRange({ min: 500_000, max: 2_000_000, plus: true }) !== '\u20a6500k-\u20a62m+') {
  throw new Error('Large price ranges should render compact million values.');
}
