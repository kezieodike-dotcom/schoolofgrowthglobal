import { Router } from "express";
import crypto from "crypto";
import {
  openThread,
  getThread,
  appendMessage,
  markRead,
  listThreads,
  listThreadsForMentor,
  isWritable,
} from "./messageStore.js";
import { slugify } from "../lib/content.js";
import { isContentWritable, listContent, upsertContent } from "./contentStore.js";
import { sanitizeBook } from "./contentRoutes.js";
import { issueMentorToken, verifyMentorToken, verifyMentorshipPurchase, issueStudentConversationToken,
  authorizedConversation, MentorApiError } from './mentorAccess.js';
import { createMentorMediaRouter } from './mentorMediaRoutes.js';
import { createMentorCallRouter } from './mentorCallRoutes.js';
export { issueMentorToken } from './mentorAccess.js';

// Paid student conversation tokens and scoped mentor sessions authorize both chat and media.

const MAX_BODY = 4000;

const mentorPassword = () => process.env.MENTOR_INBOX_PASSWORD;

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

  const unavailable = (res: any, error?: unknown) =>
    res.status(error instanceof MentorApiError ? error.status : 503).json({
      error: error instanceof MentorApiError ? error.message :
        "Messaging is temporarily unavailable. Please try again shortly.",
    });

  router.use(['/messages', '/mentor-inbox'], (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

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
    if (typeof mentorId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(mentorId.trim())) {
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

  // Local preview only. Production and deployed environments always use the
  // password-protected mentor sign-in above.
  router.post("/mentor-inbox/demo", (req, res) => {
    if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
      return res.status(404).json({ error: "Not found." });
    }

    const mentorId = typeof req.body?.mentorId === "string" ? req.body.mentorId.trim() : "";
    if (!/^[a-z0-9-]{1,80}$/.test(mentorId)) {
      return res.status(400).json({ error: "A valid mentor is required." });
    }

    res.json(issueMentorToken(mentorId));
  });

  // ── Student ────────────────────────────────────────────────────────

  /**
   * Opens (or reopens) a thread with a mentor.
   *
   * Verify paid mentorship before issuing a token bound to this conversation.
   */
  router.post("/messages/thread", async (req, res) => {
    const { email, name, mentorId, reference } = req.body ?? {};

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required." });
    }
    if (typeof mentorId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(mentorId.trim())) {
      return res.status(400).json({ error: "A mentor is required." });
    }
    if (typeof reference !== "string" || reference.trim().length < 6) {
      return res
        .status(403)
        .json({ error: "A valid enrolment reference is required to message a mentor." });
    }
    if (!isWritable()) return unavailable(res);

    try {
      const access = await verifyMentorshipPurchase(reference.trim(), email, mentorId.trim());
      const thread = await openThread({
        studentEmail: email,
        studentName: typeof name === "string" ? name : "",
        mentorId: mentorId.trim(),
      });
      await markRead(thread.id, "student");
      const accessToken = issueStudentConversationToken({ threadId: thread.id, email, mentorId: thread.mentorId,
        expiresAt: Date.parse(access.expiresAt) });
      res.json({ thread: await getThread(thread.id), accessToken });
    } catch (error) {
      if (!(error instanceof MentorApiError)) console.error("Could not open mentor conversation:", error);
      unavailable(res, error);
    }
  });

  /** Student reads require a signed paid-mentorship conversation token. */
  router.get("/messages/:threadId", async (req, res) => {
    try {
      const { thread } = await authorizedConversation(req, 'student');
      await markRead(thread.id, "student");
      res.json({ thread: await getThread(thread.id) });
    } catch (error) {
      if (!(error instanceof MentorApiError)) console.error("Could not load mentor conversation:", error);
      unavailable(res, error);
    }
  });

  /** Sends a message as the student. */
  router.post("/messages/:threadId", async (req, res) => {
    const body = String(req.body?.body ?? "").trim();
    if (!body) return res.status(400).json({ error: "Write a message first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That message is too long." });
    }
    if (!isWritable()) return unavailable(res);

    try {
      await authorizedConversation(req, 'student');
      const thread = await appendMessage(req.params.threadId, "student", body);
      if (!thread) return res.status(404).json({ error: "No such conversation." });
      res.json({ thread });
    } catch (error) {
      if (!(error instanceof MentorApiError)) console.error("Could not send mentor message:", error);
      unavailable(res, error);
    }
  });

  // ── Admin, standing in for the mentor ──────────────────────────────

  router.get("/mentor-inbox/:mentorId/threads", async (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;

    try {
      const threads = await listThreadsForMentor(mentorId);
      res.json({
        writable: isWritable(),
        awaitingReply: threads.filter((thread) => thread.messages.some((message) => message.from === 'student' && !message.readAt)).length,
        threads,
      });
    } catch (error) {
      console.error("Could not load mentor inbox:", error);
      unavailable(res);
    }
  });

  router.get("/mentor-inbox/:mentorId/books", async (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;

    try {
      const records = (await listContent("book")).filter(
        (record) => (record.payload as any).ownerId === mentorId
      );
      res.json({ writable: isContentWritable(), records });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : "Could not load mentor books.",
      });
    }
  });

  router.post("/mentor-inbox/:mentorId/books", async (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;
    if (!isContentWritable()) {
      return res.status(503).json({
        error: "Book publishing needs writable content storage.",
      });
    }

    try {
      const raw = req.body?.item ?? {};
      const title = String(raw.title ?? "").trim();
      const book = sanitizeBook({
        ...raw,
        id: String(raw.id ?? "").trim() || `${mentorId}-${slugify(title)}`,
        ownerId: mentorId,
        ownerType: "Mentor",
      });
      const record = await upsertContent("book", book, false);
      res.json({ record });
    } catch (err) {
      res.status(400).json({
        error: err instanceof Error ? err.message : "Could not submit that book.",
      });
    }
  });

  router.get("/mentor-inbox/:mentorId/threads/:threadId", async (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;

    try {
      const thread = await getThread(req.params.threadId);
      if (!thread || thread.mentorId !== mentorId) {
        return res.status(404).json({ error: "No such conversation." });
      }
      await markRead(thread.id, "mentor");
      res.json({ thread: await getThread(thread.id) });
    } catch (error) {
      console.error("Could not open mentor conversation:", error);
      unavailable(res);
    }
  });

  router.post("/mentor-inbox/:mentorId/threads/:threadId/reply", async (req, res) => {
    const mentorId = req.params.mentorId?.trim();
    const body = String(req.body?.body ?? "").trim();

    if (!mentorId) return res.status(400).json({ error: "A mentor is required." });
    if (!requireMentor(req, res, mentorId)) return;
    if (!body) return res.status(400).json({ error: "Write a reply first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That reply is too long." });
    }
    if (!isWritable()) return unavailable(res);

    try {
      const existing = await getThread(req.params.threadId);
      if (!existing || existing.mentorId !== mentorId) return res.status(404).json({ error: "No such conversation." });
      const thread = await appendMessage(req.params.threadId, "mentor", body);
      if (!thread) return res.status(404).json({ error: "No such conversation." });
      await markRead(thread.id, "mentor");
      res.json({ thread: await getThread(thread.id) });
    } catch (error) {
      console.error("Could not send mentor reply:", error);
      unavailable(res);
    }
  });

  router.get("/admin/threads", requireAdmin, async (_req, res) => {
    try {
      const threads = await listThreads();
      res.json({
        writable: isWritable(),
        awaitingReply: threads.filter((thread) => thread.messages.some((message) => message.from === 'student' && !message.readAt)).length,
        threads,
      });
    } catch (error) {
      console.error("Could not load message administration:", error);
      unavailable(res);
    }
  });

  router.post("/admin/threads/:threadId/reply", requireAdmin, async (req, res) => {
    const body = String(req.body?.body ?? "").trim();
    if (!body) return res.status(400).json({ error: "Write a reply first." });
    if (body.length > MAX_BODY) {
      return res.status(400).json({ error: "That reply is too long." });
    }
    if (!isWritable()) return unavailable(res);

    try {
      const thread = await appendMessage(req.params.threadId, "mentor", body);
      if (!thread) return res.status(404).json({ error: "No such conversation." });
      await markRead(thread.id, "mentor");
      res.json({ thread: await getThread(thread.id) });
    } catch (error) {
      console.error("Could not send admin reply:", error);
      unavailable(res);
    }
  });

  router.use(createMentorMediaRouter());
  router.use(createMentorCallRouter());
  return router;
}
