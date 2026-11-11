import { INTENSIVE_PATHWAYS, isIntensiveCourseId } from '../data/intensiveCourses.js';
import { getLmsCourse } from './lmsStore.js';
import type { LmsCourse } from '../types.js';

// Extract original uploaded modules at read time, so fixes to Foundation also
// reach the intensives without maintaining a second, divergent manuscript.
export function getIntensiveCourse(id: string): LmsCourse | null {
  if (!isIntensiveCourseId(id)) return null;
  const pathway = INTENSIVE_PATHWAYS.find(course => course.id === id)!;
  const foundation = getLmsCourse('growth-foundation');
  const modules = pathway.moduleIds.map(moduleId => foundation?.modules.find(module => module.id === moduleId));
  if (modules.some(module => !module?.lessons.length)) return null;
  return { id, title: pathway.title, modules: modules as LmsCourse['modules'] };
}
