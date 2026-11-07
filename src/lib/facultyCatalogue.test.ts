import assert from 'node:assert/strict';
import { test } from 'node:test';
import architecture from '../data/facultyArchitecture.json';
import { COURSES, SCHOOLS } from '../data/mockData.js';

test('the approved academic structure has nine faculties, 28 schools and 256 course titles', () => {
  const faculties = architecture.faculties;
  const schools = faculties.flatMap(faculty => faculty.schools);
  assert.equal(faculties.length, 9);
  assert.equal(schools.length, 28);
  assert.deepEqual(faculties.map(faculty => faculty.number), Array.from({ length: 9 }, (_, index) => index + 1));
  assert.deepEqual(schools.map(school => school.number), Array.from({ length: 28 }, (_, index) => index + 1));
  assert.equal(schools.reduce((count, school) => count + school.courses.length, 0), 256);
  assert.equal(new Set(schools.map(school => school.id)).size, 28);
  assert.ok(faculties.every(faculty => faculty.purpose.length > 50));
});

test('specialised titles and the governance course-sequence note stay in their supplied schools', () => {
  const schools = architecture.faculties.flatMap(faculty => faculty.schools);
  assert.deepEqual(architecture.faculties.map(faculty => faculty.schools.reduce((count, school) => count + school.courses.length, 0)), [32, 40, 26, 40, 30, 20, 18, 26, 24]);
  assert.equal(schools[0].courses[0], 'Introduction to Artificial Intelligence and Its Applications.');
  assert.equal(schools[27].courses.at(-1), 'Innovation and Emerging Industry Development.');
  assert.equal(schools[24].courses.length, 10);
  assert.deepEqual(schools[24].notes, ['This school also provides a home for the Public Administration and Governance course sequence already being developed.']);
  assert.equal(SCHOOLS.length, 28);
});

test('search finds faculty names, purposes, schools and specialised course titles', async () => {
  const { searchFacultyCatalogue } = await import('./facultyCatalogue.js');
  assert.equal(searchFacultyCatalogue('  ').length, 9);
  assert.equal(searchFacultyCatalogue('DIGITAL TECHNOLOGY, ARTIFICIAL INTELLIGENCE').length, 1);
  assert.equal(searchFacultyCatalogue('modern economy')[0].schools.length, 4);
  const investments = searchFacultyCatalogue('mutual funds');
  assert.equal(investments.length, 1);
  assert.equal(investments[0].schools.length, 1);
  assert.equal(investments[0].schools[0].number, 10);
  assert.equal(searchFacultyCatalogue('no-such-school-xyz').length, 0);
});

test('legacy course school IDs still resolve to the approved school directory', async () => {
  const { getCourseSchool } = await import('./facultyCatalogue.js');
  const originalIds = COURSES.map(course => course.id);
  for (const course of COURSES) assert.ok(getCourseSchool(course), course.id);
  assert.equal(getCourseSchool({ schoolId: 'tech', schoolName: 'School of Tech & AI' })?.id, 'artificial-intelligence');
  assert.equal(getCourseSchool({ schoolId: 'leadership', schoolName: 'Leadership School' })?.title, 'School of Leadership');
  assert.equal(getCourseSchool({ schoolId: 'consulting-and-professional-services', schoolName: 'Consulting' })?.number, 18);
  assert.equal(getCourseSchool({ schoolId: 'unrecognised', schoolName: 'Not an approved school' }), undefined);
  assert.deepEqual(COURSES.map(course => course.id), originalIds);
});
