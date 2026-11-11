import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useLmsAssessment, useLmsCourse, useLmsProgress, useLmsSubmission } from '../lib/useLms';
import { intensivePurchaseFor, leadershipPurchaseFor, useEnrollment } from '../lib/useEnrollment';
import { isIntensiveCourseId } from '../data/intensiveCourses';
import { isPaidCourseId } from '../data/paidCourseCatalogue';
import { PROFESSIONAL_COURSES } from '../data/professionalCourses';
import { ReadingBlock, KeyInsightBlock, FrameworkBlock, QuestionBlock, ReflectionBlock } from '../components/lms/LmsBlocks';
import { ValueDiscoveryExercise } from '../components/lms/ValueDiscoveryExercise';
import { SelfAwarenessAudit } from '../components/lms/SelfAwarenessAudit';
import { PersonalGrowthProject } from '../components/lms/PersonalGrowthProject';
import { ImplementationChallenge } from '../components/lms/ImplementationChallenge';
import { ObjectiveTestBlock } from '../components/lms/ObjectiveTestBlock';
import { LessonHero } from '../components/lms/LessonHero';
import { LeadershipQuiz, LessonList, LessonTable } from '../components/lms/LeadershipLessonBlocks';
import { LmsBlock } from '../types';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, Menu, X, BookOpen, Award, LockKeyhole
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
const SavedReflection: React.FC<{ block: LmsBlock; courseId: string; moduleId: string }> = ({ block, courseId, moduleId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, block.id, moduleId);
  return <ReflectionBlock blockId={block.id} content={block.content ?? ''} savedData={data} onSave={save} saving={saving} savedAt={savedAt} />;
};

