import { Link, Navigate, useParams } from 'react-router-dom';
import { PROFESSIONAL_COURSES, PROFESSIONAL_FACULTY } from '../data/professionalCourses';
import { formatNaira, PLANS } from '../lib/pricing';
import { leadershipPurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { useLeadershipAvailability } from '../lib/useLeadershipAvailability';

export function ProfessionalCourseView() {
  const { courseId } = useParams();
  const course = PROFESSIONAL_COURSES.find(course => course.id === courseId);
  const { entitlements } = useEnrollment();
  const { available, outlines, loading, error } = useLeadershipAvailability(true, 'professional');
  if (!course) return <Navigate to="/courses" replace />;
  const purchase = leadershipPurchaseFor(entitlements, course.id);
  const active = purchase && Date.parse(purchase.leadershipAccess!.expiresAt) > Date.now();
  const target = purchase ? active ? available[course.id] : `/payment/callback?reference=${encodeURIComponent(purchase.reference)}` : available[course.id] ? `/checkout/${course.id}` : undefined;
  return <main className="bg-white text-slate-900">
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <Link to="/courses#professional-courses" className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-600 hover:text-amber-800">← All courses</Link>
      <figure className="mt-4 overflow-hidden rounded-2xl bg-slate-100"><img src={course.image} alt={course.alt} width={1200} height={800} fetchPriority="high" className="aspect-[3/2] w-full object-cover object-[center_30%] sm:aspect-[21/9]" /></figure>
    </div>
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-800">{course.category} <span aria-hidden="true">·</span> {course.code}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-4xl">{course.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{course.summary}</p>
        <p className="mt-4 text-sm text-slate-500">{PROFESSIONAL_FACULTY}</p>
        <section className="mt-10 border-t border-slate-200 pt-7">
          <h2 className="text-xl font-bold">What you will learn</h2>
          <ul className="mt-4 space-y-3">{course.outcomes.map(outcome => <li key={outcome} className="flex gap-3 text-sm leading-7 text-slate-700"><span aria-hidden="true" className="text-amber-700">✓</span>{outcome}</li>)}</ul>
        </section>
        <section className="mt-9 border-t border-slate-200 pt-7">
          <h2 className="text-xl font-bold">Who this course is for</h2><p className="mt-3 text-sm leading-7 text-slate-600">{course.audience}</p>
        </section>
        <section className="mt-9 border-t border-slate-200 pt-7" aria-labelledby="professional-outline-title">
          <h2 id="professional-outline-title" className="text-xl font-bold">Your course curriculum</h2>
          {loading ? <div className="mt-4 space-y-3" role="status" aria-label="Loading course outline">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg bg-slate-100 motion-safe:animate-pulse" />)}</div>
            : error ? <p role="status" className="mt-4 text-sm text-slate-600">The course outline is temporarily unavailable. Please reload this page.</p>
            : <ol className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{(outlines[course.id] ?? []).map((title,i) => <li key={title} className="flex gap-4 py-4 text-sm leading-6"><span className="font-mono font-bold text-amber-800">{String(i+1).padStart(2,'0')}</span><span>{title}</span></li>)}</ol>}
        </section>
      </div>
      <aside className="h-fit rounded-2xl border border-amber-200 bg-[#fff8eb] p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-800">One-time course fee</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{formatNaira(PLANS[course.id].amountKobo)}</p>
        <dl className="my-6 space-y-3 border-y border-amber-200 py-5 text-sm">
          {[['Course materials',course.hours],['Teaching modules',String(course.moduleCount)],['Delivery','Self-paced study'],['Knowledge check','15 questions'],['Practical application','Workplace exercises and project']].map(([term,value]) => <div key={term} className="flex justify-between gap-4"><dt className="text-slate-600">{term}</dt><dd className="max-w-[11rem] text-right font-semibold">{value}</dd></div>)}
        </dl>
        {target ? <Link to={target} className="flex min-h-12 items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 active:scale-[0.98]">{purchase ? active ? 'Open my course' : 'Restore paid access' : `Enrol for ${formatNaira(PLANS[course.id].amountKobo)}`}</Link>
          : <p role="status" className="rounded-lg bg-white p-4 text-sm leading-6 text-slate-600">{loading ? 'Checking enrolment availability…' : error ? 'We could not check enrolment. Please reload before paying.' : 'Enrolment is temporarily unavailable.'}</p>}
        <p className="mt-4 text-xs leading-6 text-slate-600">Course materials open after verified payment. Practical competency review and certification follow the requirements in the original course. Live facilitation is arranged separately.</p>
        <Link to="/portal" className="mt-5 inline-block text-sm font-semibold text-amber-900 underline underline-offset-4">Already paid? Restore your access</Link>
      </aside>
    </div>
  </main>;
}
