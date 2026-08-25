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
export type PackageId = "mini" | "medium" | "maxi";

export type MentorshipPlanId =
  | "mentor-1-hour"
  | "mentor-2-hours"
  | "mentor-3-hours"
  | "mentor-4-hours"
  | "mentor-5-hours"
  | "mentor-1-week"
  | "mentor-1-month"
  | "mentor-1-year";

/** Anything a student or mentee can pay for. This is what /api/payments accepts. */
export type PlanCode = PackageId | MentorshipPlanId;

export type PlanKind = "package" | "mentorship";

export type CourseLevel =
  | "Emerging Leaders"
  | "Executive"
  | "Frontier"
  | "Senior Directorate";

export interface Plan {
  code: PlanCode;
  kind: PlanKind;
  name: string;
  tagline: string;
  amountKobo: number;
  durationDays: number;
  billing: string;
  features: string[];
  excludes?: string[];
  includedLevels: CourseLevel[];
  mentorshipDays: number;
  mentorSlots: number;
  highlight?: string;
}

const ALL_LEVELS: CourseLevel[] = [
  "Emerging Leaders",
  "Executive",
  "Frontier",
  "Senior Directorate",
];

const naira = (amount: number) => amount * KOBO_PER_NAIRA;

export const PLANS: Record<PlanCode, Plan> = {
  mini: {
    code: "mini",
    kind: "package",
    name: "Growth Foundation Cohort",
    tagline: "Start with the core growth curriculum and build disciplined execution habits.",
    amountKobo: naira(10_000),
    durationDays: 90,
    billing: "one-off / 3 months access",
    includedLevels: ["Emerging Leaders"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Every Emerging Leaders course, self-paced",
      "Course workbooks and templates",
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
    name: "Executive Cycle",
    tagline: "The professional curriculum for serious career and leadership acceleration.",
    amountKobo: naira(50_000),
    durationDays: 365,
    billing: "one-off / 12 months access",
    includedLevels: ["Emerging Leaders", "Executive", "Frontier"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Everything in Growth Foundation Cohort",
      "All core schools unlocked",
      "Executive and Frontier courses",
      "Live cohort classes and Q&A",
      "Graded assessments with feedback",
      "Verified certification",
      "Unlimited Growth AI coaching",
      "12 months of access",
    ],
    excludes: ["Senior Directorate programmes", "Mentor booking"],
    highlight: "Most popular",
  },

  maxi: {
    code: "maxi",
    kind: "package",
    name: "Elite",
    tagline: "The complete School of Growth experience with advanced access and mentorship.",
    amountKobo: naira(150_000),
    durationDays: 365,
    billing: "one-off / 12 months access",
    includedLevels: ALL_LEVELS,
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "Everything in Executive Cycle",
      "Senior Directorate programmes",
      "In-person executive intensives",
      "Capstone project with faculty review",
      "One-year mentorship access included",
      "Priority admission to every cohort",
      "Alumni and corporate partner network",
      "12 months of access",
    ],
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
};

export const PACKAGES: Plan[] = [PLANS.mini, PLANS.medium, PLANS.maxi];

export const MENTORSHIP_PLANS: Plan[] = [
  PLANS["mentor-1-hour"],
  PLANS["mentor-2-hours"],
  PLANS["mentor-3-hours"],
  PLANS["mentor-4-hours"],
  PLANS["mentor-5-hours"],
  PLANS["mentor-1-week"],
  PLANS["mentor-1-month"],
  PLANS["mentor-1-year"],
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
