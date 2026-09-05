import crypto from "crypto";
import { createJsonStore } from "./jsonStore.js";

/**
 * Everyone who has filled in a form on the site.
 *
 * Registrations, contact enquiries, syllabus requests and cohort applications
 * were previously emailed and then gone - the inbox was the only record, so
 * "who registered but has not paid yet" was a question nobody could answer
 * without reading back through their mail.
 *
 * This keeps a copy so the admin panel can answer it. The email still goes
 * out and is still the notification; this is the list.
 *
 * Note it captures from the moment it was deployed onward. Submissions made
 * before then exist only as email and cannot be recovered here - the admin
 * page says so rather than presenting a short list as the whole history.
 */

const store = createJsonStore<Lead>("leads.json");

/** Which form produced this lead. Mirrors the keys in src/lib/formDefs.ts. */
export type LeadSource =
  | "student"
  | "contact"
  | "application"
  | "jobApplication"
  | "syllabus"
  | "corporate"
  | "consultation"
  | "certificateVerification"
  | "newsletter"
  | "mentor";

export interface Lead {
  id: string;
  source: LeadSource;
  /** Human label for the form, e.g. "Student Registration". */
  sourceLabel: string;
  name: string;
  email: string;
  phone: string;
  /** What they said they were interested in, when the form asked. */
  interest: string;
  submittedAt: string;
  /** Most recent submission, when the same person has filled in more forms. */
  lastSeenAt: string;
  /** How many times this email has submitted anything. */
  submissions: number;
  /** Every field from the most recent submission, label → value. */
  answers: Record<string, string>;
}

export const isWritable = () => store.isWritable();

export function listLeads(): Lead[] {
  return store.read().sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}

/**
 * Records a submission.
 *
 * Rolled up per email address rather than appended blindly: someone who
 * requests a syllabus, then registers, then asks a question is one prospect
 * to follow up with, not three rows to chase. The counter and lastSeenAt
 * preserve that they came back, which is the signal worth acting on.
 */
export function recordLead(input: {
  source: LeadSource;
  sourceLabel: string;
  answers: Record<string, string>;
}): Lead | null {
  const pick = (...labels: string[]) => {
    for (const label of labels) {
      const value = input.answers[label]?.trim();
      if (value) return value;
    }
    return "";
  };

  const email = pick("Email", "Email address", "Work Email", "Corporate Email");
  // An anonymous submission cannot be followed up or matched against a
  // payment, so there is nothing useful to store.
  if (!email) return null;

  const now = new Date().toISOString();
  const lead: Lead = {
    id: crypto.randomUUID(),
    source: input.source,
    sourceLabel: input.sourceLabel,
    name: pick("Full Name", "Full name", "Name"),
    email,
    phone: pick("Phone / WhatsApp", "Phone"),
    interest: pick(
      "School of Interest",
      "Programme",
      "Job Applied For",
      "Interested In",
      "Growth Division",
      "Requested Product",
      "Requested Full Cohort",
      "Current Title & Organization",
      "Team Size / Focus Area"
    ),
    submittedAt: now,
    lastSeenAt: now,
    submissions: 1,
    answers: input.answers,
  };

  const rows = store.read();
  const existing = rows.find(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    existing.submissions += 1;
    existing.lastSeenAt = now;
    existing.source = lead.source;
    existing.sourceLabel = lead.sourceLabel;
    existing.answers = lead.answers;
    // Keep whatever we already knew if this form did not ask for it - a
    // newsletter signup must not blank out the name a registration supplied.
    existing.name ||= lead.name;
    existing.phone ||= lead.phone;
    existing.interest ||= lead.interest;
    store.write(rows);
    return existing;
  }

  rows.push(lead);
  store.write(rows);
  return lead;
}
