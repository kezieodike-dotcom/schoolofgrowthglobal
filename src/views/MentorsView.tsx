import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Clock3,
  Globe2,
  Languages,
  Lock,
  MapPin,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { MENTORS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import { useMentorPairing } from '../lib/useMentorPairing';
import { MENTORSHIP_PLANS, PLANS, formatNaira } from '../lib/pricing';
import type { Mentor } from '../types';

const MENTORSHIP_CATEGORIES = [
  {
    id: 'business',
    title: 'Business Mentorship',
    items: [
      'Entrepreneurship',
      'Business Strategy',
      'Sales',
      'Marketing',
      'Business Development',
      'Business Finance',
      'Scaling',
    ],
  },
  {
    id: 'leadership',
    title: 'Leadership Mentorship',
    items: [
      'Executive Leadership',
      'People Management',
      'Organizational Leadership',
      'Strategic Leadership',
      'Public Leadership',
    ],
  },
  {
    id: 'career',
    title: 'Career Mentorship',
    items: [
      'Career Development',
      'CV & Interview',
      'Career Transition',
      'Professional Branding',
      'Workplace Performance',
    ],
  },
  {
    id: 'personal',
    title: 'Personal Growth Mentorship',
    items: ['Mindset', 'Productivity', 'Purpose', 'Personal Development', 'Confidence', 'Communication'],
  },
  {
    id: 'wealth',
    title: 'Wealth & Financial Growth',
    items: [
      'Wealth Creation',
      'Financial Management',
      'Investment Education',
      'Income Growth',
      'Entrepreneurship',
    ],
  },
] as const;

const BOOKING_OPTIONS = [
  'One-Hour Mentorship',
  'Two Hours Mentorship',
  'Three Hours Mentorship',
  'Four Hours Mentorship',
  'Five Hours Mentorship',
  'One-Week Mentorship',
  'One-Month Mentorship',
  'One-Year Mentorship',
];

const MENTOR_FOCUS: Record<string, string[]> = {
  m1: ['Business Strategy', 'Business Development', 'Scaling', 'Strategic Leadership'],
  m2: ['Executive Leadership', 'People Management', 'Communication', 'Confidence'],
  m3: ['Entrepreneurship', 'Scaling', 'Business Finance', 'Investment Education'],
  m4: ['Career Development', 'Workplace Performance', 'Professional Branding', 'Productivity'],
  m5: ['Wealth Creation', 'Financial Management', 'Business Finance', 'Income Growth'],
  m6: ['Public Leadership', 'Organizational Leadership', 'Strategic Leadership', 'Business Development'],
};

const MENTOR_DETAILS: Record<
  string,
  Required<
    Pick<
      Mentor,
      | 'specialization'
      | 'yearsExperience'
      | 'languages'
      | 'regionsServed'
      | 'menteeCount'
      | 'intro'
      | 'availableDays'
    >
  >
> = {
  m1: {
    specialization: 'Business Strategy and Global Expansion',
    yearsExperience: 24,
    languages: ['English', 'Yoruba'],
    regionsServed: ['Nigeria', 'United Kingdom', 'Gulf Region'],
    menteeCount: 318,
    intro: 'I help founders and senior operators make sharper market-entry, pricing and board-level growth decisions.',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
  },
  m2: {
    specialization: 'Executive Leadership and People Management',
    yearsExperience: 19,
    languages: ['English', 'Igbo'],
    regionsServed: ['Nigeria', 'Ghana', 'Kenya'],
    menteeCount: 426,
    intro: 'I work with managers and executives who need stronger presence, healthier teams and clearer leadership habits.',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
  },
  m3: {
    specialization: 'Fundraising and Business Scaling',
    yearsExperience: 17,
    languages: ['English'],
    regionsServed: ['West Africa', 'United States', 'Europe'],
    menteeCount: 147,
    intro: 'I guide entrepreneurs through fundraising readiness, investor conversations and expansion strategy.',
    availableDays: ['Friday'],
  },
  m4: {
    specialization: 'Digital Transformation and Career Performance',
    yearsExperience: 16,
    languages: ['English', 'French'],
    regionsServed: ['Nigeria', 'South Africa', 'Remote Global'],
    menteeCount: 203,
    intro: 'I mentor professionals building credible digital transformation, AI policy and data-driven operating models.',
    availableDays: ['Tuesday', 'Wednesday'],
  },
  m5: {
    specialization: 'Wealth Creation and Corporate Finance',
    yearsExperience: 21,
    languages: ['English'],
    regionsServed: ['Nigeria', 'United Arab Emirates', 'United Kingdom'],
    menteeCount: 188,
    intro: 'I help ambitious professionals understand money, valuation, capital markets and wealth-building decisions.',
    availableDays: ['Monday', 'Thursday'],
  },
  m6: {
    specialization: 'Public-Private Partnerships and Infrastructure Leadership',
    yearsExperience: 22,
    languages: ['English', 'Igbo'],
    regionsServed: ['Nigeria', 'East Africa', 'Europe'],
    menteeCount: 96,
    intro: 'I support leaders working across government, infrastructure, partnerships and complex project delivery.',
    availableDays: ['Wednesday', 'Saturday'],
  },
};

const availabilityStyle: Record<string, string> = {
  Available: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Limited: 'text-amber-700 bg-amber-50 border-amber-300',
  Waitlist: 'text-slate-500 bg-slate-100 border-slate-300',
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

function mentorDetails(mentor: Mentor) {
  const fallback = MENTOR_DETAILS[mentor.id];
  return {
    specialization: mentor.specialization ?? fallback?.specialization ?? mentor.expertise[0] ?? 'Personalized mentorship',
    yearsExperience: mentor.yearsExperience ?? fallback?.yearsExperience ?? 10,
    languages: mentor.languages ?? fallback?.languages ?? ['English'],
    regionsServed: mentor.regionsServed ?? fallback?.regionsServed ?? [mentor.location || 'Remote Global'],
    menteeCount: mentor.menteeCount ?? fallback?.menteeCount ?? mentor.sessions,
    intro: mentor.intro ?? fallback?.intro ?? mentor.bio,
    availableDays: mentor.availableDays ?? fallback?.availableDays ?? ['By appointment'],
  };
}

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
              specialization: m.expertise?.[0] ?? 'Personalized mentorship',
              yearsExperience: 10,
              languages: ['English'],
              regionsServed: [m.location || 'Remote Global'],
              menteeCount: 0,
              intro: m.bio,
              availableDays: ['By appointment'],
            })
          )
        );
      })
      .catch(() => {
        // Seed mentors still render when the directory endpoint is unavailable.
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

export const MentorsView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeFocus, setActiveFocus] = useState<string>('All');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [bookingType, setBookingType] = useState(BOOKING_OPTIONS[1]);
  const [subscribeMentor, setSubscribeMentor] = useState<Mentor | null>(null);
  const [slotsFull, setSlotsFull] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);

  const { hasMentorship, mentorSlots, currentPackageName } = useEnrollment();
  const pairing = useMentorPairing(mentorSlots);
  const { mentors: directory, loading } = useDirectory();

  const focusOptions = useMemo(() => {
    if (activeCategory === 'All') return ['All'];
    return ['All', ...(MENTORSHIP_CATEGORIES.find((category) => category.id === activeCategory)?.items ?? [])];
  }, [activeCategory]);

  const filteredMentors = directory.filter((mentor) => {
    const details = mentorDetails(mentor);
    const focus = MENTOR_FOCUS[mentor.id] ?? mentor.expertise;
    const haystack = [
      mentor.name,
      mentor.role,
      mentor.location,
      mentor.bio,
      details.specialization,
      details.languages.join(' '),
      details.regionsServed.join(' '),
      ...mentor.expertise,
      ...focus,
    ]
      .join(' ')
      .toLowerCase();

    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const categoryItems =
      activeCategory === 'All'
        ? []
        : MENTORSHIP_CATEGORIES.find((category) => category.id === activeCategory)?.items ?? [];
    const matchesCategory =
      activeCategory === 'All' || categoryItems.some((item) => focus.includes(item));
    const matchesFocus = activeFocus === 'All' || focus.includes(activeFocus);
    return matchesQuery && matchesCategory && matchesFocus;
  });

  const ordered = [...filteredMentors].sort(
    (a, b) => Number(pairing.isPaired(b.id)) - Number(pairing.isPaired(a.id))
  );

  const chooseMentor = (mentor: Mentor) => {
    if (!hasMentorship) {
      setSubscribeMentor(mentor);
      return;
    }
    if (!pairing.isPaired(mentor.id) && !pairing.pair(mentor.id)) {
      setSlotsFull(true);
      return;
    }
    setBookingMentor(mentor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Mentorship"
        icon={<Users className="w-4 h-4" />}
        title={
          <>
            Find Your{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              Mentor
            </span>
          </>
        }
        subtitle="Connect with carefully selected professionals, executives, entrepreneurs, business leaders, career specialists and growth experts for personalized digital mentorship."
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 items-start">
          <aside className="space-y-5 xl:sticky xl:top-24">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search mentors, skills, regions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setActiveFocus('All');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                All mentorship categories
              </button>

              {MENTORSHIP_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveFocus('All');
                  }}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
                    activeCategory === category.id
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                    {category.title}
                  </span>
                  <span className="block mt-1 text-[11px] leading-relaxed opacity-70">
                    {category.items.join(', ')}
                  </span>
                </button>
              ))}
            </div>

            {focusOptions.length > 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Narrow focus
                </p>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((focus) => (
                    <button
                      key={focus}
                      onClick={() => setActiveFocus(focus)}
                      className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-colors ${
                        activeFocus === focus
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="space-y-7">
            {hasMentorship ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="flex items-center gap-2 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Mentor access is active
                    {currentPackageName === PLANS.maxi.name ? ` with your ${PLANS.maxi.name} package` : ''}. You have used{' '}
                    <strong>{pairing.mentorIds.length} of {mentorSlots}</strong> mentor slots.
                  </span>
                </p>
                <Link
                  to="/portal?tab=messages"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                >
                  Open student messages <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-950 text-white border border-slate-800 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      Student or subscribed mentee access
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold">Browse mentors now. Subscribe to book and message.</h2>
                    <p className="text-sm text-slate-300 max-w-2xl">
                      Students and subscribed mentees can book sessions, pair with mentors and continue conversations from the portal.
                    </p>
                  </div>
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 active:translate-y-px transition-all"
                  >
                    Unlock mentorship <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {ordered.map((mentor) => {
                const details = mentorDetails(mentor);
                const paired = pairing.isPaired(mentor.id);
                return (
                  <article
                    key={mentor.id}
                    className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col gap-5 ${
                      paired ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200'
                    }`}
                  >
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
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif font-bold text-lg text-slate-900 leading-tight">{mentor.name}</h3>
                          {paired && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                              Your mentor
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-700 font-semibold mt-1">{mentor.role}</p>
                        <p className="text-xs text-slate-500 mt-1">{details.specialization}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">{details.intro}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <Fact icon={<BriefcaseBusiness className="w-3.5 h-3.5" />} label="Experience" value={`${details.yearsExperience}+ years`} />
                      <Fact icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />} label="Rating" value={mentor.sessions > 0 ? `${mentor.rating} from ${mentor.sessions} sessions` : 'New profile'} />
                      <Fact icon={<Users className="w-3.5 h-3.5" />} label="Mentees" value={`${details.menteeCount} mentees`} />
                      <Fact icon={<MapPin className="w-3.5 h-3.5" />} label="Base" value={mentor.location} />
                      <Fact icon={<Languages className="w-3.5 h-3.5" />} label="Languages" value={details.languages.join(', ')} />
                      <Fact icon={<Globe2 className="w-3.5 h-3.5" />} label="Regions" value={details.regionsServed.join(', ')} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">Available days</p>
                      <div className="flex flex-wrap gap-2">
                        {details.availableDays.map((day) => (
                          <span key={day} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                            <Clock3 className="w-3 h-3 text-amber-600" />
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(MENTOR_FOCUS[mentor.id] ?? mentor.expertise).map((focus) => (
                        <span key={focus} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                          {focus}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-auto space-y-3">
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className={`px-2.5 py-1 rounded-full border font-mono ${availabilityStyle[mentor.availability]}`}>
                          {mentor.availability}
                        </span>
                        <span className="text-slate-400">{mentor.rate}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => chooseMentor(mentor)}
                          disabled={hasMentorship && !paired && pairing.slotsLeft === 0}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 disabled:bg-slate-100 disabled:text-slate-400 active:translate-y-px transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Book a Session
                        </button>
                        {paired ? (
                          <Link
                            to={`/portal?tab=messages&mentor=${mentor.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 active:translate-y-px transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message Mentor
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => chooseMentor(mentor)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 active:translate-y-px transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                            Select Mentor
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {!loading && ordered.length === 0 && (
              <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
                <p className="text-sm font-semibold text-slate-900">No mentors match that search.</p>
                <p className="text-xs text-slate-500 mt-1">Try another category, specialization or region.</p>
              </div>
            )}

            <div className="rounded-2xl bg-white border border-amber-300 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Are you an experienced professional?</h3>
                <p className="text-sm text-slate-500 mt-1">Apply to become a mentor and serve vetted students and subscribed mentees.</p>
              </div>
              <Link
                to="/register/mentor"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 active:translate-y-px transition-all"
              >
                Register as a Mentor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </main>
        </div>
      </section>

      {bookingMentor && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setBookingMentor(null);
                setBookingSent(false);
              }}
              aria-label="Close booking"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSent ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">Session request sent</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Your request for {bookingType} with {bookingMentor.name} has been noted. The team will confirm the exact schedule.
                </p>
                <Link
                  to={`/portal?tab=messages&mentor=${bookingMentor.id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black"
                >
                  Continue in messages <MessageSquare className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="pr-8">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">Book a Session</p>
                  <h3 className="text-2xl font-serif font-bold text-slate-900 mt-1">{bookingMentor.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{mentorDetails(bookingMentor).specialization}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BOOKING_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBookingType(option)}
                      className={`text-left p-3 rounded-xl border text-xs font-semibold transition-colors ${
                        bookingType === option
                          ? 'bg-amber-50 border-amber-400 text-slate-950'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setBookingSent(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 active:translate-y-px transition-all"
                >
                  Request Booking <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {subscribeMentor && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setSubscribeMentor(null)}
              aria-label="Close"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pr-8">
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">Mentor access required</p>
              <h3 className="text-xl font-serif font-bold text-slate-900 mt-1">Work with {subscribeMentor.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Choose a mentorship plan to book sessions and message this mentor.</p>
            </div>

            <div className="space-y-3">
              {MENTORSHIP_PLANS.map((plan) => (
                <Link
                  key={plan.code}
                  to={`/checkout/${plan.code}?mentor=${subscribeMentor.id}`}
                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${
                    plan.highlight
                      ? 'bg-amber-50 border-amber-400 hover:border-amber-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{plan.mentorSlots} mentor slots, {plan.billing}</p>
                  </div>
                  <span className="text-lg font-serif font-bold text-amber-700">{formatNaira(plan.amountKobo)}</span>
                </Link>
              ))}
            </div>

            <p className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-px text-amber-600" />
              <span>
                The {PLANS.maxi.name} course package includes a full year of mentor access and {PLANS.maxi.mentorSlots} mentor slots.
              </span>
            </p>
          </div>
        </div>
      )}

      {slotsFull && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-7 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">All mentor slots are used</h3>
            <p className="text-sm text-slate-500">
              Your current plan supports {mentorSlots} mentor{mentorSlots === 1 ? '' : 's'} at a time.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSlotsFull(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <Link
                to="/checkout/mentor-1-year"
                className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Go one-year
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Fact: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
    <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
      {icon}
      {label}
    </p>
    <p className="mt-1 text-xs font-semibold text-slate-800 leading-snug">{value}</p>
  </div>
);
