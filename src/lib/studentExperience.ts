import {
  PLANS,
  PACKAGES,
  type CourseLevel,
  type PackageId,
  type Entitlement,
} from "./pricing";

/**
 * What a student's dashboard should actually contain, given what they paid.
 *
 * The portal is not one screen with things greyed out — a Mini student and a
 * Maxi student are running different programmes, and the dashboard should
 * reflect that. This file is the single place that decides the difference, so
 * the view renders a description rather than re-deriving package rules in a
 * dozen conditionals.
 *
 * Everything here is derived from src/lib/pricing.ts, so changing what a
 * package includes changes the dashboard with it.
 */

export type FeatureState = "included" | "locked";

export interface StudentFeature {
  state: FeatureState;
  /** Shown when locked: the cheapest package that would unlock it. */
  unlockedBy?: PackageId;
  /** Extra qualifier, e.g. "20 questions / month" on the AI coach. */
  note?: string;
}

export interface StudentExperience {
  /** False when nothing has been paid for — the portal shows a locked state. */
  enrolled: boolean;
  packageId: PackageId | null;
  packageName: string | null;
  /** Course levels this student may open. */
  levels: CourseLevel[];
  /** Whole days until course access lapses; null when not enrolled. */
  daysRemaining: number | null;
  /** True in the last 30 days of access, so the portal can prompt a renewal. */
  expiringSoon: boolean;
  /** The next package up, for the upgrade card. Null on Maxi. */
  upgradeTo: PackageId | null;

  liveCohorts: StudentFeature;
  inPersonIntensives: StudentFeature;
  assessments: StudentFeature;
  capstone: StudentFeature;
  mentorship: StudentFeature;
  aiCoach: StudentFeature;
  /** The kind of certificate this package awards. */
  certification: { label: string; note: string };
}

const LOCKED = (unlockedBy: PackageId, note?: string): StudentFeature => ({
  state: "locked",
  unlockedBy,
  note,
});

const INCLUDED = (note?: string): StudentFeature => ({ state: "included", note });

/** Whole days from now until `iso`, floored at zero. */
function daysUntil(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function deriveExperience(entitlements: Entitlement[]): StudentExperience {
  const now = Date.now();
  const live = entitlements.filter(
    (e) => new Date(e.coursesExpireAt).getTime() > now
  );

  // The richest package held wins. Someone who upgrades mid-term should get
  // the better dashboard immediately rather than the one they bought first.
  const packages = live
    .map((e) => e.plan)
    .filter((code): code is PackageId => PLANS[code]?.kind === "package")
    .sort((a, b) => PLANS[a].amountKobo - PLANS[b].amountKobo);

  const packageId = packages.length ? packages[packages.length - 1] : null;

  const mentorshipLive = entitlements.some(
    (e) => new Date(e.mentorshipExpiresAt).getTime() > now
  );

  const expiries = live.map((e) => new Date(e.coursesExpireAt).getTime());
  const daysRemaining = expiries.length
    ? daysUntil(new Date(Math.max(...expiries)).toISOString())
    : null;

  if (!packageId) {
    return {
      enrolled: entitlements.length > 0,
      packageId: null,
      packageName: null,
      levels: [],
      daysRemaining,
      expiringSoon: false,
      upgradeTo: "mini",
      liveCohorts: LOCKED("medium"),
      inPersonIntensives: LOCKED("maxi"),
      assessments: LOCKED("medium"),
      capstone: LOCKED("maxi"),
      mentorship: mentorshipLive ? INCLUDED() : LOCKED("maxi"),
      aiCoach: LOCKED("mini"),
      certification: { label: "None yet", note: "Choose a package to earn one." },
    };
  }

  const plan = PLANS[packageId];
  const isMini = packageId === "mini";
  const isMaxi = packageId === "maxi";

  // The next package up by price, so the upgrade card never points sideways
  // or at something the student already holds.
  const upgradeTo =
    PACKAGES.filter((p) => p.amountKobo > plan.amountKobo).sort(
      (a, b) => a.amountKobo - b.amountKobo
    )[0]?.code ?? null;

  return {
    enrolled: true,
    packageId,
    packageName: plan.name,
    levels: plan.includedLevels,
    daysRemaining,
    expiringSoon: daysRemaining !== null && daysRemaining <= 30,
    upgradeTo: upgradeTo as PackageId | null,

    liveCohorts: isMini
      ? LOCKED("medium", "Self-paced modules only on Mini")
      : INCLUDED(),
    inPersonIntensives: isMaxi ? INCLUDED() : LOCKED("maxi"),
    assessments: isMini
      ? LOCKED("medium", "Graded feedback starts on Medium")
      : INCLUDED(),
    capstone: isMaxi ? INCLUDED("Reviewed by faculty") : LOCKED("maxi"),
    mentorship: mentorshipLive
      ? INCLUDED(isMaxi ? "Included with Maxi" : "Active subscription")
      : LOCKED("maxi", "Also sold separately from ₦3,000/month"),
    aiCoach: isMini
      ? INCLUDED("20 questions per month")
      : INCLUDED("Unlimited questions"),
    certification: isMini
      ? { label: "Certificate of completion", note: "Awarded per course finished." }
      : isMaxi
        ? {
            label: "Executive certification",
            note: "Awarded on capstone review by faculty.",
          }
        : {
            label: "Verified certification",
            note: "Awarded on passing graded assessments.",
          },
  };
}

/** Monthly Growth AI allowance, for the quota meter. Infinity above Mini. */
export function aiQuota(packageId: PackageId | null): number {
  return packageId === "mini" ? 20 : Infinity;
}
