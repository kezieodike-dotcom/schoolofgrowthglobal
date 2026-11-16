import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Loader2 } from 'lucide-react';
import { activateCourseInvitation } from '../lib/useStudentAccount';

export function CourseInvitationView() {
  const navigate = useNavigate();
  const fromLink = useRef(new URLSearchParams(window.location.hash.slice(1)).get('code') ?? '');
  const [code, setCode] = useState(fromLink.current);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (window.location.hash) history.replaceState(null, '', window.location.pathname); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try { await activateCourseInvitation(code.trim(), email.trim()); navigate('/portal', { replace: true }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Please retry your invitation.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-[75vh] bg-[#fff8eb] px-4 py-12 sm:py-20">
    <div className="mx-auto max-w-lg rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-10">
      <GraduationCap className="h-10 w-10 text-amber-600" aria-hidden="true" />
      <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-700">Your course invitation</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-slate-950">Start learning with us.</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">Enter the email address registered with School of Growth Global to open your complimentary course. Your dashboard will show your course and access expiry date.</p>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block text-sm font-semibold text-slate-800">Registered email<input type="email" name="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-base" /></label>
        {!fromLink.current && <label className="block text-sm font-semibold text-slate-800">Personal invitation code<input name="code" autoComplete="off" required maxLength={150} value={code} onChange={e => setCode(e.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-base" /></label>}
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm leading-relaxed text-rose-800">{error}</p>}
        <button disabled={busy || !code.trim()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 disabled:opacity-50">{busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening your course</> : <>Open my course <ArrowRight className="h-4 w-4" /></>}</button>
      </form>
      <p className="mt-5 text-xs leading-relaxed text-slate-500">No payment is required. Access lasts for the period granted by the school; reopening your invitation does not extend it. Keep your personal link private.</p>
      <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-amber-800"><Link to="/portal" className="underline">My dashboard</Link><a href="mailto:support@schoolofgrowthglobal.com" className="underline">Get help</a></div>
    </div>
  </main>;
}
