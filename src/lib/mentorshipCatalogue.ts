export const MENTORSHIP_SERVICE_MODEL = [
  'Consult',
  'Strategize',
  'Mentor',
  'Transform',
] as const;

export const REVENUE_SPLIT = {
  expertPercent: 80,
  companyPercent: 20,
} as const;

export interface PriceRange {
  min: number;
  max: number;
  plus?: boolean;
}

export interface GrowthDivision {
  id: string;
  title: string;
  whyClientsCome: string[];
  services: string[];
  products: string[];
  note?: string;
}

export interface LadderItem {
  level: string;
  title: string;
  duration: string;
  description: string;
  outcome: string;
}

export interface PricingBand {
  name: string;
  range: PriceRange;
  description: string;
}

export const MASTER_GROWTH_DIVISIONS: GrowthDivision[] = [
  {
    id: 'life-purpose',
    title: 'Life, Purpose & Personal Growth',
    whyClientsCome: ['I feel stuck.', 'I need direction.', 'I cannot stay disciplined.'],
    services: [
      'Purpose Discovery',
      'Life Direction',
      'Personal Growth Strategy',
      'Goal Setting',
      'Productivity',
      'Time Management',
      'Discipline & Accountability',
      'Habit Development',
      'Decision-Making',
      'Confidence & Self-Leadership',
      'Personal Development Planning',
      'Life Transition Strategy',
    ],
    products: [
      'Clarity Consultation',
      'Personal Growth Blueprint',
      '90-Day Personal Transformation Mentorship',
    ],
  },
  {
    id: 'career-jobs',
    title: 'Career, Jobs & Professional Growth',
    whyClientsCome: ['I need a stronger CV.', 'I want better job opportunities.', 'I am ready to grow professionally.'],
    services: [
      'Career Discovery',
      'Career Planning',
      'Career Change',
      'CV/Resume Strategy',
      'Interview Preparation',
      'LinkedIn/Professional Branding',
      'Job Search Strategy',
      'Remote Career Strategy',
      'International Career Strategy',
      'Salary/Negotiation Preparation',
      'Workplace Performance',
      'Promotion Strategy',
      'Leadership Career Development',
      'Professional Portfolio Development',
    ],
    products: [
      'Career Clarity Session',
      'Career Positioning Blueprint',
      'Job-Ready Program',
      '90-Day Career Growth Mentorship',
      'Global Career Mentorship',
    ],
  },
  {
    id: 'business',
    title: 'Business & Entrepreneurship',
    whyClientsCome: ['I need to validate my idea.', 'My business needs structure.', 'I need sales, systems and growth.'],
    services: [
      'Business Idea Development',
      'Business Validation',
      'Business Model Design',
      'Startup Strategy',
      'Business Registration Guidance',
      'Market Research',
      'Customer Discovery',
      'Product Development',
      'Offer Creation',
      'Pricing Strategy',
      'Sales Strategy',
      'Marketing Strategy',
      'Business Systems',
      'Operations',
      'Hiring',
      'Scaling',
      'Partnerships',
      'Expansion Strategy',
      'Business Turnaround',
    ],
    products: [
      'Business Clarity Consultation',
      'Business Growth Audit',
      'Business Blueprint',
      '90-Day Business Growth Mentorship',
      'Business Strategy Retainer',
    ],
  },
  {
    id: 'money-wealth',
    title: 'Money, Income & Wealth',
    whyClientsCome: ['I need financial discipline.', 'I want to increase income.', 'I need better wealth education.'],
    services: [
      'Income Strategy',
      'Personal Finance Education',
      'Budgeting',
      'Debt Strategy',
      'Savings Strategy',
      'Multiple-Income Strategy',
      'Entrepreneurial Income',
      'Wealth-Building Education',
      'Business Financial Planning',
      'Financial Discipline',
      'Financial Goal Setting',
    ],
    products: [
      'Money Clarity Session',
      'Income Growth Blueprint',
      '90-Day Financial Growth Mentorship',
      'Wealth Education Program',
    ],
    note: 'Regulated investment or financial advice should be handled by licensed professionals where required.',
  },
  {
    id: 'leadership',
    title: 'Leadership & Executive Development',
    whyClientsCome: ['I need to lead better.', 'My team needs stronger direction.', 'I need executive presence.'],
    services: [
      'Leadership Development',
      'Executive Coaching',
      'People Management',
      'Delegation',
      'Decision-Making',
      'Strategic Thinking',
      'Conflict Management',
      'Communication',
      'Team Leadership',
      'Emotional Intelligence',
      'Executive Presence',
      'Performance Management',
      'Succession Planning',
      'Emerging Leader Development',
    ],
    products: [
      'Leadership Assessment',
      'Executive Strategy Session',
      'Leadership Development Plan',
      '90-Day Leadership Mentorship',
      'Executive Growth Program',
    ],
  },
  {
    id: 'corporate-growth',
    title: 'Organizational & Corporate Growth',
    whyClientsCome: ['The organization needs diagnosis.', 'Staff performance must improve.', 'We need transformation.'],
    services: [
      'Organizational Diagnosis',
      'Business Strategy',
      'Organizational Structure',
      'Staff Performance',
      'Employee Development',
      'Recruitment Strategy',
      'Onboarding',
      'Staff Training',
      'Organizational Culture',
      'Customer Experience',
      'Sales Performance',
      'Operational Efficiency',
      'SOP Development',
      'Performance Measurement',
      'Change Management',
      'Digital Transformation',
      'AI Adoption',
      'Organizational Growth Strategy',
    ],
    products: [
      'Organizational Growth Audit',
      'Corporate Growth Blueprint',
      'Staff Development Program',
      'Leadership Academy',
      'Corporate Mentorship',
      'Organizational Transformation Retainer',
    ],
  },
  {
    id: 'relationships',
    title: 'Relationships, Marriage & Family',
    whyClientsCome: ['I need communication support.', 'We need healthier conflict handling.', 'I need relationship direction.'],
    services: [
      'Relationship Guidance',
      'Dating Strategy',
      'Communication',
      'Conflict Resolution',
      'Wedding Planning',
      'Marriage Preparation',
      'Premarital Mentorship',
      'Couples Growth',
      'Parenting',
      'Family Communication',
      'Family Goal Setting',
      'Relationship Decision Support',
    ],
    products: ['Relationship Guidance Session', 'Couples Growth Plan', 'Premarital Mentorship'],
    note: 'Clinical mental-health issues, abuse or high-risk situations should be directed to appropriately qualified professionals.',
  },
  {
    id: 'beauty-fitness',
    title: 'Beauty & Fitness',
    whyClientsCome: ['I want to improve my fitness.', 'I need beauty-business guidance.', 'I want healthier personal presentation.'],
    services: [
      'Fitness Coaching',
      'Body Transformation',
      'Personal Training',
      'Beauty Business Mentorship',
      'Skincare Business Strategy',
      'Salon and Spa Growth',
      'Wellness Branding',
      'Client Retention',
      'Personal Grooming',
      'Confidence and Presentation',
    ],
    products: ['Fitness Clarity Session', 'Beauty Business Growth Plan', '90-Day Fitness & Wellness Mentorship'],
    note: 'Health, nutrition and physical-training guidance should be handled by appropriately qualified professionals where required.',
  },
  {
    id: 'health-diet-wellbeing',
    title: 'Health, Diet & Well-Being',
    whyClientsCome: ['I need better health habits.', 'I want diet and wellness guidance.', 'I need support for sustainable well-being.'],
    services: [
      'Health Habit Coaching',
      'Diet Education',
      'Weight Management Guidance',
      'Nutrition Planning',
      'Well-Being Strategy',
      'Stress Management',
      'Sleep and Recovery',
      'Work-Life Balance',
      'Preventive Wellness',
      'Healthy Lifestyle Accountability',
    ],
    products: ['Well-Being Clarity Session', 'Healthy Lifestyle Blueprint', '90-Day Health & Well-Being Mentorship'],
    note: 'Medical diagnosis, treatment and clinical nutrition should be directed to licensed health professionals.',
  },
  {
    id: 'digital-ai',
    title: 'Digital, Technology & AI Growth',
    whyClientsCome: ['I need AI literacy.', 'My business needs automation.', 'I need digital transformation.'],
    services: [
      'AI Literacy',
      'AI for Business',
      'AI for Professionals',
      'Digital Transformation',
      'Business Automation',
      'Digital Productivity',
      'E-commerce',
      'Digital Business Models',
      'Online Business Strategy',
      'Technology Strategy',
      'Digital Marketing',
      'Remote Work',
      'Future Skills',
    ],
    products: [
      'AI Opportunity Consultation',
      'Digital Business Blueprint',
      'AI-for-Business Mentorship',
      'Digital Transformation Consulting',
    ],
  },
  {
    id: 'global-opportunities',
    title: 'Global Opportunities',
    whyClientsCome: ['I want global work.', 'I need international positioning.', 'I need a global opportunity strategy.'],
    services: [
      'International Career Strategy',
      'Global Job Search',
      'International Education Guidance',
      'Skills-to-Market Positioning',
      'Remote Work',
      'Global Business Expansion',
      'International Networking',
      'Global Professional Branding',
      'Relocation Planning',
    ],
    products: ['Global Career Strategy', 'Remote Work Positioning Plan', 'Global Business Expansion Session'],
    note: 'Immigration and legal applications should be handled by appropriately authorized professionals.',
  },
  {
    id: 'communication-brand',
    title: 'Communication, Influence & Personal Brand',
    whyClientsCome: ['I need to speak better.', 'I need stronger visibility.', 'I need a credible personal brand.'],
    services: [
      'Public Speaking',
      'Presentation Skills',
      'Business Communication',
      'Negotiation',
      'Persuasion',
      'Storytelling',
      'Media Preparation',
      'Personal Branding',
      'Thought Leadership',
      'Professional Visibility',
      'Networking',
    ],
    products: ['Personal Brand Audit', 'Public Speaking Mentorship', 'Executive Communication Program'],
  },
  {
    id: 'specialized-industry',
    title: 'Specialized Industry Consulting',
    whyClientsCome: ['I need an expert in my industry.', 'My sector has specific problems.', 'I need a vetted specialist.'],
    services: [
      'Hospitality',
      'Agriculture',
      'Real Estate',
      'Construction',
      'Oil & Gas',
      'Education',
      'Healthcare Administration',
      'Beauty & Fitness',
      'Health, Diet & Well-Being',
      'Retail',
      'E-commerce',
      'NGOs',
      'Events',
      'Manufacturing',
      'Logistics',
      'Technology',
      'Creative Industries',
      'Financial Services',
      'Government/Public Sector',
    ],
    products: ['Industry Expert Consultation', 'Industry Growth Audit', 'Specialist Advisory Retainer'],
    note: 'SOGG builds a vetted expert network instead of trying to employ every specialist directly.',
  },
  {
    id: 'spirituality-values',
    title: 'Spirituality, Values & Purpose',
    whyClientsCome: ['I want values-led growth.', 'I need character and purpose alignment.', 'I want ethical leadership.'],
    services: [
      'Values',
      'Character',
      'Purpose',
      'Spiritual Growth',
      'Faith and Work',
      'Ethical Leadership',
      'Service',
      'Personal Responsibility',
      'Meaning and Legacy',
    ],
    products: ['Values & Purpose Pathway', 'Ethical Leadership Session', 'Meaning and Legacy Blueprint'],
    note: 'This should be offered as a chosen faith/values pathway, not imposed on every client.',
  },
];

