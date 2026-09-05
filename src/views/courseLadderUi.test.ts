import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

const checks: [string, string[]][] = [
  [
    "src/views/PricingView.tsx",
    [
      "Full Growth Ladder",
      "Two-Week Fast-Track Intensives",
      "Requires previous certificate verification",
      "Intensive Completion Certificate",
      "Pay for all four tiers at once",
      "Save ₦50,000",
      "Self-paced learning",
      "Live class",
      "delivery=self-paced",
      "delivery=live-class",
    ],
  ],
  [
    "src/views/CheckoutView.tsx",
    [
      "Certificate verification required",
      "Upload previous certificate",
      "Submit for verification",
      "useFormSubmit('certificateVerification')",
    ],
  ],
  [
    "src/views/CoursesView.tsx",
    ["Full Growth Ladder", "Two-week fast-track intensive", "Requires verification"],
  ],
  [
    "src/views/StudentDashboardView.tsx",
    ["Growth Ladder Progress", "Submit certificate for verification"],
  ],
  [
    "src/views/admin/AdminOverviewView.tsx",
    ["Certificate Verification Queue", "previous cohort certificates"],
  ],
];

for (const [file, needles] of checks) {
  const source = read(file);
  for (const needle of needles) {
    if (!source.includes(needle)) {
      throw new Error(`${file} should include "${needle}".`);
    }
  }
}

const pricingSource = read("src/views/PricingView.tsx");
const packagesSection = pricingSource.slice(
  pricingSource.indexOf("{/* Packages */}"),
  pricingSource.indexOf("{/* Comparison table */}"),
);

for (const needle of [
  "<CompleteLadderPaymentBox />",
  "{/* Trust strip */}",
]) {
  if (!packagesSection.includes(needle)) {
    throw new Error(`The top packages section should include "${needle}".`);
  }
}

if (
  packagesSection.indexOf("<CompleteLadderPaymentBox />") >
  packagesSection.indexOf("{/* Trust strip */}")
) {
  throw new Error("The complete ladder payment box should appear before the trust strip.");
}

const completePaymentBox = pricingSource.slice(
  pricingSource.indexOf("const CompleteLadderPaymentBox"),
  pricingSource.indexOf("const CourseLadderSection"),
);

for (const needle of [
  "Pay for all four tiers at once",
  'to="/checkout/complete-ladder"',
  "COMPLETE_LADDER_ORIGINAL_KOBO",
  'PLANS["complete-ladder"].amountKobo',
  "COMPLETE_LADDER_DISCOUNT_KOBO",
]) {
  if (!completePaymentBox.includes(needle)) {
    throw new Error(`The complete ladder payment box should include "${needle}".`);
  }
}

const courseLadderSection = pricingSource.slice(
  pricingSource.indexOf("const CourseLadderSection"),
  pricingSource.indexOf("export const PricingView"),
);

if (courseLadderSection.includes('to="/checkout/complete-ladder"')) {
  throw new Error("The lower course ladder section should not repeat the complete ladder payment box.");
}
