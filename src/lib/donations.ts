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
  detailSections: {
    title: string;
    items: string[];
  }[];
  notice?: string[];
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
    detailSections: [
      {
        title: 'Scholarship & Programme Sponsorship',
        items: [
          'Programme fees for children, teenagers, young people and individuals from financially disadvantaged or ordinary/common-man families.',
          'Mentorship access, training opportunities, educational resources and other approved programme-related expenses.',
        ],
      },
      {
        title: 'Student Business & Startup Support',
        items: [
          'Approved support for business startup, business development, expansion, product or service development, business tools and strategic business development.',
          'School of Growth Global may assign a supervisor, mentor, consultant or designated representative to monitor and support approved beneficiaries.',
        ],
      },
      {
        title: 'Application requirements',
        items: [
          'Applicants may be required to show at least three months of active learning, unless an exception is approved.',
          'A business proposal or plan, valid identification, business or personal information and a clear explanation of the intended impact may be requested.',
          'Approval of an application does not create automatic entitlement to funding.',
        ],
      },
      {
        title: 'Academic Scholarship for Young Alumni Students',
        items: [
          'Academic assistance may support eligible young alumni still pursuing formal education and facing genuine financial difficulty.',
          'Support depends on available funds, demonstrated need, academic circumstances and organizational assessment.',
        ],
      },
      {
        title: 'Travel & Opportunity Support for Alumni',
        items: [
          'Support may relate to approved national or international trips, conferences, exhibitions, strategic meetings, partnerships and business opportunities.',
          'Eligible alumni must hold a verifiable School of Growth Global certificate and show reasonable potential for personal, professional, business or community impact.',
        ],
      },
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
    detailSections: [
      {
        title: 'Support the Impact',
        items: [
          'Your voluntary contribution helps sustain leadership development, business development, personal development, skills development, career development and entrepreneurship.',
          'It also supports mentorship, education, human capacity development and life-transformation initiatives.',
        ],
      },
      {
        title: 'Appreciation of Impact',
        items: [
          'Individuals and organizations may contribute as appreciation for transformation, knowledge, opportunities and value received through School of Growth Global.',
          'These contributions help the organization continue investing in people, programmes, systems and wider impact work.',
        ],
      },
      {
        title: 'Conference & Event Sponsorship',
        items: [
          'Contributions may sponsor conferences, seminars, workshops, training programmes and events organized or supported by School of Growth Global.',
          'Sponsored events can help people from ordinary/common-man families access valuable learning, leadership, business and mentorship experiences.',
        ],
      },
      {
        title: 'Appreciation of Team Effort',
        items: [
          'Voluntary support may recognize and encourage team members, professionals, mentors, consultants, volunteers, facilitators and other contributors.',
        ],
      },
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
    detailSections: [
      {
        title: 'Academic Support',
        items: [
          'Educational materials, school-related support, learning resources and academic development initiatives.',
        ],
      },
      {
        title: 'Welfare Support',
        items: [
          'Support for identified welfare needs of children and teenagers experiencing genuine financial or social difficulties.',
        ],
      },
      {
        title: 'Medical Support',
        items: [
          'Where appropriate and subject to available resources and verification, contributions may support approved medical needs.',
        ],
      },
      {
        title: 'Spiritual & Character Development',
        items: [
          'Programmes and activities that encourage positive character, responsible living, values, purpose, leadership and spiritual growth.',
        ],
      },
      {
        title: 'Orphanage & Community Outreach',
        items: [
          "Outreach to orphanages, children's homes and vulnerable-child communities, including properly identified partner organizations.",
        ],
      },
      {
        title: 'Technology & Digital Development',
        items: [
          'Digital literacy, technology education, computer-related learning, digital skills training, approved technology resources, entrepreneurship and innovation programmes.',
        ],
      },
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
  detailSections: [
    {
      title: 'Responsible Allocation',
      items: [
        'School of Growth Global may direct the donation toward the fund or mission need where it can create timely and meaningful impact.',
        'Allocation may support scholarship, education, mentorship, welfare, leadership, events, systems or other related mission activities.',
      ],
    },
    {
      title: 'Donor notice',
      items: [
        'Donations do not create ownership, employment, partnership, profit, repayment, governance or control rights.',
        'Beneficiary selection, programme delivery and fund administration remain subject to organizational policies, available resources and applicable law.',
      ],
    },
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