export const CONSULTATION_LADDER: LadderItem[] = [
  {
    level: 'Level 1',
    title: 'Quick Clarity',
    duration: '30 minutes',
    description: 'For one focused problem that needs immediate direction.',
    outcome: 'Clear problem definition and next steps.',
  },
  {
    level: 'Level 2',
    title: 'Strategic Consultation',
    duration: '60 minutes',
    description: 'For a significant problem requiring analysis and recommendations.',
    outcome: 'Diagnosis, recommendations and decision guidance.',
  },
  {
    level: 'Level 3',
    title: 'Growth Strategy Session',
    duration: '90-120 minutes',
    description: 'Deep assessment, strategy and action planning.',
    outcome: 'A practical action plan for business, career, leadership or life growth.',
  },
  {
    level: 'Level 4',
    title: 'Growth Audit',
    duration: 'Comprehensive review',
    description: 'A structured review of a business, career, leadership path or organization.',
    outcome: 'Find gaps, risks, constraints and immediate improvement opportunities.',
  },
  {
    level: 'Level 5',
    title: 'Blueprint',
    duration: 'Documented strategy',
    description: 'A documented personalized strategy based on the client situation.',
    outcome: 'A written blueprint with priorities, roadmap and implementation focus.',
  },
];

export const MENTORSHIP_LADDER: LadderItem[] = [
  {
    level: 'Start',
    title: '30-Day Mentorship',
    duration: '30 Days',
    description: 'For people who need immediate direction and accountability.',
    outcome: 'Clarify direction, build momentum and establish accountability.',
  },
  {
    level: 'Build',
    title: '90-Day Mentorship',
    duration: '90 Days',
    description: 'The flagship mentorship duration for meaningful growth and execution.',
    outcome: 'Build habits, systems, portfolio evidence and measurable progress.',
  },
  {
    level: 'Scale',
    title: '6-Month Mentorship',
    duration: '6 Months',
    description: 'For serious transformation across business, career, leadership or personal growth.',
    outcome: 'Sustain change, improve capability and scale execution.',
  },
  {
    level: 'Master',
    title: '12-Month Mentorship',
    duration: '12 Months',
    description: 'For long-term development, strategic support and deeper transformation.',
    outcome: 'Long-range growth, leadership maturity and high-level accountability.',
  },
];

