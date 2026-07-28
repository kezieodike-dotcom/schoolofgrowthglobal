import express from "express";
import { createAIRouter } from "../src/server/aiRoutes.js";

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
 * GEMINI_API_KEY must be set in the Vercel project's environment variables.
 * .env is gitignored and never deployed, so a key that works locally is absent
 * here until it is configured in the dashboard.
 */

const app = express();
app.use(express.json());
app.use("/api", createAIRouter());
app.use(createAIRouter());

export default app;
