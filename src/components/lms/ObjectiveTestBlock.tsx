import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, LockKeyhole, RotateCcw } from 'lucide-react';
import type { LmsAssessmentQuestion, LmsAssessmentResult } from '../../lib/useLms';

interface ObjectiveTestBlockProps {
  questions: LmsAssessmentQuestion[];
  passMark: number;
  result: LmsAssessmentResult | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: (answers: Record<string, string>) => Promise<LmsAssessmentResult>;
}

export const ObjectiveTestBlock: React.FC<ObjectiveTestBlockProps> = ({
  questions,
  passMark,
  result,
  loading,
  submitting,
  error,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (result?.passed) setAnswers({});
  }, [result?.passed]);

  const selectAnswer = (questionId: string, answer: string) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (questions.some((question) => !answers[question.id])) {
      setValidationError('Answer every question before submitting.');
      return;
    }
    await onSubmit(answers);
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading your assessment…</div>;
  }

  if (result?.passed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-emerald-950">Assessment passed</h2>
            <p className="mt-2 text-emerald-900">You scored {result.score}/{result.total} ({result.percentage}%). The next lesson is unlocked.</p>
            <p className="mt-3 text-sm text-emerald-800">Attempt {result.attempt} · Pass mark {passMark}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-8 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Required assessment</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Module 8 objective test</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Select one answer for each question. You need at least {passMark}% to complete this assessment and continue to the next lesson.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          <LockKeyhole size={14} />
          {questions.length} questions
        </div>
      </div>

      <div className="mt-7 space-y-8">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="border-b border-slate-100 pb-7 last:border-0 last:pb-0">
            <legend className="mb-4 text-base font-bold leading-6 text-slate-900">{index + 1}. {question.prompt}</legend>
            <div className="grid gap-3">
              {question.options.map((option) => {
                const selected = answers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 transition-colors ${selected ? 'border-amber-500 bg-amber-50 text-slate-900' : 'border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={selected}
                      onChange={() => selectAnswer(question.id, option.id)}
                      className="mt-1 accent-amber-500"
                    />
                    <span><strong className="mr-1">{option.id}.</strong>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {(validationError || error) && (
        <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          <span>{validationError ?? error}</span>
        </div>
      )}

      {result && !result.passed && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Previous attempt: {result.score}/{result.total} ({result.percentage}%). Review the relevant lessons and submit again. Your next attempt will replace this result.
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Your result is recorded automatically. The answer key is not displayed.</p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400 disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? 'Marking assessment…' : result ? <><RotateCcw size={16} /> Retake assessment</> : 'Submit assessment'}
        </button>
      </div>
    </section>
  );
};
