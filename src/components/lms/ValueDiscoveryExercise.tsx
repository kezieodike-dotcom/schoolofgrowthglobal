import React, { useState, useEffect } from 'react';
import { useLmsSubmission } from '../../lib/useLms';
import { Check, ChevronRight } from 'lucide-react';

const ALL_VALUES = [
  'Integrity', 'Excellence', 'Freedom', 'Family', 'Service', 'Faith',
  'Learning', 'Security', 'Creativity', 'Responsibility', 'Justice',
  'Leadership', 'Growth', 'Contribution', 'Courage', 'Discipline',
  'Compassion', 'Innovation', 'Loyalty', 'Resilience',
];

const QUESTIONS = [
  'Why is this important to me?',
  'What behaviour demonstrates this value?',
  'Where am I currently violating this value?',
  'What decision would I make differently if I lived this value consistently?',
];

interface ValueDiscoveryState {
  step: number;
  selected10: string[];
  selected5: string[];
  selected3: string[];
  answers: Record<string, string[]>; // value -> [q0, q1, q2, q3]
}

export const ValueDiscoveryExercise: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, 'value-discovery-exercise');

  const defaultState: ValueDiscoveryState = {
    step: 1,
    selected10: [],
    selected5: [],
    selected3: [],
    answers: {},
  };

  const [state, setState] = useState<ValueDiscoveryState>(defaultState);

  useEffect(() => {
    if (data) setState(data);
  }, [data]);

  const update = (patch: Partial<ValueDiscoveryState>) => {
    const next = { ...state, ...patch };
    setState(next);
    save(next);
  };

  const toggle = (pool: 'selected10' | 'selected5' | 'selected3', val: string, max: number) => {
    const arr = state[pool];
    if (arr.includes(val)) {
      update({ [pool]: arr.filter(v => v !== val) });
    } else if (arr.length < max) {
      update({ [pool]: [...arr, val] });
    }
  };

  const setAnswer = (value: string, qIdx: number, text: string) => {
    const prev = state.answers[value] ?? ['', '', '', ''];
    const updated = [...prev];
    updated[qIdx] = text;
    update({ answers: { ...state.answers, [value]: updated } });
  };

  const pool1 = ALL_VALUES;
  const pool2 = state.selected10;
  const pool3 = state.selected5;
  const finalValues = state.selected3;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden my-6">
      <div className="bg-slate-900 px-6 py-4">
        <h3 className="text-amber-400 font-bold text-lg">Value Discovery Exercise</h3>
        <p className="text-slate-300 text-sm mt-1">A structured exercise to clarify what matters most to you.</p>
      </div>

      {/* Step indicator */}
      <div className="flex border-b border-slate-100">
        {[1, 2, 3, 4].map(s => (
          <button
            key={s}
            onClick={() => s < state.step && update({ step: s })}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              state.step === s
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400'
                : s < state.step
                ? 'text-green-600 bg-green-50'
                : 'text-slate-400'
            }`}
          >
            {s < state.step ? <Check size={12} className="inline mr-1" /> : null}
            Step {s}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* STEP 1 */}
        {state.step === 1 && (
          <>
            <h4 className="font-semibold text-slate-800 mb-1">Step 1: Choose your ten most important values</h4>
            <p className="text-sm text-slate-500 mb-4">Selected: {state.selected10.length}/10</p>
            <div className="flex flex-wrap gap-2">
              {pool1.map(v => (
                <button
                  key={v}
                  onClick={() => toggle('selected10', v, 10)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    state.selected10.includes(v)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {state.selected10.length === 10 && (
              <button
                onClick={() => update({ step: 2 })}
                className="mt-5 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
              >
                Next Step <ChevronRight size={16} />
              </button>
            )}
          </>
        )}

        {/* STEP 2 */}
        {state.step === 2 && (
          <>
            <h4 className="font-semibold text-slate-800 mb-1">Step 2: Reduce to your five most important values</h4>
            <p className="text-sm text-slate-500 mb-4">Selected: {state.selected5.length}/5</p>
            <div className="flex flex-wrap gap-2">
              {pool2.map(v => (
                <button
                  key={v}
                  onClick={() => toggle('selected5', v, 5)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    state.selected5.includes(v)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {state.selected5.length === 5 && (
              <button
                onClick={() => update({ step: 3 })}
                className="mt-5 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
              >
                Next Step <ChevronRight size={16} />
              </button>
            )}
          </>
        )}

        {/* STEP 3 */}
        {state.step === 3 && (
          <>
            <h4 className="font-semibold text-slate-800 mb-1">Step 3: Reduce to your three core values</h4>
            <p className="text-sm text-slate-500 mb-4">Selected: {state.selected3.length}/3</p>
            <div className="flex flex-wrap gap-2">
              {pool3.map(v => (
                <button
                  key={v}
                  onClick={() => toggle('selected3', v, 3)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    state.selected3.includes(v)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {state.selected3.length === 3 && (
              <button
                onClick={() => update({ step: 4 })}
                className="mt-5 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
              >
                Next Step <ChevronRight size={16} />
              </button>
            )}
          </>
        )}

        {/* STEP 4 */}
        {state.step === 4 && (
          <>
            <h4 className="font-semibold text-slate-800 mb-4">Step 4: Reflect on each of your three core values</h4>
            {finalValues.map(value => (
              <div key={value} className="mb-6 border border-slate-200 rounded-xl p-5">
                <h5 className="font-bold text-slate-800 mb-4 text-base">{value}</h5>
                {QUESTIONS.map((q, qi) => (
                  <div key={qi} className="mb-4">
                    <label className="text-sm font-semibold text-slate-700 block mb-1">{q}</label>
                    <textarea
                      rows={3}
                      value={(state.answers[value] ?? [])[qi] ?? ''}
                      onChange={e => setAnswer(value, qi, e.target.value)}
                      placeholder="Your answer..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
                    />
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        <div className="text-right text-xs text-slate-400 mt-4">
          {saving ? 'Saving…' : savedAt ? `Last saved ${savedAt.toLocaleTimeString()}` : 'Progress saves automatically'}
        </div>
      </div>
    </div>
  );
};
