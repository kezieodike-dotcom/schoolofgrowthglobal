import express, { Router, type Request } from "express";
import crypto from "crypto";
import {
  PLANS,
  isPlanCode,
  entitlementFor,
  formatNaira,
  CURRENCY,
  type Entitlement,
} from "../lib/pricing.js";
import { BOOKS } from "../data/mockData.js";
import { calculateBookRevenueSplit, type BookPurchase } from "../lib/bookRevenue.js";
import { isPaystackConfigured, paystackPublicKey, paystackSecretKey } from "./paystackEnv.js";
import {
  findDonationFund,
  isDonationFundId,
  minimumDonationKobo,
  parseDonationAmount,
  type DonationPayment,
} from "../lib/donations.js";
import { mergeContent } from "../lib/content.js";
import { listContent } from "./contentStore.js";
import type { BookItem } from "../types.js";

/**
 * Paystack checkout for course packages and mentorship subscriptions.
 *
 * Mounted by both entry points, exactly like the AI routes:
 *   server.ts     - local development
 *   api/index.ts  - Vercel serverless
 *
 * Two rules shape this file.
 *
 * 1. The browser never names a price. It sends a plan code ("maxi"); the
 *    amount is read from the shared catalogue here. A request body carrying
 *    `amount` is ignored, so tampering with it in dev tools changes nothing.
 *
 * 2. A payment is only real once Paystack says so on OUR call to them. The
 *    browser coming back from checkout with "?status=success" proves nothing
 *    - that URL can be typed. /verify re-asks Paystack directly and also
 *    re-checks the amount, because a transaction can succeed for the wrong
 *    sum if the initialize call was ever replayed with different values.
 *
 * PAYSTACK_SECRET_KEY is a real secret, unlike the Web3Forms key: it can move
 * money. It is read from the environment at request time and never sent to
 * the browser. The public key is exposed via /config for Paystack's inline
 * widget, which is what it is designed for.
 */

const PAYSTACK_API = "https://api.paystack.co";

/**
 * Where Paystack sends the payer after checkout. Must be an absolute URL, and
 * must match the deployed origin or the student lands on localhost from a
 * production payment.
 */
function callbackUrl(req: Request): string {
  const configured = process.env.PAYSTACK_CALLBACK_URL || process.env.APP_URL;
  const base =
    configured && /^https?:\/\//.test(configured)
      ? configured.replace(/\/+$/, "")
      : `${req.protocol}://${req.get("host")}`;
  return `${base}/payment/callback`;
}

/**
 * Captures the unparsed request body so the webhook can verify Paystack's
 * signature. express.json() consumes the stream, so by the time a route runs
 * the original bytes are gone - and the signature is over those exact bytes,
 * not over a re-serialised copy of the parsed object (key order and spacing
 * would differ and every signature would fail).
 *
 * Both entry points must pass this to express.json():
 *   app.use(express.json({ verify: captureRawBody }))
 */
export function captureRawBody(
  req: Request & { rawBody?: Buffer },
  _res: express.Response,
  buf: Buffer
) {
  req.rawBody = buf;
}

/** Shape of the bits of Paystack's transaction object we rely on. */
interface PaystackTransaction {
  status: string;
  amount: number;
  currency: string;
  reference: string;
  customer?: { email?: string };
  metadata?: {
    plan?: string;
    itemKind?: string;
    bookId?: string;
    bookTitle?: string;
    donationFund?: string;
    donationFundName?: string;
    donorNote?: string;
    name?: string;
    phone?: string;
    mentorId?: string;
  } | null;
}

/**
 * Calls Paystack and returns the parsed body, or throws with a message safe
 * to log. Paystack answers 4xx with a JSON `message`, which is far more
 * useful than the status code alone when a key is wrong or a plan is unknown.
 */
