import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useLmsCourse, useLmsProgress, useLmsSubmission } from '../lib/useLms';
import { useEnrollment } from '../lib/useEnrollment';
import { ReadingBlock, KeyInsightBlock, FrameworkBlock, QuestionBlock, ReflectionBlock } from '../components/lms/LmsBlocks';
import { ValueDiscoveryExercise } from '../components/lms/ValueDiscoveryExercise';
import { SelfAwarenessAudit } from '../components/lms/SelfAwarenessAudit';
import { PersonalGrowthProject } from '../components/lms/PersonalGrowthProject';
import { ImplementationChallenge } from '../components/lms/ImplementationChallenge';
import { LmsBlock } from '../types';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Menu, X, BookOpen, Award
} from 'lucide-react';

// ─── Assessment Table ─────────────────────────────────────────────────────────
const AssessmentTable: React.FC = () => (
  <div className="my-6 overflow-x-auto">
    <div className="bg-slate-900 text-amber-400 font-bold px-5 py-3 rounded-t-xl">1.17 Project Assessment — 100 Marks</div>
    <table className="w-full border border-slate-200 rounded-b-xl overflow-hidden text-sm">
      <thead className="bg-slate-100">
        <tr>
          <th className="text-left px-4 py-3 text-slate-700 font-semibold">Assessment Area</th>
          <th className="text-right px-4 py-3 text-slate-700 font-semibold">Marks</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {[
          ['Self-awareness', 15],
          ['Strength identification', 10],
          ['Development-gap analysis', 15],
          ['Values and beliefs', 10],
          ['Emotional/behavioural awareness', 10],
          ['Personal responsibility', 10],
          ['Capability assessment', 10],
          ['90-day development plan', 15],
          ['Quality of reflection', 5],
        ].map(([area, marks]) => (
          <tr key={area} className="hover:bg-slate-50">
            <td className="px-4 py-3 text-slate-700">{area}</td>
            <td className="px-4 py-3 text-right font-semibold text-slate-800">{marks}</td>
          </tr>
        ))}
        <tr className="bg-amber-50">
          <td className="px-4 py-3 font-bold text-slate-900">Total</td>
          <td className="px-4 py-3 text-right font-bold text-slate-900">100</td>
        </tr>
      </tbody>
    </table>
    <p className="text-slate-500 text-sm mt-3 italic">A certificate is not issued merely for viewing lessons. The learner must demonstrate completion of the project.</p>
  </div>
);

// ─── Module Completion Standard ───────────────────────────────────────────────
const CompletionStandard: React.FC = () => (
  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 my-6">
    <h3 className="text-amber-400 font-bold text-xl mb-4">Module Completion Standard</h3>
    <p className="text-slate-300 mb-6">You have completed this module when you can:</p>
    <div className="flex flex-col items-center gap-2">
      {[
        'Understand yourself',
        'Identify your gaps',
        'Define what must change',
        'Create a development plan',
        'Begin taking measurable action',
      ].map((step, i, arr) => (
        <React.Fragment key={step}>
          <div className="bg-amber-400 text-slate-900 font-bold px-6 py-2 rounded-full text-sm text-center">
            {step}
          </div>
          {i < arr.length - 1 && <div className="text-amber-400 text-xl">↓</div>}
        </React.Fragment>
      ))}
    </div>
    <div className="mt-8 border-t border-slate-700 pt-6 text-center">
      <p className="text-amber-400 font-semibold">School of Growth Global</p>
      <p className="text-slate-400 text-sm">Leadership. Strategy. Transformation.</p>
      <p className="text-slate-300 text-sm mt-3 italic">
        Growth is not merely knowing more. Growth is becoming more capable of creating value, solving problems, producing results and increasing your capacity to make an impact.
      </p>
    </div>
  </div>
);

// ─── Block Renderer ───────────────────────────────────────────────────────────
const BlockRenderer: React.FC<{ block: LmsBlock; courseId: string; moduleId: string }> = ({ block, courseId, moduleId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, block.id, moduleId);

  switch (block.type) {
    case 'reading':
      return <ReadingBlock content={block.content ?? ''} />;
    case 'key_insight':
      return <KeyInsightBlock content={block.content ?? ''} />;
    case 'framework':
      return <FrameworkBlock content={block.content ?? ''} />;
    case 'question':
      return <QuestionBlock content={block.content ?? ''} />;
    case 'reflection':
      return (
        <ReflectionBlock
          blockId={block.id}
          content={block.content ?? ''}
          savedData={data}
          onSave={save}
          saving={saving}
          savedAt={savedAt}
        />
      );
    case 'value_discovery':
      return <ValueDiscoveryExercise courseId={courseId} />;
    case 'self_awareness_audit':
      return <SelfAwarenessAudit courseId={courseId} />;
    case 'growth_project':
      return <PersonalGrowthProject courseId={courseId} />;
    case 'implementation_challenge':
      return <ImplementationChallenge courseId={courseId} />;
    default:
      return block.content ? <ReadingBlock content={block.content} /> : null;
  }
};

