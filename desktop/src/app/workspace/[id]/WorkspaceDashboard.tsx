"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  GripVertical,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";

export type WorkspaceWidgetId =
  | "overview"
  | "board-link"
  | "doc-link"
  | "tasks"
  | "notes"
  | "activity";

export type WorkspaceWidget = {
  id: WorkspaceWidgetId;
  title: string;
  description: string;
};

export const DEFAULT_WORKSPACE_WIDGETS: WorkspaceWidget[] = [
  { id: "overview", title: "Panoramica", description: "Stato workspace e scorciatoie" },
  { id: "board-link", title: "Board attivita", description: "Apri il kanban del workspace" },
  { id: "doc-link", title: "Documento home", description: "Apri il documento principale" },
  { id: "tasks", title: "Task recenti", description: "Ultimi task del workspace" },
  { id: "notes", title: "Note", description: "Estratto note collegate" },
  { id: "activity", title: "Attivita AI", description: "Suggerimenti e stato assistente" },
];

type TaskItem = { _id?: string; id?: string | number; title?: string; status?: string };
type NoteItem = { _id?: string; id?: string | number; title?: string; updatedAt?: string };

type WorkspaceDashboardProps = {
  workspaceId?: string;
  tasks?: TaskItem[];
  notes?: NoteItem[];
};

function storageKey(workspaceId: string): string {
  return `taskly_workspace_dashboard_${workspaceId || "global"}`;
}

