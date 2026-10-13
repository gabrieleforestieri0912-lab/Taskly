/**
 * Preferenze utente (impostazioni) — lettura/scrittura + applicazione reale.
 * Ogni chiave salvata qui DEVE avere almeno un consumer che la applica,
 * altrimenti è un placeholder: non aggiungere chiavi senza consumer.
 *
 * Niente "use client": come theme.ts/appFont.ts, deve restare importabile
 * dai Server Component (layout bootstrap) — tutti gli accessi a
 * window/document/localStorage sono già protetti.
 */

export const PREFS_KEY = "taskly_user_preferences";

export interface UserPrefs {
  density: "normal" | "compact";
  notifSound: boolean;
  notifTaskDue: boolean;
  notifMeetings: boolean;
  defaultPageView: "list" | "kanban";
  aiSuggestions: boolean;
  confirmDelete: boolean;
  firstDayMonday: boolean;
}

const DEFAULTS: UserPrefs = {
  density: "normal",
  notifSound: true,
  notifTaskDue: true,
  notifMeetings: true,
  defaultPageView: "list",
  aiSuggestions: true,
  confirmDelete: true,
  firstDayMonday: true,
};

export function readUserPrefs(): UserPrefs {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const p = JSON.parse(raw);
    return {
      density: p.density === "compact" ? "compact" : "normal",
      notifSound: typeof p.notifSound === "boolean" ? p.notifSound : DEFAULTS.notifSound,
      notifTaskDue: typeof p.notifTaskDue === "boolean" ? p.notifTaskDue : DEFAULTS.notifTaskDue,
      notifMeetings: typeof p.notifMeetings === "boolean" ? p.notifMeetings : DEFAULTS.notifMeetings,
      defaultPageView: p.defaultPageView === "kanban" ? "kanban" : "list",
      aiSuggestions: typeof p.aiSuggestions === "boolean" ? p.aiSuggestions : DEFAULTS.aiSuggestions,
      confirmDelete: typeof p.confirmDelete === "boolean" ? p.confirmDelete : DEFAULTS.confirmDelete,
      firstDayMonday: typeof p.firstDayMonday === "boolean" ? p.firstDayMonday : DEFAULTS.firstDayMonday,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function readPref<K extends keyof UserPrefs>(key: K): UserPrefs[K] {
  return readUserPrefs()[key];
}

/** Densità compatta: riduce lo spacing di Tailwind del 20% su tutto il documento. */
export function applyDensity(density: "normal" | "compact") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("density-compact", density === "compact");
}

/** Script inline pre-hydration per la densità. */
export function densityBootstrapScript() {
  return `
    (function(){
      try{
        var raw = localStorage.getItem('${PREFS_KEY}');
        var compact = raw && JSON.parse(raw).density === 'compact';
        document.documentElement.classList.toggle('density-compact', !!compact);
      }catch(e){}
    })();
  `;
}

let audioCtx: AudioContext | null = null;

/** Breve beep di completamento (WebAudio, nessun file esterno). */
export function playCompletionSound() {
  try {
    if (typeof window === "undefined") return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [523.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = t0 + i * 0.09;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {}
}

/** Chiede il permesso per le notifiche di sistema (va chiamato da un gesto utente). */
export async function ensureNotifPermission(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/** Notifica di sistema (solo se il permesso è già garantito). */
export function notifyLocal(title: string, body?: string): boolean {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission !== "granted") return false;
    new Notification(title, body ? { body } : undefined);
    return true;
  } catch {
    return false;
  }
}
