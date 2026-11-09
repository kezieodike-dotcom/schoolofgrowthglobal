import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    sggInstallPrompt?: BeforeInstallPromptEvent | null;
    sggAppInstalled?: boolean;
  }
}

const DISMISS_KEY = 'sgg-install-prompt-dismissed-at';
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

function isInstalled() {
  return window.sggAppInstalled === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function installPlatform() {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(navigator.userAgent)) return 'android';
  if (navigator.vendor === 'Apple Computer, Inc.' && navigator.platform.startsWith('Mac')) return 'mac-safari';
  return 'desktop';
}

function recentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY));
    return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_FOR_MS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.sggInstallPrompt ?? null);
  const [installed, setInstalled] = useState(isInstalled);
  const [dismissed, setDismissed] = useState(recentlyDismissed);
  const [show, setShow] = useState(false);
  const [prompting, setPrompting] = useState(false);

  useEffect(() => {
    const handleInstallable = () => setDeferredPrompt(window.sggInstallPrompt ?? null);
    const handleInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', handleInstallable);
    window.addEventListener('appinstalled', handleInstalled);
    handleInstallable();
    if (isInstalled()) handleInstalled();
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (installed || dismissed) return;
    const timer = window.setTimeout(() => setShow(true), 3500);
    return () => window.clearTimeout(timer);
  }, [installed, dismissed]);

  if (installed) return null;

  function dismiss() {
    setShow(false);
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // The notice can still be dismissed for this visit when storage is blocked.
    }
  }

  async function install() {
    const prompt = deferredPrompt;
    if (!prompt || prompting) return;
    setPrompting(true);
    if (window.sggInstallPrompt === prompt) window.sggInstallPrompt = null;
    try {
      await prompt.prompt();
      await prompt.userChoice;
      dismiss();
    } catch {
      // Clearing the event below reveals the manual steps if prompting fails.
    } finally {
      setPrompting(false);
      setDeferredPrompt(current => current === prompt ? null : current);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setShow(true)} aria-expanded={show}
        className="font-semibold text-amber-800 underline-offset-4 hover:underline">
        Install web app
      </button>
      {show && <aside aria-labelledby="install-prompt-title"
        className="fixed inset-x-4 bottom-24 z-[90] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-6 sm:w-96">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-900"><Download className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <h2 id="install-prompt-title" className="text-sm font-bold leading-5 text-slate-950">
              Add School of Growth Global to your home screen
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {deferredPrompt ? 'Open courses, events and mentorship from your home screen.' : (
                <InstallInstructions />
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {deferredPrompt && <button type="button" onClick={() => void install()} disabled={prompting}
                className="min-h-10 rounded-lg bg-amber-500 px-4 text-sm font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60">
                Install app
              </button>}
              <button type="button" onClick={dismiss} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Not now</button>
            </div>
          </div>
          <button type="button" onClick={dismiss} aria-label="Close install notice"
            className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </aside>}
    </>
  );
}

function InstallInstructions() {
  switch (installPlatform()) {
    case 'ios':
      return <>Open in Safari, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>. Turn on <strong>Open as Web App</strong> if offered, then tap <strong>Add</strong>.</>;
    case 'android':
      return <>Open this page in Chrome, then use the browser menu to choose <strong>Add to Home Screen</strong> and <strong>Install</strong>.</>;
    case 'mac-safari':
      return <>In Safari, choose <strong>File</strong>, then <strong>Add to Dock</strong> if available.</>;
    default:
      return <>Open this page in Chrome or Edge and choose the <strong>Install app</strong> option from the browser menu. If this link opened inside another app, choose <strong>Open in browser</strong> first.</>;
  }
}
