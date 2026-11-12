import { paystackSecretKey } from './paystackEnv.js';

export async function paystack<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    method: init?.method ?? 'GET', signal: AbortSignal.timeout(15000), redirect: 'error',
    headers: { Authorization: `Bearer ${paystackSecretKey()}`, 'Content-Type': 'application/json' },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.status || !body.data) throw new Error(`Paystack request failed (${response.status}).`);
  return body.data as T;
}
