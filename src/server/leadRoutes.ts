import { Router } from "express";
import {
  recordLead,
  listLeads,
  isWritable,
  type LeadSource,
} from "./leadStore.js";

/**
 * Lead capture, and the admin view of who has enquired but not yet paid.
 *
 * The interesting work is the cross-reference: a lead is only a prospect
 * until they pay, and the payments live in Paystack. So the admin endpoint
 * pulls both and matches on email, which turns two lists nobody could
 * reconcile by hand into one answer — here is who to follow up with.
 */

const SOURCES: LeadSource[] = [
  "student",
  "contact",
  "application",
  "syllabus",
  "corporate",
  "newsletter",
  "mentor",
];

const MAX_FIELDS = 40;
const MAX_FIELD_LENGTH = 2000;

/** Bounds an unauthenticated write to disk on every axis. */
function sanitise(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0 || entries.length > MAX_FIELDS) return null;

  const clean: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (typeof key !== "string" || key.length > 120) return null;
    if (typeof value === "string") clean[key] = value.slice(0, MAX_FIELD_LENGTH);
  }
  return clean;
}

interface PaystackTransaction {
  status: string;
  amount: number;
  paid_at: string | null;
  created_at: string;
  customer?: { email?: string };
  metadata?: { plan?: string } | null;
}

/** Emails that have at least one successful payment, lowercased. */
async function paidEmails(): Promise<Set<string> | null> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return null;

  const paid = new Set<string>();
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.paystack.co/transaction?perPage=100&page=${page}&status=success`,
      { headers: { Authorization: `Bearer ${key}` } }
    );
    const body = (await res.json().catch(() => null)) as
      | { status?: boolean; data?: PaystackTransaction[] }
      | null;
    if (!res.ok || !body?.status || !Array.isArray(body.data)) break;

    for (const tx of body.data) {
      const email = tx.customer?.email?.toLowerCase();
      if (email) paid.add(email);
    }
    if (body.data.length < 100) break;
  }
  return paid;
}

export function createLeadRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  /** Records a form submission. Called by every public form on the site. */
  router.post("/leads", (req, res) => {
    const { source, sourceLabel } = req.body ?? {};
    if (!SOURCES.includes(source)) {
      return res.status(400).json({ error: "Unknown form." });
    }

    const answers = sanitise(req.body?.answers);
    if (!answers) {
      return res.status(400).json({ error: "That does not look like a submission." });
    }

    if (!isWritable()) {
      // Soft failure. The submission was still emailed by the browser, so the
      // enquiry is not lost — only our copy of it. Reporting an error to a
      // visitor because our lead list is unavailable would cost a real
      // enquiry over an internal problem.
      return res.json({ stored: false });
    }

    try {
      const lead = recordLead({
        source,
        sourceLabel: typeof sourceLabel === "string" ? sourceLabel : source,
        answers,
      });
      res.json({ stored: Boolean(lead) });
    } catch (error) {
      console.error("Error storing lead:", error);
      res.json({ stored: false });
    }
  });

  /**
   * Everyone who has enquired, each marked paid or not.
   *
   * Matching is by email, which is the only identifier both systems share.
   * That means someone who registers with one address and pays with another
   * shows as unpaid — stated on the page, because a follow-up list that is
   * quietly wrong is worse than one with a known caveat.
   */
  router.get("/admin/leads", requireAdmin, async (_req, res) => {
    const leads = listLeads();

    let paid: Set<string> | null = null;
    try {
      paid = await paidEmails();
    } catch (error) {
      console.error("Could not load payments while building the lead list:", error);
    }

    const rows = leads.map((lead) => ({
      ...lead,
      // null means "we could not check", which the UI must not render as
      // "has not paid".
      hasPaid: paid ? paid.has(lead.email.toLowerCase()) : null,
    }));

    res.json({
      writable: isWritable(),
      paymentsConnected: paid !== null,
      counts: {
        total: rows.length,
        awaitingPayment: paid ? rows.filter((r) => r.hasPaid === false).length : 0,
        converted: paid ? rows.filter((r) => r.hasPaid === true).length : 0,
      },
      leads: rows,
    });
  });

  return router;
}
