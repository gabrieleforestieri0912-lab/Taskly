/**
 * templateToBlocks.ts
 * -------------------
 * Ogni pagina Taskly è un documento di testo libero con componenti specifici
 * incorporati (lista task, tracker obiettivi, planner): template, progetti e
 * tipi base nascono come blocchi modificabili e sotto si può continuare a
 * scrivere. I componenti incapsulano gli stessi dati delle viste strutturate.
 */

function genId(prefix = "b"): string {
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return `${prefix}_${(crypto as any).randomUUID().slice(0, 8)}`;
    }
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Blocco di testo vuoto finale: "sotto si può continuare a scrivere". */
function trailingText(): any {
  return { id: genId("t"), type: "text", content: "" };
}

function ensureTrailingWritable(blocks: any[]): any[] {
  const last = blocks[blocks.length - 1];
  if (last && last.type === "text" && !String(last.content || "").trim()) return blocks;
  return [...blocks, trailingText()];
}

/** Normalizza una voce generica al formato atteso da ItemList. */
function normalizeTaskItem(it: any): any {
  const subs = Array.isArray(it?.subtasks) ? it.subtasks : [];
  return {
    id: String(it?.id ?? genId("task")),
    title: String(it?.title ?? "Attività senza titolo"),
    priority: it?.priority ?? "Media",
    status: it?.status === "done" || it?.status === "doing" ? it.status : "todo",
    deadline: it?.deadline ?? "",
    assignee: it?.assignee ?? "",
    subtasks: subs
      .map((s: any) =>
        typeof s === "string"
          ? { id: genId("st"), title: s, done: false }
          : { id: String(s?.id ?? genId("st")), title: String(s?.title ?? ""), done: Boolean(s?.done ?? s?.completed) },
      )
      .filter((s: any) => s.title.trim()),
  };
}

/** Normalizza un nodo generico al formato atteso da GoalsView (ricorsivo). */
function normalizeGoalNode(g: any, level = 0): any {
  const subs = Array.isArray(g?.subGoals) ? g.subGoals : Array.isArray(g?.subtasks) ? g.subtasks : [];
  return {
    id: String(g?.id ?? genId("goal")),
    title: String(g?.title ?? "Obiettivo senza titolo"),
    category: g?.category ?? "generale",
    completed: Boolean(g?.completed ?? g?.done),
    deadline: g?.deadline ?? "",
    level,
    subGoals: subs.map((s: any) => (typeof s === "string" ? normalizeGoalNode({ title: s }, level + 1) : normalizeGoalNode(s, level + 1))),
    createdAt: g?.createdAt ?? new Date().toISOString(),
  };
}

function tasksToBlocks(label: string, items: any[]): any[] {
  const list = Array.isArray(items) ? items.map(normalizeTaskItem) : [];
  return ensureTrailingWritable([
    { id: genId("h"), type: "h1", content: label || "Progetto" },
    {
      id: genId("t"),
      type: "text",
      content: "Base già pronta e modificabile: usa la lista qui sotto e continua a scrivere nelle righe successive.",
    },
    { id: genId("e"), type: "tasks-embed", content: "", items: list },
  ]);
}

function goalsToBlocks(label: string, goals: any[]): any[] {
  const list = Array.isArray(goals) ? goals.map((g: any) => (typeof g === "string" ? normalizeGoalNode({ title: g }) : normalizeGoalNode(g))) : [];
  return ensureTrailingWritable([
    { id: genId("h"), type: "h1", content: label || "Obiettivi" },
    {
      id: genId("t"),
      type: "text",
      content: "Obiettivi già strutturati e modificabili qui sotto; usa le righe successive per note e dettagli.",
    },
    { id: genId("e"), type: "goals-embed", content: "", goals: list },
  ]);
}

function calendarToBlocks(label: string, data: any): any[] {
  const schedule =
    data && typeof data === "object" && (Array.isArray((data as any).tasks) || (data as any).dailyMeta)
      ? { tasks: Array.isArray((data as any).tasks) ? (data as any).tasks : [], dailyMeta: (data as any).dailyMeta ?? {} }
      : { tasks: [], dailyMeta: {} };
  return ensureTrailingWritable([
    { id: genId("h"), type: "h1", content: label || "Pianificazione" },
    {
      id: genId("t"),
      type: "text",
      content: "Planner pronto all'uso qui sotto; continua a scrivere nelle righe successive.",
    },
    { id: genId("e"), type: "planner-embed", content: "", schedule },
  ]);
}

