import { Router } from 'express';
import crypto from 'crypto';
import { createDemoReviewerAccess } from '../lib/demoReviewerAccess.js';
import { issueMentorToken } from './messageRoutes.js';

const reviewerPassword = () => process.env.DEMO_REVIEWER_PASSWORD?.trim();

function matchesSecret(supplied: string, configured: string): boolean {
  const a = crypto.createHash('sha256').update(supplied).digest();
  const b = crypto.createHash('sha256').update(configured).digest();
  return crypto.timingSafeEqual(a, b);
}

export function createDemoReviewerRouter(): Router {
  const router = Router();

  router.get('/demo-reviewer/status', (_req, res) => {
    res.json({ enabled: Boolean(reviewerPassword()) });
  });

  router.post('/demo-reviewer/login', (req, res) => {
    const configured = reviewerPassword();

    if (!configured) {
      return res.status(503).json({
        error:
          'Demo reviewer access is switched off. Set DEMO_REVIEWER_PASSWORD to enable it temporarily.',
      });
    }

    const supplied = String(req.body?.password ?? '');
    if (!matchesSecret(supplied, configured)) {
      return res.status(401).json({ error: 'That reviewer access code is not correct.' });
    }

    const access = createDemoReviewerAccess();
    const mentorSession = issueMentorToken(access.mentorId);

    res.json({
      ...access,
      mentorToken: mentorSession.token,
      mentorTokenExpiresAt: mentorSession.expiresAt,
    });
  });

  return router;
}
