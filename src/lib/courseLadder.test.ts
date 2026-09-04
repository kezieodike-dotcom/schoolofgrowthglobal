import {
  COMPLETE_LADDER_DISCOUNT_KOBO,
  COMPLETE_LADDER_ORIGINAL_KOBO,
  COURSE_LADDER_STEPS,
  FAST_TRACK_SUMMARY,
  certificateRequirementsFor,
  describeFastTrackFor,
  requiresCertificateReview,
} from "./courseLadder.js";
import { COURSE_INTENSIVES, PLANS, formatNaira, type PlanCode } from "./pricing.js";

const expectRequirements = (code: keyof typeof PLANS, requirements: string[]) => {
  const actual = certificateRequirementsFor(code);
  if (actual.join("|") !== requirements.join("|")) {
    throw new Error(
      `${code} requirements should be ${requirements.join(", ") || "none"}, found ${
        actual.join(", ") || "none"
      }.`
    );
  }
};

if (COURSE_LADDER_STEPS.length !== 4) {
  throw new Error(`Expected 4 full ladder steps, found ${COURSE_LADDER_STEPS.length}.`);
}

expectRequirements("mini", []);
expectRequirements("medium", ["Growth Foundation Certificate"]);
expectRequirements("maxi", [
  "Growth Foundation Certificate",
  "Growth Accelerator Certificate",
]);
expectRequirements("premium", [
  "Growth Foundation Certificate",
  "Growth Accelerator Certificate",
  "Executive Circle Certificate",
]);

if (requiresCertificateReview("mini")) {
  throw new Error("Growth Foundation should not require previous certificate review.");
}

if (!requiresCertificateReview("medium") || !requiresCertificateReview("premium")) {
  throw new Error("Higher full cohorts should require previous certificate review.");
}

if (COURSE_INTENSIVES.length !== 4) {
  throw new Error(`Expected 4 fast-track intensives, found ${COURSE_INTENSIVES.length}.`);
}

const prices = new Map(COURSE_INTENSIVES.map((plan) => [plan.code, formatNaira(plan.amountKobo)]));
const expectedPrices = new Map<PlanCode, string>([
  ["foundation-intensive", "₦5,000"],
  ["accelerator-intensive", "₦25,000"],
  ["executive-intensive", "₦100,000"],
  ["elite-intensive", "₦500,000"],
]);

for (const [code, price] of expectedPrices) {
  if (prices.get(code) !== price) {
    throw new Error(`${code} should cost ${price}, found ${prices.get(code) ?? "missing"}.`);
  }
  if (requiresCertificateReview(code)) {
    throw new Error(`${code} should not require certificate verification.`);
  }
}

if (!FAST_TRACK_SUMMARY.includes("50%")) {
  throw new Error("Fast-track summary should explain the 50% price logic.");
}

if (!describeFastTrackFor("premium").includes("₦500,000")) {
  throw new Error("Elite Council fast-track description should show the 50% price.");
}

if (formatNaira(COMPLETE_LADDER_ORIGINAL_KOBO) !== "₦1,260,000") {
  throw new Error(
    `Complete ladder original total should be ₦1,260,000, found ${formatNaira(
      COMPLETE_LADDER_ORIGINAL_KOBO
    )}.`
  );
}

if (formatNaira(COMPLETE_LADDER_DISCOUNT_KOBO) !== "₦50,000") {
  throw new Error(
    `Complete ladder discount should be ₦50,000, found ${formatNaira(
      COMPLETE_LADDER_DISCOUNT_KOBO
    )}.`
  );
}

if (formatNaira(PLANS["complete-ladder"].amountKobo) !== "₦1,210,000") {
  throw new Error(
    `Complete Growth Ladder bundle should cost ₦1,210,000, found ${formatNaira(
      PLANS["complete-ladder"].amountKobo
    )}.`
  );
}

if (!PLANS["complete-ladder"].includedLevels.includes("Elite")) {
  throw new Error("Complete Growth Ladder bundle should unlock the Elite level.");
}
