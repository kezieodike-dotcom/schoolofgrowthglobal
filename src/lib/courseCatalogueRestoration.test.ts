import assert from 'node:assert/strict';
import { test } from 'node:test';
import original from '../data/legacyFacultyArchitecture.json';
import updated from '../data/facultyArchitecture.json';
import { FACULTIES, SCHOOL_CATALOGUE, searchFacultyCatalogue, getCourseSchool } from './facultyCatalogue.js';
import { COURSES } from '../data/mockData.js';
import { ACADEMIC_COURSES, getAcademicCourse } from './academicCatalogue.js';
import { courseIdentity, normalizeCourseTitle } from './courseIdentity.js';
import { LEADERSHIP_COURSES } from '../data/leadershipPricing.js';
import { PROFESSIONAL_COURSES } from '../data/professionalCourses.js';
import { mergeContent, findCourseById, type ContentRecord } from './content.js';

test('the restored directory includes the original Kingdom and humanitarian schools', () => {
  for (const name of ['School of Kingdom Leadership', 'School of Biblical Leadership', 'School of Ministry & Christian Leadership', 'School of Social Impact', 'School of Humanitarian Leadership', 'School of Relationships & Marriage']) {
    assert.ok(SCHOOL_CATALOGUE.some(school => school.title === name), name);
  }
  assert.ok(searchFacultyCatalogue('Nehemiah').length);
  assert.ok(searchFacultyCatalogue('Refugee').length);
});

test('every updated school retains its published ID, number and title', () => {
  for (const school of updated.faculties.flatMap(faculty => faculty.schools)) {
    const found = SCHOOL_CATALOGUE.find(entry => entry.id === school.id);
    assert.ok(found, school.id);
    assert.equal(found.number, school.number);
    assert.equal(found.title, school.title);
  }
});

test('Leadership is displayed as Faculty 1 while school identities and numbers remain permanent', () => {
  assert.equal(FACULTIES[0].number, 4);
  assert.equal(FACULTIES[0].displayNumber, 1);
  assert.match(FACULTIES[0].title, /LEADERSHIP/);
  assert.ok(FACULTIES[0].schools.some(school => school.id === 'leadership'));
  assert.deepEqual(FACULTIES.map(faculty => faculty.displayNumber), Array.from({ length: FACULTIES.length }, (_, index) => index + 1));
  assert.equal(SCHOOL_CATALOGUE.find(school => school.id === 'leadership')?.number,
    updated.faculties.flatMap(faculty => faculty.schools).find(school => school.id === 'leadership')?.number);
});

test('old school names and existing course links still resolve', () => {
  assert.ok(searchFacultyCatalogue('School of Purpose, Vision & Life Direction').length);
  assert.ok(searchFacultyCatalogue('School of Artificial Intelligence & Future Skills').length);
  for (const course of COURSES) assert.ok(getCourseSchool(course), course.id);
  assert.ok(COURSES.some(course => course.id === 'growth-foundation-cohort'));
  assert.ok(COURSES.some(course => course.id === 'school-of-leadership-foundation'));
  assert.deepEqual(new Set(COURSES.map(course => course.id)), new Set([
    'growth-foundation-cohort', 'school-of-leadership-foundation', 'growth-accelerator', 'executive-circle',
    'elite-council', 'exec-strategy-growth', 'resilient-leadership', 'algorithmic-strategy', 'global-growth-masters',
    'global-corporate-finance', 'venture-scaling-mastery', 'personal-mastery-systems',
  ]));
});

test('the archived source remains complete for future catalogue changes', () => {
  assert.equal(original.faculties.flatMap(faculty => faculty.schools).length, 62);
  assert.ok(FACULTIES.length >= updated.faculties.length);
});

test('all old and updated titles are represented exactly once, including renamed course aliases', () => {
  const directory = new Set(ACADEMIC_COURSES.flatMap(course => course.aliases.map(normalizeCourseTitle)));
  for (const faculty of original.faculties) for (const school of faculty.schools) {
    assert.ok(SCHOOL_CATALOGUE.some(entry => [entry.title, ...entry.aliases].some(title => normalizeCourseTitle(title) === normalizeCourseTitle(school.title))), school.title);
    const values = school as { subjects?: string[]; core_areas?: string[]; subjects_include?: string[] };
    for (const title of [...(values.subjects ?? []), ...(values.core_areas ?? []), ...(values.subjects_include ?? [])]) assert.ok(directory.has(normalizeCourseTitle(title)), title);
  }
  for (const school of updated.faculties.flatMap(faculty => faculty.schools)) for (const title of school.courses) assert.ok(directory.has(normalizeCourseTitle(title)), title);
  const displayed = SCHOOL_CATALOGUE.flatMap(school => school.courses);
  assert.equal(new Set(displayed.map(courseIdentity)).size, displayed.length);
  assert.equal(new Set(SCHOOL_CATALOGUE.map(school => school.id)).size, SCHOOL_CATALOGUE.length);
  assert.equal(new Set(SCHOOL_CATALOGUE.map(school => school.number)).size, SCHOOL_CATALOGUE.length);
  assert.equal(getAcademicCourse('Foundations of leadership')?.key, getAcademicCourse('Leadership Foundations and Principles.')?.key);
  assert.equal(getAcademicCourse('People management')?.key, getAcademicCourse('Managing people')?.key);
});

test('all existing individual purchases retain their permanent course links', () => {
  for (const course of [...LEADERSHIP_COURSES, ...PROFESSIONAL_COURSES]) {
    const entry = ACADEMIC_COURSES.find(entry => entry.courseId === course.id);
    assert.ok(entry?.href?.includes(course.id), course.id);
  }
});

test('duplicate published course names use newer details and keep both old links resolvable', () => {
  const original = COURSES.find(course => course.id === 'exec-strategy-growth')!;
  const duplicate = { ...original, id: 'updated-executive-course', title: original.title.toUpperCase().replace('&', 'and'), description: 'Updated published course description.' };
  const record = { id: duplicate.id, kind: 'course', payload: duplicate, published: true, createdAt: '', updatedAt: '' } satisfies ContentRecord<'course'>;
  const merged = mergeContent([original], [record], 'course');
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, original.id);
  assert.equal(merged[0].description, duplicate.description);
  assert.equal(findCourseById(merged, [record], duplicate.id)?.id, original.id);
  assert.equal(findCourseById(merged, [record], original.id)?.id, original.id);
  assert.equal(mergeContent([original], [{ ...record, id: original.id, published: false }], 'course').length, 0);
  const different = { ...duplicate, id: 'different-course', title: 'Executive Strategy for Nonprofit Organizations' };
  assert.equal(mergeContent([original, different], [], 'course').length, 2);
});
