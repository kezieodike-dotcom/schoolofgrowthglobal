import { ACADEMIC_FACULTIES, getAcademicCourse } from './academicCatalogue.js';
import type { Faculty, FacultySchool } from './academicCatalogue.js';
import { normalizeCourseTitle } from './courseIdentity.js';
import type { Course } from '../types';

export const FACULTIES = ACADEMIC_FACULTIES;
export type { Faculty, FacultySchool } from './academicCatalogue.js';

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
  return SCHOOL_CATALOGUE.find(school => school.id === id || school.title === course.schoolName || school.aliases.includes(course.schoolName));
}

export function searchFacultyCatalogue(query: string): Faculty[] {
  const normalized = normalizeCourseTitle(query);
  if (!normalized) return FACULTIES;
  return FACULTIES.map(faculty => {
    const facultyMatches = [faculty.title, faculty.purpose, ...faculty.aliases].some(value => normalizeCourseTitle(value).includes(normalized));
    return {
      ...faculty,
      schools: facultyMatches ? faculty.schools : faculty.schools.filter(school =>
        [school.title, ...school.aliases, ...school.courses, ...school.notes,
          ...school.courses.flatMap(title => getAcademicCourse(title)?.aliases ?? [])]
          .some(value => normalizeCourseTitle(value).includes(normalized))
      ),
    };
  }).filter(faculty => faculty.schools.length > 0);
}
