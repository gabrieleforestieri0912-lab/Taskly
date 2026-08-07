"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  FileText,
  CheckSquare,
  Target,
  Trash2,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { apiFetch } from "../lib/api";

// Frontend calls the backend AI route; provider selection is handled server-side.

const SYSTEM_PROMPT = `Sei l'assistente AI di Taskly, una piattaforma di produttività. 
Aiuti gli utenti a organizzare task, creare piani, riassumere note e suggerire priorità.
Rispondi in italiano, in modo conciso e pratico. Usa markdown quando utile.`;

const QUICK_ACTIONS = [
  { id: "sum", icon: FileText, label: "Riassumi" },
  { id: "task", icon: CheckSquare, label: "Crea task" },
  { id: "plan", icon: Target, label: "Crea piano" },
];

const ICON_KEYWORDS = {
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

const ACTION_PATTERNS: {
  type: string;
  pattern: RegExp;
  extract: (m: RegExpMatchArray) => any;
}[] = [
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci|crea)\s+(?:un\s+)?blocco\s+(?:testo|testo|paragraph)\s*(?::\s*["']?([^"'\n]+)["']?)?/i,
    extract: (m) => ({ blockType: "text", content: m[1] || "" }),
  },
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci)\s+(?:un\s+)?blocco\s+(h1|h2|h3)\s*(?::\s*["']?([^"'\n]+)["']?)?/i,
    extract: (m) => ({ blockType: m[1], content: m[2] || "" }),
  },
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci)\s+(?:una\s+)?casella\s+di\s+controllo\s*(?::\s*["']?([^"'\n]+)["']?)?/i,
    extract: (m) => ({ blockType: "checkbox", content: m[1] || "" }),
  },
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci)\s+(?:una\s+)?lista\s+puntata\s*(?::\s*["']?([^"'\n]+)["']?)?/i,
    extract: (m) => ({ blockType: "bullet", content: m[1] || "" }),
  },
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci)\s+(?:una\s+)?lista\s+numerata\s*(?::\s*["']?([^"'\n]+)["']?)?/i,
    extract: (m) => ({ blockType: "numbered", content: m[1] || "" }),
  },
  {
    type: "add_block",
    pattern:
      /(?:aggiungi|inserisci)\s+(?:un\s+)?link\s+interno\s+(?:a\s+)?pagina\s+["']?([^"'\n]+)["']?/i,
    extract: (m) => ({ blockType: "link", label: m[1] || "" }),
  },
  {
    type: "update_content",
    pattern:
      /(?:modifica|cambia|cambia il contenuto)\s+(?:della\s+)?pagina\s+(?:in\s+)?["']?([^"'\n]+)["']?\s*:\s*["']?([^"'\n]+)["']?/i,
    extract: (m) => ({ pageLabel: m[1], content: m[2] }),
  },
  {
    type: "insert_text",
    pattern:
      /(?:aggiungi|inserisci)\s+testo\s+(?:alla\s+)?pagina\s+(?:in\s+)?["']?([^"'\n]+)["']?\s*(?:dopo|dopo il titolo)?\s*:\s*["']?([^"'\n]+)["']?/i,
    extract: (m) => ({ pageLabel: m[1], text: m[2] }),
  },
];

/* ─── Streaming fetch ─────────────────────────────────────────── */

