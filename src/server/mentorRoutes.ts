import { Router } from "express";
import {
  createApplication,
  listApplications,
  listApproved,
  decideApplication,
  reopenApplication,
  countsByStatus,
  isWritable,
  type MentorStatus,
} from "./mentorStore.js";

/**
 * Mentor applications: submission, review, and the public approved list.
 *
 * The public site posts an application here as well as emailing it. The email
 * is the notification; this is the record. Without a record there is nothing
 * for an admin to admit or reject, and approving a mentor by replying to an
 * email leaves no state anyone else can see.
 *
 * Admin endpoints live under /admin/mentors and are protected by the same
 * requireAdmin guard as the rest of the panel — passed in rather than
 * redefined, so there is exactly one implementation of "is this a valid
 * admin session" in the codebase.
 */

const MAX_FIELD_LENGTH = 2000;
const MAX_FIELDS = 40;

/**
 * Accepts the wizard's answers, rejecting anything that does not look like a
 * form submission.
 *
 * This is an unauthenticated write to disk, so it is bounded on every axis:
 * field count, key length and value length. Without those, one request could
 * grow the store until the volume fills.
 */
function sanitiseAnswers(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;

  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length === 0 || entries.length > MAX_FIELDS) return null;

  const clean: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (typeof key !== "string" || key.length > 120) return null;
    if (typeof value !== "string") continue;
    clean[key] = value.slice(0, MAX_FIELD_LENGTH);
  }
  return clean;
}

export function createMentorRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  // ── Public ─────────────────────────────────────────────────────────

  /**
   * Approved mentors, for the public directory. Deliberately narrow: only the
   * fields a visitor sees. Phone numbers, referral answers and decision notes
   * are in the record but must never reach the browser.
   */
  router.get("/mentors/directory", (_req, res) => {
    res.json({
      mentors: listApproved().map((m) => ({
        id: m.id,
        name: m.name,
        role: m.organization ? `${m.title}, ${m.organization}` : m.title,
        location: m.location,
        expertise: m.specialisms,
        bio: m.answers["Professional background"] ?? "",
        area: m.area,
        experience: m.experience,
      })),
    });
  });

  /** Records an application from the registration wizard. */
  router.post("/mentors/apply", (req, res) => {
    const answers = sanitiseAnswers(req.body?.answers);
    if (!answers) {
      return res.status(400).json({ error: "That does not look like an application." });
    }
    if (!answers["Full name"]?.trim() || !answers["Email address"]?.trim()) {
      return res.status(400).json({ error: "Name and email are required." });
    }

    if (!isWritable()) {
      // Answered as a soft failure on purpose. The application was still
      // emailed by the browser, so the applicant is not lost — only the
      // reviewable copy is. Failing hard here would show them an error for
      // something that did, in the way that matters, go through.
      console.error(
        "Mentor application could not be stored: the data directory is not writable. " +
          "The application was still emailed. See src/server/mentorStore.ts."
      );
      return res.json({ stored: false });
    }

    try {
      const application = createApplication({ answers });
      res.json({ stored: true, id: application.id });
    } catch (error) {
      console.error("Error storing mentor application:", error);
      res.json({ stored: false });
    }
  });

  // ── Admin ──────────────────────────────────────────────────────────

  router.get("/admin/mentors", requireAdmin, (req, res) => {
    const status = req.query.status;
    const filter =
      status === "pending" || status === "approved" || status === "rejected"
        ? (status as MentorStatus)
        : undefined;

    res.json({
      // The panel needs to know whether its own buttons will work before it
      // renders them, not after someone clicks one.
      writable: isWritable(),
      counts: countsByStatus(),
      applications: listApplications(filter),
    });
  });

  router.post("/admin/mentors/:id/decision", requireAdmin, (req, res) => {
    const { decision, note } = req.body ?? {};

    if (decision !== "approved" && decision !== "rejected" && decision !== "pending") {
      return res.status(400).json({ error: "Unknown decision." });
    }
    if (!isWritable()) {
      return res.status(503).json({
        error:
          "Decisions cannot be saved on this host: the data directory is read-only. See the note on this page.",
      });
    }

    const updated =
      decision === "pending"
        ? reopenApplication(req.params.id)
        : decideApplication(req.params.id, decision, typeof note === "string" ? note : undefined);

    if (!updated) {
      return res.status(404).json({ error: "That application no longer exists." });
    }

    res.json({ application: updated });
  });

  return router;
}
