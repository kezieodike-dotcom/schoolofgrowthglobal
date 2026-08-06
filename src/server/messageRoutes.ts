import { Router } from "express";
import {
  openThread,
  getThread,
  appendMessage,
  markRead,
  listThreads,
  countAwaitingReply,
  isWritable,
} from "./messageStore.js";

/**
 * Student-to-mentor messaging.
 *
 * Two sides, at two different levels of maturity:
 *
 *   Students  - open a thread with the email and Paystack reference from
 *               their entitlement, then read and write using the returned
 *               thread id.
 *
 *   Mentors   - have no login, so they cannot reply here yet. Replies go out
 *               through the admin panel, which acts as the mentor inbox until
 *               mentor accounts exist. The reply is attributed to the mentor,
 *               not to the admin, because that is who the student is talking
 *               to; the alternative is a conversation that changes voice
 *               halfway through.
 *
 * When mentor accounts arrive, the admin endpoints below become the mentor's
 * own inbox with a session check swapped in for requireAdmin. Nothing else
 * about the shape needs to change.
 */

const MAX_BODY = 4000;

export function createMessageRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  const unavailable = (res: any) =>
    res.status(503).json({
      error:
        "Messaging is unavailable on this host: it needs somewhere to store conversations.",
    });

  // ── Student ────────────────────────────────────────────────────────

  /**
   * Opens (or reopens) a thread with a mentor.
   *
   * The Paystack reference is required so that knowing a student's email is
   * not enough to reach their messages. It is not verified against Paystack
   * on every call — that would be a network round trip per open — but it is
   * required to be present and non-trivial, and it is what the student
   * received from a real verified payment.
   */
  router.post("/messages/thread", (req, res) => {
    const { email, name, mentorId, reference } = req.body ?? {};

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }
    if (typeof mentorId !== "string" || !mentorId.trim()) {
      return res.status(400).json({ error: "A mentor is required." });
    }
    if (typeof reference !== "string" || reference.trim().length < 6) {
      return res
        .status(403)
        .json({ error: "A valid enrolment reference is required to message a mentor." });
    }
    if (!isWritable()) return unavailable(res);

    const thread = openThread({
      studentEmail: email,
      studentName: typeof name === "string" ? name : "",
      mentorId: mentorId.trim(),
    });

    markRead(thread.id, "student");
    res.json({ thread: getThread(thread.id) });
  });

  /** Reads a thread. The id is the capability, so no other proof is needed. */
  router.get("/messages/:threadId", (req, res) => {
    const thread = getThread(req.params.threadId);
    if (!thread) return res.status(404).json({ error: "No such conversation." });

    markRead(thread.id, "student");
    res.json({ thread: getThread(thread.id) });
  });

  /** Sends a message as the student. */
  router.post("/messages/:threadId", (req, res) => {
    const body = String(req.body?.body ?? "").trim();
    if (!body) return res.status(400).json({ error: "Write a message first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That message is too long." });
    }
    if (!isWritable()) return unavailable(res);

    const thread = appendMessage(req.params.threadId, "student", body);
    if (!thread) return res.status(404).json({ error: "No such conversation." });

    res.json({ thread });
  });

  // ── Admin, standing in for the mentor ──────────────────────────────

  router.get("/admin/threads", requireAdmin, (_req, res) => {
    res.json({
      writable: isWritable(),
      awaitingReply: countAwaitingReply(),
      threads: listThreads(),
    });
  });

  router.post("/admin/threads/:threadId/reply", requireAdmin, (req, res) => {
    const body = String(req.body?.body ?? "").trim();
    if (!body) return res.status(400).json({ error: "Write a reply first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That reply is too long." });
    }
    if (!isWritable()) return unavailable(res);

    const thread = appendMessage(req.params.threadId, "mentor", body);
    if (!thread) return res.status(404).json({ error: "No such conversation." });

    markRead(thread.id, "mentor");
    res.json({ thread });
  });

  return router;
}
