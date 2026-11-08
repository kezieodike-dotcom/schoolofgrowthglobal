import React from 'react';

type LessonHeroAsset = {
  src: string;
  alt: string;
  eyebrow: string;
};

const LESSON_HEROES: Record<string, LessonHeroAsset> = {
  'module-1-lesson-3': {
    src: '/scenes/coaching-collab.jpg',
    alt: 'Learners working together during a focused coaching conversation',
    eyebrow: 'Self-awareness in practice',
  },
  'module-2-lesson-5': {
    src: '/scenes/hero-team.jpg',
    alt: 'A diverse team collaborating around a shared growth goal',
    eyebrow: 'The growth mindset',
  },
  'module-3-lesson-3': {
    src: '/scenes/leadership-meeting.jpg',
    alt: 'Leaders reviewing a plan together around a meeting table',
    eyebrow: 'Direction and purpose',
  },
  'module-4-lesson-6': {
    src: '/scenes/bootcamp-team.jpg',
    alt: 'A team learning together in a practical workshop setting',
    eyebrow: 'Building a productive system',
  },
  'module-5-lesson-8': {
    src: '/scenes/summit-audience.jpg',
    alt: 'An engaged audience listening during a leadership session',
    eyebrow: 'Communication that moves people',
  },
  'module-6-lesson-1-1': {
    src: '/scenes/hero-team.jpg',
    alt: 'Professionals collaborating on a shared career and growth plan',
    eyebrow: 'Designing your career direction',
  },
  'module-7-lesson-3-1': {
    src: '/scenes/finance-documents.jpg',
    alt: 'Financial documents and planning materials arranged for review',
    eyebrow: 'Financial intelligence',
  },
  'module-8-lesson-3-1': {
    src: '/research/sgg-research-and-insights.png',
    alt: 'A research and insights visual representing digital literacy and informed learning',
    eyebrow: 'Digital literacy',
  },
};

const isExcludedLesson = (title: string): boolean => {
  const normalized = title.toUpperCase();
  return normalized.includes('TEST')
    || normalized.includes('PROJECT')
    || normalized.includes('ASSESSMENT')
    || normalized.includes('FINAL')
    || normalized.includes('CONCLUSION')
    || normalized.includes('COMPLETION');
};

export const LessonHero: React.FC<{ lessonId: string; title: string }> = ({ lessonId, title }) => {
  const asset = LESSON_HEROES[lessonId];
  if (!asset || isExcludedLesson(title)) return null;

  return (
    <figure className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.55)]">
      <div className="relative aspect-[16/8] min-h-[190px] overflow-hidden sm:min-h-[250px]">
        <img
          src={asset.src}
          alt={asset.alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent px-5 pb-5 pt-16 sm:px-7 sm:pb-7">
          <figcaption className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            {asset.eyebrow}
          </figcaption>
        </div>
      </div>
    </figure>
  );
};
