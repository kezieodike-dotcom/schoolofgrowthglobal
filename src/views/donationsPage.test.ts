import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const app = readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
const header = readFileSync(path.join(root, 'src', 'components', 'HeaderNavbar.tsx'), 'utf8');
const footer = readFileSync(path.join(root, 'src', 'components', 'Footer.tsx'), 'utf8');

if (!app.includes("import { DonationsView } from './views/DonationsView';")) {
  throw new Error('App should import the Donations page.');
}

if (!app.includes('path="donate"') || !app.includes('element={<DonationsView />}')) {
  throw new Error('App should register a public /donate route.');
}

if (!header.includes("{ to: '/donate', label: 'Donate' }")) {
  throw new Error('Header navigation should expose Donate.');
}

if (!footer.includes('to="/donate"')) {
  throw new Error('Footer should link to Donations.');
}

const page = readFileSync(path.join(root, 'src', 'views', 'DonationsView.tsx'), 'utf8');

for (const phrase of [
  'DONATE',
  'CHOOSE YOUR IMPACT',
  'Donate to a Specific Fund',
  'Let School of Growth Global Allocate My Donation Where It Is Most Needed',
]) {
  if (!page.includes(phrase)) {
    throw new Error(`Donations page should include "${phrase}".`);
  }
}

for (const symbol of ['DONATION_FUNDS', 'DONATION_ALLOCATION_OPTION']) {
  if (!page.includes(symbol)) {
    throw new Error(`Donations page should render from ${symbol}.`);
  }
}

for (const phrase of [
  'Donation Terms & Conditions',
  'I have read and agree to the Donation Terms & Conditions',
  'termsAccepted',
  '!termsAccepted',
]) {
  if (!page.includes(phrase)) {
    throw new Error(`Donation form should require donor terms consent: ${phrase}.`);
  }
}
