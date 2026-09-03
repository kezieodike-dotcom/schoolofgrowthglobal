import React, { useMemo, useState } from 'react';
import {
  useAdminData,
  PageHeader,
  Panel,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
  StatusPill,
  money,
  dateTime,
} from './AdminUI';
import { NotConnected } from './AdminOverviewView';
import { PLANS } from '../../lib/pricing';
import type { Enrolment, EnrolmentsResponse } from '../../lib/adminApi';
import { Search, Download, RefreshCw } from 'lucide-react';

/**
 * Every payment the site has taken, searchable and exportable.
 *
 * Filtering happens in the browser rather than by re-querying Paystack: the
 * whole set is already loaded for the totals, and a local filter responds
 * instantly instead of spending a round trip per keystroke. If the volume
 * ever outgrows that, the search moves server-side - the note about the
 * 500-row cap is the signal to watch.
 */

const STATUSES = ['all', 'success', 'failed', 'abandoned'] as const;

export const AdminEnrolmentsView: React.FC = () => {
  const { data, error, loading, reload } =
    useAdminData<EnrolmentsResponse>('/enrolments');

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all');
  const [plan, setPlan] = useState('all');

  const rows = useMemo(() => {
    const all = data?.enrolments ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((row) => {
      const matchQuery =
        !q ||
        row.email.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q);
      const matchStatus = status === 'all' || row.status === status;
      const matchPlan = plan === 'all' || row.plan === plan || row.kind === plan;
      return matchQuery && matchStatus && matchPlan;
    });
  }, [data, query, status, plan]);

  const paidTotal = rows
    .filter((r) => r.status === 'success')
    .reduce((sum, r) => sum + r.amountKobo, 0);

  return (
    <>
      <PageHeader
        title="Enrolments"
        subtitle="Every transaction Paystack has recorded for this site, newest first."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={reload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? '' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => downloadCsv(rows)}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        }
      />

      {loading && !data && <LoadingState label="Loading enrolments" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && !data.connected && <NotConnected message={data.message} />}

      {data?.connected && (
        <div className="space-y-4">
          {/* Filters, in one row above the table. */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or reference..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    status === s
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All items</option>
              <option value="book">Book sales</option>
              {Object.values(PLANS).map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Panel
            title={`${rows.length} ${rows.length === 1 ? 'transaction' : 'transactions'}`}
            hint={`${money(paidTotal)} collected in this view`}
          >
            {rows.length === 0 ? (
              <EmptyState
                title="Nothing matches"
                body={
                  data.enrolments.length === 0
                    ? 'No payments have been taken yet. They appear here the moment one clears.'
                    : 'No transactions match these filters. Try widening the search.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Buyer', 'Item', 'Amount', 'Split', 'Status', 'Method', 'Date', 'Reference'].map(
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
                    {rows.map((row) => (
                      <tr key={row.reference} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-900">
                            {row.name || '-'}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            {row.email}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-700">{row.planName}</span>
                          {row.kind === 'book' && row.bookOwnerName && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Owner: {row.bookOwnerName}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {money(row.amountKobo)}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-mono text-slate-500 whitespace-nowrap">
                          {row.kind === 'book' && row.companyShareKobo !== null && row.ownerShareKobo !== null ? (
                            <>
                              <p>Company {money(row.companyShareKobo)}</p>
                              <p>Owner {money(row.ownerShareKobo)}</p>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-slate-500 capitalize">
                          {row.channel ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {dateTime(row.paidAt ?? row.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-mono text-slate-400">
                          {row.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {data.truncated && (
            <Note>
              Only the most recent 500 transactions are loaded. Older records are still
              in your Paystack dashboard - this cap keeps the page fast, and would be
              replaced by server-side paging if volume grows.
            </Note>
          )}
        </div>
      )}
    </>
  );
};

/**
 * Exports the current view - filters included - as CSV.
 *
 * Every field is quoted and internal quotes are doubled. A student called
 * O'Brien, or any plan name containing a comma, would otherwise shift every
 * later column by one and corrupt the file silently.
 */
function downloadCsv(rows: Enrolment[]) {
  const headers = [
    'Name',
    'Email',
    'Item',
    'Kind',
    'Amount (NGN)',
    'Company Share (NGN)',
    'Owner Share (NGN)',
    'Book Owner',
    'Book Owner Email',
    'Currency',
    'Status',
    'Method',
    'Paid at',
    'Reference',
  ];

  const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

  const lines = [
    headers.map(cell).join(','),
    ...rows.map((r) =>
      [
        r.name,
        r.email,
        r.planName,
        r.kind ?? '',
        // Naira, not kobo: a spreadsheet column of kobo invites someone to
        // report revenue a hundred times too high.
        (r.amountKobo / 100).toFixed(2),
        r.companyShareKobo === null ? '' : (r.companyShareKobo / 100).toFixed(2),
        r.ownerShareKobo === null ? '' : (r.ownerShareKobo / 100).toFixed(2),
        r.bookOwnerName ?? '',
        r.bookOwnerEmail ?? '',
        r.currency,
        r.status,
        r.channel ?? '',
        r.paidAt ?? r.createdAt,
        r.reference,
      ]
        .map(cell)
        .join(',')
    ),
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sog-enrolments-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
