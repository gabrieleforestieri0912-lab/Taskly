/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  Button,
  EditableTitle,
  Skeleton,
} from "./UIComponents";
import { encryptText, decryptText } from "../lib/crypto";
import {
  Trash2,
  FileText,
  Sparkles,
  Tag as TagIcon,
  X,
  Hash,
  Plus,
  Type,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRight,
  Minus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Calendar,
  Heading1,
  Heading2,
  Heading3,
  ListTodo,
  Target,
  Video,
  Activity,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HabitTracker from "./HabitTracker";
import { track } from "../lib/activity";

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : "";
}

const BLOCK_TYPES = [
  { type: "text", label: "Testo", icon: Type, cmd: "/text" },
  { type: "h1", label: "Titolo 1", icon: Heading1, cmd: "/h1" },
  { type: "h2", label: "Titolo 2", icon: Heading2, cmd: "/h2" },
  { type: "h3", label: "Titolo 3", icon: Heading3, cmd: "/h3" },
  { type: "checkbox", label: "Checkbox", icon: CheckSquare, cmd: "/todo" },
  { type: "bullet", label: "Lista puntata", icon: List, cmd: "/bullet" },
  { type: "numbered", label: "Lista numerata", icon: ListOrdered, cmd: "/num" },
  { type: "toggle", label: "Toggle list", icon: ChevronRight, cmd: "/toggle" },
  { type: "calendar", label: "Task Calendar", icon: Calendar, cmd: "/cal" },
  { type: "habit", label: "Habit Tracker", icon: Activity, cmd: "/habit" },
  { type: "code", label: "Codice", icon: FileText, cmd: "/code" },
  { type: "youtube", label: "Video YouTube", icon: Video, cmd: "/yt" },
  { type: "document", label: "Documento / File", icon: FileText, cmd: "/doc" },
  { type: "divider", label: "Divisore", icon: Minus, cmd: "/div" },
  {
    type: "empty",
    label: "Nuova Pagina",
    icon: FileText,
    cmd: "/page",
    isPage: true,
  },
  {
    type: "tasks",
    label: "Nuova Lista Task",
    icon: ListTodo,
    cmd: "/list",
    isPage: true,
  },
  {
    type: "goals",
    label: "Nuovo Tracker Obiettivi",
    icon: Target,
    cmd: "/goal",
    isPage: true,
  },
  {
    type: "notes",
    label: "Nuovo Smart Notes",
    icon: Sparkles,
    cmd: "/notes",
    isPage: true,
  },
];

