/**
 * What School of Growth sells, and what each purchase unlocks.
 *
 * This is the single source of truth for money. The browser renders it, and
 * the payment server verifies Paystack amounts against it. The browser never
 * sends a price; it sends a plan code and the server looks that code up here.
 */

export const CURRENCY = "NGN" as const;
export const KOBO_PER_NAIRA = 100;

export function formatNaira(kobo: number): string {
  return `\u20a6${(kobo / KOBO_PER_NAIRA).toLocaleString("en-NG")}`;
}

/** Course packages. Codes stay stable so existing checkout links do not break. */
export type PackageId = "mini" | "medium" | "maxi" | "premium";

export type CourseFastTrackPlanId =
  | "foundation-intensive"
  | "accelerator-intensive"
  | "executive-intensive"
  | "elite-intensive";

export type CourseBundlePlanId = "complete-ladder";

export type MentorshipPlanId =
  | "mentor-1-hour"
  | "mentor-2-hours"
  | "mentor-3-hours"
  | "mentor-4-hours"
  | "mentor-5-hours"
  | "mentor-1-week"
  | "mentor-1-month"
  | "mentor-1-year"
  | "mentor-30-day"
  | "mentor-90-day"
  | "mentor-6-month"
  | "mentor-12-month";

export type ConsultationPlanId =
  | "consult-quick-clarity"
  | "consult-strategic-consultation"
  | "consult-growth-strategy-session"
  | "consult-growth-audit"
  | "consult-blueprint";

/** Anything a student or mentee can pay for. This is what /api/payments accepts. */
export type PlanCode =
  | PackageId
  | CourseFastTrackPlanId
  | CourseBundlePlanId
  | MentorshipPlanId
  | ConsultationPlanId;

export type PlanKind =
  | "package"
  | "course-intensive"
  | "course-bundle"
  | "mentorship"
  | "consultation";

export type CourseLevel =
  | "Emerging Leaders"
  | "Executive"
  | "Frontier"
  | "Senior Directorate"
  | "Elite";

export interface Plan {
  code: PlanCode;
  kind: PlanKind;
  name: string;
  tagline: string;
  position?: string;
  amountKobo: number;
  durationDays: number;
  billing: string;
  paymentOptions?: string[];
  features: string[];
  excludes?: string[];
  includedLevels: CourseLevel[];
  mentorshipDays: number;
  mentorSlots: number;
  highlight?: string;
}

const EXECUTIVE_CIRCLE_LEVELS: CourseLevel[] = [
  "Emerging Leaders",
  "Executive",
  "Frontier",
  "Senior Directorate",
];

const ALL_LEVELS: CourseLevel[] = [...EXECUTIVE_CIRCLE_LEVELS, "Elite"];

const naira = (amount: number) => amount * KOBO_PER_NAIRA;

