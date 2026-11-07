import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import type { CourseCover } from '../data/courseIntroductions';

interface CourseAction {
  label: string;
  to: string;
}

interface CourseIntroductionCardProps {
  id: string;
  title: string;
  description: string;
  cover: CourseCover;
  eyebrow: string;
  duration: string;
  detail: string;
  primaryAction: CourseAction;
  secondaryAction?: CourseAction;
  accessNote?: string;
  children?: React.ReactNode;
}

export function CourseIntroductionCard({
  id, title, description, cover, eyebrow, duration, detail,
  primaryAction, secondaryAction, accessNote, children,
}: CourseIntroductionCardProps) {
  const titleId = `course-introduction-${id}`;
  return (
    <article aria-labelledby={titleId} data-course-introduction={id}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[3/2] w-full overflow-hidden bg-slate-100">
        <img src={cover.src} alt={cover.alt} loading="lazy" decoding="async"
          width={1200} height={800} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="mb-2 text-xs font-semibold text-amber-800">{eyebrow}</p>
        <h3 id={titleId} className="text-xl font-bold leading-snug text-slate-950 [overflow-wrap:anywhere]">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        {children}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 shrink-0" aria-hidden="true" />{duration}</span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{detail}</span>
          </div>
          {accessNote && <p className="mt-2 text-xs leading-relaxed text-slate-500">{accessNote}</p>}
          <div className={`mt-4 grid gap-2 ${secondaryAction ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {secondaryAction && <Link to={secondaryAction.to} aria-label={`${secondaryAction.label}: ${title}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-3 py-2.5 text-center text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
              {secondaryAction.label}
            </Link>}
            <Link to={primaryAction.to} aria-label={`${primaryAction.label}: ${title}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-amber-500 px-3 py-2.5 text-center text-xs sm:text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
              {primaryAction.label}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
