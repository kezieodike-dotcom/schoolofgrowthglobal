import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./HomeView.tsx', import.meta.url), 'utf8');

const testimonialsIndex = source.indexOf('<TestimonialsSection />');
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

if (!source.includes('FACULTY_MEMBERS')) {
  throw new Error('Meet Our Team should be driven by the existing faculty data.');
}
