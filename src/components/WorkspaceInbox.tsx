"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink, MailOpen } from "lucide-react";
import { apiFetch } from "../lib/api";

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

export default function WorkspaceInbox() {
  const router = useRouter();
  const [items, setItems] = useState<InboxNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch("/notifications");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(responseError(data, "Impossibile caricare l'Inbox."));
      }
      if (!Array.isArray(data)) {
        throw new Error("Il servizio ha restituito notifiche non valide.");
      }
      setItems(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile caricare l'Inbox.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
        throw new Error(responseError(data, "Impossibile aggiornare la notifica."));
      }
      setItems((current) =>
        current.map((notification) =>
          notification._id === item._id ? { ...notification, read: true } : notification,
        ),
      );
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile aggiornare la notifica.");
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

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="rounded-xl bg-violet-100 p-2.5 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
          <Bell size={20} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-gray-500">
            Qui trovi le notifiche quando un membro ti menziona in un workspace.
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <p>{error}</p>
          <button type="button" onClick={() => void load()} className="font-semibold underline">
            Riprova
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">Caricamento Inbox…</p>
      ) : items.length ? (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950">
          {items.map((item) => {
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
                    {!item.read && <span aria-label="Non letta" className="h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                    <h2 className="truncate text-sm font-semibold">{item.title || "Notifica"}</h2>
                  </div>
                  {item.body && <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{item.body}</p>}
                  <time dateTime={item.createdAt} className="mt-1 block text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString("it-IT")}
                  </time>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {path && (
                    <button
                      type="button"
                      onClick={() => void openNotification(item)}
                      disabled={busyId !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#7b39fc] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      <ExternalLink size={13} aria-hidden="true" />
                      Apri
                    </button>
                  )}
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => void markRead(item)}
                      disabled={busyId !== null}
                      aria-label={`Segna come letta: ${item.title || "notifica"}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-900"
                    >
                      {busyId === item._id ? <MailOpen size={13} aria-hidden="true" /> : <Check size={13} aria-hidden="true" />}
                      Segna come letta
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-800">
          <MailOpen className="mx-auto mb-3 text-gray-400" size={28} aria-hidden="true" />
          <h2 className="font-semibold">La tua Inbox è vuota</h2>
          <p className="mt-1 text-sm text-gray-500">
            Le menzioni ricevute nei commenti o nei documenti workspace compariranno qui.
          </p>
        </div>
      )}
    </section>
  );
}
