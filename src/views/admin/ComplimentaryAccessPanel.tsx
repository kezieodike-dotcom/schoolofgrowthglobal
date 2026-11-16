import { useEffect, useState, type FormEvent } from 'react';
import { adminGet, adminPost } from '../../lib/adminApi';

interface Invitation { id: string; name: string; email: string; courseId: string; createdAt: string; expiresAt: string; revokedAt?: string; code: string }
const invitationLink = (code: string) => `${window.location.origin}/activate-course#code=${encodeURIComponent(code)}`;
const date = (value: string) => new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export function ComplimentaryAccessPanel() {
  const [grants, setGrants] = useState<Invitation[]>([]);
  const [learners, setLearners] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function reload() {
    const body = await adminGet<{ grants: Invitation[] }>('/complimentary');
    setGrants(body.grants.filter(row => row.courseId === 'leadership-001'));
  }
  useEffect(() => { void reload().catch(e => setError(e.message)); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setBusy(true);
    try {
      const rows = learners.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
        const separator = line.lastIndexOf(',');
        if (separator < 1) throw new Error('Use one Name, email@example.com per line.');
        return { name: line.slice(0, separator).trim(), email: line.slice(separator + 1).trim() };
      });
      await adminPost('/complimentary', { courseId: 'leadership-001', learners: rows });
      await reload(); setLearners(''); setMessage('Invitations saved. Share each personal link only with its named learner. Existing expiry dates have been preserved.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); }
    finally { setBusy(false); }
  }
  function exportInvitations() {
    const cell = (value: string) => '"' + (/^[=+@\-\t\r]/.test(value) ? "'" : '') + value.replaceAll('"', '""') + '"';
    const rows = [['Name', 'Email', 'Course', 'Access ends (UTC)', 'Status', 'Personal invitation'], ...grants.map(row => [row.name, row.email, 'Foundations of Leadership', row.expiresAt, row.revokedAt ? 'Revoked' : Date.parse(row.expiresAt) > Date.now() ? 'Active' : 'Expired', invitationLink(row.code)])];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'private-foundations-invitations.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="mb-8 rounded-2xl border border-amber-200 bg-white p-5 sm:p-7" aria-labelledby="complimentary-heading">
    <h2 id="complimentary-heading" className="text-xl font-bold text-slate-950">Complimentary course access</h2>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">Foundations of Leadership · 60 days from the date access is granted. No payment required. Inviting the same email again preserves its original expiry.</p>
    <form onSubmit={submit} className="mt-5 space-y-3">
      <label className="block text-sm font-semibold text-slate-800">Learner names and emails<textarea rows={3} required maxLength={25000} value={learners} onChange={e => setLearners(e.target.value)} placeholder="Name, email@example.com (one learner per line)" className="mt-2 block w-full rounded-xl border border-slate-300 p-3 text-sm" /></label>
      <button disabled={busy} className="min-h-11 rounded-xl bg-amber-500 px-5 text-sm font-bold text-slate-950 disabled:opacity-50">{busy ? 'Saving invitations…' : 'Grant 60-day access'}</button>
    </form>
    {error && <p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-emerald-800">{message}</p>}
    {grants.length > 0 && <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold">{grants.length} personal invitations</p><button onClick={exportInvitations} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold">Export private invitations</button></div>
      <div className="mt-3 max-h-96 space-y-3 overflow-y-auto">{grants.map(row => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
        <div className="min-w-0"><p className="text-sm font-semibold">{row.name}</p><p className="break-all text-xs text-slate-600">{row.email}</p><p className="mt-1 text-xs text-slate-500">{row.revokedAt ? 'Revoked' : Date.parse(row.expiresAt) > Date.now() ? 'Access until' : 'Expired'} {date(row.expiresAt)}</p></div>
        {!row.revokedAt && <div className="flex gap-3"><button onClick={async () => { try { await navigator.clipboard.writeText(invitationLink(row.code)); setMessage(`Personal invitation copied for ${row.name}.`); } catch { setError('Use Export private invitations to retrieve the link.'); } }} className="min-h-11 text-sm font-semibold text-amber-800 underline">Copy link</button><button onClick={async () => { setError(''); try { await adminPost(`/complimentary/${row.id}/revoke`, {}); await reload(); } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); } }} className="min-h-11 text-sm text-rose-700 underline">Revoke</button></div>}
      </div>)}</div>
      <p className="mt-3 text-xs text-slate-500">These links are private access credentials. Send each learner only their own link.</p>
    </>}
  </section>;
}
