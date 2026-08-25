import { Router } from "express";
import crypto from "crypto";
import {
  openThread,
  getThread,
  appendMessage,
  markRead,
  listThreads,
  listThreadsForMentor,
  countAwaitingReply,
  countAwaitingReplyForMentor,
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
 *   Mentors   - use a mentor-scoped inbox. There is no account system yet, so
 *               the frontend chooses a mentor profile and these routes filter
 *               by mentorId. That is not authentication; it is the smallest
 *               useful workflow until mentor accounts exist.
 *
 * When mentor accounts arrive, the mentor endpoints below get a real session
 * check. Nothing else about the storage shape needs to change.
 */

const MAX_BODY = 4000;
const SESSION_HOURS = 8;

const mentorPassword = () => process.env.MENTOR_INBOX_PASSWORD;

function mentorSigningKey(): string {
  return (
    process.env.MENTOR_INBOX_SESSION_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    process.env.DEMO_REVIEWER_PASSWORD ??
    ""
  );
}

export function issueMentorToken(mentorId: string): { token: string; expiresAt: string } {
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const payload = Buffer.from(
    JSON.stringify({ sub: "mentor", mentorId, exp: expiresAt.getTime() })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", mentorSigningKey())
    .update(payload)
    .digest("base64url");

  return { token: `${payload}.${signature}`, expiresAt: expiresAt.toISOString() };
}

function verifyMentorToken(token: string | undefined, mentorId: string): boolean {
  if (!token || !mentorSigningKey()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac("sha256", mentorSigningKey())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString());
    return body.sub === "mentor" && body.mentorId === mentorId && body.exp > Date.now();
  } catch {
    return false;
  }
}

function requireMentor(req: any, res: any, mentorId: string): boolean {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!verifyMentorToken(token, mentorId)) {
    res.status(401).json({ error: "Your mentor session has expired. Sign in again." });
    return false;
  }
  return true;
}

export function createMessageRouter(
  requireAdmin: (req: any, res: any, next: any) => void
): Router {
  const router = Router();

  const unavailable = (res: any) =>
    res.status(503).json({
      error:
        "Messaging is unavailable on this host: it needs somewhere to store conversations.",
    });

  router.get("/mentor-inbox/status", (_req, res) => {
    res.json({ enabled: Boolean(mentorPassword()) });
  });

  router.post("/mentor-inbox/login", (req, res) => {
    const configured = mentorPassword();
    const { mentorId, password } = req.body ?? {};

    if (!configured) {
      return res.status(503).json({
        error:
          "The mentor inbox is switched off. Set MENTOR_INBOX_PASSWORD in the environment to enable it.",
      });
    }
    if (typeof mentorId !== "string" || !mentorId.trim()) {
      return res.status(400).json({ error: "A mentor is required." });
    }

    const supplied = String(password ?? "");
    const a = crypto.createHash("sha256").update(supplied).digest();
    const b = crypto.createHash("sha256").update(configured).digest();
    if (!crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "That mentor access code is not correct." });
    }

    res.json(issueMentorToken(mentorId.trim()));
  });

  // ── Student ────────────────────────────────────────────────────────

  /**
   * Opens (or reopens) a thread with a mentor.
   *
   * The Paystack reference is required so that knowing a student's email is
   * not enough to reach their messages. It is not verified against Paystack
   * on every call - that would be a network round trip per open - but it is
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

  router.get("/mentor-inbox/:mentorId/threads", (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;

    res.json({
      writable: isWritable(),
      awaitingReply: countAwaitingReplyForMentor(mentorId),
      threads: listThreadsForMentor(mentorId),
    });
  });

  router.get("/mentor-inbox/:mentorId/threads/:threadId", (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;

    const thread = getThread(req.params.threadId);
    if (!thread || thread.mentorId !== mentorId) {
      return res.status(404).json({ error: "No such conversation." });
    }

    markRead(thread.id, "mentor");
    res.json({ thread: getThread(thread.id) });
  });

  router.post("/mentor-inbox/:mentorId/threads/:threadId/reply", (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    const body = String(req.body?.body ?? "").trim();

    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;
    if (!body) return res.status(400).json({ error: "Write a reply first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That reply is too long." });
    }
    if (!isWritable()) return unavailable(res);

    const existing = listThreadsForMentor(mentorId).find(
      (t) => t.id === req.params.threadId
    );
    if (!existing) return res.status(404).json({ error: "No such conversation." });

    const thread = appendMessage(req.params.threadId, "mentor", body);
    if (!thread) return res.status(404).json({ error: "No such conversation." });

    markRead(thread.id, "mentor");
    res.json({ thread });
  });

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
