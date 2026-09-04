import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COURSES, SCHOOLS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import { useContentCollection } from '../lib/useContent';
import { cheapestPackageFor, formatNaira, type CourseLevel, type PackageId } from '../lib/pricing';
import {
  COURSE_LADDER_STEPS,
  COURSE_LADDER_SUMMARY,
  describePrerequisiteFor,
  fastTrackPlanFor,
} from '../lib/courseLadder';
import {
  BookOpen,
  ChevronRight,
  Star,
  Clock,
  Lock,
  LockOpen,
  ArrowRight,
  CircleCheck,
} from 'lucide-react';

const LEVELS = ['All', 'Emerging Leaders', 'Executive', 'Frontier', 'Senior Directorate', 'Elite'] as const;

const COHORT_COURSE_IDS = [
  'growth-foundation-cohort',
  'growth-accelerator',
  'executive-circle',
  'elite-council',
] as const;

const isCohortCourse = (course: { id: string }) =>
  COHORT_COURSE_IDS.includes(course.id as (typeof COHORT_COURSE_IDS)[number]);

const COHORT_PACKAGE_BY_COURSE_ID: Record<(typeof COHORT_COURSE_IDS)[number], PackageId> = {
  'growth-foundation-cohort': 'mini',
  'growth-accelerator': 'medium',
  'executive-circle': 'maxi',
  'elite-council': 'premium',
};

const COHORT_CARD_STYLES: Record<
  (typeof COHORT_COURSE_IDS)[number],
  {
    card: string;
    label: string;
    labelClass: string;
    levelClass: string;
    lockClass: string;
  }
> = {
  'growth-foundation-cohort': {
    card: 'border-amber-300 bg-amber-50/70 hover:border-amber-400 shadow-amber-100/70',
    label: 'Foundation pathway',
    labelClass: 'bg-amber-500 text-slate-950',
    levelClass: 'bg-white text-amber-800 border-amber-200',
    lockClass: 'bg-amber-500 text-slate-950 border-amber-300',
  },
  'growth-accelerator': {
    card: 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-400 shadow-emerald-100/70',
    label: 'Implementation pathway',
    labelClass: 'bg-emerald-600 text-white',
    levelClass: 'bg-white text-emerald-800 border-emerald-200',
    lockClass: 'bg-emerald-600 text-white border-emerald-300',
  },
  'executive-circle': {
    card: 'border-slate-400 bg-slate-100 hover:border-slate-500 shadow-slate-200/80',
    label: 'Executive pathway',
    labelClass: 'bg-slate-950 text-amber-300',
    levelClass: 'bg-white text-slate-800 border-slate-300',
    lockClass: 'bg-slate-950 text-amber-300 border-slate-700',
  },
  'elite-council': {
    card: 'border-amber-500 bg-slate-950 hover:border-amber-400 shadow-slate-300/80',
    label: 'Elite pathway',
    labelClass: 'bg-amber-400 text-slate-950',
    levelClass: 'bg-slate-900 text-amber-300 border-amber-500/40',
    lockClass: 'bg-amber-400 text-slate-950 border-amber-300',
  },
};

