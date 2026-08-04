/**
 * What School of Growth sells, and what each purchase unlocks.
 *
 * This is the single source of truth for money. It is imported by the browser
 * (to render pricing and lock content) AND by the payment server (to decide
 * what to charge and to check what Paystack actually collected). That sharing
 * is the point: the client never tells the server a price. It names a plan,
 * and the server looks the amount up here. Otherwise anyone could open dev
 * tools and enrol in the Maxi package for ₦1.
 *
 * This file must stay free of Node and React imports — it is bundled into the
 * browser build and imported by the serverless function, exactly like
 * formDefs.ts.
 *
 * To change prices or what a package includes, change it here. Nothing else
 * hard-codes an amount.
 */

// ── Money ────────────────────────────────────────────────────────────────
// Paystack charges in the currency's smallest unit, so every NGN amount
// crosses the wire as kobo. Storing kobo here (rather than naira, converted
// at the call site) keeps rounding out of the payment path entirely.

export const CURRENCY = "NGN" as const;
export const KOBO_PER_NAIRA = 100;

/** ₦10,000 — for display. Whole naira only; we do not price in kobo. */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / KOBO_PER_NAIRA).toLocaleString("en-NG")}`;
}

// ── Plans ────────────────────────────────────────────────────────────────

/** Course packages: one-off payments that unlock the curriculum. */
export type PackageId = "mini" | "medium" | "maxi";

/** Mentorship: a recurring subscription that unlocks the mentor directory. */
export type MentorshipPlanId = "mentor-monthly" | "mentor-annual";

/** Anything a student can pay for. This is what /api/payments accepts. */
export type PlanCode = PackageId | MentorshipPlanId;

export type PlanKind = "package" | "mentorship";

/** Course levels, mirroring Course['level'] in types.ts. */
export type CourseLevel =
  | "Emerging Leaders"
  | "Executive"
  | "Frontier"
  | "Senior Directorate";

export interface Plan {
  code: PlanCode;
  kind: PlanKind;
  name: string;
  /** One line under the name on the pricing card. */
  tagline: string;
  amountKobo: number;
  /** How long the entitlement lasts once paid. */
  durationDays: number;
  /** Shown on the card as the billing unit, e.g. "one-off" or "per month". */
  billing: string;
  features: string[];
  /** Deliberately named so the card can say what you do NOT get. */
  excludes?: string[];
  /** Course levels this plan unlocks. Mentorship plans unlock none. */
  includedLevels: CourseLevel[];
  /**
   * Days of mentor-directory access bundled with the plan. Maxi includes a
   * full year so the top package is a complete offer rather than a bigger
   * course list; mentorship is still sold standalone for everyone else.
   */
  mentorshipDays: number;
  /** How many mentors this plan lets a student pair with at once. */
  mentorSlots: number;
  /** Ribbon on the pricing grid. Exactly one plan should carry this. */
  highlight?: string;
}

const ALL_LEVELS: CourseLevel[] = [
  "Emerging Leaders",
  "Executive",
  "Frontier",
  "Senior Directorate",
];

export const PLANS: Record<PlanCode, Plan> = {
  mini: {
    code: "mini",
    kind: "package",
    name: "Mini",
    tagline: "Test the water with a full self-paced track.",
    amountKobo: 10_000 * KOBO_PER_NAIRA,
    durationDays: 90,
    billing: "one-off · 3 months access",
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
    excludes: ["Live cohorts", "Mentor directory", "Executive certification"],
  },

  medium: {
    code: "medium",
    kind: "package",
    name: "Medium",
    tagline: "The full professional curriculum, taught live.",
    amountKobo: 50_000 * KOBO_PER_NAIRA,
    durationDays: 365,
    billing: "one-off · 12 months access",
    includedLevels: ["Emerging Leaders", "Executive", "Frontier"],
    mentorshipDays: 0,
    mentorSlots: 0,
    features: [
      "Everything in Mini",
      "All five schools unlocked",
      "Executive and Frontier courses",
      "Live cohort classes and Q&A",
      "Graded assessments with feedback",
      "Verified certification",
      "Unlimited Growth AI coaching",
      "12 months of access",
    ],
    excludes: ["Senior Directorate programmes", "Mentor directory"],
    highlight: "Most popular",
  },

  maxi: {
    code: "maxi",
    kind: "package",
    name: "Maxi",
    tagline: "The complete institution, mentor included.",
    amountKobo: 150_000 * KOBO_PER_NAIRA,
    durationDays: 365,
    billing: "one-off · 12 months access",
    includedLevels: ALL_LEVELS,
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "Everything in Medium",
      "Senior Directorate programmes",
      "In-person executive intensives",
      "Capstone project with faculty review",
      "12 months mentor access included (₦25,000 value)",
      "Priority admission to every cohort",
      "Alumni and corporate partner network",
      "12 months of access",
    ],
  },

  "mentor-monthly": {
    code: "mentor-monthly",
    kind: "mentorship",
    name: "Mentorship — Monthly",
    tagline: "Pick a mentor and meet them every month.",
    amountKobo: 3_000 * KOBO_PER_NAIRA,
    durationDays: 30,
    billing: "per month",
    includedLevels: [],
    mentorshipDays: 30,
    mentorSlots: 1,
    features: [
      "Full mentor directory access",
      "Pair with 1 mentor",
      "One 1-on-1 session per month",
      "Direct messaging between sessions",
      "Cancel any time",
    ],
  },

  "mentor-annual": {
    code: "mentor-annual",
    kind: "mentorship",
    name: "Mentorship — Annual",
    tagline: "A year with up to three mentors, at a discount.",
    amountKobo: 25_000 * KOBO_PER_NAIRA,
    durationDays: 365,
    billing: "per year",
    includedLevels: [],
    mentorshipDays: 365,
    mentorSlots: 3,
    features: [
      "Full mentor directory access",
      "Pair with up to 3 mentors",
      "Two 1-on-1 sessions per month",
      "Priority booking ahead of monthly members",
      "Session recordings and notes",
      "Save ₦11,000 against monthly",
    ],
    highlight: "Best value",
  },
};

/** The three course packages, in the order they appear on the pricing grid. */
export const PACKAGES: Plan[] = [PLANS.mini, PLANS.medium, PLANS.maxi];

/** The two mentorship subscriptions. */
export const MENTORSHIP_PLANS: Plan[] = [
  PLANS["mentor-monthly"],
  PLANS["mentor-annual"],
];

/** Narrowing guard for values arriving from a URL, form, or request body. */
export function isPlanCode(value: unknown): value is PlanCode {
  return typeof value === "string" && value in PLANS;
}

/** ₦11,000 — what the annual mentorship saves against 12 monthly payments. */
export const MENTORSHIP_ANNUAL_SAVING_KOBO =
  PLANS["mentor-monthly"].amountKobo * 12 - PLANS["mentor-annual"].amountKobo;

// ── Entitlements ─────────────────────────────────────────────────────────
// What a *paid* plan grants. Produced by the server after Paystack confirms
// the charge, and read by the UI to decide what to unlock.

export interface Entitlement {
  /** The plan that was paid for. */
  plan: PlanCode;
  /** Paystack transaction reference — the receipt for this entitlement. */
  reference: string;
  /** Email the payment was made with. */
  email: string;
  /** ISO timestamp the payment was verified. */
  purchasedAt: string;
  /** ISO timestamp course access lapses. Equal to purchasedAt when none. */
  coursesExpireAt: string;
  /** ISO timestamp mentor access lapses. Equal to purchasedAt when none. */
  mentorshipExpiresAt: string;
  /** Course levels unlocked, copied so a later price change cannot revoke. */
  levels: CourseLevel[];
}

/** Builds the entitlement a plan grants, starting from `now`. */
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
    // A mentorship plan grants no course time and vice versa, so the matching
    // "expiry" is simply now — already lapsed, which the checks below read as
    // no access rather than as a special case.
    coursesExpireAt:
      plan.includedLevels.length > 0 ? addDays(plan.durationDays) : now.toISOString(),
    mentorshipExpiresAt:
      plan.mentorshipDays > 0 ? addDays(plan.mentorshipDays) : now.toISOString(),
    levels: [...plan.includedLevels],
  };
}

const isLive = (iso: string, now: Date) => new Date(iso).getTime() > now.getTime();

/** True when any held entitlement still unlocks courses at `level`. */
export function hasCourseAccess(
  entitlements: Entitlement[],
  level: CourseLevel,
  now: Date = new Date()
): boolean {
  return entitlements.some(
    (e) => isLive(e.coursesExpireAt, now) && e.levels.includes(level)
  );
}

/** True when any held entitlement still unlocks the mentor directory. */
export function hasMentorshipAccess(
  entitlements: Entitlement[],
  now: Date = new Date()
): boolean {
  return entitlements.some((e) => isLive(e.mentorshipExpiresAt, now));
}

/**
 * The cheapest package that unlocks `level`, so a locked course can tell the
 * reader exactly what to buy instead of a generic "upgrade to continue".
 */
export function cheapestPackageFor(level: CourseLevel): Plan {
  const match = PACKAGES.filter((p) => p.includedLevels.includes(level)).sort(
    (a, b) => a.amountKobo - b.amountKobo
  )[0];
  // Every level appears in Maxi, so this only guards against a future level
  // being added to types.ts and forgotten here.
  return match ?? PLANS.maxi;
}