const TEXT_COLORS = [
  {
    value: "default",
    label: "Default",
    class: "text-gray-800 dark:text-gray-200",
  },
  { value: "red", label: "Rosso", class: "text-red-500 dark:text-red-400" },
  {
    value: "orange",
    label: "Arancione",
    class: "text-orange-500 dark:text-orange-400",
  },
  {
    value: "yellow",
    label: "Giallo",
    class: "text-yellow-600 dark:text-yellow-400",
  },
  {
    value: "green",
    label: "Verde",
    class: "text-green-500 dark:text-green-400",
  },
  { value: "blue", label: "Blu", class: "text-blue-500 dark:text-blue-400" },
  { value: "purple", label: "Viola", class: "text-[#7b39fc] dark:text-[#a67cff]" },
  { value: "cyan", label: "Lilla", class: "text-cyan-500 dark:text-cyan-400" },
  { value: "pink", label: "Rosa", class: "text-pink-500 dark:text-pink-400" },
  { value: "gray", label: "Grigio", class: "text-gray-400 dark:text-gray-500" },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getColorClass(color) {
  const found = TEXT_COLORS.find((c) => c.value === color);
  return found ? found.class : TEXT_COLORS[0].class;
}

function migrateOldData(data) {
  if (!data || (typeof data === "object" && !data.text && !data.blocks)) {
    return { blocks: [createBlock("text")], tags: data?.tags || [] };
  }
  if (typeof data === "string") {
    return {
      blocks: [
        { id: generateId(), type: "text", content: data, color: "default" },
      ],
      tags: [],
    };
  }
  if (data.text && !data.blocks) {
    const lines = (data.text || "").split("\n").filter((l) => l.trim() !== "");
    const blocks =
      lines.length > 0
        ? lines.map((line) => ({
            id: generateId(),
            type: "text",
            content: line,
            color: "default",
          }))
        : [createBlock("text")];
    return { blocks, tags: data.tags || [] };
  }
  if (data.blocks) {
    return { blocks: data.blocks, tags: data.tags || [] };
  }
  return { blocks: [createBlock("text")], tags: [] };
}

function createBlock(type) {
  const base = { id: generateId(), type, content: "", color: "default" };
  switch (type) {
    case "checkbox":
      return { ...base, checked: false };
    case "numbered":
      return { ...base, number: 1 };
    case "toggle":
      return { ...base, expanded: false, children: [] };
    case "divider":
      return { id: generateId(), type: "divider" };
    case "code":
      return { ...base, lang: "javascript", content: "" };
    case "image":
      return { ...base, src: "", alt: "" };
    case "youtube":
      return { ...base, src: "" };
    case "document":
      return { ...base, src: "", alt: "", size: "" };
    case "habit":
      return { ...base, month: new Date().getMonth(), year: new Date().getFullYear() };
    default:
      return base;
  }
}

/* ─── Block component ─────────────────────────────────────────── */

function BlockItem({
  block,
  index,
  onUpdate,
  onDelete,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  totalCount,
  onAddPage,
  activePageId,
  allPages = [] as any[],
  onInsertPageRef,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bracketMenuOpen, setBracketMenuOpen] = useState(false);
  const [bracketQuery, setBracketQuery] = useState("");
  const [bracketSelectedIndex, setBracketSelectedIndex] = useState(0);
  const [bracketInputPos, setBracketInputPos] = useState(-1);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setSlashMenuOpen(false);
        setBracketMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBlocks = BLOCK_TYPES.filter(
    (bt) =>
      (bt.label?.toLowerCase() || "").includes(slashQuery.toLowerCase()) ||
      (bt.cmd?.toLowerCase() || "").includes(slashQuery.toLowerCase()),
  );

  const bracketPageItems = (allPages || [])
    .filter((p) => !p.deleted)
    .filter((p) => (p.label || "").toLowerCase().includes(bracketQuery.toLowerCase()));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (bracketMenuOpen && bracketPageItems.length > 0) {
        e.preventDefault();
        const page = bracketPageItems[bracketSelectedIndex];
        if (onInsertPageRef) {
          onInsertPageRef(block.id, bracketInputPos, page.id, page.label, page.icon, page.iconColor);
        }
        setBracketMenuOpen(false);
        setBracketQuery("");
        return;
      }
      if (slashMenuOpen && filteredBlocks.length > 0) {
        e.preventDefault();
        const selected = filteredBlocks[selectedIndex];
        if (selected.isPage) {
          onAddPage &&
            onAddPage({
              type: selected.type,
              label: `Sotto-pagina ${selected.label}`,
              parentId: activePageId,
            });
          onDelete(block.id);
        } else {
          const properBlock = createBlock(selected.type);
          onUpdate(block.id, { ...properBlock, id: block.id });
        }
        setSlashMenuOpen(false);
        return;
      }
      e.preventDefault();
      onAddBelow(block.id);
    }
    if (bracketMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setBracketSelectedIndex((prev) => (prev + 1) % Math.max(bracketPageItems.length, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setBracketSelectedIndex((prev) => (prev - 1 + bracketPageItems.length) % Math.max(bracketPageItems.length, 1));
      } else if (e.key === "Escape") {
        e.preventDefault();
        setBracketMenuOpen(false);
        setBracketQuery("");
      }
      return;
    }
    if (slashMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredBlocks.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredBlocks.length) % filteredBlocks.length,
        );
      } else if (e.key === "Escape") {
        setSlashMenuOpen(false);
      }
      return;
    }
    if (
      e.key === "Backspace" &&
      block.content === "" &&
      block.type !== "divider"
    ) {
      e.preventDefault();
      onDelete(block.id);
    }
  };

  const renderPrefix = () => {
    switch (block.type) {
      case "checkbox":
        return (
          <button
            onClick={() => onUpdate(block.id, { checked: !block.checked })}
            className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              block.checked
                ? "bg-gray-800 dark:bg-gray-200 border-gray-800 dark:border-gray-200 text-white dark:text-gray-900"
                : "border-gray-300 dark:border-gray-700 hover:border-gray-400"
            }`}
          >
            {block.checked && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L5 9L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      case "bullet":
        return (
          <span className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 text-lg leading-none">
            •
          </span>
        );
      case "numbered":
        return (
          <span className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 text-xs font-bold">
            {block.number || index + 1}.
          </span>
        );
      case "toggle":
        return (
          <button
            onClick={() => onUpdate(block.id, { expanded: !block.expanded })}
            className={`shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-transform ${block.expanded ? "rotate-90" : ""}`}
          >
            <ChevronRight size={16} />
          </button>
        );
      default:
        return null;
    }
  };

  if (block.type === "divider") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="group flex items-center gap-2 py-2"
      >
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-start gap-1 py-1 relative"
      ref={menuRef}
    >
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-0.5">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <Plus size={14} />
        </button>
      </div>

      <AnimatePresence>
        {slashMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute left-10 top-full mt-1 z-100 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 w-64 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Blocchi disponibili
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredBlocks.map((bt, i) => {
                const Icon = bt.icon;
                return (
                  <button
                    key={bt.type}
                    onClick={() => {
                      if (bt.isPage) {
                        onAddPage &&
                          onAddPage({
                            type: bt.type,
                            label: `Sotto-pagina ${bt.label}`,
                            parentId: activePageId,
                          });
                        onDelete(block.id);
                      } else {
                        const properBlock = createBlock(bt.type);
                        onUpdate(block.id, { ...properBlock, id: block.id });
                      }
                      setSlashMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${i === selectedIndex ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100 dark:bg-gray-800"}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">
                        {bt.label}
                      </p>
                      <p className="text-[10px] opacity-60 font-medium">
                        {bt.cmd}
                      </p>
                    </div>
                  </button>
                );
              })}
              {filteredBlocks.length === 0 && (
                <p className="p-4 text-center text-xs text-gray-400 italic">
                  Nessun comando trovato
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bracket suggestion popup */}
      <AnimatePresence>
        {bracketMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute left-10 top-full mt-1 z-100 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 w-64 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Collega pagina
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {bracketPageItems.map((page, i) => {
                const IconComp = LucideIcons[page.icon] || FileText;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      if (onInsertPageRef) {
                        onInsertPageRef(block.id, bracketInputPos, page.id, page.label, page.icon, page.iconColor);
                      }
                      setBracketMenuOpen(false);
                      setBracketQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      i === bracketSelectedIndex
                        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${i === bracketSelectedIndex ? "bg-white dark:bg-gray-800 shadow-sm" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <IconComp size={16} className={page.iconColor || "text-gray-400"} />
                    </div>
                    <p className="text-sm font-bold leading-tight truncate">
                      {page.label || "(senza titolo)"}
                    </p>
                  </button>
                );
              })}
              {bracketPageItems.length === 0 && (
                <p className="p-4 text-center text-xs text-gray-400 italic">
                  Nessuna pagina trovata
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            className="absolute left-0 top-8 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-1.5 w-52"
          >
            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Inserisci blocco
            </p>
            {BLOCK_TYPES.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  onClick={() => {
                    onAddBelow(block.id, bt.type);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Icon size={16} className="text-gray-400" />
                  {bt.label}
                </button>
              );
            })}
            <hr className="my-1 border-gray-200 dark:border-gray-800" />
            <button
              onClick={() => {
                onMoveUp && onMoveUp(block.id);
                setShowMenu(false);
              }}
              disabled={index === 0}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 transition-colors disabled:opacity-40"
            >
              <ArrowUp size={16} />
              Sposta su
            </button>
            <button
              onClick={() => {
                onMoveDown && onMoveDown(block.id);
                setShowMenu(false);
              }}
              disabled={index >= totalCount - 1}
              className="w-full flex items-center gap-2.5 mt-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 transition-colors disabled:opacity-40"
            >
              <ArrowDown size={16} />
              Sposta giù
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-800" />
            <button
              onClick={() => {
                onDelete(block.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-500 transition-colors"
            >
              <Trash2 size={16} />
              Elimina blocco
            </button>
          </motion.div>
        )}
        {/* Color picker removed per user request */}
      </AnimatePresence>

      <div className="flex-1 flex items-start gap-2">
        {renderPrefix()}
        {/* Render different editors based on block type */}
        {block.type === "code" ? (
          <div className="flex-1 bg-zinc-900 dark:bg-black rounded-2xl overflow-hidden shadow-xl border border-zinc-800">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={block.lang || "javascript"}
                  onChange={(e) => onUpdate(block.id, { lang: e.target.value })}
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-400 focus:ring-0 cursor-pointer outline-none hover:text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                  <option value="json">JSON</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(block.content || "");
                    alert("Codice copiato negli appunti!");
                  }}
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                  title="Copia codice"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Terminal Textarea */}
            <textarea
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              placeholder="// Scrivi il tuo codice qui..."
              className="w-full min-h-32 p-4 font-mono text-xs bg-transparent border-none outline-none text-emerald-400 focus:ring-0 resize-y leading-relaxed"
            />
          </div>
        ) : block.type === "image" ? (
          <div className="flex-1">
            {block.src ? (
              <div className="space-y-2">
                <img
                  src={block.src}
                  alt={block.alt || "img"}
                  className="max-w-full rounded"
                />
                <input
                  type="text"
                  value={block.alt || ""}
                  onChange={(e) => onUpdate(block.id, { alt: e.target.value })}
                  placeholder="Alt text"
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      onUpdate(block.id, { src: reader.result });
                    reader.readAsDataURL(f);
                  }}
                />
                <span className="text-sm text-gray-500">Carica immagine</span>
              </div>
            )}
          </div>
        ) : block.type === "youtube" ? (
          <div className="flex-1">
            {block.src ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                  <iframe
                    src={block.src}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-none"
                  />
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-500">
                    Video Incorporato YouTube
                  </span>
                  <button
                    onClick={() => onUpdate(block.id, { src: "" })}
                    className="text-[9px] font-black uppercase tracking-widest text-cyan-600 hover:underline"
                  >
                    Modifica Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/10 flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M10 15V9l5 3-5 3z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">
                    Incorpora Video YouTube
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Inserisci l&apos;URL di un video per incorporarlo nel tuo
                    foglio
                  </p>
                </div>
                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const embed = getYouTubeEmbedUrl(e.currentTarget.value);
                        if (embed) onUpdate(block.id, { src: embed });
                        else alert("URL YouTube non valido.");
                      }
                    }}
                    className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                  <Button
                    onClick={(e) => {
                      const input = e.target.previousSibling.value;
                      const embed = getYouTubeEmbedUrl(input);
                      if (embed) onUpdate(block.id, { src: embed });
                      else alert("URL YouTube non valido.");
                    }}
                    className="h-10 text-[10px] font-black uppercase tracking-widest px-6"
                  >
                    Incorpora
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : block.type === "document" ? (
          <div className="flex-1">
            {block.src ? (
              <div className="flex items-center justify-between p-4 bg-cyan-50/50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/20 rounded-2xl group/doccard shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/15 shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                      {block.alt || "documento_allegato"}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mt-0.5">
                      {block.size || "Allegato Local"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={block.src}
                    download={block.alt || "allegato"}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-500/10 hover:bg-cyan-700 transition-all shrink-0"
                  >
                    Scarica
                  </a>
                  <button
                    onClick={() =>
                      onUpdate(block.id, { src: "", alt: "", size: "" })
                    }
                    className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/10 flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 flex items-center justify-center text-cyan-500">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-gray-200">
                    Allega Documento o File
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Carica un file PDF, DOCX, TXT o qualsiasi foglio dal tuo PC
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-6 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 rounded-xl cursor-pointer transition-all shadow-md shadow-cyan-500/5">
                    Scegli File...
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const sizeMB =
                          (file.size / (1024 * 1024)).toFixed(2) + " MB";
                        const reader = new FileReader();
                        reader.onload = () => {
                          onUpdate(block.id, {
                            src: reader.result,
                            alt: file.name,
                            size: sizeMB,
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        ) : block.type === "calendar" ? (
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-cyan-600">
                <Calendar size={18} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Mini Task Planner
                </span>
              </div>
              <button
                onClick={() => {
                  const newTasks = [
                    ...(block.tasks || []),
                    { id: generateId(), title: "", done: false },
                  ];
                  onUpdate(block.id, { tasks: newTasks });
                }}
                className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {(block.tasks || []).map((t, ti) => (
                <div
                  key={t.id || ti}
                  className="flex items-center gap-3 group/task"
                >
                  <button
                    onClick={() => {
                      const newTasks = [...block.tasks];
                      newTasks[ti] = {
                        ...newTasks[ti],
                        done: !newTasks[ti].done,
                      };
                      onUpdate(block.id, { tasks: newTasks });
                    }}
                    className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${t.done ? "bg-cyan-500 border-cyan-500 text-white" : "border-gray-300 dark:border-gray-700"}`}
                  >
                    {t.done && <CheckSquare size={10} />}
                  </button>
                  <input
                    type="text"
                    value={t.title}
                    onChange={(e) => {
                      const newTasks = [...block.tasks];
                      newTasks[ti] = { ...newTasks[ti], title: e.target.value };
                      onUpdate(block.id, { tasks: newTasks });
                    }}
                    placeholder="Nuovo task..."
                    className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${t.done ? "line-through opacity-50" : ""}`}
                  />
                  <button
                    onClick={() => {
                      const newTasks = block.tasks.filter((_, i) => i !== ti);
                      onUpdate(block.id, { tasks: newTasks });
                    }}
                    className="opacity-0 group-hover/task:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {(block.tasks || []).length === 0 && (
                <p className="text-[10px] text-center text-gray-400 py-2 italic">
                  Aggiungi i tuoi task qui
                </p>
              )}
            </div>
          </div>
        ) : block.type === "habit" ? (
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <HabitTracker
                initialMonth={block.month}
                initialYear={block.year}
              />
            </div>
          </div>
        ) : block.type === "page-ref" ? (
          <div className="flex-1">
            <a
              href={`/dashboard?page=${block.pageId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all text-sm font-semibold shadow-sm"
            >
              {(() => {
                const IconComp = LucideIcons[block.icon] || FileText;
                return <IconComp size={16} className={block.iconColor || "text-cyan-500"} />;
              })()}
              <span>{block.label || "Pagina"}</span>
            </a>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
              <button
                onClick={() => {
                  if (block.content === undefined) {
                    onUpdate(block.id, { content: "" });
                  }
                }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => onDelete(block.id)}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => onMoveUp && onMoveUp(block.id)}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-30"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => onMoveDown && onMoveDown(block.id)}
                disabled={index >= totalCount - 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-30"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={block.content}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate(block.id, { content: val });

              const bracketIdx = val.lastIndexOf("[[");
              if (bracketIdx !== -1) {
                const afterBracket = val.slice(bracketIdx + 2);
                const bracketEnd = afterBracket.indexOf("]]");
                const q = bracketEnd !== -1 ? afterBracket.slice(0, bracketEnd) : afterBracket;
                setBracketMenuOpen(true);
                setBracketQuery(q);
                setBracketInputPos(bracketIdx);
                setBracketSelectedIndex(0);
                setSlashMenuOpen(false);
              } else if (bracketMenuOpen) {
                setBracketMenuOpen(false);
                setBracketQuery("");
              }

              if (val.endsWith("/")) {
                setSlashMenuOpen(true);
                setSlashQuery("");
                setSelectedIndex(0);
              } else if (slashMenuOpen) {
                const lastSlashIdx = val.lastIndexOf("/");
                if (lastSlashIdx !== -1) {
                  setSlashQuery(val.substring(lastSlashIdx + 1));
                } else {
                  setSlashMenuOpen(false);
                }
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              block.type === "checkbox"
                ? "Checkbox..."
                : block.type === "toggle"
                  ? "Toggle..."
                  : block.type === "h1"
                    ? "Titolo 1..."
                    : block.type === "h2"
                      ? "Titolo 2..."
                      : block.type === "h3"
                        ? "Titolo 3..."
                        : "Scrivi qualcosa... (digita / per i comandi)"
            }
            className={`flex-1 bg-transparent border-none outline-none leading-relaxed placeholder-gray-300 dark:placeholder-gray-700 ${getColorClass(block.color)} ${
              block.type === "checkbox" && block.checked
                ? "line-through opacity-60"
                : ""
            } ${
              block.type === "h1"
                ? "text-3xl font-black"
                : block.type === "h2"
                  ? "text-2xl font-black"
                  : block.type === "h3"
                    ? "text-xl font-bold"
                    : "text-base"
            }`}
          />
        )}
      </div>

      {block.type === "toggle" && block.expanded && (
        <div className="ml-12 mt-1 mb-2 w-full">
          <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-1">
            {(block.children || []).map((child, ci) => (
              <div key={child.id || ci} className="flex items-center gap-2">
                <input
                  type="text"
                  value={child.content || ""}
                  onChange={(e) => {
                    const newChildren = [...(block.children || [])];
                    newChildren[ci] = {
                      ...newChildren[ci],
                      content: e.target.value,
                    };
                    onUpdate(block.id, { children: newChildren });
                  }}
                  placeholder="Contenuto..."
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${getColorClass(child.color || "default")}`}
                />
                <button
                  onClick={() => {
                    const newChildren = (block.children || []).filter(
                      (_, i) => i !== ci,
                    );
                    onUpdate(block.id, { children: newChildren });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newChildren = [
                  ...(block.children || []),
                  { id: generateId(), content: "", color: "default" },
                ];
                onUpdate(block.id, { children: newChildren });
              }}
              className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 py-1 transition-colors"
            >
              <Plus size={12} /> Aggiungi riga
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function NotesView({
  title,
  data,
  setData,
  onRename,
  loading = false,
  onAddPage,
  activePageId,
  allPages = [] as any[],
}) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-150 w-full rounded-[2.5rem]" />
      </div>
    );
  }
  const migrated = migrateOldData(data);
  const [blocks, setBlocks] = useState(migrated.blocks);
  const [tags, setTags] = useState(migrated.tags);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Version history + publish
  const [published, setPublished] = useState<boolean>(!!(data && data.published));
  const [versions, setVersions] = useState<any[]>(data?.versions || []);
  const [showVersions, setShowVersions] = useState(false);
  const [pubCopied, setPubCopied] = useState(false);

  // E2EE Zero-Knowledge Cryptography States
  const [passcode, setPasscode] = useState("");
  const [isNoteLocked, setIsNoteLocked] = useState(() => {
    return migrated.blocks.some(
      (b) => typeof b.content === "string" && b.content.startsWith("E2EE_"),
    );
  });
  const [decryptError, setDecryptError] = useState("");
  const [isCryptedActive, setIsCryptedActive] = useState(() => {
    return migrated.blocks.some(
      (b) => typeof b.content === "string" && b.content.startsWith("E2EE_"),
    );
  });

  const handleUnlock = async () => {
    try {
      setDecryptError("");
      const decrypted = [] as any[];
      for (const b of migrated.blocks) {
        if (typeof b.content === "string" && b.content.startsWith("E2EE_")) {
          const dec = await decryptText(b.content, passcode);
          decrypted.push({ ...b, content: dec });
        } else {
          decrypted.push(b);
        }
      }
      setBlocks(decrypted);
      setIsNoteLocked(false);
      setIsCryptedActive(true);
    } catch (err) {
      setDecryptError("Password non valida. Riprova.");
    }
  };

  const handleEncryptNote = async (password) => {
    if (!password) return;
    const encrypted = [] as any[];
    for (const b of blocks) {
      if (b.content && !b.content.startsWith("E2EE_")) {
        const enc = await encryptText(b.content, password);
        encrypted.push({ ...b, content: enc });
      } else {
        encrypted.push(b);
      }
    }
    setBlocks(encrypted);
    setPasscode(password);
    setIsNoteLocked(false);
    setIsCryptedActive(true);
    setData({ blocks: encrypted, tags, versions, published });
  };
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const blockPickerRef = useRef<HTMLDivElement | null>(null);

  // Use useMemo to derive state from props instead of useEffect to avoid cascading renders
  const currentData = React.useMemo(() => migrateOldData(data), [data]);

  // Sync local state with derived data only when it actually changes using a state-based comparison
  const [prevData, setPrevData] = useState(currentData);

  if (JSON.stringify(prevData) !== JSON.stringify(currentData)) {
    setPrevData(currentData);
    setBlocks(currentData.blocks);
    setTags(currentData.tags);
  }
  // Note: This pattern is the recommended way to adjust state based on props
  // when you need to keep local state that can also be edited.
  // Ref: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes

  useEffect(() => {
    if (isNoteLocked) return; // Prevent saving encrypted data in clear text

    const timeout = setTimeout(async () => {
      let finalBlocks = blocks;
      // If E2EE is active and we have a derived password, auto-encrypt blocks on save
      if (isCryptedActive && passcode) {
        finalBlocks = await Promise.all(
          blocks.map(async (b) => {
            if (b.content && !b.content.startsWith("E2EE_")) {
              const enc = await encryptText(b.content, passcode);
              return { ...b, content: enc };
            }
            return b;
          }),
        );
      }

      setData({ blocks: finalBlocks, tags, versions, published });
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
    }, 800);
    return () => clearTimeout(timeout);
  }, [blocks, setData, tags, isNoteLocked, isCryptedActive, passcode, versions, published]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        blockPickerRef.current &&
        !blockPickerRef.current.contains(e.target)
      ) {
        setShowBlockPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateBlock = useCallback((id, updates) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  }, []);

  const deleteBlock = useCallback(
    (id) => {
      if (blocks.length <= 1) return;
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    },
    [blocks.length],
  );

  const addBlockBelow = useCallback((afterId, type = "text") => {
    const newBlock = createBlock(type);
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === afterId);
      const arr = [...prev];
      arr.splice(idx + 1, 0, newBlock);
      return arr;
    });
  }, []);

  const addBlock = (type) => {
    const newBlock = createBlock(type);
    setBlocks((prev) => [...prev, newBlock]);
    setShowBlockPicker(false);
  };

  const saveVersion = () => {
    setVersions((prev) => [
      {
        id: generateId(),
        at: new Date().toISOString(),
        label: new Date().toLocaleString("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        blocks: JSON.parse(JSON.stringify(blocks)),
        tags,
      },
      ...prev,
    ].slice(0, 20));
  };

  const restoreVersion = (v) => {
    setBlocks(JSON.parse(JSON.stringify(v.blocks)));
    setTags(v.tags || []);
    setShowVersions(false);
  };

  const deleteVersion = (id) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  };

  const togglePublish = () => {
    setPublished((p) => {
      const next = !p;
      if (next) {
        track({
          type: "note_published",
          title: "Pagina pubblicata",
          body: `"${title}" è ora pubblica.`,
          payload: { event: "page", pageId: activePageId },
        });
      }
      return next;
    });
  };

  const copyPublishLink = async () => {
    try {
      const url = `${window.location.origin}/dashboard?page=${activePageId}`;
      await navigator.clipboard.writeText(url);
      setPubCopied(true);
      setTimeout(() => setPubCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const moveBlockUp = useCallback((id) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx <= 0) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(idx - 1, 0, item);
      return arr;
    });
  }, []);

  const moveBlockDown = useCallback((id) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      const arr = [...prev];
      const [item] = arr.splice(idx, 1);
      arr.splice(idx + 1, 0, item);
      return arr;
    });
  }, []);

  const insertPageRef = useCallback((id, bracketPos, pageId, pageLabel, pageIcon, pageIconColor) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const block = prev[idx];
      const content = block.content || "";
      const bracketStart = content.lastIndexOf("[[", bracketPos);
      if (bracketStart === -1) return prev;
      const bracketEnd = content.indexOf("]]", bracketPos);
      const textBefore = content.slice(0, bracketStart).trim();
      const textAfter = bracketEnd !== -1 ? content.slice(bracketEnd + 2).trim() : "";
      const beforeBlock = textBefore ? { ...createBlock("text"), content: textBefore } : null;
      const afterBlock = textAfter ? { ...createBlock("text"), content: textAfter } : null;
      const refBlock = {
        id: generateId(),
        type: "page-ref",
        pageId: String(pageId),
        label: pageLabel || "Pagina",
        icon: pageIcon || "FileText",
        iconColor: pageIconColor || "text-cyan-500",
      };
      const arr = [...prev];
      const replacement = [] as any[];
      if (beforeBlock) replacement.push(beforeBlock);
      replacement.push(refBlock);
      if (afterBlock) replacement.push(afterBlock);
      arr.splice(idx, 1, ...replacement);
      return arr;
    });
  }, []);

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Renumera le liste numerate
  const renumberedBlocks = blocks.map((b, i) => {
    if (b.type !== "numbered") return b;
    let num = 1;
    for (let j = i - 1; j >= 0; j--) {
      if (blocks[j].type !== "numbered") break;
      num++;
    }
    return { ...b, number: num };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col gap-6 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Publish */}
          <button
            onClick={togglePublish}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
              published
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:text-gray-800"
            }`}
          >
            <LucideIcons.Globe size={12} />
            {published ? "Pubblicata" : "Pubblica"}
          </button>
          {published && (
            <button
              onClick={copyPublishLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 border border-cyan-200 dark:border-cyan-800 transition-all hover:brightness-95"
            >
              <LucideIcons.Link2 size={12} />
              {pubCopied ? "Copiato!" : "Copia link"}
            </button>
          )}

          {/* Version history */}
          <button
            onClick={() => setShowVersions((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:text-gray-700 transition-all"
          >
            <LucideIcons.History size={12} />
            Versioni ({versions.length})
          </button>
          <button
            onClick={saveVersion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-violet-50 dark:bg-violet-900/20 text-violet-600 border border-violet-200 dark:border-violet-800 transition-all hover:brightness-95"
          >
            <LucideIcons.Save size={12} />
            Salva versione
          </button>
        </div>
      </div>

      {/* Version history drawer */}
      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-4xl mx-auto w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Cronologia versioni
              </span>
              <button
                onClick={() => setShowVersions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <LucideIcons.X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-scrollbar">
              {versions.length === 0 && (
                <p className="text-xs text-gray-400 italic px-2 py-4">
                  Nessuna versione salvata. Usa &quot;Salva versione&quot; per creare uno snapshot.
                </p>
              )}
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LucideIcons.History size={14} className="text-cyan-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                      {v.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => restoreVersion(v)}
                      className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                    >
                      Ripristina
                    </button>
                    <button
                      onClick={() => deleteVersion(v.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <LucideIcons.Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-900/30 text-[10px] font-black uppercase tracking-widest"
            >
              <TagIcon size={10} />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Blocks editor */}
      <Card className="flex-1 min-h-125 border-none bg-white/60 dark:bg-gray-900/90 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        <CardContent className="h-full p-6 md:p-8">
          {isNoteLocked ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center text-cyan-500 shadow-xl shadow-cyan-500/5">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-black tracking-tight text-gray-800 dark:text-gray-100">
                  Nota Protetta E2EE
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Questa nota è cifrata lato client con crittografia
                  PBKDF2/AES-GCM a conoscenza zero. Digita la password di
                  sblocco per visualizzarla.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <input
                  type="password"
                  placeholder="Password di sblocco"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-bold text-center focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <Button
                  onClick={handleUnlock}
                  className="h-10 text-xs font-black uppercase tracking-widest px-6 shadow-xl shadow-cyan-500/10"
                >
                  Sblocca
                </Button>
              </div>
              {decryptError && (
                <p className="text-xs text-red-500 font-bold uppercase tracking-widest">
                  {decryptError}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-0.5">
                <AnimatePresence>
                  {renumberedBlocks.map((block, index) => (
                    <BlockItem
                      key={block.id}
                      block={block}
                      index={index}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                      onAddBelow={addBlockBelow}
                      onMoveUp={moveBlockUp}
                      onMoveDown={moveBlockDown}
                      totalCount={blocks.length}
                      onAddPage={onAddPage}
                      activePageId={activePageId}
                      allPages={allPages}
                      onInsertPageRef={insertPageRef}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Block picker removed: blocks can be added via "/" in the editor */}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
