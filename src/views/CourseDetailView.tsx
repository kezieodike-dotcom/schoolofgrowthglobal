import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewType } from '../types';
import { FEATURED_COURSE, CORPORATE_PARTNERS } from '../data/mockData';
import {
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Download,
  ShieldCheck,
  Users,
  Lock,
  LockOpen,
  PlayCircle,
  Loader2
} from 'lucide-react';
import { useFormSubmit, HONEYPOT_PROPS } from '../lib/useFormSubmit';
import { useEnrollment } from '../lib/useEnrollment';
import { cheapestPackageFor, formatNaira, type CourseLevel } from '../lib/pricing';

interface CourseDetailViewProps {
  onNavigate: (view: ViewType) => void;
}

/** Modules a visitor may read before paying. The rest is the paid product. */
const FREE_PREVIEW_MODULES = 1;

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ onNavigate }) => {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [syllabusModalOpen, setSyllabusModalOpen] = useState(false);
  const application = useFormSubmit('application');
  const syllabus = useFormSubmit('syllabus');
  const [aiSyllabusPlan, setAiSyllabusPlan] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const { canAccessLevel, currentPackageName } = useEnrollment();
  const level = FEATURED_COURSE.level as CourseLevel;
  const unlocked = canAccessLevel(level);
  const unlockedBy = cheapestPackageFor(level);

  const toggleModule = (index: number) => {
    setOpenModule(openModule === index ? null : index);
  };

  const handleGenerateAiPlan = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generate a personalized 12-week executive study roadmap and weekly hour commitment guide for Executive Strategy & Global Growth.',
          context: 'Course Detail Study Plan Generator'
        })
      });
      const data = await res.json();
      setAiSyllabusPlan(data.reply);
    } catch (err) {
      setAiSyllabusPlan('Growth AI Study Plan: Recommended 4 hours/week live cohort lectures + 2 hours 1-on-1 AI strategy drills on M&A and governance.');
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-600 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:underline">Courses</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{FEATURED_COURSE.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            <div className="lg:col-span-8 space-y-6">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{FEATURED_COURSE.status}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                {FEATURED_COURSE.title}
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                {FEATURED_COURSE.description}
              </p>

              {/* Key metadata chips */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Duration: {FEATURED_COURSE.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Level: {FEATURED_COURSE.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Format: {FEATURED_COURSE.format}</span>
                </div>
              </div>

              {/* Instructor Bio strip */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center gap-4 shadow-sm">
                <img src={FEATURED_COURSE.instructorAvatar} alt={FEATURED_COURSE.instructorName} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-serif">{FEATURED_COURSE.instructorName}</h4>
                  <p className="text-xs text-slate-500">{FEATURED_COURSE.instructorRole}</p>
                </div>
              </div>

            </div>

            {/* Right Card Visual / Enrollment box */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-28">

              <img
                src={FEATURED_COURSE.heroImage}
                alt="Executive Boardroom"
                className="w-full h-44 object-cover rounded-2xl border border-slate-200"
              />

              {/*
                The enrolment box states the position plainly: either the
                course is open, or it names the package that opens it and what
                that costs. No "contact us for pricing".
              */}
              {unlocked ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <LockOpen className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">
                      Unlocked on your {currentPackageName} package
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setApplyModalOpen(true)}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Join the Oct 15 Cohort</span>
                    </button>

                    <button
                      onClick={() => setSyllabusModalOpen(true)}
                      className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>Download Full Syllabus PDF</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-mono">
                      Included in {unlockedBy.name} and above
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-serif text-amber-600">
                        {formatNaira(unlockedBy.amountKobo)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {unlockedBy.billing}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                      One payment unlocks this course and everything else in the{' '}
                      {unlockedBy.name} tier.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Link
                      to={`/checkout/${unlockedBy.code}`}
                      className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Unlock with {unlockedBy.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to="/pricing"
                      className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Compare all packages</span>
                    </Link>

                    <button
                      onClick={() => setSyllabusModalOpen(true)}
                      className="w-full py-2.5 text-slate-500 hover:text-slate-900 font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Email me the free syllabus first</span>
                    </button>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>7-day refund assurance on every package</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Growth AI Strategy Coach Included</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Main Content & Curriculum Accordion */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            <div className="lg:col-span-8 space-y-12">

              {/* Learning Outcomes */}
              <div className="space-y-6">
                <h3 className="text-2xl font-serif font-bold text-slate-900">
                  Executive Learning Outcomes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FEATURED_COURSE.outcomes.map((outcome, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-3 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Curriculum Accordion */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    12-Week Curriculum Breakdown
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">4 Core Modules</span>
                </div>

                <div className="space-y-4">
                  {FEATURED_COURSE.modules.map((module, idx) => {
                    const isOpen = openModule === idx;
                    // The first module is readable by anyone: it is the
                    // sample that makes the rest worth paying for.
                    const locked = !unlocked && idx >= FREE_PREVIEW_MODULES;

                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl bg-white border overflow-hidden transition-colors shadow-sm ${
                          locked ? 'border-slate-200' : 'border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleModule(idx)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-mono text-amber-600 font-bold flex items-center gap-2">
                              {module.week}
                              {!unlocked && idx < FREE_PREVIEW_MODULES && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                                  FREE PREVIEW
                                </span>
                              )}
                            </span>
                            <h4
                              className={`text-lg font-serif font-bold flex items-center gap-2 ${
                                locked ? 'text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {locked && <Lock className="w-4 h-4 shrink-0" />}
                              {module.title}
                            </h4>
                          </div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </button>

                        {isOpen && locked && (
                          <div className="px-6 pb-6 pt-4 border-t border-slate-200 space-y-3 text-center">
                            <Lock className="w-6 h-6 text-amber-600 mx-auto" />
                            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                              This module is part of the paid curriculum. Unlock it,
                              and every other course in the {unlockedBy.name} tier, for{' '}
                              {formatNaira(unlockedBy.amountKobo)}.
                            </p>
                            <Link
                              to={`/checkout/${unlockedBy.code}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                            >
                              Unlock with {unlockedBy.name}
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}

                        {isOpen && !locked && (
                          <div className="px-6 pb-6 pt-2 border-t border-slate-200 space-y-4 text-xs text-slate-600">
                            <p className="leading-relaxed">{module.description}</p>
                            <div>
                              <span className="text-slate-900 font-bold block mb-2 font-mono">Module Focus Topics:</span>
                              <ul className="space-y-1.5 pl-4 list-disc text-slate-500">
                                {module.topics.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Institutional Trust Footer */}
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Institutional Alumni Work At</span>
                <div className="flex flex-wrap justify-center gap-8 text-slate-600 font-serif font-bold text-sm">
                  {CORPORATE_PARTNERS.slice(0, 5).map((p, i) => (
                    <span key={i}>{p}</span>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar Tools */}
            <div className="lg:col-span-4 space-y-6">

              {/* AI Study Plan Widget */}
              <div className="p-6 rounded-2xl bg-white border border-amber-300 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-600 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Growth AI Study Plan Enabled</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 font-serif">
                  Personalize Your Executive Schedule
                </h4>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Let Growth AI generate a tailored 12-week commitment outline matching your executive availability.
                </p>

                <button
                  onClick={handleGenerateAiPlan}
                  disabled={aiGenerating}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {aiGenerating ? <Sparkles className="w-4 h-4 animate-spin" /> : <span>Generate AI Study Plan</span>}
                </button>

                {aiSyllabusPlan && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 whitespace-pre-line leading-relaxed animate-fadeIn">
                    {aiSyllabusPlan}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-slate-900 space-y-4 shadow-2xl relative">
            <button onClick={() => setApplyModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900">✕</button>

            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-600 font-bold uppercase">Oct 15 COHORT APPLICATION</span>
              <h3 className="text-xl font-serif font-bold text-slate-900">Apply for Executive Strategy & Global Growth</h3>
            </div>

            {application.status === 'sent' ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-600">
                  Our admissions director will review your background within 24 hours.
                </p>
                <button
                  onClick={() => { application.reset(); setApplyModalOpen(false); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              // Placeholders, not defaultValue: the old demo values ("Chidi Okeke",
              // "alex.rivera@nexus.com") were prefilled and valid, so now that this
              // form really sends, a distracted applicant could submit someone
              // else's details untouched.
              <form
                onSubmit={(e) => application.submit(e, { course: FEATURED_COURSE.title })}
                className="space-y-3 text-xs"
              >
                <input {...HONEYPOT_PROPS} />
                <div>
                  <label className="block text-slate-500 mb-1">Full Name</label>
                  <input required name="name" type="text" placeholder="Chidi Okeke" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Current Title & Organization</label>
                  <input required name="role" type="text" placeholder="VP of Global Strategy, Nexus International" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Work Email</label>
                  <input required name="email" type="email" placeholder="you@organization.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
                </div>
                {application.error && (
                  <p className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{application.error}</p>
                )}
                <button
                  type="submit"
                  disabled={application.sending}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {application.sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {application.sending ? 'Submitting...' : 'Submit Executive Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Syllabus Request Modal */}
      {syllabusModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl relative">
            <button
              onClick={() => { syllabus.reset(); setSyllabusModalOpen(false); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>

            {syllabus.status === 'sent' ? (
              <div className="text-center space-y-3 py-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif font-bold text-slate-900">Syllabus On Its Way</h4>
                <p className="text-xs text-slate-600">
                  We'll email you the full syllabus for {FEATURED_COURSE.title} shortly.
                </p>
                <button
                  onClick={() => { syllabus.reset(); setSyllabusModalOpen(false); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-xs font-mono text-amber-600 font-bold uppercase">Full Syllabus</span>
                  <h3 className="text-lg font-serif font-bold text-slate-900">
                    Where should we send it?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tell us where to send the complete module breakdown for {FEATURED_COURSE.title}.
                  </p>
                </div>

                <form
                  onSubmit={(e) => syllabus.submit(e, { course: FEATURED_COURSE.title })}
                  className="space-y-3 text-xs"
                >
                  <input {...HONEYPOT_PROPS} />
                  <div>
                    <label className="block text-slate-500 mb-1">Full Name</label>
                    <input required name="name" type="text" placeholder="Chidi Okeke" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Email</label>
                    <input required name="email" type="email" placeholder="you@organization.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
                  </div>
                  {syllabus.error && (
                    <p className="text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">{syllabus.error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={syllabus.sending}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {syllabus.sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {syllabus.sending ? 'Sending...' : 'Send Me the Syllabus'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