export const PLANS: Record<PlanCode, Plan> = {
  mini: {
    code: "mini",
    kind: "package",
    name: "Growth Foundation",
    tagline: "The Gateway to Growth for students, NYSC members, job seekers and early builders.",
    position: "Entry / Common Man",
    amountKobo: naira(10_000),
    durationDays: 90,
    billing: "Nigeria launch price / 3 months access",
    includedLevels: ["Emerging Leaders"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Mass-market entry point into School of Growth",
      "Built for students, NYSC members and job seekers",
      "Core growth curriculum, self-paced",
      "Foundational course workbooks and templates",
      "Certificate of completion",
      "Student community access",
      "Growth AI coach (20 questions / month)",
      "3 months of access",
    ],
    excludes: ["Live cohorts", "Mentor booking", "Executive certification"],
  },

  medium: {
    code: "medium",
    kind: "package",
    name: "Growth Accelerator",
    tagline: "From Learning to Implementation with live strategy, templates and accountability.",
    position: "Serious Learner",
    amountKobo: naira(50_000),
    durationDays: 180,
    billing: "Nigeria launch price / 6 months access",
    includedLevels: ["Emerging Leaders", "Executive", "Frontier"],
    mentorshipDays: 30,
    mentorSlots: 1,
    features: [
      "Everything in Growth Foundation",
      "More advanced courses",
      "Live cohort classes and Q&A",
      "Implementation assignments",
      "Growth templates and career/business resources",
      "Community access and accountability",
      "Selected mentorship session access",
      "Certificate",
      "Unlimited Growth AI coaching",
      "6 months of access",
    ],
    excludes: ["Senior Directorate programmes", "Private strategic advisory"],
    highlight: "Most popular",
  },

  maxi: {
    code: "maxi",
    kind: "package",
    name: "Executive Circle",
    tagline: "Strategic Growth & Leadership for professionals, founders and entrepreneurs.",
    position: "Professionals / Entrepreneurs",
    amountKobo: naira(200_000),
    durationDays: 365,
    billing: "Nigeria launch price / 12 months access",
    includedLevels: EXECUTIVE_CIRCLE_LEVELS,
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "Everything in Growth Accelerator",
      "Executive-level courses",
      "Strategic business or career blueprint",
      "Live executive sessions",
      "Group mentorship and priority support",
      "Business growth and leadership development",
      "Networking and industry opportunities",
      "Executive certificate",
      "12 months of access",
    ],
  },

  premium: {
    code: "premium",
    kind: "package",
    name: "Elite Council",
    tagline: "The Highest Level of School of Growth Global: private transformation and strategic advisory.",
    position: "High-Level Transformation",
    amountKobo: naira(1_000_000),
    durationDays: 365,
    billing: "Nigeria launch price / 12 months access",
    includedLevels: ALL_LEVELS,
    mentorshipDays: 365,
    mentorSlots: 5,
    features: [
      "Everything in Executive Circle",
      "Private mentorship and strategic advisory",
      "Personal growth blueprint",
      "Business and career positioning",
      "Leadership advisory and business review",
      "Strategic planning and personal brand positioning",
      "High-level networking and private community",
      "Dedicated accountability and priority access",
      "Certificate of Elite Completion",
      "12 months of access",
    ],
    highlight: "Highest level",
  },

  "foundation-intensive": {
    code: "foundation-intensive",
    kind: "course-intensive",
    name: "Growth Foundation Intensive",
    tagline: "A two-week focused introduction to practical personal and professional growth.",
    position: "Two-Week Fast-Track",
    amountKobo: naira(5_000),
    durationDays: 14,
    billing: "50% fast-track intensive / 2 weeks access",
    includedLevels: ["Emerging Leaders"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Selected high-impact Growth Foundation modules",
      "Two-week practical learning sprint",
      "Capability-focused assignments",
      "Intensive completion certificate",
      "No previous certificate required",
    ],
  },

  "accelerator-intensive": {
    code: "accelerator-intensive",
    kind: "course-intensive",
    name: "Growth Accelerator Intensive",
    tagline: "A two-week implementation sprint for learners who need selected Accelerator modules.",
    position: "Two-Week Fast-Track",
    amountKobo: naira(25_000),
    durationDays: 14,
    billing: "50% fast-track intensive / 2 weeks access",
    includedLevels: ["Executive", "Frontier"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Selected high-impact Growth Accelerator modules",
      "Implementation assignments and templates",
      "Two-week practical learning sprint",
      "Intensive completion certificate",
      "No previous certificate required",
    ],
  },

  "executive-intensive": {
    code: "executive-intensive",
    kind: "course-intensive",
    name: "Executive Circle Intensive",
    tagline: "A two-week executive sprint covering selected leadership and strategy modules.",
    position: "Two-Week Fast-Track",
    amountKobo: naira(100_000),
    durationDays: 14,
    billing: "50% fast-track intensive / 2 weeks access",
    includedLevels: ["Senior Directorate"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Selected high-impact Executive Circle modules",
      "Strategic career or business assignments",
      "Two-week practical learning sprint",
      "Intensive completion certificate",
      "No previous certificate required",
    ],
  },

  "elite-intensive": {
    code: "elite-intensive",
    kind: "course-intensive",
    name: "Elite Council Intensive",
    tagline: "A two-week elite advisory sprint for high-level transformation priorities.",
    position: "Two-Week Fast-Track",
    amountKobo: naira(500_000),
    durationDays: 14,
    billing: "50% fast-track intensive / 2 weeks access",
    includedLevels: ["Elite"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Selected high-impact Elite Council modules",
      "Private strategic assignments",
      "Two-week practical learning sprint",
      "Intensive completion certificate",
      "No previous certificate required",
    ],
    highlight: "Fastest route",
  },

  "complete-ladder": {
    code: "complete-ladder",
    kind: "course-bundle",
    name: "Complete Growth Ladder",
    tagline: "Pay once for Growth Foundation, Growth Accelerator, Executive Circle and Elite Council.",
    position: "All Four Cohorts",
    amountKobo: naira(1_210_000),
    durationDays: 365,
    billing: "All four full course ladders / ₦50,000 bundle discount",
    includedLevels: ALL_LEVELS,
    mentorshipDays: 365,
    mentorSlots: 5,
    features: [
      "Growth Foundation full cohort",
      "Growth Accelerator full cohort",
      "Executive Circle full cohort",
      "Elite Council full cohort",
      "All course levels unlocked through one payment",
      "₦50,000 discount from the combined ₦1,260,000 value",
      "One year of mentorship access",
      "Complete ladder certificate pathway",
    ],
    highlight: "Best complete path",
  },

  "mentor-1-hour": {
    code: "mentor-1-hour",
    kind: "mentorship",
    name: "One-Hour Mentorship",
    tagline: "A focused one-hour session for one urgent growth, career or business decision.",
    amountKobo: naira(1_500),
    durationDays: 7,
    billing: "one-hour session",
    includedLevels: [],
    mentorshipDays: 7,
    mentorSlots: 1,
    features: [
      "One 60-minute mentor session",
      "Choose one mentor from the marketplace",
      "Direct student-to-mentor messaging during access",
      "Best for a single decision or quick review",
    ],
  },

  "mentor-2-hours": {
    code: "mentor-2-hours",
    kind: "mentorship",
    name: "Two Hours Mentorship",
    tagline: "Two hours of guided support for deeper diagnosis and next steps.",
    amountKobo: naira(3_000),
    durationDays: 7,
    billing: "two-hour package",
    includedLevels: [],
    mentorshipDays: 7,
    mentorSlots: 1,
    features: [
      "Two mentorship hours",
      "Choose one mentor from the marketplace",
      "Direct messaging during access",
      "Useful for CV, interview, sales or strategy review",
    ],
  },

  "mentor-3-hours": {
    code: "mentor-3-hours",
    kind: "mentorship",
    name: "Three Hours Mentorship",
    tagline: "Structured support across three focused mentor hours.",
    amountKobo: naira(6_000),
    durationDays: 14,
    billing: "three-hour package",
    includedLevels: [],
    mentorshipDays: 14,
    mentorSlots: 1,
    features: [
      "Three mentorship hours",
      "Session planning with your selected mentor",
      "Direct messaging during access",
      "Recommended for strategy, career transition or business planning",
    ],
  },

  "mentor-4-hours": {
    code: "mentor-4-hours",
    kind: "mentorship",
    name: "Four Hours Mentorship",
    tagline: "Four mentor hours for a compact transformation sprint.",
    amountKobo: naira(7_500),
    durationDays: 14,
    billing: "four-hour package",
    includedLevels: [],
    mentorshipDays: 14,
    mentorSlots: 1,
    features: [
      "Four mentorship hours",
      "Choose one mentor from the marketplace",
      "Direct messaging during access",
      "Strong fit for business, leadership and workplace performance goals",
    ],
  },

  "mentor-5-hours": {
    code: "mentor-5-hours",
    kind: "mentorship",
    name: "Five Hours Mentorship",
    tagline: "Five hours for a more complete mentorship sprint.",
    amountKobo: naira(9_500),
    durationDays: 21,
    billing: "five-hour package",
    includedLevels: [],
    mentorshipDays: 21,
    mentorSlots: 1,
    features: [
      "Five mentorship hours",
      "Choose one mentor from the marketplace",
      "Direct messaging during access",
      "Best for business growth, leadership habits or personal development",
    ],
    highlight: "Best hourly value",
  },

  "mentor-1-week": {
    code: "mentor-1-week",
    kind: "mentorship",
    name: "One-Week Mentorship",
    tagline: "Seven days of mentor access for a short growth sprint.",
    amountKobo: naira(5_000),
    durationDays: 7,
    billing: "one week",
    includedLevels: [],
    mentorshipDays: 7,
    mentorSlots: 1,
    features: [
      "One week mentor access",
      "Choose one mentor from the marketplace",
      "Direct messaging during the week",
      "Good for quick accountability and focused execution",
    ],
  },

  "mentor-1-month": {
    code: "mentor-1-month",
    kind: "mentorship",
    name: "One-Month Mentorship",
    tagline: "A full month of mentor support for sustained progress.",
    amountKobo: naira(25_000),
    durationDays: 30,
    billing: "one month",
    includedLevels: [],
    mentorshipDays: 30,
    mentorSlots: 1,
    features: [
      "One month mentor access",
      "Choose one mentor from the marketplace",
      "Direct messaging during the month",
      "Best for career, business or leadership development plans",
    ],
    highlight: "Popular",
  },

  "mentor-1-year": {
    code: "mentor-1-year",
    kind: "mentorship",
    name: "One-Year Mentorship",
    tagline: "A year of mentor access for long-term growth, business and career support.",
    amountKobo: naira(200_000),
    durationDays: 365,
    billing: "one year",
    includedLevels: [],
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "One year mentor access",
      "Pair with up to 3 mentors",
      "Priority booking",
      "Direct messaging throughout the year",
      "Best for executive, wealth, career or business transformation",
    ],
    highlight: "Deepest support",
  },

  "consult-quick-clarity": {
    code: "consult-quick-clarity",
    kind: "consultation",
    name: "Quick Clarity",
    tagline: "A focused 30-minute consultation for one problem that needs immediate direction.",
    amountKobo: naira(10_000),
    durationDays: 7,
    billing: "30-minute consultation",
    includedLevels: [],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "30-minute focused diagnosis",
      "One clear growth challenge defined",
      "Immediate recommendations and next steps",
      "Best for quick career, business, leadership or personal decisions",
    ],
  },

  "consult-strategic-consultation": {
    code: "consult-strategic-consultation",
    kind: "consultation",
    name: "Strategic Consultation",
    tagline: "A 60-minute session for a significant problem requiring analysis and recommendations.",
    amountKobo: naira(25_000),
    durationDays: 14,
    billing: "60-minute consultation",
    includedLevels: [],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "60-minute consultation",
      "Problem analysis and expert recommendations",
      "Decision guidance for a significant growth issue",
      "Recommended for specialist career, business or leadership questions",
    ],
  },

  "consult-growth-strategy-session": {
    code: "consult-growth-strategy-session",
    kind: "consultation",
    name: "Growth Strategy Session",
    tagline: "A 90-120 minute deep assessment with strategy and action planning.",
    amountKobo: naira(75_000),
    durationDays: 21,
    billing: "90-120 minute strategy session",
    includedLevels: [],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Deep assessment of your situation",
      "Strategy and action planning",
      "Practical roadmap for business, career, leadership or life growth",
      "Best for complex individual or business decisions",
    ],
    highlight: "Strategy",
  },

  "consult-growth-audit": {
    code: "consult-growth-audit",
    kind: "consultation",
    name: "Growth Audit",
    tagline: "A structured review of your business, career, leadership path or organization.",
    amountKobo: naira(200_000),
    durationDays: 30,
    billing: "comprehensive growth audit starting price",
    includedLevels: [],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Comprehensive growth review",
      "Gaps, risks and constraints identified",
      "Improvement opportunities prioritized",
      "Best for business, career, leadership or organizational diagnosis",
    ],
  },

  "consult-blueprint": {
    code: "consult-blueprint",
    kind: "consultation",
    name: "Blueprint",
    tagline: "A documented personalized strategy based on your exact growth situation.",
    amountKobo: naira(250_000),
    durationDays: 45,
    billing: "documented strategy starting price",
    includedLevels: [],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Documented personalized growth strategy",
      "Priorities, roadmap and implementation focus",
      "Designed around your business, career, leadership or personal challenge",
      "Best for clients who need a written strategic plan",
    ],
    highlight: "Documented plan",
  },

  "mentor-30-day": {
    code: "mentor-30-day",
    kind: "mentorship",
    name: "30-Day Mentorship",
    tagline: "Start: immediate direction and accountability for one growth area.",
    amountKobo: naira(30_000),
    durationDays: 30,
    billing: "30-day mentorship starting price",
    includedLevels: [],
    mentorshipDays: 30,
    mentorSlots: 1,
    features: [
      "30 days of mentor access",
      "Immediate direction and accountability",
      "Direct mentee-to-mentor messaging during access",
      "Good for quick momentum and early execution",
    ],
  },

  "mentor-90-day": {
    code: "mentor-90-day",
    kind: "mentorship",
    name: "90-Day Mentorship",
    tagline: "Build: the flagship mentorship duration for meaningful growth and execution.",
    amountKobo: naira(75_000),
    durationDays: 90,
    billing: "90-day mentorship starting price",
    includedLevels: [],
    mentorshipDays: 90,
    mentorSlots: 1,
    features: [
      "90 days of structured mentorship",
      "Build habits, systems and portfolio evidence",
      "Direct mentee-to-mentor messaging during access",
      "Recommended flagship mentorship duration",
    ],
    highlight: "Flagship",
  },

  "mentor-6-month": {
    code: "mentor-6-month",
    kind: "mentorship",
    name: "6-Month Mentorship",
    tagline: "Scale: serious transformation across business, career, leadership or personal growth.",
    amountKobo: naira(200_000),
    durationDays: 180,
    billing: "6-month mentorship starting price",
    includedLevels: [],
    mentorshipDays: 180,
    mentorSlots: 2,
    features: [
      "6 months of deeper mentorship",
      "Sustain change and improve capability",
      "Direct messaging throughout access",
      "Best for serious transformation and execution support",
    ],
  },

  "mentor-12-month": {
    code: "mentor-12-month",
    kind: "mentorship",
    name: "12-Month Mentorship",
    tagline: "Master: long-term development, strategic support and high-level accountability.",
    amountKobo: naira(500_000),
    durationDays: 365,
    billing: "12-month mentorship starting price",
    includedLevels: [],
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "12 months of long-term mentor access",
      "Strategic development and accountability",
      "Direct messaging throughout access",
      "Best for leadership maturity and high-level growth",
    ],
    highlight: "Long-term",
  },
};

