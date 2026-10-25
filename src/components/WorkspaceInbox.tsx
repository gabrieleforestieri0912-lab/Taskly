"use client";

/**
 * Inbox dello Spazio — aggregatore di segnali REALI dell'utenza:
 *
 * 1. Task (localStorage condiviso con "I miei task" e i task-embed):
 *    in ritardo / scadono oggi / prossimi 7 giorni.
 * 2. Cestino pagine: quante e quante ne restano prima della rimozione
 *    definitiva (retention 30 giorni).
 * 3. Notifiche server (menzioni nei workspace): giù e lettura via API,
 *    visibili solo se effettivamente presenti nel database.
 *
 * Nessun dato inventato: se non c'è niente da segnalare, l'Inbox lo dice.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  Clock3,
  ExternalLink,
  ListTodo,
  MailOpen,
  Trash2,
} from "lucide-react";
import { apiFetch } from "../lib/api";
import { useLanguage } from "../lib/LanguageContext";
import {
  formatDeadlineItalian,
  TASKS_STORAGE_KEY,
  type Task,
} from "../lib/taskModel";
import { TRASH_RETENTION_DAYS, trashStatus } from "../lib/trashUtils";

type InboxNotification = {
  _id: string;
  workspaceId?: string | null;
  title?: string | null;
  body?: string | null;
  read: boolean;
  meta?: {
    type?: string;
    entityType?: string;
    entityId?: string;
    commentId?: string;
  } | null;
  createdAt: string;
};

function notificationPath(item: InboxNotification): string | null {
  const workspaceId = item.workspaceId;
  const meta = item.meta;
  if (
    !workspaceId ||
    meta?.type !== "mention" ||
    !meta.entityType ||
    !meta.entityId
  ) {
    return null;
  }
  const comment = meta.commentId ? `&comment=${encodeURIComponent(meta.commentId)}` : "";
  if (meta.entityType === "task") {
    return `/workspace/${encodeURIComponent(workspaceId)}/board?task=${encodeURIComponent(meta.entityId)}${comment}${meta.commentId ? "#comments" : ""}`;
  }
  if (meta.entityType === "document") {
    return `/workspace/${encodeURIComponent(workspaceId)}/doc/${encodeURIComponent(meta.entityId)}${meta.commentId ? `?comment=${encodeURIComponent(meta.commentId)}#comments` : ""}`;
  }
  return null;
}

function responseError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error === "server_error"
  ) {
    return fallback;
  }
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }
  return fallback;
}

/** Task reali dal localStorage: niente fallback campione demo, se è vuoto è vuoto. */
function readLocalTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysUntil(deadline?: string): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - startOfToday().getTime()) / 86400000);
}

