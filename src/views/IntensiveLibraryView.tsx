import { Link } from 'react-router-dom';
import { INTENSIVE_COURSES } from '../data/courseIntroductions';
import { intensivePurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { PaymentAccessRestore } from '../components/PaymentAccessRestore';

export function IntensiveLibraryView() {
  const { entitlements } = useEnrollment();
  const courses = INTENSIVE_COURSES.flatMap(course => {
    const purchase = intensivePurchaseFor(entitlements, course.id);
    return purchase ? [{ course, purchase }] : [];
  });
  return <main className="mx-auto min-h-[60vh] max-w-5xl space-y-8 px-4 py-10 sm:px-6">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">My learning</p>
      <h1 className="mt-2 text-3xl font-serif font-bold text-slate-950">Your two-week intensives</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Your focused Growth Foundation pathways, with the original lessons and practical exercises. Open a course to start or continue learning.</p>
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {courses.map(({ course, purchase }) => {
        const active = Date.parse(purchase.intensiveAccess!.expiresAt) > Date.now();
        return <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <img src={course.cover.src} alt={course.cover.alt} className="aspect-[16/9] w-full object-cover" />
          <div className="space-y-4 p-6">
            <h2 className="text-xl font-bold text-slate-950">{course.title}</h2>
            <p className="text-sm leading-relaxed text-slate-600">{course.description}</p>
            <ul className="space-y-1 text-sm text-slate-700">{course.moduleTitles.map(title => <li key={title}>{title}</li>)}</ul>
            <p className="text-xs text-slate-500">{active ? 'Access until' : 'Access ended'} {new Date(purchase.intensiveAccess!.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {active ? <Link to={`/lms/${course.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950">Open classroom</Link>
              : <p className="text-sm text-slate-600">Your 14-day access has ended. <Link to="/contact" className="font-bold text-amber-800 underline">Contact student support</Link> if you need help.</p>}
          </div>
        </article>;
      })}
    </div>
    <PaymentAccessRestore />
    <Link to="/courses#single-courses" className="inline-block text-sm font-bold text-amber-800">Browse courses</Link>
  </main>;
}
