import type { LmsProgress, LmsSubmission } from '../types.js';
import { learningKey } from './learningIdentity.js';
import { learningRecordKeys, readLearningRecord, writeLearningRecord } from './learningStorage.js';
import { getAllStudentSubmissions, getStudentProgress, getStudentSubmission } from './lmsStore.js';

export async function readPrivateProgress(userId: string, courseId: string) {
  return await readLearningRecord<LmsProgress>(`progress/${learningKey(`${userId}:${courseId}`)}`) ?? getStudentProgress(userId, courseId);
}
const courseKey = (userId: string, courseId: string) => learningKey(`${userId}:${courseId}`);
const answerPrefix = (userId: string, courseId: string) => `submission-answers/${courseKey(userId, courseId)}`;

export async function readPrivateSubmission(userId: string, courseId: string, blockId: string) {
  const current = await readLearningRecord<LmsSubmission>(`${answerPrefix(userId, courseId)}/${learningKey(blockId)}`);
  if (current) return current;
  const legacy = await readLearningRecord<LmsSubmission[]>(`submissions/${courseKey(userId, courseId)}`);
  return legacy?.find(row => row.blockId === blockId && row.userId === userId && row.courseId === courseId) ?? getStudentSubmission(userId, courseId, blockId);
}

export async function readPrivateSubmissions(userId: string, courseId: string) {
  const prefix = answerPrefix(userId, courseId);
  const [legacy, keys] = await Promise.all([
    readLearningRecord<LmsSubmission[]>(`submissions/${courseKey(userId, courseId)}`), learningRecordKeys(prefix),
  ]);
  const current = await Promise.all(keys.map(key => readLearningRecord<LmsSubmission>(`${prefix}/${key}`)));
  const merged = new Map<string, LmsSubmission>();
  for (const row of [...getAllStudentSubmissions(userId, courseId), ...(legacy ?? []), ...current]) {
    if (row && row.userId === userId && row.courseId === courseId) merged.set(row.blockId, row);
  }
  return [...merged.values()];
}

export async function savePrivateSubmission(submission: LmsSubmission) {
  // One object per exercise prevents concurrent answers from replacing one another.
  await writeLearningRecord(`${answerPrefix(submission.userId, submission.courseId)}/${learningKey(submission.blockId)}`, submission);
}
