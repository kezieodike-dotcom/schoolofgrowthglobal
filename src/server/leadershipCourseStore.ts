import { isLeadershipCourseId, LEADERSHIP_COURSES, type LeadershipAvailability, type LeadershipOutlines } from '../data/leadershipPricing.js';
import type { LmsCourse } from '../types.js';
import { getLmsCourse } from './lmsStore.js';

const validId = (id: unknown) => typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(id);
const nonempty = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

type LeadershipCourse = LmsCourse & { published: boolean; answerKey?: Record<string, string> };

export function isReadyLeadershipCourse(id: string, value: unknown): value is LmsCourse {
  if (!isLeadershipCourseId(id) || !value || typeof value !== 'object') return false;
  const course = value as LmsCourse & { published?: boolean };
  const moduleIds = new Set<string>();
  const lessonIds = new Set<string>();
  const blockIds = new Set<string>();
  return course.id === id && course.published === true && nonempty(course.title) &&
    Array.isArray(course.modules) && course.modules.length > 0 && course.modules.every(module => {
      if (!module || !validId(module.id) || moduleIds.has(module.id) || !nonempty(module.title)) return false;
      moduleIds.add(module.id);
      return Array.isArray(module.lessons) && module.lessons.length > 0 && module.lessons.every(lesson => {
        if (!lesson || !validId(lesson.id) || lessonIds.has(lesson.id) || !nonempty(lesson.title)) return false;
        lessonIds.add(lesson.id);
        return Array.isArray(lesson.blocks) && lesson.blocks.some(block => nonempty(block?.content)) && lesson.blocks.every(block => {
          if (!block || !validId(block.id) || blockIds.has(block.id) || !nonempty(block.type)) return false;
          blockIds.add(block.id);
          return true;
        });
      });
    });
}

export function getPublishedLeadershipCourse(id: string): LeadershipCourse | null {
  if (!isLeadershipCourseId(id)) return null;
  const course = getLmsCourse(id);
  return isReadyLeadershipCourse(id, course) ? course as LeadershipCourse : null;
}

export function leadershipAvailability() {
  const available: LeadershipAvailability = {};
  const outlines: LeadershipOutlines = {};
  for (const { id } of LEADERSHIP_COURSES) {
    const course = getPublishedLeadershipCourse(id);
    if (!course) continue;
    available[id] = `/lms/${id}/${course.modules[0].id}/${course.modules[0].lessons[0].id}`;
    outlines[id] = course.modules.filter(module => /^module-\d+$/.test(module.id)).map(module => module.title);
  }
  return { available, outlines };
}
