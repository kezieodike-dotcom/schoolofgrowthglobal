import React, { useState } from 'react';
import {
  useAdminData,
  PageHeader,
  Panel,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
} from './AdminUI';
import { adminPost } from '../../lib/adminApi';
import { MENTORS } from '../../data/mockData';
import { Send, Loader2, AlertTriangle, CornerDownLeft } from 'lucide-react';

/**
 * The mentor inbox.
 *
 * Mentors have no login yet, so their conversations are answered from here.
 * Replies are attributed to the mentor rather than to the admin, because that
 * is who the student believes they are talking to — a thread that changes
 * voice halfway through would be worse than one answered slowly.
 *
 * When mentor accounts exist this screen becomes the mentor's own inbox with
 * a session check in place of the admin guard.
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
  studentEmail: string;
  studentName: string;
  mentorId: string;
  createdAt: string;
  lastMessageAt: string;
  messages: Message[];
}

interface Response {
  writable: boolean;
  awaitingReply: number;
  threads: Thread[];
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const AdminMessagesView: React.FC = () => {
  const { data, error, loading, reload } = useAdminData<Response>('/threads');
  const [selected, setSelected] = useState<string | null>(null);

  const thread = data?.threads.find((t) => t.id === selected) ?? null;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Conversations between students and their mentors. Replies here reach the student as the mentor."
      />

      {loading && !data && <LoadingState label="Loading conversations" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !data.writable && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-300 mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-px" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-rose-900">
              Messaging is unavailable on this host
            </p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Conversations need somewhere to be stored, and this server's filesystem
              is read-only. Students see the same limitation rather than a message box
              that loses what they type.
            </p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {data.awaitingReply > 0 && (
            <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
              <strong>{data.awaitingReply}</strong>{' '}
              {data.awaitingReply === 1 ? 'conversation is' : 'conversations are'}{' '}
              waiting for a reply.
            </div>
          )}

          {data.threads.length === 0 ? (
            <Panel>
              <EmptyState
                title="No conversations yet"
                body="When a student messages their mentor from the portal, the thread appears here."
              />
            </Panel>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Thread list */}
              <div className="lg:col-span-4">
                <Panel title={`${data.threads.length} conversations`}>
                  <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                    {data.threads.map((t) => {
                      const mentor = MENTORS.find((m) => m.id === t.mentorId);
                      const last = t.messages[t.messages.length - 1];
                      const waiting = t.messages.some(
                        (m) => m.from === 'student' && !m.readAt
                      );
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelected(t.id)}
                          className={`w-full text-left px-4 py-3 transition-colors ${
                            selected === t.id ? 'bg-amber-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {t.studentName || t.studentEmail}
                            </p>
                            {waiting && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-amber-500" />
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            with {mentor?.name ?? t.mentorId}
                          </p>
                          {last && (
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {last.from === 'mentor' && 'You: '}
                              {last.body}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              </div>

              {/* Conversation */}
              <div className="lg:col-span-8">
                {thread ? (
                  <ThreadPanel
                    thread={thread}
                    writable={data.writable}
                    onReplied={reload}
                  />
                ) : (
                  <Panel>
                    <EmptyState
                      title="Choose a conversation"
                      body="Pick a thread on the left to read it and reply."
                    />
                  </Panel>
                )}
              </div>
            </div>
          )}

          <Note>
            Mentors do not have logins yet, so their replies go out from here. The
            student sees them as coming from the mentor, which is who they are talking
            to. Giving mentors their own inbox is a session check away — the
            conversations already exist.
          </Note>
        </div>
      )}
    </>
  );
};

const ThreadPanel: React.FC<{
  thread: Thread;
  writable: boolean;
  onReplied: () => void;
}> = ({ thread, writable, onReplied }) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const mentor = MENTORS.find((m) => m.id === thread.mentorId);

  const reply = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setFailure(null);
    try {
      await adminPost(`/threads/${thread.id}/reply`, { body });
      setDraft('');
      onReplied();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'That reply did not send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Panel
      title={thread.studentName || thread.studentEmail}
      hint={`with ${mentor?.name ?? thread.mentorId} · ${thread.studentEmail}`}
    >
      <div className="p-4 space-y-3 max-h-[420px] overflow-y-auto">
        {thread.messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">
            No messages in this conversation yet.
          </p>
        )}

        {thread.messages.map((message) => {
          const fromMentor = message.from === 'mentor';
          return (
            <div
              key={message.id}
              className={`flex ${fromMentor ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[80%] space-y-1">
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    fromMentor
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {message.body}
                </div>
                <p
                  className={`text-[10px] font-mono text-slate-400 ${
                    fromMentor ? 'text-right' : ''
                  }`}
                >
                  {fromMentor ? mentor?.name ?? 'Mentor' : thread.studentName || 'Student'}{' '}
                  · {when(message.sentAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {failure && (
        <p
          role="alert"
          className="mx-4 mb-2 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5"
        >
          {failure}
        </p>
      )}

      <form onSubmit={reply} className="p-3 border-t border-slate-100 space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              reply(e);
            }
          }}
          rows={3}
          disabled={!writable}
          placeholder={
            writable
              ? `Reply as ${mentor?.name ?? 'the mentor'}...`
              : 'Replies cannot be saved on this host'
          }
          className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs leading-relaxed focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            Enter to send · Shift+Enter for a new line
          </p>
          <button
            type="submit"
            disabled={sending || !draft.trim() || !writable}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            {sending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send as {mentor?.name.split(' ').slice(-1)[0] ?? 'mentor'}
          </button>
        </div>
      </form>
    </Panel>
  );
};
