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
import { getPublishedLeadershipCourse, leadershipAvailability } from './leadershipCourseStore.js';
import { requireLeadershipAccess } from './leadershipAccess.js';
import {
  MODULE_8_ASSESSMENT,
  getAssessmentResult,
  gradeModule8Assessment,
  isModule8Assessment,
} from './lmsAssessment.js';

export function createLmsRouter() {
  const router = express.Router();

  router.get('/lms/leadership/availability', (_req, res) => {
    res.set('Cache-Control', 'no-store').json(leadershipAvailability());
  });

  // Get full course data (content)
  router.get('/lms/courses/:id', requireLeadershipAccess, (req: Request, res: Response) => {
    const id = req.params.id;
    const course = isLeadershipCourseId(id) ? getPublishedLeadershipCourse(id) : getLmsCourse(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (isLeadershipCourseId(id)) {
      return res.json({ id: course.id, title: course.title, modules: course.modules });
    }
    res.json(course);
  });

  router.post('/lms/leadership/:courseId/quiz', requireLeadershipAccess, (req: Request, res: Response) => {
    const key = getPublishedLeadershipCourse(req.params.courseId)?.answerKey;
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
  router.get('/lms/progress/:userId/:courseId', requireLeadershipAccess, (req: Request, res: Response) => {
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
  router.post('/lms/progress', requireLeadershipAccess, (req: Request, res: Response) => {
    const progress: LmsProgress = req.body;
    if (!progress?.userId || !progress.courseId) {
      return res.status(400).json({ error: 'userId and courseId are required' });
    }
    if (res.locals.leadershipStudent) {
      const course = getPublishedLeadershipCourse(progress.courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      if (!Array.isArray(progress.completedLessons)) return res.status(400).json({ error: 'Invalid lesson progress' });
      const lessons = new Set(course.modules.flatMap(module => module.lessons.map(lesson => lesson.id)));
      progress.userId = res.locals.leadershipStudent;
      progress.completedLessons = [...new Set(progress.completedLessons.filter(id => lessons.has(id)))];
      progress.progressPercentage = Math.round(progress.completedLessons.length / lessons.size * 100);
    }
    saveStudentProgress(progress);
    res.json({ success: true });
  });

  // Get a single submission
  router.get('/lms/submission/:userId/:courseId/:blockId', requireLeadershipAccess, (req: Request, res: Response) => {
    const submission = getStudentSubmission(
      res.locals.leadershipStudent ?? req.params.userId,
      req.params.courseId,
      req.params.blockId
    );
    res.json(submission ?? null);
  });

  // Get all submissions for a user+course
  router.get('/lms/submissions/:userId/:courseId', requireLeadershipAccess, (req: Request, res: Response) => {
    const submissions = getAllStudentSubmissions(res.locals.leadershipStudent ?? req.params.userId, req.params.courseId);
    res.json(submissions);
  });

  // Save/update a submission
  router.post('/lms/submission', requireLeadershipAccess, (req: Request, res: Response) => {
    const submission: LmsSubmission = req.body;
    if (!submission?.userId || !submission.courseId || !submission.blockId) {
      return res.status(400).json({ error: 'userId, courseId, blockId are required' });
    }
    if (res.locals.leadershipStudent) submission.userId = res.locals.leadershipStudent;
    saveStudentSubmission(submission);
    res.json({ success: true });
  });

  return router;
}
