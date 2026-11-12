import { Router, type RequestHandler } from 'express';
import { INTENSIVE_PATHWAYS } from '../data/intensiveCourses.js';
import type { LmsProgress } from '../types.js';
import { grantPaidIntensive, intensiveEntitlement, readPaidIntensive, validIntensivePayment, type IntensivePayment } from './intensiveAccess.js';
import { getIntensiveCourse } from './intensiveCourses.js';
import { intensiveStudentKey, learningKey } from './learningIdentity.js';
import { readLearningRecord } from './learningStorage.js';
import { paystack } from './paystackClient.js';
import { clearStudentSession, ensureStudentAccount, setStudentSession, studentPurchaseReferences, studentSessionId, type StudentProfile } from './studentAccounts.js';

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
  const entitlements = purchases.flatMap(record => record?.entitlement.email === profile.email && record.entitlement.plan === 'foundation-intensive' ? [intensiveEntitlement(record)] : []);
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
  return { profile: { name: profile.name, email: profile.email }, entitlements, courses };
}

export function createStudentRouter() {
  const router = Router();
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
  return router;
}
