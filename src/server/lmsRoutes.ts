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

export function createLmsRouter() {
  const router = express.Router();

  // Get full course data (content)
  router.get('/lms/courses/:id', (req: Request, res: Response) => {
    const course = getLmsCourse(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  });

  // Get student progress for a course
  router.get('/lms/progress/:userId/:courseId', (req: Request, res: Response) => {
    const progress = getStudentProgress(req.params.userId, req.params.courseId);
    res.json(
      progress ?? {
        userId: req.params.userId,
        courseId: req.params.courseId,
        completedLessons: [],
        progressPercentage: 0,
      }
    );
  });

  // Save student progress
  router.post('/lms/progress', (req: Request, res: Response) => {
    const progress: LmsProgress = req.body;
    if (!progress.userId || !progress.courseId) {
      return res.status(400).json({ error: 'userId and courseId are required' });
    }
    saveStudentProgress(progress);
    res.json({ success: true });
  });

  // Get a single submission
  router.get('/lms/submission/:userId/:courseId/:blockId', (req: Request, res: Response) => {
    const submission = getStudentSubmission(
      req.params.userId,
      req.params.courseId,
      req.params.blockId
    );
    res.json(submission ?? null);
  });

  // Get all submissions for a user+course
  router.get('/lms/submissions/:userId/:courseId', (req: Request, res: Response) => {
    const submissions = getAllStudentSubmissions(req.params.userId, req.params.courseId);
    res.json(submissions);
  });

  // Save/update a submission
  router.post('/lms/submission', (req: Request, res: Response) => {
    const submission: LmsSubmission = req.body;
    if (!submission.userId || !submission.courseId || !submission.blockId) {
      return res.status(400).json({ error: 'userId, courseId, blockId are required' });
    }
    saveStudentSubmission(submission);
    res.json({ success: true });
  });

  return router;
}
