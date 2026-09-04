import { readFileSync } from 'fs';
import path from 'path';

const aiRoutes = readFileSync(path.join(process.cwd(), 'src', 'server', 'aiRoutes.ts'), 'utf8');
const apiIndex = readFileSync(path.join(process.cwd(), 'api', 'index.ts'), 'utf8');

if (aiRoutes.includes('import { GoogleGenAI } from "@google/genai";')) {
  throw new Error('The Gemini SDK must be loaded lazily so non-AI API routes can start on Vercel.');
}

if (!aiRoutes.includes('await import("@google/genai")')) {
  throw new Error('AI routes should dynamically import the Gemini SDK only when a live AI call is made.');
}

if (apiIndex.includes("runtime: 'nodejs'") || apiIndex.includes('runtime: "nodejs"')) {
  throw new Error('Vercel Node functions are Node by default; avoid route-config runtime overrides here.');
}

for (const moduleName of [
  'aiRoutes',
  'paymentRoutes',
  'mentorRoutes',
  'leadRoutes',
  'messageRoutes',
  'contentRoutes',
  'demoReviewerRoutes',
  'mentorReviewRoutes',
]) {
  const staticImportPattern = new RegExp(
    `^import\\s+.*\\.\\./src/server/${moduleName}\\.js`,
    'm'
  );
  if (staticImportPattern.test(apiIndex)) {
    throw new Error(`api/index.ts should not statically import ${moduleName}; simple Vercel probes must stay isolated.`);
  }
}

if (!apiIndex.includes('import { createAdminRouter, requireAdmin } from "../src/server/adminRoutes.js";')) {
  throw new Error('Vercel should statically import only the lightweight admin router so login is bundled.');
}

if (apiIndex.includes('import("../src/server/adminRoutes.js")')) {
  throw new Error('The general API router should reuse the static admin middleware, not lazy-load adminRoutes twice.');
}

if (!apiIndex.includes('app.get(["/api/payments/config", "/payments/config"]')) {
  throw new Error('Vercel should answer the payment config probe before loading the heavy API router.');
}

const paymentConfigIndex = apiIndex.indexOf('app.get(["/api/payments/config", "/payments/config"]');
const lazyApiIndex = apiIndex.indexOf('app.use("/api", lazyApi)');
if (paymentConfigIndex === -1 || lazyApiIndex === -1 || paymentConfigIndex > lazyApiIndex) {
  throw new Error('The payment config probe must be mounted before the lazy API router.');
}