export default function WorkspaceInbox({
  pages = [],
}: {
  pages?: any[];
}) {
  const router = useRouter();
  const { t, tWith, language } = useLanguage();
  const [notifications, setNotifications] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  // Notifiche server (menzioni workspace): load-on-mount + riprova manuale.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/notifications");
      // Non autenticato (ospite): le notifiche server semplicemente non sono
      // disponibili, non è un errore da mostrare all'utente.
      if (response.status === 401) {
        setNotifications([]);
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(responseError(data, t("views.inbLoadFail")));
      }
      if (!Array.isArray(data)) {
        throw new Error(t("views.inbInvalidData"));
      }
      setNotifications(data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t("views.inbLoadFail"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Task reali: load al montaggio + refresh al ritorno sulla tab
  // (il storage cambia da "I miei task" e dai task-embed nelle pagine).
  useEffect(() => {
    const sync = () => setTasks(readLocalTasks());
    sync();
    const onVisible = () => {
      if (!document.hidden) sync();
    };
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("taskly-tasks-updated", sync);
    return () => {
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("taskly-tasks-updated", sync);
    };
  }, []);

  // ── Aggregazione reale ──────────────────────────────────────────────
  const overdue = useMemo(
    () =>
      tasks
        .filter(
          (tk) =>
            !tk.deleted &&
            tk.status !== "done" &&
            tk.deadline &&
            (daysUntil(tk.deadline) ?? Infinity) < 0,
        )
        .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline))),
    [tasks],
  );

  const dueToday = useMemo(
    () =>
      tasks.filter(
        (tk) =>
          !tk.deleted &&
          tk.status !== "done" &&
          (daysUntil(tk.deadline) ?? Infinity) === 0,
      ),
    [tasks],
  );

  const upcoming = useMemo(
    () =>
      tasks
        .filter(
          (tk) =>
            !tk.deleted &&
            tk.status !== "done" &&
            (daysUntil(tk.deadline) ?? 1) > 0 &&
            (daysUntil(tk.deadline) ?? 0) <= 7,
        )
        .sort((a, b) => String(a.deadline).localeCompare(String(b.deadline))),
    [tasks],
  );

  const trashPages = useMemo(
    () => (Array.isArray(pages) ? pages.filter((p) => p && p.deleted) : []),
    [pages],
  );
  const urgentTrash = trashPages.reduce((acc, p) => {
    const st = trashStatus(p.deletedAt);
    return st.daysLeft !== null && st.daysLeft <= 3 ? acc + 1 : acc;
  }, 0);

  const upNext = upcoming.slice(0, 5);
  const upNextExtra = upcoming.length - upNext.length;

  const projectNameOf = (tk: Task): string => {
    const page = (Array.isArray(pages) ? pages : []).find(
      (p) => p && String(p.id) === String(tk.project),
    );
    return tk.projectName || (page ? page.label : "") || "";
  };

  const goMyTasks = () => router.push("/dashboard?view=mytasks");
  const goTrash = () => router.push("/dashboard?trash=1");

  // ── Notifiche server: marcatura lettura + apertura ─────────────────
  const markRead = async (item: InboxNotification) => {
    if (item.read || busyId) return true;
    setBusyId(item._id);
    setError("");
    try {
      const response = await apiFetch(
        `/notifications/${encodeURIComponent(item._id)}/read`,
        { method: "PUT" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(responseError(data, t("views.inbUpdateFail")));
      }
      setNotifications((current) =>
        current.map((n) =>
          n._id === item._id ? { ...n, read: true } : n,
        ),
      );
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : t("views.inbUpdateFail"),
      );
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const openNotification = async (item: InboxNotification) => {
    const path = notificationPath(item);
    if (!path) return;
    if (!(await markRead(item))) return;
    router.push(path);
  };

  const hasServerNotifications = notifications.length > 0;
  const yesignalCount =
    overdue.length + dueToday.length + upcoming.length + trashPages.length;
  const totallyEmpty =
    !hasServerNotifications && !loading && yesignalCount === 0;

  const sectionTitle = (icon: ReactNode, text: string, tone: string) => (
    <p className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${tone}`}>
      {icon}
      {text}
    </p>
  );

  const taskRow = (tk: Task) => {
    const fmt = formatDeadlineItalian(tk.deadline);
    return (
      <button
        key={tk.id}
        type="button"
        onClick={goMyTasks}
        className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            fmt.isOverdue
              ? "bg-red-500"
              : fmt.isToday
                ? "bg-amber-500"
                : "bg-gray-300 dark:bg-gray-600"
          }`}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
          {tk.title}
        </span>
        {projectNameOf(tk) && (
          <span className="hidden shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 sm:inline dark:bg-gray-800 dark:text-gray-400">
            {projectNameOf(tk)}
          </span>
        )}
        <span
          className={`shrink-0 text-[11px] font-black ${
            fmt.isOverdue
              ? "text-red-500"
              : fmt.isToday
                ? "text-amber-500"
                : "text-gray-400"
          }`}
        >
          {fmt.formatted}
        </span>
        <ArrowRight
          size={13}
          className="shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500"
        />
      </button>
    );
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          <Bell size={20} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{t("nav.inbox", "Inbox")}</h1>
          <p className="text-sm text-gray-500">
            {t("views.inbSubtitle")}
          </p>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <p>{error}</p>
          <button type="button" onClick={() => void load()} className="font-semibold underline">
            {t("views.inbRetry")}
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">{t("views.inbLoading")}</p>
      ) : totallyEmpty ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-800">
          <MailOpen className="mx-auto mb-3 text-gray-400" size={28} aria-hidden="true" />
          <h2 className="font-semibold">{t("views.inbEmptyT")}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("views.inbEmptyD")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Task in ritardo */}
          {overdue.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
              {sectionTitle(
                <AlertTriangle size={13} aria-hidden="true" />,
                tWith("views.inbOverdue", { n: overdue.length }),
                "text-red-600 dark:text-red-400",
              )}
              <div className="mt-2">
                {overdue.slice(0, 8).map(taskRow)}
                {overdue.length > 8 && (
                  <p className="mt-1 px-2 text-xs text-gray-500">
                    {tWith("views.inbMore", { n: overdue.length - 8 })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Scadono oggi */}
          {dueToday.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              {sectionTitle(
                <Clock3 size={13} aria-hidden="true" />,
                tWith("views.inbToday", { n: dueToday.length }),
                "text-amber-600 dark:text-amber-400",
              )}
              <div className="mt-2">{dueToday.slice(0, 8).map(taskRow)}</div>
            </div>
          )}

          {/* Prossimi 7 giorni */}
          {upcoming.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
              {sectionTitle(
                <ListTodo size={13} aria-hidden="true" />,
                tWith("views.inbNext7", { n: upcoming.length }),
                "text-gray-500 dark:text-gray-300",
              )}
              <div className="mt-2">
                {upNext.map(taskRow)}
                {upNextExtra > 0 && (
                  <p className="mt-1 px-2 text-xs text-gray-500">
                    {tWith("views.inbMoreMyTasks", { n: upNextExtra })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cestino pagine */}
          {trashPages.length > 0 && (
            <button
              type="button"
              onClick={goTrash}
              className={`w-full rounded-2xl border p-4 text-left ${
                urgentTrash > 0
                  ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20"
                  : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              }`}
            >
              {sectionTitle(
                <Trash2 size={13} aria-hidden="true" />,
                tWith("views.inbTrash", { n: trashPages.length }),
                urgentTrash > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-300",
              )}
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {tWith(
                  trashPages.length === 1 ? "views.inbTrashDesc1" : "views.inbTrashDescN",
                  { n: trashPages.length, days: TRASH_RETENTION_DAYS },
                )}
                {urgentTrash > 0 && (
                  <strong className="text-red-600 dark:text-red-400">
                    {" "}
                    · {tWith("views.inbAtRisk", { n: urgentTrash })}
                  </strong>
                )}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-(--accent) dark:text-(--accent-300)">
                {t("views.inbOpenTrash")}
                <ArrowRight size={12} />
              </p>
            </button>
          )}

          {/* Notifiche server (menzioni nei workspace) */}
          {hasServerNotifications && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              <p className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-violet-600 dark:border-gray-800 dark:text-violet-300">
                <Bell size={13} aria-hidden="true" />
                {t("views.inbMentions")}
              </p>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {notifications.map((item) => {
                  const path = notificationPath(item);
                  return (
                    <article
                      key={item._id}
                      className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                        item.read ? "" : "bg-violet-50/60 dark:bg-violet-950/20"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!item.read && (
                            <span
                              aria-label={t("views.inbUnreadDot")}
                              className="h-2 w-2 shrink-0 rounded-full bg-violet-600"
                            />
                          )}
                          <h2 className="truncate text-sm font-semibold">
                            {item.title || t("views.inbFallbackNotif")}
                          </h2>
                        </div>
                        {item.body && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                            {item.body}
                          </p>
                        )}
                        <time dateTime={item.createdAt} className="mt-1 block text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString(language === "en" ? "en-US" : "it-IT")}
                        </time>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {path && (
                          <button
                            type="button"
                            onClick={() => void openNotification(item)}
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <ExternalLink size={13} aria-hidden="true" />
                            {t("views.inbOpen")}
                          </button>
                        )}
                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => void markRead(item)}
                            disabled={busyId !== null}
                            aria-label={tWith("views.inbMarkReadAria", {
                              title: item.title || t("views.inbFallbackNotif").toLowerCase(),
                            })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-900"
                          >
                            {busyId === item._id ? (
                              <MailOpen size={13} aria-hidden="true" />
                            ) : (
                              <Check size={13} aria-hidden="true" />
                            )}
                            {t("views.inbMarkRead")}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
