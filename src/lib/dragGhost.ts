/**
 * dragGhost.ts
 * -----------------
 * Anteprima di trascinamento fedele al contenuto.
 *
 * I drag nativi che nascono da una piccola handle (grip) mostrano come drag
 * image del browser solo la maniglia, quasi invisibile. Questo helper
 * costruisce una "card ghost" con il testo reale di riga/componente e la
 * registra con `setDragImage`: l'immagine segue il cursore per tutta la
 * durata del drag in Chromium/Electron.
 *
 * Tutto inline-style: il nodo ghost è fuori dal tree React e l'immagine di
 * drag è uno snapshot (no media-query dark/classi Tailwind).
 */

type GhostOptions = {
  /** Larghezza max della card (default 340). */
  maxWidth?: number;
  /** Offset cursore → angolo/nord-ovest della card (default 14, 18). */
  cursorOffsetX?: number;
  cursorOffsetY?: number;
};

function escapeHTMLEntity(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Imposta la drag image "ghost" per un DragEvent nativo. Fire-and-forget. */
export function setGhostDrag(
  e: React.DragEvent,
  text: string,
  opts: GhostOptions = {},
): void {
  const { maxWidth = 340, cursorOffsetX = 14, cursorOffsetY = 18 } = opts;
  const clean = (text || "").trim().replace(/\s+/g, " ").slice(0, 140);
  if (!clean || typeof document === "undefined") return;
  try {
    const holder = document.createElement("div");
    holder.setAttribute("aria-hidden", "true");
    holder.style.position = "fixed";
    holder.style.top = "-10000px";
    holder.style.left = "-10000px";
    holder.innerHTML =
      '<div style="display:flex;align-items:center;gap:8px;' +
      "max-width:" + maxWidth + 'px;background:#ffffff;color:#111827;' +
      "border:1px solid rgba(123,57,252,0.40);border-left:4px solid var(--accent, #7b39fc);" +
      "border-radius:12px;padding:10px 14px;box-shadow:0 10px 30px rgba(0,0,0,0.20);" +
      'font-size:13px;font-weight:600;line-height:1.35;">' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" ' +
      'stroke-width="2" stroke-linecap="round" style="flex-shrink:0;">' +
      '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>' +
      '<circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>' +
      "</svg>" +
      '<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
      escapeHTMLEntity(clean) +
      "</span></div>";
    document.body.appendChild(holder);
    const ghost = holder.firstElementChild as HTMLElement | null;
    if (ghost && typeof e.dataTransfer.setDragImage === "function") {
      e.dataTransfer.setDragImage(ghost, cursorOffsetX, cursorOffsetY);
    }
    // Chromium cattura lo snapshot subito nel dragstart: si può rimuovere
    // il nodo dopo il gesto. Sfiati di sicurezza in più.
    const cleanup = () => { try { holder.remove(); } catch {} };
    setTimeout(cleanup, 0);
    setTimeout(cleanup, 5000);
  } catch {
    // Anteprima non disponibile: resta la drag image nativa.
  }
}