async function* streamChat(messages, signal) {
  // Send to backend AI endpoint. Backend is responsible for provider integration.
  const last = messages[messages.length - 1];
  const payload = { message: last?.content || "", context: {} };

  const res = await apiFetch(`/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI backend ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json().catch(() => null);
  const content = data?.message || "";

  if (content) yield content;
}

/* ─── Message bubble ──────────────────────────────────────────── */

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className="relative max-w-[85%]">
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <div className="w-4 h-4 rounded bg-violet-500/10 flex items-center justify-center">
              <Sparkles size={9} className="text-violet-500" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              AI Assistant
            </span>
          </div>
        )}
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-br-md"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-4 bg-violet-500 ml-0.5 animate-pulse rounded-full align-middle" />
          )}
        </div>
        {!isUser && !msg.streaming && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all"
          >
            {copied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function AIPanel({
  pages,
  onAction,
  variant = "floating",
  isSidebarOpen = true,
}) {
  const isPageVariant = variant === "page";
  const [isOpen, setIsOpen] = useState(isPageVariant);
  const [forcedPageVariant, setForcedPageVariant] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close AI Chat Page/Floating panel when navigating/changing route
  useEffect(() => {
    if (!isPageVariant) {
      setIsOpen(false);
      setForcedPageVariant(false);
    }
  }, [isPageVariant, pathname, searchParams]);

  // Blocca lo scroll della pagina sottostante quando il pannello AI è visibile
  useEffect(() => {
    const shouldBlock = isOpen || isPageVariant || forcedPageVariant;
    document.body.style.overflow = shouldBlock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isPageVariant, forcedPageVariant]);
  // Ascolta eventi dalla sidebar — apre la chat a pagina intera sulla dashboard
  useEffect(() => {
    function openAsPage() {
      setForcedPageVariant(true);
      setIsOpen(true);
    }
    window.addEventListener("open-ai-panel-page", openAsPage);
    return () => window.removeEventListener("open-ai-panel-page", openAsPage);
  }, []);
  // Variante effettiva: floating nativo oppure forzata pagina dal bottone sidebar
  const computedIsPageVariant = isPageVariant || forcedPageVariant;

  /* auto-scroll */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Broadcast messages to sidebar (for history preview)
  useEffect(() => {
    try {
      const copy = Array.isArray(messages)
        ? messages.map((m) => ({ role: m.role, content: m.content }))
        : [];
      window.dispatchEvent(
        new CustomEvent("ai-messages-updated", { detail: copy }),
      );
    } catch {
      // ignore
    }
  }, [messages]);

  /* focus input on open */
  useEffect(() => {
    if (isOpen || isPageVariant)
      setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, isPageVariant]);

  const buildContextFromPages = useCallback(() => {
    if (!pages?.length) return "";
    const summaries = pages.map((p) => {
      const count = Array.isArray(p.data) ? p.data.length : 0;
      return `- ${p.label} (${p.type}, ${count} elementi)`;
    });
    return `\n\nContesto pagine utente:\n${summaries.join("\n")}`;
  }, [pages]);

  const detectDashboardAction = useCallback(
    (text) => {
      if (!onAction) return null;

      const value = text.trim();
      const lowered = value.toLowerCase();

      const findPageByLabel = (label) => {
        const needle = label.trim().toLowerCase();
        if (!needle) return null;
        return pages.find((page) => page.label?.toLowerCase().includes(needle));
      };

      const findPageById = (id) => {
        const needle = id.toString().trim();
        return pages.find((page) => String(page.id) === needle);
      };

      for (const pattern of ACTION_PATTERNS) {
        const match = value.match(pattern.pattern);
        if (match) {
          const extracted = pattern.extract(match);
          if (pattern.type === "add_block") {
            const pageMatch = value.match(
              /(?:pagina|sotto-pagina)\s+["']?([^"'\n]+)["']?/i,
            );
            const pageLabel = pageMatch ? pageMatch[1] : null;
            let targetPage: any = null;
            if (pageLabel) {
              targetPage = findPageByLabel(pageLabel);
            }
            return {
              type: "add_block",
              payload: {
                ...extracted,
                targetPageId: targetPage?.id || null,
                targetPageLabel: pageLabel,
              },
            };
          }
          if (pattern.type === "update_content") {
            const page = findPageByLabel(extracted.pageLabel);
            if (!page)
              return {
                type: "error",
                payload: {
                  message: `Non trovo la pagina "${extracted.pageLabel}".`,
                },
              };
            return {
              type: "update_page_content",
              payload: { id: page.id, content: extracted.content },
            };
          }
          if (pattern.type === "insert_text") {
            const page = findPageByLabel(extracted.pageLabel);
            if (!page)
              return {
                type: "error",
                payload: {
                  message: `Non trovo la pagina "${extracted.pageLabel}".`,
                },
              };
            return {
              type: "insert_page_text",
              payload: { id: page.id, text: extracted.text },
            };
          }
        }
      }

      const createMatch = value.match(
        /(?:crea|aggiungi)\s+(?:una\s+)?pagina(?:\s+chiamata|\s+nome)?\s*["']?([^"'\n]+)["']?(?:\s+sotto(?:\s+la\s+pagina)?\s+["']?([^"'\n]+)["']?)?/i,
      );
      if (createMatch) {
        const label = createMatch[1].trim();
        const parentName = createMatch[2]?.trim();
        let parentId = null;
        if (parentName) {
          const parent = findPageByLabel(parentName);
          if (parent) parentId = parent.id;
        }
        return {
          type: "create_page",
          payload: { label, parentId },
        };
      }

      const renameMatch = value.match(
        /rinomina\s+pagina\s+["']?([^"']+)["']?\s+in\s+["']?([^"']+)["']?/i,
      );
      if (renameMatch) {
        const page = findPageByLabel(renameMatch[1]);
        if (!page)
          return {
            type: "error",
            payload: {
              message: `Non trovo la pagina "${renameMatch[1].trim()}".`,
            },
          };
        return {
          type: "update_page",
          payload: { id: page.id, updates: { label: renameMatch[2].trim() } },
        };
      }

      const iconMatch = value.match(
        /(?:cambia|imposta|modifica)\s+(?:l'|la\s+)?icona(?:\s+della)?\s+pagina\s+["']?([^"']+)["']?(?:\s+a|\s+in)?\s+["']?([^"']+)["']?/i,
      );
      if (iconMatch) {
        const page = findPageByLabel(iconMatch[1]);
        if (!page)
          return {
            type: "error",
            payload: {
              message: `Non trovo la pagina "${iconMatch[1].trim()}".`,
            },
          };
        const keyword = iconMatch[2].trim().toLowerCase();
        const icon =
          ICON_KEYWORDS[keyword] || ICON_KEYWORDS[keyword.split(" ")[0]];
        if (!icon) {
          return {
            type: "error",
            payload: {
              message: `Icona "${iconMatch[2].trim()}" non riconosciuta.`,
            },
          };
        }
        return {
          type: "update_page",
          payload: { id: page.id, updates: { icon } },
        };
      }

      const moveMatch = value.match(
        /sposta\s+pagina\s+["']?([^"']+)["']?\s+sotto\s+["']?([^"']+)["']?/i,
      );
      if (moveMatch) {
        const page = findPageByLabel(moveMatch[1]);
        if (!page)
          return {
            type: "error",
            payload: {
              message: `Non trovo la pagina "${moveMatch[1].trim()}".`,
            },
          };

        const targetRaw = moveMatch[2].trim();
        if (
          ["root", "principale", "livello principale"].includes(
            targetRaw.toLowerCase(),
          )
        ) {
          return {
            type: "update_page",
            payload: { id: page.id, updates: { parentId: null } },
          };
        }
        const parentPage = findPageByLabel(targetRaw);
        if (!parentPage)
          return {
            type: "error",
            payload: { message: `Non trovo la pagina parent "${targetRaw}".` },
          };
        return {
          type: "update_page",
          payload: { id: page.id, updates: { parentId: parentPage.id } },
        };
      }

      if (lowered.includes("crea pagina")) {
        return {
          type: "error",
          payload: {
            message: 'Per creare una pagina scrivi: crea pagina "Nome Pagina".',
          },
        };
      }

      return null;
    },
    [onAction, pages],
  );

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || isStreaming) return;

      setError(null);
      const userMsg = { role: "user", content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");

      const detectedAction = detectDashboardAction(text);
      if (detectedAction) {
        if (detectedAction.type === "error") {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: detectedAction.payload.message },
          ]);
          return;
        }

        try {
          const result = await Promise.resolve(onAction?.(detectedAction));
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                result?.message || "Azione dashboard eseguita con successo.",
            },
          ]);
          return;
        } catch (actionError: any) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Non sono riuscito a completare l'azione: ${actionError.message}`,
            },
          ]);
          return;
        }
      }

      setIsStreaming(true);

      const contextMsgs = [
        ...newMessages.slice(0, -1),
        {
          ...userMsg,
          content: text + buildContextFromPages(),
        },
      ];

      const botMsg = { role: "assistant", content: "", streaming: true };
      setMessages((prev) => [...prev, botMsg]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        let accumulated = "";
        for await (const chunk of streamChat(contextMsgs, controller.signal)) {
          accumulated += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: accumulated,
              streaming: true,
            };
            return updated;
          });
        }
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            streaming: false,
          };
          return updated;
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(
            err.message.includes("Failed to fetch")
              ? `Impossibile comunicare con il servizio AI. Riprova più tardi.`
              : err.message,
          );
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      input,
      isStreaming,
      messages,
      buildContextFromPages,
      detectDashboardAction,
      onAction,
    ],
  );

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmptyState = messages.length === 0 && !isStreaming;

  const panelClasses = computedIsPageVariant
    ? `fixed top-0 bottom-0 right-0 ${isSidebarOpen ? "left-64" : "left-0"} z-[51] bg-white dark:bg-gray-950 rounded-none border-0 shadow-none flex flex-col overflow-hidden transition-all duration-300`
    : "fixed bottom-6 right-6 z-[120] w-[420px] max-w-[calc(100vw-48px)] h-[640px] max-h-[calc(100vh-48px)] bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden";

  const handleClose = () => {
    setIsOpen(false);
    setForcedPageVariant(false);
    // If we're rendered as a full page variant, remove the query flag so the dashboard stops rendering us
    try {
      if (computedIsPageVariant && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("ai");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {}
    window.dispatchEvent(new Event("close-ai-panel-page"));
  };

  const panelContent = (
    <motion.div
      initial={
        computedIsPageVariant ? false : { opacity: 0, y: 20, scale: 0.97 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={panelClasses}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Sparkles size={14} className="text-violet-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">
              AI
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
              title="Pulisci chat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => handleClose()}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* messages */}
      <div
        className={`flex-1 ${messages.length > 0 ? "overflow-y-auto" : "overflow-y-hidden"} px-5 py-4 space-y-4 custom-scrollbar flex flex-col`}
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-violet-500" />
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Come posso aiutarti?
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Chiedimi di riassumere note, creare task o piani.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-xl mt-7"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scrivi un messaggio..."
                  rows={1}
                  className="flex-1 resize-none bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 leading-relaxed"
                  style={{ maxHeight: 120 }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="shrink-0 w-9 h-9 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-30"
                >
                  <Send size={15} />
                </button>
              </div>
            </motion.div>

            {!isStreaming && (
              <div className="mt-4 flex gap-2 flex-wrap justify-center">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSend(a.label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-800 text-[11px] font-semibold hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                  >
                    <a.icon size={12} />
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* quick actions */}
      {!isEmptyState && messages.length === 0 && !isStreaming && (
        <div className="px-5 pb-1 flex gap-2">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSend(a.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-800 text-[11px] font-semibold hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
            >
              <a.icon size={12} />
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <AnimatePresence initial={false}>
        {!isEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="p-4 border-t border-gray-100 dark:border-gray-800/80"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Scrivi un messaggio..."
                rows={1}
                className="flex-1 resize-none bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 leading-relaxed"
                style={{ maxHeight: 120 }}
              />
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="shrink-0 w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="shrink-0 w-9 h-9 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-30"
                >
                  <Send size={15} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <>
      {/* ── Floating Button ───────────────────────── */}
      {!computedIsPageVariant && (
        <button
          onClick={() => {
            setForcedPageVariant(false);
            setIsOpen(true);
          }}
          className="fixed bottom-6 right-6 z-100 group"
        >
          <div className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-600/40 hover:shadow-xl hover:shadow-cyan-600/50 hover:scale-110 transition-all duration-300">
            <MessageSquare size={20} className="text-white" />
          </div>
        </button>
      )}

      <AnimatePresence>
        {(isOpen || computedIsPageVariant) && (
          <>
            {/* backdrop */}
            {!computedIsPageVariant && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-110 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
              />
            )}
            {panelContent}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
