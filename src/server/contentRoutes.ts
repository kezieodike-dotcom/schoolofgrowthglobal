import { Router } from 'express';
import type { BlogPost, BookItem, Course, EventItem, FacultyMember, GrowthJob } from '../types.js';
import {
  CONTENT_LABEL,
  slugify,
  type ContentKind,
  type ContentPayloadMap,
} from '../lib/content.js';
import { toContentNotification } from '../lib/contentNotifications.js';
import {
  contentStoreMode,
  deleteContentOverride,
  isContentWritable,
  listContent,
  setContentPublished,
  upsertContent,
} from './contentStore.js';
import { uploadImage } from './imageUpload.js';

const COURSE_LEVELS = ['Executive', 'Emerging Leaders', 'Senior Directorate', 'Frontier', 'Elite'] as const;
const EVENT_TYPES = ['Conference', 'Webinar', 'Seminar', 'Workshop', 'Bootcamp', 'Virtual Summit'] as const;
const EVENT_MODES = ['In-Person', 'Virtual', 'Hybrid'] as const;
const JOB_WORK_MODES = ['Remote', 'Hybrid', 'On-site'] as const;
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'] as const;
const BOOK_FORMATS = ['PDF', 'Ebook', 'Workbook', 'Print'] as const;

function isKind(value: string): value is ContentKind {
  return value === 'course' || value === 'event' || value === 'team' || value === 'job' || value === 'insight' || value === 'book';
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

function optionalUrl(value: unknown, label: string): string | undefined {
  const next = text(value);
  if (!next) return undefined;

  try {
    const url = new URL(next);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid http or https link.`);
  }
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
    liveClassUrl: optionalUrl(input.liveClassUrl, 'Live class link'),
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
    liveClassUrl: optionalUrl(input.liveClassUrl, 'Live class link'),
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
    applicationEmail: text(input.applicationEmail),
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

export function sanitizeBook(input: Record<string, unknown>): BookItem {
  const title = text(input.title);
  if (!title) throw new Error('Book title is required.');

  const ownerType = input.ownerType === 'Mentor' ? 'Mentor' : 'Admin';
  const priceKobo = Math.max(100, Math.round(numberValue(input.priceKobo, 0)));
  const format = BOOK_FORMATS.includes(input.format as any)
    ? (input.format as BookItem['format'])
    : 'Ebook';

  return {
    id: text(input.id, slugify(title)),
    title,
    subtitle: text(input.subtitle),
    authorName: text(input.authorName, text(input.ownerName, 'School of Growth Global')),
    ownerName: text(input.ownerName, 'School of Growth Global'),
    ownerId: text(input.ownerId) || undefined,
    ownerType,
    ownerEmail: text(input.ownerEmail),
    category: text(input.category, 'Personal Growth'),
    description: text(input.description),
    highlights: list(input.highlights),
    coverImage: ensureImage(input.coverImage, '/scenes/hero-team.jpg'),
    priceKobo,
    format,
    pages: Math.max(0, Math.round(numberValue(input.pages, 0))),
    downloadUrl: optionalUrl(input.downloadUrl, 'Buyer download link'),
    sampleUrl: optionalUrl(input.sampleUrl, 'Sample / preview link'),
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
  if (kind === 'insight') return sanitizeInsight(payload) as ContentPayloadMap[K];
  return sanitizeBook(payload) as ContentPayloadMap[K];
}

export function createContentRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  router.get('/content/notifications', async (_req, res) => {
    try {
      const notifications = (await listContent())
        .map(toContentNotification)
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .slice(0, 20);

      res.json({ notifications });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Could not load notifications.',
      });
    }
  });

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
          book: records.filter((row) => row.kind === 'book' && row.published).length,
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
