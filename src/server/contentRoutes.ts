import { Router } from 'express';
import type { BlogPost, Course, EventItem, FacultyMember, GrowthJob } from '../types.js';
import {
  CONTENT_LABEL,
  slugify,
  type ContentKind,
  type ContentPayloadMap,
} from '../lib/content.js';
import {
  contentStoreMode,
  deleteContentOverride,
  isContentWritable,
  listContent,
  setContentPublished,
  upsertContent,
} from './contentStore.js';
import { uploadImage } from './imageUpload.js';

const COURSE_LEVELS = ['Executive', 'Emerging Leaders', 'Senior Directorate', 'Frontier'] as const;
const EVENT_TYPES = ['Conference', 'Webinar', 'Seminar', 'Workshop', 'Bootcamp', 'Virtual Summit'] as const;
const EVENT_MODES = ['In-Person', 'Virtual', 'Hybrid'] as const;
const JOB_WORK_MODES = ['Remote', 'Hybrid', 'On-site'] as const;
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;

function isKind(value: string): value is ContentKind {
  return value === 'course' || value === 'event' || value === 'team' || value === 'job' || value === 'insight';
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => text(item)).filter(Boolean);
  return text(value)
    .split('\n')
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function ensureImage(value: unknown, fallback: string): string {
  const next = text(value);
  return next || fallback;
}

function sanitizeCourse(input: Record<string, unknown>): Course {
  const title = text(input.title);
  if (!title) throw new Error('Course title is required.');

  const schoolName = text(input.schoolName, 'School of Growth');
  const schoolId = text(input.schoolId, slugify(schoolName));
  const level = COURSE_LEVELS.includes(input.level as any)
    ? (input.level as Course['level'])
    : 'Executive';

  return {
    id: text(input.id, slugify(title)),
    title,
    schoolId,
    schoolName,
    duration: text(input.duration, '8 weeks'),
    level,
    format: text(input.format, 'Hybrid'),
    instructorName: text(input.instructorName, 'School of Growth Faculty'),
    instructorRole: text(input.instructorRole, 'Faculty Lead'),
    instructorAvatar: ensureImage(input.instructorAvatar, '/logo.jpg'),
    rating: Math.min(5, Math.max(0, numberValue(input.rating, 4.8))),
    reviewCount: Math.max(0, Math.round(numberValue(input.reviewCount, 0))),
    status: text(input.status, 'Open for enrolment'),
    heroImage: ensureImage(input.heroImage, '/scenes/hero-team.jpg'),
    description: text(input.description),
    outcomes: list(input.outcomes),
    modules: Array.isArray(input.modules) ? (input.modules as Course['modules']) : [],
    price: text(input.price, 'Included in package'),
    featured: Boolean(input.featured),
  };
}

function sanitizeEvent(input: Record<string, unknown>): EventItem {
  const title = text(input.title);
  if (!title) throw new Error('Event title is required.');

  const type = EVENT_TYPES.includes(input.type as any)
    ? (input.type as EventItem['type'])
    : 'Workshop';
  const mode = EVENT_MODES.includes(input.mode as any)
    ? (input.mode as EventItem['mode'])
    : 'Virtual';

  return {
    id: text(input.id, slugify(title)),
    title,
    type,
    date: text(input.date, 'Date to be announced'),
    time: text(input.time, '09:00 WAT'),
    location: text(input.location, mode === 'Virtual' ? 'Online' : 'Lagos, Nigeria'),
    mode,
    speaker: text(input.speaker, 'School of Growth Faculty'),
    description: text(input.description),
    price: text(input.price, 'Free'),
    seatsLeft: Math.max(0, Math.round(numberValue(input.seatsLeft, 50))),
    image: ensureImage(input.image, '/scenes/hero-team.jpg'),
  };
}

function sanitizeTeam(input: Record<string, unknown>): FacultyMember {
  const name = text(input.name);
  if (!name) throw new Error('Team member name is required.');

  return {
    id: text(input.id, slugify(name)),
    name,
    role: text(input.role, 'Leadership Team'),
    institution: text(input.institution, 'School of Growth Global'),
    bio: text(input.bio),
    credentials: list(input.credentials),
    avatar: ensureImage(input.avatar, '/logo.jpg'),
  };
}

function sanitizeJob(input: Record<string, unknown>): GrowthJob {
  const title = text(input.title);
  if (!title) throw new Error('Job title is required.');

  const workMode = JOB_WORK_MODES.includes(input.workMode as any)
    ? (input.workMode as GrowthJob['workMode'])
    : 'Hybrid';
  const type = JOB_TYPES.includes(input.type as any)
    ? (input.type as GrowthJob['type'])
    : 'Full-time';

  return {
    id: text(input.id, slugify(title)),
    title,
    organization: text(input.organization, 'School of Growth Global Partner Network'),
    location: text(input.location, 'Remote, Africa-friendly hours'),
    workMode,
    type,
    level: text(input.level, 'Professional'),
    salary: text(input.salary, 'Competitive compensation'),
    posted: text(input.posted, new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })),
    closes: text(input.closes, 'Open until filled'),
    summary: text(input.summary),
    requirements: list(input.requirements),
    tags: list(input.tags),
    image: ensureImage(input.image, '/scenes/bootcamp-team.jpg'),
    featured: Boolean(input.featured),
  };
}