export const PACKAGES: Plan[] = [PLANS.mini, PLANS.medium, PLANS.maxi, PLANS.premium];

export const COURSE_INTENSIVES: Plan[] = [
  PLANS["foundation-intensive"],
  PLANS["accelerator-intensive"],
  PLANS["executive-intensive"],
  PLANS["elite-intensive"],
];

export const MENTORSHIP_PLANS: Plan[] = [
  PLANS["mentor-1-hour"],
  PLANS["mentor-2-hours"],
  PLANS["mentor-3-hours"],
  PLANS["mentor-4-hours"],
  PLANS["mentor-5-hours"],
  PLANS["mentor-1-week"],
  PLANS["mentor-1-month"],
  PLANS["mentor-1-year"],
  PLANS["mentor-30-day"],
  PLANS["mentor-90-day"],
  PLANS["mentor-6-month"],
  PLANS["mentor-12-month"],
];

export const CONSULTATION_PLANS: Plan[] = [
  PLANS["consult-quick-clarity"],
  PLANS["consult-strategic-consultation"],
  PLANS["consult-growth-strategy-session"],
  PLANS["consult-growth-audit"],
  PLANS["consult-blueprint"],
];

export function isPlanCode(value: unknown): value is PlanCode {
  return typeof value === "string" && value in PLANS;
}

