import React, { useCallback, useEffect, useState } from 'react';
import { adminGet, AdminAuthError } from '../../lib/adminApi';
import { formatNaira } from '../../lib/pricing';
import { Loader2, AlertCircle, Inbox, RefreshCw, Info } from 'lucide-react';

/**
 * Shared furniture for the admin pages: data loading, page chrome, and the
 * states a panel can be in. Kept in one place so every screen fails, empties
 * and reloads the same way instead of each inventing its own.
 */

// -- Data loading ---------------------------------------------------------

interface AdminData<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Fetches one admin endpoint, with a manual reload.
 *
 * An expired session is not surfaced as an error. AdminAuthError means the
 * token has already been cleared, which re-renders AdminLayout into the login
 * screen - showing "your session expired" underneath that would be noise.
 */
export function useAdminData<T>(path: string): AdminData<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);

    adminGet<T>(path)
      .then((result) => {
        if (live) setData(result);
      })
      .catch((err) => {
        if (!live || err instanceof AdminAuthError) return;
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      })
      .finally(() => {
        if (live) setLoading(false);
      });

    return () => {
      live = false;
    };
  }, [path, nonce]);

  return { data, error, loading, reload };
}

// -- Chrome ---------------------------------------------------------------

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && (
        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">{subtitle}</p>
      )}
    </div>
    {action}
  </div>
);

export const Panel: React.FC<{
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, hint, action, children, className = '' }) => (
  <section
    className={`rounded-lg bg-white border border-slate-200 shadow-sm ${className}`}
  >
    {(title || action) && (
      <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100">
        <div className="min-w-0">
          {title && (
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          )}
          {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

/**
 * A headline figure.
 *
 * Deliberately not a chart: one number answering one question is read faster
 * as type than as geometry, and a tile carries its own label so it never
 * needs a legend.
 */
export const StatTile: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'positive';
}> = ({ label, value, sub, icon, tone = 'default' }) => (
  <div className="p-5 rounded-lg bg-white border border-slate-200 shadow-sm space-y-2">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
        {label}
      </span>
      {icon && <span className="text-slate-300">{icon}</span>}
    </div>
    <p
      className={`text-2xl font-bold tabular-nums ${
        tone === 'positive' ? 'text-emerald-600' : 'text-slate-900'
      }`}
    >
      {value}
    </p>
    {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <div className="flex items-center justify-center gap-2.5 py-16 text-slate-400">
    <Loader2 className="w-4 h-4" />
    <span className="text-xs">{label}...</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
    <AlertCircle className="w-7 h-7 text-rose-500" />
    <p className="text-xs text-slate-600 max-w-sm leading-relaxed">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Try again
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 px-6 text-center">
    <Inbox className="w-7 h-7 text-slate-300" />
    <p className="text-sm font-bold text-slate-700">{title}</p>
    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{body}</p>
  </div>
);

/**
 * States a limit or a caveat inline.
 *
 * Used where a screen would otherwise imply more than it knows - a truncated
 * aggregate, or a section that cannot be edited yet. Saying it beside the
 * data is the point; a caveat in a tooltip is a caveat nobody reads.
 */
export const Note: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
    <Info className="w-3.5 h-3.5 shrink-0 mt-px text-slate-400" />
    <span>{children}</span>
  </p>
);

export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  // Status colours are reserved for state and never reused as series colours.
  const tone =
    status === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'failed'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
};

// -- Formatting -----------------------------------------------------------

export const money = (kobo: number) => formatNaira(kobo);

export const shortDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

export const dateTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';
