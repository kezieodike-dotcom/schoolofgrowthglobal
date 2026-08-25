import React from 'react';
import { useAdminData, PageHeader, Panel, LoadingState, ErrorState, Note } from './AdminUI';
import type { Integration } from '../../lib/adminApi';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Which services the site is wired to.
 *
 * Reports presence and mode only - never a key or any part of one. A panel
 * that prints an API key to the browser has handed that key to anyone who
 * gets a session, and the whole point of this page is to be safe to open.
 */

export const AdminIntegrationsView: React.FC = () => {
  const { data, error, loading, reload } =
    useAdminData<{ integrations: Integration[] }>('/integrations');

  const missing = (data?.integrations ?? []).filter((i) => i.required && !i.configured);

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle="The services this site depends on, and whether each one is switched on."
      />

      {loading && !data && <LoadingState label="Checking integrations" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-4">
          {missing.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-px" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900">
                  {missing.length} required{' '}
                  {missing.length === 1 ? 'integration is' : 'integrations are'} not
                  configured
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {missing.map((m) => m.name).join(', ')} -{' '}
                  {missing.length === 1 ? 'this feature is' : 'these features are'} not
                  working on the live site.
                </p>
              </div>
            </div>
          )}

          <Panel>
            <div className="divide-y divide-slate-100">
              {data.integrations.map((item) => (
                <div key={item.key} className="px-5 py-4 flex items-start gap-4">
                  <span className="shrink-0 mt-0.5">
                    {item.configured ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : item.required ? (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-slate-300" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      {!item.required && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                          optional
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{item.purpose}</p>
                    <p
                      className={`text-[11px] font-mono ${
                        item.configured ? 'text-slate-600' : 'text-rose-600'
                      }`}
                    >
                      {item.detail}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${
                      item.configured
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {item.configured ? 'live' : 'off'}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Note>
            Values are never shown here, only whether each key is present. Set them in{' '}
            <code className="font-mono text-slate-700">.env</code> locally and in your
            Vercel project settings for the deployed site - a key that works locally is
            absent in production until it is added there too. Changes take effect on
            the next deploy.
          </Note>
        </div>
      )}
    </>
  );
};
