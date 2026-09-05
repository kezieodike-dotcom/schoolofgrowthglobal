import { formatNaira, PACKAGES } from './pricing.js';

const expected = [
  {
    code: 'mini',
    name: 'Growth Foundation',
    price: '₦10,000',
    position: 'Entry / Common Man',
  },
  {
    code: 'medium',
    name: 'Growth Accelerator',
    price: '₦50,000',
    position: 'Serious Learner',
  },
  {
    code: 'maxi',
    name: 'Executive Circle',
    price: '₦200,000',
    position: 'Professionals / Entrepreneurs',
  },
  {
    code: 'premium',
    name: 'Elite Council',
    price: '₦1,000,000',
    position: 'High-Level Transformation',
  },
] as const;

if (PACKAGES.length !== expected.length) {
  throw new Error(`Expected ${expected.length} course packages, found ${PACKAGES.length}.`);
}

expected.forEach((want, index) => {
  const packagePlan = PACKAGES[index];
  if (!packagePlan) throw new Error(`Missing package at tier ${index + 1}.`);
  if (packagePlan.code !== want.code) {
    throw new Error(`Tier ${index + 1} should use code ${want.code}, found ${packagePlan.code}.`);
  }
  if (packagePlan.name !== want.name) {
    throw new Error(`Tier ${index + 1} should be named ${want.name}, found ${packagePlan.name}.`);
  }
  if (formatNaira(packagePlan.amountKobo) !== want.price) {
    throw new Error(`Tier ${index + 1} should cost ${want.price}, found ${formatNaira(packagePlan.amountKobo)}.`);
  }
  if (packagePlan.position !== want.position) {
    throw new Error(`Tier ${index + 1} should be positioned as ${want.position}, found ${packagePlan.position}.`);
  }
});

const accelerator = PACKAGES[1];
if (accelerator.durationDays !== 180) {
  throw new Error(`Growth Accelerator should give 6 months access, found ${accelerator.durationDays} days.`);
}

if (accelerator.billing !== 'Nigeria launch price / 6 months access') {
  throw new Error(`Growth Accelerator billing should say 6 months access, found "${accelerator.billing}".`);
}

if (!accelerator.features.includes('6 months of access')) {
  throw new Error('Growth Accelerator feature list should say 6 months of access.');
}

for (const packagePlan of PACKAGES) {
  if (packagePlan.paymentOptions?.length) {
    throw new Error(`${packagePlan.name} should require full payment, not advertise part payment.`);
  }
  if (packagePlan.features.some((feature) => /× 2|part payment|installment/i.test(feature))) {
    throw new Error(`${packagePlan.name} should not include installment language in features.`);
  }
}

const fullPaymentText = JSON.stringify(PACKAGES);
for (const forbidden of ['₦25,000 × 2', '₦100,000 × 2']) {
  if (fullPaymentText.includes(forbidden)) {
    throw new Error(`Packages should not advertise old part-payment option ${forbidden}.`);
  }
}
