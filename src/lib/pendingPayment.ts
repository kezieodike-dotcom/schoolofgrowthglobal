const KEY = 'sog.pending-payments.v1';
type PendingPayment = { reference: string; createdAt: number };
export function pendingPayments(): PendingPayment[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(item => typeof item?.reference === 'string' &&
      Number.isFinite(item.createdAt) && Date.now() - item.createdAt < 86400_000) : [];
  } catch { return []; }
}
export function rememberPendingPayment(reference: string) {
  try { localStorage.setItem(KEY, JSON.stringify([...pendingPayments().filter(item => item.reference !== reference), { reference, createdAt: Date.now() }])); }
  catch { /* The normal callback remains available when browser storage is disabled. */ }
}
export function forgetPendingPayment(reference: string) {
  try { localStorage.setItem(KEY, JSON.stringify(pendingPayments().filter(item => item.reference !== reference))); }
  catch { /* A duplicate verification is safe. */ }
}
