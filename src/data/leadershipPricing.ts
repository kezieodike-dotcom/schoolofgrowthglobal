// Individual NGN fees from the School of Leadership pricing recommendation.
const catalogue = [
  ['leadership-001', 'Foundations of Leadership', 15000],
  ['leadership-002', 'Self-Leadership', 15000],
  ['leadership-003', 'Leadership Character', 15000],
  ['leadership-004', 'Visionary Leadership', 20000],
  ['leadership-005', 'Strategic Leadership', 25000],
  ['leadership-006', 'People Management', 20000],
  ['leadership-007', 'Team Building', 15000],
  ['leadership-008', 'Delegation and Task Management', 15000],
  ['leadership-009', 'Leadership Influence', 20000],
  ['leadership-010', 'Decision-Making in Leadership', 20000],
  ['leadership-011', 'Problem-Solving and Critical Thinking', 20000],
  ['leadership-012', 'Conflict Management', 15000],
  ['leadership-013', 'Leadership Communication', 20000],
  ['leadership-014', 'Emotional Intelligence in Leadership', 15000],
  ['leadership-015', 'Organizational Leadership', 25000],
  ['leadership-016', 'Change Leadership', 20000],
  ['leadership-017', 'Crisis Leadership', 25000],
  ['leadership-018', 'Leadership Accountability', 15000],
  ['leadership-019', 'Leadership Legacy and Succession', 20000],
] as const;

export type LeadershipCourseId = typeof catalogue[number][0];

const categories = {
  15000: 'Leadership Foundation',
  20000: 'Professional Leadership',
  25000: 'Advanced Leadership',
} as const;

export const LEADERSHIP_COURSES = catalogue.map(([id, title, feeNaira]) => ({
  id, title, feeNaira, category: categories[feeNaira],
}));

const courseIds = new Set<string>(catalogue.map(([id]) => id));
export function isLeadershipCourseId(id: unknown): id is LeadershipCourseId {
  return typeof id === 'string' && courseIds.has(id);
}

export type LeadershipAvailability = Partial<Record<LeadershipCourseId, string>>;
export type LeadershipOutlines = Partial<Record<LeadershipCourseId, string[]>>;
