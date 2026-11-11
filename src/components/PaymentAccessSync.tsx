import { useEffect } from 'react';
import { grantEntitlement, useEnrollment } from '../lib/useEnrollment';
import { forgetPendingPayment, pendingPayments } from '../lib/pendingPayment';

// Recover when Paystack's redirect is interrupted or the learner returns in
// another tab. The server still verifies every reference before granting it.
export function PaymentAccessSync() {
  const { entitlements } = useEnrollment();
  useEffect(() => {
    const controller = new AbortController();
    const legacy = entitlements.filter(entry => entry.plan === 'foundation-intensive' && !entry.intensiveAccess).map(entry => entry.reference);
    let running = false;
    async function sync() {
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        for (const reference of new Set([...legacy, ...pendingPayments().map(item => item.reference)])) {
          if (controller.signal.aborted) return;
          try {
            const response = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`, { cache: 'no-store', signal: controller.signal });
            const body = await response.json().catch(() => null);
            if (response.ok && body?.paid) {
              if (body.entitlement) grantEntitlement(body.entitlement);
              forgetPendingPayment(reference);
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
  }, [entitlements]);
  return null;
}
