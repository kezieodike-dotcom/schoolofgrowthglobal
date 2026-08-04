import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminData, PageHeader, Panel, StatTile, LoadingState, ErrorState, EmptyState, Note, StatusPill, money, dateTime } from './AdminUI';
import type { Overview, PlanBreakdown } from '../../lib/adminApi';
import {
  Wallet,
  Users,
  Receipt,
  Percent,
  ArrowRight,
  RefreshCw,
  PlugZap,
} from 'lucide-react';

/**
 * The dashboard.
 *
 * Every figure comes from Paystack, which is the system of record for
 * enrolments here — a payment is what enrols someone. Nothing on this page is
 * computed from a second store that could disagree with it.
 */

export const AdminOverviewView: React.FC = () => {
  const { data, error, loading, reload } = useAdminData<Overview>('/overview');

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Live enrolment and revenue figures, read directly from Paystack."
        action={
          <button
            onClick={reload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {loading && !data && <LoadingState label="Loading dashboard" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && !data.connected && <NotConnected message={data.message} />}

      {data?.connected && data.totals && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatTile
              label="Total revenue"
              value={money(data.totals.revenueKobo)}
              sub={`${money(data.last30Days?.revenueKobo ?? 0)} in the last 30 days`}
              icon={<Wallet className="w-4 h-4" />}
              tone="positive"
            />
            <StatTile
              label="Enrolments"
              value={data.totals.enrolments.toLocaleString('en-NG')}
              sub={`${data.last30Days?.enrolments ?? 0} in the last 30 days`}
              icon={<Receipt className="w-4 h-4" />}
            />
            <StatTile
              label="Students"
              value={data.totals.students.toLocaleString('en-NG')}
              sub="Unique paying email addresses"
              icon={<Users className="w-4 h-4" />}
            />
            <StatTile
              label="Checkout conversion"
              value={`${data.totals.conversionRate}%`}
              sub={`${data.totals.enrolments} paid of ${data.totals.attempted} started`}
              icon={<Percent className="w-4 h-4" />}
            />
          </div>

          {data.truncated && (
            <Note>
              These totals cover the most recent 500 transactions. Past that, figures
              would need Paystack's own aggregate reports — so treat the numbers above
              as "recent", not "all time".
            </Note>
          )}

          <RevenueChart daily={data.daily ?? []} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlanTable plans={data.byPlan ?? []} />
            <RecentEnrolments rows={data.recent ?? []} />
          </div>
        </div>
      )}
    </>
  );
};

// ── Revenue over time ────────────────────────────────────────────────────

/**
 * Daily revenue for the last 30 days.
 *
 * One measure, one hue — there is no second series, so there is nothing for
 * colour to distinguish and no legend to carry. Bars rather than a line
 * because daily takings are discrete events, not a continuous quantity being
 * sampled: a line between two days implies revenue at 3am on Tuesday.
 *
 * Values are labelled on hover rather than printed on every bar; thirty
 * numbers across a strip of chart is noise, and the exact figures live one
 * click away on the enrolments table.
 */
