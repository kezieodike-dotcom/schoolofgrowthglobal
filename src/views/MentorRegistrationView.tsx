import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';
import {
  MENTOR_STEPS,
  CONSENTS,
  validateStep,
  validateField,
  emptyValues,
  toEmailEntries,
  type FieldValue,
  type MentorField,
  type MentorStep,
} from '../lib/mentorApplication';
import {
  Users,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
  Save,
  Pencil,
  ShieldCheck,
  Clock,
  Trash2,
} from 'lucide-react';

/**
 * Mentor registration.
 *
 * A single-screen form asking thirty questions is abandoned; this asks them
 * four at a time, validates each step before moving on, and shows everything
 * back before it is sent. Three decisions are worth knowing about:
 *
 *  - Errors appear on Continue, not on every keystroke. Validating as someone
 *    types marks a half-written email address as wrong, which reads as the
 *    form arguing with you. Once a field has been flagged it re-checks live,
 *    so the error clears the moment it is fixed.
 *
 *  - The draft is saved locally on every change. This form takes ten minutes
 *    to fill honestly, and a closed tab used to cost all of it.
 *
 *  - The review step is not decoration. Applications are read by a person who
 *    decides whether to list someone publicly, so the applicant sees exactly
 *    what that person will see before committing to it.
 */

const DRAFT_KEY = 'sog.mentorApplication.draft.v1';
const REVIEW_STEP = MENTOR_STEPS.length;

/** True when at least one answer has been given - an empty form is not a draft. */
function hasContent(values: unknown): boolean {
  if (!values || typeof values !== 'object') return false;
  return Object.values(values as Record<string, FieldValue>).some((v) =>
    Array.isArray(v) ? v.length > 0 : String(v ?? '').trim().length > 0
  );
}

