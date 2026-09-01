import { MASTER_GROWTH_DIVISIONS } from '../lib/mentorshipCatalogue.js';

const services = MASTER_GROWTH_DIVISIONS.flatMap((division) => division.services);

for (const label of ['Beauty & Fitness', 'Health, Diet & Well-Being']) {
  if (!services.includes(label)) {
    throw new Error(`Mentorship category missing: ${label}`);
  }
}
