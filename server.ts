import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createAIRouter } from "./src/server/aiRoutes.js";
import { createPaymentRouter, captureRawBody } from "./src/server/paymentRoutes.js";
import { createAdminRouter, requireAdmin } from "./src/server/adminRoutes.js";
import { createMentorRouter } from "./src/server/mentorRoutes.js";
import { createLeadRouter } from "./src/server/leadRoutes.js";
import { createMessageRouter } from "./src/server/messageRoutes.js";

/**
 * Local development server.
 *
 * The API routes live in src/server/aiRoutes.ts and src/server/paymentRoutes.ts
 * so that Vercel's serverless function (api/index.ts) serves exactly the same
 * endpoints. Anything added here rather than there will work locally and be
 * missing in production.
 */
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // captureRawBody keeps the original bytes on the request so the Paystack
  // webhook can verify its signature; parsing alone would discard them.
  app.use(express.json({ verify: captureRawBody }));
  app.use("/api", createAIRouter());
  app.use("/api", createPaymentRouter());
  app.use("/api", createAdminRouter());
  app.use("/api", createMentorRouter(requireAdmin));
  app.use("/api", createLeadRouter(requireAdmin));
  app.use("/api", createMessageRouter(requireAdmin));

  // Vite Middleware integration for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`School of Growth Global server running on http://localhost:${PORT}`);
  });

  // Without this, a busy port throws an unhandled 'error' event and prints a
  // raw stack trace. Worse, the browser then talks to whatever app *did* win
  // the port: it serves its own HTML and 404s /api/ai/*, which surfaces in the
  // UI as "Growth AI returned a non-JSON response" and looks like a bug here.
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\nPort ${PORT} is already in use, so School of Growth did not start.\n` +
          `Anything you load on this port belongs to another app, and Growth AI\n` +
          `will report "non-JSON response" because that app has no /api/ai routes.\n\n` +
          `Start on a free port instead:  PORT=3100 npm run dev\n` +
          `Or set PORT in your .env file.\n`
      );
    } else {
      console.error("School of Growth server failed to start:", err);
    }
    process.exit(1);
  });
}

startServer();
