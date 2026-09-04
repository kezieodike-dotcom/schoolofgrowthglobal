import { useSyncExternalStore } from "react";
import {
  hasCourseAccess,
  hasMentorshipAccess,
  PLANS,
  type CourseLevel,
  type Entitlement,
  type PlanCode,
} from "./pricing";

/**
 * What the person at this browser has paid for.
 *
 * Entitlements only ever enter this store from /api/payments/verify, which
 * confirms the charge with Paystack directly. Nothing here can mint access on
 * its own - grant() takes an entitlement the server built, and the UI has no
 * path to construct one.
 *
 * IMPORTANT, and worth being plain about: this is a client-side record, so it
 * gates the *interface*, not the content. Anyone willing to edit localStorage
 * can flip the locks open, and the course material is in the bundle either
 * way. That is the honest ceiling of a site with no accounts and no database.
 *
 * Closing it needs three things, in this order:
 *   1. Student accounts (sign-up, login, session).
 *   2. Entitlements written server-side by the Paystack webhook, keyed to the
 *      account rather than to a browser.
 *   3. Course content served from an API that checks the entitlement per
 *      request, instead of shipping in the bundle.
 *
 * The payment half of that is already real - only the storage is local. So
 * this file is the seam to replace, and the shape it exposes (an array of
 * entitlements plus access questions) is the same shape an API would return.
 */

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
  if (current.some((e) => e.reference === entitlement.reference)) return;
  write([...current, entitlement]);
}

/** Clears every purchase on this browser. Used by the demo reset control. */
export function clearEntitlements() {
  write([]);
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
