import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewType } from '../types';
import { TrustedExecutivesSlider } from '../components/TrustedExecutivesSlider';
import { TestimonialsSection } from '../components/TestimonialsSection';
import {
  Crown,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Terminal,
  Send,
  UserPlus
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-200">

        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-50 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-300 text-xs text-amber-700 font-mono">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Global Institutional Standard 2024</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight leading-[1.1]">
                Raise Your Growth. <br />
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                  Transform Your Impact.
                </span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
                Elite educational frameworks, executive tracks, and institutional intelligence designed for high-impact leaders, Managing Directors, and venture architects worldwide.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/courses"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
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
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  <span>Enrol Now</span>
                </Link>
              </div>

              {/* Quick stats trust indicators */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-slate-500">
                <div>
                  <div className="text-xl font-bold font-serif text-slate-900">10,000+</div>
                  <div className="text-xs">Global Alumni</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-serif text-slate-900">50+</div>
                  <div className="text-xs">Nations Represented</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-serif text-slate-900">94%</div>
                  <div className="text-xs">Career Acceleration</div>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
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
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-mono border border-amber-200">
                <Terminal className="w-3.5 h-3.5" />
                <span>Growth AI Institutional Core</span>
              </div>

              <h2 className="text-3xl font-serif font-bold text-slate-900">
                Meet Your Institutional Intelligence Coach
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Powered by Gemini models, Growth AI synthesizes real-time C-suite governance, geopolitical expansion frameworks, and scenario analysis for your executive growth.
              </p>

              <button
                onClick={() => onNavigate('command-center')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Full Command Center</span>
              </button>
            </div>

            {/* Quick Teaser Console */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
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

    </div>
  );
};
