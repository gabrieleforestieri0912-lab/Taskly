"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useLanguage } from "../lib/LanguageContext";
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
  Mic,
  Plus,
  Square,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useAIChat, createAIChatController } from "../lib/aiChatStore";
import type { OnAction } from "../lib/aiChatStore";

type ChatInputProps = {
  input: string;
  setInput: (v: string | ((prev: string) => string)) => void;
  isStreaming: boolean;
  isEmptyState: boolean;
  handleSend: (override?: string) => void;
  controller: ReturnType<typeof createAIChatController>;
  // il secondo parametro è il fallback: `t()` restituisce la chiave quando
// la traduzione manca, e senza il fallback l'utente vedrebbe "views.aiSendLabel".
t: (key: string, fallback?: string) => string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
};

const QUICK_ACTIONS = [
  { id: "sum", icon: FileText, label: "Riassumi" },
  { id: "task", icon: CheckSquare, label: "Crea task" },
  { id: "plan", icon: Target, label: "Crea piano" },
];

function MessageBubble({ msg }: { msg: { role: string; content: string; streaming?: boolean } }) {
  const { t } = useLanguage();
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
            <div className="w-4 h-4 rounded bg-[#7b39fc]/10 flex items-center justify-center">
              <Sparkles size={9} className="text-[#7b39fc]" />
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
            <span className="inline-block w-1.5 h-4 bg-[#7b39fc] ml-0.5 rounded-full align-middle" />
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

const ChatInput = ({
  input,
  setInput,
  isStreaming,
  isEmptyState,
  handleSend,
  controller,
  t,
  inputRef,
}: ChatInputProps) => {
  const [textareaHeight, setTextareaHeight] = React.useState(44);
  const [showSuggestions, setShowSuggestions] = React.useState(true);
  const [composing, setComposing] = React.useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  const suggestedPrompts = React.useMemo(
    () => [
      t("views.aiSuggest1", "Riassumi le mie note"),
      t("views.aiSuggest2", "Crea un piano settimanale"),
      t("views.aiSuggest3", "Trova task scaduti"),
      t("views.aiSuggest4", "Organizza i miei progetti"),
    ],
    [t]
  );

  const adjustHeight = React.useCallback(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 22;
    const maxRows = 6;
    const maxHeight = lineHeight * maxRows + 16;
    const newHeight = Math.min(ta.scrollHeight, maxHeight);
    setTextareaHeight(newHeight);
    ta.style.height = `${newHeight}px`;
  }, [inputRef]);

  React.useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  React.useEffect(() => {
    if (!isEmptyState) setShowSuggestions(false);
  }, [isEmptyState]);

  const onCompositionStart = () => setComposing(true);
  const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setComposing(false);
    if (e.nativeEvent.data) {
      setInput((prev) => prev + e.nativeEvent.data);
    }
  };

  const insertSuggestion = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e) {
      if (composing) return;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    } else {
      handleSend();
    }
  };

  const lastSentRef = React.useRef("");
  const originalHandleSend = handleSend;
  const wrappedHandleSend = React.useCallback(
    (override?: string | React.MouseEvent<HTMLButtonElement>) => {
      const text = typeof override === "string" ? override : input.trim();
      if (text) lastSentRef.current = text;
      originalHandleSend(typeof override === "string" ? override : undefined);
    },
    [input, originalHandleSend]
  );

  const { error } = useAIChat();
  React.useEffect(() => {
    if (error && lastSentRef.current && !input) {
      setInput(lastSentRef.current);
      lastSentRef.current = "";
    }
  }, [error, input, setInput]);

  const hasText = input.trim().length > 0;

  return (
    <div className="relative">
      <div
        className={`
          relative flex items-end gap-1.5
          bg-white dark:bg-gray-900
          border border-gray-300 dark:border-gray-700
          transition-all duration-200 ease-out
          focus-within:ring-2 focus-within:ring-[#7b39fc]/30 focus-within:border-[#7b39fc]/60
          max-w-[720px] mx-auto
          px-2 py-2
        `}
        style={{
          borderRadius: textareaHeight > 48 ? "26px" : "9999px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)",
        }}
        role="group"
        aria-label={t("views.aiInputLabel", "Input chat")}
      >
        <button
          type="button"
          className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t("views.aiAttachLabel", "Allega file")}
          disabled={isStreaming}
        >
          <Plus size={18} />
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleSubmit}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder={t("views.aiInputPh")}
          rows={1}
          className={`
            flex-1 min-h-[40px] max-h-[150px]
            bg-transparent border-0 resize-none
            text-[15px] text-gray-900 dark:text-gray-100
            placeholder-gray-400
            focus:outline-none
            leading-relaxed
            py-2 px-1
          `}
          style={{
            height: `${textareaHeight}px`,
            overflowY: textareaHeight >= 22 * 6 + 16 ? "auto" : "hidden",
          }}
          disabled={isStreaming}
          aria-label={t("views.aiInputPh")}
        />

        <div className="shrink-0 flex items-center justify-center">
          {isStreaming ? (
            <button
              type="button"
              onClick={controller.stop}
              className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label={t("views.aiStopLabel", "Ferma generazione")}
            >
              <Square size={16} />
            </button>
          ) : hasText ? (
            <motion.button
              type="button"
              onClick={wrappedHandleSend}
              initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-9 h-9 rounded-full bg-[#7b39fc] text-white flex items-center justify-center hover:bg-[#8b4dff] active:scale-95 transition-colors shadow-lg shadow-[#7b39fc]/20"
              aria-label={t("views.aiSendLabel", "Invia messaggio")}
            >
              <Send size={16} />
            </motion.button>
          ) : (
            <motion.button
              type="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-9 h-9 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
              aria-label={t("views.aiVoiceLabel", "Input vocale")}
              disabled
            >
              <Mic size={18} />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSuggestions && isEmptyState && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, staggerChildren: 0.03 }}
            className="mt-3 flex flex-wrap gap-2"
            role="list"
            aria-label={t("views.aiSuggestionsLabel", "Suggerimenti")}
          >
            {suggestedPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                onClick={() => insertSuggestion(prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                role="listitem"
              >
                <Sparkles size={12} className="text-[#7b39fc]" />
                {prompt}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {textareaHeight > 80 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

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
  const { t, tWith } = useLanguage();
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

  useEffect(() => {
    if (searchParams?.get("ai")) {
      setForcedFull(true);
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPageVariant && !searchParams?.get("ai")) {
      setIsOpen(false);
      setForcedFull(false);
    }
  }, [isPageVariant, pathname, searchParams]);

  useEffect(() => {
    if (isOpen || isPageVariant) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen, isPageVariant]);

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
      {!isPageVariant && (
        <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end gap-2">
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
                <Maximize2 size={15} className="text-[#7b39fc]" />{t("views.aiOpenFull")}</motion.button>
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
                ? "0 0 0 0 rgba(123,57,252,0.5)"
                : "0 0 24px 4px rgba(123,57,252,0.35)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="group relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#7b39fc] to-[#a67cff] text-white shadow-xl shadow-[#7b39fc]/30"
            aria-label={t("views.aiOpenChat")}
          >
            {messages.length > 0 && !isOpen && (
              <span className="absolute inset-0 rounded-full bg-[#7b39fc] opacity-60" />
            )}
            {isStreaming && !isOpen && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400" />
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
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7b39fc]/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-[#7b39fc]" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-none">{t("views.aiTitle")}</h3>
                </div>
                <div className="flex items-center gap-1">
                  {!isPageVariant && (
                    <button
                      onClick={() => setForcedFull(true)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                      title={t("views.aiOpenFullscreen")}
                    >
                      <Maximize2 size={14} />
                    </button>
                  )}
                  {messages.length > 0 && (
                    <button
                      onClick={() => controller.clear()}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                      title={t("views.aiClear")}
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

              {/* Stato vuoto: contenuto e input sono centrati insieme,
                  come in Google AI Mode. Dopo il primo messaggio l'input
                  torna in fondo al pannello ( ramo else ). */}
              {isEmptyState ? (
                <div className="flex-1 flex flex-col items-center justify-center overflow-y-hidden px-6 pb-10">
                  <div className="w-full max-w-[720px]">
                    <div className="flex flex-col items-center text-center mb-7">
                      <div className="w-12 h-12 rounded-2xl bg-[#7b39fc]/10 flex items-center justify-center mb-4">
                        <Sparkles size={20} className="text-[#7b39fc]" />
                      </div>
                      <p className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {t("views.aiHelp")}
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                        {t("views.aiHelpDesc")}
                      </p>
                    </div>

                    <ChatInput
                      input={input}
                      setInput={setInput}
                      isStreaming={isStreaming}
                      isEmptyState={isEmptyState}
                      handleSend={handleSend}
                      controller={controller}
                      t={t}
                      inputRef={inputRef}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar flex flex-col">
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

                  <ChatInput
                    input={input}
                    setInput={setInput}
                    isStreaming={isStreaming}
                    isEmptyState={isEmptyState}
                    handleSend={handleSend}
                    controller={controller}
                    t={t}
                    inputRef={inputRef}
                  />
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}