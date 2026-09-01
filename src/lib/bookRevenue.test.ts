import { calculateBookRevenueSplit } from './bookRevenue.js';

const split = calculateBookRevenueSplit(50_000_00);

if (split.companyShareKobo !== 10_000_00) {
  throw new Error(`Company share should be 20%, got ${split.companyShareKobo}.`);
}

if (split.ownerShareKobo !== 40_000_00) {
  throw new Error(`Owner share should be 80%, got ${split.ownerShareKobo}.`);
}

if (split.companyPercent !== 20 || split.ownerPercent !== 80) {
  throw new Error(
    `Book split should be labelled 20/80, got ${split.companyPercent}/${split.ownerPercent}.`
  );
}

const rounded = calculateBookRevenueSplit(999);
if (rounded.companyShareKobo + rounded.ownerShareKobo !== 999) {
  throw new Error('Rounded shares must always add back to the transaction total.');
}
