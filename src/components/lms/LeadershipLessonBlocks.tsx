import { useState, type FormEvent } from 'react';
import type { LmsAssessmentQuestion } from '../../lib/useLms';
import { leadershipAccessToken } from '../../lib/useEnrollment';
import type { LeadershipCourseId } from '../../data/leadershipPricing';

export function LessonList({ content }: { content: string }) {
  const items = content.split('\n');
  const numbered = /^(\d+)\.\s/.exec(items[0]);
  const List = numbered ? 'ol' : 'ul';
  return (
    <List start={numbered ? Number(numbered[1]) : undefined}
      className={`my-4 space-y-2 pl-6 leading-relaxed text-slate-700 marker:font-semibold marker:text-amber-700 ${numbered ? 'list-decimal' : 'list-disc'}`}>
      {items.map((item, index) => (
        <li key={index} value={numbered ? Number(/^(\d+)\./.exec(item)?.[1]) || undefined : undefined}>
          {item.replace(/^(?:\d+\.|[-•])\s+/, '')}
        </li>
      ))}
    </List>
  );
}

export function LessonTable({ content }: { content: string }) {
  const [headers, ...rows] = content.split('\n').map(line => line.split(/[|\t]/).map(cell => cell.trim()));
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={headers.join(', ')}>
      <table className="w-full border-collapse text-left text-sm leading-relaxed">
        <thead className="bg-slate-900 text-white">
          <tr>{headers.map((cell, i) => <th key={i} scope="col" className="px-4 py-3 font-semibold">{cell}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} className="min-w-20 px-4 py-3 align-top text-slate-700">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type QuizScore = { score: number; total: number; percentage: number };

export function LeadershipQuiz({ courseId, questions }: {
  courseId: LeadershipCourseId;
  questions: LmsAssessmentQuestion[];
}) {
  const [result, setResult] = useState<QuizScore>();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const answers = Object.fromEntries(new FormData(event.currentTarget));
    const token = leadershipAccessToken(courseId);
    setSubmitting(true);
    setError('');
    setResult(undefined);
    try {
      const response = await fetch(`/api/lms/leadership/${courseId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ answers }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || typeof body?.percentage !== 'number') throw new Error(body?.error ?? 'Your score could not be calculated. Please try again.');
      setResult(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your score could not be calculated. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-7">
      <p className="text-sm leading-relaxed text-slate-600">Use this knowledge check to review what you learned. You can revise your answers and try again.</p>
      {questions.map((question, index) => (
        <fieldset key={question.id} className="min-w-0 border-t border-slate-100 pt-3" disabled={submitting}>
          <legend className="pr-3 font-semibold text-slate-900">{index + 1}. {question.prompt}</legend>
          <div className="grid gap-2">
            {question.options.map(option => (
              <label key={option.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm leading-relaxed text-slate-700 has-checked:border-amber-500 has-checked:bg-amber-50">
                <input type="radio" name={question.id} value={option.id} required className="mt-1 shrink-0 accent-amber-500" />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60">
        {submitting ? 'Checking answers…' : result ? 'Check again' : 'Check my answers'}
      </button>
      {result && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm font-semibold text-amber-950">Your score is {result.score}/{result.total} ({result.percentage}%).</p>}
      {error && <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    </form>
  );
}
