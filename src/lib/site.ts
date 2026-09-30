export const SITE_NAME = "Taskly";

const PRODUCTION_URL = "https://taskly-productivity.vercel.app";

/**
 * Risolve l'URL canonico dell'app.
 * Priorità: NEXT_PUBLIC_SITE_URL > APP_URL > VERCEL_URL (auto su Vercel) > URL di produzione.
 * (Il vecchio codice aveva un bug di precedenza operatori che poteva produrre "https://undefined".)
 */
function resolveSiteUrl(): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromPublic) return fromPublic;
  const fromApp = process.env.APP_URL?.replace(/\/$/, "");
  if (fromApp) return fromApp;
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return PRODUCTION_URL;
}

export const SITE_URL = resolveSiteUrl();

/** Alias server-side per redirect/checkout (stessa risoluzione di SITE_URL). */
export const APP_URL = SITE_URL;

export const SITE_DESCRIPTION =
  "Task, note, calendario e obiettivi in un unico workspace intelligente. Pianifica con chiarezza, collabora in tempo reale e lascia che l'AI ti aiuti ogni giorno.";
