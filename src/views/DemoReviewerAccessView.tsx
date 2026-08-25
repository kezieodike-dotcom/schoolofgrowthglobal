import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Eye, Inbox, Loader2, LockKeyhole } from 'lucide-react';
import { MENTORS } from '../data/mockData';
import { clearEntitlements, grantEntitlement } from '../lib/useEnrollment';
import type { Entitlement } from '../lib/pricing';

interface DemoReviewerResponse {
  entitlement: Entitlement;
  mentorId: string;
  mentorToken: string;
  mentorTokenExpiresAt: string;
}

const MENTOR_PROFILE_KEY = 'sog.mentor.inbox.profile';
const MENTOR_TOKEN_KEY = 'sog.mentor.inbox.token';
const STUDENT_MENTORS_KEY = 'sog.mentors.v1';

export const DemoReviewerAccessView: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<DemoReviewerResponse | null>(null);

  const mentor = useMemo(
    () => MENTORS.find((item) => item.id === access?.mentorId) ?? MENTORS[0],
    [access?.mentorId]
  );

  useEffect(() => {
    fetch('/api/demo-reviewer/status')
      .then((res) => res.json())
      .then((body) => setEnabled(Boolean(body.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/demo-reviewer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => null)) as DemoReviewerResponse & {
        error?: string;
      };
      if (!res.ok || !body?.entitlement || !body?.mentorToken) {
        throw new Error(body?.error ?? 'Could not open reviewer access.');
      }

      clearEntitlements();
      grantEntitlement(body.entitlement);
      try {
        localStorage.setItem(STUDENT_MENTORS_KEY, JSON.stringify([body.mentorId]));
        sessionStorage.setItem(MENTOR_PROFILE_KEY, body.mentorId);
        sessionStorage.setItem(MENTOR_TOKEN_KEY, body.mentorToken);
      } catch {
        // The student entitlement still applies in memory for this session.
      }

      setAccess(body);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open reviewer access.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100dvh-96px)] bg-slate-950 text-white px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-200">
            <Eye className="h-3.5 w-3.5" />
            Temporary Review
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Preview the student and mentor experience.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              This private reviewer pass opens a short Elite demo entitlement and a mentor inbox session without exposing admin access or live payment records.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black text-white">Student portal</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Courses, mentorship, messages, certificates and AI coach.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-black text-white">Mentor inbox</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                The selected mentor workspace with student conversations.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="overflow-hidden rounded-lg border border-white/10 bg-white text-slate-950 shadow-2xl"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-black">Reviewer access</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Enter the temporary reviewer code created for this preview.
            </p>
          </div>

          <div className="space-y-4 p-5">
            {!access ? (
              <>
                <label className="block space-y-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    Reviewer code
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={enabled === false || busy}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition-colors focus:border-amber-500 disabled:opacity-50"
                  />
                </label>

                {enabled === false && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-700">
                    Demo reviewer access is switched off until DEMO_REVIEWER_PASSWORD is set.
                  </p>
                )}

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy || enabled === false}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-xs font-black text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  Open preview access
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-black text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Reviewer access is ready
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-emerald-700">
                    The browser is loaded with Elite demo access and paired with {mentor.name}.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Link
                    to={`/portal?tab=messages&mentor=${access.mentorId}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white transition-colors hover:bg-slate-800"
                  >
                    Student portal <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/mentor/inbox"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition-colors hover:border-amber-400 hover:text-amber-700"
                  >
                    Mentor inbox <Inbox className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Student access expires on {new Date(access.entitlement.coursesExpireAt).toLocaleDateString('en-NG')}. Remove DEMO_REVIEWER_PASSWORD from Vercel to stop issuing new reviewer sessions.
                </p>
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