// ─── Main Lesson View ─────────────────────────────────────────────────────────
export const LmsLessonView: React.FC = () => {
  const { courseId = 'growth-foundation', moduleId = 'module-1', lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();

  const { course, loading } = useLmsCourse(courseId);
  const enrollment = useEnrollment();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const module = course?.modules.find(m => m.id === moduleId);
  const lessons = module?.lessons ?? [];
  const { progress, markLessonComplete, isLessonComplete } = useLmsProgress(courseId, lessons.length);

  const currentIndex = lessons.findIndex(l => l.id === lessonId) ?? 0;
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  const lesson = lessons[effectiveIndex];
  const prev = lessons[effectiveIndex - 1];
  const next = lessons[effectiveIndex + 1];

  const isProjectAssessment = lesson?.title?.includes('PROJECT ASSESSMENT');
  const isCompletionStandard = lesson?.title?.toUpperCase()?.includes('COMPLETION STANDARD');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading lesson…</p>
        </div>
      </div>
    );
  }

  if (!enrollment.canAccessLevel('Emerging Leaders')) {
    return <Navigate to="/portal" replace />;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Lesson not found.</p>
      </div>
    );
  }

  const progressBar = (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-200 rounded-full h-2">
        <div
          className="bg-amber-400 rounded-full h-2 transition-all duration-500"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
        {progress.progressPercentage}% complete
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <Link to="/lms" className="flex items-center gap-2 text-slate-600 hover:text-amber-600 text-sm font-medium">
            <BookOpen size={16} />
            <span className="hidden sm:inline">Growth Foundation</span>
          </Link>
          <div className="flex-1 hidden md:block">{progressBar}</div>
          <div className="text-xs text-slate-500 whitespace-nowrap">
            {effectiveIndex + 1} / {lessons.length}
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">{progressBar}</div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 overflow-y-auto
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:static md:translate-x-0 md:z-auto
          `}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">{course?.title}</p>
              <p className="text-sm font-bold text-slate-800">{module?.title}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
          <nav className="p-2">
            {lessons.map((l, i) => {
              const done = isLessonComplete(l.id);
              const active = l.id === lesson.id;
              return (
                <Link
                  key={l.id}
                  to={`/lms/${courseId}/${moduleId}/${l.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                    active
                      ? 'bg-amber-50 text-amber-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="shrink-0">
                    {done ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className={active ? 'text-amber-400' : 'text-slate-300'} />
                    )}
                  </span>
                  <span className="truncate">{l.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
                {module?.title} · Lesson {effectiveIndex + 1}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{lesson.title}</h1>
              {module?.coreQuestion && effectiveIndex === 0 && (
                <p className="text-slate-500 mt-2">
                  Core Question: <span className="font-semibold text-slate-700 italic">{module.coreQuestion}</span>
                </p>
              )}
            </div>

            {/* Lesson Blocks */}
            {isCompletionStandard ? (
              <CompletionStandard />
            ) : isProjectAssessment ? (
              <AssessmentTable />
            ) : (
              lesson.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} courseId={courseId} moduleId={moduleId} />
              ))
            )}

            {/* Mark Complete + Navigation */}
            <div className="mt-10 pt-6 border-t border-slate-200">
              {!isLessonComplete(lesson.id) && (
                <button
                  onClick={() => markLessonComplete(lesson.id)}
                  className="w-full sm:w-auto mb-6 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  <CheckCircle2 size={18} />
                  Mark Lesson as Complete
                </button>
              )}
              {isLessonComplete(lesson.id) && (
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-6">
                  <CheckCircle2 size={20} />
                  Lesson Complete
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                {prev ? (
                  <Link
                    to={`/lms/${courseId}/${moduleId}/${prev.id}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-amber-600 text-sm font-medium"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Link>
                ) : <div />}
                {next ? (
                  <Link
                    to={`/lms/${courseId}/${moduleId}/${next.id}`}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Next Lesson
                    <ChevronRight size={18} />
                  </Link>
                ) : (
                  <Link
                    to="/lms"
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                  >
                    <Award size={16} />
                    Back to Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
