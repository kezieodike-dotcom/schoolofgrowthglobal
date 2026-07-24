import React from 'react';
import { Link } from 'react-router-dom';
import { FACULTY_MEMBERS, CORPORATE_PARTNERS, IMPACT_STATS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import {
  Building2,
  Target,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Heart,
  Award,
  Lightbulb,
  HandHeart,
  Leaf,
  TrendingUp,
} from 'lucide-react';

const CORE_VALUES = [
  { icon: TrendingUp, label: 'Growth', desc: 'Relentless pursuit of progress and improvement.' },
  { icon: ShieldCheck, label: 'Integrity', desc: 'Doing what is right, always.' },
  { icon: Award, label: 'Excellence', desc: 'World-class standards in everything we deliver.' },
  { icon: Lightbulb, label: 'Innovation', desc: 'Pioneering new ways to learn and lead.' },
  { icon: HandHeart, label: 'Service', desc: 'Serving learners, organizations, and society.' },
  { icon: Leaf, label: 'Stewardship', desc: 'Responsible use of resources and influence.' },
  { icon: Heart, label: 'Impact', desc: 'Measurable transformation at scale.' },
];

export const AboutView: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PageHero
        eyebrow="Our Story"
        icon={<Building2 className="w-4 h-4" />}
        title={<>Raising Transformational Leaders <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">for a Changing World.</span></>}
        subtitle="School of Growth Global is a world-class digital institution dedicated to leadership, business transformation, and lifelong growth for individuals, organizations, and governments."
      />

      {/* Impact stats */}
      <section className="border-b border-slate-800 bg-slate-900/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-serif font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Compass className="w-8 h-8 text-amber-400" />
          <h3 className="text-xl font-serif font-bold text-white">Our Vision</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            To become the world's leading institution for leadership, personal development, business transformation,
            wealth creation, and strategic growth.
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Target className="w-8 h-8 text-amber-400" />
          <h3 className="text-xl font-serif font-bold text-white">Our Mission</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            To empower individuals, entrepreneurs, professionals, organizations, and governments through
            transformational education, strategic consulting, mentorship, research, and innovation.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">What We Stand For</span>
            <h2 className="text-3xl font-serif font-bold text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {CORE_VALUES.map((v) => (
              <div key={v.label} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2 hover:border-amber-500/40 transition-all">
                <v.icon className="w-6 h-6 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white font-serif">{v.label}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">Academic Leadership</span>
          <h2 className="text-3xl font-serif font-bold text-white">Leadership Team & Advisory Board</h2>
          <p className="text-sm text-slate-400">Former McKinsey directors, Harvard fellows, and global venture partners.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACULTY_MEMBERS.map((member) => (
            <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <img src={member.avatar} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-amber-500/30" />
              <div className="text-center space-y-1">
                <h4 className="font-serif font-bold text-white text-base">{member.name}</h4>
                <p className="text-xs text-amber-400 font-medium">{member.role}</p>
                <p className="text-[11px] text-slate-400">{member.institution}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 space-y-1 text-[10px] text-slate-400">
                {member.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners + Accreditation */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">Global Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
              {CORPORATE_PARTNERS.map((p, i) => (
                <span key={i} className="text-slate-300 font-serif font-bold text-sm tracking-wide">{p}</span>
              ))}
            </div>
          </div>
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium text-sm">Globally Accredited Excellence</h4>
              <p className="text-xs text-slate-400">
                Certified by the International Council for Executive Education &amp; Governance • ISO 21001 Certified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/30 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-serif font-bold text-white">Ready to begin your growth journey?</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Explore our schools and programs, or talk to an advisor about corporate and government training.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/schools" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">
              Explore Schools
            </Link>
            <Link to="/contact" className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
