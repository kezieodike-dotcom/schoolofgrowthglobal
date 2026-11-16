import { Router, type RequestHandler } from 'express';
import { isPaidCourseId } from '../data/paidCourseCatalogue.js';
import { complimentaryAccess } from './complimentaryAccess.js';
import { getPublishedLeadershipCourse } from './leadershipCourseStore.js';

export function createComplimentaryRouter(requireAdmin: RequestHandler) {
  const router = Router();
  router.use('/admin/complimentary', requireAdmin, (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/admin/complimentary', async (_req, res) => {
    try {
      const grants = await complimentaryAccess.list();
      return res.json({ grants: grants.map(record => ({ ...record, code: complimentaryAccess.codeFor(record) })) });
    } catch { return res.status(503).json({ error: 'Complimentary enrolments could not be loaded.' }); }
  });
  router.post('/admin/complimentary', async (req, res) => {
    const { courseId, learners } = req.body ?? {};
    if (!isPaidCourseId(courseId) || !Array.isArray(learners) || !learners.length || learners.length > 100 ||
        learners.some(row => !row || typeof row.name !== 'string' || !row.name.trim() || row.name.length > 120 ||
          typeof row.email !== 'string' || row.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) ||
        new Set(learners.map(row => row.email.trim().toLowerCase())).size !== learners.length) {
      return res.status(400).json({ error: 'Provide a published course and up to 100 unique learner names and valid email addresses.' });
    }
    try {
      if (!await getPublishedLeadershipCourse(courseId)) return res.status(409).json({ error: 'Publish the course lessons before granting access.' });
      const grants = [];
      // Idempotent per course/email; a retry after partial storage failure never extends access.
      for (let offset = 0; offset < learners.length; offset += 5) {
        const results = await Promise.allSettled(learners.slice(offset, offset + 5).map(learner => complimentaryAccess.grant(courseId, learner.name, learner.email)));
        if (results.some(result => result.status === 'rejected')) throw new Error('Invitation storage failed.');
        for (const result of results) if (result.status === 'fulfilled') grants.push(result.value);
      }
      return res.json({ grants });
    } catch { return res.status(503).json({ error: 'Some invitations may have been saved. Retry the same list safely; existing expiry dates will be preserved.' }); }
  });
  router.post('/admin/complimentary/:id/revoke', async (req, res) => {
    try { return await complimentaryAccess.revoke(req.params.id) ? res.json({ ok: true }) : res.status(404).json({ error: 'Invitation not found.' }); }
    catch { return res.status(503).json({ error: 'Access could not be revoked. Please retry.' }); }
  });
  return router;
}
