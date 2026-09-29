"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getSocket } from "../lib/socket";

type BoardTask = {
  _id?: string;
  id?: string | number;
  title?: string;
  status?: string;
  updatedAt?: string;
};

type TaskBoardProps = {
  workspace?: string;
  /** Members that can edit; viewers get a read-only board. */
  canEdit?: boolean;
};

const COLUMNS = ["todo", "inprogress", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  todo: "Da fare",
  inprogress: "In corso",
  done: "Completati",
};

export default function TaskBoard({
  workspace,
  canEdit = true,
}: TaskBoardProps): React.JSX.Element {
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!workspace) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/tasks?workspace=${encodeURIComponent(workspace)}`);
      if (!res.ok) {
        setError(
          res.status === 403 ? "Non hai accesso a questo workspace." : "Impossibile caricare i task.",
        );
        return;
      }
      const json: unknown = await res.json();
      setTasks(Array.isArray(json) ? (json as BoardTask[]) : []);
    } catch {
      setError("Errore di rete.");
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live collaboration: refresh when another member mutates a task.
  useEffect(() => {
    if (!workspace) return;
    let socket: ReturnType<typeof getSocket> | null = null;
    try {
      socket = getSocket();
    } catch {
      socket = null;
    }
    if (!socket) return;
    const onChanged = (payload: { workspaceId?: string }) => {
      if (payload?.workspaceId && payload.workspaceId !== workspace) return;
      void load();
    };
    socket.on("workspace-tasks-changed", onChanged);
    return () => {
      socket?.off("workspace-tasks-changed", onChanged);
    };
  }, [workspace, load]);

  const byStatus = useMemo(() => {
    const map: Record<string, BoardTask[]> = { todo: [], inprogress: [], done: [] };
    for (const t of tasks) {
      const key = (t?.status || "todo") as string;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black">Tasks</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[10px] uppercase tracking-widest text-gray-400">Aggiornamento...</span>
          )}
          <button
            onClick={() => void load()}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Ricarica
          </button>
        </div>
      </div>

      {!canEdit && (
        <p className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
          Sei un osservatore: puo leggere la board ma non modificarla.
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {COLUMNS.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3 min-h-24 bg-white dark:bg-gray-900"
          >
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              {STATUS_LABELS[status]} ({byStatus[status]?.length ?? 0})
            </h4>
            {(byStatus[status] ?? []).map((t) => (
              <div
                key={String(t._id ?? t.id ?? t.title)}
                className="py-1.5 text-sm border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0"
              >
                {t.title || "Task senza titolo"}
              </div>
            ))}
            {(byStatus[status]?.length ?? 0) === 0 && (
              <p className="text-xs text-gray-400 italic">Nessun task</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
