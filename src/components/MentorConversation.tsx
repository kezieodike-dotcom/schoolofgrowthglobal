import React, { useEffect, useRef, useState } from 'react';
import type { Mentor } from '../types';
import type { Entitlement } from '../lib/pricing';
import { Send, Loader2, AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';

/**
 * A student's conversation with one mentor.
 *
 * Opens the thread on mount using the email and Paystack reference from the
 * student's entitlement — see src/server/messageStore.ts for why those two
 * are what stands in for a login here.
 *
 * Polls rather than holding a socket. Mentors reply through the admin panel
 * on a human timescale, so a thirty-second refresh is indistinguishable from
 * realtime to the person waiting, and it costs no infrastructure. When mentor
 * accounts and a realtime backend exist, this is the piece to replace.
 */

interface Message {
  id: string;
  from: 'student' | 'mentor';
  body: string;
  sentAt: string;
  readAt: string | null;
}

interface Thread {
  id: string;
  messages: Message[];
}

const POLL_MS = 30_000;

export const MentorConversation: React.FC<{
  mentor: Mentor;
  entitlement: Entitlement;
  studentName: string;
}> = ({ mentor, entitlement, studentName }) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const endRef = useRef<HTMLDivElement>(null);
  const threadIdRef = useRef<string | null>(null);

  // Open the thread once, then poll it. Splitting these means a poll cannot
  // accidentally re-create a thread if the open request is still in flight.
  useEffect(() => {
    let live = true;

    const open = async () => {
      try {
        const res = await fetch('/api/messages/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: entitlement.email,
            name: studentName,
            mentorId: mentor.id,
            reference: entitlement.reference,
          }),
        });
        const body = await res.json().catch(() => null);
        if (!live) return;

        if (!res.ok) {
          setError(body?.error ?? 'This conversation could not be opened.');
          return;
        }
        threadIdRef.current = body.thread.id;
        setThread(body.thread);
      } catch {
        if (live) setError('We could not reach the server. Check your connection.');
      } finally {
        if (live) setLoading(false);
      }
    };

    open();

    const timer = setInterval(async () => {
      if (!threadIdRef.current) return;
      try {
        const res = await fetch(`/api/messages/${threadIdRef.current}`);
        if (!res.ok) return;
        const body = await res.json();
        if (live) setThread(body.thread);
      } catch {
        // A failed poll is not worth surfacing; the next one may succeed.
      }
    }, POLL_MS);

    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [mentor.id, entitlement.email, entitlement.reference, studentName]);

  // Only scroll when the count changes, so a poll that returns the same
  // messages does not yank the view while someone is reading back.
  const count = thread?.messages.length ?? 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [count]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending || !threadIdRef.current) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/messages/${threadIdRef.current}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? 'That message did not send.');

      setThread(payload.thread);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That message did not send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[460px] overflow-hidden">
      <header className="px-4 py-3 border-b border-slate-100 flex items-center gap-2.5">
        <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">
            Message {mentor.name.split(' ').slice(-1)[0]}
          </p>
          <p className="text-[10px] text-slate-400">
            Replies usually within a working day
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Opening conversation...</span>
          </div>
        )}

        {!loading && count === 0 && !error && (
          <div className="text-center py-10 space-y-2">
            <MessageSquare className="w-7 h-7 text-slate-200 mx-auto" />
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              No messages yet. Ask {mentor.name.split(' ').slice(-1)[0]} anything —
              a decision you are weighing, feedback on your work, or what to
              prepare before your next session.
            </p>
          </div>
        )}

        {thread?.messages.map((message) => {
          const mine = message.from === 'student';
          return (
            <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] space-y-1">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    mine
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {message.body}
                </div>
                <p
                  className={`text-[10px] font-mono text-slate-400 ${
                    mine ? 'text-right' : ''
                  }`}
                >
                  {mine ? 'You' : mentor.name.split(' ').slice(-1)[0]} ·{' '}
                  {new Date(message.sentAt).toLocaleString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>

      {error && (
        <p
          role="alert"
          className="mx-4 mb-2 flex items-start gap-2 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 text-rose-700 hover:text-rose-900"
            aria-label="Retry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </p>
      )}

      <form onSubmit={send} className="p-3 border-t border-slate-100 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends, Shift+Enter breaks the line — the convention every
            // messaging app uses, so it needs no explaining.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          rows={2}
          placeholder={`Message ${mentor.name.split(' ').slice(-1)[0]}...`}
          disabled={loading || Boolean(error && !thread)}
          className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim() || loading}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-colors shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