export const CoursesView: React.FC = () => {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  const [school, setSchool] = useState('All');
  const [query, setQuery] = useState('');
  const { canAccessLevel, currentPackageName, coursesExpireAt } = useEnrollment();
  const managedCourses = useContentCollection('course', COURSES);

  const courses = managedCourses.items.filter((c) => {
    const matchLevel = level === 'All' || c.level === level;
    const matchSchool = school === 'All' || c.schoolId === school;
    const matchQuery =
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase());
    return matchLevel && matchSchool && matchQuery;
  });

  const cohortCourses = courses.filter(isCohortCourse);
  const specializedCourses = courses.filter((course) => !isCohortCourse(course));

  const renderCourseCard = (course: (typeof courses)[number]) => {
    const unlocked = canAccessLevel(course.level as CourseLevel);
    // Names the specific package that opens this course, so a locked
    // card is an answer ("Growth Accelerator unlocks this") rather than a wall.
    const unlockedBy = cheapestPackageFor(course.level as CourseLevel);
    const cohortStyle = isCohortCourse(course)
      ? COHORT_CARD_STYLES[course.id as (typeof COHORT_COURSE_IDS)[number]]
      : null;
    const cohortPackageCode = isCohortCourse(course)
      ? COHORT_PACKAGE_BY_COURSE_ID[course.id as (typeof COHORT_COURSE_IDS)[number]]
      : null;
    const fastTrack = cohortPackageCode ? fastTrackPlanFor(cohortPackageCode) : null;
    const isEliteCohort = course.id === 'elite-council';

    return (
      <Link
        key={course.id}
        to={`/courses/${course.id}`}
        className={`scroll-card motion-pressable group border shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all ${
          cohortStyle
            ? cohortStyle.card
            : unlocked
              ? 'bg-white border-emerald-200 hover:border-emerald-300'
              : 'bg-white border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={course.heroImage}
            alt={course.title}
            className={`scroll-card-image w-full h-full object-cover transition-all duration-500 ${
              unlocked ? 'opacity-80' : 'opacity-50 grayscale'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30">
            {course.schoolName}
          </span>

          {unlocked ? (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold">
              <LockOpen className="w-3 h-3" /> UNLOCKED
            </span>
          ) : (
            <span
              className={`absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full ${
                cohortStyle?.lockClass ?? 'bg-slate-950/80 border border-amber-500/40'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 ${cohortStyle ? '' : 'text-amber-400'}`} />
            </span>
          )}

          {course.featured && (
            <span className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
              FLAGSHIP
            </span>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          {cohortStyle && (
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider ${cohortStyle.labelClass}`}>
                {cohortStyle.label}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cohortStyle.levelClass}`}>
                Cohort
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mb-2 text-xs">
            <span
              className={`font-mono px-2 py-0.5 rounded border ${
                cohortStyle?.levelClass ?? 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              {course.level}
            </span>
            <span className={`flex items-center gap-1 font-mono ${isEliteCohort ? 'text-amber-300' : 'text-amber-600'}`}>
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
            </span>
          </div>
          <h4 className={`text-lg font-serif font-bold transition-colors mb-2 ${
            isEliteCohort ? 'text-white group-hover:text-amber-300' : 'text-slate-900 group-hover:text-amber-700'
          }`}>
            {course.title}
          </h4>
          <p className={`text-xs line-clamp-2 mb-4 flex-1 ${isEliteCohort ? 'text-slate-300' : 'text-slate-500'}`}>
            {course.description}
          </p>
          {course.modules.length > 0 && (
            <div className={`mb-4 rounded-xl border p-3 space-y-2 ${
              isEliteCohort ? 'bg-slate-900 border-slate-800' : 'bg-white/80 border-slate-200'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${isEliteCohort ? 'text-slate-400' : 'text-slate-500'}`}>
                  Course preview
                </span>
                <span className="text-[10px] font-mono text-amber-700">
                  {course.modules.length} modules
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {course.modules.slice(0, 4).map((module) => (
                  <span
                    key={module.title}
                    className={`rounded-full border px-2 py-1 text-[10px] ${
                      isEliteCohort
                        ? 'bg-slate-950 border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {module.title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {cohortPackageCode && fastTrack && (
            <div className={`mb-4 rounded-xl border p-3 ${
              isEliteCohort ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider">
                Full Growth Ladder
              </p>
              <p className="mt-1 text-[11px] leading-relaxed">
                {describePrerequisiteFor(cohortPackageCode)}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed">
                Two-week fast-track intensive: {formatNaira(fastTrack.amountKobo)} for
                selected modules.
              </p>
            </div>
          )}
          <div className={`pt-4 border-t flex items-center justify-between text-xs ${
            isEliteCohort ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className={`flex items-center gap-1.5 font-mono ${isEliteCohort ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5" /> {course.duration}
            </span>
            {unlocked ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                Start <ChevronRight className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className={`font-mono flex items-center gap-1 ${isEliteCohort ? 'text-amber-300' : 'text-slate-500'}`}>
                <Lock className="w-3 h-3" />
                {unlockedBy.name} unlocks this
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Curriculum Catalog"
        icon={<BookOpen className="w-4 h-4" />}
        title={<>Executive Programs & Courses</>}
        subtitle="Accredited, practitioner-led programs across all 14 schools - from live executive cohorts to self-paced mastery tracks."
        imageSrc="/scenes/bootcamp-team.jpg"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          Enrolment banner. Stated up front rather than discovered one locked
          card at a time, so nobody browses the catalogue believing it is open.
        */}
        {currentPackageName ? (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="flex items-center gap-2 text-xs text-emerald-800">
              <CircleCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong className="font-bold">{currentPackageName}</strong> package
                active
                {coursesExpireAt &&
                  ` - access until ${coursesExpireAt.toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}`}
                .
              </span>
            </p>
            <Link
              to="/pricing"
              className="motion-pressable text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              Upgrade for more <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-serif font-bold">
                  Courses unlock with a package
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browse the full catalogue freely. Choose a package from{' '}
                  {formatNaira(cheapestPackageFor('Emerging Leaders').amountKobo)} to
                  start learning.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="motion-pressable px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              See packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 text-xs font-medium">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`motion-pressable px-3.5 py-2 rounded-lg transition-all ${
                    level === l ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Schools</option>
              {SCHOOLS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs..."
              className="motion-search bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>

        {cohortCourses.length > 0 && (
          <section className="mb-12">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700">
                  Main packages
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                  Cohort Programs
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                {COURSE_LADDER_SUMMARY} Two-week fast-track intensive options are available for selected modules.
              </p>
            </div>
            <div className="mb-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              {COURSE_LADDER_STEPS.map((step) => (
                <div
                  key={step.packageCode}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">
                    Level {step.level}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {cheapestPackageFor(
                      step.packageCode === 'mini'
                        ? 'Emerging Leaders'
                        : step.packageCode === 'medium'
                          ? 'Executive'
                          : step.packageCode === 'maxi'
                            ? 'Senior Directorate'
                            : 'Elite'
                    ).name}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {step.prerequisiteCertificateNames.length
                      ? `Requires verification of ${step.prerequisiteCertificateNames.join(', ')}.`
                      : 'No previous certificate required.'}
                  </p>
                </div>
              ))}
            </div>
            <div className="scroll-card-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {cohortCourses.map(renderCourseCard)}
            </div>
          </section>
        )}

        {specializedCourses.length > 0 && (
          <section>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
                  Additional learning tracks
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-950">
                  Specialized Growth Courses
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                Focused courses that deepen skills across leadership, finance, AI, career growth and business execution.
              </p>
            </div>
            <div className="scroll-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specializedCourses.map(renderCourseCard)}
            </div>
          </section>
        )}

        {courses.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">
            {managedCourses.error ?? 'No programs match your filters.'}
          </div>
        )}

        {/* Tuition is published, not gated behind a sales call. */}
        {!currentPackageName && (
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-white to-slate-50 border border-amber-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-bold text-slate-900">
                Ready to start?
              </h3>
              <p className="text-sm text-slate-500">
                Four packages, published prices, and a clear certificate ladder. Start
                from Growth Foundation or choose a two-week intensive for selected modules.
              </p>
            </div>
            <Link
              to="/pricing"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-colors"
            >
              View packages <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};
