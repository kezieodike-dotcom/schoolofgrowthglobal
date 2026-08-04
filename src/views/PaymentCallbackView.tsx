import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { grantEntitlement } from '../lib/useEnrollment';
import { PLANS, formatNaira, type Entitlement } from '../lib/pricing';
import {
  CheckCircle2,
  Loader2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Receipt,
  Users,
  BookOpen,
} from 'lucide-react';

/**
 * Where Paystack returns the payer after checkout.
 *
 * The reference in the URL is treated as a claim, not proof. This page asks
 * our server to verify it with Paystack, and only a verified transaction
 * grants access. Typing this URL by hand gets you a failed verification.
 */

type State =
  | { phase: 'verifying' }
  | { phase: 'paid'; entitlement: Entitlement }
  | { phase: 'unpaid'; status: string }
  | { phase: 'error'; message: string };

export const PaymentCallbackView: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Paystack sends `reference`; `trxref` is its older alias and still appears.
  const reference = searchParams.get('reference') ?? searchParams.get('trxref');

  const [state, setState] = useState<State>({ phase: 'verifying' });

  /**
   * StrictMode mounts effects twice in development, and this effect must not
   * fire two verifications for one reference. The guard is a ref rather than
   * the usual cancelled-flag cleanup, and deliberately so: a flag would let
   * the first run start the request, the cleanup cancel it, and the second
   * run return early on the ref — leaving nothing to update the UI and the
   * page stuck on "Confirming your payment" forever.
   *
   * Nothing needs cancelling here anyway. Verification is a read, and a
   * setState after unmount is a no-op in React 18+.
   */
  const requested = useRef<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setState({
        phase: 'error',
        message: 'No payment reference was found in the link you followed.',
      });
      return;
    }
    if (requested.current === reference) return;
    requested.current = reference;

    (async () => {
      try {
        const res = await fetch(
          `/api/payments/verify/${encodeURIComponent(reference)}`
        );
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          setState({
            phase: 'error',
            message: body?.error ?? 'We could not confirm that payment.',
          });
          return;
        }

        if (!body?.paid) {
          setState({ phase: 'unpaid', status: body?.status ?? 'not completed' });
          return;
        }

        // The single point where access is granted anywhere in the app.
        grantEntitlement(body.entitlement);
        setState({ phase: 'paid', entitlement: body.entitlement });
      } catch {
        setState({
          phase: 'error',
          message:
            'We could not reach our server to confirm the payment. Check your connection and reload this page — your reference is safe.',
        });
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {state.phase === 'verifying' && (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
            <h1 className="text-lg font-serif font-bold text-slate-900">
              Confirming your payment
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We are checking this transaction with Paystack. This usually takes a
              second — please do not close this page.
            </p>
          </div>
        )}

        {state.phase === 'paid' && <PaidPanel entitlement={state.entitlement} />}

        {state.phase === 'unpaid' && (
          <div className="p-10 rounded-3xl bg-white border border-amber-300 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-amber-600" />
            </div>
            <h1 className="text-lg font-serif font-bold text-slate-900">
              Payment not completed
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Paystack reports this transaction as{' '}
              <span className="font-mono text-slate-700">{state.status}</span>. Nothing
              has been charged. You can try again with a different card or payment
              method.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/pricing"
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Try again
              </Link>
              <Link
                to="/contact"
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Contact admissions
              </Link>
            </div>
          </div>
        )}

        {state.phase === 'error' && (
          <div className="p-10 rounded-3xl bg-white border border-rose-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-rose-600" />
            </div>
            <h1 className="text-lg font-serif font-bold text-slate-900">
              We could not confirm this payment
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {state.message}
            </p>
            {reference && (
              <p className="text-[11px] font-mono text-slate-400 break-all">
                Reference: {reference}
              </p>
            )}
            <Link
              to="/contact"
              className="inline-block px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Contact admissions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const PaidPanel: React.FC<{ entitlement: Entitlement }> = ({ entitlement }) => {
  const plan = PLANS[entitlement.plan];
  const isMentorship = plan.kind === 'mentorship';

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-white border border-emerald-200 shadow-lg space-y-6">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            You're in.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your <strong className="text-slate-900">{plan.name}</strong>{' '}
            {isMentorship ? 'subscription' : 'package'} is active and everything it
            unlocks is open now.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-[11px] font-mono">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Amount paid</span>
          <span className="text-slate-900 font-bold">
            {formatNaira(plan.amountKobo)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Reference</span>
          <span className="text-slate-700 break-all text-right">
            {entitlement.reference}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            {isMentorship ? 'Renews' : 'Access until'}
          </span>
          <span className="text-slate-700">
            {new Date(
              isMentorship
                ? entitlement.mentorshipExpiresAt
                : entitlement.coursesExpireAt
            ).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={isMentorship ? '/mentors' : '/courses'}
          className="flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          {isMentorship ? (
            <>
              <Users className="w-4 h-4" /> Choose your mentor
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" /> Start learning
            </>
          )}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/portal"
          className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Receipt className="w-4 h-4" />
          My dashboard
        </Link>
      </div>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        A receipt is on its way to {entitlement.email || 'your email address'}. Keep
        your reference — quote it if you ever need to contact us about this payment.
      </p>
    </div>
  );
};
