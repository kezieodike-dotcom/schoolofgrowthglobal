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
      const mergeUploadedModule = (filename: string, insertFirst = false) => {
        try {
          const modulePath = path.join(lmsDir, filename);
          const uploadedModule = JSON.parse(fs.readFileSync(modulePath, 'utf8').replace(/^\uFEFF/, '')) as LmsCourse['modules'][number];
          const moduleIndex = course.modules.findIndex((module) => module.id === uploadedModule.id);
          if (moduleIndex >= 0) course.modules[moduleIndex] = uploadedModule;
          else if (insertFirst) course.modules.unshift(uploadedModule);
          else course.modules.push(uploadedModule);
        } catch {
          // The bundled course remains available if an optional uploaded module is absent.
        }
      };

      mergeUploadedModule('growth-foundation-module-1.json', true);
      mergeUploadedModule('growth-foundation-module-2.json');
      mergeUploadedModule('growth-foundation-module-3.json');
      mergeUploadedModule('growth-foundation-module-4.json');
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
