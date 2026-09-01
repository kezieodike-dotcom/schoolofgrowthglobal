import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const expectedEmail = 'infoschoolofgrowth@gmail.com';
const contactView = readFileSync(resolve('src/views/ContactView.tsx'), 'utf8');
const formSubmit = readFileSync(resolve('src/lib/useFormSubmit.ts'), 'utf8');

if (!contactView.includes(expectedEmail)) {
  throw new Error(`Contact page should show ${expectedEmail} as the public email address.`);
}

if (contactView.includes('admissions@schoolofgrowth.global')) {
  throw new Error('Contact page should not show the old admissions email address.');
}

if (!formSubmit.includes(expectedEmail)) {
  throw new Error(`Form delivery fallback should point users to ${expectedEmail}.`);
}
