import React, { useMemo, useState } from 'react';
import {
  useAdminData,
  PageHeader,
  Panel,
  LoadingState,
  ErrorState,
  EmptyState,
  Note,
  money,
  shortDate,
} from './AdminUI';
import { NotConnected } from './AdminOverviewView';
import { AdminProspectsView } from './AdminProspectsView';
import { PLANS } from '../../lib/pricing';
import type { EnrolmentsResponse } from '../../lib/adminApi';
import { Search, Mail } from 'lucide-react';

/**
 * Students, derived from payments.
 *
 * There is no student table to read — an account system does not exist yet —
 * so a "student" here is an email address that has paid for something, rolled
 * up across all of its payments. That is a real, defensible definition, and
 * it is stated on the page so nobody reads this as a registration list.
 *
 * People who registered but never paid are not here. Those submissions arrive
 * by email, which the note at the bottom explains.
 */

interface Student {
  email: string;
  name: string;
  plans: string[];
  totalKobo: number;
  firstPaidAt: string;
  lastPaidAt: string;
  payments: number;
  hasMentorship: boolean;
}

export const AdminStudentsView: React.FC = () => {
  // Two questions that belong side by side: who is paying, and who enquired
  // but has not. Separate pages would make the second easy to forget, and
  // following up with the second is where the revenue is.
  const [tab, setTab] = useState<'paying' | 'prospects'>('paying');

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Everyone who has paid, and everyone who enquired but has not."
      />

      <div className="flex items-center gap-1 mb-5 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        {(
          [
            ['paying', 'Paying students'],
            ['prospects', 'Awaiting payment'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-lg text-[11px] font-medium transition-colors ${
              tab === id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'paying' ? <PayingStudents /> : <AdminProspectsView />}
    </>
  );
};

const PayingStudents: React.FC = () => {
  const { data, error, loading, reload } =
    useAdminData<EnrolmentsResponse>('/enrolments');
  const [query, setQuery] = useState('');

  const students = useMemo(() => {
    const paid = (data?.enrolments ?? []).filter((e) => e.status === 'success');
    const map = new Map<string, Student>();

    for (const row of paid) {
      const key = row.email.toLowerCase();
      if (!key) continue;

      const when = row.paidAt ?? row.createdAt;
      const existing = map.get(key);
      const mentorship = row.plan ? PLANS[row.plan].mentorshipDays > 0 : false;

      if (!existing) {
        map.set(key, {
          email: row.email,
          name: row.name,
          plans: [row.planName],
          totalKobo: row.amountKobo,
          firstPaidAt: when,
          lastPaidAt: when,
          payments: 1,
          hasMentorship: mentorship,
        });
        continue;
      }

      existing.payments += 1;
      existing.totalKobo += row.amountKobo;
      // A later payment may carry a name where an earlier one did not, so the
      // roll-up keeps the first non-empty rather than the first seen.
      existing.name ||= row.name;
      if (!existing.plans.includes(row.planName)) existing.plans.push(row.planName);
      if (when < existing.firstPaidAt) existing.firstPaidAt = when;
      if (when > existing.lastPaidAt) existing.lastPaidAt = when;
      existing.hasMentorship ||= mentorship;
    }

    const q = query.trim().toLowerCase();
    return Array.from(map.values())
      .filter(
        (s) =>
          !q || s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      )
      .sort((a, b) => b.lastPaidAt.localeCompare(a.lastPaidAt));
  }, [data, query]);

  const lifetime = students.reduce((sum, s) => sum + s.totalKobo, 0);

  return (
    <>
      {loading && !data && <LoadingState label="Loading students" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && !data.connected && <NotConnected message={data.message} />}

      {data?.connected && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <Panel
            title={`${students.length} ${students.length === 1 ? 'student' : 'students'}`}
            hint={
              students.length > 0
                ? `${money(lifetime)} lifetime value in this view`
                : undefined
            }
          >
            {students.length === 0 ? (
              <EmptyState
                title="No students yet"
                body="Anyone who completes a payment appears here automatically."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Student', 'Holds', 'Payments', 'Lifetime value', 'Joined', 'Last payment'].map(
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
                    {students.map((s) => (
                      <tr key={s.email} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 shrink-0 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-mono font-bold uppercase">
                              {(s.name || s.email).slice(0, 2)}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-slate-900 truncate">
                                {s.name || '—'}
                              </p>
                              <a
                                href={`mailto:${s.email}`}
                                className="text-[10px] font-mono text-slate-400 hover:text-amber-600 truncate flex items-center gap-1 transition-colors"
                              >
                                <Mail className="w-2.5 h-2.5" />
                                {s.email}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {s.plans.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-600 whitespace-nowrap"
                              >
                                {p}
                              </span>
                            ))}
                            {s.hasMentorship && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-700 whitespace-nowrap">
                                mentor access
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-600 tabular-nums">
                          {s.payments}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                          {money(s.totalKobo)}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {shortDate(s.firstPaidAt)}
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {shortDate(s.lastPaidAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Note>
            <strong>This list is everyone who has paid.</strong> People who enquired
            but have not paid are under <em>Awaiting payment</em>.
          </Note>
        </div>
      )}
    </>
  );
};
