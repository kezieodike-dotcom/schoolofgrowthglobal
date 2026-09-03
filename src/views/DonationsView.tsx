import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  HeartHandshake,
  Info,
  Loader2,
  ShieldCheck,
  Sprout,
  Users,
} from 'lucide-react';
import { CountryPhoneField } from '../components/CountryPhoneField';
import {
  DONATION_ALLOCATION_OPTION,
  DONATION_FUNDS,
  SUGGESTED_DONATION_AMOUNTS_KOBO,
  findDonationFund,
  formatDonationAmount,
  minimumDonationKobo,
} from '../lib/donations';
import { formatNaira } from '../lib/pricing';

interface PaymentConfig {
  configured: boolean;
  currency: string;
}

type DonationMode = 'specific' | 'where-needed';

export const DonationsView: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [mode, setMode] = useState<DonationMode>('specific');
  const [fundId, setFundId] = useState(DONATION_FUNDS[0].id);
  const [amount, setAmount] = useState('10000');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const selectedFund = useMemo(
    () => findDonationFund(mode === 'where-needed' ? DONATION_ALLOCATION_OPTION.id : fundId),
    [fundId, mode]
  );

  const unavailable = config !== null && !config.configured;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError('Please read and agree to the Donation Terms & Conditions before continuing.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationFund: selectedFund.id,
          donationAmount: amount.trim(),
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
          donorNote: note.trim(),
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.authorizationUrl) {
        throw new Error(body?.error ?? 'We could not start that donation. Please try again.');
      }

      window.location.href = body.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-y-0 right-0 hidden lg:block w-[44%]">
          <img
            src="/scenes/coaching-collab.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-700">
              <HeartHandshake className="h-3.5 w-3.5" />
              DONATE
              <ArrowRight className="h-3.5 w-3.5" />
              CHOOSE YOUR IMPACT
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight text-slate-950">
                Give toward growth that reaches people who need it.
              </h1>
              <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600">
                Your donation helps make growth, education, mentorship, welfare,
                leadership development and life transformation more accessible to
                individuals, students, children, teenagers and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 space-y-5">
            {DONATION_FUNDS.map((fund, index) => (
              <button
                key={fund.id}
                type="button"
                onClick={() => {
                  setMode('specific');
                  setFundId(fund.id);
                }}
                className={`w-full text-left rounded-3xl border p-5 sm:p-6 transition-all ${
                  mode === 'specific' && selectedFund.id === fund.id
                    ? 'border-amber-400 bg-amber-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-amber-300 font-mono text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-950">
                        {fund.name}
                      </h2>
                      {mode === 'specific' && selectedFund.id === fund.id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-black text-slate-950">
                          <Check className="h-3.5 w-3.5" />
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-bold text-amber-700">{fund.headline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {fund.description}
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {fund.supports.map((item) => (
                        <p key={item} className="flex items-start gap-2 text-xs text-slate-500">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span>{item}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setMode('where-needed')}
              className={`w-full text-left rounded-3xl border p-5 sm:p-6 transition-all ${
                mode === 'where-needed'
                  ? 'border-slate-950 bg-slate-950 text-white shadow-lg'
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    mode === 'where-needed'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Sprout className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold">
                    Let School of Growth Global Allocate My Donation Where It Is Most Needed
                  </h2>
                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      mode === 'where-needed' ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Give the team permission to direct your support toward the most
                    timely need across scholarships, learning access, future leaders,
                    outreach or mission support.
                  </p>
                </div>
              </div>
            </button>
          </section>

          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm space-y-6">
              <div className="space-y-2">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                  Donate to a Specific Fund
                </p>
                <h2 className="text-2xl font-serif font-bold text-slate-950">
                  Donation details
                </h2>
                <p className="text-sm leading-relaxed text-slate-500">
                  Currently selected: <strong className="text-slate-900">{selectedFund.name}</strong>
                </p>
              </div>

              {unavailable ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                  <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Online donations are not switched on yet. Please contact
                      infoschoolofgrowth@gmail.com so the team can guide your support.
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="donation-name" className="block text-xs text-slate-500 mb-1.5">
                      Full name
                    </label>
                    <input
                      id="donation-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-amber-500 focus:bg-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="donation-email" className="block text-xs text-slate-500 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="donation-email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-amber-500 focus:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="donation-phone" className="block text-xs text-slate-500 mb-1.5">
                      Phone / WhatsApp
                    </label>
                    <CountryPhoneField
                      id="donation-phone"
                      name="phone"
                      value={phone}
                      onChange={setPhone}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="donation-amount" className="block text-xs text-slate-500 mb-1.5">
                      Amount
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                      {SUGGESTED_DONATION_AMOUNTS_KOBO.map((amountKobo) => (
                        <button
                          key={amountKobo}
                          type="button"
                          onClick={() => setAmount(String(amountKobo / 100))}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-slate-950"
                        >
                          {formatNaira(amountKobo)}
                        </button>
                      ))}
                    </div>
                    <input
                      id="donation-amount"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      required
                      inputMode="decimal"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-amber-500 focus:bg-white"
                      placeholder={formatDonationAmount(minimumDonationKobo)}
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Minimum donation is {formatNaira(minimumDonationKobo)}.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="donation-note" className="block text-xs text-slate-500 mb-1.5">
                      Note or intention
                    </label>
                    <textarea
                      id="donation-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-colors focus:border-amber-500 focus:bg-white"
                      placeholder="Optional message for the team"
                    />
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-serif font-bold text-slate-950">
                      Donation Terms & Conditions
                    </p>
                    <ul className="mt-3 space-y-2 text-xs leading-relaxed text-amber-950">
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <span>Donations are voluntary contributions made to support School of Growth Global programmes, funds and mission activities.</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <span>Unless a restriction is formally accepted in writing, donations may be allocated where the organization determines they are most needed.</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <span>Donations are generally non-refundable and do not create ownership, governance, profit, repayment or control rights.</span>
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                        <span>Programmes, beneficiary selection and fund administration remain subject to School of Growth Global policies, available resources and applicable law.</span>
                      </li>
                    </ul>
                    <label htmlFor="donation-terms" className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-white p-3 text-xs font-bold leading-relaxed text-slate-700">
                      <input
                        id="donation-terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(event) => {
                          setTermsAccepted(event.target.checked);
                          if (event.target.checked) setError(null);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-500"
                        required
                      />
                      <span>
                        I have read and agree to the Donation Terms & Conditions.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || config === null || !termsAccepted}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-4 text-sm font-black text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening secure donation...
                      </>
                    ) : (
                      <>
                        Donate securely
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Donations are voluntary and non-refundable unless School of Growth
                    Global expressly states otherwise in writing. Beneficiaries remain
                    subject to eligibility, verification, available funds and programme
                    guidelines.
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-950 p-5 sm:p-6 text-white">
              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 shrink-0 text-amber-300" />
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    Your support helps open doors.
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Our goal is simple: make growth accessible, create opportunities,
                    develop people and transform lives.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
