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
  Mail,
  MapPin,
  MessageSquare,
  Search,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { MENTORS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { CountryPhoneField } from '../components/CountryPhoneField';
import { useEnrollment } from '../lib/useEnrollment';
import { useMentorPairing } from '../lib/useMentorPairing';
import { PACKAGES, PLANS, formatNaira } from '../lib/pricing';
import { paymentLinkForLadder, planCodeForLadder } from '../lib/ladderPayments';
import { summarizeMentorReviews } from '../lib/mentorReviews';
import { useMentorReviews } from '../lib/useMentorReviews';
import { HONEYPOT_PROPS, useFormSubmit } from '../lib/useFormSubmit';
import {
  CONSULTATION_LADDER,
  CONSULTATION_PRICING_BANDS,
  CORPORATE_PRICING_BANDS,
  MASTER_GROWTH_DIVISIONS,
  MENTORSHIP_LADDER,
  MENTORSHIP_PRICING_BANDS,
  MENTORSHIP_SERVICE_MODEL,
  formatPriceRange,
  type GrowthDivision,
  type LadderItem,
} from '../lib/mentorshipCatalogue';
import type { Mentor } from '../types';

const MENTOR_FOCUS: Record<string, string[]> = {
  m1: ['Business Strategy', 'Business Development', 'Scaling', 'Strategic Leadership'],
  m2: ['Executive Leadership', 'People Management', 'Communication', 'Confidence'],
  m3: ['Entrepreneurship', 'Scaling', 'Business Finance', 'Investment Education'],
  m4: ['Career Development', 'Workplace Performance', 'Professional Branding', 'Productivity'],
  m5: ['Wealth Creation', 'Financial Management', 'Business Finance', 'Income Growth'],
  m6: ['Public Leadership', 'Organizational Leadership', 'Strategic Leadership', 'Business Development'],
};

const REQUEST_PRODUCTS = [
  ...CONSULTATION_LADDER.map((item) => ({
    group: 'Consultation',
    label: `${item.title} (${item.duration})`,
    value: item.title,
  })),
  ...MENTORSHIP_LADDER.map((item) => ({
    group: 'Mentorship',
    label: `${item.title} (${item.duration})`,
    value: item.title,
  })),
];

const BUDGET_OPTIONS = [
  ...CONSULTATION_PRICING_BANDS.map((band) => `${band.name}: ${formatPriceRange(band.range)}`),
  ...MENTORSHIP_PRICING_BANDS.map((band) => `${band.name}: ${formatPriceRange(band.range)}`),
  ...CORPORATE_PRICING_BANDS.slice(0, 3).map((band) => `${band.name}: ${formatPriceRange(band.range)}`),
];

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
  const [slotsFull, setSlotsFull] = useState(false);

  const { hasMentorship, mentorSlots, currentPackageName } = useEnrollment();
  const pairing = useMentorPairing(mentorSlots);
  const { mentors: directory, loading } = useDirectory();
  const mentorReviews = useMentorReviews();
  const currentPackageIncludesMentorship = Boolean(
    currentPackageName &&
      PACKAGES.some(
        (plan) => plan.name === currentPackageName && plan.mentorshipDays > 0
      )
  );
  const activeDivision =
    activeCategory === 'All'
      ? null
      : MASTER_GROWTH_DIVISIONS.find((division) => division.id === activeCategory) ?? null;

  const focusOptions = useMemo(() => {
    if (activeCategory === 'All') return ['All'];
    const division = MASTER_GROWTH_DIVISIONS.find((item) => item.id === activeCategory);
    if (!division) return ['All'];
    return ['All', ...division.services.slice(0, 10), ...division.products.slice(0, 4)];
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
    const division =
      activeCategory === 'All'
        ? null
        : MASTER_GROWTH_DIVISIONS.find((category) => category.id === activeCategory);
    const categoryItems = division
      ? [division.title, ...division.services, ...division.products]
      : [];
    const matchesCategory =
      activeCategory === 'All' ||
      categoryItems.some((item) => haystack.includes(item.toLowerCase()) || focus.includes(item));
    const matchesFocus =
      activeFocus === 'All' ||
      haystack.includes(activeFocus.toLowerCase()) ||
      focus.includes(activeFocus);
    return matchesQuery && matchesCategory && matchesFocus;
  });

  const ordered = [...filteredMentors].sort(
    (a, b) => Number(pairing.isPaired(b.id)) - Number(pairing.isPaired(a.id))
  );

  const chooseMentor = (mentor: Mentor) => {
    if (!hasMentorship) {
      setBookingMentor(mentor);
      return;
    }
    if (!pairing.isPaired(mentor.id) && !pairing.pair(mentor.id)) {
      setSlotsFull(true);
      return;
    }
    setBookingMentor(mentor);
  };

  const requestConsultation = (mentor: Mentor) => {
    setBookingMentor(mentor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Consultation / Mentorship / Transformation"
        icon={<Users className="w-4 h-4" />}
        title={
          <>
            Find the Right Guidance &{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
              Growth Expert You Need
            </span>
          </>
        }
        subtitle="Every season of life, career, and business comes with different questions. Our consultation and mentorship experiences are designed to meet you where you are and help you move forward with greater clarity, confidence, and strategy. Not sure which option is right for you? Start with a conversation. Tell us what you're facing, what you're trying to achieve, and where you need help. We'll help you identify the right pathway for your growth."
      />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MENTORSHIP_SERVICE_MODEL.map((stage, index) => (
              <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-base sm:text-lg font-serif font-bold text-slate-900">
                  {stage}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-start">
            <div className="rounded-3xl bg-slate-950 text-white border border-slate-800 p-6 sm:p-8">
              <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                Growth direction
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-bold leading-tight">
                Tell Us Where You Are. We'll Help You Discover Where to Go Next.
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Whether you need clarity, direction, strategy, accountability, or someone
                experienced to walk with you, we're here to help you identify where you
                are, understand where you want to go, and create a practical path to get
                there.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LadderPanel title="Consultation ladder" items={CONSULTATION_LADDER} />
              <LadderPanel title="Mentorship ladder" items={MENTORSHIP_LADDER} />
            </div>
          </div>
        </div>
      </section>

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
                All growth divisions
              </button>

              {MASTER_GROWTH_DIVISIONS.map((category) => (
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
                  <span className="flex items-center gap-2 text-sm font-black leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                    {category.title}
                  </span>
                  <span className="block mt-1 text-[11px] leading-relaxed opacity-70">
                    {category.services.slice(0, 5).join(', ')}
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
            <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-amber-700">
                    {activeDivision ? 'Selected division' : 'Master growth divisions'}
                  </p>
                  <h2 className="mt-2 text-2xl font-serif font-bold text-slate-900">
                    {activeDivision?.title ?? 'Choose the area where you need growth'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {activeDivision
                      ? activeDivision.whyClientsCome.join(' ')
                      : 'School of Growth Global connects individuals, professionals, entrepreneurs, leaders and organizations with knowledge, expertise, strategy, mentorship and practical support for measurable results.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const mentor = ordered[0] ?? MENTORS[0];
                    if (mentor) setBookingMentor(mentor);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all"
                >
                  Request consultation <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {activeDivision ? (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Services</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeDivision.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Products</p>
                    <div className="mt-3 space-y-2">
                      {activeDivision.products.map((product) => (
                        <div
                          key={product}
                          className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900"
                        >
                          {product}
                        </div>
                      ))}
                    </div>
                    {activeDivision.note && (
                      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                        {activeDivision.note}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MASTER_GROWTH_DIVISIONS.slice(0, 6).map((division) => (
                    <button
                      key={division.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(division.id);
                        setActiveFocus('All');
                      }}
                      className="text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:border-amber-300 transition-colors"
                    >
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {division.title}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                        {division.products.slice(0, 2).join(' / ')}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {hasMentorship ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="flex items-center gap-2 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Mentor access is active
                    {currentPackageIncludesMentorship && currentPackageName
                      ? ` with your ${currentPackageName} package`
                      : ''}. You have used{' '}
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 text-sm font-black hover:bg-amber-400 transition-all"
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
                const ratingSummary = summarizeMentorReviews(
                  mentor.id,
                  mentor.rating,
                  mentor.sessions,
                  mentorReviews
                );
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
                      <Fact icon={<Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" />} label="Rating" value={ratingSummary.reviewCount > 0 ? `${ratingSummary.rating} from ${ratingSummary.reviewCount} reviews` : 'New profile'} />
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

                    {ratingSummary.latest.length > 0 && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                          Mentee reviews
                        </p>
                        {ratingSummary.latest.slice(0, 2).map((review) => (
                          <div key={`${review.studentEmail}-${review.createdAt}`} className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-800">{review.studentName}</p>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {review.rating}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

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
                          onClick={() => requestConsultation(mentor)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Request Consultation
                        </button>
                        {paired ? (
                          <Link
                            to={`/portal?tab=messages&mentor=${mentor.id}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message Mentor
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => chooseMentor(mentor)}
                            disabled={hasMentorship && pairing.slotsLeft === 0}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all"
                          >
                            <UserCheck className="w-4 h-4" />
                            {hasMentorship ? 'Pair Mentor' : 'Request Quote'}
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
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition-all"
              >
                Register as a Mentor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </main>
        </div>
      </section>

      {bookingMentor && (
        <ConsultationRequestModal
          mentor={bookingMentor}
          selectedDivision={activeDivision}
          onClose={() => setBookingMentor(null)}
        />
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

const LadderPanel: React.FC<{ title: string; items: LadderItem[] }> = ({ title, items }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
    <h3 className="text-base font-serif font-bold text-white">{title}</h3>
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-950">
              {item.level}
            </span>
            <span className="text-[11px] font-mono text-slate-300">{item.duration}</span>
          </div>
          <h4 className="mt-3 text-sm font-bold text-white">{item.title}</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.description}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-amber-100">{item.outcome}</p>
          <Link
            to={paymentLinkForLadder(item.title)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-[11px] font-black text-slate-950 transition hover:bg-amber-400"
          >
            Pay from {formatNaira(PLANS[planCodeForLadder(item.title)].amountKobo)}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ))}
    </div>
  </div>
);

const REQUEST_INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100';

const RequestField: React.FC<{
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}> = ({ label, children, wide }) => (
  <label className={`space-y-1.5 ${wide ? 'sm:col-span-2' : ''}`}>
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const ConsultationRequestModal: React.FC<{
  mentor: Mentor;
  selectedDivision?: GrowthDivision;
  onClose: () => void;
}> = ({ mentor, selectedDivision, onClose }) => {
  const { status, error, submit, sending } = useFormSubmit('consultation');
  const defaultDivision = selectedDivision?.title ?? MASTER_GROWTH_DIVISIONS[0]?.title ?? '';
  const defaultProduct = REQUEST_PRODUCTS[1]?.value ?? REQUEST_PRODUCTS[0]?.value ?? '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Consultation request
            </p>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Work with {mentor.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close request form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={(event) => submit(event, { mentor: mentor.name })}
          className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6"
        >
          <input {...HONEYPOT_PROPS} />

          <RequestField label="Full name">
            <input name="name" required className={REQUEST_INPUT_CLASS} placeholder="Your name" />
          </RequestField>

          <RequestField label="Email">
            <input
              name="email"
              type="email"
              required
              className={REQUEST_INPUT_CLASS}
              placeholder="you@example.com"
            />
          </RequestField>

          <RequestField label="Phone / WhatsApp">
            <CountryPhoneField name="phone" required className={REQUEST_INPUT_CLASS} />
          </RequestField>

          <RequestField label="Growth division">
            <select name="division" required className={REQUEST_INPUT_CLASS} defaultValue={defaultDivision}>
              {MASTER_GROWTH_DIVISIONS.map((division) => (
                <option key={division.id} value={division.title}>
                  {division.title}
                </option>
              ))}
            </select>
          </RequestField>

          <RequestField label="Product">
            <select name="product" required className={REQUEST_INPUT_CLASS} defaultValue={defaultProduct}>
              {REQUEST_PRODUCTS.map((product) => (
                <option key={`${product.group}-${product.value}`} value={product.value}>
                  {product.group}: {product.label}
                </option>
              ))}
            </select>
          </RequestField>

          <RequestField label="Budget / pricing band">
            <select name="budget" className={REQUEST_INPUT_CLASS} defaultValue="">
              <option value="">Let the team recommend</option>
              {BUDGET_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </RequestField>

          <RequestField label="Preferred mentor">
            <input name="mentor" readOnly className={`${REQUEST_INPUT_CLASS} bg-slate-50`} value={mentor.name} />
          </RequestField>

          <RequestField label="What do you need help with?" wide>
            <textarea
              name="message"
              required
              rows={5}
              className={`${REQUEST_INPUT_CLASS} resize-none`}
              placeholder="Describe the business, career, leadership, personal or organizational issue you want to solve."
            />
          </RequestField>

          {status === 'sent' && (
            <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
              Request received. The team will follow up with the right quote and next step.
            </div>
          )}

          {error && (
            <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="sm:col-span-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send Request'}
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
