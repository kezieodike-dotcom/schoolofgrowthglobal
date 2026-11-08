import crypto from "crypto";
import { createJsonStore } from "./jsonStore.js";
import { normalizeSupabaseUrl, readSupabaseEnv, readSupabaseEnvWithDefault } from "./supabaseEnv.js";

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
  applicationType?: "mentor" | "consultant";
}

const readAll = () => store.read();
const writeAll = (rows: MentorApplication[]) => store.write(rows);

/** Whether decisions can actually be persisted on this host. */
export const isWritable = () => isRemoteStore() || store.isWritable();

const MENTOR_KIND = "team";
const MENTOR_ID_PREFIX = "mentor-";

function supabaseConfig() {
  const rawUrl = readSupabaseEnv("SUPABASE_URL");
  const serviceKey = readSupabaseEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!rawUrl || !serviceKey) return null;
  return {
    url: normalizeSupabaseUrl(rawUrl),
    serviceKey,
    table: readSupabaseEnvWithDefault("SUPABASE_CONTENT_TABLE", "sog_content_items"),
  };
}

function isRemoteStore() {
  return Boolean(supabaseConfig());
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  const response = await fetch(`${config.url}/rest/v1/${config.table}${path}`, {
    ...init,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(body?.message ?? body?.error ?? "Supabase mentor storage failed.");
  return body as T;
}

async function remoteApplications(): Promise<MentorApplication[]> {
  const rows = await supabaseRequest<Array<{ payload: MentorApplication }>>(
    `?select=payload&kind=eq.${MENTOR_KIND}&id=like.${MENTOR_ID_PREFIX}*&order=updated_at.desc`
  );
  return rows.map((row) => row.payload).filter(Boolean);
}

async function remoteWrite(application: MentorApplication): Promise<MentorApplication> {
  const now = new Date().toISOString();
  await supabaseRequest(`?on_conflict=kind,id`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: `${MENTOR_ID_PREFIX}${application.id}`,
      kind: MENTOR_KIND,
      payload: application,
      published: application.status === "approved",
      updated_at: now,
    }),
  });
  return application;
}

// ── Operations ───────────────────────────────────────────────────────────

export function listApplications(status?: MentorStatus): MentorApplication[] {
  const rows = readAll();
  const filtered = status ? rows.filter((r) => r.status === status) : rows;
  return filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function listApplicationsAsync(status?: MentorStatus): Promise<MentorApplication[]> {
  const rows = isRemoteStore() ? await remoteApplications() : listApplications();
  return (status ? rows.filter((row) => row.status === status) : rows).sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export function countsByStatus(): Record<MentorStatus, number> {
  const rows = readAll();
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };
}

export async function countsByStatusAsync(): Promise<Record<MentorStatus, number>> {
  const rows = isRemoteStore() ? await remoteApplications() : readAll();
  return {
    pending: rows.filter((row) => row.status === "pending").length,
    approved: rows.filter((row) => row.status === "approved").length,
    rejected: rows.filter((row) => row.status === "rejected").length,
  };
}

/** Approved applications only, for the public directory. */
export function listApproved(): MentorApplication[] {
  return listApplications("approved");
}

export async function listApprovedAsync(): Promise<MentorApplication[]> {
  return listApplicationsAsync("approved");
}

export function createApplication(input: {
  answers: Record<string, string>;
  applicationType?: "mentor" | "consultant";
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
    applicationType: input.applicationType ?? "mentor",
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

export async function createApplicationAsync(input: {
  answers: Record<string, string>;
  applicationType?: "mentor" | "consultant";
}): Promise<MentorApplication> {
  if (!isRemoteStore()) return createApplication(input);

  const application = buildApplication(input);
  const rows = await remoteApplications();
  const duplicate = rows.find(
    (row) => row.status === "pending" && row.email.toLowerCase() === application.email.toLowerCase() && application.email
  );
  if (duplicate) {
    application.id = duplicate.id;
    application.submittedAt = duplicate.submittedAt;
  }
  return remoteWrite(application);
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

export async function decideApplicationAsync(
  id: string,
  decision: "approved" | "rejected",
  note?: string
): Promise<MentorApplication | null> {
  if (!isRemoteStore()) return decideApplication(id, decision, note);
  const rows = await remoteApplications();
  const row = rows.find((application) => application.id === id);
  if (!row) return null;
  row.status = decision;
  row.decidedAt = new Date().toISOString();
  row.decisionNote = note?.trim() || null;
  return remoteWrite(row);
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

export async function reopenApplicationAsync(id: string): Promise<MentorApplication | null> {
  if (!isRemoteStore()) return reopenApplication(id);
  const rows = await remoteApplications();
  const row = rows.find((application) => application.id === id);
  if (!row) return null;
  row.status = "pending";
  row.decidedAt = null;
  row.decisionNote = null;
  return remoteWrite(row);
}

function buildApplication(input: {
  answers: Record<string, string>;
  applicationType?: "mentor" | "consultant";
}): MentorApplication {
  const answers = input.answers;
  const pick = (label: string) => answers[label]?.trim() ?? "";
  return {
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
    specialisms: pick("Specialisms").split(",").map((s) => s.trim()).filter(Boolean),
    applicationType: input.applicationType ?? "mentor",
  };
}
