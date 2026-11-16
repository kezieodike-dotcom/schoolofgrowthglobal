import updated from '../data/facultyArchitecture.json' with { type: 'json' };
import previous from '../data/legacyFacultyArchitecture.json' with { type: 'json' };
import { LEADERSHIP_COURSES } from '../data/leadershipPricing.js';
import { PROFESSIONAL_COURSES } from '../data/professionalCourses.js';
import { courseIdentity, normalizeCourseTitle } from './courseIdentity.js';

export interface FacultySchool {
  number: number; id: string; title: string; notes: string[]; courses: string[]; aliases: string[];
}
export interface Faculty {
  number: number; displayNumber?: number; title: string; purpose: string; schools: FacultySchool[]; aliases: string[];
}
export interface AcademicCourse {
  key: string; title: string; schoolId: string; aliases: string[]; courseId?: string; href?: string;
}
interface PreviousSchool {
  number: number; title: string; notes?: string[]; subjects?: string[]; core_areas?: string[]; subjects_include?: string[]; designed_for?: string[];
}

// Existing approved school IDs and numbers are permanent. Only clear school
// renamings are mapped; distinct older schools retain their own directory entry.
const destinations: Record<number, [number, string?]> = {
  1: [6, 'personal-growth-and-development'], 2: [6], 3: [6],
  4: [6, 'emotional-intelligence-and-human-relations'], 5: [6], 6: [4, 'leadership'],
  7: [4], 8: [4, 'management-and-organizational-development'], 9: [7], 10: [4],
  11: [10], 12: [10], 13: [10], 14: [10], 15: [10], 16: [10],
  17: [10], 18: [10], 19: [10], 20: [10], 21: [10],
  22: [12, 'governance-and-public-administration'], 23: [12], 24: [12], 25: [12], 26: [12],
  27: [12, 'governance-and-public-administration'], 28: [12], 29: [12],
  30: [11], 31: [11], 32: [11], 33: [11],
  34: [2, 'entrepreneurship-and-business-creation'], 35: [2],
  36: [2, 'marketing-sales-and-business-development'], 37: [3],
  38: [3, 'investment-and-wealth-creation'], 39: [4], 40: [2], 41: [2],
  42: [5, 'career-development-and-employability'], 43: [5],
  44: [4, 'human-resources-and-talent-management'], 45: [4, 'project-and-programme-management'],
  46: [7, 'communication-and-public-speaking'], 47: [5], 48: [1],
  49: [1, 'artificial-intelligence'], 50: [7, 'media-branding-and-public-relations'],
  51: [13], 52: [13], 53: [13], 54: [13], 55: [13],
  56: [13, 'emotional-intelligence-and-human-relations'], 57: [8],
  58: [8, 'research-and-critical-thinking'], 59: [4], 60: [1], 61: [8], 62: [8],
};

function uniqueNotes(notes: string[]) {
  return [...new Set(notes.map(note => note.replace(/^\*|\*$/g, '').trim()).filter(Boolean))];
}

