import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/server/http";
import { xkiroChat } from "@/lib/server/xkiro";

export async function POST(request: NextRequest) {
  const body = await parseBody(request).catch(() => ({}));
  const { message, context } = (body || {}) as {
    message?: string;
    context?: { tasks?: unknown[]; goals?: unknown[]; ideas?: unknown[] };
  };
  const text = String(message || "");
  if (!text.trim()) {
    return NextResponse.json({ message: "" }, { status: 400 });
  }

  try {
    const reply = await xkiroChat([
      {
        role: "system",
        content: `Sei Taskly AI, un assistente intelligente per la produttività personale. Aiuti gli utenti a gestire obiettivi, task, idee e progetti. Sei conciso, motivante e sempre utile. Rispondi in italiano. Contesto attuale: ${JSON.stringify(context || {})}`,
      },
      { role: "user", content: text },
    ]);
    return NextResponse.json({ message: reply });
  } catch (err: any) {
    // Niente risposte preimpostate: se xKiro fallisce, il client mostra
    // l'errore reale invece di un fallback finto.
    console.error("AI chat xKiro error:", err?.message || err);
    const missingKey = err?.message?.includes("Missing XKIRO_API_KEY");
    const status = missingKey ? 500 : 502;
    return NextResponse.json(
      {
        message: "",
        error: missingKey
          ? "Chiave AI non configurata sul server (XKIRO_API_KEY mancante)."
          : err?.message || "AI non disponibile",
      },
      { status },
    );
  }
}
