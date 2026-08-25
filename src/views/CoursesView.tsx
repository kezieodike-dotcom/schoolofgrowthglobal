import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COURSES, SCHOOLS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { useEnrollment } from '../lib/useEnrollment';
import { useContentCollection } from '../lib/useContent';
import { cheapestPackageFor, formatNaira, type CourseLevel } from '../lib/pricing';
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

const LEVELS = ['All', 'Executive', 'Senior Directorate', 'Emerging Leaders', 'Frontier'] as const;

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHero
        eyebrow="Curriculum Catalog"
        icon={<BookOpen className="w-4 h-4" />}
        title={<>Executive Programs & Courses</>}
        subtitle="Accredited, practitioner-led programs across all 14 schools - from live executive cohorts to self-paced mastery tracks."
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
              className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 whitespace-nowrap"
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
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
                className={`px-3.5 py-2 rounded-lg transition-all ${
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
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const unlocked = canAccessLevel(course.level as CourseLevel);
            // Names the specific package that opens this course, so a locked
            // card is an answer ("Executive Cycle unlocks this") rather than a wall.
            const unlockedBy = cheapestPackageFor(course.level as CourseLevel);

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className={`group bg-white border shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all ${
                  unlocked
                    ? 'border-emerald-200 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.heroImage}
                    alt={course.title}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
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
                    <span className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full bg-slate-950/80 border border-amber-500/40">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}

                  {course.featured && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
                      FLAGSHIP
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                      {course.level}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{course.description}</p>
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </span>
                    {unlocked ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        Start <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {unlockedBy.name} unlocks this
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

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
                Three packages, published prices, no application queue. Pay once and
                your courses open immediately.
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
