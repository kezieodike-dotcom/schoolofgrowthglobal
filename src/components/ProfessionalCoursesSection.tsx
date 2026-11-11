import { Link } from 'react-router-dom';
import { PROFESSIONAL_COURSES, isProfessionalCourseId } from '../data/professionalCourses';
import { PLANS, formatNaira } from '../lib/pricing';
import { leadershipPurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { useLeadershipAvailability } from '../lib/useLeadershipAvailability';

export function ProfessionalCoursesSection({ ownedOnly = false }: { ownedOnly?: boolean }) {
  const { entitlements } = useEnrollment();
  const { available } = useLeadershipAvailability(entitlements.some(entry => isProfessionalCourseId(entry.plan)), 'professional');
  const courses = PROFESSIONAL_COURSES.filter(course => !ownedOnly || leadershipPurchaseFor(entitlements, course.id));
  if (!courses.length) return null;
  return <section id="professional-courses" aria-labelledby="professional-courses-heading" className="scroll-mt-24 border-y border-amber-200/70 bg-[#fff8eb] py-12 sm:py-16 lg:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Professional short courses</p>
          <h2 id="professional-courses-heading" className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{ownedOnly ? 'Your professional courses.' : 'Build the skills people notice at work.'}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Practical learning in customer service and workplace integrity. Original course materials, real workplace scenarios and a knowledge assessment in every course.</p>
        </div>
        {!ownedOnly && <div className="w-fit border-l-2 border-amber-500 pl-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">One-time fee per course</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{formatNaira(PLANS[PROFESSIONAL_COURSES[0].id].amountKobo)}</p>
          <p className="mt-1 text-xs text-slate-600">Choose the skill you want to build.</p>
        </div>}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {courses.map(course => {
          const purchase = leadershipPurchaseFor(entitlements, course.id);
          const active = purchase && Date.parse(purchase.leadershipAccess!.expiresAt) > Date.now();
          const target = purchase ? active ? available[course.id] ?? `/courses/${course.id}` : `/payment/callback?reference=${encodeURIComponent(purchase.reference)}` : `/courses/${course.id}`;
          return <article key={course.id} data-professional-course={course.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white">
            <Link to={`/courses/${course.id}`} aria-label={`Explore ${course.title}`} className="relative block overflow-hidden bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-amber-400">
              <img src={course.image} alt={course.alt} width={1200} height={800} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" />
            </Link>
            <div className="flex flex-1 flex-col p-5 sm:p-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-300">{course.category}</p>
              <p className="text-xs font-medium text-slate-400">{course.moduleCount} teaching modules <span aria-hidden="true">·</span> {course.hours}</p>
              <h3 className="mt-3 text-xl font-bold leading-snug sm:text-2xl"><Link to={`/courses/${course.id}`} className="hover:text-amber-200">{course.title}</Link></h3>
              <p className="mb-7 mt-3 text-sm leading-7 text-slate-300">{course.summary}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5">
                <div><p className="text-xl font-bold text-white">{formatNaira(PLANS[course.id].amountKobo)}</p><p className="mt-1 text-xs text-slate-400">{purchase ? 'Payment verified' : 'One-time course fee'}</p></div>
                <Link to={target} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300">{purchase ? active ? 'Open course' : 'Restore access' : 'Explore course'} <span aria-hidden="true" className="ml-3">↗</span></Link>
              </div>
            </div>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
