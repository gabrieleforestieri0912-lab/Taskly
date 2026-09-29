"use client";
import { useSyncExternalStore } from "react";
import { EVT_SYNC } from "./aiChatBus";

export type AIChatMessage = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export type AIChatSnapshot = {
  messages: AIChatMessage[];
  isStreaming: boolean;
  error: string | null;
};

export type AIChatActions = AIChatSnapshot & {
  pushMessage: (m: AIChatMessage) => void;
  replaceLast: (m: AIChatMessage) => void;
  popLast: () => void;
  setStreaming: (v: boolean) => void;
  setError: (e: string | null) => void;
  clearAll: () => void;
};

const STORAGE_KEY = "taskly_ai_chat_messages_desktop";

let messages: AIChatMessage[] = [];
let isStreaming = false;
let error: string | null = null;

function loadStored(): AIChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as AIChatMessage[]).filter(
      (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
function emit(): void {
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  messages = loadStored();
}

let snapshot: AIChatSnapshot = { messages, isStreaming, error };

function makeSnapshot(): void {
  snapshot = { messages, isStreaming, error };
}

function setState(next: Partial<AIChatSnapshot>): void {
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

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch { /* ignore */ }
  try {
    window.dispatchEvent(new CustomEvent(EVT_SYNC, { detail: messages }));
  } catch { /* ignore */ }
}

function sameMessages(a: AIChatMessage[], b: AIChatMessage[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((m, i) => m.role === b[i]?.role && m.content === b[i]?.content);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AIChatSnapshot {
  return snapshot;
}

if (typeof window !== "undefined") {
  window.addEventListener(EVT_SYNC, (e) => {
    const detail = (e as CustomEvent<AIChatMessage[]>).detail;
    if (Array.isArray(detail) && !sameMessages(messages, detail)) {
      messages = detail;
      makeSnapshot();
      emit();
    }
  });
}

export function useAIChat(): AIChatActions {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return {
    ...snap,
    pushMessage: (m: AIChatMessage) => {
      setState({ messages: [...getSnapshot().messages, m] });
      persist();
    },
    replaceLast: (m: AIChatMessage) => {
      const cur = getSnapshot().messages;
      setState({ messages: [...cur.slice(0, -1), m] });
      persist();
    },
    popLast: () => {
      const cur = getSnapshot().messages;
      setState({ messages: cur.slice(0, -1) });
    },
    setStreaming: (v: boolean) => setState({ isStreaming: v }),
    setError: (e: string | null) => setState({ error: e }),
    clearAll: () => {
      setState({ messages: [], error: null });
      persist();
    },
  };
}
