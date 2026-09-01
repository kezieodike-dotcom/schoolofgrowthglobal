import express, { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import {
  diagnoseGrowthChallenge,
  formatGrowthDiagnosis,
} from "../lib/growthDiagnosis.js";

/**
 * Every Growth AI HTTP route, defined once and mounted by both entry points:
 *
 *   server.ts      - local development, a long-lived Express server that also
 *                    runs Vite middleware
 *   api/index.ts   - Vercel, where the same routes run as a serverless function
 *                    and the frontend is served from their CDN
 *
 * They were previously inlined in server.ts, which meant the deployed site had
 * no backend at all: Vercel published dist/ as a static site, /api/* returned
 * its NOT_FOUND page, and the chat reported a generic failure. Keeping the
 * routes here lets both environments serve identical behaviour.
 *
 * Paths here are relative to the mount point ("/health", not "/api/health") so
 * callers control the prefix. Vercel may or may not strip /api before the
 * function sees the request, and api/index.ts mounts the router both ways.
 */

// Override with GEMINI_MODEL to switch models without touching code.
//
// GET /api/ai/models lists candidate names, but being listed does not mean
// callable: retired models still appear and then 404 on generateContent
// ("no longer available to new users"), and a model can be callable yet have
// no free quota left. Only a real call proves a model works.
//
// The default is a -lite model deliberately. Probing this key found
// gemini-3.6-flash and gemini-flash-latest capped at 20 free requests, and
// gemini-2.0-flash at 0, while the lite models still answered. A public site
// on the free tier exhausts a 20-request allowance almost immediately. Raise
// this to a full flash model once billing is enabled and quality matters more
// than availability.
export const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

export const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Fails an AI request without leaking provider internals.
 *
 * Gemini errors carry model names, API versions ("v1beta"), quota states and
 * key-permission details. Those went straight to the browser, so a learner
 * could be shown raw provider JSON. Log the real cause for us, return a short
 * line for them. `details` is dev-only, and the client logs it to the console
 * rather than rendering it.
 */
const failAI = (
  res: express.Response,
  opts: { status?: number; route: string; error: unknown; userMessage: string }
) => {
  console.error(`Error in ${opts.route}:`, opts.error);

  // Hitting the rate limit is a normal operating condition on the free tier,
  // not an outage, and it resolves on its own. Saying "unavailable" invites the
  // reader to give up; telling them it is busy invites them to retry, which is
  // exactly what works.
  const quota = isQuotaError(opts.error);
  const body: Record<string, unknown> = {
    error: quota
      ? "Growth AI is handling a lot of requests right now. Please try again in a few moments."
      : opts.userMessage,
  };
  if (IS_DEV) {
    body.details =
      (opts.error as any)?.message ?? String(opts.error ?? "Unknown error");
  }
  return res.status(quota ? 429 : opts.status ?? 500).json(body);
};

/** True for Gemini's RESOURCE_EXHAUSTED / HTTP 429 rate-limit responses. */
function isQuotaError(error: unknown): boolean {
  const message = (error as any)?.message;
  if (typeof message !== "string") return false;
  return message.includes('"code":429') || message.includes("RESOURCE_EXHAUSTED");
}

// Initialize Gemini API client lazily or safely
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. API calls will return fallback messages.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "placeholder",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

export function createAIRouter(): Router {
  const router = Router();

  // Health check endpoint. Reports AI config so you can tell at a glance
  // whether you are talking to the real model or the offline fallback.
  router.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "School of Growth Global",
      model: MODEL,
      aiMode: process.env.GEMINI_API_KEY ? "live" : "simulation",
    });
  });

  // Diagnostic: list the models this API key may actually call.
  // Use it to confirm GEMINI_MODEL is a real, available model name.
  router.get("/ai/models", async (_req, res) => {
    // Development only. The list advertises every model this key can reach,
    // which is a detail of our AI setup that production visitors have no
    // reason to see. 404 rather than 403 so the route's existence stays quiet.
    if (!IS_DEV) {
      return res.status(404).json({ error: "Not found" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not set, so no models can be listed.",
      });
    }
    try {
      const ai = getAI();
      const names: string[] = [];
      const pager = await ai.models.list();
      for await (const m of pager) {
        if (m.name) names.push(m.name.replace(/^models\//, ""));
      }
      res.json({ configured: MODEL, available: names.sort() });
    } catch (error: any) {
      failAI(res, {
        route: "/api/ai/models",
        error,
        userMessage: "Could not list models.",
      });
    }
  });

  // AI Chat Endpoint for Growth AI Coach
  router.post("/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        const diagnosis = diagnoseGrowthChallenge(message);
        return res.json({
          simulated: true,
          reply:
            `${formatGrowthDiagnosis(diagnosis)}\n\n` +
            "Why this matters: your complaint should be converted into a clear growth pathway, not left as a vague problem.\n\n" +
            "Action: book the recommended intervention so the team can match you with the right expert mix."
        });
      }

      const suggestedDiagnosis = formatGrowthDiagnosis(diagnoseGrowthChallenge(message));
      const ai = getAI();
      const systemInstruction = `You are "Growth AI", the institutional intelligence coach for "School of Growth Global".
You serve executive leaders, high-potential managers, C-suite executives, and entrepreneurs.
Your tone is authoritative yet empowering, highly strategic, precise, and structured (using bullet points, bold key terms, and actionable executive insights).
Keep responses clear and focused on leadership, strategy, decision-making, tech integration, and organizational growth.
When a user describes a customer complaint, business problem, career problem, leadership issue, personal-growth issue, or organizational challenge, respond first with this exact diagnostic structure:
Growth Area: <clear SOGG growth area>
Primary Challenge: <main challenge category>
Recommended Experts: <expert type 1> + <expert type 2> + <expert type 3>
Recommended Intervention: <Quick Clarity, Strategic Consultation, Growth Strategy Session, Growth Audit, Blueprint, or relevant mentorship/program>
Next Step: <recommended next action>
Then add a short explanation and 2-4 practical immediate actions.
Use this SOGG internal suggestion as guidance when it fits the user's complaint:
${suggestedDiagnosis}
${context ? `Current Context: ${context}` : ''}`;

      const contents = history && Array.isArray(history) && history.length > 0
        ? history.map((item: { role: string; content: string }) =>
            `${item.role === 'user' ? 'Leader' : 'Growth AI'}: ${item.content}`).join('\n') + `\nLeader: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      // No canned substitute here: an empty model response is a failure, and
      // dressing it up as advice hides the outage from the caller.
      const reply = response.text?.trim();
      if (!reply) {
        return failAI(res, {
          status: 502,
          route: "/api/ai/chat",
          error: new Error(
            "Model returned no text (possible safety block or token limit)."
          ),
          userMessage:
            "Growth AI could not complete that response. Please rephrase your question and try again.",
        });
      }

      res.json({ reply, simulated: false });
    } catch (error: any) {
      failAI(res, {
        route: "/api/ai/chat",
        error,
        userMessage:
          "Growth AI is temporarily unavailable. Please try again in a moment.",
      });
    }
  });

  // AI Scenario Drill Generator Endpoint
  router.post("/ai/scenario", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      const theme = topic || "Executive Crisis Management & Geopolitical Shock";

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          simulated: true,
          scenario: {
            title: "Simulated Market Expansion Dilemma",
            brief: "A sudden regulatory shift in APAC threatens 35% of revenue while an activist investor demands immediate capital reallocation.",
            options: [
              "Option A: Pause regional deployment and launch an independent audit.",
              "Option B: Reallocate $12M to lobbying and regulatory compliance.",
              "Option C: Pivot rapidly to LATAM markets using agile partnership models."
            ],
            recommendation: "Option C maintains growth momentum while hedging regulatory risk."
          }
        });
      }

      const ai = getAI();
      const prompt = `Generate a realistic executive strategic decision drill scenario for the topic: "${theme}". Level: "${difficulty || 'Executive Tier'}".
Return a JSON object with:
- title (string): Snappy title of the scenario
- brief (string): 2-3 sentence high-stakes business context or dilemma
- options (array of strings): 3 distinct strategic choices
- recommendation (string): Executive recommendation and analysis rationale`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an executive case writer for C-suite training at School of Growth Global.",
        }
      });

      const scenario = JSON.parse(response.text || "{}");
      res.json({ scenario });
    } catch (error: any) {
      failAI(res, {
        route: "/api/ai/scenario",
        error,
        userMessage:
          "Growth AI could not generate a scenario right now. Please try again in a moment.",
      });
    }
  });

  // AI Document / Text Strategy Analysis Endpoint
  router.post("/ai/analyze", async (req, res) => {
    try {
      const { strategyText } = req.body;
      if (!strategyText) {
        return res.status(400).json({ error: "Strategy text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          simulated: true,
          analysis: {
            strengths: ["Clear visionary positioning", "Focus on digital transformation"],
            vulnerabilities: ["Lack of clear risk mitigation matrix", "Capital efficiency metrics missing"],
            strategicScore: 82,
            actionPlan: [
              "Establish 90-day milestone checkpoints with strict KPI triggers.",
              "Incorporate hedging strategies for currency & supply chain fluctuations."
            ]
          }
        });
      }

      const ai = getAI();
      const prompt = `Perform a C-suite Executive Critique on the following strategy snippet:\n"${strategyText}"\n
Provide a JSON response with:
- strengths (array of strings): 2-3 key strategic strengths
- vulnerabilities (array of strings): 2-3 critical risks or missing elements
- strategicScore (number 1-100): Overall institutional readiness score
- actionPlan (array of strings): 3 immediate high-impact recommendations`;

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a C-Suite Strategy Advisor at School of Growth Global.",
        }
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json({ analysis });
    } catch (error: any) {
      failAI(res, {
        route: "/api/ai/analyze",
        error,
        userMessage:
          "Growth AI could not review that strategy right now. Please try again in a moment.",
      });
    }
  });

  return router;
}