export const MENTORSHIP_ANNUAL_SAVING_KOBO =
  PLANS["mentor-1-month"].amountKobo * 12 - PLANS["mentor-1-year"].amountKobo;

export interface Entitlement {
  plan: PlanCode;
  reference: string;
  email: string;
  purchasedAt: string;
  coursesExpireAt: string;
  mentorshipExpiresAt: string;
  levels: CourseLevel[];
}

export function entitlementFor(
  plan: Plan,
  opts: { reference: string; email: string; now?: Date }
): Entitlement {
  const now = opts.now ?? new Date();
  const addDays = (days: number) =>
    new Date(now.getTime() + days * 86_400_000).toISOString();

  return {
    plan: plan.code,
    reference: opts.reference,
    email: opts.email,
    purchasedAt: now.toISOString(),
    coursesExpireAt:
      plan.includedLevels.length > 0 ? addDays(plan.durationDays) : now.toISOString(),
    mentorshipExpiresAt:
      plan.mentorshipDays > 0 ? addDays(plan.mentorshipDays) : now.toISOString(),
    levels: [...plan.includedLevels],
  };
}

const isLive = (iso: string, now: Date) => new Date(iso).getTime() > now.getTime();

export function hasCourseAccess(
  entitlements: Entitlement[],
  level: CourseLevel,
  now: Date = new Date()
): boolean {
  return entitlements.some(
    (e) => isLive(e.coursesExpireAt, now) && e.levels.includes(level)
  );
}

export function hasMentorshipAccess(
  entitlements: Entitlement[],
  now: Date = new Date()
): boolean {
  return entitlements.some((e) => isLive(e.mentorshipExpiresAt, now));
}

export function cheapestPackageFor(level: CourseLevel): Plan {
  const match = PACKAGES.filter((p) => p.includedLevels.includes(level)).sort(
    (a, b) => a.amountKobo - b.amountKobo
  )[0];
  return match ?? PLANS.maxi;
}
