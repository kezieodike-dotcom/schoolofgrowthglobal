import { GROWTH_JOBS } from './mockData.js';

const expectedRoles = [
  'General Manager',
  'Front Desk',
  'House Keeper',
  'Sales & Marketer',
  'Laundry Attendant',
  'Waiter/Waitress',
  'Bar Manager',
  'Accountant',
  'Executive Chef',
  'Store Keeper',
];

const clientJobs = GROWTH_JOBS.filter((job) => job.organization === 'School of Growth Global Client');

for (const title of expectedRoles) {
  const job = clientJobs.find((item) => item.title === title);
  if (!job) throw new Error(`Missing Career Jobs posting for ${title}.`);
  if (job.location !== 'Port Harcourt, Nigeria') {
    throw new Error(`${title} should be listed in Port Harcourt, Nigeria.`);
  }
  if (job.workMode !== 'On-site') {
    throw new Error(`${title} should be listed as an on-site role.`);
  }
  if (job.applicationEmail !== 'careerjobs.schoolofgrowthglobal@gmail.com') {
    throw new Error(`${title} should keep the flyer application email.`);
  }
  if (!job.image.startsWith('/career-jobs/')) {
    throw new Error(`${title} should use the extracted flyer image.`);
  }
  if (job.requirements.length < 5) {
    throw new Error(`${title} should include the flyer requirements.`);
  }
}
