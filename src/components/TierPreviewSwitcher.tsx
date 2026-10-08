import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment, grantEntitlement, clearEntitlements } from '../lib/useEnrollment';
import { PLANS, entitlementFor, type PlanCode } from '../lib/pricing';
import { FlaskConical, X, RotateCcw, ExternalLink } from 'lucide-react';

/**
 * Development-only control for viewing the portal as each package.
 *
 * The dashboard changes shape depending on what was paid for, and the only
 * way into a paid state is a real Paystack transaction - which makes the
 * thing impossible to look at while building it, and impossible to demo.
 *
 * This grants the same entitlement object the server would return on a
 * verified payment, so what you see is the real dashboard rather than a
 * mock-up of it.
 *
 * IT CANNOT SHIP. `import.meta.env.DEV` is replaced with a literal `false` at
 * build time, so this whole component is dead code that Rollup removes from
 * the production bundle - the switcher is not hidden in production, it is
 * absent. Verify with:  grep -c "Preview as" dist/assets/*.js   → 0
 */

const PREVIEW_PREFIX = 'preview-';

const PLAN_GROUPS: Array<{ label: string; kind: string }> = [
  { label: 'Course access', kind: 'package' },
  { label: 'Fast-track courses', kind: 'course-intensive' },
  { label: 'Mentorship', kind: 'mentorship' },
  { label: 'Consultation', kind: 'consultation' },
  { label: 'Course bundle', kind: 'course-bundle' },
];

const PREVIEW_PAGES = [
  { label: 'Mentor dashboard', path: '/mentor/inbox?demo=1' },
  { label: 'Mentor / Consultant enlistment', path: '/enlist' },
  { label: 'Mentor registration', path: '/register/mentor' },
  { label: 'Consultant registration', path: '/register/consultant' },
  { label: 'Student dashboard', path: '/portal' },
] as const;

export const TierPreviewSwitcher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { packages, hasMentorship } = useEnrollment();

  if (!import.meta.env.DEV) return null;

  const apply = (code: PlanCode) => {
    // Cleared first so previewing a lower package after a higher one actually
    // shows the lower package rather
    // than the union of both.
    clearEntitlements();
    grantEntitlement(
      entitlementFor(PLANS[code], {
        reference: `${PREVIEW_PREFIX}${code}`,
        email: 'preview@schoolofgrowth.local',
      })
    );
  };

  const current = packages[packages.length - 1] ?? null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[60] flex items-center gap-2 px-3 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold shadow-lg transition-colors"
        title="Development only - not in production builds"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Preview as…
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[60] w-64 rounded-2xl bg-slate-900 text-white shadow-2xl border border-violet-500/40 overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2.5 bg-violet-600">
        <span className="flex items-center gap-1.5 text-[11px] font-bold">
          <FlaskConical className="w-3.5 h-3.5" />
          Preview as
        </span>
        <button onClick={() => setOpen(false)} aria-label="Close">
          <X className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="max-h-[min(72vh,38rem)] overflow-y-auto p-3 space-y-3">
        {PLAN_GROUPS.map((group) => {
          const plans = (Object.keys(PLANS) as PlanCode[]).filter((code) => PLANS[code].kind === group.kind);
          if (!plans.length) return null;

          return (
            <section key={group.kind}>
              <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-300">{group.label}</p>
              <div className="space-y-1.5">
                {plans.map((code) => {
                  const plan = PLANS[code];
                  const active =
                    plan.kind === 'package' ? current === code : hasMentorship && !current;
                  return (
                    <button
                      key={code}
                      onClick={() => apply(code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-colors ${
                        active
                          ? 'bg-violet-500 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {plan.name}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section className="border-t border-slate-700 pt-3">
          <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-300">Pages</p>
          <div className="space-y-1.5">
            {PREVIEW_PAGES.map((page) => (
              <button
                key={page.path}
                onClick={() => navigate(page.path)}
                className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-left text-[11px] text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                {page.label}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={clearEntitlements}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[11px] transition-colors mt-2"
        >
          <RotateCcw className="w-3 h-3" />
          Not enrolled
        </button>
      </div>

      <p className="px-4 pb-3 text-[10px] text-slate-500 leading-relaxed">
        Dev only. Grants a real entitlement locally; stripped from production
        builds.
      </p>
    </div>
  );
};
