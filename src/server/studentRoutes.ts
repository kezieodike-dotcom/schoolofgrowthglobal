import { Router, type RequestHandler } from 'express';
import { INTENSIVE_PATHWAYS } from '../data/intensiveCourses.js';
import type { LmsProgress } from '../types.js';
import { grantPaidIntensive, intensiveEntitlement, readPaidIntensive, validIntensivePayment, type IntensivePayment } from './intensiveAccess.js';
import { getIntensiveCourse } from './intensiveCourses.js';
import { intensiveStudentKey, learningKey } from './learningIdentity.js';
import { readLearningRecord } from './learningStorage.js';
import { paystack } from './paystackClient.js';
import { clearStudentSession, ensureStudentAccount, setStudentSession, studentPurchaseReferences, studentSessionId, type StudentProfile } from './studentAccounts.js';
import { complimentaryAccess, validGrant } from './complimentaryAccess.js';
import { getPublishedLeadershipCourse } from './leadershipCourseStore.js';
import { leadershipStudentIdentity } from './leadershipAccess.js';
import { paystackSecretKey } from './paystackEnv.js';
import { readPrivateProgress } from './learningWork.js';

const sameOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get('origin');
  if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ error: 'Please open your dashboard on this website.' });
  if (origin) {
    try { if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'Please open your dashboard on this website.' }); }
    catch { return res.status(403).json({ error: 'Invalid request origin.' }); }
  }
  next();
};

async function dashboardFor(id: string) {
  const profile = await readLearningRecord<StudentProfile>(`students/${id}/profile`);
  if (!profile || profile.id !== id || intensiveStudentKey(profile.email) !== id) return null;
  const references = await studentPurchaseReferences(id);
  const purchases = await Promise.all(references.map(readPaidIntensive));
  const grants = await complimentaryAccess.forEmail(profile.email);
  const entitlements = [...purchases.flatMap(record => record?.entitlement.email === profile.email && record.entitlement.plan === 'foundation-intensive' ? [intensiveEntitlement(record)] : []), ...grants.map(complimentaryAccess.entitlement)];
  const courses = await Promise.all(INTENSIVE_PATHWAYS.flatMap(pathway => {
    const matching = entitlements.filter(entry => entry.intensiveAccess?.courseIds.includes(pathway.id));
    const purchase = matching.find(entry => Date.parse(entry.coursesExpireAt) > Date.now()) ?? matching.at(-1);
    if (!purchase) return [];
    return [(async () => {
      const course = getIntensiveCourse(pathway.id);
      if (!course) throw new Error('Your intensive classroom is temporarily unavailable.');
      const lessons = course.modules.flatMap(module => module.lessons.map(lesson => ({ ...lesson, moduleId: module.id })));
      const progress = await readLearningRecord<LmsProgress>(`progress/${learningKey(`intensive-${id}:${pathway.id}`)}`);
      const completed = new Set(progress?.completedLessons ?? []);
      const completedLessons = lessons.filter(lesson => completed.has(lesson.id)).length;
      const next = lessons.find(lesson => !completed.has(lesson.id)) ?? lessons[0];
      return {
        id: pathway.id, title: pathway.title, totalLessons: lessons.length, completedLessons,
        progressPercentage: lessons.length ? Math.round(completedLessons / lessons.length * 100) : 0,
        expiresAt: purchase.coursesExpireAt, active: Date.parse(purchase.coursesExpireAt) > Date.now(),
        resumePath: `/lms/${pathway.id}/${next.moduleId}/${next.id}`,
      };
    })()];
  }));
  const complimentaryCourses = await Promise.all(grants.map(async grant => {
    const course = await getPublishedLeadershipCourse(grant.courseId);
    if (!course) throw new Error('Your course is temporarily unavailable.');
    const lessons = course.modules.flatMap(module => module.lessons.map(lesson => ({ ...lesson, moduleId: module.id })));
    const userId = leadershipStudentIdentity(profile.email, paystackSecretKey() ?? '');
    const progress = await readPrivateProgress(userId, course.id);
    const completed = new Set(progress?.completedLessons ?? []);
    const completedLessons = lessons.filter(lesson => completed.has(lesson.id)).length;
    const next = lessons.find(lesson => !completed.has(lesson.id)) ?? lessons[0];
    return { id: course.id, title: course.title, totalLessons: lessons.length, completedLessons,
      progressPercentage: Math.round(completedLessons / lessons.length * 100), expiresAt: grant.expiresAt,
      active: validGrant(grant), accessKind: 'complimentary' as const,
      resumePath: `/lms/${course.id}/${next.moduleId}/${next.id}` };
  }));
  return { profile: { name: profile.name, email: profile.email }, entitlements, courses: [...courses, ...complimentaryCourses] };
}

