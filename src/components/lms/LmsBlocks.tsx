import React from 'react';
import { Lightbulb, GitBranch } from 'lucide-react';

// ─── Reading Block ────────────────────────────────────────────────────────────
export const ReadingBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="prose prose-slate max-w-none lms-reading">
    {content.split('\n\n').map((para, i) => (
      <p key={i} className="text-slate-700 leading-relaxed text-base mb-4">{para}</p>
    ))}
  </div>
);

// ─── Key Insight Block ────────────────────────────────────────────────────────
export const KeyInsightBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-xl px-6 py-4 my-4 flex gap-3">
    <Lightbulb className="text-amber-500 mt-1 shrink-0" size={20} />
    <p className="text-amber-900 font-medium leading-relaxed">{content}</p>
  </div>
);

// ─── Framework Block ──────────────────────────────────────────────────────────
export const FrameworkBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="bg-slate-900 text-amber-400 rounded-xl px-6 py-5 my-6 flex items-center gap-2">
    <GitBranch size={18} className="shrink-0 text-amber-500" />
    <p className="font-mono font-semibold tracking-wide text-sm leading-relaxed">{content}</p>
  </div>
);

// ─── Question Block ───────────────────────────────────────────────────────────
export const QuestionBlock: React.FC<{ content: string }> = ({ content }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 my-4">
    <p className="text-blue-800 font-semibold">{content}</p>
  </div>
);

// ─── Reflection Block ─────────────────────────────────────────────────────────
interface ReflectionBlockProps {
  blockId: string;
  content: string;
  savedData: any;
  onSave: (data: any) => void;
  saving?: boolean;
  savedAt?: Date | null;
}

export const ReflectionBlock: React.FC<ReflectionBlockProps> = ({
  blockId,
  content,
  savedData,
  onSave,
  saving,
  savedAt,
}) => {
  const [value, setValue] = React.useState<string>(savedData?.text ?? '');

  React.useEffect(() => {
    if (savedData?.text !== undefined) setValue(savedData.text);
  }, [savedData]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    onSave({ text: e.target.value });
  };

  return (
    <div className="border border-slate-200 rounded-xl p-5 my-4 bg-white">
      <p className="text-slate-800 font-semibold mb-3">{content}</p>
      <textarea
        value={value}
        onChange={handleChange}
        rows={4}
        placeholder="Write your reflection here..."
        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
        aria-label={`Reflection: ${content}`}
      />
      <div className="flex justify-end mt-1 text-xs text-slate-400">
        {saving ? 'Saving…' : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : 'Not yet saved'}
      </div>
    </div>
  );
};
