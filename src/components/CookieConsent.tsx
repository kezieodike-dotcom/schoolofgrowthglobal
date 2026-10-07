import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const COOKIE_KEY = 'sgg-cookie-consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(COOKIE_KEY) !== 'accepted');
  }, []);

  const accept = () => {
    window.localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-5 sm:left-5 sm:mr-5 sm:p-5" role="dialog" aria-label="Cookie notice">
      <div className="flex items-start gap-3">
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 sm:flex"><Cookie className="h-4 w-4" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">We use cookies</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">We use essential cookies to keep the site working and optional cookies to understand how visitors use it. Read our <Link to="/privacy" className="font-semibold text-amber-700 underline underline-offset-2">Privacy Policy</Link>.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={accept} className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">Accept cookies</button>
            <button type="button" onClick={accept} className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400">Use essential only</button>
          </div>
        </div>
        <button type="button" onClick={accept} aria-label="Close cookie notice" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>
    </aside>
  );
};
