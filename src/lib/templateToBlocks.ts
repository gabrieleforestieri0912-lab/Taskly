/**
 * templateToBlocks.ts
 * -------------------
 * Converte template / progetti strutturati (tasks, goals, calendar, notes)
 * in blocchi liberi modificabili come la "Pagina Vuota" (EmptyPageView /
 * NotesView a blocchi). Così l'utente parte da un contenuto già pronto ma
 * può aggiungere, spostare, colorare e cancellare ogni blocco liberamente.
 */

function genId(prefix = "b"): string {
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return `${prefix}_${(crypto as any).randomUUID().slice(0, 8)}`;
    }
  } catch {}
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function statusLabel(status?: string): string {
  if (status === "done") return "Completato";
  if (status === "doing") return "In corso";
  return "Da fare";
}

function taskBlocksFromItems(label: string, items: any[]): any[] {
  const blocks: any[] = [];
  blocks.push({ id: genId("h"), type: "h1", content: label || "Progetto" });
  blocks.push({
    id: genId("t"),
    type: "text",
    content: "Parti da questa base già pronta e modificala liberamente: aggiungi, sposta o elimina blocchi come in una pagina vuota.",
  });
  if (!Array.isArray(items) || items.length === 0) {
    blocks.push({ id: genId("h"), type: "h2", content: "✅ Da fare" });
    blocks.push({ id: genId("c"), type: "checkbox", content: "Primo task da definire", checked: false });
    return blocks;
  }
  const groups: Record<string, any[]> = { todo: [], doing: [], done: [] };
  for (const it of items) {
    const s = it?.status === "done" ? "done" : it?.status === "doing" ? "doing" : "todo";
    groups[s].push(it);
  }
  const sections: Array<[string, string]> = [
    ["todo", "📋 Da fare"],
    ["doing", "🚧 In corso"],
    ["done", "✅ Completati"],
  ];
  for (const [key, heading] of sections) {
    const list = groups[key];
    if (list.length === 0) continue;
    blocks.push({ id: genId("h"), type: "h2", content: heading });
    for (const it of list) {
      const title = String(it?.title ?? "Attività senza titolo");
      const meta: string[] = [];
      if (it?.priority) meta.push(`Priorità ${it.priority}`);
      if (it?.deadline) {
        try {
          meta.push(`Scadenza ${new Date(it.deadline).toLocaleDateString("it-IT")}`);
        } catch {
          meta.push(`Scadenza ${it.deadline}`);
        }
      }
      if (it?.assignee) meta.push(`${it.assignee}`);
      const content = meta.length > 0 ? `${title} — ${meta.join(" · ")}` : title;
      blocks.push({
        id: genId("c"),
        type: "checkbox",
        content,
        checked: key === "done",
      });
      const subs = Array.isArray(it?.subtasks) ? it.subtasks : Array.isArray(it?.subGoals) ? it.subGoals : [];
      for (const s of subs) {
        const st = typeof s === "string" ? s : String(s?.title ?? "");
        if (!st.trim()) continue;
        const done = typeof s === "object" ? Boolean(s?.done ?? s?.completed) : false;
        blocks.push({ id: genId("c"), type: "checkbox", content: `↳ ${st}`, checked: done });
      }
    }
  }
  blocks.push({ id: genId("d"), type: "divider", content: "" });
  blocks.push({ id: genId("t"), type: "text", content: "💡 Suggerimento: digita / per aggiungere task calendar, habit tracker, toggle, video e molto altro." });
  return blocks;
}

function goalsToBlocks(label: string, goals: any[]): any[] {
  const blocks: any[] = [];
  blocks.push({ id: genId("h"), type: "h1", content: label || "Obiettivi" });
  blocks.push({
    id: genId("t"),
    type: "text",
    content: "Obiettivi già strutturati e completamente modificabili: rinomina, spuntali o aggiungi nuovi blocchi.",
  });
  const walk = (nodes: any[], depth: number) => {
    for (const g of nodes || []) {
      const title = String(g?.title ?? "Obiettivo senza titolo");
      const done = Boolean(g?.completed ?? g?.done);
      if (depth === 0) {
        blocks.push({ id: genId("h"), type: "h2", content: `🎯 ${title}` });
        if (!g?.subGoals?.length) {
          blocks.push({ id: genId("c"), type: "checkbox", content: title, checked: done });
        }
      } else {
        blocks.push({ id: genId("c"), type: "checkbox", content: `${"↳ ".repeat(Math.min(depth, 2))}${title}`, checked: done });
      }
      if (Array.isArray(g?.subGoals) && g.subGoals.length > 0) walk(g.subGoals, depth + 1);
    }
  };
  if (!Array.isArray(goals) || goals.length === 0) {
    blocks.push({ id: genId("h"), type: "h2", content: "🎯 Primo obiettivo" });
    blocks.push({ id: genId("c"), type: "checkbox", content: "Definisci il risultato che vuoi raggiungere", checked: false });
  } else {
    walk(goals, 0);
  }
  blocks.push({ id: genId("d"), type: "divider", content: "" });
  blocks.push({ id: genId("t"), type: "text", content: "💡 Suggerimento: digita / per aggiungere nuovi tipi di blocco." });
  return blocks;
}

