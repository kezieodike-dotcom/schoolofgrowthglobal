import { COURSES } from './mockData.js';
import { formatNaira, PLANS } from '../lib/pricing.js';

const expected = [
  {
    id: 'growth-accelerator',
    title: 'Growth Accelerator',
    level: 'Executive',
    price: formatNaira(PLANS.medium.amountKobo),
    modules: ['Skills to Value', 'Business Fundamentals', 'Marketing', 'Sales', 'Business Finance', 'Career Acceleration', 'AI for Productivity & Business', 'Execution System', 'Accelerator Capstone'],
    topics: ['CRM fundamentals', 'OKRs', 'Knowledge + Execution + Evidence'],
  },
  {
    id: 'executive-circle',
    title: 'Executive Circle',
    level: 'Senior Directorate',
    price: formatNaira(PLANS.maxi.amountKobo),
    modules: ['Executive Leadership', 'Strategic Thinking', 'Organizational Development', 'Business Growth & Scale', 'People & Performance', 'Finance for Leaders', 'Governance & Ethics', 'Digital Transformation', 'Executive Capstone'],
    topics: ['PESTLE', 'Corporate governance', 'Strategic Growth & Transformation Plan'],
  },
  {
    id: 'elite-council',
    title: 'Elite Council',
    level: 'Elite',
    price: formatNaira(PLANS.premium.amountKobo),
    modules: ['Personal Mastery', 'Advanced Strategy', 'Wealth & Capital', 'Institution Building', 'Global Influence', 'National & Social Impact', 'Elite Capstone'],
    topics: ['Legacy planning', 'Generational wealth principles', '5-10 Year Legacy Blueprint'],
  },
];

for (const want of expected) {
  const course = COURSES.find((item) => item.id === want.id);
  if (!course) throw new Error(`${want.title} should exist in the course catalogue.`);
  if (course.title !== want.title) {
    throw new Error(`${want.id} should be titled ${want.title}, got ${course.title}.`);
  }
  if (course.level !== want.level) {
    throw new Error(`${want.title} should be locked at ${want.level}, got ${course.level}.`);
  }
  if (course.price !== want.price) {
    throw new Error(`${want.title} should show ${want.price}, got ${course.price}.`);
  }
  for (const title of want.modules) {
    if (!course.modules.some((module) => module.title === title)) {
      throw new Error(`${want.title} is missing module: ${title}.`);
    }
  }
  const topicText = course.modules.flatMap((module) => module.topics).join(' | ');
  for (const topic of want.topics) {
    if (!topicText.includes(topic)) {
      throw new Error(`${want.title} should include topic: ${topic}.`);
    }
  }
}
