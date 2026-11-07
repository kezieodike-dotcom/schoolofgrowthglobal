import architecture from '../data/facultyArchitecture.json';
import type { Course } from '../types';

export const FACULTIES = architecture.faculties;
export type Faculty = (typeof FACULTIES)[number];
export type FacultySchool = Faculty['schools'][number];

export const SCHOOL_CATALOGUE = FACULTIES.flatMap(faculty => faculty.schools);
export const SPECIALISED_COURSE_COUNT = SCHOOL_CATALOGUE.reduce((total, school) => total + school.courses.length, 0);

// Existing course records keep their IDs and enrolments when school names change.
const LEGACY_COURSE_SCHOOL_IDS: Record<string, string> = {
  tech: 'artificial-intelligence',
  business: 'business-management-and-administration',
  finance: 'accounting-and-financial-management',
  personal: 'personal-growth-and-development',
  coaching: 'consulting-and-professional-services',
  agriculture: 'agriculture-and-agribusiness',
  career: 'career-development-and-employability',
};

export function getCourseSchool(course: Pick<Course, 'schoolId' | 'schoolName'>): FacultySchool | undefined {
  const id = LEGACY_COURSE_SCHOOL_IDS[course.schoolId] ?? course.schoolId;
  return SCHOOL_CATALOGUE.find(school => school.id === id || school.title === course.schoolName);
}

export function searchFacultyCatalogue(query: string): Faculty[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return FACULTIES;
  return FACULTIES.map(faculty => {
    const facultyMatches = `${faculty.title} ${faculty.purpose}`.toLowerCase().includes(normalized);
    return {
      ...faculty,
      schools: facultyMatches ? faculty.schools : faculty.schools.filter(school =>
        [school.title, ...school.courses, ...school.notes].some(value => value.toLowerCase().includes(normalized))
      ),
    };
  }).filter(faculty => faculty.schools.length > 0);
}
