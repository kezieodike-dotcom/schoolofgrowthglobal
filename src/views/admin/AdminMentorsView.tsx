import React, { useState } from 'react';
import {
  useAdminData,
  PageHeader,
  Panel,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
  shortDate,
} from './AdminUI';
import { adminPost } from '../../lib/adminApi';
import {
  Check,
  X,
  Undo2,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  Briefcase,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

/**
 * The mentor review queue.
 *
 * Applications arrive from the registration wizard, wait here as pending, and
 * leave as approved or rejected. Approving one puts the mentor on the public
 * directory; rejecting takes them out of the queue without deleting the
 * record, so a decision can be revisited and there is a history of what was
 * decided and why.
 */

type Status = 'pending' | 'approved' | 'rejected';

interface Application {
  id: string;
  status: Status;
  submittedAt: string;
  decidedAt: string | null;
  decisionNote: string | null;
  answers: Record<string, string>;
  name: string;
  email: string;
  title: string;
  organization: string;
  location: string;
  area: string;
  experience: string;
  specialisms: string[];
}

interface Response {
  writable: boolean;
  counts: Record<Status, number>;
  applications: Application[];
}

const TABS: { id: Status; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export const AdminMentorsView: React.FC = () => {
  const [tab, setTab] = useState<Status>('pending');
  const { data, error, loading, reload } = useAdminData<Response>(
    `/mentors?status=${tab}`
  );

  return (
    <>
      <PageHeader
        title="Mentor applications"
        subtitle="Admit a mentor to put them on the public directory, or reject to clear the queue."
      />

      {data && !data.writable && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-300 mb-4">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-px" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-rose-900">
              Decisions cannot be saved on this host
            </p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Applications are stored in a file on disk, and this server's filesystem
              is read-only - which is normal on Vercel. Approve and reject are
              disabled rather than pretending to work. Deploy somewhere with a
              persistent disk, or add a database, to review mentors here.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mb-5 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
              tab === id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {label}
            {data && (
              <span
                className={`px-1.5 rounded text-[10px] font-mono ${
                  tab === id ? 'bg-slate-950/15' : 'bg-slate-100'
                }`}
              >
                {data.counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && !data && <LoadingState label="Loading applications" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          {data.applications.length === 0 ? (
            <Panel>
              <EmptyState
                title={`No ${tab} applications`}
                body={
                  tab === 'pending'
                    ? 'Applications from the mentor registration form land here for review.'
                    : `Nothing has been ${tab} yet.`
                }
              />
            </Panel>
          ) : (
            <div className="space-y-3">
              {data.applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  writable={data.writable}
                  onDecided={reload}
                />
              ))}
            </div>
          )}

          <Note>
            Applications are also emailed to your inbox. This queue is the reviewable
            copy - approving here is what actually adds a mentor to the public
            directory at <code className="font-mono text-slate-700">/mentors</code>.
          </Note>
        </div>
      )}
    </>
  );
};

// ── One application ──────────────────────────────────────────────────────

const ApplicationCard: React.FC<{
  application: Application;
  writable: boolean;
  onDecided: () => void;
}> = ({ application, writable, onDecided }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const decide = async (decision: Status) => {
    setBusy(decision);
    setFailure(null);
    try {
      await adminPost(`/mentors/${application.id}/decision`, { decision, note });
      onDecided();
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Could not save that decision.');
      setBusy(null);
    }
  };

  return (
    <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              {application.name || 'Unnamed applicant'}
            </h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 shrink-0" />
              {application.title}
              {application.organization && `, ${application.organization}`}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-slate-400">
              <a
                href={`mailto:${application.email}`}
                className="flex items-center gap-1 hover:text-amber-600 transition-colors"
              >
                <Mail className="w-2.5 h-2.5" />
                {application.email}
              </a>
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {application.location}
              </span>
              <span>{application.experience}</span>
              <span>Applied {shortDate(application.submittedAt)}</span>
            </div>
          </div>

          <span
            className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${
              application.status === 'approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : application.status === 'rejected'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {application.status}
          </span>
        </div>

        {application.specialisms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px]">
              {application.area}
            </span>
            {application.specialisms.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {application.decisionNote && (
          <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
            <span className="font-bold">Note:</span> {application.decisionNote}
          </p>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 transition-colors"
        >
          {open ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Hide full application
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Read full application
            </>
          )}
        </button>
      </div>

      {open && (
        <dl className="border-t border-slate-100 divide-y divide-slate-50 bg-slate-50/40">
          {Object.entries(application.answers).map(([label, value]) => (
            <div
              key={label}
              className="px-5 py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3"
            >
              <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {label}
              </dt>
              <dd className="sm:col-span-2 text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {failure && (
        <p
          role="alert"
          className="mx-5 mb-3 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5"
        >
          {failure}
        </p>
      )}

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <footer className="px-5 py-3 border-t border-slate-100 bg-white">
        {application.status === 'pending' ? (
          rejecting ? (
            <div className="space-y-2">
              <label
                htmlFor={`note-${application.id}`}
                className="block text-[11px] text-slate-500"
              >
                Reason for rejecting{' '}
                <span className="text-slate-400">(optional, internal only)</span>
              </label>
              <input
                id={`note-${application.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Not enough senior experience for our cohorts"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => decide('rejected')}
                  disabled={busy !== null}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  {busy === 'rejected' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  Confirm rejection
                </button>
                <button
                  onClick={() => {
                    setRejecting(false);
                    setNote('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => decide('approved')}
                disabled={!writable || busy !== null}
                title={writable ? undefined : 'This host cannot save decisions'}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              >
                {busy === 'approved' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Admit as mentor
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={!writable || busy !== null}
                title={writable ? undefined : 'This host cannot save decisions'}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Reject
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400 font-mono">
              {application.status === 'approved' ? 'Admitted' : 'Rejected'}{' '}
              {shortDate(application.decidedAt)}
            </p>
            <button
              onClick={() => decide('pending')}
              disabled={!writable || busy !== null}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
            >
              {busy === 'pending' ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Undo2 className="w-3 h-3" />
              )}
              Move back to pending
            </button>
          </div>
        )}
      </footer>
    </article>
  );
};
