import React from 'react';
import { Mic, Square } from 'lucide-react';

/**
 * Microphone toggle for the Growth AI chat inputs.
 *
 * Render only when the browser supports speech recognition — an always-visible
 * button that silently does nothing is worse than no button.
 */
export const VoiceInputButton: React.FC<{
  listening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  /** The dashboard is light; the widget and command center are dark. */
  theme?: 'dark' | 'light';
  className?: string;
}> = ({ listening, onToggle, disabled, theme = 'dark', className = '' }) => {
  const idle =
    theme === 'light'
      ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={listening ? 'Stop voice input' : 'Start voice input'}
      aria-pressed={listening}
      title={listening ? 'Stop dictating' : 'Dictate your question'}
      className={`relative flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        listening ? 'bg-red-500 hover:bg-red-400 text-white border border-red-400' : idle
      } ${className}`}
    >
      {listening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
      {listening && (
        <span className="absolute inset-0 rounded-lg animate-ping bg-red-500/40 pointer-events-none" />
      )}
    </button>
  );
};
