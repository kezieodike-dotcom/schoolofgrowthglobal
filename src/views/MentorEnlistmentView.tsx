import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Users } from 'lucide-react';

const benefits = [
  'Create a professional profile that can be discovered by students and clients.',
  'Share your expertise, experience, languages, location and professional background.',
  'Set up a reviewable pathway before your profile is published publicly.',
  'Receive access to the School of Growth Global mentor and consultant network.',
];

export const MentorEnlistmentView: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <section className="relative isolate min-h-[30rem] overflow-hidden border-b border-slate-800 bg-slate-950 sm:min-h-[34rem] lg:min-h-[38rem]">
      <img
        src="/scenes/leadership-meeting.jpg"
        alt="Mentor and professionals in a focused strategy conversation"
        className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
      />
      <div className="absolute inset-0 bg-slate-950/62" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-amber-400/70" />

      <div className="relative z-10 mx-auto flex min-h-[30rem] max-w-7xl items-end px-4 pb-14 pt-28 sm:min-h-[34rem] sm:px-6 sm:pb-16 lg:min-h-[38rem] lg:px-8 lg:pb-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-amber-300/40 bg-slate-950/35 px-3.5 py-1.5 text-xs font-mono text-amber-100 backdrop-blur-sm">
            <Users className="h-4 w-4" />
            <span>Mentor / Consultant Enlistment</span>
          </div>
          <h1 className="max-w-2xl text-[2.55rem] font-serif font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Put your experience to work.
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-100/90 sm:text-lg sm:leading-8">
            Join the School of Growth Global expert network and build a profile for the people who need your guidance, strategy and practical support.
          </p>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-[#f7f5ef] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16 lg:px-8">
        <div className="space-y-5 lg:sticky lg:top-28">
          <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-700">
            <span className="h-px w-8 bg-amber-500" />
            <span>The pathway</span>
          </div>
          <h2 className="max-w-xl text-3xl font-serif font-bold leading-[1.08] text-slate-950 sm:text-4xl lg:text-[2.75rem]">
            Enlist once. Build a profile that can grow with your practice.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
            Start with a guided application, upload a clear professional photo and tell us where your experience creates the most value. Applications are reviewed before profiles become visible in the public directory.
          </p>
          <div className="space-y-3 border-t border-slate-300/80 pt-5">
            {benefits.map((benefit) => (
              <p key={benefit} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{benefit}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:pt-1">
          <Link
            to="/register/mentor"
            className="group relative flex min-h-[19rem] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_16px_34px_rgba(15,23,42,0.1)] sm:p-7"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
            <Users className="h-6 w-6 text-amber-700" strokeWidth={1.8} />
            <h3 className="mt-10 text-xl font-serif font-bold text-slate-950">Register as a Mentor</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Guide students, professionals and leaders through lived experience and accountability.</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-bold text-amber-700">Begin mentor registration <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link
            to="/register/consultant"
            className="group relative flex min-h-[19rem] flex-col overflow-hidden rounded-lg bg-slate-950 p-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.14)] transition duration-200 hover:-translate-y-1 hover:bg-slate-900 hover:shadow-[0_16px_34px_rgba(15,23,42,0.2)] sm:p-7"
          >
            <span className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
            <BriefcaseBusiness className="h-6 w-6 text-amber-400" strokeWidth={1.8} />
            <h3 className="mt-10 text-xl font-serif font-bold">Register as a Consultant</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">Offer specialist guidance, strategic support and practical solutions to clients and organizations.</p>
            <span className="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-bold text-amber-400">Begin consultant registration <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </div>
    </section>

    <section className="border-b border-slate-200 bg-white px-4 py-9 text-center sm:py-11">
      <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">Already approved?</p>
      <Link to="/mentors" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
        View the public expert directory <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  </div>
);
