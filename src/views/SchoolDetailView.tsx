import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SCHOOLS, COURSES } from '../data/mockData';
import { SchoolIcon, accent } from '../lib/icons';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Award,
  Briefcase,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const SchoolDetailView: React.FC = () => {
  const { schoolId } = useParams();
  const school = SCHOOLS.find((s) => s.id === schoolId);

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4 gap-4">
        <h1 className="text-2xl font-serif font-bold text-white">School not found</h1>
        <Link to="/schools" className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to all schools
        </Link>
      </div>
    );
  }

  const a = accent(school.accentColor);
  const schoolCourses = COURSES.filter((c) => c.schoolId === school.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/schools" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> All Schools
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <SchoolIcon name={school.iconName} className={`w-8 h-8 ${a.text}`} />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {school.code} • {school.programCount} Programs
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                {school.name}
              </h1>
              <p className={`text-sm font-mono ${a.text}`}>{school.tagline}</p>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">{school.overview}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/courses"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all"
                >
                  <span>Browse Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all"
                >
                  Speak to an Advisor
                </Link>
              </div>
            </div>

            {/* Key topics card */}
            <div className="lg:col-span-4">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Core Focus Areas
                </h4>
                <div className="space-y-2">
                  {school.keyTopics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 ${a.text} flex-shrink-0`} />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body: Programs + Careers + Certifications */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Programs */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-2xl font-serif font-bold text-white">Programs & Courses</h3>
            {schoolCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {schoolCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {course.level}
                        </span>
                        <span className="text-xs text-amber-400 font-mono">{course.duration}</span>
                      </div>
                      <h4 className="text-lg font-serif font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4">{course.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{course.instructorName}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400">
                New programs for this faculty are being finalized for the next academic cycle.{' '}
                <Link to="/contact" className="text-amber-400 hover:text-amber-300">Register your interest →</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" /> Career Paths
              </h4>
              <div className="space-y-2">
                {school.careerPaths.map((path, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0" />
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
              <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Certifications
              </h4>
              <div className="space-y-2">
                {school.certifications.map((cert, i) => (
                  <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>All programs include a Growth AI study coach.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
