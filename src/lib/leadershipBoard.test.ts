import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { FACULTY_MEMBERS } from '../data/mockData.js';
import { mergeContent, type ContentRecord } from './content.js';
import { buildLeadershipBoard, type ApprovedExpert } from './leadershipBoard.js';
import { isSuspendedPublicProfile, normalizePublicProfile, NGOZI_PORTRAIT } from './publicProfiles.js';
import { toPublicMentorDirectory, toPublicTeamRecords } from '../server/publicMentors.js';
import type { MentorApplication } from '../server/mentorStore.js';

function application(id: string, status: MentorApplication['status'], applicationType: 'mentor' | 'consultant' = 'mentor'): MentorApplication {
  return { id, status, applicationType, name: `Expert ${id}`, title: 'Strategy Specialist', organization: 'Example Institute',
    email: 'private@example.com', location: 'Lagos, Nigeria', area: 'Business', experience: '12 years', specialisms: ['Business Strategy'],
    submittedAt: '2026-11-04T00:00:00Z', decidedAt: null, decisionNote: 'private admin decision',
    answers: { 'Professional background': 'Public professional background.', 'Profile photo': '/uploads/expert.jpg', 'Phone number': 'private-phone', 'Referral answer': 'private-referral' },
  };
}

test('Bright John is hidden by ID or name without deleting his stored faculty profile', () => {
  assert.ok(FACULTY_MEMBERS.some(member => member.id === 'f3'));
  for (const profile of [{ id: 'f3', name: 'Old name' }, { id: 'bright-john', name: 'Bright John' }, { id: 'imported-person', name: 'Dr. Bright John, PhD' }]) {
    assert.equal(isSuspendedPublicProfile(profile), true);
  }
  const staleRecord = { id: 'f3', kind: 'team', published: true, payload: FACULTY_MEMBERS.find(member => member.id === 'f3')! } as ContentRecord;
  assert.ok(!mergeContent(FACULTY_MEMBERS, [staleRecord], 'team').some(member => member.id === 'f3'));
  assert.ok(!buildLeadershipBoard(FACULTY_MEMBERS, []).some(member => member.name.includes('Bright John')));
});

test('saved advisor titles and the old marked portrait receive the requested public presentation', () => {
  const john = FACULTY_MEMBERS.find(member => member.id === 'john-akpan')!;
  assert.equal(normalizePublicProfile({ ...john, role: 'Senior Strategic Adviser to the Founder' }).role, 'Senior Strategic Advisor');
  const ngozi = FACULTY_MEMBERS.find(member => member.id === 'f2')!;
  assert.equal(normalizePublicProfile({ ...ngozi, avatar: '/people/w1-okafor.jpg' }).avatar, NGOZI_PORTRAIT);
  assert.equal(normalizePublicProfile({ ...ngozi, avatar: '/uploads/new-approved-portrait.jpg' }).avatar, '/uploads/new-approved-portrait.jpg');
  assert.ok(fs.existsSync(`public${NGOZI_PORTRAIT}`));
});

test('the public approval projection includes mentors and consultants, never pending, rejected or suspended people', () => {
  const suspended = { ...application('bright-application', 'approved'), name: 'Bright John' };
  const profiles = toPublicMentorDirectory([application('mentor-a', 'approved'), application('consultant-a', 'approved', 'consultant'), application('pending-a', 'pending'), application('rejected-a', 'rejected'), suspended]);
  assert.deepEqual(profiles.map(profile => profile.applicationType), ['mentor', 'consultant']);
  assert.equal(profiles[0].bio, 'Public professional background.');
  assert.doesNotMatch(JSON.stringify(profiles), /private@example|private-phone|private-referral|private admin|decisionNote|answers/);
});

test('every approved profile joins the board, with stable deduplication and no fabricated credentials', () => {
  const approved = toPublicMentorDirectory([application('mentor-a', 'approved'), application('consultant-a', 'approved', 'consultant')]);
  const board = buildLeadershipBoard(FACULTY_MEMBERS, [...approved, approved[0]]);
  assert.equal(board.length, 5);
  assert.equal(board.filter(member => member.expertTypes.includes('mentor')).length, 1);
  assert.equal(board.filter(member => member.expertTypes.includes('consultant')).length, 1);
  assert.deepEqual(board.find(member => member.name === 'Expert mentor-a')?.credentials, ['Business Strategy']);
  const sameName = { ...approved[0], id: 'another-approved-person' };
  assert.equal(buildLeadershipBoard([], [approved[0], sameName]).length, 2);
});

test('an approved existing team member appears once and loses their approved badge when withdrawn', () => {
  const expert = { ...toPublicMentorDirectory([application('ngozi-approved', 'approved')])[0], name: 'Dr. Ngozi Okafor' };
  const board = buildLeadershipBoard(FACULTY_MEMBERS, [expert]);
  assert.equal(board.length, 3);
  assert.equal(board.find(member => member.id === 'f2')?.expertTypes[0], 'mentor');
  assert.equal(buildLeadershipBoard(FACULTY_MEMBERS, []).find(member => member.id === 'f2')?.expertTypes.length, 0);
  const bright = { ...expert, id: 'new-bright-id', name: 'Bright John' } as ApprovedExpert;
  assert.equal(buildLeadershipBoard([], [bright]).length, 0);
});

test('raw mentor applications cannot leak through the public team catalogue', () => {
  const john = FACULTY_MEMBERS.find(member => member.id === 'john-akpan')!;
  const raw = [
    { id: 'john-akpan', kind: 'team', published: true, payload: john },
    { id: 'mentor-private', kind: 'team', published: false, payload: application('mentor-private', 'pending') },
    { id: 'f3', kind: 'team', published: true, payload: FACULTY_MEMBERS.find(member => member.id === 'f3') },
  ] as ContentRecord[];
  const records = toPublicTeamRecords(raw);
  assert.equal(records.find(record => record.id === 'f3')?.published, false);
  const advisor = records.find(record => record.id === 'john-akpan') as ContentRecord<'team'> | undefined;
  assert.equal(advisor?.payload.role, 'Senior Strategic Advisor');
  assert.ok(!records.some(record => record.id === 'mentor-private'));
  assert.doesNotMatch(JSON.stringify(records), /Bright John|private@example|private-phone/);
});
