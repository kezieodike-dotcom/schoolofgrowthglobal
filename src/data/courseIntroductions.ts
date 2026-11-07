import type { Course } from '../types';

export interface CourseCover {
  src: string;
  alt: string;
}

export const COURSE_COVERS: Record<string, CourseCover & { legacySrc: string }> = {
  'school-of-leadership-foundation': {
    src: '/scenes/leadership-meeting.jpg',
    alt: 'African professionals discussing leadership around a meeting table',
    legacySrc: '/scenes/leadership-meeting.jpg',
  },
  'exec-strategy-growth': {
    src: '/scenes/hero-team.jpg',
    alt: 'African business team reviewing growth strategy and performance charts',
    legacySrc: '/scenes/events-hero-graduation.jpg',
  },
  'resilient-leadership': {
    src: '/courses/resilient-leadership.jpg',
    alt: 'Nigerian team leader guiding colleagues through a contingency planning workshop',
    legacySrc: '/scenes/leadership-meeting.jpg',
  },
  'algorithmic-strategy': {
    src: '/courses/ai-governance.jpg',
    alt: 'Nigerian technology instructor teaching colleagues with a network diagram',
    legacySrc: '/people/w3-balogun.jpg',
  },
  'global-growth-masters': {
    src: '/scenes/coaching-collab.jpg',
    alt: 'African women professionals sharing ideas in a collaborative coaching session',
    legacySrc: '/scenes/coaching-collab.jpg',
  },
  'global-corporate-finance': {
    src: '/courses/corporate-finance.jpg',
    alt: 'Nigerian financial analysts reviewing business charts and valuation data',
    legacySrc: '/scenes/wealth-planning.jpg',
  },
  'venture-scaling-mastery': {
    src: '/scenes/bootcamp-team.jpg',
    alt: 'African entrepreneurs collaborating on a business plan in a bright office',
    legacySrc: '/scenes/bootcamp-team.jpg',
  },
  'personal-mastery-systems': {
    src: '/courses/self-discovery-productivity.jpg',
    alt: 'Nigerian professional reflecting and planning priorities in her notebook',
    legacySrc: '/people/w1-okafor.jpg',
  },
};

export function getCourseCover(course: Pick<Course, 'id' | 'title' | 'heroImage'>): CourseCover {
  const curated = COURSE_COVERS[course.id];
  // Refresh original catalogue imagery while preserving a later CMS upload.
  if (curated && (!course.heroImage || course.heroImage === curated.legacySrc || course.heroImage === curated.src)) {
    return curated;
  }
  return { src: course.heroImage, alt: course.title };
}

export const INTENSIVE_COURSES = [
  {
    id: 'self-discovery-productivity',
    title: 'Self Discovery & Productivity Course',
    description: 'A focused two-week pathway for understanding yourself, clarifying your direction and building practical productivity systems.',
    moduleTitles: ['Understanding Yourself', 'Purpose, Vision & Direction', 'Personal Productivity'],
    cover: {
      src: '/courses/self-discovery-productivity.jpg',
      alt: 'Nigerian professional mapping her priorities and personal goals in a sunlit workspace',
    },
  },
  {
    id: 'mindset-career-development',
    title: 'Mindset & Career Development',
    description: 'A focused two-week pathway for strengthening your growth mindset, people skills and practical career direction.',
    moduleTitles: ['Growth Mindset', 'Communication & People Skills', 'Career Development'],
    cover: {
      src: '/courses/mindset-career-development.jpg',
      alt: 'Nigerian career coach and a young professional discussing a career development plan',
    },
  },
] as const;
