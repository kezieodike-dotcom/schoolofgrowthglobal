import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MENTORS } from '../data/mockData';
import type { Mentor } from '../types';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CornerDownLeft,
  Inbox,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';

interface Message {
  id: string;
  from: 'student' | 'mentor';
  body: string;
  sentAt: string;
  readAt: string | null;
}

interface Thread {
  id: string;
  studentEmail: string;
  studentName: string;
  mentorId: string;
  createdAt: string;
  lastMessageAt: string;
  messages: Message[];
}

interface InboxResponse {
  writable: boolean;
  awaitingReply: number;
  threads: Thread[];
}

const MENTOR_KEY = 'sog.mentor.inbox.profile';
const TOKEN_KEY = 'sog.mentor.inbox.token';

const QUICK_REPLIES = [
  'Thanks for sending this through. I will review it carefully and reply with the next action.',
  'Before our next session, write down the decision, the constraint, and the trade-off you are weighing.',
  'This is a good coaching topic. Send me the context, your preferred option, and what outcome would count as success.',
];

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const lastName = (name: string) => name.split(' ').slice(-1)[0] || name;

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const unreadForMentor = (thread: Thread) =>
  thread.messages.some((m) => m.from === 'student' && !m.readAt);

const lastMessage = (thread: Thread) => thread.messages[thread.messages.length - 1];

