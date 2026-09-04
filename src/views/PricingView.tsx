import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import {
  PLANS,
  PACKAGES,
  formatNaira,
  type PackageId,
  type Plan,
} from '../lib/pricing';
import {
  COMPLETE_LADDER_DISCOUNT_KOBO,
  COMPLETE_LADDER_ORIGINAL_KOBO,
  COMPLETE_LADDER_SUMMARY,
  COURSE_LADDER_STEPS,
  COURSE_LADDER_SUMMARY,
  FAST_TRACK_SUMMARY,
  describePrerequisiteFor,
  fastTrackPlanFor,
} from '../lib/courseLadder';
import { paymentLinkForLadder, planCodeForLadder } from '../lib/ladderPayments';
import {
  CONSULTATION_LADDER,
  CONSULTATION_PRICING_BANDS,
  CORPORATE_PRICING_BANDS,
  MENTORSHIP_LADDER,
  MENTORSHIP_PRICING_BANDS,
  REVENUE_SPLIT,
  formatPriceRange,
  type LadderItem,
  type PricingBand,
} from '../lib/mentorshipCatalogue';
import {
  Wallet,
  Check,
  Minus,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Star,
  Landmark,
  CircleCheck,
} from 'lucide-react';

/**
 * The commercial page: course packages and mentorship plans.
 *
 * Every figure on this page is read from src/lib/pricing.ts, the same
 * catalogue the payment server charges from. Nothing here is typed twice, so
 * a price cannot drift between what is advertised and what is collected.
 */

/** Rows for the comparison table, resolved against each package's grants. */
const COMPARISON: { label: string; value: (plan: Plan) => boolean | string }[] = [
  {
    label: 'Schools unlocked',
    value: (p) => (p.includedLevels.includes('Elite') ? 'All levels' : `${p.includedLevels.length} level${p.includedLevels.length === 1 ? '' : 's'}`),
  },
  {
    label: 'Position',
    value: (p) => p.position ?? '',
  },
  {
    label: 'Emerging Leaders courses',
    value: (p) => p.includedLevels.includes('Emerging Leaders'),
  },
  { label: 'Executive courses', value: (p) => p.includedLevels.includes('Executive') },
  { label: 'Frontier courses', value: (p) => p.includedLevels.includes('Frontier') },
  {
    label: 'Senior Directorate programmes',
    value: (p) => p.includedLevels.includes('Senior Directorate'),
  },
  { label: 'Elite Council experience', value: (p) => p.includedLevels.includes('Elite') },
  { label: 'Live cohort classes', value: (p) => p.code !== 'mini' },
  { label: 'In-person intensives', value: (p) => p.code === 'maxi' || p.code === 'premium' },
  { label: 'Graded assessments', value: (p) => p.code !== 'mini' },
  {
    label: 'Certification',
    value: (p) =>
      p.code === 'mini'
        ? 'Completion'
        : p.code === 'medium'
          ? 'Certificate'
          : p.code === 'premium'
            ? 'Elite'
            : 'Executive',
  },
  {
    label: 'Growth AI coach',
    value: (p) => (p.code === 'mini' ? '20 / month' : 'Unlimited'),
  },
  {
    label: 'Mentor access',
    value: (p) =>
      p.mentorshipDays >= 365 ? '12 months' : p.mentorshipDays > 0 ? 'Selected' : false,
  },
  { label: 'Access window', value: (p) => `${Math.round(p.durationDays / 30)} months` },
];

/** One cell of the comparison table: a tick, a dash, or a short string. */
const Cell: React.FC<{ value: boolean | string }> = ({ value }) => {
  if (value === true)
    return <Check className="w-4 h-4 text-emerald-600 mx-auto" aria-label="Included" />;
  if (value === false)
    return (
      <Minus className="w-4 h-4 text-slate-300 mx-auto" aria-label="Not included" />
    );
  return <span className="text-[11px] font-mono text-slate-700">{value}</span>;
};

