import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BookMarked,
  Check,
  Download,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { BOOKS } from '../data/mockData';
import { calculateBookRevenueSplit } from '../lib/bookRevenue';
import { formatNaira } from '../lib/pricing';
import { useContentCollection } from '../lib/useContent';

interface PaymentConfig {
  configured: boolean;
  currency: string;
}

export const BookCheckoutView: React.FC = () => {
  const { bookId } = useParams();
  const content = useContentCollection('book', BOOKS);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let live = true;
    fetch('/api/payments/config')
      .then((res) => res.json())
      .then((body) => {
        if (live) setConfig(body);
      })
      .catch(() => {
        if (live) setConfig({ configured: false, currency: 'NGN' });
      });
    return () => {
      live = false;
    };
  }, []);

  const book = useMemo(
    () => content.items.find((item) => item.id === bookId),
    [bookId, content.items]
  );

  if (!content.loading && !book) return <Navigate to="/books" replace />;
  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const split = calculateBookRevenueSplit(book.priceKobo);
  const unavailable = config !== null && !config.configured;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          email: email.trim(),
          name: name.trim(),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.authorizationUrl) {
        throw new Error(body?.error ?? 'We could not start that payment.');
      }
      window.location.href = body.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to books
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono text-amber-600 font-bold uppercase tracking-wider">
                  Book checkout
                </span>
                <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
                  Buyer details
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  We use this email for your receipt and access instructions.
                </p>
              </div>

              {unavailable ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <p className="flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                    <Info className="w-4 h-4 shrink-0 mt-px" />
                    <span>
                      Card payments are not switched on yet. Contact the School of
                      Growth team to buy this material manually.
                    </span>
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                  >
                    Contact support
                  </Link>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <label className="block">
                    <span className="block text-slate-500 text-xs mb-1.5">Full name</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-slate-500 text-xs mb-1.5">Email address</span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      autoComplete="email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </label>

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
                        Pay {formatNaira(book.priceKobo)}
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Secured by Paystack
                  </p>
                </form>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-28 space-y-4">
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-5">
              <img
                src={book.coverImage || '/scenes/hero-team.jpg'}
                alt={book.title}
                className="h-56 w-full object-cover rounded-xl border border-slate-700"
              />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Order summary
                </span>
                <h2 className="text-xl font-serif font-bold mt-2">{book.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{book.subtitle}</p>
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                {book.highlights.slice(0, 4).map((feature) => (
                  <p key={feature} className="flex items-start gap-2.5 text-[11px] text-slate-300">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
                    <span className="leading-relaxed">{feature}</span>
                  </p>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px] font-mono">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Company 20%</span>
                  <span className="text-slate-200">{formatNaira(split.companyShareKobo)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Owner 80%</span>
                  <span className="text-slate-200">{formatNaira(split.ownerShareKobo)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Total due
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {book.format} by {book.authorName}
                  </p>
                </div>
                <span className="text-3xl font-serif font-bold text-amber-400">
                  {formatNaira(book.priceKobo)}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 font-serif flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-600" />
                After payment
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Paystack confirms the purchase, then the confirmation page shows the
                book access instructions and payment reference.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
