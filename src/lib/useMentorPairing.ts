import { useSyncExternalStore } from "react";

/**
 * Which mentors this student has paired with.
 *
 * Separate from entitlements on purpose: an entitlement is a receipt and only
 * the server may issue one, whereas a pairing is a preference the student
 * changes freely within the slots their plan allows. Keeping them apart means
 * swapping mentors never touches the record of what was paid.
 *
 * Same caveat as useEnrollment: this lives in the browser. When accounts
 * exist, pairings belong on the student record so a mentor can see who they
 * have been matched with.
 */

const STORAGE_KEY = "sog.mentors.v1";

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing; the pairing holds for this session only.
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn) as unknown as void;
}

const EMPTY: string[] = [];

export interface MentorPairing {
  /** Mentor ids this student is paired with. */
  mentorIds: string[];
  isPaired: (mentorId: string) => boolean;
  /** Adds a pairing if a slot is free. Returns false when all slots are used. */
  pair: (mentorId: string) => boolean;
  unpair: (mentorId: string) => void;
  /** Slots still available, given the plan's allowance. */
  slotsLeft: number;
}

export function useMentorPairing(slots: number): MentorPairing {
  const mentorIds = useSyncExternalStore(subscribe, read, () => EMPTY);

  return {
    mentorIds,
    isPaired: (id) => mentorIds.includes(id),
    pair: (id) => {
      if (mentorIds.includes(id)) return true;
      if (mentorIds.length >= slots) return false;
      write([...mentorIds, id]);
      return true;
    },
    unpair: (id) => write(mentorIds.filter((m) => m !== id)),
    slotsLeft: Math.max(0, slots - mentorIds.length),
  };
}
