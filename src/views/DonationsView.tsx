import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
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
type SpecificDonationFundId = (typeof DONATION_FUNDS)[number]['id'];

export const DonationsView: React.FC = () => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [mode, setMode] = useState<DonationMode>('specific');
  const [fundId, setFundId] = useState<SpecificDonationFundId>(DONATION_FUNDS[0].id);
  const [amount, setAmount] = useState('10000');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const donationDetailRef = useRef<HTMLElement | null>(null);

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

  const handleFundSelection = (nextMode: DonationMode, nextFundId?: SpecificDonationFundId) => {
    setMode(nextMode);
    if (nextFundId) setFundId(nextFundId);
    setError(null);
    window.setTimeout(() => {
      donationDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

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

  const choices = [...DONATION_FUNDS, DONATION_ALLOCATION_OPTION];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 border-b border-slate-200 lg:bg-white">
        <img
          src="/scenes/coaching-collab.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover lg:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/82 via-slate-950/62 to-slate-950/88 lg:hidden" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.16),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f8fafc_55%,#fff7ed_100%)] lg:block" />
        <div className="relative max-w-7xl mx-auto grid min-h-[calc(100dvh-5rem)] grid-cols-1 lg:min-h-0 lg:grid-cols-12 gap-8 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 items-end lg:items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-100 shadow-sm backdrop-blur-md lg:border-amber-200 lg:bg-white/85 lg:text-amber-700 lg:backdrop-blur-none">
              <HeartHandshake className="h-3.5 w-3.5" />
              DONATE
              <ArrowRight className="h-3.5 w-3.5" />
              CHOOSE YOUR IMPACT
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-[2.45rem] sm:text-5xl lg:text-6xl font-serif font-semibold lg:font-bold leading-[1.08] sm:leading-tight tracking-tight text-white lg:text-slate-950">
                Choose the impact your giving should create.
              </h1>
              <p className="max-w-2xl text-[15px] sm:text-base leading-7 sm:leading-relaxed text-slate-100/90 lg:text-slate-600">
                Support practical growth, mentorship, education, welfare and leadership
                development for people who need access, structure and opportunity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleFundSelection('specific', DONATION_FUNDS[0].id)}
              className="motion-pressable inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-transform active:translate-y-px"
            >
              Choose a fund
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden lg:col-span-6 lg:block">
            <div className="scroll-card relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_28px_70px_-32px_rgba(15,23,42,0.45)]">
              <img
                src="/scenes/coaching-collab.jpg"
                alt=""
                className="scroll-card-image h-72 w-full object-cover sm:h-96 lg:h-[30rem]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5 sm:p-7 text-white">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
                  Growth made accessible
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-200">
                  Every donation is directed toward a defined fund or the most urgent
                  mission need selected by School of Growth Global.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                Donate to a Specific Fund
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                Choose one of the four giving options
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-slate-500">
              Choose your impact first, then complete your donation here.
            </p>
          </div>

          <div className="scroll-card-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {choices.map((fund, index) => {
              const isWhereNeeded = fund.id === DONATION_ALLOCATION_OPTION.id;
              const isSelected =
                (isWhereNeeded && mode === 'where-needed') ||
                (!isWhereNeeded && mode === 'specific' && selectedFund.id === fund.id);

              return (
                <button
                  key={fund.id}
                  type="button"
                  aria-label={
                    isWhereNeeded
                      ? 'Let School of Growth Global Allocate My Donation Where It Is Most Needed'
                      : `Donate to ${fund.name}`
                  }
                  onClick={() =>
                    isWhereNeeded
                      ? handleFundSelection('where-needed')
                      : handleFundSelection('specific', fund.id as SpecificDonationFundId)
                  }
                  className={`scroll-card motion-pressable group min-h-72 text-left rounded-[1.5rem] border p-5 transition-all duration-200 active:translate-y-px ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-[0_22px_45px_-30px_rgba(180,83,9,0.65)]'
                      : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_24px_50px_-34px_rgba(15,23,42,0.45)]'
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-bold ${
                          isWhereNeeded
                            ? 'bg-slate-950 text-amber-300'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isWhereNeeded ? <Sprout className="h-5 w-5" /> : index + 1}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950">
                          <Check className="h-3 w-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="mt-6 flex-1">
                      <h3 className="text-xl font-serif font-bold leading-tight text-slate-950">
                        {fund.name}
                      </h3>
                      <p className="mt-2 text-sm font-bold leading-snug text-amber-700">
                        {fund.headline}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-slate-600">
                        {fund.description}
                      </p>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-slate-950">
                      See details and donate
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section
          id="donation-detail-panel"
          ref={donationDetailRef}
          className="mt-10 scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-5">
            <div className="scroll-card rounded-[1.75rem] bg-slate-950 p-6 sm:p-7 text-white shadow-[0_26px_70px_-42px_rgba(15,23,42,0.95)]">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
                What this fund supports
              </p>
              <h2 className="mt-3 text-3xl font-serif font-bold leading-tight">
                {selectedFund.name}
              </h2>
              <p className="mt-2 text-sm font-bold text-amber-200">
                {selectedFund.headline}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                {selectedFund.description}
              </p>

              <div className="mt-6 space-y-3">
                {selectedFund.supports.map((item) => (
                  <p key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <span>
                    You can choose a suggested amount or enter the amount you have.
                    Paystack handles card and transfer payment securely.
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="scroll-card rounded-[1.75rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    Donation payment
                  </p>
                  <h2 className="mt-1 text-2xl font-serif font-bold text-slate-950">
                    Enter your details and make payment
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-mono text-slate-500">
                  {selectedFund.name}
                </div>
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      Amount you want to donate
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                      {SUGGESTED_DONATION_AMOUNTS_KOBO.map((amountKobo) => {
                        const selectedAmount = amount === String(amountKobo / 100);
                        return (
                          <button
                            key={amountKobo}
                            type="button"
                            onClick={() => setAmount(String(amountKobo / 100))}
                            className={`motion-pressable rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                              selectedAmount
                                ? 'border-amber-400 bg-amber-50 text-slate-950'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-slate-950'
                            }`}
                          >
                            {formatNaira(amountKobo)}
                          </button>
                        );
                      })}
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
                    className="motion-pressable flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-4 text-sm font-black text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening secure donation...
                      </>
                    ) : (
                      <>
                        Make donation
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="scroll-card-grid mt-8 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-4">
          <div className="scroll-card rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Donations are voluntary and non-refundable unless School of Growth
                Global expressly states otherwise in writing.
              </span>
            </p>
          </div>

          <div className="scroll-card rounded-[1.5rem] bg-slate-950 p-5 sm:p-6 text-white">
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
        </section>
      </main>
    </div>
  );
};
