import React, { useState } from 'react';
import { ViewType } from '../types';
import { FEATURED_COURSE, CORPORATE_PARTNERS } from '../data/mockData';
import {
  Crown,
  Clock,
  Calendar,
  CheckCircle2,
  Award,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Download,
  ShieldCheck,
  Users,
  Send,
  HelpCircle
} from 'lucide-react';

interface CourseDetailViewProps {
  onNavigate: (view: ViewType) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ onNavigate }) => {
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [aiSyllabusPlan, setAiSyllabusPlan] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

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
            <span onClick={() => onNavigate('home')} className="cursor-pointer hover:underline">Faculties</span>
            <span>/</span>
            <span onClick={() => onNavigate('leadership-school')} className="cursor-pointer hover:underline">School of Leadership</span>
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

              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-mono">Tuition & Sponsorship</span>
                <div className="text-2xl font-bold font-serif text-amber-600">{FEATURED_COURSE.price}</div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <span>Apply Now for Oct 15 Cohort</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => alert("Syllabus PDF requested.")}
                  className="w-full py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-600" />
                  <span>Download Full Syllabus PDF</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Money-Back Assurance if not accepted by Admissions</span>
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
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-colors shadow-sm"
                      >
                        <button
                          onClick={() => toggleModule(idx)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-100 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-mono text-amber-600 font-bold">{module.week}</span>
                            <h4 className="text-lg font-serif font-bold text-slate-900">{module.title}</h4>
                          </div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </button>

                        {isOpen && (
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

            <form onSubmit={(e) => { e.preventDefault(); alert("Application submitted! Our admissions director will review your background within 24 hours."); setApplyModalOpen(false); }} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Full Name</label>
                <input required type="text" defaultValue="Chidi Okeke" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Current Title & Organization</label>
                <input required type="text" defaultValue="VP of Global Strategy, Nexus International" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Work Email</label>
                <input required type="email" defaultValue="alex.rivera@nexus.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors">
                Submit Executive Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