export const MentorRegistrationView: React.FC = () => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, FieldValue>>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [consentError, setConsentError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const { status, error, submitValues, sending } = useFormSubmit('mentor');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);

  /**
   * Gates the save effect until the restore has been applied to state.
   *
   * This is state rather than a ref on purpose. A ref set at the end of the
   * restore effect is already true when the save effect runs in the same
   * commit, so the save would write the *pre-restore* empty values straight
   * over the draft it had just read. Because setReady batches with setValues,
   * the first render where ready is true is also the first render holding the
   * restored answers.
   */
  const [ready, setReady] = useState(false);

  // ── Draft persistence ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === 'object' && hasContent(saved.values)) {
        // Merged over a fresh blank set so a draft written before a field
        // was added does not leave that field undefined and uncontrolled.
        setValues({ ...emptyValues(), ...saved.values });
        setStep(Math.min(saved.step ?? 0, REVIEW_STEP));
        setDraftRestored(true);
      }
    } catch {
      // A corrupt draft is not worth surfacing; start clean.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      // An untouched form writes nothing, so "Start over" cannot leave behind
      // an empty draft that greets the next visit with "we restored your
      // draft" over a blank form.
      if (hasContent(values)) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step }));
        setDraftSaved(true);
        const timer = setTimeout(() => setDraftSaved(false), 1600);
        return () => clearTimeout(timer);
      }
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Quota or private browsing - the form still works, just not resumable.
    }
  }, [values, step, ready]);

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setValues(emptyValues());
    setErrors({});
    setStep(0);
    setDraftRestored(false);
  };

  // ── Field plumbing ────────────────────────────────────────────────
  const setValue = (name: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Only re-validate a field that has already been flagged, so the error
    // disappears as soon as it is fixed without new ones appearing mid-typing.
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const field = MENTOR_STEPS.flatMap((s) => s.fields).find((f) => f.name === name);
      if (!field) return prev;
      const next = { ...prev };
      const stillWrong = validateField(field, value);
      if (stillWrong) next[name] = stillWrong;
      else delete next[name];
      return next;
    });
  };

  const goTo = (next: number) => {
    setStep(next);
    setErrors({});
    // The step heading, not the page top: the applicant's eye is already in
    // the form and scrolling to the hero would lose their place.
    requestAnimationFrame(() =>
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );
  };

  const handleContinue = () => {
    const current = MENTOR_STEPS[step];
    const found = validateStep(current, values);

    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Send focus to the first problem rather than leaving the applicant to
      // hunt for it in a step they have already scrolled past.
      const first = current.fields.find((f) => found[f.name]);
      if (first) {
        requestAnimationFrame(() => {
          const el = document.getElementById(`field-${first.name}`);
          el?.focus();
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      return;
    }
    goTo(step + 1);
  };

  const handleSubmit = async () => {
    // The last line of defence: a step could have been skipped by restoring an
    // old draft straight onto the review screen.
    for (let i = 0; i < MENTOR_STEPS.length; i++) {
      const found = validateStep(MENTOR_STEPS[i], values);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        goTo(i);
        return;
      }
    }

    const missing = CONSENTS.filter((c) => !consents[c.name]);
    if (missing.length > 0) {
      setConsentError('Please confirm all three statements before submitting.');
      return;
    }
    setConsentError(null);

    // Honeypot: a hidden input no human fills in.
    if (honeypotRef.current?.value.trim()) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const entries = toEmailEntries(values);
    entries.push(['Consents', 'Accuracy, code of conduct and public listing all agreed']);

    // Recorded on our server as well as emailed. The email notifies a human;
    // this is what puts the application in the admin review queue, so it can
    // be admitted or rejected rather than actioned by replying to a message.
    //
    // Failure here is swallowed on purpose. The email is the delivery that
    // matters to the applicant, and showing them an error because our review
    // queue is unavailable would cost us a mentor over an internal problem.
    // The server logs the real cause.
    try {
      await fetch('/api/mentors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: Object.fromEntries(entries) }),
      });
    } catch {
      // Intentionally ignored - see above.
    }

    const delivered = await submitValues(entries, {
      replyTo: String(values.email ?? ''),
    });
    if (delivered) localStorage.removeItem(DRAFT_KEY);
  };

  // ── Success ───────────────────────────────────────────────────────
  if (status === 'sent') {
    return <SubmittedPanel name={String(values.name ?? '')} />;
  }

  const progress = Math.round((step / REVIEW_STEP) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Mentor Registration"
        icon={<Users className="w-4 h-4" />}
        title={<>Register as a Mentor</>}
        subtitle="Join the directory students choose from. Tell us what you have built, how you work, and who you are best placed to help."
      />

      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Form column ────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-5" ref={formTopRef}>
            {draftRestored && step < REVIEW_STEP && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-900 flex items-center gap-2">
                  <Save className="w-4 h-4 shrink-0" />
                  We restored your saved draft. Pick up where you left off.
                </p>
                <button
                  onClick={discardDraft}
                  className="text-xs font-bold text-amber-900 hover:text-rose-600 flex items-center gap-1.5 whitespace-nowrap transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Start over
                </button>
              </div>
            )}

            <Stepper step={step} onJump={(i) => i < step && goTo(i)} />

            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-slate-100">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {step < REVIEW_STEP ? (
                  <StepFields
                    step={MENTOR_STEPS[step]}
                    index={step}
                    values={values}
                    errors={errors}
                    onChange={setValue}
                  />
                ) : (
                  <ReviewStep
                    values={values}
                    consents={consents}
                    consentError={consentError}
                    error={error}
                    onToggleConsent={(name) =>
                      setConsents((prev) => ({ ...prev, [name]: !prev[name] }))
                    }
                    onEdit={goTo}
                  />
                )}

                <input {...HONEYPOT_PROPS} ref={honeypotRef} />

                {/* ── Navigation ───────────────────────────────────── */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100">
                  {step > 0 ? (
                    <button
                      onClick={() => goTo(step - 1)}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <span className="hidden sm:block" />
                  )}

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] text-slate-400 font-mono transition-opacity duration-300 hidden sm:flex items-center gap-1.5 ${
                        draftSaved ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-live="polite"
                    >
                      <Check className="w-3 h-3" /> Draft saved
                    </span>

                    {step < REVIEW_STEP ? (
                      <button
                        onClick={handleContinue}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
                      >
                        {step === REVIEW_STEP - 1 ? 'Review application' : 'Continue'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={sending}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Submit application
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Users className="w-4 h-4" />
                </span>
                Why mentor with us
              </h4>
              <ul className="space-y-2.5">
                {[
                  'Paid engagements - mentees subscribe, you get booked',
                  'Set your own availability and session load',
                  'Listed on the public directory students choose from',
                  'Vetted, motivated professionals, not cold enquiries',
                  'Sessions, scheduling and payment handled for you',
                ].map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"
                  >
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-px" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                What happens next
              </h4>
              <ol className="space-y-3">
                {[
                  ['Within 1 business day', 'A faculty reviewer reads your application.'],
                  ['Within 3 days', 'A 20-minute call to talk through your practice.'],
                  ['On approval', 'Your profile goes live and mentees can pair with you.'],
                ].map(([when, what], i) => (
                  <li key={when} className="flex gap-3">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center mt-px">
                      {i + 1}
                    </span>
                    <span className="space-y-0.5">
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-600">
                        {when}
                      </span>
                      <span className="block text-xs text-slate-600 leading-relaxed">
                        {what}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
              <h4 className="text-xs font-bold font-serif flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Your details are private
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your phone number and email are never published. Only your name, role,
                location, background and specialisms appear on the directory, and only
                after you are approved.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

// ── Stepper ────────────────────────────────────────────────────────────

const STEP_LABELS = [...MENTOR_STEPS.map((s) => s.title), 'Review'];

const Stepper: React.FC<{ step: number; onJump: (i: number) => void }> = ({
  step,
  onJump,
}) => (
  <nav aria-label="Application progress">
    <ol className="flex items-center gap-1 sm:gap-2">
      {STEP_LABELS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className="flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
            <button
              onClick={() => onJump(i)}
              disabled={!done}
              aria-current={current ? 'step' : undefined}
              className={`flex items-center gap-2 min-w-0 ${
                done ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              <span
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-mono font-bold border transition-colors ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white group-hover:bg-emerald-600'
                    : current
                      ? 'bg-amber-500 border-amber-500 text-slate-950'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span
                className={`hidden md:block text-xs truncate ${
                  current
                    ? 'text-slate-900 font-bold'
                    : done
                      ? 'text-slate-600 group-hover:text-slate-900'
                      : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <span
                className={`flex-1 h-px min-w-[8px] ${
                  done ? 'bg-emerald-300' : 'bg-slate-200'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

// ── Step body ──────────────────────────────────────────────────────────

const StepFields: React.FC<{
  step: MentorStep;
  index: number;
  values: Record<string, FieldValue>;
  errors: Record<string, string>;
  onChange: (name: string, value: FieldValue) => void;
}> = ({ step, index, values, errors, onChange }) => (
  <div className="space-y-6">
    <div className="space-y-1">
      <span className="text-[11px] font-mono text-amber-600 font-bold uppercase tracking-wider">
        Step {index + 1} of {REVIEW_STEP + 1}
      </span>
      <h2 className="text-2xl font-serif font-bold text-slate-900">{step.title}</h2>
      <p className="text-xs text-slate-500 leading-relaxed">{step.blurb}</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
      {step.fields.map((field) => (
        <Field
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors[field.name]}
          onChange={(v) => onChange(field.name, v)}
        />
      ))}
    </div>
  </div>
);

// ── One field ──────────────────────────────────────────────────────────

const Field: React.FC<{
  field: MentorField;
  value: FieldValue;
  error?: string;
  onChange: (value: FieldValue) => void;
}> = ({ field, value, error, onChange }) => {
  const id = `field-${field.name}`;
  const describedBy = [error ? `${id}-error` : null, field.help ? `${id}-help` : null]
    .filter(Boolean)
    .join(' ');

  const base = `w-full bg-slate-50 border rounded-xl p-3 text-slate-900 text-sm transition-colors focus:outline-none ${
    error
      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/40'
      : 'border-slate-200 focus:border-amber-500'
  }`;

  const text = Array.isArray(value) ? '' : String(value ?? '');
  const list = Array.isArray(value) ? value : [];
  const isGrouped = field.type === 'chips' || field.type === 'cards';

  return (
    <div className={field.wide ? 'sm:col-span-2 space-y-1.5' : 'space-y-1.5'}>
      <div className="flex items-baseline justify-between gap-3">
        {/*
          Chip and card groups are labelled by aria-label on the group itself,
          so a <label for> here would point at a container rather than a
          control and read as a broken association to a screen reader.
        */}
        {isGrouped ? (
          <span className="block text-xs font-medium text-slate-700">
            {field.label}
            {!field.required && (
              <span className="text-slate-400 font-normal"> (optional)</span>
            )}
          </span>
        ) : (
          <label htmlFor={id} className="block text-xs font-medium text-slate-700">
            {field.label}
            {!field.required && (
              <span className="text-slate-400 font-normal"> (optional)</span>
            )}
          </label>
        )}

        {field.maxLength && field.type === 'textarea' && (
          <span
            className={`text-[10px] font-mono shrink-0 ${
              text.length > field.maxLength ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            {text.length}/{field.maxLength}
          </span>
        )}
        {field.type === 'chips' && field.maxSelected && (
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {list.length}/{field.maxSelected}
          </span>
        )}
      </div>

      {field.type === 'textarea' ? (
        <textarea
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={field.name === 'bio' ? 6 : 4}
          placeholder={field.placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={`${base} resize-none leading-relaxed`}
        />
      ) : field.type === 'select' ? (
        <select
          id={id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={base}
        >
          <option value="">Select...</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === 'chips' ? (
        <ChipGroup
          id={id}
          field={field}
          selected={list}
          invalid={Boolean(error)}
          describedBy={describedBy || undefined}
          onToggle={(option) =>
            onChange(
              list.includes(option)
                ? list.filter((v) => v !== option)
                : field.maxSelected && list.length >= field.maxSelected
                  ? list
                  : [...list, option]
            )
          }
        />
      ) : field.type === 'cards' ? (
        <CardGroup
          id={id}
          field={field}
          selected={text}
          describedBy={describedBy || undefined}
          onSelect={onChange}
        />
      ) : (
        <input
          id={id}
          type={field.type}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={base}
        />
      )}

      {/*
        Help stays visible when a field is in error. It usually states the
        very constraint that was missed ("Pick 2 to 6"), so hiding it at the
        moment of failure removes the explanation just when it is needed -
        and would leave aria-describedby pointing at an element that no
        longer exists.
      */}
      {field.help && (
        <p id={`${id}-help`} className="text-[11px] text-slate-400 leading-relaxed">
          {field.help}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[11px] text-rose-600 flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

/** Multi-select as toggleable chips - faster to scan than a tall checkbox list. */
const ChipGroup: React.FC<{
  id: string;
  field: MentorField;
  selected: string[];
  invalid: boolean;
  describedBy?: string;
  onToggle: (option: string) => void;
}> = ({ id, field, selected, invalid, describedBy, onToggle }) => {
  const full = Boolean(field.maxSelected && selected.length >= field.maxSelected);

  return (
    <div
      id={id}
      role="group"
      aria-label={field.label}
      aria-describedby={describedBy}
      tabIndex={-1}
      className={`flex flex-wrap gap-2 p-3 rounded-xl border ${
        invalid ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50'
      }`}
    >
      {field.options?.map((option) => {
        const on = selected.includes(option);
        // Once the cap is reached, unpicked chips are disabled rather than
        // silently ignoring the click - the limit becomes visible instead of
        // feeling like a broken button.
        const blocked = !on && full;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            aria-pressed={on}
            disabled={blocked}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              on
                ? 'bg-amber-500 border-amber-500 text-slate-950 font-semibold'
                : blocked
                  ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-amber-400 hover:text-slate-900'
            }`}
          >
            {on && <Check className="w-3 h-3 inline mr-1 -mt-px" />}
            {option}
          </button>
        );
      })}
    </div>
  );
};

/** Single-select shown as descriptive cards, for the one choice that steers everything after it. */
const CardGroup: React.FC<{
  id: string;
  field: MentorField;
  selected: string;
  describedBy?: string;
  onSelect: (value: string) => void;
}> = ({ id, field, selected, describedBy, onSelect }) => (
  <div
    id={id}
    role="radiogroup"
    aria-label={field.label}
    aria-describedby={describedBy}
    tabIndex={-1}
    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
  >
    {field.options?.map((option) => {
      const on = selected === option;
      return (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={on}
          onClick={() => onSelect(option)}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            on
              ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="flex items-start gap-2.5">
            <span
              className={`w-4 h-4 shrink-0 mt-px rounded-full border-2 flex items-center justify-center ${
                on ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
              }`}
            >
              {on && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="min-w-0">
              <span
                className={`block text-xs font-semibold ${
                  on ? 'text-slate-900' : 'text-slate-700'
                }`}
              >
                {option}
              </span>
              {field.optionHints?.[option] && (
                <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {field.optionHints[option]}
                </span>
              )}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

// ── Review ─────────────────────────────────────────────────────────────

const ReviewStep: React.FC<{
  values: Record<string, FieldValue>;
  consents: Record<string, boolean>;
  consentError: string | null;
  error: string | null;
  onToggleConsent: (name: string) => void;
  onEdit: (step: number) => void;
}> = ({ values, consents, consentError, error, onToggleConsent, onEdit }) => (
  <div className="space-y-6">
    <div className="space-y-1">
      <span className="text-[11px] font-mono text-amber-600 font-bold uppercase tracking-wider">
        Step {REVIEW_STEP + 1} of {REVIEW_STEP + 1}
      </span>
      <h2 className="text-2xl font-serif font-bold text-slate-900">
        Review your application
      </h2>
      <p className="text-xs text-slate-500 leading-relaxed">
        This is exactly what our faculty team will read. Check it over, confirm the
        three statements, and send.
      </p>
    </div>

    <div className="space-y-4">
      {MENTOR_STEPS.map((step, i) => (
        <div
          key={step.id}
          className="rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 font-serif">{step.title}</h3>
            <button
              onClick={() => onEdit(i)}
              className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          </div>

          <dl className="divide-y divide-slate-100">
            {step.fields.map((field) => {
              const value = values[field.name];
              const text = Array.isArray(value) ? value.join(', ') : String(value ?? '');
              return (
                <div
                  key={field.name}
                  className="px-4 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3"
                >
                  <dt className="text-[11px] text-slate-500">{field.label}</dt>
                  <dd
                    className={`sm:col-span-2 text-xs leading-relaxed whitespace-pre-line ${
                      text ? 'text-slate-900' : 'text-slate-300 italic'
                    }`}
                  >
                    {text || 'Not provided'}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}
    </div>

    {/* Consents */}
    <fieldset className="space-y-3 pt-2">
      <legend className="text-xs font-bold text-slate-900 font-serif mb-2">
        Before you submit
      </legend>
      {CONSENTS.map((consent) => (
        <label
          key={consent.name}
          className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={Boolean(consents[consent.name])}
            onChange={() => onToggleConsent(consent.name)}
            className="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-amber-500 focus:ring-amber-500 accent-amber-500"
          />
          <span className="text-[11px] text-slate-600 leading-relaxed">
            {consent.label}
          </span>
        </label>
      ))}
    </fieldset>

    {consentError && (
      <p
        role="alert"
        className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3"
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
        {consentError}
      </p>
    )}

    {error && (
      <p
        role="alert"
        className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3"
      >
        <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
        {error}
      </p>
    )}
  </div>
);

// ── Submitted ──────────────────────────────────────────────────────────

const SubmittedPanel: React.FC<{ name: string }> = ({ name }) => {
  const firstName = name.trim().split(/\s+/).slice(-1)[0] || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white border border-emerald-200 shadow-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Application received{firstName && `, ${firstName}`}.
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            A faculty reviewer reads every application personally. You'll hear from us
            within one business day at the email address you gave.
          </p>
        </div>

        <ol className="text-left space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          {[
            ['1 business day', 'We review your background and specialisms.'],
            ['Within 3 days', 'A short call about how you like to mentor.'],
            ['On approval', 'Your profile goes live and students can pair with you.'],
          ].map(([when, what]) => (
            <li key={when} className="space-y-0.5">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-600">
                {when}
              </span>
              <span className="block text-xs text-slate-600">{what}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/mentors"
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center transition-colors"
          >
            See the directory
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};
