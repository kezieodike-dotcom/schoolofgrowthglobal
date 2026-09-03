import React from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { CountryPhoneField } from '../components/CountryPhoneField';
import { FORMS, type FormField } from '../lib/formDefs';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';
import { PACKAGES, formatNaira } from '../lib/pricing';
import {
  UserPlus,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Wallet,
} from 'lucide-react';

/**
 * Student registration.
 *
 * Registering tells admissions who you are and what you want; it does not
 * create a login, because there is no user database behind the site. Paying
 * for a package is what actually opens the courses, and the copy here says so
 * rather than leaving someone waiting for an approval email that never gates
 * anything.
 *
 * Mentors have their own route (/register/mentor) rather than a tab here -
 * their application is a five-step wizard with draft state of its own.
 */

const STUDENT = {
  cta: 'Submit Registration',
  confirmation:
    'Our admissions team will review your registration and contact you with programme guidance. You do not have to wait for us to start - choose a package and your courses open immediately.',
  points: [
    'Guidance on which school and level fits your goals',
    'Live cohorts, self-paced tracks, or in-person intensives',
    'Certification on completion',
    'Mentor pairing available on any package',
  ],
};

/** Renders one field from its shared definition. */
const Field: React.FC<{ field: FormField }> = ({ field }) => {
  const base =
    'w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 text-xs focus:outline-none focus:border-amber-500 transition-colors';

  return (
    <div className={field.wide ? 'sm:col-span-2' : undefined}>
      <label htmlFor={field.name} className="block text-slate-500 text-xs mb-1">
        {field.label}
        {!field.required && <span className="text-slate-400"> (optional)</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={field.name}
          name={field.name}
          required={field.required}
          rows={4}
          placeholder={field.placeholder}
          className={`${base} resize-none`}
        />
      ) : field.type === 'select' ? (
        <select id={field.name} name={field.name} required={field.required} className={base}>
          {field.options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : field.type === 'tel' ? (
        <CountryPhoneField
          id={field.name}
          name={field.name}
          required={field.required}
          className={base}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          id={field.name}
          name={field.name}
          type={field.type ?? 'text'}
          required={field.required}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </div>
  );
};

export const RegisterView: React.FC = () => {
  const def = FORMS.student;
  const { status, error, submit, reset, sending } = useFormSubmit('student');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Registration"
        icon={<UserPlus className="w-4 h-4" />}
        title={<>Join School of Growth</>}
        subtitle="Register as a student to begin a programme, or apply to mentor the next generation of leaders."
      />

      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Audience switcher */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto lg:mx-0">
          <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border bg-white border-amber-400 shadow-md ring-1 ring-amber-200 text-left">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span>
              <span className="block text-sm font-bold font-serif text-slate-900">
                Register as a Student
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Join a cohort and build the skills your next role demands.
              </span>
            </span>
          </div>

          <Link
            to="/register/mentor"
            className="flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white text-left transition-all"
          >
            <span className="p-2 rounded-lg bg-slate-100 text-slate-500">
              <Users className="w-5 h-5" />
            </span>
            <span>
              <span className="block text-sm font-bold font-serif text-slate-600">
                Register as a Mentor
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Share hard-won expertise with leaders building what you built.
              </span>
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-8">
            {status === 'sent' ? (
              <div className="p-10 rounded-2xl bg-white shadow-sm border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Registration Received
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {STUDENT.confirmation}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                  <Link
                    to="/pricing"
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wallet className="w-4 h-4" /> Choose your package
                  </Link>
                  <button
                    onClick={reset}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Submit another
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="p-6 sm:p-8 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-5"
              >
                <input {...HONEYPOT_PROPS} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {def.fields.map((field) => (
                    <Field key={field.name} field={field} />
                  ))}
                </div>

                {error && (
                  <p className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                    <span>{error}</span>
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    {sending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <>{STUDENT.cta} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-500">
                    We'll only use your details to contact you about School of Growth programmes.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* What you get */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-serif">
                  What you get
                </h4>
              </div>
              <ul className="space-y-2.5">
                {STUDENT.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/*
              Registering and paying are two different things, and conflating
              them is how someone ends up waiting for an email before they can
              start. The prices are stated here so the next step is obvious.
            */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-sm space-y-3">
              <h4 className="text-sm font-bold font-serif flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                Courses need a package
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Registration tells us who you are. A package is what opens the
                curriculum - pay and your courses unlock immediately, no queue.
              </p>
              <div className="space-y-1.5 pt-1">
                {PACKAGES.map((plan) => (
                  <Link
                    key={plan.code}
                    to={`/checkout/${plan.code}`}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 transition-colors"
                  >
                    <span className="text-xs font-semibold">{plan.name}</span>
                    <span className="text-xs font-mono text-amber-400">
                      {formatNaira(plan.amountKobo)}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Compare what each includes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-white to-slate-50 shadow-sm border border-amber-300 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 font-serif">What happens next</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Registrations are reviewed by our team, not processed automatically. You'll hear
                from a real person within one business day at the email address you provide.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
