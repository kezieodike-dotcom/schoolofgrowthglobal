import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { PROFESSIONAL_COURSES, isProfessionalCourseId } from '../data/professionalCourses';
import { FEATURED_SHORT_COURSES } from '../data/featuredShortCourses';
import { PLANS, formatNaira } from '../lib/pricing';
import { leadershipPurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { useLeadershipAvailability } from '../lib/useLeadershipAvailability';

export function ProfessionalCoursesSection({ ownedOnly = false, includeLeadership = false }: { ownedOnly?: boolean; includeLeadership?: boolean }) {
  const { entitlements } = useEnrollment();
  const { available } = useLeadershipAvailability(entitlements.some(entry => isProfessionalCourseId(entry.plan)), 'professional');
  const leadership = useLeadershipAvailability(includeLeadership && !ownedOnly, 'leadership');
  const catalogue = includeLeadership && !ownedOnly ? FEATURED_SHORT_COURSES : PROFESSIONAL_COURSES.map(course => ({ ...course, kind: 'professional' as const, detailsUrl: `/courses/${course.id}` }));
  const courses = catalogue.filter(course => !ownedOnly || leadershipPurchaseFor(entitlements, course.id));
  if (!courses.length) return null;
  return <section id="professional-courses" aria-labelledby="professional-courses-heading" className="scroll-mt-24 border-y border-amber-200/70 bg-[#fff8eb] py-12 sm:py-16 lg:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {!ownedOnly && <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-100/70 px-4 py-4 sm:items-center sm:px-5" data-course-certificate>
        <Award className="mt-0.5 h-6 w-6 shrink-0 text-amber-800 sm:mt-0" aria-hidden="true" />
        <p className="text-sm leading-6 text-slate-800"><strong className="block font-bold sm:inline">Global certificate included.</strong>{' '}A School of Growth Global certificate will be issued to you upon successful course completion.</p>
      </div>}
      <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">{includeLeadership ? 'Leadership & professional short courses' : 'Professional short courses'}</p>
          <h2 id="professional-courses-heading" className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{ownedOnly ? 'Your professional courses.' : 'Build the skills people notice at work'}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{includeLeadership ? 'Lead with purpose. Build stronger customer relationships. Bring integrity to your workplace. Choose practical learning that helps you make a difference at work.' : 'Practical learning in customer service and workplace integrity. Original course materials, real workplace scenarios and a knowledge assessment in every course.'}</p>
        </div>
        {!ownedOnly && <div className="w-fit border-l-2 border-amber-500 pl-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{includeLeadership ? 'Courses from' : 'One-time fee per course'}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{formatNaira(PLANS[PROFESSIONAL_COURSES[0].id].amountKobo)}</p>
          <p className="mt-1 text-xs text-slate-600">{includeLeadership ? 'One-time fee. See each course for its price.' : 'Choose the skill you want to build.'}</p>
        </div>}
      </div>
      <div className={`grid gap-6 md:grid-cols-2 ${includeLeadership ? 'xl:grid-cols-3' : ''}`}>
        {courses.map(course => {
          const purchase = leadershipPurchaseFor(entitlements, course.id);
          const active = purchase && Date.parse(purchase.leadershipAccess!.expiresAt) > Date.now();
          const publishedPath = course.kind === 'leadership' ? leadership.available[course.id] : available[course.id];
          const target = purchase ? active ? publishedPath ?? course.detailsUrl : `/payment/callback?reference=${encodeURIComponent(purchase.reference)}` : course.kind === 'leadership' && publishedPath ? `/checkout/${course.id}` : course.detailsUrl;
          const moduleCount = course.moduleCount ?? leadership.outlines[course.id]?.length;
          const action = purchase ? active ? 'Open course' : 'Restore access' : course.kind === 'leadership' ? publishedPath ? 'Enrol on course' : 'View course details' : 'Explore course';
          return <article key={course.id} data-professional-course={course.id} data-featured-course={course.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white">
            <Link to={course.detailsUrl} aria-label={`Explore ${course.title}`} className="relative block overflow-hidden bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-400">
              <img src={course.image} alt={course.alt} width={1200} height={800} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" />
            </Link>
            <div className="flex flex-1 flex-col p-5 sm:p-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">{course.category}</p>
              <p className="text-xs font-medium text-slate-400">{moduleCount ? `${moduleCount} teaching modules` : 'School of Leadership'}{course.hours ? <> <span aria-hidden="true">·</span> {course.hours}</> : ' · Self-paced learning'}</p>
              <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl"><Link to={course.detailsUrl} className="hover:text-amber-200">{course.title}</Link></h3>
              <p className="mb-7 mt-3 text-sm leading-7 text-slate-300">{course.summary}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                <div><p className="text-xl font-bold text-white">{formatNaira(PLANS[course.id].amountKobo)}</p><p className="mt-1 text-xs text-slate-400">{purchase ? 'Payment verified' : 'One-time course fee'}</p></div>
                <Link to={target} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">{action} <span aria-hidden="true" className="ml-3">↗</span></Link>
              </div>
            </div>
          </article>;
        })}
      </div>
      {!ownedOnly && <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
        {includeLeadership && <Link to="/courses/leadership" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-amber-900 hover:underline">More leadership courses <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
        <Link to="/courses" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-amber-900 hover:underline">Explore all courses <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
      </div>}
    </div>
  </section>;
}