function normalizeOrder(ids: string[]): WorkspaceWidget[] {
  const byId = new Map(DEFAULT_WORKSPACE_WIDGETS.map((w) => [w.id, w]));
  const seen = new Set<string>();
  const out: WorkspaceWidget[] = [];
  for (const id of ids) {
    const w = byId.get(id as WorkspaceWidgetId);
    if (w && !seen.has(id)) {
      seen.add(id);
      out.push(w);
    }
  }
  for (const w of DEFAULT_WORKSPACE_WIDGETS) {
    if (!seen.has(w.id)) out.push(w);
  }
  return out;
}
export default function WorkspaceDashboard({
  workspaceId: propId,
  tasks = [],
  notes = [],
}: WorkspaceDashboardProps): React.JSX.Element {
  const params = useParams<{ id?: string | string[] }>();
  const raw = propId ?? params?.id;
  const workspaceId = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
  const [order, setOrder] = useState<WorkspaceWidget[]>(DEFAULT_WORKSPACE_WIDGETS);
  const [dragId, setDragId] = useState<WorkspaceWidgetId | null>(null);
  const [overId, setOverId] = useState<WorkspaceWidgetId | null>(null);

  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem(storageKey(workspaceId));
      if (!rawSaved) {
        setOrder(DEFAULT_WORKSPACE_WIDGETS);
        return;
      }
      const parsed: unknown = JSON.parse(rawSaved);
      if (Array.isArray(parsed)) {
        setOrder(normalizeOrder(parsed.map(String)));
      }
    } catch { /* ignore */ }
  }, [workspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(workspaceId), JSON.stringify(order.map((w) => w.id)));
    } catch { /* ignore */ }
  }, [order, workspaceId]);

  const reset = useCallback((): void => {
    setOrder(DEFAULT_WORKSPACE_WIDGETS);
  }, []);

  const onDragStart = useCallback(
    (id: WorkspaceWidgetId) => (e: React.DragEvent<HTMLElement>): void => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    },
    [],
  );

  const onDragOver = useCallback(
    (id: WorkspaceWidgetId) => (e: React.DragEvent<HTMLElement>): void => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (id !== overId) setOverId(id);
    },
    [overId],
  );

  const onDrop = useCallback(
    (targetId: WorkspaceWidgetId) => (e: React.DragEvent<HTMLElement>): void => {
      e.preventDefault();
      const sourceId = (e.dataTransfer.getData("text/plain") as WorkspaceWidgetId) || dragId;
      setOverId(null);
      setDragId(null);
      if (!sourceId || sourceId === targetId) return;
      setOrder((prev) => {
        const from = prev.findIndex((w) => w.id === sourceId);
        const to = prev.findIndex((w) => w.id === targetId);
        if (from < 0 || to < 0) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        if (moved) next.splice(to, 0, moved);
        return next;
      });
    },
    [dragId],
  );

  const recentTasks = useMemo(() => (Array.isArray(tasks) ? tasks.slice(0, 5) : []), [tasks]);
  const recentNotes = useMemo(() => (Array.isArray(notes) ? notes.slice(0, 4) : []), [notes]);
  const renderBody = (id: WorkspaceWidgetId): React.JSX.Element => {
    if (id === "board-link") {
      return (
        <Link href={`/workspace/${workspaceId}/board`} className="flex items-center justify-between rounded-xl bg-purple-600 px-4 py-3 text-white hover:bg-purple-700">
          <span className="font-bold">Apri board</span>
          <ArrowRight size={16} />
        </Link>
      );
    }
    if (id === "doc-link") {
      return (
        <Link href={`/workspace/${workspaceId}/doc/home`} className="flex items-center justify-between rounded-xl border px-4 py-3 font-bold hover:border-purple-300">
          <span className="flex items-center gap-2"><FileText size={16} /> Documento home</span>
          <ArrowRight size={16} />
        </Link>
      );
    }
    if (id === "tasks") {
      if (!recentTasks.length) return <p className="text-xs text-gray-400 italic">Nessun task. La board e pronta.</p>;
      return (
        <ul className="space-y-2">
          {recentTasks.map((t, i) => (
            <li key={String(t._id ?? t.id ?? i)} className="flex items-center gap-2 text-sm">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="truncate">{t.title ?? "Task senza titolo"}</span>
            </li>
          ))}
        </ul>
      );
    }
    if (id === "notes") {
      if (!recentNotes.length) return <p className="text-xs text-gray-400 italic">Nessuna nota recente.</p>;
      return (
        <ul className="space-y-2">
          {recentNotes.map((n, i) => (
            <li key={String(n._id ?? n.id ?? i)} className="text-sm truncate">{n.title ?? "Nota"}</li>
          ))}
        </ul>
      );
    }
    if (id === "activity") {
      return <p className="text-xs text-gray-500">La minichat AI vive nelle pagine Board e Doc, non qui in dashboard.</p>;
    }
    return (
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
          <CalendarDays size={16} className="mx-auto mb-1 text-purple-500" />
          <p className="text-[10px] font-bold uppercase">Board</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
          <Target size={16} className="mx-auto mb-1 text-emerald-500" />
          <p className="text-[10px] font-bold uppercase">Doc</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900 p-3">
          <Lightbulb size={16} className="mx-auto mb-1 text-amber-500" />
          <p className="text-[10px] font-bold uppercase">AI</p>
        </div>
      </div>
    );
  };
  return (
    <section aria-label="Dashboard workspace customizzabile">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" /> Dashboard workspace
          </h3>
          <p className="text-xs text-gray-500">Trascina i widget per riordinarli. Layout salvato per workspace.</p>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
          <RotateCcw size={13} /> Reset
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {order.map((w) => (
          <article
            key={w.id}
            draggable
            onDragStart={onDragStart(w.id)}
            onDragOver={onDragOver(w.id)}
            onDrop={onDrop(w.id)}
            onDragEnd={() => { setDragId(null); setOverId(null); }}
            aria-grabbed={dragId === w.id}
            className={`rounded-2xl border bg-white dark:bg-gray-900 p-4 shadow-sm transition ${dragId === w.id ? "opacity-50" : ""} ${overId === w.id ? "ring-2 ring-purple-400" : "border-gray-200 dark:border-gray-800"}`}
          >
            <header className="mb-3 flex items-center justify-between cursor-grab active:cursor-grabbing">
              <div>
                <h4 className="text-sm font-black">{w.title}</h4>
                <p className="text-[11px] text-gray-400">{w.description}</p>
              </div>
              <GripVertical size={16} className="text-gray-300" />
            </header>
            {renderBody(w.id)}
          </article>
        ))}
      </div>
    </section>
  );
}
