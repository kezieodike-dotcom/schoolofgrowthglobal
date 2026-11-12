import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FACULTY_MEMBERS, CORPORATE_PARTNERS, IMPACT_STATS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useContentCollection } from '../lib/useContent';
import { useApprovedExperts } from '../lib/useApprovedExperts';
import { buildLeadershipBoard, type BoardMember } from '../lib/leadershipBoard';
import { normalizePublicName } from '../lib/publicProfiles';
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
  RefreshCw,
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

function LeadershipPortrait({ member }: { member: BoardMember }) {
  const [failed, setFailed] = useState(false);
  const initials = normalizePublicName(member.name).split(' ').slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  const generated = member.avatar.includes('generated');
  return (
    <div className="mx-auto flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-300 bg-emerald-50 text-xl font-bold text-emerald-800">
      {member.avatar && !failed ? <img src={member.avatar}
        alt={generated ? `AI-generated professional portrait for ${member.name}` : member.name}
        title={generated ? 'AI-generated professional portrait' : undefined}
        width={80} height={80} loading="lazy" decoding="async" onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${member.id === 'john-akpan' ? 'object-[center_18%]' : 'object-center'}`} />
        : <span role="img" aria-label={`${member.name} profile`}>{initials}</span>}
    </div>
  );
}

export const AboutView: React.FC = () => {
  const managedTeam = useContentCollection('team', FACULTY_MEMBERS);
  const approved = useApprovedExperts();
  const board = useMemo(() => buildLeadershipBoard(managedTeam.items, approved.experts), [managedTeam.items, approved.experts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Our Story"
        icon={<Building2 className="w-4 h-4" />}
        title={<>Raising Transformational Leaders <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">for a Changing World.</span></>}
        subtitle="School of Growth Global is a world-class digital institution dedicated to leadership, business transformation, and lifelong growth for individuals, organizations, and governments."
        imageSrc="/scenes/leadership-meeting.jpg"
      />

      {/* Promise */}
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-700">
              Our Promise
            </p>
            <p className="mt-3 text-lg sm:text-xl font-serif font-semibold leading-relaxed text-slate-900">
              We help you identify your growth challenge, connect you with the right
              expertise, develop a practical strategy, and support you toward
              measurable progress.
            </p>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="border-b border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {IMPACT_STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-serif font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-3">
          <Compass className="w-8 h-8 text-amber-600" />
          <h3 className="text-xl font-serif font-bold text-slate-900">Our Vision</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            To become the world's leading institution for leadership, personal development, business transformation,
            wealth creation, and strategic growth.
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-white shadow-sm border border-slate-200 space-y-3">
          <Target className="w-8 h-8 text-amber-600" />
          <h3 className="text-xl font-serif font-bold text-slate-900">Our Mission</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            To empower individuals, entrepreneurs, professionals, organizations, and governments through
            transformational education, strategic consulting, mentorship, research, and innovation.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600">What We Stand For</span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {CORE_VALUES.map((v) => (
              <div key={v.label} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 hover:border-amber-400 transition-all">
                <v.icon className="w-6 h-6 text-amber-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 font-serif">{v.label}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section id="leadership-board" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-600">Academic Leadership</span>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Leadership &amp; Advisory Board</h2>
          <p className="text-sm text-slate-500">Institutional leadership, approved mentors and consultants supporting our growth community.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {board.map((member) => (
            <article key={member.id} data-board-member={member.id} className="min-w-0 bg-white shadow-sm border border-slate-200 rounded-lg p-6 space-y-4 [overflow-wrap:anywhere]">
              <LeadershipPortrait key={member.avatar} member={member} />
              <div className="text-center space-y-1">
                <h4 className="font-serif font-bold text-slate-900 text-base">{member.name}</h4>
                {member.expertTypes.length > 0 && <p className="text-xs font-semibold text-emerald-700">{member.expertTypes.map(type => type === 'consultant' ? 'Approved Consultant' : 'Approved Mentor').join(' / ')}</p>}
                <p className="text-xs text-amber-600 font-medium">{member.role}</p>
                <p className="text-[11px] text-slate-500">{member.institution}</p>
              </div>
              {member.credentials.length > 0 && <div className="pt-3 border-t border-slate-200 space-y-1 text-xs leading-relaxed text-slate-500">
                {member.credentials.map((cred, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>{cred}</span>
                  </div>
                ))}
              </div>}
            </article>
          ))}
        </div>
        {approved.loading && <p role="status" className="mt-6 text-center text-sm text-slate-500">Loading approved profiles...</p>}
        {approved.error && <div role="status" className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
          <p>{approved.error}</p>
          <button type="button" onClick={approved.retry} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"><RefreshCw className="h-4 w-4" aria-hidden="true" />Retry</button>
        </div>}
      </section>

      {/* Partners + Accreditation */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">Global Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-70">
              {CORPORATE_PARTNERS.map((p, i) => (
                <span key={i} className="text-slate-600 font-serif font-bold text-sm tracking-wide">{p}</span>
              ))}
            </div>
          </div>
          <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-slate-50 border border-amber-300 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="text-slate-900 font-medium text-sm">Globally Accredited Excellence</h4>
              <p className="text-xs text-slate-500">
                Certified by the International Council for Executive Education &amp; Governance • ISO 21001 Certified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-white to-slate-50 shadow-sm border border-amber-300 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-2xl font-serif font-bold text-slate-900">Ready to begin your growth journey?</h3>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Explore our programs, or talk to an advisor about corporate and government training.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/courses" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm">
              Explore Courses
            </Link>
            <Link to="/schools" className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm">
              View Schools &amp; Faculties
            </Link>
            <Link to="/contact" className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
