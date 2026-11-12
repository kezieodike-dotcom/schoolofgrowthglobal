import { useSyncExternalStore } from 'react';
import type { IntensiveCourseId } from '../data/intensiveCourses';
import type { Entitlement } from './pricing';
import { clearEntitlements, replaceIntensiveEntitlements } from './useEnrollment';

export interface StudentDashboard {
  profile: { name: string; email: string };
  entitlements: Entitlement[];
  courses: { id: IntensiveCourseId; title: string; totalLessons: number; completedLessons: number; progressPercentage: number; expiresAt: string; active: boolean; resumePath: string }[];
}
type Snapshot = { phase: 'loading' | 'ready' | 'anonymous' | 'error'; dashboard: StudentDashboard | null; error: string | null };
let snapshot: Snapshot = { phase: 'loading', dashboard: null, error: null };
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const update = (next: Snapshot) => { snapshot = next; listeners.forEach(listener => listener()); };
let generation = 0;
let refreshing: Promise<void> | null = null;

async function responseBody(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.profile || !Array.isArray(body.entitlements) || !Array.isArray(body.courses)) throw new Error(body?.error || 'Your dashboard could not be loaded. Please retry.');
  return body as StudentDashboard;
}
const accept = (dashboard: StudentDashboard) => {
  replaceIntensiveEntitlements(dashboard.entitlements, dashboard.profile.email);
  update({ phase: 'ready', dashboard, error: null });
};

export function refreshStudentAccount(): Promise<void> {
  if (refreshing) return refreshing;
  const current = ++generation;
  refreshing = (async () => {
    try {
      const response = await fetch('/api/students/me', { credentials: 'same-origin', cache: 'no-store' });
      if (current !== generation) return;
      if (response.status === 401) { update({ phase: 'anonymous', dashboard: null, error: null }); return; }
      const dashboard = await responseBody(response);
      if (current === generation) accept(dashboard);
    } catch (error) {
      if (current === generation) update({ phase: 'error', dashboard: snapshot.dashboard, error: error instanceof Error ? error.message : 'Please retry your dashboard.' });
    } finally { refreshing = null; }
  })();
  return refreshing;
}

export async function openStudentDashboard(reference: string, email?: string) {
  const current = ++generation;
  update({ phase: 'loading', dashboard: null, error: null });
  try {
    const response = await fetch('/api/students/open', {
      method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reference, email }),
    });
    const dashboard = await responseBody(response);
    if (current === generation) accept(dashboard);
    return dashboard;
  } catch (error) {
    if (current === generation) update({ phase: 'error', dashboard: null, error: error instanceof Error ? error.message : 'Please retry your dashboard.' });
    throw error;
  }
}

export async function logoutStudent() {
  const response = await fetch('/api/students/logout', { method: 'POST', credentials: 'same-origin' });
  if (!response.ok) throw new Error('Could not sign out. Please retry.');
  ++generation;
  clearEntitlements();
  update({ phase: 'anonymous', dashboard: null, error: null });
}

export const useStudentAccount = () => useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
