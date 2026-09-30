
const express = require("express");
const router = express.Router();
const { authRequired } = require("../middleware/auth");

const XKIRO_BASE_URL = (process.env.XKIRO_BASE_URL || "https://api.xkiro.com/v1").replace(/\/+$/, "");
const XKIRO_CHAT_MODEL = process.env.XKIRO_CHAT_MODEL || "mistralai/mistral-medium-3.5";

router.post("/chat", authRequired, async (req, res) => {
  try {
    const { message, context } = req.body;
    const apiKey = (process.env.XKIRO_API_KEY || "").trim();
    if (!apiKey) {
      res.status(500).json({ message: "AI non configurata (XKIRO_API_KEY mancante)" });
      return;
    }

    const response = await fetch(`${XKIRO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: XKIRO_CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: `Sei Taskly AI, un assistente intelligente per la produttività personale.
Aiuti gli utenti a gestire i loro obiettivi, task, idee e progetti.
Sei conciso, motivante e sempre utile.
Il contesto attuale dell'utente:
- Task: ${JSON.stringify(context?.tasks || [])}
- Obiettivi: ${JSON.stringify(context?.goals || [])}
- Idee: ${JSON.stringify(context?.ideas || [])}`,
          },
          {
            role: "user",
            content: String(message || ""),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`xKiro ${response.status}`);
    }
    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content?.trim() || "";
    if (!content) throw new Error("Empty xKiro response");

    res.json({ message: content });
  } catch (error) {
    console.error("xKiro error:", error);
    res.status(500).json({ message: "Error communicating with AI" });
  }
});

module.exports = router;