function calendarToBlocks(label: string, data: any): any[] {
  const blocks: any[] = [];
  blocks.push({ id: genId("h"), type: "h1", content: label || "Pianificazione" });
  blocks.push({
    id: genId("t"),
    type: "text",
    content: "Pianificazione settimanale pronta e modificabile come una pagina vuota.",
  });
  blocks.push({ id: genId("h"), type: "h2", content: "📅 Questa settimana" });
  // Blocco calendar interattivo supportato da NotesView/EmptyPageView
  blocks.push({ id: genId("cal"), type: "calendar", content: "", tasks: [] });
  const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
  for (const t of tasks.slice(0, 10)) {
    const title = typeof t === "string" ? t : String(t?.title ?? "");
    if (!title.trim()) continue;
    blocks.push({ id: genId("c"), type: "checkbox", content: title, checked: Boolean((t as any)?.done) });
  }
  if (tasks.length === 0) {
    for (const day of ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"]) {
      blocks.push({ id: genId("h"), type: "h3", content: day });
      blocks.push({ id: genId("c"), type: "checkbox", content: "Attività da pianificare", checked: false });
    }
  }
  return blocks;
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
    // Etichette "Chiave: valore" (Data:, Partecipanti:) -> testo semplice
    blocks.push({ id: genId("t"), type: line.startsWith("**") || line.length < 80 ? "text" : "text", content: line });
  }
  if (blocks.length === 0) blocks.push({ id: genId("t"), type: "text", content: "" });
  return blocks;
}

/** Converte qualsiasi initialData strutturato in { blocks, tags } modificabile. */
export function toEditableBlocks(sourceType: string, initialData: any, label: string): { blocks: any[]; tags: string[] } {
  try {
    // Già a blocchi (template notes / pagina vuota): riusa e rigenera gli id
    if (initialData && typeof initialData === "object" && Array.isArray((initialData as any).blocks)) {
      const cloned = JSON.parse(JSON.stringify(initialData));
      cloned.blocks = (cloned.blocks as any[]).map((b: any) => ({ ...b, id: genId("b") }));
      if (!Array.isArray(cloned.blocks) || cloned.blocks.length === 0) {
        cloned.blocks = [{ id: genId("t"), type: "text", content: "" }];
      }
      return { blocks: cloned.blocks, tags: Array.isArray(cloned.tags) ? cloned.tags : [] };
    }
    // Lista task / progetto (array)
    if (Array.isArray(initialData)) {
      // Distingue goals (hanno subGoals/level) da tasks
      const looksLikeGoals = initialData.some((g: any) => g && (Array.isArray(g.subGoals) || typeof g.level === "number"));
      if (looksLikeGoals || sourceType === "goals") {
        return { blocks: goalsToBlocks(label, initialData), tags: [] };
      }
      return { blocks: taskBlocksFromItems(label, initialData), tags: [] };
    }
    // Planner / calendario
    if (initialData && typeof initialData === "object" && (Array.isArray((initialData as any).tasks) || (initialData as any).dailyMeta)) {
      return { blocks: calendarToBlocks(label, initialData), tags: [] };
    }
    // Note testuali classiche { text, tags }
    if (initialData && typeof initialData === "object" && typeof (initialData as any).text === "string") {
      const tags = Array.isArray((initialData as any).tags) ? (initialData as any).tags : [];
      return { blocks: markdownTextToBlocks((initialData as any).text), tags };
    }
    if (typeof initialData === "string") {
      return { blocks: markdownTextToBlocks(initialData), tags: [] };
    }
  } catch {}
  return { blocks: [{ id: genId("h"), type: "h1", content: label || "Nuova pagina" }, { id: genId("t"), type: "text", content: "" }], tags: [] };
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

export { statusLabel };