const BlockRenderer: React.FC<{ block: LmsBlock; courseId: string; moduleId: string }> = ({ block, courseId, moduleId }) => {
  switch (block.type) {
    case 'reading':
      return <ReadingBlock content={block.content ?? ''} />;
    case 'heading':
      return <h2 className="mb-3 mt-7 break-words text-lg font-bold text-slate-900">{block.content}</h2>;
    case 'list':
      return <LessonList content={block.content ?? ''} />;
    case 'table':
      return <LessonTable content={block.content ?? ''} />;
    case 'leadership_quiz':
      return isPaidCourseId(courseId) && (
        <>
          {block.content && <ReadingBlock content={block.content} />}
          <LeadershipQuiz courseId={courseId} questions={block.metadata.questions} />
        </>
      );
    case 'key_insight':
      return <KeyInsightBlock content={block.content ?? ''} />;
    case 'framework':
      return <FrameworkBlock content={block.content ?? ''} />;
    case 'question':
      return <QuestionBlock content={block.content ?? ''} />;
    case 'reflection':
      return <SavedReflection block={block} courseId={courseId} moduleId={moduleId} />;
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

  const { course, loading, error } = useLmsCourse(courseId);
  const enrollment = useEnrollment();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const leadershipId = isPaidCourseId(courseId) ? courseId : null;
  const professional = PROFESSIONAL_COURSES.find(course => course.id === courseId);
  const intensiveId = isIntensiveCourseId(courseId) ? courseId : null;
  const purchase = leadershipId ? leadershipPurchaseFor(enrollment.entitlements, leadershipId) : intensiveId ? intensivePurchaseFor(enrollment.entitlements, intensiveId) : null;
  const courseHome = intensiveId ? `/lms/${intensiveId}` : professional ? `/courses/${professional.id}` : leadershipId ? '/courses/leadership' : '/lms';

  useEffect(() => {
    if (leadershipId || intensiveId) window.scrollTo(0, 0);
  }, [leadershipId, intensiveId, lessonId]);

  const module = course?.modules.find(m => m.id === moduleId);
  const lessons = (leadershipId || intensiveId ? course?.modules ?? [] : module ? [module] : [])
    .flatMap(entry => entry.lessons.map(item => ({ ...item, moduleId: entry.id })));
  const { progress, markLessonComplete, isLessonComplete, saveError } = useLmsProgress(courseId, lessons.length);

  const currentIndex = lessons.findIndex(l => l.id === lessonId && l.moduleId === moduleId);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : 0;
  const lesson = (leadershipId || intensiveId) && currentIndex < 0 ? undefined : lessons[effectiveIndex];
  const prev = lessons[effectiveIndex - 1];
  const next = lessons[effectiveIndex + 1];

  const isModule8ObjectiveTest = courseId === 'growth-foundation'
    && moduleId === 'module-8'
    && lesson?.id === 'module-8-lesson-16';
  const assessment = useLmsAssessment(courseId, moduleId, lesson?.id ?? '', isModule8ObjectiveTest);
  const module8AssessmentIndex = lessons.findIndex((item) => item.id === 'module-8-lesson-16');
  const module8ProgressLocked = courseId === 'growth-foundation' && moduleId === 'module-8'
    && module8AssessmentIndex >= 0
    && effectiveIndex > module8AssessmentIndex
    && !assessment.result?.passed;

  const isProjectAssessment = courseId === 'growth-foundation' && lesson?.title?.includes('PROJECT ASSESSMENT');
  const isCompletionStandard = courseId === 'growth-foundation' && lesson?.title?.toUpperCase()?.includes('COMPLETION STANDARD');

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

  if ((leadershipId || intensiveId) && !purchase) return <Navigate to={intensiveId ? '/intensives' : courseHome} replace />;
  if (!leadershipId && !intensiveId && !enrollment.canAccessLevel('Emerging Leaders')) {
    return <Navigate to="/portal" replace />;
  }

  if ((leadershipId || intensiveId) && error) {
    return <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Course access</h1>
      <p className="mt-3 text-sm text-slate-600" role="status">{error}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-amber-800">
        {purchase && <Link to={`/payment/callback?reference=${encodeURIComponent(purchase.reference)}`}>Restore access</Link>}
        <Link to={courseHome}>{intensiveId ? 'My intensive' : professional ? 'Course overview' : 'Leadership courses'}</Link>
      </div>
    </main>;
  }

  if (module8ProgressLocked && !assessment.loading) {
    return <Navigate to={`/lms/${courseId}/${moduleId}/module-8-lesson-16`} replace />;
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
            aria-expanded={sidebarOpen}
            aria-controls="lesson-course-outline"
          >
            <Menu size={20} />
          </button>
          <Link to={courseHome} className="flex items-center gap-2 text-slate-600 hover:text-amber-600 text-sm font-medium">
            <BookOpen size={16} />
            <span className="hidden sm:inline">{intensiveId ? course?.title : professional ? 'Professional short course' : leadershipId ? 'School of Leadership' : 'Growth Foundation'}</span>
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
          id="lesson-course-outline"
          className={`
            fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 overflow-y-auto
            transition-transform duration-300
            ${sidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}
            md:visible md:static md:translate-x-0 md:z-auto md:shrink-0
          `}
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">{course?.title}</p>
              <p className="text-sm font-bold text-slate-800">{module?.title}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} aria-label="Close course outline" className="md:hidden p-1 hover:bg-slate-100 rounded">
              <X size={18} />
            </button>
          </div>
          <nav className="p-2" aria-label="Course lessons">
            {leadershipId || intensiveId ? course?.modules.map(group => (
              <details key={`${moduleId}:${group.id}`} open={group.id === moduleId} className="border-b border-slate-100 pb-1">
                <summary className="cursor-pointer rounded-lg px-3 py-3 text-sm font-semibold leading-relaxed text-slate-800 hover:bg-slate-50">{group.title}</summary>
                <ul className="space-y-1 pb-2">
                  {group.lessons.map(item => (
                    <li key={item.id}>
                      <Link to={`/lms/${courseId}/${group.id}/${item.id}`} onClick={() => setSidebarOpen(false)}
                        aria-current={item.id === lesson.id ? 'page' : undefined}
                        className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm leading-relaxed ${item.id === lesson.id ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {isLessonComplete(item.id)
                          ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={15} aria-label="Complete" />
                          : <Circle className="mt-0.5 shrink-0 text-slate-300" size={15} aria-hidden="true" />}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            )) : lessons.map(l => {
              const done = isLessonComplete(l.id);
              const active = l.id === lesson.id;
              return (
                <Link
                  key={l.id}
                  to={`/lms/${courseId}/${l.moduleId}/${l.id}`}
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
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          <div className="max-w-3xl mx-auto">
            {professional && moduleId === 'orientation' && <figure className="mb-7 overflow-hidden rounded-xl bg-slate-100"><img src={professional.image} alt={professional.alt} width={1200} height={800} fetchPriority="high" className="aspect-[3/2] w-full object-cover sm:aspect-[16/9]" /></figure>}
            <div className="mb-6">
              <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">
                {module?.title} · Lesson {effectiveIndex + 1}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{professional && moduleId === 'orientation' ? professional.title : lesson.title}</h1>
              {professional && moduleId === 'orientation' && <p className="mt-3 text-sm font-semibold text-slate-600">{lesson.title}</p>}
              {module?.coreQuestion && effectiveIndex === 0 && (
                <p className="text-slate-500 mt-2">
                  Core Question: <span className="font-semibold text-slate-700 italic">{module.coreQuestion}</span>
                </p>
              )}
            </div>

            <LessonHero courseId={courseId} lesson={lesson} />
            {leadershipId && moduleId === 'orientation' && (
              <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                This enrolment is self-paced. The objective assessment gives instant feedback. Practical work, instructor review and certification follow the School's separate assessment procedures.
              </p>
            )}

            {/* Lesson Blocks */}
            {isCompletionStandard ? (
              <CompletionStandard />
            ) : isProjectAssessment ? (
              <AssessmentTable />
            ) : (
              lesson.blocks.map(block => block.type === 'objective_test' ? (
                <ObjectiveTestBlock
                  key={block.id}
                  questions={assessment.questions}
                  passMark={assessment.passMark}
                  result={assessment.result}
                  loading={assessment.loading}
                  submitting={assessment.submitting}
                  error={assessment.error}
                  onSubmit={async (answers) => {
                    const result = await assessment.submit(answers);
                    if (result.passed) markLessonComplete(lesson.id);
                    return result;
                  }}
                />
              ) : (
                <BlockRenderer key={block.id} block={block} courseId={courseId} moduleId={moduleId} />
              ))
            )}

            {/* Mark Complete + Navigation */}
            <div className="mt-10 pt-6 border-t border-slate-200">
              {saveError && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{saveError}</p>}
              {!isModule8ObjectiveTest && !isLessonComplete(lesson.id) && (
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
                    to={`/lms/${courseId}/${prev.moduleId}/${prev.id}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-amber-600 text-sm font-medium"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Link>
                ) : <div />}
                {next && (!isModule8ObjectiveTest || assessment.result?.passed) ? (
                  <Link
                    to={`/lms/${courseId}/${next.moduleId}/${next.id}`}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Next Lesson
                    <ChevronRight size={18} />
                  </Link>
                ) : isModule8ObjectiveTest && !assessment.result?.passed ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <LockKeyhole size={16} />
                    Pass the assessment to continue
                  </div>
                ) : (
                  <Link
                    to={courseHome}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                  >
                    <Award size={16} />
                    {leadershipId ? 'Leadership courses' : 'Back to Dashboard'}
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
