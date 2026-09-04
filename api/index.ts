import express from "express";
import { loadServerEnv } from "../src/server/loadEnv.js";
import { createAdminRouter, requireAdmin } from "../src/server/adminRoutes.js";
import { isPaystackConfigured, paystackPublicKey } from "../src/server/paystackEnv.js";

loadServerEnv();

export const config = {
  maxDuration: 60,
};

/**
 * Vercel serverless entry point for every /api/* route.
 *
 * Vercel serves the built frontend from dist/ via its CDN and does not run
 * server.ts, so without this file the deployed site has no backend at all:
 * /api/* returns Vercel's NOT_FOUND page and every chat message fails.
 *
 * vercel.json rewrites /api/(.*) here rather than relying on a catch-all
 * filename. An earlier api/[...path].ts deployed as a single-segment route:
 * /api/health reached it while /api/ai/chat returned 404.
 *
 * The router is mounted twice because a rewritten request may arrive with or
 * without its /api prefix. Mounting both ways costs nothing and removes the
 * need to depend on which one Vercel does.
 *
 * The import above needs its .js extension: package.json sets
 * "type": "module", and Node's ESM resolver does not guess extensions.
 *
 * GEMINI_API_KEY and PAYSTACK_SECRET_KEY must be set in the Vercel project's
 * environment variables. .env is gitignored and never deployed, so a key that
 * works locally is absent here until it is configured in the dashboard.
 */

type RawBodyRequest = express.Request & { rawBody?: Buffer };

const app = express();
const adminRouter = createAdminRouter();

function captureRawBody(req: RawBodyRequest, _res: express.Response, buf: Buffer) {
  req.rawBody = buf;
}

app.use(express.json({ limit: '8mb', verify: captureRawBody }));

app.get(["/api/health", "/health"], (_req, res) => {
  res.json({
    status: "ok",
    app: "School of Growth Global",
    model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
    aiMode: process.env.GEMINI_API_KEY ? "live" : "simulation",
  });
});

app.get(["/api/admin/status", "/admin/status"], (_req, res) => {
  res.json({
    enabled: Boolean(process.env.ADMIN_PASSWORD),
    paystackConnected: isPaystackConfigured(),
  });
});

app.get(["/api/payments/config", "/payments/config"], (_req, res) => {
  res.json({
    configured: isPaystackConfigured(),
    publicKey: paystackPublicKey() ?? null,
    currency: "NGN",
  });
});

let apiRouterPromise: Promise<express.Router> | null = null;

async function loadApiRouter(): Promise<express.Router> {
  if (!apiRouterPromise) {
    apiRouterPromise = Promise.all([
      import("../src/server/aiRoutes.js"),
      import("../src/server/paymentRoutes.js"),
      import("../src/server/mentorRoutes.js"),
      import("../src/server/leadRoutes.js"),
      import("../src/server/messageRoutes.js"),
      import("../src/server/contentRoutes.js"),
      import("../src/server/demoReviewerRoutes.js"),
      import("../src/server/mentorReviewRoutes.js"),
    ]).then(
      ([
        aiRoutes,
        paymentRoutes,
        mentorRoutes,
        leadRoutes,
        messageRoutes,
        contentRoutes,
        demoReviewerRoutes,
        mentorReviewRoutes,
      ]) => {
        const router = express.Router();
        router.use(aiRoutes.createAIRouter());
        router.use(paymentRoutes.createPaymentRouter());
        router.use(mentorRoutes.createMentorRouter(requireAdmin));
        router.use(leadRoutes.createLeadRouter(requireAdmin));
        router.use(messageRoutes.createMessageRouter(requireAdmin));
        router.use(contentRoutes.createContentRouter(requireAdmin));
        router.use(demoReviewerRoutes.createDemoReviewerRouter());
        router.use(mentorReviewRoutes.createMentorReviewRouter());
        return router;
      }
    );
  }
  return apiRouterPromise;
}

async function lazyApi(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const router = await loadApiRouter();
    router(req, res, next);
  } catch (error) {
    next(error);
  }
}

app.use("/api", adminRouter);
app.use(adminRouter);
app.use("/api", lazyApi);
app.use(lazyApi);

export default app;
