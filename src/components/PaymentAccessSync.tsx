import { useEffect, useRef } from 'react';
import { grantEntitlement, useEnrollment } from '../lib/useEnrollment';
import { forgetPendingPayment, pendingPayments } from '../lib/pendingPayment';
import { refreshStudentAccount, useStudentAccount } from '../lib/useStudentAccount';

// Recover when Paystack's redirect is interrupted or the learner returns in
// another tab. The server still verifies every reference before granting it.
export function PaymentAccessSync() {
  const { entitlements } = useEnrollment();
  const account = useStudentAccount();
  const checked = useRef(new Set<string>());
  useEffect(() => {
    const controller = new AbortController();
    const legacy = entitlements.filter(entry => entry.plan === 'foundation-intensive' && (!entry.intensiveAccess || account.phase === 'anonymous')).map(entry => entry.reference);
    let running = false;
    async function sync() {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        await refreshStudentAccount();
        for (const reference of new Set([...legacy, ...pendingPayments().map(item => item.reference)])) {
          if (controller.signal.aborted) return;
          if (checked.current.has(reference)) continue;
          try {
            const response = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`, { cache: 'no-store', signal: controller.signal });
            const body = await response.json().catch(() => null);
            if (response.ok && body?.paid) {
              checked.current.add(reference);
              if (body.entitlement) grantEntitlement(body.entitlement);
              forgetPendingPayment(reference);
              if (body.entitlement?.intensiveAccess) await refreshStudentAccount();
            }
          } catch { /* Keep the receipt pending for the next connected visit. */ }
        }
      } finally { running = false; }
    }
    void sync();
    const interval = window.setInterval(sync, 30_000);
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', sync);
    return () => { controller.abort(); clearInterval(interval); window.removeEventListener('online', sync); document.removeEventListener('visibilitychange', sync); };
  }, [entitlements, account.phase === 'anonymous']);
  return null;
}
