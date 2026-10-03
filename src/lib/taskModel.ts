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

/** Formatta una data YYYY-MM-DD in italiano leggibile */
export function formatDeadlineItalian(deadlineStr?: string): {
  formatted: string;
  isOverdue: boolean;
  isToday: boolean;
  isTomorrow: boolean;
} {
  if (!deadlineStr) {
    return { formatted: "Nessuna data", isOverdue: false, isToday: false, isTomorrow: false };
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
      formatted: diffDays === -1 ? "Ieri" : `${Math.abs(diffDays)} giorni fa`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }
  if (diffDays === 0) {
    return { formatted: "Oggi", isOverdue: false, isToday: true, isTomorrow: false };
  }
  if (diffDays === 1) {
    return { formatted: "Domani", isOverdue: false, isToday: false, isTomorrow: true };
  }
  if (diffDays < 7) {
    const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
    return { formatted: days[target.getDay()], isOverdue: false, isToday: false, isTomorrow: false };
  }

  return {
    formatted: target.toLocaleDateString("it-IT", { day: "numeric", month: "short" }),
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

  // "oggi"
  const matchOggi = lower.match(/(?:\s|^)(?:per\s+|entro\s+)?oggi(?:\s|$)/);
  if (matchOggi && matchOggi.index !== undefined) {
    title = (title.slice(0, matchOggi.index) + " " + title.slice(matchOggi.index + matchOggi[0].length)).trim();
    return { title, deadline: toYMD(today) };
  }

  // "dopodomani"
  const matchDopodomani = lower.match(/(?:\s|^)(?:per\s+|entro\s+)?dopodomani(?:\s|$)/);
  if (matchDopodomani && matchDopodomani.index !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    title = (title.slice(0, matchDopodomani.index) + " " + title.slice(matchDopodomani.index + matchDopodomani[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // "domani"
  const matchDomani = lower.match(/(?:\s|^)(?:per\s+|entro\s+)?domani(?:\s|$)/);
  if (matchDomani && matchDomani.index !== undefined) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    title = (title.slice(0, matchDomani.index) + " " + title.slice(matchDomani.index + matchDomani[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // "tra X giorni" / "in X giorni"
  const matchTra = lower.match(/(?:\s|^)(?:tra|in)\s+(\d+)\s+giorn[io](?:\s|$)/);
  if (matchTra && matchTra.index !== undefined) {
    const daysToAdd = parseInt(matchTra[1], 10);
    const d = new Date(today);
    d.setDate(d.getDate() + daysToAdd);
    title = (title.slice(0, matchTra.index) + " " + title.slice(matchTra.index + matchTra[0].length)).trim();
    return { title, deadline: toYMD(d) };
  }

  // Giorni della settimana: lunedì, martedì, ecc.
  const weekDays = [
    { name: "domenica", day: 0 },
    { name: "lunedì", alt: "lunedi", day: 1 },
    { name: "martedì", alt: "martedi", day: 2 },
    { name: "mercoledì", alt: "mercoledi", day: 3 },
    { name: "giovedì", alt: "giovedi", day: 4 },
    { name: "venerdì", alt: "venerdi", day: 5 },
    { name: "sabato", day: 6 },
  ];

  for (const wd of weekDays) {
    const pattern = new RegExp(`(?:\\s|^)(?:per\\s+|entro\\s+|questo\\s+|prossimo\\s+)?(${wd.name}|${wd.alt || ""})(?:\\s|$)`, "i");
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

  // "settimana prossima"
  const matchNextWeek = lower.match(/(?:\s|^)(?:per\s+|la\s+)?settimana prossima(?:\s|$)/);
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

/** Dati di esempio predefiniti per una prima esperienza ricca */
export const INITIAL_SAMPLE_TASKS: Task[] = [
  {
    id: "sample-1",
    title: "Completare la revisione del budget trimestrale",
    description: "Analizzare i fogli di spesa e preparare il consuntivo per la riunione di giovedì con il team finanziario.",
    status: "todo",
    priority: "urgent",
    deadline: new Date().toISOString().split("T")[0], // Oggi
    project: "finanze",
    projectName: "Finanze & Budget",
    tags: ["Prioritario", "Q3"],
    subtasks: [
      { id: "s-1", title: "Verificare fatture fornitori", done: true },
      { id: "s-2", title: "Aggiornare foglio di calcolo", done: true },
      { id: "s-3", title: "Preparare slide riassuntiva", done: false },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "sample-2",
    title: "Aggiornare mockup landing page v2",
    description: "Rifinire le animazioni hero e verificare il contrasto dei testi in dark mode.",
    status: "in_progress",
    priority: "high",
    deadline: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    })(), // Domani
    project: "design",
    projectName: "Progetto Design UI",
    tags: ["Figma", "Design"],
    subtasks: [
      { id: "s-4", title: "Rivedere palette colori", done: true },
      { id: "s-5", title: "Esportare icone SVG", done: false },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "sample-3",
    title: "Inviare feedback su proposta commerciale",
    description: "Mandare email a Marco con i commenti sulle condizioni contrattuali.",
    status: "todo",
    priority: "medium",
    deadline: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      return d.toISOString().split("T")[0];
    })(),
    project: "commerciale",
    projectName: "Sviluppo Commerciale",
    tags: ["Email"],
    subtasks: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "sample-4",
    title: "Pianificare roadmap sprint successivo",
    description: "Definire backlog e stime per i prossimi obiettivi di prodotto.",
    status: "todo",
    priority: "low",
    deadline: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    })(),
    project: "prodotto",
    projectName: "Roadmap Prodotto",
    tags: ["Sprint", "Pianificazione"],
    subtasks: [
      { id: "s-6", title: "Raccogliere ticket aperti", done: false },
      { id: "s-7", title: "Assegnare priorità", done: false },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "sample-5",
    title: "Configurare backup automatico database",
    description: "Impostare snapshot giornaliero e verificare la procedura di ripristino.",
    status: "done",
    priority: "high",
    deadline: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    })(),
    project: "infrastruttura",
    projectName: "DevOps & Cloud",
    tags: ["Database", "Sicurezza"],
    subtasks: [
      { id: "s-8", title: "Script snapshot cron", done: true },
      { id: "s-9", title: "Test ripristino su sandbox", done: true },
    ],
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

/** Carica tutti i task dal localStorage con fallback intelligente */
export function loadTasksFromStorage(): Task[] {
  if (typeof window === "undefined") return INITIAL_SAMPLE_TASKS;
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
          title: item.title || item.text || "Attività senza titolo",
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

    // Se non c'è nulla, inizializza con i sample tasks
    saveTasksToStorage(INITIAL_SAMPLE_TASKS);
    return INITIAL_SAMPLE_TASKS;
  } catch (err) {
    console.error("Errore nel caricamento dei task:", err);
    return INITIAL_SAMPLE_TASKS;
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
