import { buildRecapPrompt, fallbackRecap } from "@/lib/meetings/providers";
import { xkiroChat } from "@/lib/server/xkiro";

/** Genera un recap strutturato via xKiro, con fallback locale garantito. */
export async function generateMeetingRecap(
  transcript: string,
  lang: "it" | "en" = "it",
): Promise<string> {
  const text = (transcript || "").trim();
  if (!text) throw new Error("Empty transcript");
  const prompt = buildRecapPrompt(text, lang);
  try {
    return await xkiroChat([
      {
        role: "system",
        content:
          lang === "en"
            ? "You are Taskly AI, a precise meeting assistant. Always answer with the requested sections and bullet lists."
            : "Sei Taskly AI, un assistente preciso per riunioni. Rispondi sempre con le sezioni richieste ed elenchi puntati. Rispondi in italiano.",
      },
      { role: "user", content: prompt },
    ]);
  } catch {
    return fallbackRecap(text, lang);
  }
}
