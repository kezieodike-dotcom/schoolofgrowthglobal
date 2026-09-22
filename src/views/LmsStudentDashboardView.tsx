import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLmsCourse, useLmsProgress } from '../lib/useLms';
import { BookOpen, ChevronRight, CheckCircle2, Clock, Award, ArrowRight } from 'lucide-react';

export const LmsStudentDashboardView: React.FC = () => {
  const courseId = 'growth-foundation';
  const { course, loading } = useLmsCourse(courseId);

  const module = course?.modules[0];
  const lessons = module?.lessons ?? [];
  const { progress, isLessonComplete } = useLmsProgress(courseId, lessons.length);

  const completedCount = progress.completedLessons.length;
  const remaining = lessons.length - completedCount;

  // Find the next lesson to continue from
  const nextLesson = lessons.find(l => !isLessonComplete(l.id));
  const firstLesson = lessons[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-2">Student Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{course?.title ?? 'Growth Foundation'}</h1>
          <p className="text-slate-300">{module?.title}</p>
          {module?.transformation && (
            <p className="text-slate-400 text-sm mt-2 font-mono">{module.transformation}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800 text-lg mb-1">Module Progress</h2>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-amber-400 rounded-full h-3 transition-all duration-700"
                    style={{ width: `${progress.progressPercentage}%` }}
                  />
                </div>
                <span className="text-amber-600 font-bold text-sm whitespace-nowrap">
                  {progress.progressPercentage}%
                </span>
              </div>
              <div className="flex gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  {completedCount} completed
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-amber-400" />
                  {remaining} remaining
                </span>
              </div>
            </div>

            <Link
              to={nextLesson
                ? `/lms/${courseId}/${module?.id}/${nextLesson.id}`
                : `/lms/${courseId}/${module?.id}/${firstLesson?.id}`}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              {completedCount === 0 ? 'Start Learning' : 'Continue Learning'}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Lessons', value: lessons.length, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
            { label: 'Remaining', value: remaining, icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Progress', value: `${progress.progressPercentage}%`, icon: Award, color: 'text-purple-600 bg-purple-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="font-bold text-slate-800 text-xl">{value}</div>
              <div className="text-slate-500 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Module Lessons List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4">
            <h2 className="text-amber-400 font-bold text-base">{module?.title} — Lessons</h2>
            {module?.coreQuestion && (
              <p className="text-slate-300 text-sm mt-0.5">Core Question: <em>{module.coreQuestion}</em></p>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {lessons.map((lesson, idx) => {
              const done = isLessonComplete(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/lms/${courseId}/${module?.id}/${lesson.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition-colors group"
                >
                  <span className="shrink-0">
                    {done
                      ? <CheckCircle2 size={20} className="text-green-500" />
                      : <Circle size={20} className="text-slate-200 group-hover:text-amber-300 transition-colors" />
                    }
                  </span>
                  <span className="flex-1 text-slate-700 group-hover:text-amber-700 font-medium text-sm">
                    {lesson.title}
                  </span>
                  {done && (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">Done</span>
                  )}
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Module Completion Standard Preview */}
        <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-center text-white">
          <Award size={32} className="text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Module Completion Standard</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Complete all lessons, submit the Personal Growth Profile project, and demonstrate:
            <br />
            <em className="text-amber-400">Understand yourself → Identify your gaps → Define what must change → Create a development plan → Begin taking measurable action.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

// Named Circle component for lesson list (lucide's Circle is unused above)
function Circle({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
