export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string; // YYYY-MM-DD
  project?: string; // ID della pagina o codice progetto
  projectName?: string; // Nome descrittivo del progetto
  assignee?: string;
  tags?: string[];
  subtasks: Subtask[];
  position?: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  deleted?: boolean;
  /** ISO timestamp di soft-delete (cestino). Usato per ordinamento + retention 30gg. */
  deletedAt?: string;
}

export type GroupBy = "deadline" | "project" | "priority" | "status";
export type SortBy = "deadline" | "priority" | "title" | "createdAt" | "position";
export type FilterStatus = "all" | "active" | "completed";

export interface TaskPreferences {
  groupBy: GroupBy;
  sortBy: SortBy;
  sortDirection: "asc" | "desc";
  filterStatus: FilterStatus;
  filterPriority: "all" | TaskPriority;
  filterProject: string; // "all" or specific project
  searchQuery: string;
}

export const DEFAULT_TASK_PREFERENCES: TaskPreferences = {
  groupBy: "deadline",
  sortBy: "deadline",
  sortDirection: "asc",
  filterStatus: "active",
  filterPriority: "all",
  filterProject: "all",
  searchQuery: "",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Da fare",
  in_progress: "In corso",
  done: "Completato",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Bassa",
};

export const PRIORITY_COLORS: Record<
  TaskPriority,
  { bg: string; text: string; border: string; dot: string }
> = {
  urgent: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
  high: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  medium: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
  },
  low: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
};

/** Lingua UI corrente (inline-use, fuori dal tree React): il LanguageContext
 *  aggiorna document.documentElement.lang del documento. */
function uiLang(): "it" | "en" {
  return typeof document !== "undefined" && document.documentElement.lang === "en"
    ? "en"
    : "it";
}

const DL_FORMAT: Record<"it" | "en", Record<string, string>> = {
  it: {
    noDate: "Nessuna data",
    yesterday: "Ieri",
    daysAgo: "giorni fa",
    today: "Oggi",
    tomorrow: "Domani",
  },
  en: {
    noDate: "No date",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    today: "Today",
    tomorrow: "Tomorrow",
  },
};

