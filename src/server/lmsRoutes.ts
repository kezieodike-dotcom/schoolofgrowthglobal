import express, { Request, Response } from 'express';
import {
  getLmsCourse,
  getStudentProgress,
  saveStudentProgress,
  getStudentSubmission,
  getAllStudentSubmissions,
  saveStudentSubmission,
} from './lmsStore.js';
import { LmsProgress, LmsSubmission } from '../types.js';
import { isLeadershipCourseId } from '../data/leadershipPricing.js';
import { getPublishedLeadershipCourse, leadershipAvailability, LEADERSHIP_STORAGE_UNAVAILABLE } from './leadershipCourseStore.js';
import { requireLeadershipAccess } from './leadershipAccess.js';
import { isIntensiveCourseId } from '../data/intensiveCourses.js';
import { getIntensiveCourse } from './intensiveCourses.js';
import { requireIntensiveAccess, learningKey } from './intensiveAccess.js';
import { readLearningRecord, writeLearningRecord } from './learningStorage.js';
import {
  MODULE_8_ASSESSMENT,
  getAssessmentResult,
  gradeModule8Assessment,
  isModule8Assessment,
} from './lmsAssessment.js';

export function createLmsRouter() {
  const router = express.Router();

  router.get('/lms/leadership/availability', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      res.json(await leadershipAvailability());
    } catch (error) {
      console.error('Leadership catalogue could not be loaded:', error);
      res.status(503).json({ error: LEADERSHIP_STORAGE_UNAVAILABLE });
    }
  });

  // Get full course data (content)
  router.get('/lms/courses/:id', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response) => {
    const id = req.params.id;
    if (isIntensiveCourseId(id)) {
      const course = getIntensiveCourse(id);
      return course ? res.json(course) : res.status(503).json({ error: 'The intensive classroom is temporarily unavailable.' });
    }
    if (isLeadershipCourseId(id)) {
      const course = await getPublishedLeadershipCourse(id).catch(() => undefined);
      if (course === undefined) return res.status(503).json({ error: LEADERSHIP_STORAGE_UNAVAILABLE });
      if (!course) return res.status(404).json({ error: 'Course not found' });
      return res.json({ id: course.id, title: course.title, modules: course.modules });
    }
    const course = getLmsCourse(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  });

  router.post('/lms/leadership/:courseId/quiz', requireLeadershipAccess, async (req: Request, res: Response) => {
    const course = await getPublishedLeadershipCourse(req.params.courseId).catch(() => undefined);
    if (course === undefined) return res.status(503).json({ error: LEADERSHIP_STORAGE_UNAVAILABLE });
    const key = course?.answerKey;
    if (!key) return res.status(404).json({ error: 'Assessment not found.' });
    const answers = req.body?.answers;
    const questions = Object.entries(key);
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) ||
      Object.keys(answers).length !== questions.length ||
      questions.some(([id]) => typeof answers[id] !== 'string' || !/^[A-D]$/.test(answers[id]))) {
      return res.status(400).json({ error: 'Select one answer for every question.' });
    }
    const score = questions.filter(([id, answer]) => answers[id] === answer).length;
    res.json({ score, total: questions.length, percentage: Math.round(score / questions.length * 100) });
  });

  router.get('/lms/assessment/:userId/:courseId/:moduleId/:lessonId', (req: Request, res: Response) => {
    const { userId, courseId, moduleId, lessonId } = req.params;
    if (!isModule8Assessment(courseId, moduleId, lessonId)) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.set('Cache-Control', 'no-store');
    res.json({
      courseId,
      moduleId,
      lessonId,
      passMark: MODULE_8_ASSESSMENT.passMark,
      questions: MODULE_8_ASSESSMENT.questions.map(({ id, prompt, options }) => ({ id, prompt, options })),
      result: getAssessmentResult(userId, courseId, moduleId, lessonId),
    });
  });

  router.post('/lms/assessment/submit', (req: Request, res: Response) => {
    res.set('Cache-Control', 'no-store');
    const { userId, courseId, moduleId, lessonId, answers } = req.body ?? {};
    if (!userId || !courseId || !moduleId || !lessonId || !answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Assessment submission is incomplete.' });
    }
    if (!isModule8Assessment(courseId, moduleId, lessonId)) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    const questionIds = new Set<string>(MODULE_8_ASSESSMENT.questions.map((question) => question.id));
    const submittedIds = Object.keys(answers);
    if (submittedIds.length !== questionIds.size || submittedIds.some((id) => !questionIds.has(id))) {
      return res.status(400).json({ error: 'Answer every question before submitting.' });
    }
    const validChoices = new Set(['A', 'B', 'C', 'D']);
    if (Object.values(answers).some((answer) => typeof answer !== 'string' || !validChoices.has(answer))) {
      return res.status(400).json({ error: 'One or more answers are invalid.' });
    }
    try {
      const result = gradeModule8Assessment(userId, courseId, moduleId, lessonId, answers as Record<string, string>);
      res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Assessment submission failed.';
      res.status(500).json({ error: message });
    }
  });

  // Get student progress for a course
  router.get('/lms/progress/:userId/:courseId', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response) => {
    if (res.locals.intensiveStudent) {
      try {
        const userId = res.locals.intensiveStudent;
        const courseId = req.params.courseId;
        return res.json(await readLearningRecord<LmsProgress>(`progress/${learningKey(`${userId}:${courseId}`)}`) ??
          { userId, courseId, completedLessons: [], progressPercentage: 0 });
      } catch { return res.status(503).json({ error: 'Your progress is temporarily unavailable.' }); }
    }
    const userId = res.locals.leadershipStudent ?? req.params.userId;
    const progress = getStudentProgress(userId, req.params.courseId);
    res.json(
      progress ?? {
        userId,
        courseId: req.params.courseId,
        completedLessons: [],
        progressPercentage: 0,
      }
    );
  });

  // Save student progress
  router.post('/lms/progress', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response, next) => {
    const progress: LmsProgress = req.body;
    if (!progress?.userId || !progress.courseId) {
      return res.status(400).json({ error: 'userId and courseId are required' });
    }
    if (res.locals.intensiveStudent) {
      const course = getIntensiveCourse(progress.courseId);
      if (!course || !Array.isArray(progress.completedLessons)) return res.status(400).json({ error: 'Invalid lesson progress.' });
      const lessons = new Set(course.modules.flatMap(module => module.lessons.map(lesson => lesson.id)));
      const completedLessons = [...new Set(progress.completedLessons.filter(id => lessons.has(id)))];
      const userId = res.locals.intensiveStudent;
      try {
        await writeLearningRecord(`progress/${learningKey(`${userId}:${course.id}`)}`, {
          userId, courseId: course.id, completedLessons, progressPercentage: Math.round(completedLessons.length / lessons.size * 100),
        });
        return res.json({ success: true });
      } catch { return res.status(503).json({ error: 'Your progress could not be saved. Please retry.' }); }
    }
    if (res.locals.leadershipStudent) {
      const course = await getPublishedLeadershipCourse(progress.courseId).catch(() => undefined);
      if (course === undefined) return res.status(503).json({ error: LEADERSHIP_STORAGE_UNAVAILABLE });
      if (!course) return res.status(404).json({ error: 'Course not found' });
      if (!Array.isArray(progress.completedLessons)) return res.status(400).json({ error: 'Invalid lesson progress' });
      const lessons = new Set(course.modules.flatMap(module => module.lessons.map(lesson => lesson.id)));
      progress.userId = res.locals.leadershipStudent;
      progress.completedLessons = [...new Set(progress.completedLessons.filter(id => lessons.has(id)))];
      progress.progressPercentage = Math.round(progress.completedLessons.length / lessons.size * 100);
    }
    try {
      saveStudentProgress(progress);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Get a single submission
  router.get('/lms/submission/:userId/:courseId/:blockId', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response) => {
    if (res.locals.intensiveStudent) {
      try {
        const key = learningKey(`${res.locals.intensiveStudent}:${req.params.courseId}`);
        const submissions = await readLearningRecord<LmsSubmission[]>(`submissions/${key}`) ?? [];
        return res.json(submissions.find(item => item.blockId === req.params.blockId) ?? null);
      } catch { return res.status(503).json({ error: 'Your work is temporarily unavailable.' }); }
    }
    const submission = getStudentSubmission(
      res.locals.leadershipStudent ?? req.params.userId,
      req.params.courseId,
      req.params.blockId
    );
    res.json(submission ?? null);
  });

  // Get all submissions for a user+course
  router.get('/lms/submissions/:userId/:courseId', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response) => {
    if (res.locals.intensiveStudent) {
      try { return res.json(await readLearningRecord<LmsSubmission[]>(`submissions/${learningKey(`${res.locals.intensiveStudent}:${req.params.courseId}`)}`) ?? []); }
      catch { return res.status(503).json({ error: 'Your work is temporarily unavailable.' }); }
    }
    const submissions = getAllStudentSubmissions(res.locals.leadershipStudent ?? req.params.userId, req.params.courseId);
    res.json(submissions);
  });

  // Save/update a submission
  router.post('/lms/submission', requireIntensiveAccess, requireLeadershipAccess, async (req: Request, res: Response) => {
    const submission: LmsSubmission = req.body;
    if (!submission?.userId || !submission.courseId || !submission.blockId) {
      return res.status(400).json({ error: 'userId, courseId, blockId are required' });
    }
    if (res.locals.intensiveStudent) {
      const course = getIntensiveCourse(submission.courseId);
      const module = course?.modules.find(module => module.id === submission.moduleId);
      if (!module?.lessons.some(lesson => lesson.blocks.some(block => block.id === submission.blockId))) return res.status(400).json({ error: 'This exercise does not belong to the intensive.' });
      const userId = res.locals.intensiveStudent;
      const key = `submissions/${learningKey(`${userId}:${submission.courseId}`)}`;
      try {
        const all = await readLearningRecord<LmsSubmission[]>(key) ?? [];
        await writeLearningRecord(key, [...all.filter(item => item.blockId !== submission.blockId), { ...submission, userId }]);
        return res.json({ success: true });
      } catch { return res.status(503).json({ error: 'Your work could not be saved. Please retry.' }); }
    }
    if (res.locals.leadershipStudent) submission.userId = res.locals.leadershipStudent;
    saveStudentSubmission(submission);
    res.json({ success: true });
  });

  return router;
}
