import { useSyncExternalStore } from "react";
import type { PlanCode } from "./pricing";

/**
 * Client half of the admin panel: session storage and typed API calls.
 *
 * The session token is held in sessionStorage rather than localStorage, so
 * closing the tab ends the session. For a panel showing payment data that is
 * the right default — an admin who walks away from a shared machine has not
 * left a permanent key behind.
 */

const TOKEN_KEY = "sog.admin.token";

let cached: string | null | undefined;
const listeners = new Set<() => void>();

function readToken(): string | null {
  if (cached !== undefined) return cached;
  try {
    cached = sessionStorage.getItem(TOKEN_KEY);
  } catch {
    cached = null;
  }
  return cached;
}

function writeToken(token: string | null) {
  cached = token;
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private browsing: the session holds in memory for this page only.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useAdminToken(): string | null {
  return useSyncExternalStore(subscribe, readToken, () => null);
}

export const setAdminToken = (token: string) => writeToken(token);
export const clearAdminToken = () => writeToken(null);

/** Thrown when the server rejects the session, so callers can sign out. */
export class AdminAuthError extends Error {}

/**
 * Authenticated GET against the admin API.
 *
 * A 401 clears the stored token as it throws: an expired session should send
 * the panel back to the login screen by itself rather than leaving every
 * page showing its own error.
 */
export async function adminGet<T>(path: string): Promise<T> {
  const token = readToken();
  const res = await fetch(`/api/admin${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new AdminAuthError("Your session has expired. Sign in again.");
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? "Something went wrong loading that data.");
  }
  return body as T;
}

/** Authenticated POST. Same 401 handling as adminGet. */
export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const token = readToken();
  const res = await fetch(`/api/admin${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearAdminToken();
    throw new AdminAuthError('Your session has expired. Sign in again.');
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error ?? 'That action could not be completed.');
  }
  return payload as T;
}

export async function adminLogin(password: string): Promise<void> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.token) {
    throw new Error(body?.error ?? "Could not sign in.");
  }
  setAdminToken(body.token);
}

// ── Response shapes ──────────────────────────────────────────────────────

export interface Enrolment {
  id: number;
  reference: string;
  email: string;
  name: string;
  plan: PlanCode | null;
  planName: string;
  kind: "package" | "mentorship" | null;
  amountKobo: number;
  currency: string;
  status: string;
  channel: string | null;
  paidAt: string | null;
  createdAt: string;
  mentorId: string | null;
}

export interface PlanBreakdown {
  code: PlanCode;
  name: string;
  kind: "package" | "mentorship";
  priceKobo: number;
  count: number;
  revenueKobo: number;
}

export interface Overview {
  connected: boolean;
  message?: string;
  truncated?: boolean;
  totals?: {
    revenueKobo: number;
    enrolments: number;
    students: number;
    attempted: number;
    conversionRate: number;
  };
  last30Days?: { revenueKobo: number; enrolments: number };
  last7Days?: { revenueKobo: number; enrolments: number };
  byPlan?: PlanBreakdown[];
  daily?: { date: string; revenueKobo: number }[];
  recent?: Enrolment[];
}

export interface EnrolmentsResponse {
  connected: boolean;
  message?: string;
  truncated?: boolean;
  enrolments: Enrolment[];
}

export interface Integration {
  key: string;
  name: string;
  purpose: string;
  configured: boolean;
  detail: string;
  required: boolean;
}

export interface AdminStatus {
  enabled: boolean;
  paystackConnected: boolean;
}
