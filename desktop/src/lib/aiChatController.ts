import { apiFetch } from "./api";

export function createAIChatCore(opts: {
  pages?: Array<Record<string, unknown>>;
}): {
  buildContext: () => string;
  streamChat: (text: string, context: string, signal: AbortSignal) => Promise<string>;
} {

  const { pages = [] } = opts;

  function buildContext(): string {
    const list = Array.isArray(pages) ? pages : [];
    if (!list.length) return "";
    const summaries = list.map((p) => {
      const data = p["data"];
      const count = Array.isArray(data) ? data.length : 0;
      return `- ${String(p["label"] ?? "pagina")} (${String(p["type"] ?? "pagina")}, ${count} elementi)`;
    });
    return `\n\nContesto pagine utente:\n${summaries.join("\n")}`;
  }

  async function streamChat(text: string, context: string, signal: AbortSignal): Promise<string> {
    const payload = {
      messages: [
        {
          role: "system",
          content:
            "Sei l'assistente AI di Taskly. Aiuti a organizzare task, creare piani, riassumere note e suggerire priorita. Rispondi in italiano, conciso e pratico." + context,
        },
        { role: "user", content: text },
      ],
    };
    const res = await apiFetch("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    } as RequestInit);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AI backend ${res.status}: ${body || res.statusText}`);
    }
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return data?.message ?? "";
  }

  return { buildContext, streamChat };
}
