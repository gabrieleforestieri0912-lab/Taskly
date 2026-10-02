export type Theme = "light" | "dark";

/**
 * Chiave scritta SOLO quando l'utente sceglie il tema esplicitamente.
 * Serve a distinguere una vera preferenza dell'utente da un valore "dark"
 * salvato automaticamente dalle vecchie versioni (default scuro).
 */
export const THEME_CHOICE_KEY = "themeChoice";

/** Chiave legacy (mantenuta per compatibilità con il codice esistente). */
export const THEME_KEY = "theme";

export const DEFAULT_THEME: Theme = "light";

/** Legge la preferenza esplicita dell'utente; qualsiasi altro valore → chiaro. */
export function readTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return window.localStorage.getItem(THEME_CHOICE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Applica il tema al documento. Con `persist` salva la scelta esplicita
 * dell'utente (impostazioni / toggle), altrimenti applica solo visivamente.
 */
export function applyTheme(theme: Theme, persist = false) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  if (persist) {
    try {
      window.localStorage.setItem(THEME_CHOICE_KEY, theme);
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage non disponibile (Safari privato, SSR, …)
    }
  }
}

/** Script inline pre-hydration: evita il flash applicando il tema giusto. */
export function themeBootstrapScript() {
  return `
    (function(){
      try{
        // Chiaro di default: applica .dark solo se l'utente l'ha scelto.
        var choice = localStorage.getItem('${THEME_CHOICE_KEY}');
        if (choice === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }catch(e){ document.documentElement.classList.remove('dark'); }
    })();
  `;
}