const RevenueChart: React.FC<{ daily: { date: string; revenueKobo: number }[] }> = ({
  daily,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const peak = Math.max(...daily.map((d) => d.revenueKobo), 1);
  const total = daily.reduce((sum, d) => sum + d.revenueKobo, 0);

  return (
    <Panel
      title="Revenue, last 30 days"
      hint={total > 0 ? `${money(total)} collected` : undefined}
    >
      <div className="p-5">
        {total === 0 ? (
          <EmptyState
            title="No revenue in the last 30 days"
            body="Once payments start coming through Paystack, daily takings appear here."
          />
        ) : (
          <div className="relative">
            <div
              className="flex items-end gap-[2px] h-44"
              role="img"
              aria-label={`Daily revenue for the last 30 days. Total ${money(
                total
              )}. Best day ${money(peak)}.`}
            >
              {daily.map((day, i) => {
                const height = (day.revenueKobo / peak) * 100;
                const active = hovered === i;
                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="flex-1 h-full flex items-end min-w-0 cursor-default"
                  >
                    {/* A zero day still draws a 2px stub, so the axis reads as
                        thirty days rather than only the days that had a sale. */}
                    <div
                      style={{ height: day.revenueKobo > 0 ? `${Math.max(height, 3)}%` : '2px' }}
                      className={`w-full rounded-t transition-colors ${
                        day.revenueKobo > 0
                          ? active
                            ? 'bg-amber-600'
                            : 'bg-amber-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-400">
              <span>{formatDay(daily[0]?.date)}</span>
              <span>{formatDay(daily[daily.length - 1]?.date)}</span>
            </div>

            {hovered !== null && daily[hovered] && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-mono whitespace-nowrap shadow-lg pointer-events-none">
                {formatDay(daily[hovered].date)} ·{' '}
                <span className="text-amber-400">
                  {money(daily[hovered].revenueKobo)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
};

const formatDay = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    : '';

// ── Plan performance ─────────────────────────────────────────────────────

/**
 * Sales per plan.
 *
 * A table with an inline magnitude bar rather than a pie: five categories with
 * two measures each is a reading task, and exact figures matter more than
 * proportion when you are deciding whether a package is priced right. Plans
 * that have never sold still appear — a zero is information.
 */
const PlanTable: React.FC<{ plans: PlanBreakdown[] }> = ({ plans }) => {
  const peak = Math.max(...plans.map((p) => p.revenueKobo), 1);

  return (
    <Panel title="Sales by plan" hint="Every plan, including those with no sales yet">
      <div className="divide-y divide-slate-100">
        {plans.map((plan) => (
          <div key={plan.code} className="px-5 py-3.5 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {plan.name}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  {money(plan.priceKobo)} ·{' '}
                  {plan.kind === 'package' ? 'course package' : 'mentorship'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                  {money(plan.revenueKobo)}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  {plan.count} {plan.count === 1 ? 'sale' : 'sales'}
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${(plan.revenueKobo / peak) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

// ── Recent activity ──────────────────────────────────────────────────────

const RecentEnrolments: React.FC<{ rows: Overview['recent'] }> = ({ rows }) => (
  <Panel
    title="Recent enrolments"
    action={
      <Link
        to="/admin/enrolments"
        className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 whitespace-nowrap transition-colors"
      >
        View all <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    }
  >
    {!rows || rows.length === 0 ? (
      <EmptyState
        title="No enrolments yet"
        body="Payments made through the site appear here the moment they clear."
      />
    ) : (
      <div className="divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.reference} className="px-5 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-900 truncate">
                {row.name || row.email || 'Unknown'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">
                {row.planName} · {dateTime(row.paidAt ?? row.createdAt)}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                {money(row.amountKobo)}
              </p>
              <StatusPill status={row.status} />
            </div>
          </div>
        ))}
      </div>
    )}
  </Panel>
);

// ── Paystack not connected ───────────────────────────────────────────────

export const NotConnected: React.FC<{ message?: string }> = ({ message }) => (
  <div className="rounded-2xl bg-white border border-amber-300 shadow-sm p-8 text-center space-y-4">
    <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
      <PlugZap className="w-7 h-7 text-amber-600" />
    </div>
    <div className="space-y-1.5">
      <h2 className="text-lg font-serif font-bold text-slate-900">
        Paystack is not connected yet
      </h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        {message ??
          'Enrolments and revenue are read from Paystack, so this panel stays empty until the account is live.'}
      </p>
    </div>
    <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
      <p className="text-[11px] font-bold text-slate-700">To switch it on:</p>
      <ol className="space-y-1 text-[11px] text-slate-500 list-decimal list-inside leading-relaxed">
        <li>Create a Paystack account and open Settings → API Keys</li>
        <li>
          Add <code className="font-mono text-slate-700">PAYSTACK_SECRET_KEY</code> and{' '}
          <code className="font-mono text-slate-700">PAYSTACK_PUBLIC_KEY</code> to your
          environment
        </li>
        <li>
          Point the dashboard webhook at{' '}
          <code className="font-mono text-slate-700">/api/payments/webhook</code>
        </li>
      </ol>
    </div>
    <Link
      to="/admin/integrations"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
    >
      Check integration status <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);
