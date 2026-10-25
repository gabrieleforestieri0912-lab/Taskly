// Helper per i blocchi "link" delle pagine: riconoscimento URL in incolla,
// favicon del sito e apertura del link (browser di sistema su Electron).

const URL_RE = /^(https?:\/\/|www\.)\S+\.\S{2,}$/i;

/** true se il testo (trimmato) è un singolo URL web. */
export function isUrl(text) {
  const t = (text || "").trim();
  return URL_RE.test(t);
}

/** Aggiunge https:// se mancante, per avere sempre un href valido. */
export function normalizeUrl(text) {
  const t = (text || "").trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

/** Dominio senza www, usato come etichetta del blocco link. */
export function getDomain(text) {
  try {
    return new URL(normalizeUrl(text)).hostname.replace(/^www\./, "");
  } catch {
    return (text || "").trim();
  }
}

/** URL della favicon del sito (servizio Google, senza chiavi). */
export function getFaviconUrl(text) {
  const domain = getDomain(text);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

/**
 * Apre il link: su Electron usa il browser di sistema (il webview embedded
 * sarebbe bloccato da molti siti), altrimenti una nuova tab.
 */
export function openExternalUrl(url) {
  const u = normalizeUrl(url);
  const electron =
    typeof window !== "undefined" ? (window as any).electronAPI : undefined;
  if (electron && typeof electron.openExternal === "function" && /^https:\/\//i.test(u)) {
    electron.openExternal(u).catch(() => {
      window.open(u, "_blank", "noopener,noreferrer");
    });
    return;
  }
  window.open(u, "_blank", "noopener,noreferrer");
}
