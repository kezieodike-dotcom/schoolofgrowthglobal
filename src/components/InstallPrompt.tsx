import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'sgg-install-prompt-dismissed-at';
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

export const InstallPrompt: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (!enabled || isStandalone()) return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR_MS) return;

    let timer: number | undefined;
    const reveal = () => {
      timer = window.setTimeout(() => setShow(true), 6500);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      reveal();
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShow(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isIos()) {
      setIos(true);
      reveal();
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [enabled]);

  if (!show || (!deferredPrompt && !ios)) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="install-prompt-title">
      <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl sm:p-8">
        <button type="button" onClick={dismiss} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close install prompt">
          <X className="h-5 w-5" />
        </button>
        <img src="/logo.jpg" alt="School of Growth Global" className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-md ring-1 ring-amber-200" />
        <h2 id="install-prompt-title" className="mt-5 text-2xl font-serif font-semibold leading-tight text-slate-950">
          Add School of Growth Global to your home screen
        </h2>
        {ios ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tap <Share className="mx-1 inline-block h-4 w-4 text-blue-600" aria-hidden="true" /> Share, then choose <strong>Add to Home Screen</strong>.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Install the School of Growth Global app for faster access to learning, events, mentorship and Growth AI.
          </p>
        )}
        <div className="mt-6 flex items-center gap-3">
          {!ios && (
            <button type="button" onClick={() => void install()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400">
              <Download className="h-4 w-4" />
              Add to Home Screen
            </button>
          )}
          <button type="button" onClick={dismiss} className={`${ios ? 'w-full' : 'shrink-0'} rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900`}>
            {ios ? 'Got it' : 'Not now'}
          </button>
        </div>
      </div>
    </div>
  );
};
