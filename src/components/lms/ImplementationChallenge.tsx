import React, { useState, useEffect } from 'react';
import { useLmsSubmission } from '../../lib/useLms';
import { CheckCircle2, Circle } from 'lucide-react';

const DAYS = [
  { day: 1, instruction: 'Observe yourself without judging yourself.' },
  { day: 2, instruction: 'Identify your strengths.' },
  { day: 3, instruction: 'Identify your development gaps.' },
  { day: 4, instruction: 'Examine your values and beliefs.' },
  { day: 5, instruction: 'Observe your emotional and behavioural patterns.' },
  { day: 6, instruction: 'Identify one behaviour you will deliberately change.' },
  { day: 7, instruction: 'Write your 90-day development commitment.' },
];

interface ChallengeState {
  responses: Record<number, string>;
  completed: number[];
}

export const ImplementationChallenge: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, 'implementation-challenge');
  const [state, setState] = useState<ChallengeState>({ responses: {}, completed: [] });

  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  const update = (patch: Partial<ChallengeState>) => {
    const next = { ...state, ...patch };
    setState(next);
    save(next);
  };

  const setResponse = (day: number, text: string) =>
    update({ responses: { ...state.responses, [day]: text } });

  const toggleComplete = (day: number) => {
    const completed = state.completed.includes(day)
      ? state.completed.filter(d => d !== day)
      : [...state.completed, day];
    update({ completed });
  };

  const completedCount = state.completed.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden my-6">
      <div className="bg-slate-900 px-6 py-4">
        <h3 className="text-amber-400 font-bold text-lg">1.18 Implementation Challenge</h3>
        <p className="text-slate-300 text-sm mt-1">For the next seven days, complete one activity each day.</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-slate-700 rounded-full h-2">
            <div
              className="bg-amber-400 rounded-full h-2 transition-all"
              style={{ width: `${(completedCount / 7) * 100}%` }}
            />
          </div>
          <span className="text-amber-400 text-sm font-bold">{completedCount}/7</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {DAYS.map(({ day, instruction }) => {
          const isComplete = state.completed.includes(day);
          return (
            <div key={day} className={`p-5 transition-colors ${isComplete ? 'bg-green-50' : 'bg-white'}`}>
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <button
                    onClick={() => toggleComplete(day)}
                    className={`transition-colors ${isComplete ? 'text-green-500' : 'text-slate-300 hover:text-amber-400'}`}
                    aria-label={`Mark Day ${day} as ${isComplete ? 'incomplete' : 'complete'}`}
                  >
                    {isComplete ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      Day {day}
                    </span>
                    {isComplete && (
                      <span className="text-xs font-semibold text-green-600">Complete</span>
                    )}
                  </div>
                  <p className="text-slate-800 font-semibold text-sm mb-3">{instruction}</p>
                  <textarea
                    rows={3}
                    value={state.responses[day] ?? ''}
                    onChange={e => setResponse(day, e.target.value)}
                    placeholder="Record your observations and reflections here…"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-3 border-t border-slate-100 flex justify-end text-xs text-slate-400">
        {saving ? 'Saving…' : savedAt ? `Last saved ${savedAt.toLocaleTimeString()}` : 'Progress saves automatically'}
      </div>
    </div>
  );
};
