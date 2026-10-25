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
  | { type: "update_page_content"; payload: { id: number | string; content: string } }
  | { type: "insert_page_text"; payload: { id: number | string; text: string } }
  | { type: "append_text"; payload: { pageId?: number | string; pageLabel?: string; text: string } }
  | { type: "add_task"; payload: { pageId?: number | string; pageLabel?: string; title: string; priority?: string; deadline?: string } }
  | { type: "add_goal"; payload: { pageId?: number | string; pageLabel?: string; title: string; deadline?: string } }
  | { type: "create_page"; payload: { label: string; parentId?: number | string | null; type?: string; contentText?: string } }
  | { type: "update_page"; payload: { id: number | string; updates: Record<string, any> } }
  | { type: "move_page"; payload: { id?: number | string; pageLabel?: string; parentId?: number | string | null; parentLabel?: string } }
  | { type: "delete_page"; payload: { id?: number | string; pageLabel?: string; permanent?: boolean } }
  | { type: "restore_page"; payload: { id?: number | string; pageLabel?: string } }
  | { type: "permanently_delete_page"; payload: { id?: number | string; pageLabel?: string } }
  | { type: "error"; payload: { message: string } };

export type OnAction = (action: AIAction) => any;

const STORAGE_KEY = "taskly_ai_chat_messages";

// ─── Module-level singleton state ────────────────────────────────────────
// All AIPanel instances (floating minichat, full-page chat, any route) share
// the exact same conversation from this store.

let messages: AIChatMessage[] = [];
let isStreaming = false;
let error: string | null = null;
// Quota giornaliera AI: upgrade richiesto quando esaurita, messaggi rimasti
// (null = illimitati o sconosciuti). Condivisi come il resto dello store.
let upgradeRequired = false;
let remaining: number | null = null;

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

// ─── Scrub vecchi fallback finti ─────────────────────────────────────────
// La vecchia route /api/ai/chat rispondeva con messaggi preimpostati
// (fallbackReply) quando il provider falliva: quelle risposte finte restano
// salvate in localStorage e sembrano ancora "l'AI che risponde". Al primo
// load vengono rimosse una volta sola; la cronologia vera resta intatta.
const SCRUB_FLAG = "taskly_ai_scrub_v1";
const FAKE_ASSISTANT_EXACT = new Set([
  "Ciao! 👋 Sono Taskly AI. Posso aiutarti a pianificare la tua giornata, riassumere note o creare task e obiettivi.",
  "Ecco cosa ho riassunto: (1) punti chiave del tuo lavoro, (2) i task prioritari da completare, (3) le idee da convertire in obiettivi. Possiamo approfondire qualsiasi punto.",
  "Perfetto, ho preparato un nuovo task nella tua lista. Vuoi che gli assegni una priorità (Alta/Media/Bassa) e una scadenza?",
  "Ottimo! Un obiettivo chiaro parte da un risultato misurabile. Definisci: (1) cosa vuoi ottenere, (2) entro quando, (3) i sotto-obiettivi che lo rendono raggiungibile.",
  "Ecco un piano suggerito per oggi: mattina dedicata al focus (3 task prioritari), trasferire 1 idea in obiettivo, e 20 minuti di calendario per la revisione di fine giornata. Vuoi che generi i blocchi nel calendario?",
  "Di nulla! 😊 Se mi serve altro: organizzazione task, riassunti, piani della giornata o obiettivi. Sono qui per questo.",
  "Sono Taskly AI, il tuo assistente di produttività. Posso riassumere note, creare task, suggerire obiettivi e aiutarti a pianificare la giornata. Scrivi 'riassumi le mie note' o 'crea un task' per iniziare.",
]);
const FAKE_ASSISTANT_PREFIX = [
  'Ecco il riassunto di "',
  "Ho capito, parliamo di \"",
];
export function isFakeAssistantMessage(content: string): boolean {
  if (FAKE_ASSISTANT_EXACT.has(content)) return true;
  return FAKE_ASSISTANT_PREFIX.some((p) => content.startsWith(p));
}
function scrubFakeMessages(list: AIChatMessage[]): AIChatMessage[] {
  return list.filter(
    (m) => !(m && m.role === "assistant" && typeof m.content === "string" && isFakeAssistantMessage(m.content)),
  );
}

