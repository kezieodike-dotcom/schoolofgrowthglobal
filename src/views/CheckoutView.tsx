import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { MENTORS } from '../data/mockData';
import { PLANS, isPlanCode, formatNaira } from '../lib/pricing';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  CreditCard,
  Info,
} from 'lucide-react';

/**
 * Checkout for one plan.
 *
 * Collects the payer's name and email, asks our server to open a Paystack
 * transaction, then hands the browser to Paystack's hosted page. Card details
 * are entered there and never reach this app.
 *
 * The amount shown here is presentational. The charge is built server-side
 * from the same catalogue, so editing this page changes the display and
 * nothing else.
 */

interface PaymentConfig {
  configured: boolean;
  currency: string;
}

export const CheckoutView: React.FC = () => {
  const { plan: planParam } = useParams();
  const [searchParams] = useSearchParams();

  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Whether payments are live decides what this page may promise, so it is
  // asked once on mount rather than discovered when the button fails.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/payments/config')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig({ configured: false, currency: 'NGN' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isPlanCode(planParam)) return <Navigate to="/pricing" replace />;
  const plan = PLANS[planParam];

  // Carried from the mentor directory when checkout was started by picking a
  // specific mentor, so the summary confirms who the subscription is for.
  const mentorId = searchParams.get('mentor');
  const mentor = mentorId ? MENTORS.find((m) => m.id === mentorId) : undefined;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.code,
          email: email.trim(),
          name: name.trim(),
          mentorId: mentor?.id,
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.authorizationUrl) {
        throw new Error(
          body?.error ?? 'We could not start that payment. Please try again.'
        );
      }

      // Leaves the SPA entirely: Paystack's checkout is their page, not a
      // route of ours, so this is a full navigation rather than a router push.
      window.location.href = body.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  const unavailable = config !== null && !config.configured;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Payer details ──────────────────────────────────────── */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-amber-600 font-bold uppercase tracking-wider">
                  Step 1 of 2
                </span>
                <h1 className="text-2xl font-serif font-bold text-slate-900">
                  Your details
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use these to issue your receipt and open your access. Card details
                  are entered on Paystack's secure page, not here.
                </p>
              </div>

              {unavailable ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <p className="flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-px" />
                    <span>
                      Card payments are not switched on for this site yet. Our Paystack
                      account is being set up — until it is live, enrolment is handled by
                      our admissions team.
                    </span>
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Enrol through admissions
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="checkout-name"
                      className="block text-slate-500 text-xs mb-1.5"
                    >
                      Full name
                    </label>
                    <input
                      id="checkout-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                      placeholder="Chidi Okeke"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-email"
                      className="block text-slate-500 text-xs mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@organisation.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Your receipt and access confirmation go here.
                    </p>
                  </div>

                  {error && (
                    <p className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                      <span>{error}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || config === null}
                    className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening secure checkout...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pay {formatNaira(plan.amountKobo)}
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secured by Paystack · card, transfer, USSD
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ── Order summary ──────────────────────────────────────── */}
          <aside className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-28 space-y-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Order summary
              </span>

              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold">{plan.name}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{plan.tagline}</p>
              </div>

              {mentor && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/70 border border-slate-700">
                  <img
                    src={mentor.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Your mentor
                    </p>
                    <p className="text-xs font-bold truncate">{mentor.name}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                {plan.features.slice(0, 5).map((feature) => (
                  <p
                    key={feature}
                    className="flex items-start gap-2.5 text-[11px] text-slate-300"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
                    <span className="leading-relaxed">{feature}</span>
                  </p>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Total due
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{plan.billing}</p>
                </div>
                <span className="text-3xl font-serif font-bold text-amber-400">
                  {formatNaira(plan.amountKobo)}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 font-serif flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                What happens next
              </h4>
              <ol className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed list-decimal list-inside">
                <li>Paystack's secure page opens for payment.</li>
                <li>We confirm the payment with Paystack directly.</li>
                <li>Your access opens straight away and a receipt is emailed.</li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
