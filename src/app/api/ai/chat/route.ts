import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/server/http";

// Lightweight contextual fallback so the demo always answers even
// when Ollama isn't installed / not reachable.
function fallbackReply(message: string): string {
  const t = (message || "").trim().toLowerCase();
  if (/ciao|salve|hey|buongiorno|buonasera/.test(t))
    return "Ciao! 👋 Sono Taskly AI. Posso aiutarti a pianificare la tua giornata, riassumere note o creare task e obiettivi.";
  if (/riassumi|riassunto|summary/.test(t)) {
    const target = (message.match(/riassumi(?:\s+la\s+pagina\s+)?["“]?([^”"\n]+)?/i) || [])[1];
    if (target) return `Ecco il riassunto di "${target.trim()}": punti principali, azioni da mettere in agenda e prossimi passi. Per un riassunto dettagliato, apri la pagina dedicata e chiedi di generarlo.`;
    return "Ecco cosa ho riassunto: (1) punti chiave del tuo lavoro, (2) i task prioritari da completare, (3) le idee da convertire in obiettivi. Possiamo approfondire qualsiasi punto.";
  }
  if (/crea\s+(un\s+)?task|aggiungi\s+(un\s+)?task/.test(t))
    return "Perfetto, ho preparato un nuovo task nella tua lista. Vuoi che gli assegni una priorità (Alta/Media/Bassa) e una scadenza?";
  if (/obiettiv|goal|target/.test(t))
    return "Ottimo! Un obiettivo chiaro parte da un risultato misurabile. Definisci: (1) cosa vuoi ottenere, (2) entro quando, (3) i sotto-obiettivi che lo rendono raggiungibile.";
  if (/piano|pianifica|plan|agenda|giornat/.test(t))
    return "Ecco un piano suggerito per oggi: mattina dedicata al focus (3 task prioritari), trasferire 1 idea in obiettivo, e 20 minuti di calendario per la revisione di fine giornata. Vuoi che generi i blocchi nel calendario?";
  if (/grazie|perfetto|ottimo|ok|d'accordo|grazie mille/.test(t))
    return "Di nulla! 😊 Se mi serve altro: organizzazione task, riassunti, piani della giornata o obiettivi. Sono qui per questo.";
  if (/(come|chi sei|cosa fai|help|aiuto)/.test(t))
    return "Sono Taskly AI, il tuo assistente di produttività. Posso riassumere note, creare task, suggerire obiettivi e aiutarti a pianificare la giornata. Scrivi 'riassumi le mie note' o 'crea un task' per iniziare.";
  return `Ho capito, parliamo di "${message}". Per ottimizzarti, dimmi più nel dettaglio: vuoi creare un task, un obiettivo, riassumere una nota o pianificare il calendario?`;
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request).catch(() => ({}));
  const { message, context } = (body || {}) as {
    message?: string;
    context?: { tasks?: unknown[]; goals?: unknown[]; ideas?: unknown[] };
  };
  const text = String(message || "");

  // Fast failure: allow a graceful answer even without a message body.
  let reply: string;
  try {
    const { Ollama } = await import("ollama");
    const ollamaUrl =
      process.env.OLLAMA_URL ||
      process.env.NEXT_PUBLIC_OLLAMA_URL ||
      "http://localhost:11434";
    const model =
      process.env.OLLAMA_MODEL ||
      process.env.NEXT_PUBLIC_OLLAMA_MODEL ||
      "llama3";

    const client = new Ollama({ host: ollamaUrl });

    // Timeout so a missing/unresponsive Ollama doesn't hang the request.
    const timeout = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("Ollama timeout")), 25000),
    );

    const chat = client.chat({
      model,
      messages: [
        {
          role: "system",
          content: `Sei Taskly AI, un assistente intelligente per la produttività personale. Aiuti gli utenti a gestire obiettivi, task, idee e progetti. Sei conciso, motivante e sempre utile. Rispondi in italiano. Contesto attuale: ${JSON.stringify(context || {})}`,
        },
        { role: "user", content: text },
      ],
    });

    const response = await Promise.race([chat, timeout]);
    reply = (response as any)?.message?.content || "";
    if (!reply) throw new Error("Empty Ollama response");
  } catch (e) {
    // Fall back to the local contextual answer.
    reply = fallbackReply(text);
  }

  return NextResponse.json({ message: reply });
}
