import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "AI Health Assistant is not configured" });
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const systemPrompt = `You are a helpful AI Health Assistant for a hospital management platform. Answer general health questions, suggest when to seek medical attention, provide basic first-aid guidance, and help understand medical terminology. Always recommend consulting a doctor for specific advice. Never diagnose or prescribe. Be empathetic, professional, and concise.`;
    const messages = [...conversationHistory.map(m => ({ role: m.role, content: m.content })), { role: "user", content: message }];
    const response = await anthropic.messages.create({ model: "claude-3-5-sonnet-20241022", max_tokens: 1024, system: systemPrompt, messages });
    const textBlock = response.content.find(b => b.type === "text");
    res.json({ reply: textBlock?.text || "I could not generate a response." });
  } catch (err) { console.error("Health assistant error:", err.message); res.status(500).json({ error: "Failed to get AI response" }); }
});

export default router;
