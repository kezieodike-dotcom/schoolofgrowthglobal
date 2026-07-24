import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COURSES, SCHOOLS } from '../data/mockData';
import { PageHero } from '../components/PageHero';
import { BookOpen, ChevronRight, Star, Clock, Lock } from 'lucide-react';

const LEVELS = ['All', 'Executive', 'Senior Directorate', 'Emerging Leaders', 'Frontier'] as const;

export const CoursesView: React.FC = () => {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  const [school, setSchool] = useState('All');
  const [query, setQuery] = useState('');

  const courses = COURSES.filter((c) => {
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
        subtitle="Accredited, practitioner-led programs across all 14 schools — from live executive cohorts to self-paced mastery tracks."
      />

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:border-amber-300 transition-all"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.heroImage}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30">
                  {course.schoolName}
                </span>
                {course.featured && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
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
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-sm">No programs match your filters.</div>
        )}

        {/* Pricing note (per PRD: pricing hidden until registration) */}
        <div className="mt-12 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3 text-xs text-slate-500 max-w-2xl">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            Detailed tuition and sponsorship options are shared during registration. Create a free account or speak
            with an advisor to unlock program pricing and scholarship eligibility.
          </span>
        </div>
      </section>
    </div>
  );
};
