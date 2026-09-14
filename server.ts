import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Check if system environment GEMINI_API_KEY is available
  app.get("/api/config", (req, res) => {
    const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({ hasEnvKey });
  });

  // Text-to-Animation Generation Endpoint
  app.post("/api/generate", async (req, res) => {
    try {
      const { prompt, apiKey } = req.body;

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "Please enter an animation concept." });
      }

      // Use user-provided key from sidebar or fall back to server environment variable
      const activeKey = (apiKey && typeof apiKey === "string" && apiKey.trim())
        ? apiKey.trim()
        : process.env.GEMINI_API_KEY;

      if (!activeKey) {
        return res.status(400).json({
          error: "Gemini API key is missing. Please enter your API key in the sidebar."
        });
      }

      const ai = new GoogleGenAI({
        apiKey: activeKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const SYSTEM_PROMPT =
        "You are an expert creative coder. The user will give you an animation concept. " +
        "You must write a complete, single-file HTML document (combining HTML, CSS, and " +
        "JavaScript/Canvas) that animates this concept. The animation must loop smoothly, " +
        "be visually appealing, and fit within a 600x400 canvas. Output ONLY valid, " +
        "executable HTML code. Do not include markdown code blocks (like ```html), " +
        "explanations, or any other text.";

      // Use gemini-3.6-flash with low thinking level for fast generation
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt.trim(),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const rawText = response.text || "";

      // Clean residual markdown code blocks
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```html")) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      if (!cleaned) {
        return res.status(500).json({ error: "Received empty code from Gemini. Please try again." });
      }

      res.json({ html: cleaned });
    } catch (err: any) {
      console.error("Gemini generation error:", err);
      const errorMessage = err?.message || "Failed to generate animation";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
