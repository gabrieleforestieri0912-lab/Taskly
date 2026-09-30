/**
 * Meeting providers — punto di estensione per Zoom, Google Meet, ecc.
 *
 * Per aggiungere un nuovo provider in futuro:
 *  1. aggiungi una entry a MEETING_PROVIDERS (id, label, help, envHint)
 *  2. crea le route OAuth sotto /api/integrations/<id>/authorize|callback
 *     che salvano i token con setIntegration(userId, "<id>", {...})
 *  3. se il provider espone recording/transcript via API, aggiungi
 *     una route di fetch dedicata e richiamala dal MeetingImportPanel.
 *
 * Il formato canonico scambiato col server è MeetingImportPayload
 * (usato da POST /api/meetings/import).
 */

export type MeetingSource = "manual" | "zoom" | "google_meet" | "upload";

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
    description: "Registra dal microfono con trascrizione live del browser.",
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
      "Collega Zoom via OAuth e importa cloud recording / trascrizioni VTT.",
    connectHelp:
      "1) Crea una Server-to-Server o General App su Zoom Marketplace. 2) Imposta ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET / ZOOM_REDIRECT_URI. 3) Premi «Connetti Zoom».",
    envHint: ["ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET", "ZOOM_REDIRECT_URI"],
    oauth: true,
    authorizePath: "/api/integrations/zoom/authorize",
    badgeClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  },
  {
    id: "google_meet",
    label: "Google Meet",
    shortLabel: "Meet",
    description:
      "Collega Google e importa eventi Meet dal calendario o trascrizioni da Drive.",
    connectHelp:
      "Usa il tuo account Google. Servono scope Calendar + Drive readonly per leggere eventi Meet e file di trascrizione.",
    envHint: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"],
    oauth: true,
    authorizePath: "/api/integrations/google/authorize",
    badgeClass:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
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
    v === "manual" || v === "zoom" || v === "google_meet" || v === "upload"
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

/** Prompt standardizzato per il recap AI — riusato da client e server. */
export function buildRecapPrompt(transcript: string, lang: "it" | "en" = "it"): string {
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
export function fallbackRecap(transcript: string, lang: "it" | "en" = "it"): string {
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
    // rimuovi header WEBVTT, cue numerici, timestamp --> e tag
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
  // dedup righe consecutive (tipico dei sottotitoli live)
  const out: string[] = [];
  for (const l of lines) {
    if (out[out.length - 1] !== l) out.push(l);
  }
  return out.join("\n");
}

/** Estrae meeting ID Zoom da URL o stringa grezza. */
export function parseZoomMeetingId(input: string): string {
  const t = (input || "").trim();
  const m = t.match(/(?:\/j\/|\/s\/|meeting[_-]?id[:=]\s*)(\d{9,12})/i) || t.match(/(\d{9,12})/);
  return m ? m[1] : t;
}
