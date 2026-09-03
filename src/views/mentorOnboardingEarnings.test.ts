import { readFileSync } from 'fs';
import path from 'path';

const source = readFileSync(
  path.join(process.cwd(), 'src', 'views', 'MentorRegistrationView.tsx'),
  'utf8'
);

if (!source.includes('Become a Mentor. Create Impact. Earn From Your Expertise.')) {
  throw new Error('Mentor onboarding should introduce the mentor impact and earnings section.');
}

if (!source.includes('How You Earn')) {
  throw new Error('Mentor onboarding should clearly state the financial arrangement under How You Earn.');
}

if (!source.includes('Mentors and Consultants receive 80%')) {
  throw new Error('Individual session earnings should be visible on mentor onboarding.');
}

if (!source.includes('corporate organization sessions')) {
  throw new Error('Corporate organization session earnings should be visible on mentor onboarding.');
}

if (
  !source.includes('Applicable taxes and statutory deductions are removed before the 80%') ||
  !source.includes('individual-session share is calculated and paid')
) {
  throw new Error('Mentor onboarding should explain that taxes are deducted before the 80% mentor share is calculated.');
}

if (!source.includes('Apply as a Mentor/Consultant')) {
  throw new Error('Mentor onboarding should include a clear application CTA.');
}