const PackageCard: React.FC<{ plan: Plan; owned: boolean }> = ({ plan, owned }) => {
  const featured = Boolean(plan.highlight);
  const requirements = describePrerequisiteFor(plan.code);
  const fastTrackPlan = fastTrackPlanFor(plan.code as PackageId);
  const needsCertificate = requirements.startsWith('Requires');

  return (
    <div
      className={`${featured ? '' : ''} relative flex flex-col rounded-3xl border bg-white transition-all ${
        featured
          ? 'border-amber-400 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-200 lg:-mt-4 lg:mb-4'
          : 'border-slate-200 shadow-sm hover:border-slate-300'
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg">
          {plan.highlight}
        </span>
      )}

      <div className="p-7 sm:p-8 space-y-5 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-serif font-bold text-slate-900">{plan.name}</h3>
          {plan.position && (
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700 font-bold">
              {plan.position}
            </p>
          )}
          <p className="text-xs text-slate-500 leading-relaxed min-h-[2rem]">
            {plan.tagline}
          </p>
        </div>

        <div className="space-y-1 pb-1">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-4xl font-bold font-serif ${
                featured ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {formatNaira(plan.amountKobo)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">{plan.billing}</p>
          {plan.paymentOptions?.map((option) => (
            <p key={option} className="text-[11px] text-emerald-700 font-semibold">
              Payment option: {option}
            </p>
          ))}
        </div>

        <div
          className={`rounded-2xl border p-3 ${
            needsCertificate
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700">
            {needsCertificate ? 'Requires previous certificate verification' : 'Ladder entry'}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            {requirements}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            Short on time? Choose the{' '}
            <Link
              to={`/checkout/${fastTrackPlan.code}`}
              className="font-bold text-amber-700 hover:underline"
            >
              {fastTrackPlan.name}
            </Link>{' '}
            at {formatNaira(fastTrackPlan.amountKobo)}.
          </p>
        </div>

        {owned ? (
          <div className="w-full py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
            <CircleCheck className="w-4 h-4" />
            You have this package
          </div>
        ) : (
          <Link
            to={`/checkout/${plan.code}`}
            className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              featured
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            Choose {plan.name}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        <ul className="space-y-2.5 pt-2 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-600">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
          {plan.excludes?.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-slate-400">
              <Minus className="w-4 h-4 shrink-0 mt-px" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const LadderPreview: React.FC<{ item: LadderItem }> = ({ item }) => {
  const plan = PLANS[planCodeForLadder(item.title)];

  return (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-700">
        {item.level}
      </span>
      <span className="text-[11px] font-mono text-amber-700">{item.duration}</span>
    </div>
    <h4 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h4>
    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
    <Link
      to={paymentLinkForLadder(item.title)}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-slate-800"
    >
      Pay from {formatNaira(plan.amountKobo)}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
  );
};

const PricingBandCard: React.FC<{ band: PricingBand; dark?: boolean }> = ({ band, dark }) => (
  <div
    className={`rounded-2xl border p-5 ${
      dark ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200 bg-white shadow-sm'
    }`}
  >
    <p className={`text-[11px] font-bold uppercase tracking-wider ${dark ? 'text-amber-300' : 'text-amber-700'}`}>
      {band.name}
    </p>
    <p className={`mt-2 text-2xl font-serif font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
      {formatPriceRange(band.range)}
    </p>
    <p className={`mt-2 text-xs leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
      {band.description}
    </p>
  </div>
);

const CourseLadderSection: React.FC = () => (
  <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 rounded-3xl bg-slate-950 text-white p-6 sm:p-8 space-y-4">
        <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
          Full Growth Ladder
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold leading-tight">
          Move from foundation to elite with certificate proof at every stage.
        </h2>
        <p className="text-sm leading-relaxed text-slate-300">
          {COURSE_LADDER_SUMMARY}
        </p>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
            Two-Week Fast-Track Intensives
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {FAST_TRACK_SUMMARY} Fast-track students receive an Intensive Completion Certificate,
            not the full cohort certificate.
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSE_LADDER_STEPS.map((step) => {
            const fullPlan = PLANS[step.packageCode];
            const intensivePlan = PLANS[step.fastTrackCode];
            const requires = step.prerequisiteCertificateNames.length > 0;

            return (
              <div
                key={step.packageCode}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                      Level {step.level}
                    </p>
                    <h3 className="mt-1 text-lg font-serif font-bold text-slate-900">
                      {fullPlan.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {formatNaira(fullPlan.amountKobo)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {requires
                    ? `Submit ${step.prerequisiteCertificateNames.join(', ')} before the full cohort is approved.`
                    : 'This is the starting point for the complete School of Growth course ladder.'}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Link
                    to={`/checkout/${fullPlan.code}`}
                    className="motion-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-[11px] font-bold text-white transition hover:bg-slate-800"
                  >
                    Full cohort
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to={`/checkout/${intensivePlan.code}`}
                    className="motion-pressable inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] font-bold text-amber-800 transition hover:border-amber-300"
                  >
                    Two-week fast-track: {formatNaira(intensivePlan.amountKobo)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <Link
          to="/checkout/complete-ladder"
          className="motion-pressable group block rounded-3xl border border-amber-300 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-xl shadow-amber-500/10 transition-all hover:-translate-y-1 hover:border-amber-400"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-2">
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-300">
                Pay for all four ladders
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                Complete Growth Ladder
              </h3>
              <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                {COMPLETE_LADDER_SUMMARY} International dollar invoices can receive
                a $50 discount through admissions.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4 text-slate-950 shadow-lg min-w-[220px]">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                All four combined
              </p>
              <p className="mt-1 text-sm text-slate-500 line-through">
                {formatNaira(COMPLETE_LADDER_ORIGINAL_KOBO)}
              </p>
              <p className="text-3xl font-serif font-bold text-slate-950">
                {formatNaira(PLANS["complete-ladder"].amountKobo)}
              </p>
              <p
                className="mt-1 text-[11px] font-bold text-emerald-700"
                aria-label="Save ₦50,000"
              >
                Save {formatNaira(COMPLETE_LADDER_DISCOUNT_KOBO)}
              </p>
              <span className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-[11px] font-bold text-slate-950 transition group-hover:bg-amber-400">
                Pay once
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  </section>
);

export const PricingView: React.FC = () => {
  const { packages, currentPackageName } = useEnrollment();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Tuition & Packages"
        icon={<Wallet className="w-4 h-4" />}
        title={
          <>
            One Payment.{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              A Year of Growth.
            </span>
          </>
        }
        subtitle="Choose your starting point. Full cohorts now follow a certificate-based ladder, while two-week fast-track intensives let busy learners study selected high-impact modules."
        imageSrc="/scenes/wealth-planning.jpg"
      />

      {currentPackageName && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-800 flex items-center gap-2">
              <CircleCheck className="w-4 h-4 shrink-0" />
              You are enrolled on the{' '}
              <strong className="font-bold">{currentPackageName}</strong> package.
            </p>
            <Link
              to="/portal"
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              Go to your dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Packages */}
      <section className="pt-12 sm:pt-16 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-7 items-start">
          {PACKAGES.map((plan) => (
            <PackageCard
              key={plan.code}
              plan={plan}
              owned={packages.includes(plan.code) || packages.includes('complete-ladder')}
            />
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <ShieldCheck className="w-4 h-4" />,
              title: 'Secured by Paystack',
              body: 'Card, bank transfer, USSD and Apple Pay. We never see your card details.',
            },
            {
              icon: <Landmark className="w-4 h-4" />,
              title: 'Employer invoices',
              body: 'Need your company to pay? Request a formal invoice and we will raise one.',
            },
            {
              icon: <Sparkles className="w-4 h-4" />,
              title: '7-day assurance',
              body: 'Not the right fit in your first week? Write to us for a full refund.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center gap-2 text-amber-600">
                {item.icon}
                <h4 className="text-xs font-bold text-slate-900 font-serif">
                  {item.title}
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
          Compare the packages
        </h2>

        {/* Scrolls on phones rather than squeezing four columns off-screen. */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-medium">
                  What you get
                </th>
                {PACKAGES.map((plan) => (
                  <th key={plan.code} className="p-4 text-center">
                    <span className="block text-sm font-serif font-bold text-slate-900">
                      {plan.name}
                    </span>
                    <span className="block text-[11px] font-mono text-amber-600 mt-0.5">
                      {formatNaira(plan.amountKobo)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-slate-100 last:border-0 ${
                    i % 2 ? 'bg-slate-50/50' : ''
                  }`}
                >
                  <td className="p-4 text-xs text-slate-600">{row.label}</td>
                  {PACKAGES.map((plan) => (
                    <td key={plan.code} className="p-4 text-center">
                      <Cell value={row.value(plan)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-white">
                <td className="p-4" />
                {PACKAGES.map((plan) => (
                  <td key={plan.code} className="p-4 text-center">
                    <Link
                      to={`/checkout/${plan.code}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      Choose <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Consultation and Mentorship */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                <Users className="w-4 h-4" />
                <span>Consultation & Mentorship</span>
              </div>

              <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                Expert support is matched by problem, seniority and scope.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Clients can start with a focused consultation, continue into mentorship,
                or request corporate advisory. Final pricing depends on the expert's
                credentials, specialization, client type and measurable value.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  For each paid consultation, mentorship or advisory engagement, the expert
                  receives <strong>{REVENUE_SPLIT.expertPercent}%</strong> and School of
                  Growth Global receives <strong>{REVENUE_SPLIT.companyPercent}%</strong>.
                </p>
              </div>

              <Link
                to="/mentors"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Request an expert match
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div>
                <h3 className="text-sm font-serif font-bold text-slate-900">
                  Consultation ladder
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {CONSULTATION_LADDER.map((item) => (
                    <LadderPreview key={item.title} item={item} />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-serif font-bold text-slate-900">
                  Mentorship ladder
                </h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MENTORSHIP_LADDER.map((item) => (
                    <LadderPreview key={item.title} item={item} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-900">
                    Individual consultation bands
                  </h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CONSULTATION_PRICING_BANDS.map((band) => (
                      <PricingBandCard key={band.name} band={band} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-900">
                    Mentorship bands
                  </h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MENTORSHIP_PRICING_BANDS.map((band) => (
                      <PricingBandCard key={band.name} band={band} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                      Corporate pricing
                    </p>
                    <h3 className="mt-1 text-xl font-serif font-bold text-white">
                      Built for organizations, teams and executive transformation.
                    </h3>
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200"
                  >
                    Request corporate quote <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {CORPORATE_PRICING_BANDS.map((band) => (
                    <PricingBandCard key={band.name} band={band} dark />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CourseLadderSection />

      {/* Questions */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
          Before you pay
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              q: 'What happens right after I pay?',
              a: 'Growth Foundation and all fast-track intensives open after payment confirmation. Higher full cohorts first require certificate verification from the previous level.',
            },
            {
              q: 'Can I upgrade later?',
              a: 'Yes. Submit the certificate from your completed level, then admissions can approve your next full cohort payment. If you only need selected modules quickly, choose the two-week intensive.',
            },
            {
              q: 'Do I need a package to get a mentor?',
              a: 'No. Mentorship and consultation can stand alone. Choose a growth division, request an expert, and the team will quote based on the scope, duration and level of expertise required.',
            },
            {
              q: 'Which payment methods work?',
              a: 'Paystack accepts Nigerian and international cards, bank transfer, USSD, and mobile money. Choose your method on the Paystack checkout screen.',
            },
            {
              q: 'Is my card safe?',
              a: 'Your card details go straight to Paystack and never touch our servers. We only ever receive a transaction reference.',
            },
            {
              q: 'My company wants to sponsor me.',
              a: "Contact us and we will raise a formal invoice in your organisation's name, payable by transfer, and enrol you when it settles.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
            >
              <h4 className="text-sm font-bold text-slate-900 font-serif">{item.q}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
