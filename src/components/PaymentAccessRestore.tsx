import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function PaymentAccessRestore() {
  const [reference, setReference] = useState('');
  const navigate = useNavigate();
  return <form className="rounded-xl border border-slate-200 bg-white p-5 text-left" onSubmit={event => {
    event.preventDefault();
    if (reference.trim()) navigate(`/payment/callback?reference=${encodeURIComponent(reference.trim())}`);
  }}>
    <h2 className="font-bold text-slate-900">Already paid?</h2>
    <p className="mt-1 text-sm text-slate-600">Enter the transaction reference from your Paystack receipt to restore your courses on this device. You do not need to pay again.</p>
    <label htmlFor="restore-payment-reference" className="mt-4 block text-sm font-medium text-slate-700">Payment reference</label>
    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
      <input id="restore-payment-reference" required maxLength={200} autoComplete="off" value={reference} onChange={event => setReference(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm text-slate-900" />
      <button className="min-h-11 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950">Restore access</button>
    </div>
  </form>;
}
