export interface GrowthDiagnosis {
  growthArea: string;
  primaryChallenge: string;
  recommendedExperts: string[];
  recommendedIntervention: string;
  nextStep: string;
  confidence: 'high' | 'medium' | 'low';
}

interface DiagnosisRule {
  tokens: string[];
  diagnosis: Omit<GrowthDiagnosis, 'confidence'>;
}

const RULES: DiagnosisRule[] = [
  {
    tokens: [
      'employee',
      'employees',
      'productivity',
      'manager',
      'managers',
      'performing',
      'turnover',
      'staff',
      'culture',
      'performance',
      'retention',
    ],
    diagnosis: {
      growthArea: 'Organizational Performance',
      primaryChallenge: 'People & Performance',
      recommendedExperts: ['Organizational Development', 'Leadership', 'HR'],
      recommendedIntervention: 'Organizational Growth Audit',
      nextStep: '90-Day Transformation Program',
    },
  },
  {
    tokens: [
      'sales',
      'customers',
      'revenue',
      'marketing',
      'leads',
      'conversion',
      'profit',
      'pricing',
      'scale',
      'business',
    ],
    diagnosis: {
      growthArea: 'Business Growth',
      primaryChallenge: 'Revenue & Market Execution',
      recommendedExperts: ['Business Strategy', 'Sales', 'Marketing'],
      recommendedIntervention: 'Business Growth Audit',
      nextStep: '90-Day Business Growth Mentorship',
    },
  },
  {
    tokens: [
      'job',
      'career',
      'cv',
      'resume',
      'interview',
      'linkedin',
      'promotion',
      'workplace',
      'professional',
    ],
    diagnosis: {
      growthArea: 'Career Growth',
      primaryChallenge: 'Professional Positioning',
      recommendedExperts: ['Career Development', 'CV Strategy', 'Professional Branding'],
      recommendedIntervention: 'Career Positioning Blueprint',
      nextStep: '90-Day Career Growth Mentorship',
    },
  },
  {
    tokens: [
      'money',
      'income',
      'finance',
      'budget',
      'debt',
      'saving',
      'savings',
      'cash',
      'wealth',
    ],
    diagnosis: {
      growthArea: 'Financial Growth',
      primaryChallenge: 'Income & Financial Discipline',
      recommendedExperts: ['Financial Education', 'Income Strategy', 'Business Finance'],
      recommendedIntervention: 'Money Clarity Session',
      nextStep: '90-Day Financial Growth Mentorship',
    },
  },
  {
    tokens: [
      'ai',
      'digital',
      'automation',
      'technology',
      'tools',
      'online',
      'system',
      'systems',
    ],
    diagnosis: {
      growthArea: 'Digital & AI Growth',
      primaryChallenge: 'Technology Adoption',
      recommendedExperts: ['AI Strategy', 'Digital Transformation', 'Business Automation'],
      recommendedIntervention: 'AI Opportunity Consultation',
      nextStep: 'Digital Business Blueprint',
    },
  },
  {
    tokens: [
      'purpose',
      'stuck',
      'direction',
      'discipline',
      'confidence',
      'habit',
      'habits',
      'focus',
      'productive',
    ],
    diagnosis: {
      growthArea: 'Personal Growth',
      primaryChallenge: 'Direction & Self-Leadership',
      recommendedExperts: ['Purpose Discovery', 'Personal Growth Strategy', 'Productivity'],
      recommendedIntervention: 'Personal Growth Blueprint',
      nextStep: '90-Day Personal Transformation Mentorship',
    },
  },
];

const DEFAULT_DIAGNOSIS: GrowthDiagnosis = {
  growthArea: 'General Growth Strategy',
  primaryChallenge: 'Needs Clarification',
  recommendedExperts: ['Growth Advisor', 'Strategy Consultant'],
  recommendedIntervention: 'Quick Clarity',
  nextStep: 'Strategic Consultation',
  confidence: 'low',
};

function scoreRule(text: string, rule: DiagnosisRule): number {
  return rule.tokens.reduce((score, token) => {
    const pattern = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(text) ? score + 1 : score;
  }, 0);
}

export function diagnoseGrowthChallenge(input: string): GrowthDiagnosis {
  const text = input.trim().toLowerCase();
  if (!text) return DEFAULT_DIAGNOSIS;

  const ranked = RULES.map((rule) => ({ rule, score: scoreRule(text, rule) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) return DEFAULT_DIAGNOSIS;

  return {
    ...best.rule.diagnosis,
    confidence: best.score >= 3 ? 'high' : best.score >= 2 ? 'medium' : 'low',
  };
}

export function formatGrowthDiagnosis(diagnosis: GrowthDiagnosis): string {
  return [
    `Growth Area: ${diagnosis.growthArea}`,
    `Primary Challenge: ${diagnosis.primaryChallenge}`,
    `Recommended Experts: ${diagnosis.recommendedExperts.join(' + ')}`,
    `Recommended Intervention: ${diagnosis.recommendedIntervention}`,
    `Next Step: ${diagnosis.nextStep}`,
  ].join('\n');
}
