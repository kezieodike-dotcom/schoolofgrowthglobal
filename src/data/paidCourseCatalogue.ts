import { isLeadershipCourseId, type LeadershipCourseId } from './leadershipPricing.js';
import { isProfessionalCourseId, type ProfessionalCourseId } from './professionalCourses.js';

export type PaidCourseId = LeadershipCourseId | ProfessionalCourseId;
export const isPaidCourseId = (value: unknown): value is PaidCourseId => isLeadershipCourseId(value) || isProfessionalCourseId(value);
export type PaidCourseAvailability = Partial<Record<PaidCourseId, string>>;
export type PaidCourseOutlines = Partial<Record<PaidCourseId, string[]>>;
