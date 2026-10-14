"use client";

import { apiFetch } from "./api";

/** Righe tabellari per entità (server o cache locale come fallback). */
export async function collectEntities(): Promise<Record<string, any[]>> {
  const out: Record<string, any[]> = { tasks: [], goals: [], ideas: [], pages: [] };
  try {
    const res = await apiFetch("/user/data");
    if (res.ok) {
      const data = await res.json();
      for (const k of Object.keys(out)) {
        if (Array.isArray(data?.[k])) out[k] = data[k];
      }
      if (out.tasks.length + out.goals.length + out.ideas.length + out.pages.length > 0) {
        return out;
      }
    }
  } catch {}
  // Fallback ospite/offline: chiavi locali note.
  const readKey = (k: string): any[] => {
    try {
      const raw = localStorage.getItem(k);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const localTasks = readKey("taskly_tasks_v1");
  out.tasks = localTasks.length > 0 ? localTasks : readKey("tasks");
  out.goals = readKey("goals");
  out.ideas = readKey("ideas");
  out.pages = readKey("taskly_pages_v1");
  return out;
}

/**
 * CSV con `;` (Excel IT) + virgolette sempre + BOM a parte.
 * Colonne = unione dei campi scalari; oggetti/array → JSON.
 */
export function toCSV(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const cols: string[] = [];
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    for (const k of Object.keys(r)) {
      if (!cols.includes(k)) cols.push(k);
    }
  }
  const cell = (v: unknown): string => {
    let s: string;
    if (v === null || v === undefined) s = "";
    else if (typeof v === "object") {
      try {
        s = JSON.stringify(v);
      } catch {
        s = String(v);
      }
    } else s = String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [
    cols.join(";"),
    ...rows.map((r) => cols.map((c) => cell(r?.[c])).join(";")),
  ].join("\r\n");
}

/** Download CSV con BOM (accenti corretti in Excel). */
export function downloadCSV(filename: string, rows: any[]): number {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  const blob = new Blob(["\uFEFF" + toCSV(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return rows.length;
}
