import { readFileSync } from 'node:fs';
import path from 'node:path';

const source = readFileSync(path.join(process.cwd(), 'src', 'server', 'paymentRoutes.ts'), 'utf8');

for (const phrase of [
  'donationFund',
  'donationAmount',
  'itemKind: donation',
  'tx.metadata?.itemKind === "donation"',
  'donation-paid',
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Payment routes should support donation checkout and verification: ${phrase}.`);
  }
}

if (!source.includes('parseDonationAmount')) {
  throw new Error('Donation checkout should use shared amount validation.');
}
