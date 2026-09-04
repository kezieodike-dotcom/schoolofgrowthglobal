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
      "Pay for all four ladders",
      "Save ₦50,000",
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
