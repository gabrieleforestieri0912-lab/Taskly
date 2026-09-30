/**
 * Meeting providers (desktop) — punto di estensione per Zoom, Google Meet,
 * YouTube, ecc.
 *
 * Per aggiungere un nuovo provider in futuro:
 *  1. aggiungi una entry a MEETING_PROVIDERS (id, label, help, envHint)
 *  2. se serve OAuth, aggiungi la route lato server e imposta authorizePath
 *  3. se il provider espone recording/transcript via API, aggiungi
 *     una route di fetch dedicata e richiamala dal MeetingImportPanel.
 *
 * Lo stesso registry esiste nella webapp (src/lib/meetings/providers.ts):
 * mantenerli allineati quando si aggiunge un provider.
 */

export type MeetingSource =
  | "manual"
  | "zoom"
  | "google_meet"
  | "youtube"
  | "upload";

export interface MeetingProvider {
  id: MeetingSource;
  label: string;
  shortLabel: string;
  description: string;
  /** Testo di aiuto mostrato nel pannello import */
  connectHelp: string;
  /** Nome variabili env necessarie (per diagnostica) */
  envHint: string[];
  /** Se true, il provider richiede OAuth prima del fetch diretto */
  oauth: boolean;
  authorizePath?: string;
  /** Badge color (tailwind classes) */
  badgeClass: string;
}

export const MEETING_PROVIDERS: MeetingProvider[] = [
  {
    id: "manual",
    label: "Registrazione microfono",
    shortLabel: "Manuale",
    description: "Registra dal microfono con trascrizione live.",
    connectHelp: "Nessuna configurazione richiesta.",
    envHint: [],
    oauth: false,
    badgeClass:
      "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300",
  },
  {
    id: "zoom",
    label: "Zoom",
    shortLabel: "Zoom",
    description:
      "Importa cloud recording / trascrizioni VTT di Zoom.",
    connectHelp:
      "Scarica il file VTT dalla cloud recording di Zoom e incollalo qui (lo puliamo noi).",
    envHint: [],
    oauth: false,
    badgeClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    id: "google_meet",
    label: "Google Meet",
    shortLabel: "Meet",
    description: "Importa trascrizioni di Google Meet.",
    connectHelp:
      "Da Meet scarica la trascrizione (Docs/Drive) e incollala qui.",
    envHint: [],
    oauth: false,
    badgeClass:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YouTube",
    description:
      "Trascrivi un video YouTube: riproducilo qui e cattura l'audio di sistema.",
    connectHelp:
      "Incolla il link del video, premi Riproduci e avvia la cattura audio di sistema. Il badge in alto ti mostra lo stato.",
    envHint: [],
    oauth: false,
    badgeClass: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  },
  {
    id: "upload",
    label: "File / Appunti",
    shortLabel: "File",
    description: "Incolla una trascrizione o carica un file .vtt / .txt / .srt.",
    connectHelp: "Nessuna configurazione richiesta.",
    envHint: [],
    oauth: false,
    badgeClass:
      "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
  },
];

export function getMeetingProvider(id?: string | null): MeetingProvider {
  return (
    MEETING_PROVIDERS.find((p) => p.id === id) ??
    MEETING_PROVIDERS.find((p) => p.id === "manual")!
  );
}

export function isKnownMeetingSource(v: unknown): v is MeetingSource {
  return (
    v === "manual" ||
    v === "zoom" ||
    v === "google_meet" ||
    v === "youtube" ||
    v === "upload"
  );
}

export interface MeetingImportPayload {
  title?: string;
  transcript: string;
  summary?: string;
  category?: string;
  duration?: string;
  date?: string;
  source?: MeetingSource;
  externalId?: string;
  meetingUrl?: string;
}

/** Prompt standardizzato per il recap AI — riusato ovunque. */
export function buildRecapPrompt(
  transcript: string,
  lang: "it" | "en" = "it",
): string {
  const clean = (transcript || "").slice(0, 12000);
  if (lang === "en") {
    return (
      "Summarize this meeting transcript in English. Return exactly these sections " +
      "with bullet lists and **bold** key terms:\n" +
      "• Objective\n• Key decisions\n• Action items (with owner when mentioned)\n• Open questions / risks\n• Next steps\n\nTranscript:\n" +
      clean
    );
  }
  return (
    "Riassumi questa trascrizione di una riunione in italiano. " +
    "Restituisci esattamente queste sezioni con elenchi puntati e **grassetti**:\n" +
    "• **Obiettivo**\n• **Decisioni prese**\n• **Azioni da fare** (con responsabile se menzionato)\n• **Questioni aperte / rischi**\n• **Prossimi passi**\n\nTrascrizione:\n" +
    clean
  );
}

/** Fallback locale quando l'LLM non è raggiungibile. */
export function fallbackRecap(
  transcript: string,
  lang: "it" | "en" = "it",
): string {
  const words = (transcript || "").split(/\s+/).filter(Boolean);
  const excerpt = words.slice(0, 40).join(" ");
  if (lang === "en") {
    return (
      `• **Objective**: Meeting recap (${words.length} words).\n` +
      `• **Key decisions**: See excerpt — "${excerpt}${words.length > 40 ? "…" : ""}"\n` +
      `• **Action items**: Review the full transcript and assign owners.\n` +
      `• **Next steps**: Schedule a follow-up.`
    );
  }
  return (
    `• **Obiettivo**: Recap riunione (${words.length} parole).\n` +
    `• **Decisioni prese**: Vedi estratto — "${excerpt}${words.length > 40 ? "…" : ""}"\n` +
    `• **Azioni da fare**: Rivedere la trascrizione completa e assegnare responsabili.\n` +
    `• **Prossimi passi**: Fissare un follow-up.`
  );
}

/**
 * Normalizza trascrizioni VTT/SRT in testo pulito.
 * Rimuove timestamp, cue id numerici, tag HTML e righe duplicate consecutive.
 */
export function normalizeTranscriptFile(raw: string): string {
  if (!raw) return "";
  const lines = raw
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (/^WEBVTT/i.test(l)) return false;
      if (/^\d+$/.test(l)) return false;
      if (/-->/.test(l)) return false;
      if (/^NOTE\b/i.test(l)) return false;
      return true;
    })
    .map((l) => l.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const l of lines) {
    if (out[out.length - 1] !== l) out.push(l);
  }
  return out.join("\n");
}

/** Estrae meeting ID Zoom da URL o stringa grezza. */
export function parseZoomMeetingId(input: string): string {
  const t = (input || "").trim();
  const m =
    t.match(/(?:\/j\/|\/s\/|meeting[_-]?id[:=]\s*)(\d{9,12})/i) ||
    t.match(/(\d{9,12})/);
  return m ? m[1] : t;
}

/** Estrae il video ID YouTube da URL (watch, youtu.be, shorts, embed) o ID grezzo. */
export function parseYouTubeVideoId(input: string): string {
  const t = (input || "").trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m =
    t.match(/[?&]v=([\w-]{11})/) ||
    t.match(/youtu\.be\/([\w-]{11})/) ||
    t.match(/\/shorts\/([\w-]{11})/) ||
    t.match(/\/embed\/([\w-]{11})/) ||
    t.match(/\/live\/([\w-]{11})/);
  return m ? m[1] : "";
}

/** URL embed per riprodurre il video dentro l'app desktop. */
export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

/** URL watch canonico (salvato come meetingUrl). */
export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