export function createStudentRouter() {
  const router = Router();
  const attempts = new Map<string, { count: number; until: number }>();
  router.use('/students', (_req, res, next) => { res.set('Cache-Control', 'no-store'); res.vary('Cookie'); res.set('Referrer-Policy', 'no-referrer'); next(); });

  router.get('/students/me', async (req, res) => {
    const id = studentSessionId(req);
    if (!id) return res.status(401).json({ error: 'Open your student dashboard using your payment reference.' });
    try {
      const dashboard = await dashboardFor(id);
      if (!dashboard) { clearStudentSession(req, res); return res.status(401).json({ error: 'Please restore your student dashboard.' }); }
      return res.json(dashboard);
    } catch { return res.status(503).json({ error: 'Your dashboard is temporarily unavailable. Please retry; you do not need to pay again.' }); }
  });

  router.post('/students/open', sameOrigin, async (req, res) => {
    const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[A-Za-z0-9._=-]{1,200}$/.test(reference)) return res.status(400).json({ error: 'Enter the payment reference from your receipt.' });
    try {
      let record = await readPaidIntensive(reference);
      if (!record) {
        const tx = await paystack<IntensivePayment>(`/transaction/verify/${encodeURIComponent(reference)}`);
        if (!validIntensivePayment(tx, reference) || (email && tx.customer?.email?.trim().toLowerCase() !== email)) return res.status(401).json({ error: 'We could not match this receipt to a paid intensive.' });
        await grantPaidIntensive(tx, reference);
        record = await readPaidIntensive(reference);
      }
      if (!record || record.entitlement.reference !== reference || record.entitlement.plan !== 'foundation-intensive' || (email && email !== record.entitlement.email)) return res.status(401).json({ error: 'We could not match this receipt to a paid intensive.' });
      const profile = await ensureStudentAccount(record.entitlement.email, reference);
      const dashboard = await dashboardFor(profile.id);
      if (!dashboard) throw new Error('Student dashboard unavailable.');
      setStudentSession(req, res, profile.id);
      return res.json(dashboard);
    } catch { return res.status(503).json({ error: 'We could not open your dashboard just now. Check your reference and retry. Do not pay again.' }); }
  });

  router.post('/students/logout', sameOrigin, (req, res) => { clearStudentSession(req, res); res.json({ ok: true }); });

  router.post('/students/activate', sameOrigin, async (req, res) => {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const ip = req.ip ?? 'unknown';
    const attempt = attempts.get(ip) ?? { count: 0, until: now + 10 * 60_000 };
    if (++attempt.count > 30) return res.status(429).json({ error: 'Please wait a few minutes before trying your invitation again.' });
    attempts.set(ip, attempt);
    const { code, email } = req.body ?? {};
    if (typeof code !== 'string' || typeof email !== 'string' || email.length > 254 || code.length > 150) return res.status(400).json({ error: 'Enter your invitation code and registered email.' });
    try {
      const grant = await complimentaryAccess.activate(code.trim(), email);
      if (!grant) return res.status(401).json({ error: 'This invitation does not match your email, has expired or is no longer active. Check the email supplied to the school or contact student support.' });
      const profile = await ensureStudentAccount(grant.email, undefined, grant.name);
      const dashboard = await dashboardFor(profile.id);
      if (!dashboard) throw new Error('Dashboard unavailable.');
      setStudentSession(req, res, profile.id);
      attempts.delete(ip);
      return res.json(dashboard);
    } catch { return res.status(503).json({ error: 'Your invitation could not be opened just now. Please retry or contact student support.' }); }
  });
  return router;
}