function sanitizeInsight(input: Record<string, unknown>): BlogPost {
  const title = text(input.title);
  if (!title) throw new Error('Insight title is required.');

  return {
    id: text(input.id, slugify(title)),
    slug: text(input.slug, slugify(title)),
    title,
    category: text(input.category, 'Leadership'),
    excerpt: text(input.excerpt),
    author: text(input.author, 'School of Growth Faculty'),
    authorRole: text(input.authorRole, 'Faculty Contributor'),
    readTime: text(input.readTime, '5 min read'),
    date: text(input.date, new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })),
    image: ensureImage(input.image, '/scenes/leadership-meeting.jpg'),
    featured: Boolean(input.featured),
  };
}

function sanitize<K extends ContentKind>(
  kind: K,
  payload: Record<string, unknown>
): ContentPayloadMap[K] {
  if (kind === 'course') return sanitizeCourse(payload) as ContentPayloadMap[K];
  if (kind === 'event') return sanitizeEvent(payload) as ContentPayloadMap[K];
  if (kind === 'team') return sanitizeTeam(payload) as ContentPayloadMap[K];
  if (kind === 'job') return sanitizeJob(payload) as ContentPayloadMap[K];
  return sanitizeInsight(payload) as ContentPayloadMap[K];
}

export function createContentRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  router.get('/content/:kind', async (req, res) => {
    const kind = req.params.kind;
    if (!isKind(kind)) return res.status(404).json({ error: 'Unknown content type.' });

    try {
      res.json({ kind, records: await listContent(kind) });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : `Could not load ${CONTENT_LABEL[kind]}.`,
      });
    }
  });

  router.get('/admin/content/summary', requireAdmin, async (_req, res) => {
    try {
      const records = await listContent();
      res.json({
        writable: isContentWritable(),
        mode: contentStoreMode(),
        counts: {
          course: records.filter((row) => row.kind === 'course' && row.published).length,
          event: records.filter((row) => row.kind === 'event' && row.published).length,
          team: records.filter((row) => row.kind === 'team' && row.published).length,
          job: records.filter((row) => row.kind === 'job' && row.published).length,
          insight: records.filter((row) => row.kind === 'insight' && row.published).length,
        },
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Could not load content summary.',
      });
    }
  });

  router.get('/admin/content', requireAdmin, async (req, res) => {
    const kind = String(req.query.kind ?? '');
    if (!isKind(kind)) return res.status(400).json({ error: 'Unknown content type.' });

    try {
      res.json({
        kind,
        writable: isContentWritable(),
        mode: contentStoreMode(),
        records: await listContent(kind),
      });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : `Could not load ${CONTENT_LABEL[kind]}.`,
      });
    }
  });

  router.post('/admin/uploads/image', requireAdmin, async (req, res) => {
    try {
      const upload = await uploadImage({
        kind: req.body?.kind,
        fileName: String(req.body?.fileName ?? ''),
        mimeType: String(req.body?.mimeType ?? ''),
        data: String(req.body?.data ?? ''),
      });
      res.json(upload);
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : 'Could not upload that image.',
      });
    }
  });

  router.post('/admin/content/:kind', requireAdmin, async (req, res) => {
    const kind = req.params.kind;
    if (!isKind(kind)) return res.status(400).json({ error: 'Unknown content type.' });
    if (!isContentWritable()) {
      return res.status(503).json({ error: 'Content storage is not writable on this host.' });
    }

    try {
      const payload = sanitize(kind, req.body?.item ?? {});
      const record = await upsertContent(kind, payload, req.body?.published !== false);
      res.json({ record });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : `Could not save ${CONTENT_LABEL[kind]}.`,
      });
    }
  });

  router.post('/admin/content/:kind/:id/publish', requireAdmin, async (req, res) => {
    const kind = req.params.kind;
    if (!isKind(kind)) return res.status(400).json({ error: 'Unknown content type.' });
    if (!isContentWritable()) {
      return res.status(503).json({ error: 'Content storage is not writable on this host.' });
    }

    try {
      const fallback = req.body?.item ? sanitize(kind, req.body.item) : undefined;
      const record = await setContentPublished(kind, req.params.id, Boolean(req.body?.published), fallback as never);
      if (!record) return res.status(404).json({ error: 'That content item does not exist.' });
      res.json({ record });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : `Could not update ${CONTENT_LABEL[kind]}.`,
      });
    }
  });

  router.post('/admin/content/:kind/:id/delete', requireAdmin, async (req, res) => {
    const kind = req.params.kind;
    if (!isKind(kind)) return res.status(400).json({ error: 'Unknown content type.' });
    if (!isContentWritable()) {
      return res.status(503).json({ error: 'Content storage is not writable on this host.' });
    }

    await deleteContentOverride(kind, req.params.id);
    res.json({ ok: true });
  });

  return router;
}
