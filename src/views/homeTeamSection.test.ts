import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./HomeView.tsx', import.meta.url), 'utf8');

const testimonialsIndex = source.indexOf('<TestimonialsSection />');
const donationIndex = source.indexOf('Donation hero bridge');
const teamIndex = source.indexOf('Meet Our Team');

if (testimonialsIndex === -1) {
  throw new Error('Home page should render the testimonials section.');
}

if (teamIndex === -1) {
  throw new Error('Home page should render a Meet Our Team section.');
}

if (teamIndex < testimonialsIndex) {
  throw new Error('Meet Our Team should appear after What Our Leaders Say.');
}

if (donationIndex < testimonialsIndex) {
  throw new Error('The donation spotlight should appear after What Our Leaders Say.');
}

if (!source.includes('FACULTY_MEMBERS')) {
  throw new Error('Meet Our Team should be driven by the existing faculty data.');
}

for (const phrase of [
  'Learn with structure',
  'Courses & cohorts',
  'Find a mentor or consultant',
  'Explore Career Jobs',
  'Events & live classes',
  'Insights',
  'Be part of a global growth community.',
  'Browse books',
  'Donate to impact',
  'Choose your impact',
  'Visit the donation page',
  '/scenes/coaching-collab.jpg',
  'to="/about"'
]) {
  if (!source.includes(phrase)) {
    throw new Error(`Home page should include the ${phrase} pathway.`);
  }
}
