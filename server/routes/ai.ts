import express, { Router, Request, Response } from "express";
import { authRequired } from "../middleware/auth";

const router: Router = express.Router();

router.post("/chat", authRequired, async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body as {
      message?: string;
      context?: {
        tasks?: unknown[];
        goals?: unknown[];
        ideas?: unknown[];
      };
    };

    const { default: Ollama } = await import("ollama");

    const response = await Ollama.chat({
      model: process.env.OLLAMA_MODEL || "llama3",
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
          content: message || "",
        },
      ],
    });

    res.json({
      message: response.message.content,
    });
  } catch (error) {
    console.error("Ollama error:", error);
    res.status(500).json({ message: "Error communicating with AI" });
  }
});

export default router;
