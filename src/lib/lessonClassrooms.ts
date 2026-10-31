import assets from '../data/lessonClassrooms.json';
import type { LmsLesson } from '../types';

export type LessonClassroomAsset = { src: string; alt: string; lessonIds: string[] };
export const CLASSROOM_ASSETS: LessonClassroomAsset[] = assets;
const excludedTitles = /\b(test(?:s)?|project(?:s)?|conclusions?|assessment|final|completion|answer\s*key|quiz|examination|capstone|reflection\s+questions)\b/i;
const excludedBlocks = new Set(['objective_test', 'growth_project', 'assignment', 'implementation_challenge']);

export function isClassroomLesson(lesson: Pick<LmsLesson, 'title' | 'blocks'>): boolean {
  return !excludedTitles.test(lesson.title)
    && !lesson.blocks.some(block => excludedBlocks.has(block.type));
}

const byLesson = new Map(CLASSROOM_ASSETS.flatMap(asset => asset.lessonIds.map(id => [id, asset] as const)));

export function getLessonClassroom(courseId: string, lesson: LmsLesson): LessonClassroomAsset | null {
  if (courseId !== 'growth-foundation' || !isClassroomLesson(lesson)) return null;
  return byLesson.get(lesson.id) ?? null;
}
