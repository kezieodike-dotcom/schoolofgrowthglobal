import { makeReferralCode, makeReferralUrl } from './referrals.js';

const studentCode = makeReferralCode('student', {
  name: 'Ada Example',
  email: 'ada@example.com',
});

if (!studentCode.startsWith('student-ada-example-')) {
  throw new Error(`Student referral code should be readable and scoped, got ${studentCode}.`);
}

if (/\s/.test(studentCode)) {
  throw new Error('Referral codes should not contain spaces.');
}

const studentUrl = makeReferralUrl({
  audience: 'student',
  name: 'Ada Example',
  email: 'ada@example.com',
  origin: 'https://schoolofgrowthglobal.vercel.app',
});

if (!studentUrl.startsWith('https://schoolofgrowthglobal.vercel.app/register?ref=student-')) {
  throw new Error(`Student referral URL should point to student registration, got ${studentUrl}.`);
}

const mentorUrl = makeReferralUrl({
  audience: 'mentor',
  name: 'Dr Mentor',
  email: 'mentor@example.com',
  origin: 'https://schoolofgrowthglobal.vercel.app',
});

if (!mentorUrl.startsWith('https://schoolofgrowthglobal.vercel.app/register/mentor?ref=mentor-')) {
  throw new Error(`Mentor referral URL should point to mentor registration, got ${mentorUrl}.`);
}