export const CONSULTATION_PRICING_BANDS: PricingBand[] = [
  {
    name: 'Growth Advisor',
    range: { min: 10_000, max: 25_000 },
    description: 'Focused clarity and early-stage guidance.',
  },
  {
    name: 'Specialist Consultant',
    range: { min: 25_000, max: 75_000 },
    description: 'Specialized advice for a defined area or problem.',
  },
  {
    name: 'Senior Consultant',
    range: { min: 75_000, max: 200_000 },
    description: 'Senior expertise for complex individual or business decisions.',
  },
  {
    name: 'Executive/Elite Expert',
    range: { min: 200_000, max: 500_000, plus: true },
    description: 'High-level strategic access for executive and elite advisory needs.',
  },
];

export const MENTORSHIP_PRICING_BANDS: PricingBand[] = [
  {
    name: '30-Day',
    range: { min: 30_000, max: 100_000 },
    description: 'Immediate direction and accountability.',
  },
  {
    name: '90-Day',
    range: { min: 75_000, max: 300_000 },
    description: 'Flagship build period for execution and measurable growth.',
  },
  {
    name: '6-Month',
    range: { min: 200_000, max: 750_000 },
    description: 'Serious transformation with deeper support.',
  },
  {
    name: '12-Month',
    range: { min: 500_000, max: 2_000_000, plus: true },
    description: 'Long-term development and strategic accountability.',
  },
];