function markdownTextToBlocks(text: string): any[] {
  const blocks: any[] = [];
  const lines = String(text || "").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ id: genId("h"), type: h[1].length === 1 ? "h1" : h[1].length === 2 ? "h2" : "h3", content: h[2] });
      continue;
    }
    const cb = /^(?:-|\*)\s*\[([ xX])\]\s+(.*)$/.exec(line);
    if (cb) {
      blocks.push({ id: genId("c"), type: "checkbox", content: cb[2], checked: cb[1].toLowerCase() === "x" });
      continue;
    }
    const bullet = /^(?:-|\*|•)\s+(.*)$/.exec(line);
    if (bullet) {
      blocks.push({ id: genId("b"), type: "bullet", content: bullet[1] });
      continue;
    }
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      blocks.push({ id: genId("n"), type: "numbered", content: numbered[1] });
      continue;
    }
    if (/^---+$/.test(line)) {
      blocks.push({ id: genId("d"), type: "divider", content: "" });
      continue;
    }
    blocks.push({ id: genId("t"), type: "text", content: line });
  }
  if (blocks.length === 0) blocks.push({ id: genId("t"), type: "text", content: "" });
  return blocks;
}

/** Converte qualsiasi initialData strutturato in { blocks, tags } modificabile. */
export function toEditableBlocks(sourceType: string, initialData: any, label: string): { blocks: any[]; tags: string[] } {
  try {
    // Già a blocchi: riusa rigenerando gli id, garantendo la riga scrivibile.
    if (initialData && typeof initialData === "object" && Array.isArray((initialData as any).blocks)) {
      const cloned = JSON.parse(JSON.stringify(initialData));
      cloned.blocks = (cloned.blocks as any[]).map((b: any) => ({ ...b, id: genId("b") }));
      if (!Array.isArray(cloned.blocks) || cloned.blocks.length === 0) {
        cloned.blocks = [{ id: genId("t"), type: "text", content: "" }];
      }
      return { blocks: ensureTrailingWritable(cloned.blocks), tags: Array.isArray(cloned.tags) ? cloned.tags : [] };
    }
    // Lista task / progetto (array) → componente incorporato
    if (Array.isArray(initialData)) {
      const looksLikeGoals = initialData.some((g: any) => g && (Array.isArray(g.subGoals) || typeof g.level === "number"));
      if (looksLikeGoals || sourceType === "goals") {
        return { blocks: goalsToBlocks(label, initialData), tags: [] };
      }
      return { blocks: tasksToBlocks(label, initialData), tags: [] };
    }
    // Planner / calendario → componente incorporato
    if (initialData && typeof initialData === "object" && (Array.isArray((initialData as any).tasks) || (initialData as any).dailyMeta)) {
      return { blocks: calendarToBlocks(label, initialData), tags: [] };
    }
    // Note testuali classiche { text, tags }
    if (initialData && typeof initialData === "object" && typeof (initialData as any).text === "string") {
      const tags = Array.isArray((initialData as any).tags) ? (initialData as any).tags : [];
      return { blocks: ensureTrailingWritable(markdownTextToBlocks((initialData as any).text)), tags };
    }
    if (typeof initialData === "string") {
      return { blocks: ensureTrailingWritable(markdownTextToBlocks(initialData)), tags: [] };
    }
  } catch {}
  return { blocks: [{ id: genId("h"), type: "h1", content: label || "Nuova pagina" }, trailingText()], tags: [] };
}

/** Blocchi iniziali per i tipi base scelti nel modal ("Blocchi Base"). */
export function baseTypeToBlocks(type: string): any[] {
  if (type === "tasks") {
    return [{ id: genId("e"), type: "tasks-embed", content: "", items: [] }, trailingText()];
  }
  if (type === "goals") {
    return [{ id: genId("e"), type: "goals-embed", content: "", goals: [] }, trailingText()];
  }
  if (type === "calendar") {
    return [
      { id: genId("e"), type: "planner-embed", content: "", schedule: { tasks: [], dailyMeta: {} } },
      trailingText(),
    ];
  }
  return [trailingText()];
}

/** Converte un PageTemplate (galleria / onboarding) in template di tipo "empty". Idempotente. */
export function toEditablePageTemplate<T extends { type: string; data: any; title?: string; label?: string }>(tpl: T): T {
  if (!tpl || (tpl as any).type === "empty") return tpl;
  const label = (tpl as any).title ?? (tpl as any).label ?? "Nuova pagina";
  const blocksData = toEditableBlocks((tpl as any).type, (tpl as any).data, label);
  return { ...tpl, type: "empty", data: blocksData } as T;
}

/** Converte un quick-template di AddPageModal in payload pagina "empty" modificabile. Idempotente. */
export function toEditableQuickTemplate<T extends { type: string; initialData: any; label?: string }>(tpl: T): T & { sourceType: string } {
  if (!tpl || (tpl as any).type === "empty") return { ...(tpl as any), sourceType: (tpl as any).type } as any;
  const blocksData = toEditableBlocks((tpl as any).type, (tpl as any).initialData, (tpl as any).label ?? "Nuova pagina");
  return { ...(tpl as any), type: "empty", initialData: blocksData, sourceType: (tpl as any).type } as any;
}
