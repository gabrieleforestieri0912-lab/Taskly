import {
  LayoutDashboard,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  BriefcaseBusiness,
  Users,
  Layers,
  BookOpen,
  ClipboardList,
  Rocket,
  LucideIcon,
} from "lucide-react";
import {
  LUCIDE_BY_KEY,
  LUCIDE_BY_NAME,
  LUCIDE_CATALOG,
  getCatalogIcon,
  pascalToKebab,
} from "./lucideCatalog";

export const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "list-todo": ListTodo,
  target: Target,
  calendar: Calendar,
  "file-text": FileText,
  lightbulb: Lightbulb,
  "briefcase-business": BriefcaseBusiness,
  users: Users,
  layers: Layers,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  rocket: Rocket,
};

/** Tutte le icone selezionabili nel picker: catalogo completo lucide-react. */
export const ICON_OPTIONS = LUCIDE_CATALOG;

/**
 * Normalizza qualsiasi forma di chiave icona in kebab-case canonico.
 * - "FileText" / "fileText" â†’ "file-text"
 * - "file-text" â†’ "file-text"
 * - "" / null / undefined â†’ undefined (="nessuna icona", NON fallback)
 * - emoji (non-ASCII) â†’ restituita cosÃ¬ com'Ã¨
 * - chiave sconosciuta â†’ undefined (il chiamante applica il fallback per tipo)
 */
export const normalizeIconKey = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // Emoji: contiene caratteri non-ASCII â†’ lasciala passare
  if (/[^\x00-\x7F]/.test(trimmed)) return trimmed;
  // kebab-case giÃ  canonico e presente nel catalogo
  if (LUCIDE_BY_KEY[trimmed]) return trimmed;
  // PascalCase / camelCase esatto ("FileText")
  const direct = LUCIDE_BY_NAME[trimmed];
  if (direct) {
    const hit = LUCIDE_CATALOG.find((i) => i.Icon === direct);
    if (hit) return hit.key;
  }
  // Fallback: conversione a kebab
  const kebab = pascalToKebab(trimmed);
  if (LUCIDE_BY_KEY[kebab]) return kebab;
  // Icona curata non presente nel catalogo (non dovrebbe accadere)
  if (ICON_MAP[kebab]) return kebab;
  return undefined;
};

export const getIconByType = (type: string | undefined): LucideIcon => {
  switch (type) {
    case "tasks":
      return ListTodo;
    case "goals":
      return Target;
    case "calendar":
      return Calendar;
    case "notes":
      return FileText;
    case "braindump":
      return Lightbulb;
    case "empty":
      return FileText;
    default:
      return FileText;
  }
};

export const isEmojiIconHelper = (icon: string | undefined): boolean => {
  if (!icon || icon.length === 0) return false;
  return /[^\x00-\x7F]/.test(icon);
};

export const resolvePageIcon = (page: any): LucideIcon => {
  if (!page) return FileText;
  // 1) Catalogo completo lucide-react (kebab / PascalCase / camelCase)
  const fromCatalog = getCatalogIcon(page.icon);
  if (fromCatalog) return fromCatalog;
  // 2) Set curato (equivalente, ma esplicito per sicurezza)
  const normalized = normalizeIconKey(page.icon);
  if (normalized && ICON_MAP[normalized]) return ICON_MAP[normalized];
  // 3) Fallback per tipo di pagina
  return getIconByType(page.type);
};


