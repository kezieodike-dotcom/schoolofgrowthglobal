import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

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

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "School of Growth Global" });
  });

  // AI Chat Endpoint for Growth AI Coach
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          reply: `[Growth AI Simulation Mode]: In response to "${message}", strategic advice emphasizes scaling governance, aligning high-level OKRs, and establishing resilient leadership protocols.`
        });
      }

      const ai = getAI();
      const systemInstruction = `You are "Growth AI", the institutional intelligence coach for "School of Growth Global".
You serve executive leaders, high-potential managers, C-suite executives, and entrepreneurs.
Your tone is authoritative yet empowering, highly strategic, precise, and structured (using bullet points, bold key terms, and actionable executive insights).
Keep responses clear and focused on leadership, strategy, decision-making, tech integration, and organizational growth.
${context ? `Current Context: ${context}` : ''}`;

      const contents = history && Array.isArray(history) && history.length > 0
        ? history.map(item => `${item.role === 'user' ? 'Leader' : 'Growth AI'}: ${item.content}`).join('\n') + `\nLeader: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I have analyzed your query. Strategic alignment requires prioritizing operational leverage and clear metric governance.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Error in /api/ai/chat:", error);
      res.status(500).json({
        error: "Failed to generate AI response",
        details: error?.message || "Internal server error"
      });
    }
  });

  // AI Scenario Drill Generator Endpoint
  app.post("/api/ai/scenario", async (req, res) => {
    try {
      const { topic, difficulty } = req.body;
      const theme = topic || "Executive Crisis Management & Geopolitical Shock";

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
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
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an executive case writer for C-suite training at School of Growth Global.",
        }
      });

      const scenario = JSON.parse(response.text || "{}");
      res.json({ scenario });
    } catch (error: any) {
      console.error("Error in /api/ai/scenario:", error);
      res.status(500).json({ error: "Failed to generate scenario" });
    }
  });

  // AI Document / Text Strategy Analysis Endpoint
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { strategyText } = req.body;
      if (!strategyText) {
        return res.status(400).json({ error: "Strategy text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
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
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a C-Suite Strategy Advisor at School of Growth Global.",
        }
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json({ analysis });
    } catch (error: any) {
      console.error("Error in /api/ai/analyze:", error);
      res.status(500).json({ error: "Failed to analyze strategy" });
    }
  });

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`School of Growth Global server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
