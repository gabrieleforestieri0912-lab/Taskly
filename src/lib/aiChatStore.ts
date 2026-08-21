"use client";

import { useSyncExternalStore } from "react";
import { apiFetch } from "./api";

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export type AIAction =
  | { type: "add_block"; payload?: any }
  | { type: "update_page_content"; payload: { id: number; content: string } }
  | { type: "insert_page_text"; payload: { id: number; text: string } }
  | { type: "create_page"; payload: { label: string; parentId?: number | null } }
  | { type: "update_page"; payload: { id: number; updates: Record<string, any> } }
  | { type: "error"; payload: { message: string } };

export type OnAction = (action: AIAction) => any;

const STORAGE_KEY = "taskly_ai_chat_messages";

// ─── Module-level singleton state ────────────────────────────────────────
// All AIPanel instances (floating minichat, full-page chat, any route) share
// the exact same conversation from this store.

let messages: AIChatMessage[] = [];
let isStreaming = false;
let error: string | null = null;

function loadStored(): AIChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    ) as AIChatMessage[];
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

type Snapshot = { messages: AIChatMessage[]; isStreaming: boolean; error: string | null };

// Called once at module load (client only).
if (typeof window !== "undefined") {
  messages = loadStored();
}

// Cached snapshot: getSnapshot must return a stable reference that only
// changes when state actually changes, otherwise React loops forever.
let snapshot: Snapshot = { messages, isStreaming, error };

function makeSnapshot() {
  snapshot = { messages, isStreaming, error };
}