type Snapshot = { messages: AIChatMessage[]; isStreaming: boolean; error: string | null; upgradeRequired: boolean; remaining: number | null };

// Called once at module load (client only).
if (typeof window !== "undefined") {
  messages = loadStored();
  try {
    if (!localStorage.getItem(SCRUB_FLAG)) {
      const cleaned = scrubFakeMessages(messages);
      if (cleaned.length !== messages.length) {
        messages = cleaned;
        persist();
      }
      localStorage.setItem(SCRUB_FLAG, "1");
    }
  } catch {}
}

// Cached snapshot: getSnapshot must return a stable reference that only
// changes when state actually changes, otherwise React loops forever.
let snapshot: Snapshot = { messages, isStreaming, error, upgradeRequired, remaining };

function makeSnapshot() {
  snapshot = { messages, isStreaming, error, upgradeRequired, remaining };
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
  if (next.upgradeRequired !== undefined && next.upgradeRequired !== upgradeRequired) {
    upgradeRequired = next.upgradeRequired;
    changed = true;
  }
  if (next.remaining !== undefined && next.remaining !== remaining) {
    remaining = next.remaining;
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
function getServerSnapshot(): Snapshot {
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

  // L'AI ha accesso completo: può anche spostare ed eliminare le pagine.
  const deleteMatch = value.match(
    /(?:elimina|cancella|sposta nel cestino|butta)\s+(?:la\s+)?pagina\s+["']?([^"'\n]+)["']?/i,
  );
  if (deleteMatch) {
    const label = deleteMatch[1].trim().replace(/\s+(per favore|grazie)\.?$/i, "");
    const page = findPageByLabel(label);
    if (!page)
      return { type: "error", payload: { message: `Non trovo la pagina "${label}".` } };
    return { type: "delete_page", payload: { id: page.id } };
  }

  const restoreMatch = value.match(
    /(?:ripristina|recupera|ritira fuori dal cestino)\s+(?:la\s+)?pagina\s+["']?([^"'\n]+)["']?/i,
  );
  if (restoreMatch) {
    const label = restoreMatch[1].trim();
    return { type: "restore_page", payload: { pageLabel: label } };
  }

  const moveMatch = value.match(
    /sposta\s+(?:la\s+)?pagina\s+["']?([^"']+)["']?\s+(?:in|sotto|dentro)\s+["']?([^"'\n]+)["']?/i,
  );
  if (moveMatch) {
    const page = findPageByLabel(moveMatch[1]);
    if (!page)
      return { type: "error", payload: { message: `Non trovo la pagina "${moveMatch[1].trim()}".` } };
    const dest = moveMatch[2].trim();
    if (/^(principale|radice|root|livello principale)$/i.test(dest)) {
      return { type: "move_page", payload: { id: page.id, parentId: null } };
    }
    const parent = findPageByLabel(dest);
    if (!parent)
      return { type: "error", payload: { message: `Non trovo la pagina di destinazione "${dest}".` } };
    return { type: "move_page", payload: { id: page.id, parentId: parent.id } };
  }

  return null;
}

// ─── Backend stream (returns a single accumulated reply) ─────────────────

type ChatResult = { message: string; actions?: AIAction[]; remaining?: number | null };

async function streamChat(
  text: string,
  context: string,
  signal: AbortSignal,
  history: AIChatMessage[],
): Promise<ChatResult> {
  const payload = { message: text, contextDump: context, history: history.slice(-10) };
  const res = await apiFetch(`/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    if (res.status === 429) {
      // Quota giornaliera esaurita: il server chiede l'upgrade del piano.
      const data429 = await res.json().catch(() => null);
      if (data429?.code === "AI_QUOTA_EXHAUSTED") {
        const err: any = new Error(
          (typeof data429?.error === "string" && data429.error) ||
          "Hai esaurito i messaggi AI giornalieri. Fai l'upgrade per continuare.",
        );
        err.upgradeRequired = true;
        throw err;
      }
      // Limite di richieste raggiunto (non un errore tecnico): messaggio
      // chiaro stile "crediti esauriti" con tempo di attesa dal server.
      const retryAfter = Number(res.headers.get("Retry-After") || 0);
      const wait = retryAfter > 60
        ? ` Riprova tra circa ${Math.ceil(retryAfter / 60)} minuti.`
        : retryAfter > 0
          ? ` Riprova tra circa ${retryAfter} secondi.`
          : " Riprova tra qualche minuto.";
      throw new Error(`Crediti AI esauriti: hai raggiunto il limite di richieste.${wait}`);
    }
    // La route /api/ai/chat non usa più fallback: estrae l'errore reale di xKiro.
    const data = await res.json().catch(() => null);
    const detail =
      (data && typeof data.error === "string" && data.error) || res.statusText;
    throw new Error(`AI non disponibile (${res.status}): ${detail}`);
  }
  const data = await res.json().catch(() => null);
  if (data?.error) throw new Error(`AI non disponibile: ${data.error}`);
  return {
    message: data?.message || "",
    actions: Array.isArray(data?.actions) ? data.actions : [],
    remaining: typeof data?.remaining === "number" ? data.remaining : null,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────

function useAIChat(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function createAIChatController(opts: {
  pages?: any[];
  onAction?: OnAction;
}) {
  const { pages = [], onAction } = opts;

  // ── Serializzazione contenuto reale delle pagine per l'AI ──
  function getActivePageId(): string | null {
    try {
      if (typeof window === "undefined") return null;
      const sp = new URLSearchParams(window.location.search);
      return sp.get("page");
    } catch { return null; }
  }

  function truncate(s: string, n: number): string {
    const t = String(s || "");
    return t.length > n ? t.slice(0, n) + "…" : t;
  }

  function blocksToText(data: any, budget: number): string {
    try {
      if (!data) return "";
      if (Array.isArray(data)) {
        // task / goal / idee strutturate
        return data.slice(0, 25).map((it: any, i: number) => {
          const title = it?.title ?? it?.text ?? it?.name ?? JSON.stringify(it).slice(0, 120);
          const extra = it?.status ? ` [${it.status}]` : it?.completed ? " [done]" : "";
          const sub = Array.isArray(it?.subtasks) && it.subtasks.length
            ? ` (sotto: ${it.subtasks.slice(0, 5).map((s: any) => s?.title ?? s).join("; ")})`
            : "";
          return `${i + 1}. ${title}${extra}${sub}`;
        }).join("\n").slice(0, budget);
      }
      if (typeof data === "object" && Array.isArray((data as any).blocks)) {
        const lines: string[] = [];
        for (const b of (data as any).blocks) {
          if (!b) continue;
          if (typeof b.content === "string" && b.content.trim()) {
            const prefix = b.type === "h1" ? "# " : b.type === "h2" ? "## " : b.type === "h3" ? "### "
              : b.type === "bullet" ? "- " : b.type === "checkbox" ? (b.checked ? "- [x] " : "- [ ] ")
              : b.type === "numbered" ? "1. " : b.type === "divider" ? "---" : "";
            lines.push(`${prefix}${truncate(b.content, 300)}`);
          }
          if (b.type === "tasks-embed" && Array.isArray(b.items)) {
            b.items.slice(0, 20).forEach((it: any, i: number) =>
              lines.push(`  task ${i + 1}: ${truncate(it?.title ?? it?.text ?? "", 150)}${it?.status ? ` [${it.status}]` : ""}`));
          }
          if (b.type === "goals-embed" && Array.isArray(b.goals)) {
            b.goals.slice(0, 15).forEach((g: any, i: number) =>
              lines.push(`  obiettivo ${i + 1}: ${truncate(g?.title ?? "", 150)}${g?.completed ? " [done]" : ""}`));
          }
          if (b.type === "planner-embed" && b.schedule) {
            const sch = b.schedule;
            const n = Array.isArray(sch.tasks) ? sch.tasks.length : 0;
            lines.push(`  [planner: ${n} attività pianificate]`);
            if (Array.isArray(sch.tasks)) sch.tasks.slice(0, 10).forEach((t: any) =>
              lines.push(`  - ${truncate(t?.title ?? t?.text ?? "", 120)}`));
          }
          if (b.type === "page-ref") lines.push(`  [sottopagina: ${b.label ?? b.pageId}]`);
          const joined = lines.join("\n");
          if (joined.length >= budget) return joined.slice(0, budget);
        }
        return lines.join("\n").slice(0, budget);
      }
      if (typeof data === "object" && typeof (data as any).text === "string") {
        return truncate((data as any).text, budget);
      }
      if (typeof data === "string") return truncate(data, budget);
    } catch {}
    return "";
  }

  function buildContext() {
    const all = Array.isArray(pages) ? pages : [];
    const list = all.filter((p) => p && !p.deleted);
    const trashed = all.filter((p) => p && p.deleted);
    if (!list.length && !trashed.length) return "";
    const activeId = getActivePageId();
    const lines: string[] = [];
    let budget = 12000;
    // Pagina attiva prima, con contenuto esteso
    const ordered = [...list].sort((a, b) =>
      String(a?.id) === String(activeId) ? -1 : String(b?.id) === String(activeId) ? 1 : 0);
    for (const p of ordered.slice(0, 30)) {
      const isActive = activeId && String(p.id) === String(activeId);
      const perPage = isActive ? 4000 : 800;
      const content = blocksToText(p.data ?? (p as any).initialData, perPage);
      lines.push(`### "${p.label || "(senza titolo)"}" [id:${p.id}] tipo:${p.type || "?"}${isActive ? " ← PAGINA APERTA" : ""}\n${content || "(vuota)"}`);
      budget -= perPage;
      if (budget <= 0) break;
    }
    // Pagine nel cestino: l'AI le vede e può ripristinarle o eliminarle per sempre.
    for (const p of trashed.slice(0, 10)) {
      lines.push(`### "${p.label || "(senza titolo)"}" [id:${p.id}] tipo:${p.type || "?"} [NEL CESTINO]`);
    }
    return `Pagine utente (l'AI le VEDE e ha accesso COMPLETO: può modificarle, spostarle, eliminarle nel cestino, ripristinarle):\n${lines.join("\n\n")}`;
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
      const history = messages.filter((m) => !m.streaming).slice(-10);
      const result = await streamChat(text, buildContext(), controller.signal, history);
      if (typeof result.remaining === "number") {
        setState({ remaining: result.remaining });
      }
      // Esegui le modifiche proposte dall'AI sulle pagine (se ce ne sono)
      let suffix = "";
      if (result.actions?.length && onAction) {
        const outcomes: string[] = [];
        for (const a of result.actions.slice(0, 5)) {
          try {
            const r = await Promise.resolve(onAction(a));
            if (r?.message) outcomes.push(r.message);
          } catch (e: any) {
            outcomes.push(`Errore: ${e?.message || "azione fallita"}`);
          }
        }
        if (outcomes.length) suffix = `\n\n✅ ${outcomes.join("\n✅ ")}`;
      }
      const reply = `${result.message || "Fatto."}${suffix}`;
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
        if ((err as any)?.upgradeRequired) {
          setState({ upgradeRequired: true, remaining: 0 });
        }
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
    setState({ messages: [], error: null, upgradeRequired: false });
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