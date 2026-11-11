export const INTENSIVE_PATHWAYS = [
  { id: 'self-discovery-productivity', title: 'Self Discovery & Productivity Course', moduleIds: ['module-1', 'module-3', 'module-4'] },
  { id: 'mindset-career-development', title: 'Mindset & Career Development', moduleIds: ['module-2', 'module-5', 'module-6'] },
] as const;

export type IntensiveCourseId = typeof INTENSIVE_PATHWAYS[number]['id'];
export function isIntensiveCourseId(id: unknown): id is IntensiveCourseId {
  return INTENSIVE_PATHWAYS.some(course => course.id === id);
}
export const intensiveHome = (id: IntensiveCourseId) => `/lms/${id}`;
