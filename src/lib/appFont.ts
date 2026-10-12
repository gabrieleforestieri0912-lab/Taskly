export type AppFontId = "inter" | "serif" | "mono";

/** Chiave già usata dalla pagina impostazioni per salvare il font. */
export const APP_FONT_KEY = "taskly_font";

export const DEFAULT_APP_FONT: AppFontId = "inter";

const STACKS: Record<AppFontId, string> = {
  inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

function isAppFontId(v: unknown): v is AppFontId {
  return v === "inter" || v === "serif" || v === "mono";
}

/** Legge il font salvato; qualsiasi altro valore → Inter (originale). */
export function readAppFont(): AppFontId {
  if (typeof window === "undefined") return DEFAULT_APP_FONT;
  try {
    const saved = window.localStorage.getItem(APP_FONT_KEY);
    return isAppFontId(saved) ? saved : DEFAULT_APP_FONT;
  } catch {
    return DEFAULT_APP_FONT;
  }
}

/**
 * Applica il font all'intera app via variabile CSS `--app-font`
 * (letta dal `body` nel layout). Con `persist` salva la scelta.
 */
export function applyAppFont(id: AppFontId, persist = false) {
  const safe: AppFontId = isAppFontId(id) ? id : DEFAULT_APP_FONT;
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--app-font", STACKS[safe]);
  document.documentElement.dataset.appFont = safe;
  if (persist) {
    try {
      window.localStorage.setItem(APP_FONT_KEY, safe);
    } catch {
      // localStorage non disponibile (Safari privato, SSR, …)
    }
  }
  try {
    window.dispatchEvent(new CustomEvent("taskly-font-changed", { detail: safe }));
  } catch {
    // mai bloccare la UI per un evento
  }
}

/** Script inline pre-hydration: evita il flash applicando il font giusto. */
export function appFontBootstrapScript() {
  return `
    (function(){
      try{
        var saved = localStorage.getItem('${APP_FONT_KEY}');
        var stacks = {
          inter: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          serif: "Georgia, 'Times New Roman', Times, serif",
          mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        };
        var id = (saved === 'serif' || saved === 'mono') ? saved : 'inter';
        document.documentElement.style.setProperty('--app-font', stacks[id]);
        document.documentElement.dataset.appFont = id;
      }catch(e){}
    })();
  `;
}
