import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import {
  PLANS,
  PACKAGES,
  MENTORSHIP_PLANS,
  MENTORSHIP_ANNUAL_SAVING_KOBO,
  formatNaira,
  type Plan,
} from '../lib/pricing';
import {
  Wallet,
  Check,
  Minus,
  ArrowRight,
  ShieldCheck,
  Users,
  Sparkles,
  Star,
  Lock,
  Landmark,
  CircleCheck,
} from 'lucide-react';

/**
 * The commercial page: three course packages and mentorship plans.
 *
 * Every figure on this page is read from src/lib/pricing.ts, the same
 * catalogue the payment server charges from. Nothing here is typed twice, so
 * a price cannot drift between what is advertised and what is collected.
 */

/** Rows for the comparison table, resolved against each package's grants. */
const COMPARISON: { label: string; value: (plan: Plan) => boolean | string }[] = [
  {
    label: 'Schools unlocked',
    value: (p) => (p.includedLevels.length >= 3 ? 'All levels' : 'One level'),
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
  { label: 'Live cohort classes', value: (p) => p.code !== 'mini' },
  { label: 'In-person intensives', value: (p) => p.code === 'maxi' },
  { label: 'Graded assessments', value: (p) => p.code !== 'mini' },
  {
    label: 'Certification',
    value: (p) =>
      p.code === 'mini' ? 'Completion' : p.code === 'medium' ? 'Verified' : 'Executive',
  },
  {
    label: 'Growth AI coach',
    value: (p) => (p.code === 'mini' ? '20 / month' : 'Unlimited'),
  },
  {
    label: 'Mentor access',
    value: (p) => (p.mentorshipDays > 0 ? '12 months' : false),
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

  return (
    <div
      className={`relative flex flex-col rounded-3xl border bg-white transition-all ${
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

const MentorshipCard: React.FC<{ plan: Plan; owned: boolean }> = ({ plan, owned }) => {
  const featured = Boolean(plan.highlight);

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-7 sm:p-8 space-y-5 ${
        featured
          ? 'bg-slate-900 border-slate-800 text-white shadow-2xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg">
          {plan.highlight}
        </span>
      )}

      <div className="space-y-1.5">
        <h3
          className={`text-xl font-serif font-bold ${
            featured ? 'text-white' : 'text-slate-900'
          }`}
        >
          {plan.name}
        </h3>
        <p className={`text-xs ${featured ? 'text-slate-400' : 'text-slate-500'}`}>
          {plan.tagline}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-3xl font-bold font-serif ${
            featured ? 'text-amber-400' : 'text-slate-900'
          }`}
        >
          {formatNaira(plan.amountKobo)}
        </span>
        <span
          className={`text-[11px] font-mono ${
            featured ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {plan.billing}
        </span>
      </div>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-2.5 text-xs ${
              featured ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Check
              className={`w-4 h-4 shrink-0 mt-px ${
                featured ? 'text-amber-400' : 'text-emerald-600'
              }`}
            />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      {owned ? (
        <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2">
          <CircleCheck className="w-4 h-4" />
          Subscription active
        </div>
      ) : (
        <Link
          to={`/checkout/${plan.code}`}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            featured
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          Subscribe
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
};

export const PricingView: React.FC = () => {
  const { packages, hasMentorship, currentPackageName } = useEnrollment();

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
        subtitle="Choose the package that matches your ambition. Every course in your tier unlocks the moment your payment clears - no application queue, no waiting list."
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-7 items-start">
          {PACKAGES.map((plan) => (
            <PackageCard
              key={plan.code}
              plan={plan}
              owned={packages.includes(plan.code)}
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
          <table className="w-full min-w-[600px] text-left">
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

      {/* Mentorship */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-700">
                <Users className="w-4 h-4" />
                <span>Mentor Access</span>
              </div>

              <h2 className="text-3xl font-serif font-bold text-slate-900 leading-tight">
                Choose your own mentor from the directory.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Mentorship is sold separately from tuition, so you can work with an
                operator in your field whether or not you are taking a course with us.
                Browse every registered mentor, read their background, and pair with the
                one you want.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Star className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  The one-year mentorship saves{' '}
                  <strong>{formatNaira(MENTORSHIP_ANNUAL_SAVING_KOBO)}</strong> against
                  twelve one-month plans - and the{' '}
                  <strong>{PLANS.maxi.name}</strong> package includes a full year of mentorship at no
                  extra cost.
                </p>
              </div>

              <Link
                to="/mentors"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors"
              >
                Browse the mentor directory first
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {MENTORSHIP_PLANS.map((plan) => (
                <MentorshipCard key={plan.code} plan={plan} owned={hasMentorship} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">
          Before you pay
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              q: 'What happens right after I pay?',
              a: 'Your courses unlock immediately. Paystack confirms the payment to us, we verify it, and the catalogue opens on the same screen - no email wait, no approval step.',
            },
            {
              q: 'Can I upgrade later?',
              a: 'Yes. Buy any higher package at any time and the additional courses unlock alongside what you already hold. Your existing access window is untouched.',
            },
            {
              q: 'Do I need a package to get a mentor?',
              a: `No. Mentorship stands alone from ${formatNaira(PLANS['mentor-1-hour'].amountKobo)} for one hour to ${formatNaira(PLANS['mentor-1-year'].amountKobo)} for one year. The ${PLANS.maxi.name} package bundles a year of it if you want both.`,
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

        <div className="mt-10 p-8 rounded-3xl bg-gradient-to-r from-white to-slate-50 border border-amber-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Still deciding?
            </h3>
            <p className="text-sm text-slate-500">
              Talk to an advisor about which package fits your goals, or request a
              sponsorship invoice for your employer.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm whitespace-nowrap"
          >
            Speak with an advisor
          </Link>
        </div>
      </section>
    </div>
  );
};
