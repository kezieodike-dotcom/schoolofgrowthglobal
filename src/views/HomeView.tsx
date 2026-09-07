import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ViewType } from '../types';
import { TrustedExecutivesSlider } from '../components/TrustedExecutivesSlider';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { GlobalFlagMarquee } from '../components/GlobalFlagMarquee';
import { FACULTY_MEMBERS } from '../data/mockData';
import { useContentCollection } from '../lib/useContent';
import { askGrowthAI, describeError } from '../lib/growthAI';
import {
  Crown,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Terminal,
  Send,
  UserPlus,
  Award,
  UsersRound,
  BookOpen,
  Compass,
  BriefcaseBusiness,
  CalendarDays,
  Lightbulb,
  HeartHandshake
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
      const { reply } = await askGrowthAI({
        message: aiQuestion,
        context: 'Home Page Intelligence Teaser'
      });
      setAiAnswer(reply);
    } catch (err) {
      setAiAnswer(describeError(err));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <GlobalFlagMarquee />

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

              <div className="inline-flex -translate-y-1 items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3 py-1.5 text-[11px] font-medium text-amber-100 backdrop-blur-md transition-transform sm:-translate-y-1.5 sm:px-3.5 lg:-translate-y-2 lg:border-amber-300 lg:bg-white lg:text-xs lg:text-amber-700 lg:font-mono lg:backdrop-blur-none">
                <Crown className="w-3.5 h-3.5 text-amber-200 lg:text-amber-600" />
                <span>Global Institutional Standard 2026</span>
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
                  className="motion-pressable flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-slate-950/25 transition-all hover:bg-amber-300 sm:w-auto lg:bg-gradient-to-r lg:from-amber-400 lg:via-amber-500 lg:to-amber-600 lg:shadow-amber-500/20 lg:hover:brightness-110"
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
                  className="motion-pressable flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/12 px-5 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/18 sm:w-auto lg:border-slate-300 lg:bg-white lg:text-slate-700 lg:backdrop-blur-none lg:hover:bg-slate-100"
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
              <div className="scroll-card relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white group">
                <img
                  src="/scenes/hero-team.jpg"
                  alt="A team reviewing growth dashboards together in a modern office"
                  className="w-full aspect-square sm:aspect-auto sm:h-[460px] object-cover object-center transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Overlaid Badge Card */}
                <div className="absolute bottom-3 left-3 right-3 p-3 space-y-1.5 sm:bottom-6 sm:left-6 sm:right-6 sm:p-5 sm:space-y-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/20">
                      FEATURED COHORT
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
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
                      className="motion-pressable text-[10px] sm:text-xs text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 group/link"
                    >
                      <span>View Curriculum</span>
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform" />
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

            <div className="lg:col-span-5 space-y-4" data-scroll-reveal>
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
                className="motion-pressable px-4 py-2.5 sm:px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Full Command Center</span>
              </button>
            </div>

            {/* Quick Teaser Console */}
            <div className="scroll-card lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
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
                      <Sparkles className="w-3.5 h-3.5" />
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
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
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

      {/* Homepage pathways: separate editorial sections that lead into the site */}
      <section className="border-b border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div className="max-w-xl space-y-4" data-scroll-reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-amber-700">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Learn with structure</span>
              </div>
              <h2 className="text-3xl font-serif font-semibold leading-tight text-slate-900 sm:text-4xl">
                Build the capability your next chapter requires.
              </h2>
              <p className="text-[15px] leading-7 text-slate-600">
                Move from foundation to advanced growth through cohort programmes, focused courses,
                live classes and ideas you can apply immediately.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link to="/courses" className="scroll-card motion-pressable group rounded-lg bg-slate-950 p-5 text-white transition-all hover:-translate-y-1 hover:bg-slate-900">
                <BookOpen className="mb-10 h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-serif font-semibold">Courses & cohorts</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">Structured ladders and specialised growth programmes.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-amber-400">Explore courses <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <Link to="/events" className="scroll-card motion-pressable group rounded-lg border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50">
                <CalendarDays className="mb-10 h-5 w-5 text-violet-600" />
                <h3 className="text-lg font-serif font-semibold text-slate-900">Events & live classes</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Join timely sessions and practical conversations.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-violet-700">See what is next <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <Link to="/blog" className="scroll-card motion-pressable group rounded-lg border border-slate-200 bg-slate-50 p-5 transition-all hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50">
                <Lightbulb className="mb-10 h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-serif font-semibold text-slate-900">Insights</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Perspectives for better leadership and decisions.</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange-700">Read insights <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-2xl space-y-4" data-scroll-reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-emerald-300">
                <Compass className="h-3.5 w-3.5" />
                <span>Move with guidance</span>
              </div>
              <h2 className="text-3xl font-serif font-semibold leading-tight sm:text-4xl">
                You do not have to figure out your next move alone.
              </h2>
              <p className="max-w-xl text-[15px] leading-7 text-slate-300">
                Get matched with experienced people who can help you make better decisions, or find
                the opportunity where your capability can create value.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/mentorship" className="motion-pressable inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-300">
                  Find a mentor or consultant <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/jobs" className="motion-pressable inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-emerald-400 hover:text-emerald-300">
                  Explore Career Jobs <BriefcaseBusiness className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-6 lg:pl-10">
              <p className="text-sm font-mono uppercase tracking-widest text-slate-500">Your next step can be</p>
              <div className="mt-5 space-y-4 text-lg font-serif text-slate-200">
                <p>More clarity.</p>
                <p>Better strategy.</p>
                <p>A stronger opportunity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-amber-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div className="max-w-2xl space-y-4" data-scroll-reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-amber-700">
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Grow beyond yourself</span>
            </div>
            <h2 className="text-3xl font-serif font-semibold leading-tight text-slate-900 sm:text-4xl">
              Be part of a global growth community.
            </h2>
            <p className="text-[15px] leading-7 text-slate-700">
              Learn more about the institution, discover the people behind the work, read our books,
              or support initiatives that make transformation more accessible.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-sm lg:justify-end">
            <Link to="/about" className="motion-pressable inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700">
              About us <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/books" className="motion-pressable inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700">
              Browse books <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/donate" className="motion-pressable inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
              Donate to impact <HeartHandshake className="h-4 w-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* What Our Leaders Say - Animated Testimonials Columns */}
      <TestimonialsSection />

      {/* Donation hero bridge */}
      <section className="relative overflow-hidden bg-slate-950 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/20 lg:min-h-[30rem]">
            <img
              src="/scenes/coaching-collab.jpg"
              alt="A group learning together in a collaborative session"
              className="absolute inset-0 h-full w-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(2,6,23,0.86)_42%,rgba(2,6,23,0.42)_100%)]" />

            <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-14 lg:py-14">
              <div className="max-w-2xl space-y-5" data-scroll-reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-amber-300">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>Choose your impact</span>
                </div>
                <h2 className="text-3xl font-serif font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                  Your generosity can open a door someone else has been waiting for.
                </h2>
                <p className="max-w-xl text-[15px] leading-7 text-slate-300 sm:text-base">
                  Help make practical growth, mentorship, education and leadership development
                  accessible to people with potential but limited opportunity.
                </p>
                <Link
                  to="/donate"
                  className="motion-pressable inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-950/20 transition-colors hover:bg-amber-300"
                >
                  <span>Visit the donation page</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="max-w-md space-y-3 lg:justify-self-end" data-scroll-reveal>
                <p className="mb-4 text-[11px] font-mono uppercase tracking-widest text-amber-300">
                  Give toward a defined mission
                </p>
                {[
                  ['Community Growth Fund', 'Make transformation accessible to everyone.'],
                  ['Impact Support Fund', 'Sustain the work and transform more lives.'],
                  ['Future Leaders Fund', 'Invest in a child. Shape a leader.']
                ].map(([title, copy]) => (
                  <Link
                    key={title}
                    to="/donate"
                    className="motion-pressable group flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:border-amber-300/60 hover:bg-white/15"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-white">{title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-300">{copy}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-amber-300 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
                <p className="pt-2 text-xs leading-5 text-slate-400">
                  You can also let School of Growth Global allocate your donation where it is most needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              className="motion-pressable inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-amber-300 hover:text-amber-700"
            >
              <span>View Full Team</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="scroll-card-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTeam.map((member) => (
              <article
                key={member.id}
                className="scroll-card group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="scroll-card-image h-full w-full object-cover object-center transition-transform duration-500"
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
