import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = readFileSync(path.join(process.cwd(), 'src', 'lib', 'donations.ts'), 'utf8');

for (const id of [
  'community-growth-fund',
  'impact-support-fund',
  'future-leaders-fund',
  'where-needed',
]) {
  if (!source.includes(id)) {
    throw new Error(`Donation catalogue should include ${id}.`);
  }
}

for (const phrase of [
  'Make Life Transformation Accessible to Everyone',
  'Support the Mission. Sustain the Impact. Transform More Lives',
  'Invest in a Child. Empower a Teenager. Shape a Leader',
  'Let School of Growth Global Allocate My Donation Where It Is Most Needed',
  'Scholarship & Programme Sponsorship',
  'Student Business & Startup Support',
  'Academic Scholarship for Young Alumni Students',
  'Travel & Opportunity Support for Alumni',
  'Conference & Event Sponsorship',
  'Technology & Digital Development',
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Donation catalogue should include "${phrase}".`);
  }
}

if (!source.includes('minimumDonationKobo') || !source.includes('parseDonationAmount')) {
  throw new Error('Donation amounts should be validated server-side before Paystack checkout.');
}
