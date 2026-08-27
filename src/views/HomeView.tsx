import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewType } from '../types';
import { TrustedExecutivesSlider } from '../components/TrustedExecutivesSlider';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FACULTY_MEMBERS } from '../data/mockData';
import { useContentCollection } from '../lib/useContent';
import {
  Crown,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Terminal,
  Send,
  UserPlus,
  Award,
  UsersRound
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const managedTeam = useContentCollection('team', FACULTY_MEMBERS);
  const featuredTeam = managedTeam.items.slice(0, 4);

  const handleAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    setAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiQuestion, context: 'Home Page Intelligence Teaser' })
      });
      const data = await res.json();
      setAiAnswer(data.reply || 'Strategic analysis completed.');
    } catch (err) {
      setAiAnswer('Growth AI simulation active: Strategic growth requires disciplined capital allocation and clear accountability structures.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[calc(100dvh-5rem)] lg:min-h-0 pt-16 pb-10 sm:pt-20 sm:pb-14 lg:pt-20 lg:pb-32 border-b border-slate-200 bg-slate-950 lg:bg-slate-50">

        <img
          src="/scenes/hero-team.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center lg:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/76 via-slate-950/46 to-slate-950/90 lg:hidden"></div>
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(15,23,42,0.82)_0%,rgba(15,23,42,0.55)_48%,rgba(15,23,42,0.18)_100%)] lg:hidden"></div>

        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 hidden h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-50 blur-[120px] pointer-events-none lg:block"></div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-11rem)] max-w-7xl items-end px-4 sm:min-h-[calc(100dvh-12rem)] sm:px-6 lg:block lg:min-h-0 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="max-w-[37rem] space-y-5 pb-5 sm:space-y-6 lg:col-span-7 lg:max-w-none lg:pb-0">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[11px] font-medium text-amber-100 backdrop-blur-md sm:px-3.5 lg:border-amber-300 lg:bg-white lg:text-xs lg:text-amber-700 lg:font-mono lg:backdrop-blur-none">
                <Crown className="w-3.5 h-3.5 text-amber-200 lg:text-amber-600" />
                <span>Global Institutional Standard 2024</span>
              </div>

              <h1 className="text-[2.55rem] sm:text-5xl lg:text-6xl font-serif font-semibold lg:font-bold text-white lg:text-slate-900 tracking-tight leading-[1.05] lg:leading-[1.1]">
                Raise Your Growth. <br />
                <span className="text-amber-200 lg:bg-gradient-to-r lg:from-amber-500 lg:via-amber-600 lg:to-amber-700 lg:bg-clip-text lg:text-transparent">
                  Transform Your Impact.
                </span>
              </h1>

              <p className="max-w-[34rem] text-[15px] leading-7 text-slate-100/88 sm:text-lg lg:max-w-2xl lg:text-slate-600 lg:leading-relaxed">
                Elite educational frameworks, executive tracks, and institutional intelligence designed for high-impact leaders, Managing Directors, and venture architects worldwide.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center lg:gap-4 lg:pt-2">
                <Link
                  to="/courses"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-slate-950/25 transition-all hover:bg-amber-300 active:scale-[0.98] sm:w-auto lg:bg-gradient-to-r lg:from-amber-400 lg:via-amber-500 lg:to-amber-600 lg:shadow-amber-500/20 lg:hover:brightness-110 lg:hover:-translate-y-0.5"
                >
                  <span>Explore Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/*
                  Points at /pricing rather than /register, matching the
                  header's Enrol button. Registering only tells admissions who
                  you are; paying for a package is what actually opens the
                  courses, so the CTA should land where that happens.
                */}
                <Link
                  to="/pricing"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/12 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/18 active:scale-[0.98] sm:w-auto lg:border-slate-300 lg:bg-white lg:text-slate-700 lg:backdrop-blur-none lg:hover:bg-slate-100"
                >
                  <UserPlus className="w-4 h-4 text-amber-200 lg:text-amber-600" />
                  <span>Enrol Now</span>
                </Link>
              </div>

              {/* Quick stats trust indicators */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6 text-slate-200/78 sm:grid-cols-3 sm:gap-6 lg:border-slate-200 lg:pt-8 lg:text-slate-500">
                <div>
                  <div className="text-xl font-semibold font-serif text-white lg:font-bold lg:text-slate-900">10,000+</div>
                  <div className="text-xs">Global Alumni</div>
                </div>
                <div>
                  <div className="text-xl font-semibold font-serif text-white lg:font-bold lg:text-slate-900">50+</div>
                  <div className="text-xs">Nations Represented</div>
                </div>
                <div>
                  <div className="text-xl font-semibold font-serif text-white lg:font-bold lg:text-slate-900">94%</div>
                  <div className="text-xs">Career Acceleration</div>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Card */}
            <div className="hidden lg:col-span-5 lg:block">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white group">
                <img
                  src="/scenes/hero-team.jpg"
                  alt="A team reviewing growth dashboards together in a modern office"
                  className="w-full aspect-square sm:aspect-auto sm:h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Overlaid Badge Card */}
                <div className="absolute bottom-3 left-3 right-3 p-3 space-y-1.5 sm:bottom-6 sm:left-6 sm:right-6 sm:p-5 sm:space-y-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/20">
                      FEATURED COHORT
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      4 Seats Left
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white font-serif leading-snug">
                    Executive Strategy & Global Growth
                  </h3>

                  {/* Hidden on phones: the blurb is the tallest part of the card and
                      the image behind it matters more at that width. */}
                  <p className="hidden sm:block text-xs text-slate-300 line-clamp-2">
                    Led by Dr. Adebayo Okonkwo, PhD. 12-week intensive C-suite governance & market expansion framework.
                  </p>

                  <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-800">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-mono">Oct 15 Cohort</span>
                    <button
                      onClick={() => onNavigate('course-detail')}
                      className="text-[10px] sm:text-xs text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 group/link"
                    >
                      <span>View Curriculum</span>
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/link:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Corporate Partners Trust Bar */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
            Trusted by Executives & Board Members From Global Institutions
          </p>
          <TrustedExecutivesSlider />
        </div>
      </section>

      {/* Interactive Growth AI Teaser Section */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] sm:text-xs font-medium lg:font-mono border border-amber-200">
                <Terminal className="w-3.5 h-3.5" />
                <span>Growth AI Institutional Core</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-semibold lg:font-bold text-slate-900 leading-tight">
                Meet Your Institutional Intelligence Coach
              </h2>

              <p className="text-[15px] sm:text-sm text-slate-600 leading-7 sm:leading-relaxed">
                Powered by Gemini models, Growth AI synthesizes real-time C-suite governance, geopolitical expansion frameworks, and scenario analysis for your executive growth.
              </p>

              <button
                onClick={() => onNavigate('command-center')}
                className="px-4 py-2.5 sm:px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors active:scale-[0.98]"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Full Command Center</span>
              </button>
            </div>

            {/* Quick Teaser Console */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Growth AI Console • Live Prompt Simulator</span>
                </div>
                <span className="text-[10px] text-amber-400 font-mono">gemini-3.6-flash</span>
              </div>

              <form onSubmit={handleAiQuestion} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="e.g. How should a board handle sudden geopolitical disruption in Europe?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pr-16 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60"
                  >
                    {aiLoading ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Ask</span>
                        <Send className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {aiAnswer && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2 animate-fadeIn">
                  <div className="font-mono text-amber-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Growth AI Strategic Brief:</span>
                  </div>
                  <p className="whitespace-pre-line">{aiAnswer}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* What Our Leaders Say - Animated Testimonials Columns */}
      <TestimonialsSection />

      {/* Meet Our Team */}
      <section className="py-14 sm:py-18 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-amber-700">
                <UsersRound className="h-3.5 w-3.5" />
                <span>Meet Our Team</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-semibold text-slate-900 leading-tight">
                Guided by people who have led, built and advised at serious levels.
              </h2>
              <p className="text-[15px] leading-7 text-slate-600">
                Our faculty and advisory team bring executive leadership, business strategy,
                venture growth and technology experience into every School of Growth programme.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-amber-300 hover:text-amber-700 active:scale-[0.98]"
            >
              <span>View Full Team</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTeam.map((member) => (
              <article
                key={member.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-serif font-semibold text-slate-900 leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-700">{member.role}</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">{member.institution}</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{member.bio}</p>
                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
                    <Award className="h-3.5 w-3.5 text-amber-600" />
                    <span>{member.credentials[0]}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