async function paystack<T>(
  path: string,
  init?: { method?: string; body?: unknown }
): Promise<T> {
  const res = await fetch(`${PAYSTACK_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${paystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
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

const NOT_CONFIGURED =
  "Payments are not switched on yet. Please contact infoschoolofgrowth@gmail.com to enrol.";

async function findPublishedBook(bookId: string): Promise<BookItem | null> {
  const records = await listContent("book");
  return mergeContent(BOOKS, records).find((book) => book.id === bookId) ?? null;
}

function purchaseFor(book: BookItem, tx: PaystackTransaction): BookPurchase {
  return {
    reference: tx.reference,
    email: tx.customer?.email ?? "",
    bookId: book.id,
    title: book.title,
    amountKobo: tx.amount,
    currency: tx.currency,
    ownerName: book.ownerName,
    ownerEmail: book.ownerEmail,
    ownerType: book.ownerType,
    downloadUrl: book.downloadUrl,
    split: calculateBookRevenueSplit(tx.amount),
  };
}

function donationPaymentFor(tx: PaystackTransaction): DonationPayment {
  const fund = findDonationFund(tx.metadata?.donationFund);
  return {
    reference: tx.reference,
    email: tx.customer?.email ?? "",
    name: tx.metadata?.name,
    phone: tx.metadata?.phone,
    fundId: fund.id,
    fundName: tx.metadata?.donationFundName ?? fund.name,
    amountKobo: tx.amount,
    currency: tx.currency,
    donorNote: tx.metadata?.donorNote,
  };
}

export function createPaymentRouter(): Router {
  const router = Router();

  /**
   * Lets the UI show a truthful checkout screen before any keys exist:
   * unconfigured, it renders the plan and an explanatory notice rather than a
   * pay button that would fail on click.
   */
  router.get("/payments/config", (_req, res) => {
    res.json({
      configured: isPaystackConfigured(),
      publicKey: paystackPublicKey() ?? null,
      currency: CURRENCY,
    });
  });

  /**
   * Starts a payment. Body: { plan, email, name?, phone?, referral?, mentorId? }
   * or { bookId, email, name?, phone?, referral? }
   * or { donationFund, donationAmount, email, name?, phone?, donorNote? }
   * Returns Paystack's hosted checkout URL for the browser to visit.
   */
  router.post("/payments/initialize", async (req, res) => {
    const {
      plan: planCode,
      bookId,
      donationFund,
      donationAmount,
      email,
      name,
      phone,
      referral,
      mentorId,
      donorNote,
    } = req.body ?? {};

    // Deliberately loose: full RFC-compliant validation belongs to Paystack,
    // which rejects undeliverable addresses. This only catches obvious typos
    // before we spend a network call.
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    if (!isPaystackConfigured()) {
      console.warn(
        `PAYSTACK_SECRET_KEY is not set, so this ${planCode} enrolment could not be taken.`
      );
      return res.status(503).json({ error: NOT_CONFIGURED });
    }

    try {
      const donationAmountKobo =
        donationFund || donationAmount
          ? parseDonationAmount(donationAmount)
          : null;
      const donation =
        donationFund || donationAmount
          ? findDonationFund(isDonationFundId(donationFund) ? donationFund : "where-needed")
          : null;

      if (donation && !donationAmountKobo) {
        return res.status(400).json({
          error: `Donation amount must be at least ${formatNaira(minimumDonationKobo)}.`,
        });
      }

      const book =
        typeof bookId === "string" && bookId.trim()
          ? await findPublishedBook(bookId.trim())
          : null;
      const plan = isPlanCode(planCode) ? PLANS[planCode] : null;

      if (!plan && !book && !donation) {
        return res.status(400).json({ error: bookId ? "Unknown book." : "Unknown plan." });
      }

      const amountKobo = donation ? donationAmountKobo! : book ? book.priceKobo : plan!.amountKobo;
      const title = donation ? donation.name : book ? book.title : plan!.name;

      const data = await paystack<{ authorization_url: string; reference: string }>(
        "/transaction/initialize",
        {
          method: "POST",
          body: {
            email,
            // The authoritative amount, from the catalogue - not from the body.
            amount: amountKobo,
            currency: CURRENCY,
            callback_url: callbackUrl(req),
            metadata: {
              plan: plan?.code,
              // itemKind: donation is the discriminator used by verification.
              itemKind: donation ? "donation" : book ? "book" : "plan",
              bookId: book?.id,
              bookTitle: book?.title,
              bookOwnerName: book?.ownerName,
              bookOwnerEmail: book?.ownerEmail,
              bookOwnerType: book?.ownerType,
              companyShareKobo: book ? calculateBookRevenueSplit(book.priceKobo).companyShareKobo : undefined,
              ownerShareKobo: book ? calculateBookRevenueSplit(book.priceKobo).ownerShareKobo : undefined,
              donationFund: donation?.id,
              donationFundName: donation?.name,
              donorNote: typeof donorNote === "string" ? donorNote : undefined,
              name: typeof name === "string" ? name : undefined,
              phone: typeof phone === "string" ? phone : undefined,
              referral: typeof referral === "string" ? referral : undefined,
              // Carried through so the confirmation email and the student's
              // first session can name the mentor they chose at checkout.
              mentorId: plan && typeof mentorId === "string" ? mentorId : undefined,
              custom_fields: [
                {
                  display_name: donation ? "Donation fund" : book ? "Book" : "Plan",
                  variable_name: donation ? "donation" : book ? "book" : "plan",
                  value: `${title} - ${formatNaira(amountKobo)}`,
                },
              ],
            },
          },
        }
      );

      res.json({
        authorizationUrl: data.authorization_url,
        reference: data.reference,
      });
    } catch (error) {
      console.error("Error in /api/payments/initialize:", error);
      res.status(502).json({
        error:
          "We could not reach our payment provider. Please try again in a moment.",
      });
    }
  });

  /**
   * Confirms a payment and returns the entitlement it grants.
   *
   * This is the only place access is ever granted. Called when the student
   * returns from Paystack, and safe to call repeatedly - verification is a
   * read, so a refresh re-confirms rather than double-charging.
   */
  router.get("/payments/verify/:reference", async (req, res) => {
    const { reference } = req.params;

    if (!isPaystackConfigured()) {
      return res.status(503).json({ error: NOT_CONFIGURED });
    }

    try {
      const tx = await paystack<PaystackTransaction>(
        `/transaction/verify/${encodeURIComponent(reference)}`
      );

      if (tx.status !== "success") {
        // A real, common outcome (cancelled card, insufficient funds), not an
        // error on our side - so it answers 200 with a paid:false result the
        // UI can render calmly rather than as a failure.
        return res.json({ paid: false, status: tx.status });
      }

      if (tx.metadata?.itemKind === "book") {
        const bookId = tx.metadata.bookId;
        const book = typeof bookId === "string" ? await findPublishedBook(bookId) : null;
        if (!book) {
          console.error(`Transaction ${reference} succeeded but carries no known book:`, tx.metadata);
          return res.status(422).json({
            error:
              "Your payment went through but we could not match it to a book. Please contact infoschoolofgrowth@gmail.com with your reference.",
          });
        }

        if (tx.amount !== book.priceKobo || tx.currency !== CURRENCY) {
          console.error(
            `Transaction ${reference} paid ${tx.amount} ${tx.currency}, expected ` +
              `${book.priceKobo} ${CURRENCY} for book ${book.id}.`
          );
          return res.status(422).json({
            error:
              "Your payment amount does not match this book. Please contact infoschoolofgrowth@gmail.com with your reference.",
          });
        }

        return res.json({ paid: true, purchase: purchaseFor(book, tx) });
      }

      if (tx.metadata?.itemKind === "donation") {
        if (tx.amount < minimumDonationKobo || tx.currency !== CURRENCY) {
          console.error(
            `Donation transaction ${reference} paid ${tx.amount} ${tx.currency}, ` +
              `expected at least ${minimumDonationKobo} ${CURRENCY}.`
          );
          return res.status(422).json({
            error:
              "Your donation amount could not be matched. Please contact infoschoolofgrowth@gmail.com with your reference.",
          });
        }

        return res.json({
          paid: true,
          kind: "donation-paid",
          donation: donationPaymentFor(tx),
        });
      }

      const planCode = tx.metadata?.plan;
      if (!isPlanCode(planCode)) {
        console.error(
          `Transaction ${reference} succeeded but carries no known plan:`,
          tx.metadata
        );
        return res.status(422).json({
          error:
            "Your payment went through but we could not match it to a plan. Please contact infoschoolofgrowth@gmail.com with your reference.",
        });
      }

      const plan = PLANS[planCode];

      // The charged amount is checked against the catalogue rather than
      // trusted. Without this, a transaction initialised at an old, lower
      // price would still unlock today's package.
      if (tx.amount !== plan.amountKobo || tx.currency !== CURRENCY) {
        console.error(
          `Transaction ${reference} paid ${tx.amount} ${tx.currency}, expected ` +
            `${plan.amountKobo} ${CURRENCY} for ${plan.code}.`
        );
        return res.status(422).json({
          error:
            "Your payment amount does not match this plan. Please contact infoschoolofgrowth@gmail.com with your reference.",
        });
      }

      const entitlement: Entitlement = entitlementFor(plan, {
        reference: tx.reference,
        email: tx.customer?.email ?? "",
      });

      res.json({ paid: true, entitlement });
    } catch (error) {
      console.error(`Error in /api/payments/verify/${reference}:`, error);
      res.status(502).json({
        error:
          "We could not confirm that payment. If you were charged, email infoschoolofgrowth@gmail.com with your reference and we will sort it out.",
      });
    }
  });

  /**
   * Paystack's server-to-server notification.
   *
   * The browser can close mid-redirect, so this is the only delivery of a
   * successful charge we are guaranteed to receive. Today it logs the payment
   * - enough to reconcile enrolments by hand against the Paystack dashboard.
   * When accounts exist, this is where the entitlement gets written to the
   * database, and /verify becomes a read of that record.
   *
   * Answers 200 quickly and unconditionally once the signature checks out:
   * Paystack retries anything else, and a slow handler gets duplicate events.
   */
  router.post("/payments/webhook", (req: Request & { rawBody?: Buffer }, res) => {
    const signature = req.get("x-paystack-signature");
    const raw = req.rawBody;

    if (!isPaystackConfigured() || !signature || !raw) {
      return res.sendStatus(400);
    }

    const expected = crypto
      .createHmac("sha512", paystackSecretKey()!)
      .update(raw)
      .digest("hex");

    // Constant-time compare. A plain === leaks, through timing, how much of a
    // forged signature was correct, which is enough to construct a valid one.
    const provided = Buffer.from(signature, "utf8");
    const computed = Buffer.from(expected, "utf8");
    if (
      provided.length !== computed.length ||
      !crypto.timingSafeEqual(provided, computed)
    ) {
      console.warn("Rejected a Paystack webhook with a bad signature.");
      return res.sendStatus(401);
    }

    const event = req.body;
    if (event?.event === "charge.success") {
      const tx = event.data ?? {};
      console.log(
        `[paystack] charge.success ${tx.reference} - ${tx.customer?.email} ` +
          `paid ${tx.amount} ${tx.currency} for ${tx.metadata?.itemKind ?? "plan"} ` +
          `"${tx.metadata?.bookId ?? tx.metadata?.donationFund ?? tx.metadata?.plan}".`
      );
    }

    res.sendStatus(200);
  });

  return router;
}
