import crypto from "crypto";
import { createJsonStore } from "./jsonStore.js";

/**
 * Where mentor applications live between being submitted and being decided.
 *
 * Admitting or rejecting a mentor is a decision that has to outlive the
 * request that made it. The row shape below is deliberately the shape a
 * `mentor_applications` table would have, so moving to a database means
 * swapping the store and leaving these functions alone.
 *
 * See jsonStore.ts for where this persists and where it cannot.
 */

const store = createJsonStore<MentorApplication>("mentors.json");

export type MentorStatus = "pending" | "approved" | "rejected";

export interface MentorApplication {
  id: string;
  status: MentorStatus;
  submittedAt: string;
  decidedAt: string | null;
  /** Free-text reason recorded with a decision, shown only in the admin. */
  decisionNote: string | null;
  /** Every answer from the registration wizard, label → value. */
  answers: Record<string, string>;
  // Denormalised for listing, so the table does not have to guess which
  // answer key holds the name on an application submitted before a field
  // was renamed.
  name: string;
  email: string;
  title: string;
  organization: string;
  location: string;
  area: string;
  experience: string;
  specialisms: string[];
}

const readAll = () => store.read();
const writeAll = (rows: MentorApplication[]) => store.write(rows);

/** Whether decisions can actually be persisted on this host. */
export const isWritable = () => store.isWritable();

// ── Operations ───────────────────────────────────────────────────────────

export function listApplications(status?: MentorStatus): MentorApplication[] {
  const rows = readAll();
  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function countsByStatus(): Record<MentorStatus, number> {
  const rows = readAll();
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
}

/** Approved applications only, for the public directory. */
export function listApproved(): MentorApplication[] {
  return listApplications("approved");
}

export function createApplication(input: {
  answers: Record<string, string>;
}): MentorApplication {
  const answers = input.answers;
  const pick = (label: string) => answers[label]?.trim() ?? "";

  const application: MentorApplication = {
    id: crypto.randomUUID(),
    status: "pending",
    submittedAt: new Date().toISOString(),
    decidedAt: null,
    decisionNote: null,
    answers,
    name: pick("Full name"),
    email: pick("Email address"),
    title: pick("Current title"),
    organization: pick("Organisation"),
    location: pick("City & country"),
    area: pick("Primary school"),
    experience: pick("Years of experience"),
    specialisms: pick("Specialisms")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };

  const rows = readAll();

  // One pending application per email. Someone who submits twice because the
  // first confirmation email did not arrive should not appear twice in the
  // reviewer's queue.
  const duplicate = rows.find(
    (r) =>
      r.status === "pending" &&
      r.email.toLowerCase() === application.email.toLowerCase() &&
      application.email !== ""
  );
  if (duplicate) {
    Object.assign(duplicate, application, {
      id: duplicate.id,
      submittedAt: duplicate.submittedAt,
    });
    writeAll(rows);
    return duplicate;
  }

  rows.push(application);
  writeAll(rows);
  return application;
}

/** Records an admit/reject decision. Returns null when the id is unknown. */
export function decideApplication(
  id: string,
  decision: "approved" | "rejected",
  note?: string
): MentorApplication | null {
  const rows = readAll();
  const row = rows.find((r) => r.id === id);
  if (!row) return null;

  row.status = decision;
  row.decidedAt = new Date().toISOString();
  row.decisionNote = note?.trim() || null;

  writeAll(rows);
  return row;
}

/** Returns a decided application to the queue, for an undo. */
export function reopenApplication(id: string): MentorApplication | null {
  const rows = readAll();
  const row = rows.find((r) => r.id === id);
  if (!row) return null;

  row.status = "pending";
  row.decidedAt = null;
  row.decisionNote = null;

  writeAll(rows);
  return row;
}
