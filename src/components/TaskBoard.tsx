"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLanguage } from "../lib/LanguageContext";
import { apiFetch } from "../lib/api";
import { MessageSquare } from "lucide-react";
import WorkspaceComments from "./WorkspaceComments";

type TaskStatus = "todo" | "in_progress" | "done";

type WorkspaceTask = {
  _id: string;
  title: string;
  status: TaskStatus;
};

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}

function isWorkspaceTask(value: unknown): value is WorkspaceTask {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    typeof value._id === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "status" in value &&
    isTaskStatus(value.status)
  );
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "Da fare" },
  { status: "in_progress", label: "In corso" },
  { status: "done", label: "Completato" },
];

export default function TaskBoard({ workspace }: { workspace: string }) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [workspaceRole, setWorkspaceRole] = useState<string | null>(null);
  const [openCommentsTaskId, setOpenCommentsTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    setWorkspaceRole(null);
    setError("");
    try {
      const [response, membersResponse] = await Promise.all([
        apiFetch(`/tasks?workspace=${encodeURIComponent(workspace)}&limit=100`),
        apiFetch(`/workspaces/${encodeURIComponent(workspace)}/members`),
      ]);
      const [data, membersData] = await Promise.all([
        response.json(),
        membersResponse.json(),
      ]);
      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            (response.status === 401
              ? "Accedi per visualizzare i task del workspace."
              : "Impossibile caricare i task del workspace."),
        );
      }
      if (!membersResponse.ok || typeof membersData?.role !== "string") {
        throw new Error("Impossibile verificare i permessi del workspace.");
      }
      if (!Array.isArray(data) || !data.every(isWorkspaceTask)) {
        throw new Error("Il servizio ha restituito un elenco di task non valido.");
      }
      setTasks(data);
      setWorkspaceRole(membersData.role);
      const requestedTask = new URLSearchParams(window.location.search).get("task");
      if (requestedTask && data.some((task: WorkspaceTask) => task._id === requestedTask)) {
        setOpenCommentsTaskId(requestedTask);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossibile caricare i task del workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  const canEdit = Boolean(workspaceRole && workspaceRole !== "viewer");

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const taskTitle = title.trim();
    if (!taskTitle || saving) return;

    setSaving(true);
    setError("");
    try {
      const response = await apiFetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace,
          title: taskTitle,
          status: "todo",
        }),
      });
      const createdTask = await response.json();
      if (!response.ok) {
        throw new Error(
          createdTask?.message ||
            (response.status === 401
              ? "Accedi per creare un task nel workspace."
              : "Impossibile creare il task."),
        );
      }
      if (!isWorkspaceTask(createdTask)) {
        throw new Error("Il servizio ha restituito un task non valido.");
      }
      setTasks((current) => [createdTask, ...current]);
      setTitle("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Impossibile creare il task.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (task: WorkspaceTask, status: TaskStatus) => {
    if (status === task.status || updatingTaskId) return;
    setUpdatingTaskId(task._id);
    setError("");
    try {
      const response = await apiFetch(`/tasks/${encodeURIComponent(task._id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updatedTask = await response.json();
      if (!response.ok) {
        throw new Error(updatedTask?.message || "Impossibile aggiornare il task.");
      }
      if (!isWorkspaceTask(updatedTask)) {
        throw new Error("Il servizio ha restituito un task non valido.");
      }
      setTasks((current) =>
        current.map((item) => (item._id === task._id ? updatedTask : item)),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Impossibile aggiornare il task.",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold">{t("misc.tasks")}</h3>

      {canEdit && (
      <form onSubmit={createTask} className="flex gap-2">
        <label className="sr-only" htmlFor="workspace-task-title">
          Titolo del task
        </label>
        <input
          id="workspace-task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Aggiungi un task al workspace"
          maxLength={200}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
        />
        <button
          type="submit"
          disabled={!title.trim() || saving}
          className="rounded-xl bg-[#7b39fc] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Aggiungi"}
        </button>
      </form>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadTasks()}
            className="shrink-0 font-semibold underline"
          >
            Riprova
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Caricamento task…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map(({ status, label }) => {
            const columnTasks = tasks.filter((task) => task.status === status);
            return (
              <section
                key={status}
                aria-labelledby={`workspace-column-${status}`}
                className="min-h-40 rounded-2xl border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <h4
                  id={`workspace-column-${status}`}
                  className="mb-3 flex items-center justify-between text-sm font-bold"
                >
                  {label}
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-800">
                    {columnTasks.length}
                  </span>
                </h4>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <article
                      key={task._id}
                      className="rounded-xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-gray-950"
                    >
                      <p className="break-words font-medium">{task.title}</p>
                      {canEdit && <label className="mt-3 block">
                        <span className="sr-only">Stato di {task.title}</span>
                        <select
                          value={task.status}
                          disabled={updatingTaskId === task._id}
                          onChange={(event) =>
                            isTaskStatus(event.target.value) &&
                            void updateTaskStatus(task, event.target.value)
                          }
                          className="w-full rounded-lg border border-gray-200 bg-transparent px-2 py-1.5 text-xs dark:border-gray-800"
                        >
                          {COLUMNS.map((column) => (
                            <option key={column.status} value={column.status}>
                              {column.label}
                            </option>
                          ))}
                        </select>
                      </label>}
                      <button
                        type="button"
                        aria-expanded={openCommentsTaskId === task._id}
                        onClick={() =>
                          setOpenCommentsTaskId((current) =>
                            current === task._id ? null : task._id,
                          )
                        }
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-violet-700 hover:underline dark:text-violet-300"
                      >
                        <MessageSquare size={14} aria-hidden="true" />
                        Commenti
                      </button>
                      {openCommentsTaskId === task._id && (
                        <WorkspaceComments
                          workspaceId={workspace}
                          entityType="task"
                          entityId={task._id}
                        />
                      )}
                    </article>
                  ))}
                  {!columnTasks.length && (
                    <p className="py-3 text-center text-xs text-gray-500">
                      Nessun task
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
