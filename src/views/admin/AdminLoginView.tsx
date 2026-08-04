import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLogin } from '../../lib/adminApi';
import { Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

/** Password gate. The real check is server-side; this only collects it. */
export const AdminLoginView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminLogin(password);
      // No navigation needed: the token lands in the store and AdminLayout
      // swaps this screen for the panel on the next render.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
      setPassword('');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <img
            src="/logo.jpg"
            alt=""
            className="w-14 h-14 rounded-2xl object-cover mx-auto ring-1 ring-amber-500/30"
          />
          <div>
            <h1 className="text-xl font-serif font-bold text-white">
              School of Growth
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-500 mt-1">
              Administration
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-slate-400"
            >
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Sign in
              </>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            Sessions last 8 hours and end when you close this tab.
          </p>
        </form>

        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to the site
        </Link>
      </div>
    </div>
  );
};
