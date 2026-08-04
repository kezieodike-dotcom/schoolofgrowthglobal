import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MENTORS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import { useMentorPairing } from '../lib/useMentorPairing';
import { MENTORSHIP_PLANS, PLANS, formatNaira } from '../lib/pricing';
import type { Mentor } from '../types';
import {
  Users,
  Star,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  MessageSquare,
  X,
  Sparkles,
} from 'lucide-react';

/**
 * The mentor marketplace.
 *
 * Profiles are public — you cannot choose a mentor you are not allowed to
 * read about. What a subscription buys is the working relationship: pairing,
 * booking, and messaging. So the cards stay fully legible while their actions
 * are gated, which is both more honest and a better shop window than blurring
 * the thing you are trying to sell.
 */

/** Monogram fallback for an admitted mentor who has not supplied a photo. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

const availabilityStyle: Record<string, string> = {
  Available: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  Limited: 'text-amber-600 bg-amber-50 border-amber-300',
  Waitlist: 'text-slate-500 bg-slate-100 border-slate-300',
};

/**
 * The directory: seed mentors plus everyone an admin has admitted.
 *
 * Approved applications arrive without the fields the seed data carries —
 * there is no rating for someone who has not run a session, and no photo
 * because the form does not ask for one. Rather than invent a 4.9 and a
 * stock headshot, those are filled with honest neutral values: a monogram
 * avatar and no rating badge. A fabricated rating on a real person is a lie
 * that a prospective mentee would act on.
 */
