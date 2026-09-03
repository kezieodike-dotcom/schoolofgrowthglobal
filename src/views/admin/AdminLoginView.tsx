import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminLogin } from '../../lib/adminApi';
import { Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

/** Password gate. The real check is server-side; this only collects it. */
export const AdminLoginView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
            <h1 className="text-xl font-bold text-white">
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
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-3 pr-11 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide admin password' : 'Show admin password'}
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 mx-auto" />
                ) : (
                  <Eye className="w-4 h-4 mx-auto" />
                )}
              </button>
            </div>
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
                <Loader2 className="w-4 h-4" /> Signing in...
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
