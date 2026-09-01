import { Router, type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { PLANS, isPlanCode, type PlanCode } from "../lib/pricing.js";
import { calculateBookRevenueSplit } from "../lib/bookRevenue.js";

/**
 * The admin API.
 *
 * Everything here reads from Paystack, which is the actual system of record
 * for enrolments: a payment is what enrols someone, and Paystack holds every
 * payment. There is no database in this project, so rather than invent a
 * second source of truth that would immediately disagree with the first, the
 * admin panel reports what Paystack knows.
 *
 * That makes the dashboard genuinely live, and it makes its limits precise:
 * anything Paystack does not record - course content, mentor applications,
 * event listings - is read-only here until a datastore exists. The panel says
 * so on the relevant screens instead of offering buttons that do nothing.
 *
 * Auth is a single shared password because there is one operator and no user
 * table. It is a real check, not a decorative one: verified server-side in
 * constant time, exchanged for a signed expiring token, and rate limited.
 */

const PAYSTACK_API = "https://api.paystack.co";

const adminPassword = () => process.env.ADMIN_PASSWORD;
const secretKey = () => process.env.PAYSTACK_SECRET_KEY;

/**
 * Key used to sign session tokens.
 *
 * Falls back to deriving from the password so the panel works with one env
 * var set. The derivation is deliberate rather than lazy: changing
 * ADMIN_PASSWORD then changes the signing key too, which invalidates every
 * outstanding session. Rotating the password logs everyone out, which is the
 * behaviour you want from a password rotation.
 */
function signingKey(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  return crypto
    .createHash("sha256")
    .update(`sog-admin-session:${adminPassword() ?? ""}`)
    .digest("hex");
}

const SESSION_HOURS = 8;

// ── Session tokens ───────────────────────────────────────────────────────
// A minimal signed token: base64url(payload).hmac. Not a JWT - there are no
// third parties to interoperate with, and a smaller surface is easier to be
// confident about than a hand-rolled subset of a spec.

const b64url = (buf: Buffer) => buf.toString("base64url");

function issueToken(): { token: string; expiresAt: string } {
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const payload = b64url(
    Buffer.from(JSON.stringify({ sub: "admin", exp: expiresAt.getTime() }))
  );
  const signature = crypto
    .createHmac("sha256", signingKey())
    .update(payload)
    .digest("base64url");
  return { token: `${payload}.${signature}`, expiresAt: expiresAt.toISOString() };
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac("sha256", signingKey())
    .update(payload)
    .digest("base64url");

  // Constant-time compare, so a forged signature cannot be refined by
  // measuring how long the rejection took.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

// ── Login rate limiting ──────────────────────────────────────────────────
// In-memory, so it resets when a serverless instance recycles. That is a real
// limitation and not a substitute for a strong password - it exists to make
// casual guessing impractical, and it is documented rather than overstated.

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

// ── Paystack ─────────────────────────────────────────────────────────────

interface PaystackTransaction {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  channel: string | null;
  customer?: { email?: string };
  metadata?: {
    plan?: string;
    name?: string;
    mentorId?: string;
    itemKind?: string;
    bookId?: string;
    bookTitle?: string;
    bookOwnerName?: string;
    bookOwnerEmail?: string;
  } | null;
}

async function paystack<T>(path: string): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const body = (await res.json().catch(() => null)) as
    | { status?: boolean; message?: string; data?: T }
    | null;
  if (!res.ok || !body?.status) {
    throw new Error(
      `Paystack ${path} failed (${res.status}): ${body?.message ?? "no message"}`
    );
  }
  return body.data as T;
}

/**
 * Flattens a Paystack transaction into the shape the admin UI renders.
 *
 * `plan` is whatever we wrote into metadata at checkout. It is validated
 * rather than trusted, because a payment could have been created by hand in
 * the Paystack dashboard and carry no plan at all.
 */
function toEnrolment(tx: PaystackTransaction) {
  const plan: PlanCode | null = isPlanCode(tx.metadata?.plan)
    ? tx.metadata.plan
    : null;
  const isBook = tx.metadata?.itemKind === "book";
  const split = isBook ? calculateBookRevenueSplit(tx.amount) : null;
  return {
    id: tx.id,
    reference: tx.reference,
    email: tx.customer?.email ?? "",
    name: tx.metadata?.name ?? "",
    plan,
    planName: isBook ? tx.metadata?.bookTitle ?? tx.metadata?.bookId ?? "Book purchase" : plan ? PLANS[plan].name : "Unknown",
    kind: isBook ? "book" : plan ? PLANS[plan].kind : null,
    amountKobo: tx.amount,
    currency: tx.currency,
    status: tx.status,
    channel: tx.channel,
    paidAt: tx.paid_at,
    createdAt: tx.created_at,
    mentorId: tx.metadata?.mentorId ?? null,
    bookId: tx.metadata?.bookId ?? null,
    bookOwnerName: tx.metadata?.bookOwnerName ?? null,
    bookOwnerEmail: tx.metadata?.bookOwnerEmail ?? null,
    companyShareKobo: split?.companyShareKobo ?? null,
    ownerShareKobo: split?.ownerShareKobo ?? null,
  };
}

export type Enrolment = ReturnType<typeof toEnrolment>;

/**
 * How many transactions the dashboard aggregates over.
 *
 * Paystack pages at 100. Five pages keeps the overview responsive while
 * covering far more than this school will take in its first year; past that,
 * totals would need Paystack's own aggregate endpoints or a local mirror. The
 * response reports whether the cap was hit so the UI can say so rather than
 * quietly presenting a partial figure as complete.
 */
const MAX_PAGES = 5;
const PER_PAGE = 100;

async function fetchTransactions(status?: string) {
  const rows: PaystackTransaction[] = [];
  let truncated = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = new URLSearchParams({
      perPage: String(PER_PAGE),
      page: String(page),
    });
    if (status) query.set("status", status);

    const batch = await paystack<PaystackTransaction[]>(`/transaction?${query}`);
    rows.push(...batch);

    if (batch.length < PER_PAGE) break;
    if (page === MAX_PAGES) truncated = true;
  }

  return { rows, truncated };
}

