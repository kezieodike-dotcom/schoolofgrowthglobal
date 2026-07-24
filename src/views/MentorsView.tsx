import React, { useState } from 'react';
import { MENTORS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { Users, Star, MapPin, Calendar, Search, CheckCircle2 } from 'lucide-react';

const availabilityStyle: Record<string, string> = {
  Available: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Limited: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Waitlist: 'text-slate-400 bg-slate-800 border-slate-700',
};

export const MentorsView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [booked, setBooked] = useState<string | null>(null);

  const mentors = MENTORS.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.role.toLowerCase().includes(query.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PageHero
        eyebrow="Mentor Marketplace"
        icon={<Users className="w-4 h-4" />}
        title={<>Learn Directly From <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Global Operators.</span></>}
        subtitle="Book 1-on-1 and group sessions with former Fortune 500 CEOs, founders, and domain experts across strategy, finance, AI, and leadership."
      />

      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-md mb-10">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or expertise (e.g. M&A, AI, Leadership)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4">
                <img src={mentor.avatar} alt={mentor.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/30" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-white text-base leading-tight">{mentor.name}</h4>
                  <p className="text-xs text-amber-400 mt-0.5">{mentor.role}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {mentor.rating}
                    </span>
                    <span>{mentor.sessions} sessions</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mt-4">{mentor.bio}</p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {mentor.expertise.map((e, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800/80">
                    {e}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {mentor.location}</span>
                <span className={`px-2 py-0.5 rounded-full border font-mono ${availabilityStyle[mentor.availability]}`}>
                  {mentor.availability}
                </span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold font-serif text-amber-400">{mentor.rate}</span>
                <button
                  onClick={() => setBooked(mentor.id)}
                  disabled={mentor.availability === 'Waitlist'}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {mentor.availability === 'Waitlist' ? 'Join Waitlist' : 'Book Session'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {mentors.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">No mentors match "{query}".</div>
        )}

        {/* Become a mentor CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-white">Are you an industry expert?</h3>
            <p className="text-sm text-slate-400">Join our marketplace, set your schedule, and mentor the next generation of global leaders.</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap">
            Apply to Mentor
          </button>
        </div>
      </section>

      {/* Booking confirmation modal */}
      {booked && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Session Requested</h3>
            <p className="text-sm text-slate-400">
              Your request to book <span className="text-amber-400 font-medium">{MENTORS.find((m) => m.id === booked)?.name}</span> has
              been sent. You'll receive available time slots and a calendar invite by email.
            </p>
            <button
              onClick={() => setBooked(null)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
