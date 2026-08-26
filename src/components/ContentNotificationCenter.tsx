import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ExternalLink, X } from 'lucide-react';
import type { ContentNotification } from '../lib/contentNotifications';

const ACCEPTED_KEY = 'sog.notifications.accepted.v1';
const READ_KEY = 'sog.notifications.read.v1';
const DISMISSED_KEY = 'sog.notifications.dismissed.v1';

export const NOTIFICATION_PROMPT_POSITION_CLASS =
  'fixed bottom-24 right-4 sm:right-6 lg:right-10 z-[60] w-[calc(100vw-2rem)] max-w-md rounded-xl border border-amber-200 bg-white p-4 text-slate-900 shadow-2xl';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Browsers can reject storage in privacy modes; the session state still works.
  }
}

export const ContentNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<ContentNotification[]>([]);
  const [accepted, setAccepted] = useState(() => readFlag(ACCEPTED_KEY));
  const [dismissed, setDismissed] = useState(() => readFlag(DISMISSED_KEY));
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(readJson<string[]>(READ_KEY, [])));
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification === 'undefined' ? 'denied' : Notification.permission
  );
  const initialized = useRef(false);
  const notified = useRef(new Set<string>());

  useEffect(() => {
    let live = true;

    const load = async () => {
      try {
        const res = await fetch('/api/content/notifications');
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? 'Could not load notifications.');
        const next = (body?.notifications ?? []) as ContentNotification[];
        if (!live) return;

        if (!initialized.current) {
          next.forEach((item) => notified.current.add(item.id));
          initialized.current = true;
        } else if (accepted && permission === 'granted') {
          const fresh = next.find((item) => !notified.current.has(item.id));
          if (fresh) {
            new Notification('School of Growth Global', {
              body: `${fresh.message}: ${fresh.title}`,
              tag: fresh.id,
            });
          }
        }

        next.forEach((item) => notified.current.add(item.id));
        setNotifications(next);
      } catch {
        // Notification feed failure should never block normal browsing.
      }
    };

    void load();
    const interval = window.setInterval(load, 60000);
    return () => {
      live = false;
      window.clearInterval(interval);
    };
  }, [accepted, permission]);

  const unread = useMemo(
    () => notifications.filter((item) => !readIds.has(item.id)),
    [notifications, readIds]
  );

  const markAllRead = () => {
    const next = new Set(notifications.map((item) => item.id));
    setReadIds(next);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...next]));
    } catch {
      // In-memory read state is enough for this visit.
    }
  };

  const accept = async () => {
    setAccepted(true);
    writeFlag(ACCEPTED_KEY, true);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const next = await Notification.requestPermission();
      setPermission(next);
    } else if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    writeFlag(DISMISSED_KEY, true);
  };

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) markAllRead();
        }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-amber-500/50 transition-colors"
        aria-label="Site updates"
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
            {Math.min(unread.length, 9)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Latest updates</p>
              <p className="text-[11px] text-slate-500">Courses, events, jobs and insights</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close updates"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-500">No updates yet.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono font-bold uppercase text-amber-700">
                        {item.message}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {new Date(item.updatedAt).toLocaleString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!accepted && !dismissed && (
        <div className={NOTIFICATION_PROMPT_POSITION_CLASS}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="text-sm font-bold">Get School of Growth updates</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Be notified when new courses, events, Career Jobs and insights are posted.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={accept}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Accept updates
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Dismiss notification prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
