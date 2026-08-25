import "dotenv/config";
import express from "express";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createAIRouter } from "./src/server/aiRoutes.js";
import { createPaymentRouter, captureRawBody } from "./src/server/paymentRoutes.js";
import { createAdminRouter, requireAdmin } from "./src/server/adminRoutes.js";
import { createMentorRouter } from "./src/server/mentorRoutes.js";
import { createLeadRouter } from "./src/server/leadRoutes.js";
import { createMessageRouter } from "./src/server/messageRoutes.js";
import { createContentRouter } from "./src/server/contentRoutes.js";
import { createDemoReviewerRouter } from "./src/server/demoReviewerRoutes.js";

function portInUseMessage(port: number): string {
  const nextPort = port + 1;
  return (
    `\nPort ${port} is already in use, so School of Growth did not start.\n` +
    `Stop the existing dev server, or start this project on a free port.\n\n` +
    `PowerShell:  $env:PORT=${nextPort}; npm.cmd run dev\n` +
    `Command Prompt:  set PORT=${nextPort} && npm.cmd run dev\n` +
    `macOS/Linux:  PORT=${nextPort} npm run dev\n\n` +
    `You can also set PORT=${nextPort} in your .env file.\n`
  );
}

function failStartup(err: NodeJS.ErrnoException, port: number): void {
  if (err.code === "EADDRINUSE") {
    console.error(portInUseMessage(port));
  } else {
    console.error("School of Growth server failed to start:", err);
  }
  process.exit(1);
}

async function assertPortAvailable(port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.once("listening", () => {
      probe.close(() => resolve());
    });
    probe.listen(port, "0.0.0.0");
  });
}

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

  try {
    await assertPortAvailable(PORT);
  } catch (err) {
    failStartup(err as NodeJS.ErrnoException, PORT);
  }

  // captureRawBody keeps the original bytes on the request so the Paystack
  // webhook can verify its signature; parsing alone would discard them.
  app.use(express.json({ limit: '8mb', verify: captureRawBody }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'data', 'uploads')));
  app.use("/api", createAIRouter());
  app.use("/api", createPaymentRouter());
  app.use("/api", createAdminRouter());
  app.use("/api", createMentorRouter(requireAdmin));
  app.use("/api", createLeadRouter(requireAdmin));
  app.use("/api", createMessageRouter(requireAdmin));
  app.use("/api", createContentRouter(requireAdmin));
  app.use("/api", createDemoReviewerRouter());

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
  // raw stack trace if another process grabs the port after the preflight.
  server.on("error", (err: NodeJS.ErrnoException) => {
    failStartup(err, PORT);
  });
}

startServer();
