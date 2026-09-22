import { Router } from 'express';
import crypto from 'crypto';
import { createDemoReviewerAccess } from '../lib/demoReviewerAccess.js';
import { issueMentorToken } from './messageRoutes.js';

const LOCAL_DEMO_REVIEWER_PASSWORD = 'SGG-Demo-Student-2026!';

function reviewerPassword(): string | undefined {
  const configured = process.env.DEMO_REVIEWER_PASSWORD?.trim();
  if (configured) return configured;

  // Local previews should remain usable even when a developer has not copied
  // the optional reviewer setting into an environment file. Production still
  // requires an explicit secret before issuing demo access.
  return process.env.NODE_ENV === 'production' ? undefined : LOCAL_DEMO_REVIEWER_PASSWORD;
}

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
