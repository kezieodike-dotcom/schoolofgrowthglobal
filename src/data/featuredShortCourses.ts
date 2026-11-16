import { LEADERSHIP_COURSES, type LeadershipCourseId } from './leadershipPricing';
import { leadershipCoursePreviews } from './leadershipCoursePreviews';
import { PROFESSIONAL_COURSES } from './professionalCourses';

function leadershipCard(id: LeadershipCourseId) {
  const course = LEADERSHIP_COURSES.find(course => course.id === id)!;
  const preview = leadershipCoursePreviews[id]!;
  return { ...course, ...preview, kind: 'leadership' as const, detailsUrl: `/courses/leadership?course=${id}`, moduleCount: undefined, hours: undefined };
}

const originalProfessionalIds = new Set<string>([
  'customer-relationship-service-excellence',
  'professional-ethics-workplace-integrity',
]);
const professionalCards = PROFESSIONAL_COURSES.map(course => ({
  ...course, kind: 'professional' as const, detailsUrl: `/courses/${course.id}`,
}));

export const FEATURED_SHORT_COURSES = [
  leadershipCard('leadership-001'),
  ...professionalCards.filter(course => originalProfessionalIds.has(course.id)),
  leadershipCard('leadership-005'),
  leadershipCard('leadership-006'),
  leadershipCard('leadership-004'),
  ...professionalCards.filter(course => !originalProfessionalIds.has(course.id)),
];
