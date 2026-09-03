import { KOBO_PER_NAIRA } from './pricing';

export type DonationFundId =
  | 'community-growth-fund'
  | 'impact-support-fund'
  | 'future-leaders-fund'
  | 'where-needed';

export interface DonationFund {
  id: DonationFundId;
  name: string;
  headline: string;
  description: string;
  supports: string[];
}

export interface DonationPayment {
  reference: string;
  email: string;
  name?: string;
  phone?: string;
  fundId: DonationFundId;
  fundName: string;
  amountKobo: number;
  currency: string;
  donorNote?: string;
}

export const minimumDonationKobo = 1_000 * KOBO_PER_NAIRA;
export const maximumDonationKobo = 50_000_000 * KOBO_PER_NAIRA;

export const SUGGESTED_DONATION_AMOUNTS_KOBO = [
  5_000,
  10_000,
  25_000,
  50_000,
  100_000,
  250_000,
].map((amount) => amount * KOBO_PER_NAIRA);

export function formatDonationAmount(kobo: number): string {
  return `₦${(kobo / KOBO_PER_NAIRA).toLocaleString('en-NG')}`;
}

export const DONATION_FUNDS: DonationFund[] = [
  {
    id: 'community-growth-fund',
    name: 'Community Growth Fund',
    headline: 'Make Life Transformation Accessible to Everyone.',
    description:
      'Provides financial assistance and programme opportunities for individuals, students and young people who desire practical transformation but face financial limitations.',
    supports: [
      'Scholarship and programme sponsorship',
      'Mentorship access and training opportunities',
      'Student business and startup support',
      'Academic, alumni travel and opportunity support',
    ],
  },
  {
    id: 'impact-support-fund',
    name: 'Impact Support Fund',
    headline: 'Support the Mission. Sustain the Impact. Transform More Lives.',
    description:
      'Helps School of Growth Global sustain and expand its work in leadership, business development, skills, career growth, entrepreneurship, mentorship and human capacity development.',
    supports: [
      'Leadership, business and personal-development work',
      'Conference, seminar and event sponsorship',
      'Education, mentorship and life-transformation initiatives',
      'Appreciation and support for committed contributors',
    ],
  },
  {
    id: 'future-leaders-fund',
    name: 'Future Leaders Fund',
    headline: 'Invest in a Child. Empower a Teenager. Shape a Leader.',
    description:
      'Invests in the development, welfare, education, character, digital skills and future potential of children and teenagers.',
    supports: [
      'Academic, welfare and approved medical support',
      'Technology and digital-skills development',
      'Character, values, purpose and leadership formation',
      'Orphanage and vulnerable-child community outreach',
    ],
  },
];

export const DONATION_ALLOCATION_OPTION: DonationFund = {
  id: 'where-needed',
  name: 'Where Most Needed',
  headline: 'Let School of Growth Global Allocate My Donation Where It Is Most Needed.',
  description:
    'Your donation will be directed responsibly toward the fund or related mission need where it can create timely and meaningful impact.',
  supports: [
    'Urgent scholarship or programme support',
    'Priority impact work across the School of Growth mission',
    'Responsible allocation based on current needs and available funds',
  ],
};

export const ALL_DONATION_FUNDS: DonationFund[] = [
  ...DONATION_FUNDS,
  DONATION_ALLOCATION_OPTION,
];

export function isDonationFundId(value: unknown): value is DonationFundId {
  return (
    typeof value === 'string' &&
    ALL_DONATION_FUNDS.some((fund) => fund.id === value)
  );
}

export function findDonationFund(value: unknown): DonationFund {
  return (
    ALL_DONATION_FUNDS.find((fund) => fund.id === value) ??
    DONATION_ALLOCATION_OPTION
  );
}

export function parseDonationAmount(value: unknown): number | null {
  const raw =
    typeof value === 'number'
      ? String(value)
      : typeof value === 'string'
        ? value
        : '';
  const normalized = raw.replace(/[,\s₦]/g, '');
  if (!normalized || !/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const amountNaira = Number(normalized);
  if (!Number.isFinite(amountNaira)) return null;

  const amountKobo = Math.round(amountNaira * KOBO_PER_NAIRA);
  if (amountKobo < minimumDonationKobo || amountKobo > maximumDonationKobo) {
    return null;
  }

  return amountKobo;
}
