import { useSyncExternalStore } from "react";
import type { PaidCourseId } from '../data/paidCourseCatalogue';
import type { IntensiveCourseId } from '../data/intensiveCourses';
import {
  hasCourseAccess,
  hasMentorshipAccess,
  PLANS,
  type CourseLevel,
  type Entitlement,
  type PlanCode,
} from "./pricing";

/** Browser copies of verified purchases drive navigation. Intensive and individual
 * Leadership content additionally require server-signed, course-scoped access.
 * Intensive purchases are persisted by the webhook and restored by receipt. */

const STORAGE_KEY = "sog.entitlements.v1";

/**
 * A student may hold several at once - a course package and a standalone
 * mentorship, say - so access is the union of what each grants rather than
 * one "current plan".
 */
type Store = Entitlement[];

let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // A hand-edited or half-written value must not crash the whole site, so
    // anything that is not an array is treated as no purchases.
    cache = Array.isArray(parsed) ? (parsed as Store) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: Store) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing and full quotas both throw here. The purchase still
    // applies for this session; it just will not survive a reload.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  // Keeps two tabs consistent: paying in one unlocks the other without a
  // reload, which is the common case when checkout opens in a new tab.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      fn();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Records a verified purchase. Re-verifying the same reference is a no-op. */
export function grantEntitlement(entitlement: Entitlement) {
  const current = read();
  const previous = current.find(e => e.reference === entitlement.reference);
  if (previous) {
    if ((entitlement.leadershipAccess || entitlement.intensiveAccess) && previous.plan === entitlement.plan) {
      write(current.map(e => e.reference === entitlement.reference ? entitlement : e));
    }
    return;
  }
  write([...current, entitlement]);
}

export function leadershipPurchaseFor(entitlements: Entitlement[], id: PaidCourseId) {
  const purchases = entitlements.filter(entry => entry?.plan === id && entry.leadershipAccess && typeof entry.reference === 'string');
  return purchases.find(entry => Date.parse(entry.leadershipAccess!.expiresAt) > Date.now()) ?? purchases.at(-1);
}

export function leadershipAccessToken(id: PaidCourseId): string | undefined {
  const access = leadershipPurchaseFor(read(), id)?.leadershipAccess;
  return access && Date.parse(access.expiresAt) > Date.now() ? access.token : undefined;
}

export function intensivePurchaseFor(entitlements: Entitlement[], id: IntensiveCourseId) {
  const purchases = entitlements.filter(entry => entry.intensiveAccess?.courseIds.includes(id));
  return purchases.find(entry => Date.parse(entry.intensiveAccess!.expiresAt) > Date.now()) ?? purchases.at(-1);
}

export function intensiveAccessToken(id: IntensiveCourseId): string | undefined {
  const access = intensivePurchaseFor(read(), id)?.intensiveAccess;
  return access && Date.parse(access.expiresAt) > Date.now() ? access.token : undefined;
}

/** Clears every purchase on this browser. Used by the demo reset control. */
export function clearEntitlements() {
  write([]);
}

/** Server-owned intensive purchases replace stale copies from another learner. */
export function replaceIntensiveEntitlements(entitlements: Entitlement[], email?: string) {
  const next = [...read().filter(entry => entry.plan !== 'foundation-intensive' && (!email || entry.email?.trim().toLowerCase() === email)), ...entitlements];
  if (JSON.stringify(next) !== JSON.stringify(read())) write(next);
}

export interface Enrollment {
  entitlements: Entitlement[];
  /** True once anything at all has been paid for. */
  isEnrolled: boolean;
  /** True while the mentor directory is unlocked. */
  hasMentorship: boolean;
  /** How many mentors may be paired with at once, across every live plan. */
  mentorSlots: number;
  /** The packages paid for, richest last. */
  packages: PlanCode[];
  /** Can this student open a course at the given level? */
  canAccessLevel: (level: CourseLevel) => boolean;
  /** Name of the best package held, for the dashboard chip. e.g. "Elite". */
  currentPackageName: string | null;
  /** When course access lapses, or null when none is held. */
  coursesExpireAt: Date | null;
}

export function useEnrollment(): Enrollment {
  const entitlements = useSyncExternalStore(subscribe, read, () => EMPTY);

  const packages = entitlements
    .filter((e) => PLANS[e.plan]?.kind === "package" || PLANS[e.plan]?.kind === "course-bundle")
    .sort((a, b) => PLANS[a.plan].amountKobo - PLANS[b.plan].amountKobo)
    .map((e) => e.plan);

  const expiries = entitlements
    .map((e) => new Date(e.coursesExpireAt))
    .filter((d) => d.getTime() > Date.now());

  // Slots come from the best live mentorship grant rather than the sum, so
  // holding Elite and a standalone mentorship plan does not quietly stack slots.
  const mentorSlots = entitlements
    .filter((e) => new Date(e.mentorshipExpiresAt).getTime() > Date.now())
    .reduce((best, e) => Math.max(best, PLANS[e.plan]?.mentorSlots ?? 0), 0);

  return {
    entitlements,
    isEnrolled: entitlements.length > 0,
    hasMentorship: hasMentorshipAccess(entitlements),
    mentorSlots,
    packages,
    canAccessLevel: (level) => hasCourseAccess(entitlements, level),
    currentPackageName: packages.length
      ? PLANS[packages[packages.length - 1]].name
      : null,
    coursesExpireAt: expiries.length
      ? new Date(Math.max(...expiries.map((d) => d.getTime())))
      : null,
  };
}

/**
 * Stable empty array for the server snapshot. Returning a fresh [] each call
 * would make useSyncExternalStore see a new value every render and loop.
 */
const EMPTY: Store = [];
