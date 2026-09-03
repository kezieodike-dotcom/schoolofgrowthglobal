import React, { useState } from 'react';
import { EVENTS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useContentCollection } from '../lib/useContent';
import { CalendarDays, MapPin, Video, Users, Ticket, CheckCircle2, ExternalLink } from 'lucide-react';

const TYPES = ['All', 'Conference', 'Webinar', 'Seminar', 'Workshop', 'Bootcamp', 'Virtual Summit'] as const;

const modeIcon = (mode: string) => (mode === 'In-Person' ? <MapPin className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />);

export const EventsView: React.FC = () => {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>('All');
  const [registered, setRegistered] = useState<string | null>(null);
  const managedEvents = useContentCollection('event', EVENTS);

  const events = managedEvents.items.filter((e) => filter === 'All' || e.type === filter);
  const featured = managedEvents.items[0] ?? EVENTS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Events Platform"
        icon={<CalendarDays className="w-4 h-4" />}
        title={<>Conferences, Summits & Live Learning</>}
        subtitle="Register for global conferences, webinars, and bootcamps. Every event includes a QR ticket, livestream access, and downloadable resources."
      />

      {/* Featured event banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="group relative rounded-3xl overflow-hidden border border-amber-300 shadow-2xl">
          <img src={featured.image} alt={featured.title} className="w-full h-72 object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 sm:p-12 max-w-2xl space-y-4">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold w-fit">
              FEATURED • {featured.type.toUpperCase()}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">{featured.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{featured.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-amber-400" /> {featured.date}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-400" /> {featured.location}</span>
            </div>
            {featured.liveClassUrl ? (
              <a
                href={featured.liveClassUrl}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm w-fit flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Join Live Class
              </a>
            ) : (
              <button
                onClick={() => setRegistered(featured.id)}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm w-fit flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" /> Register Now
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Type filter */}
        <div className="flex flex-wrap items-center gap-2 bg-white shadow-sm p-1.5 rounded-xl border border-slate-200 text-xs font-medium mb-10 w-fit">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                filter === t ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 transition-all">
              <div className="relative h-36 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30">
                  {event.type}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700 flex items-center gap-1">
                  {modeIcon(event.mode)} {event.mode}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h4 className="text-lg font-serif font-bold text-slate-900 mb-2">{event.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{event.description}</p>

                <div className="space-y-1.5 text-[11px] text-slate-500 font-mono mb-4">
                  <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-amber-600" /> {event.date} • {event.time}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-600" /> {event.location}</div>
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-amber-600" /> {event.speaker}</div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold font-serif text-amber-600">{event.price}</span>
                    <span className="block text-[10px] text-emerald-600 font-mono">{event.seatsLeft} seats left</span>
                  </div>
                  {event.liveClassUrl ? (
                    <a
                      href={event.liveClassUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Join Live
                    </a>
                  ) : (
                    <button
                      onClick={() => setRegistered(event.id)}
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
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