export const CORPORATE_PRICING_BANDS: PricingBand[] = [
  {
    name: 'Corporate Consultation',
    range: { min: 250_000, max: 1_000_000, plus: true },
    description: 'Leadership, business or organizational consultation for companies.',
  },
  {
    name: 'Organizational Audit',
    range: { min: 500_000, max: 3_000_000, plus: true },
    description: 'A structured diagnosis of systems, people, performance and growth gaps.',
  },
  {
    name: 'Corporate Training',
    range: { min: 500_000, max: 5_000_000, plus: true },
    description: 'Training programmes for staff, teams and departments.',
  },
  {
    name: 'Leadership Development',
    range: { min: 1_000_000, max: 10_000_000, plus: true },
    description: 'Leadership capability development for managers and executives.',
  },
  {
    name: 'Organizational Transformation',
    range: { min: 2_000_000, max: 20_000_000, plus: true },
    description: 'Large-scale transformation support across structure, people and systems.',
  },
  {
    name: 'Annual Consulting Retainer',
    range: { min: 5_000_000, max: 100_000_000, plus: true },
    description: 'Long-term advisory based on organization size, scope and deliverables.',
  },
];

export function formatCompactNaira(amount: number): string {
  if (amount >= 1_000_000) {
    const value = amount / 1_000_000;
    return `\u20a6${Number.isInteger(value) ? value : value.toFixed(1)}m`;
  }
  if (amount >= 1_000) return `\u20a6${amount / 1_000}k`;
  return `\u20a6${amount}`;
}

export function formatPriceRange(range: PriceRange): string {
  return `${formatCompactNaira(range.min)}-${formatCompactNaira(range.max)}${range.plus ? '+' : ''}`;
}

export function calculateMentorshipRevenueSplit(amountKobo: number): {
  expertKobo: number;
  companyKobo: number;
} {
  const expertKobo = Math.round((amountKobo * REVENUE_SPLIT.expertPercent) / 100);
  return {
    expertKobo,
    companyKobo: amountKobo - expertKobo,
  };
}
