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
if (!accelerator.paymentOptions?.includes('₦25,000 × 2')) {
  throw new Error('Growth Accelerator should advertise the two-part ₦25,000 payment option.');
}

const executiveCircle = PACKAGES[2];
if (!executiveCircle.paymentOptions?.includes('₦100,000 × 2')) {
  throw new Error('Executive Circle should advertise the two-part ₦100,000 payment option.');
}
