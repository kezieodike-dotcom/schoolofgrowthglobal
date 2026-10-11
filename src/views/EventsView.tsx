import React, { useState } from 'react';
import { EVENTS } from '../data/mockData';
import { useContentCollection } from '../lib/useContent';
import { ArrowRight, CalendarDays, MapPin, Video, Users, Ticket, CheckCircle2, ExternalLink } from 'lucide-react';

const TYPES = ['All', 'Conference', 'Webinar', 'Seminar', 'Workshop', 'Bootcamp', 'Virtual Summit'] as const;

const modeIcon = (mode: string) => (mode === 'In-Person' ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />);

export const EventsView: React.FC = () => {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>('All');
  const [registered, setRegistered] = useState<string | null>(null);
  const managedEvents = useContentCollection('event', EVENTS);

  const conferenceSchedule = managedEvents.items.filter((event) => event.id.startsWith('global-growth-conference-'));
  const existingEvents = managedEvents.items.filter((event) => !event.id.startsWith('global-growth-conference-'));
  const events = [...conferenceSchedule, ...existingEvents].filter((e) => filter === 'All' || e.type === filter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-mono text-amber-700">
              <CalendarDays className="h-4 w-4" />
              <span>Events Platform</span>
            </div>
            <p className="mb-3 text-xs font-mono font-semibold uppercase tracking-[0.2em] text-amber-700">
              Global Growth Conference
            </p>
            <h1 className="max-w-xl text-4xl font-serif font-semibold leading-[1.04] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Leadership. Strategy. Transformation.
            </h1>
            <div className="mt-6 space-y-4 text-[15px] leading-7 text-slate-600 sm:text-base">
              <p>The Global Growth Conference is the flagship conference and ceremonial platform of School of Growth Global, bringing together emerging leaders, professionals, entrepreneurs, students, graduates, mentors, business leaders, institutions, partners and members of the Global Growth Community.</p>
              <p>Our conferences combine leadership development, strategic growth conversations, networking, learning, recognition, student induction and graduation ceremonies.</p>
              <p>Across the year, School of Growth Global hosts Global Growth Conferences in virtual and physical locations, creating opportunities for people and institutions to connect, learn, grow and create measurable impact.</p>
            </div>
            <a href="#events-grid" className="motion-pressable mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-800">
              Explore upcoming events
              <ArrowRight className="h-4 w-4 text-amber-400" />
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/15">
            <img src="/scenes/events-hero-graduation.jpg" alt="Graduates celebrating at a School of Growth Global conference" className="block h-auto max-h-[38rem] w-full object-contain" />
          </div>
        </div>
      </section>

      <section id="events-grid" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Type filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white shadow-sm p-1.5 rounded-xl border border-slate-200 text-xs font-medium mb-10 w-fit">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`motion-pressable px-3.5 py-2 rounded-lg transition-all ${
                filter === t ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="scroll-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="scroll-card reference-card group flex flex-col overflow-hidden transition-all">
              <div className="reference-card-media relative">
                <img src={event.image} alt={event.title} className="scroll-card-image h-full w-full object-cover opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                <span className="reference-card-pill absolute left-4 top-4">
                  {event.type}
                </span>
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                  {modeIcon(event.mode)} {event.mode}
                </span>
              </div>

              <div className="reference-card-body flex flex-1 flex-col">
                <h4 className="reference-card-title mb-2">{event.title}</h4>
                <p className="reference-card-copy mb-5 line-clamp-3 flex-1">{event.description}</p>

                <div className="reference-card-meta mb-4 space-y-1.5 font-mono">
                  <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-amber-600" /> {event.date} • {event.time}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-600" /> {event.location}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-600" /> {event.speaker}</div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-sm font-bold font-serif text-amber-600">{event.price}</span>
                    <span className="block text-[10px] text-emerald-600 font-mono">{event.seatsLeft > 0 ? `${event.seatsLeft} seats left` : 'Registration opens soon'}</span>
                  </div>
                  {event.liveClassUrl ? (
                    <a
                      href={event.liveClassUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="motion-pressable px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Join Live
                    </a>
                  ) : (
                    <button
                      onClick={() => setRegistered(event.id)}
                      className="motion-pressable px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" /> Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration confirmation modal */}
      {registered && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">You're Registered</h3>
            <p className="text-sm text-slate-500">
              A QR ticket and calendar invite for{' '}
              <span className="text-amber-600 font-medium">{managedEvents.items.find((e) => e.id === registered)?.title}</span> are on
              their way to your inbox.
            </p>
            <button
              onClick={() => setRegistered(null)}
              className="motion-pressable w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