function setState(next: Partial<Snapshot>) {
  let changed = false;
  if (next.messages !== undefined && next.messages !== messages) {
    messages = next.messages;
    changed = true;
  }
  if (next.isStreaming !== undefined && next.isStreaming !== isStreaming) {
    isStreaming = next.isStreaming;
    changed = true;
  }
  if (next.error !== undefined && next.error !== error) {
    error = next.error;
    changed = true;
  }
  if (changed) {
    makeSnapshot();
    emit();
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
  try {
    window.dispatchEvent(new CustomEvent("ai-chat-sync", { detail: messages }));
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot(): Snapshot {
  return snapshot;
}

// Cross-instance sync (e.g. two providers on one page).
if (typeof window !== "undefined") {
  window.addEventListener("ai-chat-sync", (e) => {
    const detail = (e as CustomEvent<AIChatMessage[]>).detail;
    if (Array.isArray(detail)) {
      // Avoid loops: only apply if it differs.
      if (!sameMessages(messages, detail)) {
        messages = detail;
        makeSnapshot();
        emit();
      }
    }
  });
}

function sameMessages(a: AIChatMessage[], b: AIChatMessage[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.content !== y.content || x.streaming !== y.streaming) return false;
  }
  return true;
}

// ─── Action detection ────────────────────────────────────────────────────

const ICON_KEYWORDS: Record<string, string> = {
  dashboard: "layout-dashboard",
  task: "list-todo",
  tasks: "list-todo",
  checklist: "clipboard-list",
  obiettivo: "target",
  obiettivi: "target",
  target: "target",
  calendario: "calendar",
  note: "file-text",
  idea: "lightbulb",
  idee: "lightbulb",
  team: "users",
  utenti: "users",
  progetto: "briefcase-business",
  roadmap: "rocket",
  studio: "book-open",
  livelli: "layers",
};

function detectAction(text: string, pages: any[]): AIAction | null {
  const value = text.trim();
  if (!value) return null;
  const pagesLocal = Array.isArray(pages) ? pages : [];
  const findPageByLabel = (label: string) => {
    const needle = label.trim().toLowerCase();
    if (!needle) return null;
    return pagesLocal.find((p) => p.label?.toLowerCase().includes(needle));
  };

  const createMatch = value.match(
    /(?:crea|aggiungi)\s+una pagina[\s:]*[""]?([^""\n]+)[""]?/i,
  );
  if (createMatch) {
    return { type: "create_page", payload: { label: createMatch[1].trim() } };
  }

  const renameMatch = value.match(
    /rinomina pagina ["']?([^"']+)["']?\s+in\s+["']?([^"']+)["']?/i,
  );
  if (renameMatch) {
    const page = findPageByLabel(renameMatch[1]);
    if (!page)
      return { type: "error", payload: { message: `Non trovo la pagina "${renameMatch[1].trim()}".` } };
    return { type: "update_page", payload: { id: page.id, updates: { label: renameMatch[2].trim() } } };
  }

  const iconMatch = value.match(
    /(?:cambia|imposta|modifica)\s+(?:l'|la )?icona(?:\s+della)?\s+pagina ["']?([^"']+)["']?(?:\s+a|in)?\s+["']?([^"']+)["']?/i,
  );
  if (iconMatch) {
    const page = findPageByLabel(iconMatch[1]);
    if (!page)
      return { type: "error", payload: { message: `Non trovo la pagina "${iconMatch[1].trim()}".` } };
    const keyword = iconMatch[2].trim().toLowerCase();
    const icon =
      ICON_KEYWORDS[keyword] ||
      ICON_KEYWORDS[keyword.split(" ")[0]] ||
      keyword;
    return { type: "update_page", payload: { id: page.id, updates: { icon } } };
  }

  return null;
}

// ─── Backend stream (returns a single accumulated reply) ─────────────────

async function streamChat(text: string, context: string, signal: AbortSignal): Promise<string> {
  const payload = { message: text + context, context: {} };
  const res = await apiFetch(`/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI backend ${res.status}: ${body || res.statusText}`);
  }
  const data = await res.json().catch(() => null);
  return data?.message || "";
}

// ─── Public API ──────────────────────────────────────────────────────────

function useAIChat(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function createAIChatController(opts: {
  pages?: any[];
  onAction?: OnAction;
}) {
  const { pages = [], onAction } = opts;

  function buildContext() {
    const list = Array.isArray(pages) ? pages : [];
    if (!list.length) return "";
    const summaries = list.map((p) => {
      const count = Array.isArray(p.data) ? p.data.length : 0;
      return `- ${p.label} (${p.type || "pagina"}, ${count} elementi)`;
    });
    return `\n\nContesto pagine utente:\n${summaries.join("\n")}`;
  }

  let abortController: AbortController | null = null;

  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || isStreaming) return;

    setState({ error: null });
    setState({
      messages: [...messages, { role: "user", content: text }],
    });
    setState({ isStreaming: true });
    setState({
      messages: [
        ...messages,
        { role: "assistant", content: "", streaming: true },
      ],
    });

    const controller = new AbortController();
    abortController = controller;

    try {
      const reply = await streamChat(text, buildContext(), controller.signal);
      setState({ isStreaming: false });
      setState({
        messages: [
          ...messages.slice(0, -1),
          { role: "assistant", content: reply, streaming: false },
        ],
      });
    } catch (err: any) {
      setState({ isStreaming: false });
      if (err.name !== "AbortError") {
        setState(
          err.message?.includes("Failed to fetch")
            ? { error: "Impossibile comunicare con il servizio AI. Riprova più tardi." }
            : { error: err.message },
        );
        setState({ messages: messages.slice(0, -1) });
      }
    } finally {
      abortController = null;
    }
  }

  async function sendAction(action: AIAction) {
    if (action.type === "error") {
      const content = action.payload?.message || "Impossibile completare l'azione.";
      setState({ messages: [...messages, { role: "assistant", content }] });
      return;
    }
    try {
      const result = await Promise.resolve(onAction?.(action));
      const content = result?.message || "Azione eseguita con successo.";
      setState({ messages: [...messages, { role: "assistant", content }] });
    } catch (e: any) {
      setState({
        messages: [
          ...messages,
          { role: "assistant", content: `Non sono riuscito a completare l'azione: ${e?.message}` },
        ],
      });
    }
  }

  function stop() {
    abortController?.abort();
  }

  function clear() {
    setState({ messages: [], error: null });
  }

  return {
    send,
    sendAction,
    stop,
    clear,
    detectAction: (text: string) => detectAction(text, pages),
    buildContext,
  };
}

export { useAIChat, detectAction };