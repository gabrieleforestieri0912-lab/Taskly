"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useRef } from "react";
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
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAIChat, createAIChatController } from "../lib/aiChatStore";
import type { OnAction } from "../lib/aiChatStore";

const QUICK_ACTIONS = [
  { id: "sum", icon: FileText, label: "Riassumi" },
  { id: "task", icon: CheckSquare, label: "Crea task" },
  { id: "plan", icon: Target, label: "Crea piano" },
];

function MessageBubble({ msg }: { msg: { role: string; content: string; streaming?: boolean } }) {
  const [copied, setCopied] = React.useState(false);
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
            <div className="w-4 h-4 rounded               bg-[#7b39fc]/10 flex items-center justify-center">
              <Sparkles size={9} className="              text-[#7b39fc]" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
              AI Assistant
            </span>
          </div>
        )}
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-[#7b39fc] text-white rounded-2xl rounded-br-md"
              : "bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-bl-md"
          }`}
        >
          {msg.content || "…"}
          {msg.streaming && (
            <span className="inline-block w-1.5 h-4               bg-[#7b39fc] ml-0.5 animate-pulse rounded-full align-middle" />
          )}
        </div>
        {!isUser && !msg.streaming && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AIPanel({
  pages = [],
  onAction,
  variant = "floating",
  isSidebarOpen = true,
}: {
  pages?: any[];
  onAction?: (action: any) => any;
  variant?: "floating" | "page";
  isSidebarOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(variant === "page");
  const [forcedFull, setForcedFull] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, isStreaming, error } = useAIChat();

  const controller = createAIChatController({ pages, onAction });

  const isPageVariant = variant === "page" || forcedFull;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Open full-page chat when ?ai=1 is in the URL (sidebar AI button).
  useEffect(() => {
    if (searchParams?.get("ai")) {
      setForcedFull(true);
      setIsOpen(true);
    }
  }, [searchParams]);

  // Floating variant closes on route change (unless opened full-page).
  useEffect(() => {
    if (!isPageVariant && !searchParams?.get("ai")) {
      setIsOpen(false);
      setForcedFull(false);
    }
  }, [isPageVariant, pathname, searchParams]);

  // Focus input on open.
  useEffect(() => {
    if (isOpen || isPageVariant) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, isPageVariant]);

  // Auto-scroll.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const isEmptyState = messages.length === 0 && !isStreaming;

  const handleSend = (override?: string) => {
    const detected = controller.detectAction(input) || null;
    if (detected) {
      controller.sendAction(detected).then(() => setInput(""));
      return;
    }
    setInput("");
    void controller.send(override ?? input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setForcedFull(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("ai");
      router.replace(url.pathname + url.search, { scroll: false });
    } catch {}
    window.dispatchEvent(new Event("close-ai-panel-page"));
  };

  const panelClasses = isPageVariant
    ? `font-inter fixed top-0 bottom-0 right-0 ${isSidebarOpen ? "left-64" : "left-0"} z-[51] bg-white dark:bg-gray-950 rounded-none border-0 shadow-none flex flex-col overflow-hidden`
    : "font-inter fixed bottom-6 right-6 z-[120] w-[420px] max-w-[calc(100vw-48px)] h-[640px] max-h-[calc(100vh-48px)] bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col overflow-hidden";

  return (
    <>
      {/* Floating reactive button (Notion-style) */}
      {!isPageVariant && (
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-2">
          {/* expanding label */}
          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  setExpanded(false);
                  setIsOpen(true);
                }}
                className="flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-xl hover:scale-105 transition-transform"
              >
                <Maximize2 size={15} className="              text-[#7b39fc]" />
                Apri chat a schermo intero
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            whileHover={{ scale: 1.1, rotate: 6 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: isOpen
                ? "0 0 0 0 rgba(                123,57,252,0.5)"
                : "0 0 24px 4px rgba(                123,57,252,0.35)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="group relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#7b39fc] to-[#a67cff] text-white shadow-xl shadow-[#7b39fc]/30"
            aria-label="Apri chat AI"
          >
            {/* pulsing ring when unread replies exist */}
            {messages.length > 0 && !isOpen && (
              <span className="absolute inset-0 rounded-full               bg-[#7b39fc] opacity-60 animate-ping" />
            )}
            {isStreaming && !isOpen && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            )}
            {isOpen ? (
              <X size={22} />
            ) : (
              <span className="relative">
                <Sparkles size={22} className="transition-transform duration-200 group-hover:scale-110" />
              </span>
            )}
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {(isOpen || isPageVariant) && (
          <>
            {!isPageVariant && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-110 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
              />
            )}
            <motion.div
              initial={isPageVariant ? false : { opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={panelClasses}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg               bg-[#7b39fc]/10 flex items-center justify-center">
                    <Sparkles size={14} className="              text-[#7b39fc]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                    Assistente AI
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {!isPageVariant && (
                    <button
                      onClick={() => setForcedFull(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                      title="Apri a schermo intero"
                    >
                      <Maximize2 size={14} />
                    </button>
                  )}
                  {messages.length > 0 && (
                    <button
                      onClick={controller.clear}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                      title="Pulisci chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={handleClose}
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
                {isEmptyState && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-4">
                    <div className="w-12 h-12 rounded-2xl               bg-[#7b39fc]/10 flex items-center justify-center mb-4">
                      <Sparkles size={20} className="              text-[#7b39fc]" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Come posso aiutarti?
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Chiedimi di riassumere note, creare task o piani.
                    </p>
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

              {/* quick actions + input */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
                {isEmptyState && (
                  <div className="flex gap-2 flex-wrap">
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleSend(a.label)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-100 dark:border-gray-800 text-[11px] font-semibold hover:border-[#a67cff]/60 dark:hover:border-[#7b39fc]/60 hover:text-[#7b39fc] dark:hover:text-[#a67cff] transition-all"
                      >
                        <a.icon size={12} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scrivi un messaggio..."
                    rows={1}
                    className="flex-1 resize-none bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b39fc]/50 focus:border-[#7b39fc] leading-relaxed"
                    style={{ maxHeight: 120 }}
                  />
                  {isStreaming ? (
                    <button
                      onClick={controller.stop}
                      className="shrink-0 w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim()}
                      className="shrink-0 w-9 h-9 rounded-xl bg-[#7b39fc] text-white flex items-center justify-center hover:bg-[#8b4dff] transition-colors disabled:opacity-30 shadow-lg shadow-[#7b39fc]/20"
                    >
                      <Send size={15} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}