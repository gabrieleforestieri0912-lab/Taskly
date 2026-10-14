import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/server/http";
import { xkiroChat } from "@/lib/server/xkiro";

const SYSTEM = `Sei Taskly AI, assistente di produttività. Rispondi in italiano, conciso e utile.
Usa la sintassi markdown: **grassetto**, *corsivo*, \`codice\`, elenchi con - o 1.

VEDI le pagine dell'utente (titoli, id, tipo e contenuto) nel contesto. Puoi riassumerle, cercare task/obiettivi, e PROPORRE MODIFICHE.

Per modificare le pagine, termina la risposta con UN blocco JSON in code fence:
\`\`\`json
{"actions": [{"type": "append_text", "payload": {"pageLabel": "Nome pagina", "text": "testo da aggiungere"}}, {"type": "add_task", "payload": {"pageLabel": "Nome", "title": "Nuovo task"}}, {"type": "add_goal", "payload": {"pageLabel": "Nome", "title": "Nuovo obiettivo"}}, {"type": "create_page", "payload": {"label": "Titolo", "contentText": "contenuto iniziale"}}, {"type": "update_page", "payload": {"id": "page-id", "updates": {"label": "Nuovo titolo"}}}]}
\`\`\`
Regole azioni:
- Usa "actions" SOLO se l'utente chiede di creare/modificare/aggiungere qualcosa. Per riassunti e domande, niente JSON.
- Max 5 azioni. pageLabel o pageId devono corrispondere a una pagina del contesto (l'id è preferibile).
- "append_text" aggiunge un paragrafo; "add_task"/"add_goal" aggiungono elementi veri (non solo testo).
- Scrivi SEMPRE prima un testo leggibile per l'utente, poi il blocco JSON.`;

function extractActions(raw: string): { clean: string; actions: any[] } {
  try {
    const fence = /```json\s*([\s\S]*?)```/i.exec(raw);
    const candidate = fence ? fence[1] : raw;
    const jsonMatch = /{\s*"actions?"\s*:\s*\[/.exec(candidate);
    if (!jsonMatch) return { clean: raw.replace(/```json[\s\S]*?```/gi, "").trim(), actions: [] };
    // Trova l'oggetto JSON bilanciato a partire dal match
    const start = candidate.indexOf("{", jsonMatch.index);
    let depth = 0;
    let end = -1;
    for (let i = start; i < candidate.length; i++) {
      const c = candidate[i];
      if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (start === -1 || end === -1) return { clean: raw.replace(/```json[\s\S]*?```/gi, "").trim(), actions: [] };
    const parsed = JSON.parse(candidate.slice(start, end));
    const list = Array.isArray(parsed.actions) ? parsed.actions : parsed.action ? [parsed.action] : [];
    const allowed = new Set(["append_text", "add_task", "add_goal", "create_page", "update_page", "insert_page_text", "update_page_content", "add_block"]);
    const actions = list
      .filter((a: any) => a && allowed.has(a.type) && a.payload && typeof a.payload === "object")
      .slice(0, 5);
    // Normalizza alias legacy verso i tipi supportati dal client
    const normalized = actions.map((a: any) => {
      if (a.type === "insert_page_text") return { type: "append_text", payload: { pageId: a.payload.id, pageLabel: a.payload.pageLabel, text: a.payload.text } };
      if (a.type === "update_page_content") return { type: "append_text", payload: { pageId: a.payload.id, pageLabel: a.payload.pageLabel, text: a.payload.content } };
      return a;
    });
    const clean = raw.replace(/```json[\s\S]*?```/gi, "").trim() || "Fatto! Ho aggiornato le tue pagine.";
    return { clean, actions: normalized };
  } catch {
    return { clean: raw.replace(/```json[\s\S]*?```/gi, "").trim(), actions: [] };
  }
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request).catch(() => ({}));
  const { message, contextDump, history } = (body || {}) as {
    message?: string;
    // nuovo formato ricco dal client
    contextDump?: string;
    history?: Array<{ role: string; content: string }>;
    // retrocompat: vecchio client mandava testo+contesto concatenati
    context?: { tasks?: unknown[]; goals?: unknown[]; ideas?: unknown[] };
  };
  const text = String(message || "");
  if (!text.trim()) {
    return NextResponse.json({ message: "" }, { status: 400 });
  }

  try {
    const past = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-10)
          .map((m) => ({ role: m.role as "user" | "assistant", content: String(m.content).slice(0, 2000) }))
      : [];
    const ctx = typeof contextDump === "string" && contextDump
      ? contextDump.slice(0, 14000)
      : `Contesto attuale: ${JSON.stringify((body as any)?.context || {})}`;
    const reply = await xkiroChat([
      { role: "system", content: `${SYSTEM}\n\n${ctx}` },
      ...past,
      { role: "user", content: text.slice(0, 4000) },
    ]);
    const { clean, actions } = extractActions(reply);
    return NextResponse.json({ message: clean, actions });
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
