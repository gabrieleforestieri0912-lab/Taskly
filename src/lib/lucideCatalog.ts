/**
 * lucideCatalog.ts
 * ----------------
 * Catalogo COMPLETO delle icone di `lucide-react`.
 *
 * Perché un file dedicato:
 * - `lucide-react` (v0.469) espone ~1544 icone canoniche nella mappa `icons`
 *   (chiave = nome PascalCase, es. `FileText`), più alias deprecati e i
 *   suffissi `*Icon` duplicati. Filtrare/serializzare quella mappa in ogni
 *   componente è costoso e fragile (vedi crash storico su `icons`).
 * - Qui la mappa viene costruita UNA volta a livello di modulo e condivisa.
 *
 * Chiave canonica usata nell'app: **kebab-case** (es. `"file-text"`),
 * coerente con `Page.icon` salvato su DB e con `lib/pageIcons.normalizeIconKey`.
 */

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** "FileText" → "file-text" · "AArrowDown" → "a-arrow-down" */
export const pascalToKebab = (name: string): string =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

const isRenderableIcon = (value: any): boolean =>
  typeof value === "function" ||
  Boolean(value && typeof value === "object" && value.render);

/** Registro ufficiale delle icone (preferito) con fallback difensivo. */
const registry: Record<string, any> = (() => {
  const maybe = (LucideIcons as any)?.icons;
  if (maybe && typeof maybe === "object" && !Array.isArray(maybe)) {
    return maybe as Record<string, any>;
  }
  // Fallback: deriva dagli export, filtrando le utilità non-icone.
  const NON_ICONS = new Set(["icons", "createLucideIcon", "default", "Icon"]);
  const out: Record<string, any> = {};
  Object.keys(LucideIcons).forEach((name) => {
    if (NON_ICONS.has(name)) return;
    if (name.endsWith("Icon")) return; // alias duplicato
    const value = (LucideIcons as any)[name];
    if (isRenderableIcon(value)) out[name] = value;
  });
  return out;
})();

export interface CatalogIcon {
  /** chiave kebab-case canonica, es. "file-text" */
  key: string;
  /** nome PascalCase lucide, es. "FileText" */
  name: string;
  Icon: LucideIcon;
}

/** Catalogo completo, ordinato alfabeticamente per chiave. */
export const LUCIDE_CATALOG: CatalogIcon[] = Object.keys(registry)
  .filter((name) => isRenderableIcon(registry[name]))
  .map((name) => ({ key: pascalToKebab(name), name, Icon: registry[name] as LucideIcon }))
  .sort((a, b) => a.key.localeCompare(b.key));

/** Lookup per chiave kebab-case. */
export const LUCIDE_BY_KEY: Record<string, LucideIcon> = (() => {
  const out: Record<string, LucideIcon> = {};
  for (const item of LUCIDE_CATALOG) out[item.key] = item.Icon;
  return out;
})();

/** Lookup per nome PascalCase (retrocompatibilità con icone salvate "FileText"). */
export const LUCIDE_BY_NAME: Record<string, LucideIcon> = (() => {
  const out: Record<string, LucideIcon> = {};
  for (const item of LUCIDE_CATALOG) out[item.name] = item.Icon;
  return out;
})();

/**
 * Risolve una qualsiasi forma di icona salvata in un componente lucide.
 * Accetta: kebab-case ("file-text"), PascalCase ("FileText"), camelCase, emoji.
 * Ritorna `undefined` per emoji, stringa vuota e chiavi sconosciute.
 */
export const getCatalogIcon = (raw: unknown): LucideIcon | undefined => {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (LUCIDE_BY_KEY[value]) return LUCIDE_BY_KEY[value];
  if (LUCIDE_BY_NAME[value]) return LUCIDE_BY_NAME[value];
  const kebab = pascalToKebab(value);
  if (LUCIDE_BY_KEY[kebab]) return LUCIDE_BY_KEY[kebab];
  const pascal = value.charAt(0).toUpperCase() + value.slice(1);
  if (LUCIDE_BY_NAME[pascal]) return LUCIDE_BY_NAME[pascal];
  return undefined;
};

/** Numero totale di icone disponibili (utile per UI/debug). */
export const LUCIDE_CATALOG_SIZE = LUCIDE_CATALOG.length;