const DL_WEEKDAYS: Record<"it" | "en", string[]> = {
  it: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

/** Formatta una data YYYY-MM-DD in lingua UI leggibile (IT/EN). */
export function formatDeadlineItalian(deadlineStr?: string): {
  formatted: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  const lang = uiLang();
  const labels = DL_FORMAT[lang];
  if (!deadlineStr) {
    return { formatted: labels.noDate, isOverdue: false, isToday: false, isTomorrow: false };
  }

  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) {
    return { formatted: deadlineStr, isOverdue: false, isToday: false, isTomorrow: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      formatted: diffDays === -1 ? labels.yesterday : `${Math.abs(diffDays)} ${labels.daysAgo}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }
  if (diffDays === 0) {
    return { formatted: labels.today, isOverdue: false, isToday: true, isTomorrow: false };
  }
  if (diffDays === 1) {
    return { formatted: labels.tomorrow, isOverdue: false, isToday: false, isTomorrow: true };
  }
  if (diffDays < 7) {
    return { formatted: DL_WEEKDAYS[lang][target.getDay()], isOverdue: false, isToday: false, isTomorrow: false };
  }

  return {
    formatted: target.toLocaleDateString(lang === "en" ? "en-US" : "it-IT", { day: "numeric", month: "short" }),
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
  };
}

/** Parsing semplice della scadenza in linguaggio naturale (italiano) */
export function parseNaturalDate(rawTitle: string): { title: string; deadline?: string } {
  let title = rawTitle.trim();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const lower = title.toLowerCase();

  // "oggi" / "today"
  const matchOggi = lower.match(/(?:\s|^)(?:per\s+|entro\s+|by\s+)?(?:oggi|today)(?:\s|$)/);
  if (matchOggi && matchOggi.index !== undefined) {
    title = (title.slice(0, matchOggi.index) + " " + title.slice(matchOggi.index + matchOggi[0].length)).trim();
    return { title, deadline: toYMD(today) };
  }

  // "dopodomani" / "day after tomorrow"
  const matchDopodomani = lower.match(/(?:\s|^)(?:per\s+|entro\s+)?(?:dopodomani|day after tomorrow)(?:\s|$)/);
  if (matchDopodomani && matchDopodomani.index !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    title = (title.slice(0, matchDopodomani.index) + " " + title.slice(matchDopodomani.index + matchDopodomani[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // "domani" / "tomorrow"
  const matchDomani = lower.match(/(?:\s|^)(?:per\s+|entro\s+|by\s+)?(?:domani|tomorrow)(?:\s|$)/);
  if (matchDomani && matchDomani.index !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    title = (title.slice(0, matchDomani.index) + " " + title.slice(matchDomani.index + matchDomani[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // "tra X giorni" / "in X giorni" / "in X days"
  const matchTra = lower.match(/(?:\s|^)(?:tra|in)\s+(\d+)\s+giorn[io](?:\s|$)|(?:\s|^)in\s+(\d+)\s+days(?:\s|$)/);
  if (matchTra && matchTra.index !== undefined) {
    const daysToAdd = parseInt(matchTra[1] || matchTra[2], 10);
    const d = new Date(today);
    d.setDate(d.getDate() + daysToAdd);
    title = (title.slice(0, matchTra.index) + " " + title.slice(matchTra.index + matchTra[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // Giorni della settimana: lunedì/martedì/... e monday/tuesday/...
  const weekDays: Array<{ names: string[]; day: number }> = [
    { names: ["domenica", "", "sunday", "sun"], day: 0 },
    { names: ["lunedì", "lunedi", "monday", "mon"], day: 1 },
    { names: ["martedì", "martedi", "tuesday", "tue"], day: 2 },
    { names: ["mercoledì", "mercoledi", "wednesday", "wed"], day: 3 },
    { names: ["giovedì", "giovedi", "thursday", "thu"], day: 4 },
    { names: ["venerdì", "venerdi", "friday", "fri"], day: 5 },
    { names: ["sabato", "", "saturday", "sat"], day: 6 },
  ];

  for (const wd of weekDays) {
    const alternatives = wd.names.filter(Boolean);
    const pattern = new RegExp(
      `(?:\\s|^)(?:per\\s+|entro\\s+|questo\\s+|prossimo\\s+|next\\s+|this\\s+|on\\s+)?(${alternatives.join("|")})(?:\\s|$)`,
      "i",
    );
    const m = lower.match(pattern);
    if (m && m.index !== undefined) {
      const currentDay = today.getDay();
      let diff = wd.day - currentDay;
      if (diff <= 0) diff += 7; // next occurrence
      const d = new Date(today);
      d.setDate(d.getDate() + diff);
      title = (title.slice(0, m.index) + " " + title.slice(m.index + m[0].length)).trim();
      return { title, deadline: toYMD(d) };
    }
  }

  // "settimana prossima" / "next week"
  const matchNextWeek = lower.match(/(?:\s|^)(?:per\s+|la\s+|next\s+)?(?:settimana prossima|next week)(?:\s|$)/);
  if (matchNextWeek && matchNextWeek.index !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    title = (title.slice(0, matchNextWeek.index) + " " + title.slice(matchNextWeek.index + matchNextWeek[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  return { title };
}

/** Storage key principale */
export const TASKS_STORAGE_KEY = "taskly_tasks_v1";
export const TASK_PREFS_STORAGE_KEY = "taskly_mytasks_prefs";

/** Carica tutti i task dal localStorage — nessun dato finto: se lo storage
 *  è vuoto partono da zero (prima esecuzione reale dell'utente). */
export function loadTasksFromStorage(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Prova a recuperare dal vecchio key "tasks"
    const legacyRaw = localStorage.getItem("tasks");
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        // Normalizza i task legacy al nuovo formato
        const normalized: Task[] = legacyParsed.map((item: any, idx: number) => ({
          id: item.id || `task-${Date.now()}-${idx}`,
          title: item.title || item.text || "Task senza titolo",
          description: item.description || "",
          status: item.status === "done" ? "done" : item.status === "in_progress" ? "in_progress" : "todo",
          priority: item.priority === "Alta" || item.priority === "urgent" ? "urgent" : item.priority === "high" ? "high" : item.priority === "low" ? "low" : "medium",
          deadline: item.deadline || "",
          project: item.project || item.pageId || "",
          projectName: item.projectName || "",
          assignee: item.assignee || "",
          tags: Array.isArray(item.tags) ? item.tags : [],
          subtasks: Array.isArray(item.subtasks)
            ? item.subtasks.map((s: any, sIdx: number) => ({
                id: s.id || `sub-${idx}-${sIdx}`,
                title: typeof s === "string" ? s : s.title || s.text || "",
                done: !!s.done,
              }))
            : [],
          position: item.position ?? idx,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt,
          completedAt: item.completedAt,
          deleted: !!item.deleted,
        }));
        saveTasksToStorage(normalized);
        return normalized;
      }
    }

    // Nessuna base: prima esecuzione reale, zero dati finti.
    return [];
  } catch (err) {
    console.error("Errore nel caricamento dei task:", err);
    return [];
  }
}

/** Salva i task sul localStorage */
export function saveTasksToStorage(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    // Sincronizza anche sul key legacy "tasks" per la compatibilità con Dashboard e Cestino
    localStorage.setItem("tasks", JSON.stringify(tasks));
    // Notifica ad altri componenti
    window.dispatchEvent(new CustomEvent("taskly-tasks-updated", { detail: tasks }));
  } catch (err) {
    console.error("Errore nel salvataggio dei task:", err);
  }
}

/** Carica preferenze utente (ordinamento, filtri, raggruppamento) */
export function loadTaskPreferences(): TaskPreferences {
  if (typeof window === "undefined") return DEFAULT_TASK_PREFERENCES;
  try {
    const raw = localStorage.getItem(TASK_PREFS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_TASK_PREFERENCES, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_TASK_PREFERENCES;
}

/** Salva preferenze utente */
export function saveTaskPreferences(prefs: TaskPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TASK_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

/** Soft-delete di un task con deletedAt (cestino + retention 30gg). */
export function softDeleteTaskLocal(task: Task): Task {
  const now = new Date().toISOString();
  return { ...task, deleted: true, deletedAt: now, updatedAt: now };
}

/** Ripristino di un task dal cestino. */
export function restoreTaskLocal(task: Task): Task {
  const next: any = { ...task, deleted: false, updatedAt: new Date().toISOString() };
  delete next.deletedAt;
  return next as Task;
}

function getTaskDeletedAtLocal(t: any): string | undefined {
  return t?.deletedAt || t?.updatedAt || t?.completedAt || t?.createdAt || undefined;
}

/** Rimuove i task cestinati da oltre 30 giorni. */
export function purgeExpiredTasksLocal(tasks: Task[]): { kept: Task[]; purgedIds: string[] } {
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const purgedIds: string[] = [];
  const kept = (tasks || []).filter((t: any) => {
    if (!t?.deleted) return true;
    const ts = getTaskDeletedAtLocal(t) ? new Date(getTaskDeletedAtLocal(t)!).getTime() : NaN;
    if (!Number.isNaN(ts) && Date.now() - ts > THIRTY_DAYS_MS) {
      purgedIds.push(String(t.id));
      return false;
    }
    return true;
  });
  return { kept, purgedIds };
}
