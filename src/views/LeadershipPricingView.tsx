import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, ChevronDown, Search } from 'lucide-react';
import { LEADERSHIP_COURSES } from '../data/leadershipPricing';
import { leadershipCoursePreviews } from '../data/leadershipCoursePreviews';
import programme from '../data/leadershipProgramme.json';
import { PLANS, formatNaira } from '../lib/pricing';
import { leadershipPurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { useLeadershipAvailability } from '../lib/useLeadershipAvailability';

const categories = [...new Set(LEADERSHIP_COURSES.map(course => course.category))];
const detailSummary = 'cursor-pointer font-semibold marker:text-amber-700';

function ProgrammeOverview() {
  return (
    <details className="border-b border-slate-200 bg-white">
      <summary className={`mx-auto max-w-6xl px-5 py-5 text-sm text-slate-900 sm:px-8 ${detailSummary}`}>Read the programme overview</summary>
      <div className="mx-auto max-w-6xl space-y-8 px-5 pb-9 text-sm leading-relaxed text-slate-700 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-bold text-slate-950">Introduction to the School of Leadership</h2>
            {programme.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </section>
          <dl className="space-y-4 rounded-2xl bg-slate-50 p-5">
            {programme.programmeDetails.map(([label, description]) => (
              <div key={label}><dt className="font-bold text-slate-900">{label}</dt><dd className="mt-1">{description}</dd></div>
            ))}
          </dl>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <section><h2 className="mb-2 text-lg font-bold text-slate-900">Programme vision</h2><p>{programme.vision}</p></section>
          <section><h2 className="mb-2 text-lg font-bold text-slate-900">Programme mission</h2><p>{programme.mission}</p></section>
        </div>
        <details className="border-t border-slate-200 pt-4">
          <summary className={detailSummary}>Programme philosophy and learning outcomes</summary>
          <ul className="mt-4 list-disc space-y-2 pl-5">{programme.philosophy.map(item => <li key={item}>{item}</li>)}</ul>
          <h3 className="mt-5 font-bold text-slate-900">Learning outcomes</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-5">{programme.outcomes.map(item => <li key={item}>{item}</li>)}</ol>
        </details>
        <details className="border-t border-slate-200 pt-4">
          <summary className={detailSummary}>The 19-module programme pathway</summary>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {programme.stages.map(([stage, focus, range]) => (
              <li key={stage} className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-bold text-amber-800">{stage} · {range}</p>
                <p className="mt-1 font-semibold text-slate-900">{focus}</p>
              </li>
            ))}
          </ul>
          <ol className="mt-5 list-decimal space-y-2 pl-5 sm:columns-2">{programme.modules.map(item => <li key={item} className="break-inside-avoid">{item}</li>)}</ol>
        </details>
      </div>
    </details>
  );
}

export function LeadershipPricingView() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => LEADERSHIP_COURSES.find(course => course.id === searchParams.get('course'))?.title ?? '');
  const [category, setCategory] = useState('all');
  const { entitlements } = useEnrollment();
  const { available, outlines, loading, error } = useLeadershipAvailability();
  const courses = LEADERSHIP_COURSES.filter(course =>
    (category === 'all' || course.category === category) && course.title.toLowerCase().includes(query.trim().toLowerCase()));
  const ready = courses.filter(course => available[course.id]);
  const upcoming = courses.filter(course => !available[course.id]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:py-14">
          <div>
            <Link to="/courses" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-300 hover:text-amber-300"><ArrowLeft className="h-4 w-4" /> All courses</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-300">{programme.title}</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">School of Leadership</h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300">Develop the judgement to make better decisions, the skills to lead people, and the ability to turn strategy into results.</p>
            <a href="#leadership-courses" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300">
              Explore courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/15">
            <img src="/scenes/hero-team.jpg" alt="" className="aspect-[16/9] w-full object-cover lg:aspect-[4/3]" />
            <p className="absolute inset-x-0 bottom-0 bg-slate-950/90 px-4 py-3 text-xs font-semibold tracking-wide text-amber-200 sm:text-sm">{programme.institutionalMotto}</p>
          </div>
        </div>
      </header>
      <ProgrammeOverview />

      <section id="leadership-courses" aria-labelledby="leadership-courses-heading" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-9 sm:px-8 sm:py-12">
        <h2 id="leadership-courses-heading" className="font-serif text-3xl font-bold sm:text-4xl">Individual courses</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">Learn at your own pace. Each course has a one-time fee in Nigerian naira.</p>
        <div className="my-6 grid gap-3 sm:grid-cols-[minmax(0,20rem)_minmax(0,15rem)]">
          <label className="min-w-0 text-sm font-semibold">
            Search courses
            <span className="relative mt-1.5 block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search leadership courses" className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-normal" />
            </span>
          </label>
          <label className="min-w-0 text-sm font-semibold">
            Price category
            <select value={category} onChange={event => setCategory(event.target.value)} className="mt-1.5 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal">
              <option value="all">All price categories</option>
              {categories.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {error && <p role="status" className="mb-4 text-sm text-amber-800">Enrolment availability could not be checked. Prices are shown below.</p>}
        {loading && <p role="status" className="mb-4 text-sm text-slate-600">Checking course availability…</p>}
        {!loading && courses.length === 0 && <p role="status" className="rounded-xl border border-slate-200 bg-white p-7 text-sm text-slate-600">No courses match these filters.</p>}

        {ready.length > 0 && (
          <>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-amber-800">Open for enrolment <span className="ml-1 text-slate-500">({ready.length})</span></h3>
            <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ready.map(course => {
                const preview = leadershipCoursePreviews[course.id];
                const outline = outlines[course.id] ?? [];
                const purchase = leadershipPurchaseFor(entitlements, course.id);
                const canOpen = purchase && Date.parse(purchase.leadershipAccess!.expiresAt) > Date.now();
                const url = purchase
                  ? canOpen ? available[course.id]! : `/payment/callback?reference=${encodeURIComponent(purchase.reference)}`
                  : `/checkout/${course.id}`;
                const action = purchase ? canOpen ? 'Open course' : 'Restore access' : 'Enrol';
                return (
                  <li key={course.id} data-leadership-course={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {preview && <img src={preview.image} alt={preview.alt} loading="lazy" className="aspect-[16/9] w-full bg-slate-200 object-cover" />}
                    <div className="p-5">
                      <p className="text-xs font-semibold text-amber-800">{course.category}</p>
                      <h4 className="mt-2 font-serif text-xl font-bold leading-snug">{course.title}</h4>
                      {preview && <p className="mt-2 text-sm leading-relaxed text-slate-600">{preview.summary}</p>}
                      {outline.length > 0 && (
                        <details className="mt-4 text-sm">
                          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg bg-slate-50 p-3 font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
                            <BookOpen size={16} aria-hidden="true" /> View {outline.length} modules <ChevronDown size={16} className="ml-auto" aria-hidden="true" />
                          </summary>
                          <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600">{outline.map((module, index) => <li key={index}>{module}</li>)}</ol>
                        </details>
                      )}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <p className="text-lg font-bold tabular-nums">{formatNaira(PLANS[course.id].amountKobo)}<span className="block text-xs font-normal text-slate-600">One-time fee</span></p>
                        <Link to={url} aria-label={`${action}: ${course.title}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">
                          {action} <ArrowRight size={16} className="shrink-0" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {!loading && upcoming.length > 0 && (
          <section aria-labelledby="upcoming-leadership" className={ready.length > 0 ? 'mt-10' : ''}>
            <h3 id="upcoming-leadership" className="mb-3 text-lg font-bold">{error ? 'Course prices' : 'Coming soon'}</h3>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {upcoming.map(course => (
                <li key={course.id} data-leadership-course={course.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-sm">
                  <div><h4 className="font-semibold">{course.title}</h4><p className="mt-1 text-xs text-slate-600">{course.category}</p></div>
                  <p className="font-semibold tabular-nums">{formatNaira(PLANS[course.id].amountKobo)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="mt-6 flex items-start gap-2 text-sm text-slate-600"><BookOpen className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> Individual fees cover self-paced learning. Live classes, mentorship and coaching are separate.</p>
      </section>
    </main>
  );
}
