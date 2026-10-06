/**
 * formatRelative.ts
 * -----------------
 * Relative-time formatter shared by the sidebar (last page modification) and
 * the trash view. Extracted from TrashView, which had it inline and hardcoded
 * to Italian only.
 */

const itFmt = new Intl.RelativeTimeFormat("it", { numeric: "auto" });
const enFmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** Pick the formatter for the active UI language ("it" default). */
function formatterFor(lang: string) {
  return lang.toLowerCase().startsWith("en") ? enFmt : itFmt;
}

/**
 * Returns a short relative time like "2 min fa" / "3 h fa" / "ieri" / "12 g fa".
 * Falls back to an absolute date beyond 30 days.
 *
 * @param iso      ISO timestamp to format.
 * @param lang     Active language code ("it" | "en").
 * @param fallback Returned when `iso` is missing or unparseable.
 */
export function formatRelativeTime(
  iso?: string | null,
  lang = "it",
  fallback = "",
): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;

  const fmt = formatterFor(lang);
  const diffMs = Date.now() - d.getTime();

  // Future timestamps (clock skew, clock drift) read as "now" rather than
  // "in -3 minutes", which looks like a bug.
  if (diffMs < 0) return fmt.format(0, "minute");

  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return fmt.format(0, "minute");
  if (mins < 60) return fmt.format(-mins, "minute");

  const hours = Math.floor(mins / 60);
  if (hours < 24) return fmt.format(-hours, "hour");

  const days = Math.floor(hours / 24);
  if (days < 30) return fmt.format(-days, "day");

  return d.toLocaleDateString(lang.toLowerCase().startsWith("en") ? "en-GB" : "it-IT", {
    day: "numeric",
    month: "short",
  });
}