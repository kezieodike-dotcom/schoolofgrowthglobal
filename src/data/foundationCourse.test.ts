import { COURSES } from './mockData.js';
import { formatNaira, PLANS } from '../lib/pricing.js';

const foundation = COURSES.find((course) => course.id === 'growth-foundation-cohort');

if (!foundation) {
  throw new Error('Growth Foundation Cohort should exist in the public course catalogue.');
}

if (foundation.level !== 'Emerging Leaders') {
  throw new Error(`Growth Foundation Cohort should be a first-tier Emerging Leaders course, found ${foundation.level}.`);
}

if (foundation.price !== formatNaira(PLANS.mini.amountKobo)) {
  throw new Error(`Growth Foundation Cohort should show the ${formatNaira(PLANS.mini.amountKobo)} tier price.`);
}

if (foundation.modules.length !== 8) {
  throw new Error(`Growth Foundation Cohort should contain 8 modules, found ${foundation.modules.length}.`);
}

const expectedTitles = [
  'Understanding Yourself',
  'Growth Mindset',
  'Purpose, Vision & Direction',
  'Personal Productivity',
  'Communication & People Skills',
  'Career Development',
  'Financial & Economic Intelligence',
  'Digital & AI Literacy',
];

for (const title of expectedTitles) {
  if (!foundation.modules.some((module) => module.title === title)) {
    throw new Error(`Growth Foundation Cohort is missing module: ${title}.`);
  }
}

const career = foundation.modules.find((module) => module.title === 'Career Development');
if (!career?.topics.includes('CV development') || !career.topics.includes('Interview preparation')) {
  throw new Error('Career Development should show practical employability topics.');
}

const digital = foundation.modules.find((module) => module.title === 'Digital & AI Literacy');
if (!digital?.topics.includes('Prompting') || !digital.topics.includes('AI-assisted productivity')) {
  throw new Error('Digital & AI Literacy should show practical AI topics.');
}