const NOT_CONFIGURED =
  "Paystack is not connected yet, so there are no payments to show. Add PAYSTACK_SECRET_KEY to see live enrolments here.";

/**
 * Guards every authenticated admin endpoint.
 *
 * Exported so the mentor routes reuse this exact function rather than
 * reimplementing the check - one definition of "is this a valid admin
 * session" means a fix to it cannot miss a route.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
  next();
}

export function createAdminRouter(): Router {
  const router = Router();

  /** Whether the panel can be used at all. Called before the login screen. */
  router.get("/admin/status", (_req, res) => {
    res.json({
      enabled: Boolean(adminPassword()),
      paystackConnected: Boolean(secretKey()),
    });
  });

  router.post("/admin/login", (req, res) => {
    const configured = adminPassword();
    if (!configured) {
      // No default password, ever. An admin panel that unlocks with a value
      // shipped in the repo is worse than no admin panel.
      return res.status(503).json({
        error:
          "The admin panel is switched off. Set ADMIN_PASSWORD in the environment to enable it.",
      });
    }

    const ip = req.ip ?? "unknown";
    if (rateLimited(ip)) {
      return res
        .status(429)
        .json({ error: "Too many attempts. Try again in fifteen minutes." });
    }

    const supplied = String(req.body?.password ?? "");
    // Hashed before comparing so both buffers are the same length whatever
    // was typed - timingSafeEqual throws on a length mismatch, and the
    // mismatch itself would leak the password's length.
    const a = crypto.createHash("sha256").update(supplied).digest();
    const b = crypto.createHash("sha256").update(configured).digest();

    if (!crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "That password is not correct." });
    }

    attempts.delete(ip);
    res.json(issueToken());
  });

  /** Confirms a stored token is still good, so the UI can skip the login screen. */
  router.get("/admin/session", requireAdmin, (_req, res) => {
    res.json({ valid: true });
  });

  /**
   * Headline numbers plus the breakdown behind them, in one call so the
   * dashboard renders in a single round trip rather than six.
   */
  router.get("/admin/overview", requireAdmin, async (_req, res) => {
    if (!secretKey()) {
      return res.json({ connected: false, message: NOT_CONFIGURED });
    }

    try {
      const { rows, truncated } = await fetchTransactions();
      const all = rows.map(toEnrolment);
      const paid = all.filter((e) => e.status === "success");

      const revenueKobo = paid.reduce((sum, e) => sum + e.amountKobo, 0);

      // Per-plan counts and revenue, seeded with every plan so a package that
      // has never sold still appears - a zero is information, a missing row
      // looks like a bug.
      const byPlan = Object.values(PLANS).map((plan) => {
        const sold = paid.filter((e) => e.plan === plan.code);
        return {
          code: plan.code,
          name: plan.name,
          kind: plan.kind,
          priceKobo: plan.amountKobo,
          count: sold.length,
          revenueKobo: sold.reduce((sum, e) => sum + e.amountKobo, 0),
        };
      });

      const since = (days: number) => {
        const cutoff = Date.now() - days * 86_400_000;
        return paid.filter((e) => new Date(e.paidAt ?? e.createdAt).getTime() > cutoff);
      };

      const last30 = since(30);

      res.json({
        connected: true,
        truncated,
        totals: {
          revenueKobo,
          enrolments: paid.length,
          students: new Set(paid.map((e) => e.email.toLowerCase())).size,
          attempted: all.length,
          // Of everyone who reached Paystack's checkout, how many paid. The
          // single most actionable number on the page.
          conversionRate: all.length
            ? Math.round((paid.length / all.length) * 100)
            : 0,
        },
        last30Days: {
          revenueKobo: last30.reduce((sum, e) => sum + e.amountKobo, 0),
          enrolments: last30.length,
        },
        last7Days: {
          revenueKobo: since(7).reduce((sum, e) => sum + e.amountKobo, 0),
          enrolments: since(7).length,
        },
        byPlan,
        // Daily revenue for the sparkline, oldest first, gaps filled with zero
        // so the chart's x-axis is time rather than "days that had a sale".
        daily: buildDailySeries(paid, 30),
        recent: paid
          .slice()
          .sort(
            (a, b) =>
              new Date(b.paidAt ?? b.createdAt).getTime() -
              new Date(a.paidAt ?? a.createdAt).getTime()
          )
          .slice(0, 8),
      });
    } catch (error) {
      console.error("Error in /api/admin/overview:", error);
      res.status(502).json({ error: "Could not load data from Paystack." });
    }
  });

  /** The full enrolment list, for the table with search, filters and export. */
  router.get("/admin/enrolments", requireAdmin, async (req, res) => {
    if (!secretKey()) {
      return res.json({ connected: false, message: NOT_CONFIGURED, enrolments: [] });
    }

    try {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const { rows, truncated } = await fetchTransactions(
        status && status !== "all" ? status : undefined
      );

      const enrolments = rows
        .map(toEnrolment)
        .sort(
          (a, b) =>
            new Date(b.paidAt ?? b.createdAt).getTime() -
            new Date(a.paidAt ?? a.createdAt).getTime()
        );

      res.json({ connected: true, truncated, enrolments });
    } catch (error) {
      console.error("Error in /api/admin/enrolments:", error);
      res.status(502).json({ error: "Could not load data from Paystack." });
    }
  });

  /**
   * Which integrations are live.
   *
   * Reports presence, never values - a panel that prints an API key to the
   * browser has handed it to anyone who gets a session.
   */
  router.get("/admin/integrations", requireAdmin, (_req, res) => {
    const present = (name: string) => Boolean(process.env[name]);
    res.json({
      integrations: [
        {
          key: "paystack",
          name: "Paystack",
          purpose: "Collects tuition and mentorship payments",
          configured: present("PAYSTACK_SECRET_KEY"),
          detail: present("PAYSTACK_SECRET_KEY")
            ? secretKey()!.startsWith("sk_live")
              ? "Live keys - taking real payments"
              : "Test keys - no real money moves"
            : "Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY",
          required: true,
        },
        {
          key: "webhook",
          name: "Paystack webhook",
          purpose: "Records payments when a student closes the tab mid-redirect",
          configured: present("PAYSTACK_SECRET_KEY"),
          detail: "Point the dashboard webhook at /api/payments/webhook",
          required: true,
        },
        {
          key: "gemini",
          name: "Growth AI (Gemini)",
          purpose: "Powers the AI coach, scenario drills and strategy review",
          configured: present("GEMINI_API_KEY"),
          detail: present("GEMINI_API_KEY")
            ? `Model: ${process.env.GEMINI_MODEL || "gemini-3.1-flash-lite"}`
            : "Without a key the AI answers in simulation mode",
          required: false,
        },
        {
          key: "forms",
          name: "Form delivery (Web3Forms)",
          purpose: "Emails registrations, mentor applications and enquiries",
          configured: present("VITE_WEB3FORMS_ACCESS_KEY"),
          detail: present("VITE_WEB3FORMS_ACCESS_KEY")
            ? "Submissions are emailed to the registered address"
            : "Without a key, form submissions are not delivered anywhere",
          required: true,
        },
        {
          key: "admin",
          name: "Admin access",
          purpose: "Protects this panel",
          configured: true,
          detail: present("ADMIN_SESSION_SECRET")
            ? "Password set, sessions signed with a dedicated secret"
            : "Password set. Sessions signed with a key derived from it, so changing the password signs everyone out.",
          required: true,
        },
      ],
    });
  });

  return router;
}

/** Revenue per day for the last `days`, oldest first, zero-filled. */
function buildDailySeries(paid: Enrolment[], days: number) {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(day, 0);
  }
  for (const e of paid) {
    const day = new Date(e.paidAt ?? e.createdAt).toISOString().slice(0, 10);
    if (buckets.has(day)) buckets.set(day, buckets.get(day)! + e.amountKobo);
  }
  return Array.from(buckets, ([date, revenueKobo]) => ({ date, revenueKobo }));
}
