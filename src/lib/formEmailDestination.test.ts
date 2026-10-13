import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const generalEmail = 'info@schoolofgrowthglobal.com';
const supportEmail = 'support@schoolofgrowthglobal.com';
const contactView = readFileSync(resolve('src/views/ContactView.tsx'), 'utf8');
const contactEmails = readFileSync(resolve('src/lib/contactEmails.ts'), 'utf8');
const formSubmit = readFileSync(resolve('src/lib/useFormSubmit.ts'), 'utf8');

if (!contactView.includes('CONTACT_EMAILS.general') || !contactEmails.includes(generalEmail)) {
  throw new Error(`Contact page should show ${generalEmail} as the public email address.`);
}

if (contactView.includes('admissions@schoolofgrowth.global')) {
  throw new Error('Contact page should not show the old admissions email address.');
}

if (!formSubmit.includes(supportEmail)) {
  throw new Error(`Form delivery fallback should point users to ${supportEmail}.`);
}