export function buildAcademicCatalogue() {
  const faculties: Faculty[] = updated.faculties.map(faculty => ({
    ...faculty, aliases: [], schools: faculty.schools.map(school => ({ ...school, courses: [], notes: [...school.notes], aliases: [] })),
  }));
  for (const [number, title, purpose] of [
    [10, previous.faculties[2].title, 'Develop biblical leadership, ministry, discipleship and stewardship skills for responsible service, spiritual formation and community impact.'],
    [11, previous.faculties[4].title, 'Develop the capabilities to serve communities, lead humanitarian programmes and build accountable nonprofit organizations.'],
    [12, previous.faculties[3].title, 'Develop public leaders, policymakers and administrators who strengthen governance, serve citizens and build accountable institutions.'],
    [13, previous.faculties[7].title, 'Strengthen relationships, families and human development through social intelligence, responsible leadership and support across life stages.'],
  ] as const) faculties.push({ number, title, purpose, schools: [], aliases: [] });

  // Restore these faculty headings without creating duplicate schools or
  // changing the IDs and numbers used by existing courses and enrolments.
  for (const [schoolId, facultyNumber] of [
    ['governance-and-public-administration', 12],
    ['emotional-intelligence-and-human-relations', 13],
  ] as const) {
    const currentFaculty = faculties.find(faculty => faculty.schools.some(school => school.id === schoolId))!;
    const school = currentFaculty.schools.find(school => school.id === schoolId)!;
    currentFaculty.schools = currentFaculty.schools.filter(school => school.id !== schoolId);
    faculties.find(faculty => faculty.number === facultyNumber)!.schools.push(school);
  }

  const schools = new Map(faculties.flatMap(faculty => faculty.schools.map(school => [school.id, school] as const)));
  const courses = new Map<string, AcademicCourse>();
  let nextSchool = Math.max(...Array.from(schools.values(), school => school.number)) + 1;

  function register(title: string, school: FacultySchool, alias = title, courseId?: string, href?: string) {
    const key = courseIdentity(title);
    const found = courses.get(key);
    if (found) {
      found.aliases = [...new Set([...found.aliases, title, alias])];
      if (courseId) { found.courseId = courseId; found.href = href; }
      return found;
    }
    const course: AcademicCourse = { key, title, schoolId: school.id, aliases: [...new Set([title, alias])], courseId, href };
    courses.set(key, course);
    school.courses.push(title);
    return course;
  }

  // Newer published names win when both lists name the same course.
  for (const faculty of updated.faculties) for (const school of faculty.schools) {
    for (const title of school.courses) register(title, schools.get(school.id)!);
  }
  for (const course of LEADERSHIP_COURSES) register(course.title, schools.get('leadership')!, course.title, course.id, `/courses/leadership?course=${course.id}`);

  for (const faculty of previous.faculties) for (const original of faculty.schools as PreviousSchool[]) {
    const [facultyNumber, existingId] = destinations[original.number];
    const targetFaculty = faculties.find(faculty => faculty.number === facultyNumber)!;
    const notes = [...(original.notes ?? []), ...(original.designed_for?.length ? [`Designed for: ${original.designed_for.join(', ')}.`] : [])];
    targetFaculty.aliases = [...new Set([...targetFaculty.aliases, faculty.title])];
    let school = existingId ? schools.get(existingId)! : undefined;
    if (!school) {
      const id = normalizeCourseTitle(original.title.replace(/^School of\s+/i, '')).replace(/ /g, '-');
      school = { id, number: nextSchool++, title: original.title, notes: uniqueNotes(notes), courses: [], aliases: [] };
      schools.set(id, school);
      targetFaculty.schools.push(school);
    } else {
      school.aliases = [...new Set([...school.aliases, original.title])];
      school.notes = uniqueNotes([...school.notes, ...notes]);
    }
    const titles = [...(original.subjects ?? []), ...(original.core_areas ?? []), ...(original.subjects_include ?? [])];
    for (const [index, title] of titles.entries()) {
      // These are the same original 19-module Leadership sequence already
      // uploaded under permanent payment IDs, not 19 new duplicate courses.
      const leadership = original.number === 6 ? LEADERSHIP_COURSES[index] : undefined;
      register(leadership?.title ?? title, school, title, leadership?.id,
        leadership ? `/courses/leadership?course=${leadership.id}` : undefined);
    }
  }

  for (const course of PROFESSIONAL_COURSES) register(course.title,
    schools.get(course.schoolId)!,
    course.title, course.id, `/courses/${course.id}`);

  // Leadership leads the public directory. Stable faculty identities keep the
  // legacy mappings intact; school and course numbers are never reassigned.
  const orderedFaculties = [...faculties.filter(faculty => faculty.number === 4), ...faculties.filter(faculty => faculty.number !== 4)]
    .map((faculty, index) => ({ ...faculty, displayNumber: index + 1 }));
  return { faculties: orderedFaculties, courses: [...courses.values()] };
}

const catalogue = buildAcademicCatalogue();
export const ACADEMIC_COURSES = catalogue.courses;
export const ACADEMIC_FACULTIES = catalogue.faculties;
const byTitle = new Map(ACADEMIC_COURSES.map(course => [courseIdentity(course.title), course]));
export function getAcademicCourse(title: string) { return byTitle.get(courseIdentity(title)); }
