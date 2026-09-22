import { LmsCourse, LmsProgress, LmsSubmission } from '../types.js';
import { createJsonStore } from './jsonStore.js';
import fs from 'fs';
import path from 'path';

const lmsDir = path.join(process.cwd(), 'data', 'lms');

const progressStore = createJsonStore<LmsProgress>('lms_progress.json');
const submissionStore = createJsonStore<LmsSubmission>('lms_submissions.json');

export function getLmsCourse(id: string): LmsCourse | null {
  const filePath = path.join(lmsDir, `${id}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const course = JSON.parse(raw.replace(/^\uFEFF/, '')) as LmsCourse;
    if (id === 'growth-foundation') {
      const module1Path = path.join(lmsDir, 'growth-foundation-module-1.json');
      try {
        const module1 = JSON.parse(fs.readFileSync(module1Path, 'utf8').replace(/^\uFEFF/, '')) as LmsCourse['modules'][number];
        const module1Index = course.modules.findIndex((module) => module.id === module1.id);
        if (module1Index >= 0) course.modules[module1Index] = module1;
        else course.modules.unshift(module1);
      } catch {
        // The bundled course remains available if the uploaded source is absent.
      }

      const module2Path = path.join(lmsDir, 'growth-foundation-module-2.json');
      try {
        const module2 = JSON.parse(fs.readFileSync(module2Path, 'utf8').replace(/^\uFEFF/, '')) as LmsCourse['modules'][number];
        if (!course.modules.some((module) => module.id === module2.id)) {
          course.modules.push(module2);
        }
      } catch {
        // Module 1 remains available if an optional later module is absent.
      }
    }
    return course;
  } catch {
    return null;
  }
}

export function getStudentProgress(userId: string, courseId: string): LmsProgress | null {
  const all = progressStore.read();
  return all.find(p => p.userId === userId && p.courseId === courseId) ?? null;
}

export function saveStudentProgress(progress: LmsProgress): void {
  const all = progressStore.read();
  const idx = all.findIndex(p => p.userId === progress.userId && p.courseId === progress.courseId);
  if (idx >= 0) {
    all[idx] = progress;
  } else {
    all.push(progress);
  }
  progressStore.write(all);
}

export function getStudentSubmission(userId: string, courseId: string, blockId: string): LmsSubmission | null {
  const all = submissionStore.read();
  return all.find(s => s.userId === userId && s.courseId === courseId && s.blockId === blockId) ?? null;
}

export function getAllStudentSubmissions(userId: string, courseId: string): LmsSubmission[] {
  const all = submissionStore.read();
  return all.filter(s => s.userId === userId && s.courseId === courseId);
}

export function saveStudentSubmission(submission: LmsSubmission): void {
  const all = submissionStore.read();
  const idx = all.findIndex(
    s => s.userId === submission.userId && s.courseId === submission.courseId && s.blockId === submission.blockId
  );
  if (idx >= 0) {
    all[idx] = submission;
  } else {
    all.push(submission);
  }
  submissionStore.write(all);
}