function useDirectory(): { mentors: Mentor[]; loading: boolean } {
  const [approved, setApproved] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch('/api/mentors/directory')
      .then((r) => r.json())
      .then((data) => {
        if (!live) return;
        setApproved(
          (data.mentors ?? []).map(
            (m: {
              id: string;
              name: string;
              role: string;
              location: string;
              expertise: string[];
              bio: string;
            }): Mentor => ({
              id: m.id,
              name: m.name,
              role: m.role,
              expertise: m.expertise ?? [],
              location: m.location,
              bio: m.bio,
              rating: 0,
              sessions: 0,
              rate: 'Included in your subscription',
              availability: 'Available',
              avatar: '',
            })
          )
        );
      })
      .catch(() => {
        // The seed directory still renders; a failed fetch should not empty
        // the page.
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  return { mentors: useMemo(() => [...approved, ...MENTORS], [approved]), loading };
}

/** Expertise filters, derived from the directory so they never go stale. */
function useExpertiseAreas(mentors: Mentor[]): string[] {
  return useMemo(() => {
    const seen = new Set<string>();
    mentors.forEach((m) => m.expertise.forEach((e) => seen.add(e)));
    return ['All', ...Array.from(seen).sort()];
  }, [mentors]);
}

export const MentorsView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('All');
  const [booked, setBooked] = useState<Mentor | null>(null);
  /** Mentor whose subscription prompt is open, for non-subscribers. */
  const [choosing, setChoosing] = useState<Mentor | null>(null);
  const [slotsFull, setSlotsFull] = useState(false);

  const { hasMentorship, mentorSlots, currentPackageName } = useEnrollment();
  const pairing = useMentorPairing(mentorSlots);
  const { mentors: directory } = useDirectory();
  const areas = useExpertiseAreas(directory);

  const mentors = directory.filter((m) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.expertise.some((e) => e.toLowerCase().includes(q));
    const matchArea = area === 'All' || m.expertise.includes(area);
    return matchQuery && matchArea;
  });

  // Paired mentors sort to the front so a returning subscriber sees their own
  // people first rather than hunting the grid for them.
  const ordered = [...mentors].sort(
    (a, b) => Number(pairing.isPaired(b.id)) - Number(pairing.isPaired(a.id))
  );

  const handleChoose = (mentor: Mentor) => {
    if (!hasMentorship) {
      setChoosing(mentor);
      return;
    }
    if (!pairing.pair(mentor.id)) setSlotsFull(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Mentor Marketplace"
        icon={<Users className="w-4 h-4" />}
        title={
          <>
            Choose Your Own{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              Mentor.
            </span>
          </>
        }
        subtitle="Browse every mentor registered on the platform, read their record, and pair with the operator who has already built what you are building."
      />

      <section className="py-12 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Access banner ────────────────────────────────────────── */}
        {hasMentorship ? (
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="flex items-center gap-2 text-xs text-emerald-800">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>
                Mentor access is active
                {currentPackageName === 'Maxi' && ' with your Maxi package'} —{' '}
                <strong className="font-bold">
                  {pairing.mentorIds.length} of {mentorSlots}
                </strong>{' '}
                mentor {mentorSlots === 1 ? 'slot' : 'slots'} used.
              </span>
            </p>
            {pairing.slotsLeft > 0 && (
              <span className="text-xs text-emerald-700 font-mono whitespace-nowrap">
                {pairing.slotsLeft} available
              </span>
            )}
          </div>
        ) : (
          <div className="mb-10 rounded-3xl bg-slate-900 text-white shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  Mentor access required
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold">
                  Read every profile free. Subscribe to work with them.
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  A mentorship subscription lets you pair with a mentor, book 1-on-1
                  sessions, and message them between sessions. Cancel any time.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {MENTORSHIP_PLANS.map((plan) => (
                  <Link
                    key={plan.code}
                    to={`/checkout/${plan.code}`}
                    className={`p-4 rounded-2xl border text-center space-y-1 transition-all ${
                      plan.highlight
                        ? 'bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-400'
                        : 'bg-slate-800/60 border-slate-700 text-white hover:border-slate-600'
                    }`}
                  >
                    <span className="block text-lg font-serif font-bold">
                      {formatNaira(plan.amountKobo)}
                    </span>
                    <span
                      className={`block text-[10px] font-mono uppercase tracking-wider ${
                        plan.highlight ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {plan.billing}
                    </span>
                    {plan.highlight && (
                      <span className="block text-[10px] font-bold pt-1">
                        {plan.highlight}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or expertise (e.g. M&A, AI, Leadership)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {areas.slice(0, 8).map((a) => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  area === a
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* ── Directory ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ordered.map((mentor) => {
            const paired = pairing.isPaired(mentor.id);

            return (
              <div
                key={mentor.id}
                className={`bg-white shadow-sm border rounded-2xl p-6 flex flex-col transition-all ${
                  paired
                    ? 'border-emerald-300 ring-1 ring-emerald-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {paired && (
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                    <UserCheck className="w-3.5 h-3.5" />
                    Your mentor
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {mentor.avatar ? (
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300"
                    />
                  ) : (
                    <span className="w-16 h-16 shrink-0 rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-700 flex items-center justify-center font-serif font-bold text-lg">
                      {initials(mentor.name)}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-slate-900 text-base leading-tight">
                      {mentor.name}
                    </h4>
                    <p className="text-xs text-amber-600 mt-0.5">{mentor.role}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                      {/* A newly admitted mentor has no record yet. Showing
                          "0.0 ★ / 0 sessions" reads as a bad mentor rather
                          than a new one, so it says what is actually true. */}
                      {mentor.sessions > 0 ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-600" />{' '}
                            {mentor.rating}
                          </span>
                          <span>{mentor.sessions} sessions</span>
                        </>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Newly admitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mt-4">{mentor.bio}</p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {mentor.expertise.map((e, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200"
                    >
                      {e}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {mentor.location}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full border font-mono ${
                      availabilityStyle[mentor.availability]
                    }`}
                  >
                    {mentor.availability}
                  </span>
                </div>

                {/* ── Actions ──────────────────────────────────────── */}
                <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                  {!hasMentorship ? (
                    <button
                      onClick={() => handleChoose(mentor)}
                      className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Choose {mentor.name.split(' ')[0]}
                    </button>
                  ) : paired ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setBooked(mentor)}
                          disabled={mentor.availability === 'Waitlist'}
                          className="py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {mentor.availability === 'Waitlist' ? 'Waitlist' : 'Book'}
                        </button>
                        <button
                          onClick={() => setBooked(mentor)}
                          className="py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Message
                        </button>
                      </div>
                      <button
                        onClick={() => pairing.unpair(mentor.id)}
                        className="w-full py-1.5 text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Remove as my mentor
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleChoose(mentor)}
                      disabled={pairing.slotsLeft === 0}
                      className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      {pairing.slotsLeft === 0
                        ? 'All slots used'
                        : `Select as my mentor`}
                    </button>
                  )}

                  <p className="text-center text-[10px] text-slate-400 font-mono">
                    {mentor.sessions > 0
                      ? `${mentor.rate} · covered by your subscription`
                      : 'Covered by your subscription'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {ordered.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            No mentors match your search.
          </div>
        )}

        {/* Become a mentor CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-white to-slate-50 shadow-sm border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Are you an industry expert?
            </h3>
            <p className="text-sm text-slate-500">
              Join the directory, set your own schedule, and mentor the next generation
              of global leaders.
            </p>
          </div>
          <Link
            to="/register/mentor"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap flex items-center gap-2"
          >
            Register as a Mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Subscribe prompt, opened by choosing a mentor ──────────── */}
      {choosing && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="choose-mentor-title"
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setChoosing(null)}
              aria-label="Close"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {choosing.avatar ? (
                <img
                  src={choosing.avatar}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300"
                />
              ) : (
                <span className="w-14 h-14 shrink-0 rounded-2xl border-2 border-amber-300 bg-amber-50 text-amber-700 flex items-center justify-center font-serif font-bold">
                  {initials(choosing.name)}
                </span>
              )}
              <div className="min-w-0">
                <h3
                  id="choose-mentor-title"
                  className="text-lg font-serif font-bold text-slate-900 leading-tight"
                >
                  Work with {choosing.name}
                </h3>
                <p className="text-xs text-amber-600">{choosing.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Mentor access is a subscription, not a per-session fee. Choose a plan and{' '}
              {choosing.name.split(' ')[0]} is paired with you as soon as your payment
              clears.
            </p>

            <div className="space-y-3">
              {MENTORSHIP_PLANS.map((plan) => (
                <Link
                  key={plan.code}
                  to={`/checkout/${plan.code}?mentor=${choosing.id}`}
                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    plan.highlight
                      ? 'bg-amber-50 border-amber-400 hover:border-amber-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                      {plan.name.replace('Mentorship — ', '')}
                      {plan.highlight && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-mono uppercase tracking-wider">
                          {plan.highlight}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {plan.mentorSlots} mentor{plan.mentorSlots > 1 ? 's' : ''} ·{' '}
                      {plan.billing}
                    </p>
                  </div>
                  <span className="text-lg font-serif font-bold text-amber-600 whitespace-nowrap">
                    {formatNaira(plan.amountKobo)}
                  </span>
                </Link>
              ))}
            </div>

            <p className="flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-100">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-px text-amber-500" />
              <span>
                The <strong className="text-slate-600">Maxi</strong> course package
                includes a full year of mentor access at no extra cost —{' '}
                <Link to="/pricing" className="text-amber-600 hover:underline">
                  compare packages
                </Link>
                .
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── All slots used ─────────────────────────────────────────── */}
      {slotsFull && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              You've used every mentor slot
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your plan pairs you with {mentorSlots} mentor
              {mentorSlots === 1 ? '' : 's'} at a time. Remove one to make room, or move
              to the annual plan for {PLANS['mentor-annual'].mentorSlots}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSlotsFull(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
              <Link
                to="/checkout/mentor-annual"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center transition-colors"
              >
                Go annual
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking confirmation ───────────────────────────────────── */}
      {booked && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Session Requested
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your request to meet{' '}
              <span className="text-amber-600 font-medium">{booked.name}</span> has been
              sent. You'll receive available time slots and a calendar invite by email.
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
