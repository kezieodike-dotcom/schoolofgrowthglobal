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
    return JSON.parse(raw) as LmsCourse;
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
