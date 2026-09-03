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
  'adminRoutes',
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
    throw new Error(`api/index.ts should lazy-load ${moduleName} so simple Vercel probes can still answer.`);
  }
}
