import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, GraduationCap, Loader2, LogOut, RefreshCw } from 'lucide-react';
import { INTENSIVE_COURSES } from '../data/courseIntroductions';
import { useEnrollment } from '../lib/useEnrollment';
import { logoutStudent, openStudentDashboard, refreshStudentAccount, useStudentAccount } from '../lib/useStudentAccount';
import { movePaidAccessToMainSite } from '../lib/siteOrigin';
import { ProfessionalCoursesSection } from '../components/ProfessionalCoursesSection';

export function StudentPortalView({ fallback }: { fallback?: ReactNode }) {
  const account = useStudentAccount();
  const enrollment = useEnrollment();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const receipt = params.get('reference') ?? params.get('trxref');
  const opened = useRef<string | null>(null);
  const [reference, setReference] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (receipt) {
      if (movePaidAccessToMainSite() || opened.current === receipt) return;
      opened.current = receipt;
      setReference(receipt);
      openStudentDashboard(receipt).then(() => setParams({}, { replace: true })).catch(() => {});
    } else if (account.phase === 'ready') {
      void refreshStudentAccount();
    }
    // Refresh progress on return from a classroom; opening a receipt runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  function submit(event: FormEvent) {
    event.preventDefault(); setFormError(null);
    if (!reference.trim()) { setFormError('Enter the payment reference from your receipt.'); return; }
    // Preserve receipt recovery for individual courses and full programmes too.
    navigate(`/payment/callback?reference=${encodeURIComponent(reference.trim())}`);
  }

  if (!receipt && !account.dashboard && account.phase !== 'loading' && enrollment.entitlements.some(entry => entry.plan !== 'foundation-intensive') && fallback) return <>{fallback}</>;

  if (account.phase === 'loading' && !account.dashboard) return <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center" aria-live="polite">
    <Loader2 className="h-7 w-7 animate-spin text-amber-600" aria-hidden="true" />
    <h1 className="text-2xl font-bold text-slate-950">Opening your student dashboard</h1>
    <p className="text-sm text-slate-600">Loading your verified courses and saved progress.</p>
  </main>;

  if (!account.dashboard) return <main className="mx-auto min-h-[60vh] max-w-xl px-4 py-12 sm:px-6">
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
      <GraduationCap className="h-9 w-9 text-amber-600" aria-hidden="true" />
      <h1 className="mt-5 text-3xl font-serif font-bold text-slate-950">Your student dashboard</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">Already paid for a two-week intensive? Enter the payment reference from your Paystack receipt to open your courses. Your dashboard stays available on this device for your next visit.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold text-slate-800">Payment reference<input required name="reference" autoComplete="off" maxLength={200} value={reference} onChange={event => setReference(event.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base" placeholder="Reference on your payment receipt" /></label>
        {(formError || account.error) && <p role="alert" className="text-sm text-rose-700">{formError || account.error}</p>}
        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950">Open my dashboard <ArrowRight className="h-4 w-4" /></button>
      </form>
      <p className="mt-5 text-sm text-slate-600">Need help with your receipt? <a href="mailto:support@schoolofgrowthglobal.com" className="font-semibold text-amber-800 underline">Contact student support</a>. Please do not pay again.</p>
    </div>
  </main>;

  const { profile, courses } = account.dashboard;
  const total = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const completed = courses.reduce((sum, course) => sum + course.completedLessons, 0);
  const overall = total ? Math.round(completed / total * 100) : 0;
  return <main className="min-h-[70vh] bg-slate-50 text-slate-950">
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Student dashboard · Growth Foundation</p>
          <h1 className="mt-3 text-3xl font-serif font-bold sm:text-4xl">{profile.name ? `Welcome, ${profile.name}` : 'Your learning starts here'}</h1>
          <p className="mt-3 break-all text-sm text-slate-600">{profile.email}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4 shrink-0" /> Verified enrolment · Two-week intensive</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void refreshStudentAccount()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button>
          <button disabled={signingOut} onClick={async () => { setSigningOut(true); setFormError(null); try { await logoutStudent(); } catch (error) { setFormError(error instanceof Error ? error.message : 'Please retry.'); } finally { setSigningOut(false); } }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </header>
      {(formError || account.error) && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{formError || account.error}</p>}
      <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white py-5">
        {[[String(courses.length), 'Your courses'], [String(completed), 'Lessons completed'], [`${overall}%`, 'Overall progress']].map(([value, label]) => <div key={label} className="px-3 sm:px-6"><dd className="text-2xl font-bold sm:text-3xl">{value}</dd><dt className="mt-1 text-xs text-slate-600 sm:text-sm">{label}</dt></div>)}
      </dl>
      <section aria-labelledby="my-courses-heading">
        <h2 id="my-courses-heading" className="text-2xl font-bold">My courses</h2>
        <p className="mt-2 text-sm text-slate-600">Your paid pathways are ready. Start a course or pick up from your next unfinished lesson.</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {courses.map(course => {
            const details = INTENSIVE_COURSES.find(item => item.id === course.id)!;
            return <article key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img src={details.cover.src} alt={details.cover.alt} className="aspect-[16/9] w-full object-cover" />
              <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold"><span className={`rounded-full px-3 py-1 ${course.active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{course.active ? 'Access active' : 'Access ended'}</span><span className="text-slate-500">3 modules · {course.totalLessons} lessons</span></div>
                <h3 className="text-xl font-bold">{course.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{details.description}</p>
                <ul className="space-y-1.5 text-sm text-slate-700">{details.moduleTitles.map(title => <li key={title} className="flex gap-2"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{title}</li>)}</ul>
                <div className="mt-auto pt-2"><div className="mb-2 flex justify-between gap-2 text-xs text-slate-600"><span>{course.completedLessons} of {course.totalLessons} lessons completed</span><span>{course.progressPercentage}%</span></div><progress aria-label={`${course.title} progress`} value={course.completedLessons} max={course.totalLessons} className="block h-2 w-full overflow-hidden rounded-full accent-amber-500" /></div>
                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-600"><Clock3 className="h-4 w-4 shrink-0" />{course.active ? 'Access until' : 'Access ended'} {new Date(course.expiresAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {course.active ? <Link to={course.resumePath} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 hover:bg-amber-400">{course.progressPercentage === 100 ? 'Review course' : course.completedLessons ? 'Continue learning' : 'Start learning'}<ArrowRight className="h-4 w-4" /></Link> : <a href="mailto:support@schoolofgrowthglobal.com" className="inline-flex min-h-11 items-center text-sm font-semibold text-amber-800 underline">Contact support about access</a>}
              </div>
            </article>;
          })}
        </div>
        {!courses.length && <p className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-sm">No intensive is linked to this account yet. <a href="mailto:support@schoolofgrowthglobal.com" className="underline">Contact student support</a> with your receipt.</p>}
      </section>
      <ProfessionalCoursesSection ownedOnly />
      <p className="text-sm text-slate-600">Need help learning? <a href="mailto:support@schoolofgrowthglobal.com" className="font-semibold text-amber-800 underline">Contact student support</a></p>
    </div>
  </main>;
}
