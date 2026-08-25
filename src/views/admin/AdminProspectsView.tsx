import React, { useMemo, useState } from 'react';
import {
  useAdminData,
  Panel,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
  shortDate,
} from './AdminUI';
import { Search, Mail, Phone, Download, AlertTriangle, CircleCheck } from 'lucide-react';

/**
 * People who enquired but have not paid.
 *
 * The follow-up list: everyone who filled in a form, minus everyone Paystack
 * has taken money from. Answering that used to mean reading back through an
 * inbox and cross-checking the Paystack dashboard by hand.
 */

interface Lead {
  id: string;
  source: string;
  sourceLabel: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  submittedAt: string;
  lastSeenAt: string;
  submissions: number;
  answers: Record<string, string>;
  /** null when payments could not be checked - never render as "not paid". */
  hasPaid: boolean | null;
}

interface Response {
  writable: boolean;
  paymentsConnected: boolean;
  counts: { total: number; awaitingPayment: number; converted: number };
  leads: Lead[];
}

export const AdminProspectsView: React.FC = () => {
  const { data, error, loading, reload } = useAdminData<Response>('/leads');
  const [query, setQuery] = useState('');
  const [onlyUnpaid, setOnlyUnpaid] = useState(true);

  const rows = useMemo(() => {
    const all = data?.leads ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((lead) => {
      const matchQuery =
        !q ||
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.interest.toLowerCase().includes(q);
      // hasPaid === null means unknown, so it stays visible under the unpaid
      // filter rather than being quietly dropped from the follow-up list.
      const matchPaid = !onlyUnpaid || lead.hasPaid !== true;
      return matchQuery && matchPaid;
    });
  }, [data, query, onlyUnpaid]);

  if (loading && !data) return <LoadingState label="Loading enquiries" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <div className="space-y-4">
      {!data.writable && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-px" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-rose-900">
              Enquiries are not being recorded on this host
            </p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              This server's filesystem is read-only, which is normal on Vercel. Form
              submissions are still emailed to you, but nothing can be stored here, so
              this list will stay empty. A database or a host with a persistent disk
              fixes it.
            </p>
          </div>
        </div>
      )}

      {!data.paymentsConnected && data.leads.length > 0 && (
        <Note>
          Paystack is not connected, so nobody can be matched to a payment yet. Every
          enquiry below is shown as unconfirmed rather than assumed unpaid.
        </Note>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or interest..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyUnpaid}
            onChange={(e) => setOnlyUnpaid(e.target.checked)}
            className="w-3.5 h-3.5 accent-amber-500"
          />
          <span className="text-[11px] text-slate-600">Hide those who have paid</span>
        </label>

        <button
          onClick={() => downloadCsv(rows)}
          disabled={rows.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      <Panel
        title={`${rows.length} ${rows.length === 1 ? 'enquiry' : 'enquiries'}`}
        hint={
          data.paymentsConnected
            ? `${data.counts.awaitingPayment} awaiting payment · ${data.counts.converted} converted`
            : undefined
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            title={
              data.leads.length === 0 ? 'No enquiries recorded yet' : 'Nothing matches'
            }
            body={
              data.leads.length === 0
                ? 'Registrations, contact enquiries and syllabus requests appear here as they come in.'
                : 'Try widening the search, or untick the filter to include people who have paid.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {['Person', 'Came from', 'Interested in', 'Enquiries', 'Last contact', 'Status'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-slate-900">
                        {lead.name || '-'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 text-[10px] font-mono text-slate-400">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                        >
                          <Mail className="w-2.5 h-2.5" />
                          {lead.email}
                        </a>
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-1 hover:text-amber-600 transition-colors"
                          >
                            <Phone className="w-2.5 h-2.5" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 whitespace-nowrap">
                        {lead.sourceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 max-w-[220px] truncate">
                      {lead.interest || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 tabular-nums">
                      {lead.submissions}
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {shortDate(lead.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3">
                      {lead.hasPaid === true ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-700">
                          <CircleCheck className="w-3 h-3" /> paid
                        </span>
                      ) : lead.hasPaid === false ? (
                        <span className="px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
                          awaiting payment
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-mono uppercase tracking-wider whitespace-nowrap">
                          unconfirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Note>
        Enquiries are matched to payments <strong>by email address</strong>, the only
        identifier both systems share - so someone who registers with one address and
        pays with another shows here as awaiting payment. This list also starts from
        when lead capture was added; earlier submissions exist only in your inbox and
        cannot be recovered.
      </Note>
    </div>
  );
};

/** Exports the current view, quoting every field so commas cannot shift columns. */
function downloadCsv(rows: Lead[]) {
  const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [
    ['Name', 'Email', 'Phone', 'Came from', 'Interested in', 'Enquiries', 'First contact', 'Last contact', 'Status']
      .map(cell)
      .join(','),
    ...rows.map((r) =>
      [
        r.name,
        r.email,
        r.phone,
        r.sourceLabel,
        r.interest,
        r.submissions,
        r.submittedAt,
        r.lastSeenAt,
        r.hasPaid === true ? 'Paid' : r.hasPaid === false ? 'Awaiting payment' : 'Unconfirmed',
      ]
        .map(cell)
        .join(',')
    ),
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sog-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
