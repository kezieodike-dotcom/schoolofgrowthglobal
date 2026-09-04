import {
  COURSE_INTENSIVES,
  PACKAGES,
  PLANS,
  formatNaira,
  type CourseFastTrackPlanId,
  type PackageId,
  type Plan,
  type PlanCode,
} from "./pricing";

export interface CourseLadderStep {
  level: number;
  packageCode: PackageId;
  certificateName: string;
  prerequisiteCodes: PackageId[];
  prerequisiteCertificateNames: string[];
  fastTrackCode: CourseFastTrackPlanId;
  fastTrackCertificateName: string;
  fullDurationLabel: string;
  fastTrackDurationLabel: string;
}

const prerequisiteNames = (codes: PackageId[]) =>
  codes.map((code) => `${PLANS[code].name} Certificate`);

export const COURSE_LADDER_STEPS: CourseLadderStep[] = [
  {
    level: 1,
    packageCode: "mini",
    certificateName: "Growth Foundation Certificate",
    prerequisiteCodes: [],
    prerequisiteCertificateNames: [],
    fastTrackCode: "foundation-intensive",
    fastTrackCertificateName: "Growth Foundation Intensive Completion Certificate",
    fullDurationLabel: "Full cohort",
    fastTrackDurationLabel: "Two-week intensive",
  },
  {
    level: 2,
    packageCode: "medium",
    certificateName: "Growth Accelerator Certificate",
    prerequisiteCodes: ["mini"],
    prerequisiteCertificateNames: prerequisiteNames(["mini"]),
    fastTrackCode: "accelerator-intensive",
    fastTrackCertificateName: "Growth Accelerator Intensive Completion Certificate",
    fullDurationLabel: "Full cohort",
    fastTrackDurationLabel: "Two-week intensive",
  },
  {
    level: 3,
    packageCode: "maxi",
    certificateName: "Executive Circle Certificate",
    prerequisiteCodes: ["mini", "medium"],
    prerequisiteCertificateNames: prerequisiteNames(["mini", "medium"]),
    fastTrackCode: "executive-intensive",
    fastTrackCertificateName: "Executive Circle Intensive Completion Certificate",
    fullDurationLabel: "Full cohort",
    fastTrackDurationLabel: "Two-week intensive",
  },
  {
    level: 4,
    packageCode: "premium",
    certificateName: "Elite Council Certificate",
    prerequisiteCodes: ["mini", "medium", "maxi"],
    prerequisiteCertificateNames: prerequisiteNames(["mini", "medium", "maxi"]),
    fastTrackCode: "elite-intensive",
    fastTrackCertificateName: "Elite Council Intensive Completion Certificate",
    fullDurationLabel: "Full cohort",
    fastTrackDurationLabel: "Two-week intensive",
  },
];

export const COURSE_LADDER_SUMMARY =
  "Full cohorts now work as a growth ladder: each higher cohort requires the certificate from the level before it, so students build capability step by step.";

export const FAST_TRACK_SUMMARY =
  "Busy learners can choose a two-week fast-track intensive at 50% of the full cohort price. It covers selected high-impact modules and awards an intensive completion certificate.";

export const COMPLETE_LADDER_DISCOUNT_KOBO = 50_000 * 100;

export const COMPLETE_LADDER_ORIGINAL_KOBO = PACKAGES.reduce(
  (sum, plan) => sum + plan.amountKobo,
  0
);

export const COMPLETE_LADDER_SUMMARY =
  "Pay once for all four full course ladders and receive a ₦50,000 discount from the combined price.";

export function getCourseLadderStep(code: PlanCode): CourseLadderStep | null {
  return COURSE_LADDER_STEPS.find((step) => step.packageCode === code) ?? null;
}

export function getFastTrackStep(code: PlanCode): CourseLadderStep | null {
  return COURSE_LADDER_STEPS.find((step) => step.fastTrackCode === code) ?? null;
}

export function isFastTrackPlan(code: PlanCode): code is CourseFastTrackPlanId {
  return COURSE_INTENSIVES.some((plan) => plan.code === code);
}

export function requiresCertificateReview(code: PlanCode): boolean {
  return (getCourseLadderStep(code)?.prerequisiteCertificateNames.length ?? 0) > 0;
}

export function certificateRequirementsFor(code: PlanCode): string[] {
  return getCourseLadderStep(code)?.prerequisiteCertificateNames ?? [];
}

export function fastTrackPlanFor(code: PackageId): Plan {
  const step = COURSE_LADDER_STEPS.find((item) => item.packageCode === code);
  return step ? PLANS[step.fastTrackCode] : PLANS["foundation-intensive"];
}

export function completedPackageCodes(codes: PlanCode[]): PackageId[] {
  if (codes.includes("complete-ladder")) {
    return COURSE_LADDER_STEPS.map((step) => step.packageCode);
  }
  return codes.filter((code): code is PackageId =>
    COURSE_LADDER_STEPS.some((step) => step.packageCode === code)
  );
}

export function describePrerequisiteFor(code: PlanCode): string {
  const requirements = certificateRequirementsFor(code);
  if (requirements.length === 0) return "Entry point: no previous certificate required.";
  return `Requires verification of ${requirements.join(", ")} before full cohort payment.`;
}

export function describeFastTrackFor(code: PackageId): string {
  const plan = fastTrackPlanFor(code);
  return `${plan.name}: ${formatNaira(plan.amountKobo)} for selected modules over two weeks.`;
}
