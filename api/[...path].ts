import express from "express";
import type { IncomingMessage, ServerResponse } from "http";
import { createAIRouter } from "../src/server/aiRoutes";

/**
 * Vercel serverless entry point for every /api/* route.
 *
 * Vercel serves the built frontend from dist/ via its CDN and does not run
 * server.ts, so without this file the deployed site had no backend: /api/*
 * returned Vercel's NOT_FOUND page and the chat failed for every visitor.
 *
 * A catch-all filename ([...path]) means one function handles /api/health,
 * /api/ai/chat and the rest, keeping the routing identical to local dev.
 *
 * GEMINI_API_KEY must be set in the Vercel project's environment variables.
 * .env is gitignored and never deployed, so a key that works locally is not
 * present here unless it is configured in the dashboard.
 */

const app = express();
app.use(express.json());
app.use(createAIRouter());

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Depending on how the invocation is routed, the path may arrive with or
  // without its /api prefix. The router matches on the full path, so normalise
  // it rather than depending on that detail.
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }
  return (app as unknown as (rq: IncomingMessage, rs: ServerResponse) => void)(req, res);
}
