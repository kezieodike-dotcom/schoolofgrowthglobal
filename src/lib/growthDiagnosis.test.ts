import {
  diagnoseGrowthChallenge,
  formatGrowthDiagnosis,
} from './growthDiagnosis.js';

const complaint =
  "My company has 80 employees, productivity is falling, managers aren't performing and staff turnover is increasing.";

const diagnosis = diagnoseGrowthChallenge(complaint);

if (diagnosis.growthArea !== 'Organizational Performance') {
  throw new Error(`Expected Organizational Performance, found ${diagnosis.growthArea}.`);
}

if (diagnosis.primaryChallenge !== 'People & Performance') {
  throw new Error(`Expected People & Performance, found ${diagnosis.primaryChallenge}.`);
}

for (const expert of ['Organizational Development', 'Leadership', 'HR']) {
  if (!diagnosis.recommendedExperts.includes(expert)) {
    throw new Error(`Missing recommended expert: ${expert}.`);
  }
}

if (diagnosis.recommendedIntervention !== 'Organizational Growth Audit') {
  throw new Error(
    `Expected Organizational Growth Audit, found ${diagnosis.recommendedIntervention}.`
  );
}

if (diagnosis.nextStep !== '90-Day Transformation Program') {
  throw new Error(`Expected 90-Day Transformation Program, found ${diagnosis.nextStep}.`);
}

const formatted = formatGrowthDiagnosis(diagnosis);

for (const label of [
  'Growth Area: Organizational Performance',
  'Primary Challenge: People & Performance',
  'Recommended Experts: Organizational Development + Leadership + HR',
  'Recommended Intervention: Organizational Growth Audit',
  'Next Step: 90-Day Transformation Program',
]) {
  if (!formatted.includes(label)) {
    throw new Error(`Formatted diagnosis missing: ${label}`);
  }
}
