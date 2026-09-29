"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check, Maximize2, Send, Sparkles, Trash2, X, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { createAIChatCore } from "../lib/aiChatController";
import { useAIChat, type AIChatMessage } from "../lib/aiChatStore";
import { EVT_CLOSE, EVT_OPEN, EVT_TOGGLE } from "../lib/aiChatBus";

export type MiniChatProps = {
  pages?: Array<Record<string, unknown>>;
  workspaceId?: string;
  enabled?: boolean;
  defaultOpen?: boolean;
};

const STORAGE_OPEN_PREFIX = "taskly_minichat_open_";
function storageKey(workspaceId?: string): string {
  return `${STORAGE_OPEN_PREFIX}${workspaceId ?? "global"}`;
}

function MessageBubble({ msg }: { msg: AIChatMessage }): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`group flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="relative max-w-[85%]">
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <div className="w-4 h-4 rounded bg-[#7b39fc]/10 flex items-center justify-center">
              <Sparkles size={9} className="text-[#7b39fc]" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">AI Assistant</span>
          </div>
        )}
        <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-[#7b39fc] text-white rounded-2xl rounded-br-md" : "bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-bl-md"}`}>
          {msg.content || "..."}
          {msg.streaming && <span className="inline-block w-1.5 h-4 bg-[#7b39fc] ml-0.5 animate-pulse rounded-full align-middle" />}
        </div>
        {!isUser && !msg.streaming && msg.content && (
          <button onClick={handleCopy} className="absolute -bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all" aria-label="Copia messaggio">
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}
export default function MiniChat({ pages = [], workspaceId, enabled = true, defaultOpen = false }: MiniChatProps): React.JSX.Element | null {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [forcedFull, setForcedFull] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { messages, isStreaming, error, pushMessage, replaceLast, popLast, setStreaming, setError, clearAll } = useAIChat();
  const coreRef = useRef(createAIChatCore({ pages }));
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    coreRef.current = createAIChatCore({ pages });
  }, [pages]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(workspaceId));
      if (raw !== null) setIsOpen(raw === "1");
    } catch { /* ignore */ }
  }, [workspaceId]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey(workspaceId), isOpen ? "1" : "0");
    } catch { /* ignore */ }
  }, [isOpen, workspaceId]);
  useEffect(() => {
    // On route change inside the workspace: exit full-page mode but keep the
    // toggle state (persisted per workspace) so the minichat follows the user.
    setForcedFull(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (isOpen || forcedFull) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, forcedFull]);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);
  useEffect(() => {
    const onToggle = (): void => setIsOpen((v) => !v);
    const onOpen = (): void => setIsOpen(true);
    const onClose = (): void => {
      setIsOpen(false);
      setForcedFull(false);
    };
    window.addEventListener(EVT_TOGGLE, onToggle);
    window.addEventListener(EVT_OPEN, onOpen);
    window.addEventListener(EVT_CLOSE, onClose);
    return () => {
      window.removeEventListener(EVT_TOGGLE, onToggle);
      window.removeEventListener(EVT_OPEN, onOpen);
      window.removeEventListener(EVT_CLOSE, onClose);
    };
  }, []);
  if (!enabled) return null;
  const isPageVariant = forcedFull;
  const isEmptyState = messages.length === 0 && !isStreaming;
  const handleSend = (override?: string): void => {
    const text = (override ?? input).trim();
    if (!text || isStreaming) return;
    setInput("");
    setError(null);
    pushMessage({ role: "user", content: text });
    setStreaming(true);
    pushMessage({ role: "assistant", content: "", streaming: true });
    const controller = new AbortController();
    abortRef.current = controller;
    const ctx = coreRef.current.buildContext();
    void coreRef.current
      .streamChat(text, ctx, controller.signal)
      .then((reply: string) => {
        setStreaming(false);
        replaceLast({ role: "assistant", content: reply, streaming: false });
      })
      .catch((err: unknown) => {
        setStreaming(false);
        const e = err as { name?: string; message?: string };
        if (e?.name !== "AbortError") {
          setError(e?.message?.includes("Failed to fetch") ? "Impossibile comunicare con il servizio AI. Riprova piu tardi." : (e?.message ?? "Errore AI"));
          popLast();
        }
      })
      .finally(() => {
        abortRef.current = null;
      });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleClose = (): void => {
    setIsOpen(false);
    setForcedFull(false);
  };
  const fab = !isPageVariant ? (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && !isOpen && (
          <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => { setExpanded(false); setIsOpen(true); }} className="rounded-full bg-white border px-4 py-3 text-sm font-semibold shadow-xl">
            Apri chat
          </motion.button>
        )}
      </AnimatePresence>
      <motion.button onClick={() => setIsOpen(!isOpen)} onMouseEnter={() => setExpanded(true)} onMouseLeave={() => setExpanded(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-12 h-12 rounded-full bg-[#7b39fc] text-white flex items-center justify-center shadow-xl" aria-label="Toggle minichat">
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>
    </div>
  ) : null;
  const panelCls = isPageVariant
    ? "fixed top-0 bottom-0 right-0 left-0 md:left-64 z-[51] bg-white dark:bg-gray-950 flex flex-col"
    : "fixed bottom-6 right-6 z-[120] w-[420px] max-w-[calc(100vw-48px)] h-[640px] max-h-[calc(100vh-48px)] bg-white dark:bg-gray-950 rounded-2xl border shadow-2xl flex flex-col";
  return (
    <>
      {fab}
      <AnimatePresence>
        {(isOpen || isPageVariant) && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className={panelCls} role="dialog" aria-label="Assistente AI workspace">
            <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#7b39fc]/10 flex items-center justify-center">
                  <Sparkles size={14} className="text-[#7b39fc]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">Assistente AI</h3>
                  {workspaceId && <p className="text-[10px] text-gray-400 mt-1">Workspace {workspaceId}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isPageVariant && (
                  <button onClick={() => setForcedFull(true)} className="p-1.5 rounded-lg text-gray-400" aria-label="Apri a schermo intero">
                    <Maximize2 size={14} />
                  </button>
                )}
                {messages.length > 0 && (
                  <button onClick={() => clearAll()} className="p-1.5 rounded-lg text-gray-400" aria-label="Pulisci chat">
                    <Trash2 size={14} />
                  </button>
                )}
                <button onClick={handleClose} className="p-1.5 rounded-lg text-gray-400" aria-label="Chiudi chat">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 flex flex-col">
              {isEmptyState && (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7b39fc]/10 flex items-center justify-center mb-4">
                    <Sparkles size={20} className="text-[#7b39fc]" />
                  </div>
                  <p className="text-sm font-bold mb-1">Come posso aiutarti?</p>
                  <p className="text-xs text-gray-400">Chiedimi di riassumere note, creare task o piani.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {error && <div className="bg-red-50 border rounded-xl px-4 py-3 text-xs text-red-600">{error}</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t">
              <div className="flex items-end gap-2">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Scrivi un messaggio..." rows={1} className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm border" style={{ maxHeight: 120 }} />
                {isStreaming ? (
                  <button onClick={() => abortRef.current?.abort()} className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center" aria-label="Interrompi">
                    <X size={16} />
                  </button>
                ) : (
                  <button onClick={() => handleSend()} disabled={!input.trim()} className="w-9 h-9 rounded-xl bg-[#7b39fc] text-white flex items-center justify-center disabled:opacity-30" aria-label="Invia">
                    <Send size={15} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

