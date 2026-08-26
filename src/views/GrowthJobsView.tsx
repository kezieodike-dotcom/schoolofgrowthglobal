import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  Mail,
  MapPin,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GROWTH_JOBS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import { useFormSubmit } from '../lib/useFormSubmit';
import { useContentCollection } from '../lib/useContent';
import type { GrowthJob } from '../types';

const WORK_MODES = ['All', 'Remote', 'Hybrid', 'On-site'] as const;
const INPUT_CLASS =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500';

export const GrowthJobsView: React.FC = () => {
  const [mode, setMode] = useState<(typeof WORK_MODES)[number]>('All');
  const [activeJob, setActiveJob] = useState<GrowthJob | null>(null);
  const { isEnrolled, hasMentorship, currentPackageName } = useEnrollment();
  const jobContent = useContentCollection('job', GROWTH_JOBS);
  const canApply = isEnrolled || hasMentorship;

  const jobs = useMemo(
    () => jobContent.items.filter((job) => mode === 'All' || job.workMode === mode),
    [jobContent.items, mode]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Career Jobs"
        icon={<BriefcaseBusiness className="w-4 h-4" />}
        title={
          <>
            Jobs for Students and{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              Subscribed Mentees
            </span>
          </>
        }
        subtitle="See new jobs posted through the School of Growth network. Applications are reserved for enrolled students and subscribed mentees of the community."
      />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-10 items-start">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-4xl">
            School of Growth Global Career Jobs is a professional career and talent
            ecosystem connecting employers seeking capable professionals with a
            community of skilled individuals ready to demonstrate their effectiveness,
            efficiency, expertise, and value.
          </p>
          <div className="lg:border-l lg:border-slate-200 lg:pl-8">
            <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">
              Core concept
            </p>
            <p className="mt-2 text-xl font-serif font-bold text-slate-900 leading-snug">
              Where Employers Find Talent. Where Professionals Find Opportunity.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <main className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-amber-700">
                  {jobs.length} open roles
                </p>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mt-1">Latest opportunities</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {WORK_MODES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setMode(item)}
                    className={`px-3.5 py-2 rounded-full border text-xs font-bold transition-colors ${
                      mode === item
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
                >
                  <img
                    src={job.image || '/scenes/bootcamp-team.jpg'}
                    alt={job.title}
                    className="w-full h-40 object-cover rounded-xl border border-slate-200 mb-5"
                  />
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                    <div className="space-y-4 min-w-0">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {job.featured && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                            {job.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-slate-900 mt-2">{job.title}</h3>
                        <p className="text-sm text-amber-700 font-semibold mt-1">{job.organization}</p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{job.summary}</p>

                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="xl:w-64 shrink-0 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 text-xs">
                      <Meta icon={<MapPin className="w-3.5 h-3.5" />} label={job.location} />
                      <Meta icon={<BriefcaseBusiness className="w-3.5 h-3.5" />} label={`${job.workMode} / ${job.level}`} />
                      <Meta icon={<CalendarDays className="w-3.5 h-3.5" />} label={`Closes ${job.closes}`} />
                      {job.applicationEmail && (
                        <Meta icon={<Mail className="w-3.5 h-3.5" />} label={`Send CV: ${job.applicationEmail}`} />
                      )}
                      <p className="text-slate-500">{job.salary}</p>
                      <button
                        type="button"
                        onClick={() => setActiveJob(job)}
                        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black active:translate-y-px transition-all ${
                          canApply
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            : 'bg-slate-950 text-white hover:bg-slate-800'
                        }`}
                      >
                        {canApply ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {canApply ? 'Apply Now' : 'Unlock Apply'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </main>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-4">
                {canApply ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <h3 className="font-serif font-bold text-lg">
                {canApply ? 'Application access active' : 'Applications are gated'}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                {canApply
                  ? `You can apply as ${currentPackageName ? `${currentPackageName} student` : 'a subscribed mentee'}.`
                  : 'Only enrolled students or subscribed mentees can submit applications through this board.'}
              </p>
              {!canApply && (
                <div className="grid grid-cols-1 gap-2 mt-5">
                  <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400">
                    Become eligible <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/register" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15">
                    Register as student
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Before you apply</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Keep your CV to PDF, DOC or DOCX.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Use the same email connected to your student or mentee access.</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> Include a short note that matches the role.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {activeJob && (
        <JobApplicationModal
          job={activeJob}
          canApply={canApply}
          onClose={() => setActiveJob(null)}
        />
      )}
    </div>
  );
};

const Meta: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <p className="flex items-center gap-2 text-slate-600">
    {icon}
    <span>{label}</span>
  </p>
);

const JobApplicationModal: React.FC<{
  job: GrowthJob;
  canApply: boolean;
  onClose: () => void;
}> = ({ job, canApply, onClose }) => {
  const form = useFormSubmit('jobApplication');
  const [cvFileName, setCvFileName] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const entries: [string, string][] = [
      ['Full Name', String(data.get('name') ?? '')],
      ['Email', String(data.get('email') ?? '')],
      ['Phone / WhatsApp', String(data.get('phone') ?? '')],
      ['Job Applied For', job.title],
      ['Student / Mentee Status', String(data.get('studentStatus') ?? '')],
      ['CV File Name', cvFileName],
      ['Application Email', job.applicationEmail ?? ''],
      ['LinkedIn / Portfolio URL', String(data.get('portfolio') ?? '')],
      ['Short Application Note', String(data.get('note') ?? '')],
    ];
    if (!cvFile) return;
    await form.submitValuesWithAttachment(entries, cvFile, {
      replyTo: String(data.get('email') ?? ''),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close application"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pr-8">
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">Apply for role</p>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">{job.title}</h3>
          <p className="text-sm text-slate-500 mt-1">{job.organization}</p>
          {job.applicationEmail && (
            <p className="text-xs text-amber-700 font-semibold mt-2">
              Send CV: {job.applicationEmail}
            </p>
          )}
        </div>

        <img
          src={job.image || '/scenes/bootcamp-team.jpg'}
          alt={job.title}
          className="mt-5 w-full h-40 object-cover rounded-xl border border-slate-200"
        />

        {!canApply ? (
          <div className="mt-6 rounded-2xl bg-slate-950 text-white border border-slate-800 p-5">
            <Lock className="w-6 h-6 text-amber-400" />
            <h4 className="font-serif font-bold text-lg mt-3">This application is reserved</h4>
            <p className="text-sm text-slate-300 mt-2">
              Enroll as a student or subscribe as a mentee to apply for Career Jobs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-slate-950 text-xs font-black">
                View plans <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white text-xs font-bold">
                Register
              </Link>
            </div>
          </div>
        ) : form.status === 'sent' ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h4 className="text-xl font-serif font-bold text-slate-900">Application received</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your application for {job.title} has been sent to the Career Jobs desk.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-900">Requirements</p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {job.requirements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-px" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input required name="name" type="text" className={INPUT_CLASS} />
              </Field>
              <Field label="Email">
                <input required name="email" type="email" className={INPUT_CLASS} />
              </Field>
              <Field label="Phone / WhatsApp">
                <input required name="phone" type="tel" className={INPUT_CLASS} />
              </Field>
              <Field label="Student / Mentee Status">
                <select required name="studentStatus" className={INPUT_CLASS}>
                  <option value="">Select status</option>
                  <option>Enrolled student</option>
                  <option>Subscribed mentee</option>
                  <option>Elite student with mentorship access</option>
                </select>
              </Field>
              <Field label="LinkedIn / Portfolio URL" wide>
                <input name="portfolio" type="url" placeholder="https://linkedin.com/in/..." className={INPUT_CLASS} />
              </Field>
              <Field label="Upload CV" wide>
                <label className="flex items-center gap-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600 cursor-pointer hover:border-amber-400 transition-colors">
                  <Upload className="w-5 h-5 text-amber-600" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-800">
                      {cvFileName || 'Choose PDF, DOC or DOCX'}
                    </span>
                    <span className="block text-xs text-slate-500">Attached to your application email.</span>
                  </span>
                  <input
                    required
                    name="cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setCvFile(file);
                      setCvFileName(file?.name ?? '');
                    }}
                  />
                </label>
              </Field>
              <Field label="Short Application Note" wide>
                <textarea name="note" rows={4} className={`${INPUT_CLASS} resize-y`} placeholder="Briefly explain why this role fits your experience." />
              </Field>
            </div>

            {form.error && (
              <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">{form.error}</p>
            )}

            <button
              type="submit"
              disabled={form.sending || !cvFileName}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px transition-all"
            >
              {form.sending ? <FileText className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
              {form.sending ? 'Sending Application' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; wide?: boolean; children: React.ReactNode }> = ({ label, wide, children }) => (
  <label className={`block space-y-2 ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="text-xs font-bold text-slate-700">{label}</span>
    {children}
  </label>
);
