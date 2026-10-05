"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MessageSquare, Send, UserRound } from "lucide-react";
import { apiFetch } from "../lib/api";

type WorkspaceComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  mentions: string[];
};

type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type MembersResponse = {
  currentUserId: string;
  role: string;
  members: WorkspaceMember[];
};

function messageFromError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    if (data.error === "workspace_read_only") {
      return "Hai accesso in sola lettura a questo workspace.";
    }
    if (data.error === "invalid_workspace_mention") {
      return "Puoi menzionare solo membri di questo workspace.";
    }
    return fallback;
  }
  return fallback;
}

export default function WorkspaceComments({
  workspaceId,
  entityType,
  entityId,
}: {
  workspaceId: string;
  entityType: "task" | "document";
  entityId: string;
}) {
  const [comments, setComments] = useState<WorkspaceComment[]>([]);
  const [members, setMembers] = useState<MembersResponse | null>(null);
  const [body, setBody] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ entityType, entityId });
      const [commentsResponse, membersResponse] = await Promise.all([
        apiFetch(`/workspaces/${encodeURIComponent(workspaceId)}/comments?${query}`),
        apiFetch(`/workspaces/${encodeURIComponent(workspaceId)}/members`),
      ]);
      const [commentsData, membersData] = await Promise.all([
        commentsResponse.json(),
        membersResponse.json(),
      ]);
      if (!commentsResponse.ok) {
        throw new Error(messageFromError(commentsData, "Impossibile caricare i commenti."));
      }
      if (!membersResponse.ok) {
        throw new Error(messageFromError(membersData, "Impossibile caricare i membri."));
      }
      if (
        !Array.isArray(commentsData) ||
        !membersData ||
        typeof membersData !== "object" ||
        !Array.isArray(membersData.members)
      ) {
        throw new Error("Il servizio ha restituito dati non validi.");
      }
      setComments(commentsData);
      setMembers(membersData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile caricare i commenti.");
    } finally {
      setLoading(false);
    }
  }, [entityId, entityType, workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loading || typeof window === "undefined") return;
    const commentId = new URLSearchParams(window.location.search).get("comment");
    if (!commentId) return;
    document.getElementById(`workspace-comment-${commentId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [comments, loading]);

  const addMention = () => {
    const member = members?.members.find((item) => item.id === selectedMemberId);
    if (!member || mentionIds.includes(member.id)) return;
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const prefix = body.slice(0, start);
    const leadingSpace = prefix && !/\s$/.test(prefix) ? " " : "";
    const token = `${leadingSpace}@${member.name}`;
    const nextBody = `${prefix}${token} ${body.slice(end)}`;
    setBody(nextBody);
    setMentionIds((current) => [...current, member.id]);
    setSelectedMemberId("");
    requestAnimationFrame(() => {
      textarea?.focus();
      const position = start + token.length + 1;
      textarea?.setSelectionRange(position, position);
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch(
        `/workspaces/${encodeURIComponent(workspaceId)}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityType, entityId, body: text, mentions: mentionIds }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(messageFromError(data, "Impossibile pubblicare il commento."));
      }
      if (!data || typeof data.id !== "string") {
        throw new Error("Il servizio ha restituito un commento non valido.");
      }
      setComments((current) => [...current, data]);
      setBody("");
      setMentionIds([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile pubblicare il commento.");
    } finally {
      setSaving(false);
    }
  };

  const canComment = Boolean(members && members.role !== "viewer");
  const mentionableMembers = (members?.members || []).filter(
    (member) =>
      member.id !== members?.currentUserId && !mentionIds.includes(member.id),
  );

  return (
    <section
      id="comments"
      aria-label="Commenti del workspace"
      className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40"
    >
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <MessageSquare size={15} aria-hidden="true" />
        Commenti {comments.length > 0 && <span>({comments.length})</span>}
      </h4>

      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-2 text-xs text-gray-500">Caricamento commenti…</p>
      ) : comments.length ? (
        <div className="mb-3 space-y-2">
          {comments.map((comment) => (
            <article
              id={`workspace-comment-${comment.id}`}
              key={comment.id}
              className="rounded-lg bg-white px-3 py-2 dark:bg-gray-950"
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <UserRound size={13} aria-hidden="true" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {comment.authorName}
                </span>
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleString("it-IT")}
                </time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm">{comment.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-gray-500">Nessun commento. Avvia la conversazione.</p>
      )}

      {canComment ? (
        <form onSubmit={submit} className="space-y-2">
          {mentionIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="Membri menzionati">
              {mentionIds.map((id) => {
                const member = members?.members.find((item) => item.id === id);
                if (!member) return null;
                return (
                  <span key={id} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                    @{member.name}
                    <button
                      type="button"
                      aria-label={`Rimuovi menzione di ${member.name}`}
                      onClick={() => {
                        setMentionIds((current) => current.filter((item) => item !== id));
                        setBody((current) => {
                          const token = `@${member.name}`;
                          const index = current.indexOf(token);
                          if (index < 0) return current;
                          return `${current.slice(0, index)}${current.slice(index + token.length)}`.replace(
                            /\s{2,}/g,
                            " ",
                          );
                        });
                      }}
                      className="font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <label className="sr-only" htmlFor={`comment-text-${entityType}-${entityId}`}>
            Scrivi un commento
          </label>
          <textarea
            ref={textareaRef}
            id={`comment-text-${entityType}-${entityId}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={5000}
            rows={2}
            placeholder="Scrivi un commento…"
            className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-gray-800 dark:bg-gray-950"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <label className="sr-only" htmlFor={`mention-member-${entityType}-${entityId}`}>
                Seleziona membro da menzionare
              </label>
              <select
                id={`mention-member-${entityType}-${entityId}`}
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                disabled={!mentionableMembers.length}
                className="max-w-48 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-800 dark:bg-gray-950"
              >
                <option value="">Menziona un membro</option>
                {mentionableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMention}
                disabled={!selectedMemberId}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-950"
              >
                Aggiungi
              </button>
            </div>
            <button
              type="submit"
              disabled={!body.trim() || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7b39fc] px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={13} aria-hidden="true" />
              {saving ? "Invio…" : "Commenta"}
            </button>
          </div>
        </form>
      ) : !loading && members?.role === "viewer" ? (
        <p className="text-xs text-gray-500">Puoi leggere i commenti, ma non aggiungerne.</p>
      ) : null}
    </section>
  );
}