export const MentorInboxView: React.FC = () => {
  const [mentorId, setMentorId] = useState(() => {
    try {
      return sessionStorage.getItem(MENTOR_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const mentor = MENTORS.find((m) => m.id === mentorId) ?? null;

  const chooseMentor = (next: Mentor, nextToken: string) => {
    setMentorId(next.id);
    setToken(nextToken);
    try {
      sessionStorage.setItem(MENTOR_KEY, next.id);
      sessionStorage.setItem(TOKEN_KEY, nextToken);
    } catch {
      // The mentor session still holds in React state for this page.
    }
  };

  const signOut = () => {
    setMentorId('');
    setToken('');
    try {
      sessionStorage.removeItem(MENTOR_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // No-op.
    }
  };

  if (!mentor || !token) {
    return <MentorChooser onChoose={chooseMentor} />;
  }

  return <MentorInbox mentor={mentor} token={token} onSwitch={signOut} />;
};

const MentorChooser: React.FC<{ onChoose: (mentor: Mentor, token: string) => void }> = ({
  onChoose,
}) => {
  const [selected, setSelected] = useState<Mentor>(MENTORS[0]);
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/mentor-inbox/status')
      .then((res) => res.json())
      .then((body) => setEnabled(Boolean(body.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor-inbox/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: selected.id, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.token) {
        throw new Error(body?.error ?? 'Could not open the mentor inbox.');
      }
      onChoose(selected, body.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the mentor inbox.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          School of Growth
        </Link>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
          <div className="space-y-5 lg:pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono uppercase tracking-widest">
              <Inbox className="w-3.5 h-3.5" />
              Mentor Workspace
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Mentor inbox for focused mentee conversations.
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                Read student threads, triage pending replies, and respond without
                entering the admin panel.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-xl">
              {[
                ['Threads', 'Student conversations'],
                ['Replies', 'Mentor voice'],
                ['Focus', 'Unread first'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
                >
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    {label}
                  </p>
                  <p className="text-xs text-slate-200 mt-2 leading-snug">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="rounded-[1.75rem] bg-white text-slate-950 border border-white/10 overflow-hidden shadow-[0_30px_80px_-50px_rgba(0,0,0,0.8)]"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">Mentor sign in</p>
                <p className="text-[11px] text-slate-500">
                  Select a profile and enter the mentor access code.
                </p>
              </div>
              <UserRoundCheck className="w-5 h-5 text-amber-600" />
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MENTORS.map((mentor) => (
                  <button
                    key={mentor.id}
                    type="button"
                    onClick={() => setSelected(mentor)}
                    className={`p-3 text-left rounded-2xl border transition-all active:scale-[0.99] ${
                      selected.id === mentor.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover bg-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-950 truncate">
                          {mentor.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {mentor.role}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-bold text-slate-600">
                  Mentor access code
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={enabled === false}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </label>

              {enabled === false && (
                <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  The mentor inbox is switched off until MENTOR_INBOX_PASSWORD is
                  set in the environment.
                </p>
              )}

              {error && (
                <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || enabled === false}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Inbox className="w-4 h-4" />}
                Open mentor inbox
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

const MentorInbox: React.FC<{ mentor: Mentor; token: string; onSwitch: () => void }> = ({
  mentor,
  token,
  onSwitch,
}) => {
  const [data, setData] = useState<InboxResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/mentor-inbox/${mentor.id}/threads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => null);
      if (res.status === 401) {
        onSwitch();
        return;
      }
      if (!res.ok) throw new Error(body?.error ?? 'Could not load the inbox.');
      setData(body);
      setSelectedId((current) => current ?? body.threads[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    setSelectedId(null);
    setSelectedThread(null);
    setLoading(true);
    loadInbox();
    const timer = window.setInterval(loadInbox, 30_000);
    return () => window.clearInterval(timer);
  }, [mentor.id, token]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedThread(null);
      return;
    }

    let live = true;
    setLoadingThread(true);

    fetch(`/api/mentor-inbox/${mentor.id}/threads/${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (res.status === 401) {
          onSwitch();
          return null;
        }
        if (!res.ok) throw new Error(body?.error ?? 'Could not open the thread.');
        return body.thread as Thread;
      })
      .then((thread) => {
        if (live && thread) setSelectedThread(thread);
      })
      .catch((err) => {
        if (live) setError(err instanceof Error ? err.message : 'Could not open the thread.');
      })
      .finally(() => {
        if (live) setLoadingThread(false);
      });

    return () => {
      live = false;
    };
  }, [mentor.id, selectedId, token]);

  const filtered = useMemo(() => {
    const source = data?.threads ?? [];
    const term = query.trim().toLowerCase();
    return source.filter((thread) => {
      const matchesFilter = filter === 'all' || unreadForMentor(thread);
      if (!matchesFilter) return false;
      if (!term) return true;
      return [
        thread.studentName,
        thread.studentEmail,
        lastMessage(thread)?.body ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [data?.threads, filter, query]);

  const unreadCount = data?.awaitingReply ?? 0;

  return (
    <main className="min-h-[100dvh] bg-slate-100 text-slate-950">
      <div className="max-w-[1500px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(320px,420px)_1fr] gap-4 items-start">
          <MentorRail
            mentor={mentor}
            unreadCount={unreadCount}
            total={data?.threads.length ?? 0}
            onSwitch={onSwitch}
          />

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-black tracking-tight">
                    Mentee Inbox
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount} awaiting mentor reply
                  </p>
                </div>
                <button
                  onClick={loadInbox}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
                  aria-label="Refresh inbox"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <label className="block">
                <span className="sr-only">Search conversations</span>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search student or message"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(['all', 'unread'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all active:scale-[0.98] ${
                      filter === item
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item === 'all' ? 'All' : 'Awaiting reply'}
                  </button>
                ))}
              </div>
            </div>

            {loading && <ThreadSkeleton />}
            {!loading && error && (
              <InlineState
                icon={<AlertTriangle className="w-5 h-5" />}
                title="Inbox could not load"
                body={error}
              />
            )}
            {!loading && !error && filtered.length === 0 && (
              <InlineState
                icon={<Inbox className="w-5 h-5" />}
                title="No conversations here"
                body={
                  filter === 'unread'
                    ? 'Every mentee thread has a mentor reply.'
                    : 'Student messages for this mentor will appear here.'
                }
              />
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="divide-y divide-slate-100 max-h-[calc(100dvh-250px)] overflow-y-auto">
                {filtered.map((thread) => (
                  <ThreadButton
                    key={thread.id}
                    thread={thread}
                    active={thread.id === selectedId}
                    onClick={() => setSelectedId(thread.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <ConversationPanel
            mentor={mentor}
            thread={selectedThread}
            loading={loadingThread}
            writable={data?.writable ?? false}
            onReplied={(thread) => {
              setSelectedThread(thread);
              loadInbox();
            }}
            token={token}
          />
        </div>
      </div>
    </main>
  );
};

const MentorRail: React.FC<{
  mentor: Mentor;
  unreadCount: number;
  total: number;
  onSwitch: () => void;
}> = ({ mentor, unreadCount, total, onSwitch }) => (
  <aside className="bg-slate-950 text-white rounded-2xl overflow-hidden">
    <div className="p-5 space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[11px] text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Public site
      </Link>

      <div className="space-y-3">
        <img
          src={mentor.avatar}
          alt=""
          className="w-16 h-16 rounded-2xl object-cover ring-1 ring-amber-500/30"
        />
        <div>
          <p className="text-lg font-black leading-tight">{mentor.name}</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mentor.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Metric label="Threads" value={String(total)} />
        <Metric label="Unread" value={String(unreadCount)} />
      </div>

      <div className="space-y-2">
        {mentor.expertise.slice(0, 3).map((area) => (
          <span
            key={area}
            className="inline-flex mr-2 mb-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300"
          >
            {area}
          </span>
        ))}
      </div>
    </div>

    <div className="border-t border-slate-800 p-3">
      <button
        onClick={onSwitch}
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-300 hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all"
      >
        <LogOut className="w-4 h-4" />
        Switch mentor
      </button>
    </div>
  </aside>
);

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
      {label}
    </p>
    <p className="text-xl font-black mt-1">{value}</p>
  </div>
);

const ThreadButton: React.FC<{
  thread: Thread;
  active: boolean;
  onClick: () => void;
}> = ({ thread, active, onClick }) => {
  const last = lastMessage(thread);
  const waiting = unreadForMentor(thread);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 transition-all active:scale-[0.99] ${
        active ? 'bg-amber-50' : 'hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shrink-0">
          {initials(thread.studentName || thread.studentEmail)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black text-slate-950 truncate">
              {thread.studentName || thread.studentEmail}
            </p>
            {waiting ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-[10px] font-mono text-slate-400 truncate">
            {thread.studentEmail}
          </p>
          <p className="text-[11px] text-slate-500 truncate mt-1">
            {last ? `${last.from === 'mentor' ? 'You: ' : ''}${last.body}` : 'No messages yet'}
          </p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
            <Clock3 className="w-3 h-3" />
            {when(thread.lastMessageAt)}
          </p>
        </div>
      </div>
    </button>
  );
};

const ConversationPanel: React.FC<{
  mentor: Mentor;
  thread: Thread | null;
  loading: boolean;
  writable: boolean;
  token: string;
  onReplied: (thread: Thread) => void;
}> = ({ mentor, thread, loading, writable, token, onReplied }) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    setDraft('');
    setFailure(null);
  }, [thread?.id]);

  const reply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!thread) return;
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setFailure(null);
    try {
      const res = await fetch(
        `/api/mentor-inbox/${mentor.id}/threads/${thread.id}/reply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body }),
        }
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? 'That reply did not send.');
      setDraft('');
      onReplied(payload.thread);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'That reply did not send.');
    } finally {
      setSending(false);
    }
  };

  if (!thread && !loading) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl min-h-[520px] flex items-center justify-center p-8">
        <InlineState
          icon={<MessageSquare className="w-5 h-5" />}
          title="Select a mentee"
          body="Choose a conversation to read context and reply as the mentor."
        />
      </section>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden min-h-[calc(100dvh-48px)] flex flex-col">
      <header className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-950 truncate">
            {loading ? 'Opening conversation' : thread?.studentName || thread?.studentEmail}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {thread?.studentEmail ?? 'Loading thread context'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Reply as {lastName(mentor.name)}
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-50/70">
        {loading && (
          <div className="space-y-3">
            <div className="w-2/3 h-16 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="w-1/2 h-14 rounded-2xl bg-amber-100 ml-auto animate-pulse" />
            <div className="w-3/4 h-20 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        )}

        {!loading &&
          thread?.messages.map((message) => {
            const fromMentor = message.from === 'mentor';
            return (
              <div
                key={message.id}
                className={`flex ${fromMentor ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[82%] space-y-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      fromMentor
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {message.body}
                  </div>
                  <p
                    className={`text-[10px] font-mono text-slate-400 ${
                      fromMentor ? 'text-right' : ''
                    }`}
                  >
                    {fromMentor ? lastName(mentor.name) : thread.studentName || 'Mentee'} /{' '}
                    {when(message.sentAt)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {thread && (
        <form onSubmit={reply} className="p-4 border-t border-slate-100 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {QUICK_REPLIES.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => setDraft(template)}
                className="shrink-0 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 active:scale-[0.98] transition-all"
              >
                {template.slice(0, 46)}...
              </button>
            ))}
          </div>

          {failure && (
            <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              {failure}
            </p>
          )}

          {!writable && (
            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              Replies cannot be saved on this host because conversation storage is
              not writable.
            </p>
          )}

          <label className="block space-y-2">
            <span className="text-[11px] font-bold text-slate-600">Reply</span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  reply(e);
                }
              }}
              rows={4}
              disabled={!writable || sending}
              placeholder={`Message ${thread.studentName || 'your mentee'}...`}
              className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-500 disabled:opacity-50"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              Enter sends / Shift+Enter starts a new line
            </p>
            <button
              type="submit"
              disabled={sending || !draft.trim() || !writable}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send reply
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

const ThreadSkeleton: React.FC = () => (
  <div className="divide-y divide-slate-100">
    {[0, 1, 2, 3].map((item) => (
      <div key={item} className="p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-2/3 h-3 rounded-full bg-slate-200 animate-pulse" />
          <div className="w-1/2 h-2.5 rounded-full bg-slate-100 animate-pulse" />
          <div className="w-5/6 h-2.5 rounded-full bg-slate-100 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const InlineState: React.FC<{
  icon: React.ReactNode;
  title: string;
  body: string;
}> = ({ icon, title, body }) => (
  <div className="p-8 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
      {icon}
    </div>
    <p className="text-sm font-black text-slate-950 mt-4">{title}</p>
    <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto mt-1">
      {body}
    </p>
  </div>
);
