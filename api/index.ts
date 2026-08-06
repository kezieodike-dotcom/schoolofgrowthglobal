import express from "express";
import { createAIRouter } from "../src/server/aiRoutes.js";
import { createPaymentRouter, captureRawBody } from "../src/server/paymentRoutes.js";
import { createAdminRouter, requireAdmin } from "../src/server/adminRoutes.js";
import { createMentorRouter } from "../src/server/mentorRoutes.js";
import { createLeadRouter } from "../src/server/leadRoutes.js";
import { createMessageRouter } from "../src/server/messageRoutes.js";

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

const app = express();
// captureRawBody keeps the original bytes on the request so the Paystack
// webhook can verify its signature; parsing alone would discard them.
app.use(express.json({ verify: captureRawBody }));
app.use("/api", createAIRouter());
app.use("/api", createPaymentRouter());
app.use("/api", createAdminRouter());
app.use("/api", createMentorRouter(requireAdmin));
app.use("/api", createLeadRouter(requireAdmin));
app.use("/api", createMessageRouter(requireAdmin));
app.use(createAIRouter());
app.use(createPaymentRouter());
app.use(createAdminRouter());
app.use(createMentorRouter(requireAdmin));
app.use(createLeadRouter(requireAdmin));
app.use(createMessageRouter(requireAdmin));

export default app;
