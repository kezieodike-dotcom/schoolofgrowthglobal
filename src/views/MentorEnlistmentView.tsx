import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Users } from 'lucide-react';
import { PageHero } from '../components/PageHero';

const benefits = [
  'Create a professional profile that can be discovered by students and clients.',
  'Share your expertise, experience, languages, location and professional background.',
  'Set up a reviewable pathway before your profile is published publicly.',
  'Receive access to the School of Growth Global mentor and consultant network.',
];

export const MentorEnlistmentView: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <PageHero
      eyebrow="Mentor / Consultant Enlistment"
      icon={<Users className="h-4 w-4" />}
      title={<>Put your experience to work.</>}
      subtitle="Join the School of Growth Global expert network and build a profile for the people who need your guidance, strategy and practical support."
      imageSrc="/scenes/coaching-collab.jpg"
      imageOnDesktop
    />

    <section className="border-b border-slate-200 bg-white py-12 sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-amber-700">The pathway</p>
          <h2 className="text-3xl font-serif font-bold leading-tight text-slate-900 sm:text-4xl">
            Enlist once. Build a profile that can grow with your practice.
          </h2>
          <p className="text-sm leading-7 text-slate-600">
            Start with a guided application, upload a clear professional photo and tell us where your experience creates the most value. Applications are reviewed before profiles become visible in the public directory.
          </p>
          <div className="space-y-3 pt-2">
            {benefits.map((benefit) => (
              <p key={benefit} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{benefit}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/register/mentor"
            className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-amber-400 hover:bg-amber-50"
          >
            <Users className="h-6 w-6 text-amber-700" />
            <h3 className="mt-12 text-xl font-serif font-bold text-slate-900">Register as a Mentor</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Guide students, professionals and leaders through lived experience and accountability.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-700">Begin mentor registration <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
          <Link
            to="/register/consultant"
            className="group rounded-2xl bg-slate-950 p-6 text-white transition hover:-translate-y-1 hover:bg-slate-900"
          >
            <BriefcaseBusiness className="h-6 w-6 text-amber-400" />
            <h3 className="mt-12 text-xl font-serif font-bold">Register as a Consultant</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">Offer specialist guidance, strategic support and practical solutions to clients and organizations.</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-amber-400">Begin consultant registration <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </div>
    </section>

    <section className="py-10 text-center">
      <p className="text-sm text-slate-500">Already approved?</p>
      <Link to="/mentors" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800">
        View the public expert directory <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  </div>
);
