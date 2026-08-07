/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Plus,
  LayoutDashboard,
  Trash2,
  User,
  ChevronUp,
  ChevronRight,
  LogOut,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Palette,
  Check,
  ListTodo,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  BriefcaseBusiness,
  Users,
  Layers,
  BookOpen,
  ClipboardList,
  Rocket,
  Search,
  Clock,
  Home,
  Sparkles,
  Mic,
} from "lucide-react";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddPageModal from "./AddPageModal";
import { Skeleton } from "./UIComponents";
import { useLanguage } from "../lib/LanguageContext";
import { resolvePageIcon } from "../lib/pageIcons";

/* helper: icon-only nav, label expands on hover / active */
const NavIconButton = ({
  href,
  icon: Icon,
  label,
  alwaysShowLabel = false,
  className = "",
  isActive,
}) => {
  return (
    <Link
      href={href}
      title={label}
      className={`group/tip flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap overflow-hidden ${
        isActive || alwaysShowLabel
          ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
      } ${className}`}
    >
      <Icon size={18} className="shrink-0" />
      <span
        className={`${alwaysShowLabel ? "max-w-30 opacity-100" : "max-w-0 opacity-0 group-hover/tip:max-w-30 group-hover/tip:opacity-100"} transition-all duration-200 overflow-hidden`}
      >
        {label}
      </span>
    </Link>
  );
};

export default function Sidebar({
  user: propUser,
  pages = [] as any[],
  onAddPage = (..._args: any[]) => {},
  onDeletePage = (..._args: any[]) => {},
  onUpdatePage = (..._args: any[]) => {},
  isModalOpen = false,
  setIsModalOpen = (..._args: any[]) => {},
  isSidebarOpen,
  setIsSidebarOpen,
  theme,
  toggleTheme,
  loading = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [localUser, setLocalUser] = useState({
    name: "Utente",
    email: "utente@esempio.it",
  });
  const user = propUser || localUser;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageHistory, setPageHistory] = useState<any[]>([]);
  const [isTranscriptionMode, setIsTranscriptionMode] = useState(
    () =>
      pathname?.startsWith("/meetings") ||
      pathname?.startsWith("/transcription"),
  );
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuPos, setProfileMenuPos] = useState<any>(null);
  const helpRef = useRef(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const trashRef = useRef(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashSearch, setTrashSearch] = useState("");
  const [expandedPages, setExpandedPages] = useState(() => {
    try {
      const saved = localStorage.getItem("expanded_pages");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const searchParams = useSearchParams();
  const activePageId = searchParams?.get("page");

  const [isAIActive, setIsAIActive] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [deletedCounts, setDeletedCounts] = useState({
    pages: 0,
    tasks: 0,
    goals: 0,
  });

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("page_history");
      if (savedHistory) {
        // load saved history but we'll filter deleted pages at render time
        setPageHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (activePageId && pages?.length > 0) {
      const activePage = pages.find(
        (p) => String(p.id) === String(activePageId),
      );
      if (activePage && !activePage.deleted) {
        setPageHistory((prev) => {
          const filtered = prev.filter(
            (p) => String(p.id) !== String(activePageId),
          );
          const updated = [
            { id: activePage.id, label: activePage.label },
            ...filtered,
          ].slice(0, 10);
          localStorage.setItem("page_history", JSON.stringify(updated));
          return updated;
        });
      } else if (activePage && activePage.deleted) {
        // if the active page is deleted, remove it from history
        setPageHistory((prev) => {
          const updated = prev.filter(
            (p) => String(p.id) !== String(activePageId),
          );
          localStorage.setItem("page_history", JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [activePageId, pages]);

  useEffect(() => {
    const onOpen = () => setIsAIActive(true);
    const onClose = () => setIsAIActive(false);
    const onMessages = (e) => {
      try {
        setAiMessages(Array.isArray(e.detail) ? e.detail : []);
      } catch {
        setAiMessages([]);
      }
    };

    window.addEventListener("open-ai-panel-page", onOpen);
    window.addEventListener("close-ai-panel-page", onClose);
    window.addEventListener("ai-messages-updated", onMessages);
    return () => {
      window.removeEventListener("open-ai-panel-page", onOpen);
      window.removeEventListener("close-ai-panel-page", onClose);
      window.removeEventListener("ai-messages-updated", onMessages);
    };
  }, []);

  useEffect(() => {
    try {
      const pagesDeleted = Array.isArray(pages)
        ? pages.filter((p) => p && p.deleted).length
        : 0;
      setDeletedCounts({
        pages: pagesDeleted,
        tasks: 0,
        goals: 0,
      });
    } catch {
      setDeletedCounts({ pages: 0, tasks: 0, goals: 0 });
    }
  }, [pages]);

  useEffect(() => {
    if (pathname) {
      setIsTranscriptionMode(
        pathname.startsWith("/meetings") ||
          pathname.startsWith("/transcription"),
      );
    }
  }, [pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const confirmAndDelete = (pageId, e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Open modal instead of using window.confirm
    setPendingDelete({ id: pageId });
  };

  const [pendingDelete, setPendingDelete] = useState<any>(null);

  const handleCancelDelete = () => setPendingDelete(null);

  const handleConfirmDelete = () => {
    if (pendingDelete && pendingDelete.id) {
      onDeletePage && onDeletePage(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  const { rootNodes, childrenMap } = React.useMemo(() => {
    const map = new Map();
    const filtered = (pages || []).filter((p) => !p?.deleted);
    for (const p of filtered) {
      const key = p.parentId || null;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
    // sort siblings by optional order or label for stable rendering
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => {
        if (typeof a.order === "number" && typeof b.order === "number")
          return a.order - b.order;
        return String(a.label || "").localeCompare(String(b.label || ""));
      });
    }
    return { rootNodes: map.get(null) || [], childrenMap: map };
  }, [pages]);

  const renderPageNode = (page, depth = 0, indexInParent = 0) => {
    const Icon = resolvePageIcon(page);
    const children = childrenMap.get(page.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedPages[page.id] !== false; // default expanded to true
    const iconColor = page.iconColor || "text-gray-400";

    return (
      <div key={page.id} className="space-y-0.5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("bg-cyan-400", "h-1");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("bg-cyan-400", "h-1");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("bg-cyan-400", "h-1");
            const draggedId = e.dataTransfer.getData("text/plain");
            if (!draggedId || String(draggedId) === String(page.id)) return;
            // insert dragged before this page among siblings
            onUpdatePage &&
              onUpdatePage(draggedId, {
                parentId: page.parentId || null,
                order: indexInParent,
              });
          }}
          className="h-0.5 transition-all duration-200"
          style={{ marginLeft: `${8 + depth * 14}px` }}
        />

        <div
          className={`group flex items-center rounded-xl transition-all text-sm font-medium relative ${String(activePageId) === String(page.id) ? "bg-cyan-50/50 dark:bg-cyan-900/10 text-cyan-600 font-bold" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/40"}`}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          {/* Notion-style Chevron Toggle */}
          <button
            onClick={(e) => togglePageExpand(page.id, e)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors mr-1 ${hasChildren ? "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" : "opacity-0 pointer-events-none"}`}
            aria-label={isExpanded ? "Comprimi" : "Espandi"}
          >
            <ChevronRight
              size={13}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            />
          </button>

          <Link
            href={`/dashboard?page=${page.id}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", String(page.id));
              e.dataTransfer.effectAllowed = "move";
              e.currentTarget.classList.add("opacity-50");
            }}
            onDragEnd={(e) => {
              e.currentTarget.classList.remove("opacity-50");
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add(
                "bg-cyan-50",
                "dark:bg-cyan-900/10",
              );
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove(
                "bg-cyan-50",
                "dark:bg-cyan-900/10",
              );
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove(
                "bg-cyan-50",
                "dark:bg-cyan-900/10",
              );
              const draggedId = e.dataTransfer.getData("text/plain");
              if (!draggedId || String(draggedId) === String(page.id)) return;
              // make dragged page a child of this page (append at end)
              const children = childrenMap.get(page.id) || [];
              onUpdatePage &&
                onUpdatePage(draggedId, {
                  parentId: page.id,
                  order: children.length,
                });
            }}
            className="flex-1 flex items-center gap-2 py-2 pr-3 min-w-0"
          >
            <Icon
              size={16}
              className={`${iconColor} shrink-0 transition-colors`}
            />
            <span className="truncate">{page.label}</span>
          </Link>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
            <button
              onClick={(e) => confirmAndDelete(page.id, e)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
              title="Elimina"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5 mt-0.5">
            {children.map((child, idx) =>
              renderPageNode(child, depth + 1, idx),
            )}
          </div>
        )}
      </div>
    );
  };

  // allow dropping on root (make page a root child)
  const handleRootDrop = (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId) return;
    onUpdatePage && onUpdatePage(draggedId, { parentId: null });
  };

  // Toggle expand/collapse for a page in the sidebar and persist to localStorage
  const togglePageExpand = (id, e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedPages((prev) => {
      const currentlyExpanded = prev[id] !== false; // default to expanded
      const next = { ...prev, [id]: !currentlyExpanded };
      try {
        localStorage.setItem("expanded_pages", JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // profile menu portal: render outside of JSX to avoid parser/context issues
  let profileMenuPortal: React.ReactNode = null;
  if (isProfileOpen && profileMenuPos && typeof document !== "undefined") {
    profileMenuPortal = createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          top: profileMenuPos.top,
          left: profileMenuPos.left,
          position: "fixed",
          zIndex: 60,
        }}
        className="p-3 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 w-64"
      >
        <Link
          href="/settings"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <Settings size={16} />
          <span>Impostazioni</span>
        </Link>

        <Link
          href="/billing"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <CreditCard size={16} />
          <span>Piano di abbonamento</span>
        </Link>
      </div>,
      document.body,
    );
  }

  // help menu portal
  let helpMenuPortal: React.ReactNode = null;
  if (isHelpOpen && typeof document !== "undefined") {
    helpMenuPortal = createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 80,
          left: 272,
          zIndex: 60,
        }}
        className="p-2 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 w-56"
      >
        <Link
          href="/docs"
          onClick={() => setIsHelpOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <BookOpen size={16} className="text-gray-400" />
          <span>Documentazione</span>
        </Link>

        <Link
          href="/support"
          onClick={() => setIsHelpOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <Users size={16} className="text-gray-400" />
          <span>Supporto</span>
        </Link>

        <Link
          href="/terms"
          onClick={() => setIsHelpOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <FileText size={16} className="text-gray-400" />
          <span>Termini e condizioni</span>
        </Link>
      </div>,
      document.body,
    );
  }

  // trash menu portal (large popup)
  let trashMenuPortal: React.ReactNode = null;
  if (isTrashOpen && typeof document !== "undefined") {
    const deletedPages = Array.isArray(pages)
      ? pages.filter((p) => p && p.deleted)
      : [];
    let deletedTasks = [] as any[];
    let deletedGoals = [] as any[];
    try {
      const rawTasks = localStorage.getItem("tasks");
      const parsedTasks = rawTasks ? JSON.parse(rawTasks) : null;
      if (Array.isArray(parsedTasks))
        deletedTasks = parsedTasks.filter((t) => t && t.deleted);
    } catch {}
    try {
      const rawGoals = localStorage.getItem("goals");
      const parsedGoals = rawGoals ? JSON.parse(rawGoals) : null;
      if (Array.isArray(parsedGoals))
        deletedGoals = parsedGoals.filter((g) => g && g.deleted);
    } catch {}

    const allDeleted = [
      ...deletedPages.map((p) => ({ ...p, _type: "page" })),
      ...deletedTasks.map((t) => ({ ...t, _type: "task", label: t.title || t.text || "Attività" })),
      ...deletedGoals.map((g) => ({ ...g, _type: "goal", label: g.title || g.label || "Obiettivo" })),
    ];

    const q = (trashSearch || "").toLowerCase();
    const filtered = q
      ? allDeleted.filter((item) => (item.label || "").toLowerCase().includes(q))
      : allDeleted;

    trashMenuPortal = createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: 80,
          left: 272,
          zIndex: 60,
        }}
        className="p-4 bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 w-96 flex flex-col"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 size={16} className="text-gray-500" />
            Cestino
          </h3>
          <button
            onClick={() => setIsTrashOpen(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Chiudi
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={trashSearch}
            onChange={(e) => setTrashSearch(e.target.value)}
            placeholder="Cerca negli elementi eliminati..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        <div className="flex-1 overflow-auto space-y-2 min-h-0">
          {filtered.length === 0 ? (
            <div className="text-sm text-gray-400 italic text-center py-8">
              {trashSearch ? "Nessun risultato" : "Nessun elemento eliminato"}
            </div>
          ) : (
            filtered.map((item, index) => (
              <div
                key={item._type + "-" + (item.id || item._id || index)}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                    item._type === "page"
                      ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : item._type === "task"
                      ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {item._type === "page" ? "Pagina" : item._type === "task" ? "Task" : "Goal"}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                    {item.label || "Senza nome"}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (item._type === "page") {
                        onUpdatePage && onUpdatePage(item.id, { deleted: false });
                      } else {
                        const storageKey = item._type === "task" ? "tasks" : "goals";
                        try {
                          const raw = localStorage.getItem(storageKey);
                          const parsed = raw ? JSON.parse(raw) : [];
                          const updated = parsed.map((it) =>
                            it && it.id === item.id ? { ...it, deleted: false } : it,
                          );
                          localStorage.setItem(storageKey, JSON.stringify(updated));
                        } catch {}
                      }
                      setIsTrashOpen(false);
                    }}
                    className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                  >
                    Ripristina
                  </button>
                  <button
                    onClick={() => {
                      if (item._type === "page") {
                        onDeletePage && onDeletePage(item.id);
                      } else {
                        const storageKey = item._type === "task" ? "tasks" : "goals";
                        try {
                          const raw = localStorage.getItem(storageKey);
                          const parsed = raw ? JSON.parse(raw) : [];
                          const updated = parsed.filter((it) => !(it && it.id === item.id));
                          localStorage.setItem(storageKey, JSON.stringify(updated));
                        } catch {}
                      }
                    }}
                    className="px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body,
    );
  }

  // pending delete confirmation modal (portal)
  let pendingDeletePortal: React.ReactNode = null;
  if (pendingDelete && typeof document !== "undefined") {
    pendingDeletePortal = createPortal(
      <div className="fixed inset-0 z-500 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleCancelDelete}
        />
        <div className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 w-full max-w-md">
          <h3 className="text-lg font-bold mb-2">Conferma eliminazione</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Sei sicuro di voler eliminare questa pagina? L&apos;operazione può essere
            annullata soltanto dal Cestino.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelDelete}
              className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-semibold"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold"
            >
              Elimina
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // close help menu on outside click or Esc
  useEffect(() => {
    if (!isHelpOpen) return;
    const onDocClick = () => setIsHelpOpen(false);
    const onEsc = (e) => {
      if (e.key === "Escape") setIsHelpOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isHelpOpen]);

  // close trash menu on outside click or Esc
  useEffect(() => {
    if (!isTrashOpen) return;
    const onDocClick = () => setIsTrashOpen(false);
    const onEsc = (e) => {
      if (e.key === "Escape") setIsTrashOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isTrashOpen]);

  return (
    <>
      <aside className="relative w-64 h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200/50 dark:border-gray-800/50 shadow-2xl overflow-y-auto">
        <div className="flex items-center mb-3 px-4 pt-4 justify-between">
          <Link
            href="/"
            title="Home"
            className="group/tip flex items-center gap-2"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/70 shadow-sm transition-all group-hover:scale-[1.03] dark:border-white/10 dark:bg-white/10">
              <Home size={17} className="text-gray-900 dark:text-white" />
            </span>
          </Link>

          <div className="ml-2" ref={profileRef}>
            <button
              onClick={(e) => {
                const rect = profileRef.current?.getBoundingClientRect();
                if (rect) {
                  setProfileMenuPos({
                    top: rect.bottom + 8,
                    left: rect.left,
                  });
                }
                setIsProfileOpen((s) => !s);
              }}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-cyan-500/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center shrink-0">
                  <User
                    size={16}
                    className="text-cyan-600 dark:text-cyan-400"
                  />
                </div>
              )}
              <div className="hidden sm:flex flex-col text-left truncate">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate">
                  {user.name}
                </p>
              </div>
            </button>

            {/* profile menu rendered as portal below (popup) */}
          </div>

          {/** Render profile menu via portal (kept as separate var below) */}
        </div>

        {profileMenuPortal}
        {helpMenuPortal}
        {trashMenuPortal}

        <div
          className="flex-1 px-3 space-y-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRootDrop}
        >
          {/* Menu di Navigazione Orizzontale */}
          <div className="flex items-center justify-between gap-1 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
            <button
              onClick={() => {
                setIsTranscriptionMode(false);
                setIsAIActive(false);
                router.push("/dashboard");
              }}
              className={`flex-1 flex h-9 items-center justify-center rounded-lg transition-all ${
                !isTranscriptionMode && !isAIActive
                  ? "bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-gray-200/50 dark:border-gray-700"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
              title={t("homePages")}
            >
              <LayoutDashboard size={17} />
            </button>

            <button
              onClick={() => {
                setIsTranscriptionMode(true);
                setIsAIActive(false);
                router.push("/meetings");
              }}
              className={`flex-1 flex h-9 items-center justify-center rounded-lg transition-all ${
                isTranscriptionMode
                  ? "bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-gray-200/50 dark:border-gray-700"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
              title={t("meetingsVoice")}
            >
              <Mic size={17} />
            </button>

            <button
              onClick={() => {
                // behave like other nav buttons: deactivate transcription and navigate
                setIsTranscriptionMode(false);
                setIsAIActive(true);
                // navigate to dashboard with ai flag so the main content becomes the AI page
                router.push("/dashboard?ai=1");
                // also notify AIPanel if available
                window.dispatchEvent(new Event("open-ai-panel-page"));
              }}
              className={`flex-1 flex h-9 items-center justify-center rounded-lg transition-all ${isAIActive ? "bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-gray-200/50 dark:border-gray-700" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"}`}
              title={t("aiAssistant")}
            >
              <Sparkles size={17} />
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 flex h-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
              title={t("search")}
            >
              <Search size={17} />
            </button>
          </div>

          {/* Bottone azione condizionale sotto la barra */}
          <div className="px-1">
            {!isTranscriptionMode ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
              >
                <Plus size={18} />
                {t("newPage")}
              </button>
            ) : (
              <button
                onClick={() => router.push("/transcription")}
                className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
              >
                <Plus size={18} />
                {t("newTranscription")}
              </button>
            )}
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

          {/* Contenuto dinamico della Sidebar */}
          {!isTranscriptionMode ? (
            isAIActive ? (
              <div className="space-y-1">
                <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  {t("history")} AI
                </p>
                {aiMessages.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-400">
                    Nessuna cronologia disponibile.
                  </div>
                ) : (
                  <div className="px-2 space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {aiMessages
                      .slice()
                      .reverse()
                      .slice(0, 8)
                      .map((m, i) => (
                        <button
                          key={i}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                          <div className="truncate">
                            {String(
                              m.content || m.text || m.summary || "",
                            ).slice(0, 80)}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {m.role || ""}
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  {t("yourPages")}
                </p>
                {loading ? (
                  <div className="px-3 space-y-3 mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-8 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  rootNodes.map((page, idx) => renderPageNode(page, 0, idx))
                )}
              </div>
            )
          ) : (
            <div className="px-2 py-4 text-center">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mic
                  size={22}
                  className="text-cyan-600 dark:text-cyan-400 animate-pulse"
                />
              </div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {t("meetingRecording")}
              </h4>
              <p className="text-[11px] text-gray-400 mb-4 px-2 leading-relaxed">
                {t("meetingRecordingDesc")}
              </p>
            </div>
          )}
        </div>

        {/* Bottom badges: Cestino & Aiuto (stacked vertically) */}
        <div className="px-3 py-3 mt-2">
          <div className="flex flex-col items-stretch gap-2">
            <button
              ref={trashRef}
              onClick={() => {
                setTrashSearch("");
                setIsTrashOpen((s) => !s);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Cestino"
            >
              <Trash2 size={16} className="text-gray-500" />
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Cestino
                </div>
              </div>
            </button>

            <button
              ref={helpRef}
              onClick={() => setIsHelpOpen((s) => !s)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Aiuto / Documentazione"
            >
              <BookOpen size={16} className="text-gray-500" />
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Aiuto
              </span>
            </button>
          </div>
        </div>

        {/* Transcription Badge - always in the same position */}
        {isTranscriptionMode && (
          <button
            onClick={() => router.push("/transcription")}
            className="absolute bottom-24 left-0 right-0 mx-auto w-fit flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-full shadow-lg transition-all z-10"
          >
            <Mic size={16} />
            {t("newTranscription")}
          </button>
        )}

        <AddPageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(type) => {
            onAddPage(type);
            setIsModalOpen(false);
          }}
        />
      </aside>

      {isSearchOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-zinc-800/80 w-120 max-w-full p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder={t("searchPagesPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/50 rounded-2xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    autoFocus
                  />
                </div>

                {pageHistory.length > 0 && !searchQuery && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400/80 dark:text-gray-500">
                        {t("history")}
                      </p>
                      <button
                        onClick={() => {
                          setPageHistory([]);
                          localStorage.removeItem("page_history");
                        }}
                        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Cancella
                      </button>
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {pageHistory
                        .filter((ph) =>
                          pages.find(
                            (p) => String(p.id) === String(ph.id) && !p.deleted,
                          ),
                        )
                        .slice(0, 6)
                        .map((page) => (
                          <button
                            key={page.id}
                            onClick={() => {
                              router.push(`/dashboard?page=${page.id}`);
                              setIsSearchOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-cyan-50 dark:hover:bg-cyan-950/20 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Clock
                                size={13}
                                className="text-gray-400 group-hover:text-cyan-500 transition-colors"
                              />
                              <span className="truncate font-semibold">
                                {page.label}
                              </span>
                            </div>
                            <ChevronRight
                              size={12}
                              className="text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {searchQuery && (
                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400/80 dark:text-gray-500 mb-2 px-1">
                      Risultati Ricerca
                    </p>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar text-xs text-gray-500">
                      {pages.filter(
                        (p) =>
                          !p.deleted &&
                          p.label
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      ).length === 0 ? (
                        <div className="text-center py-6 text-gray-400 dark:text-gray-500 font-medium">
                          {t("noPagesFound")}
                        </div>
                      ) : (
                        pages
                          .filter(
                            (p) =>
                              !p.deleted &&
                              p.label
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                          )
                          .map((page) => (
                            <button
                              key={page.id}
                              onClick={() => {
                                router.push(`/dashboard?page=${page.id}`);
                                setIsSearchOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-cyan-50 dark:hover:bg-cyan-950/20 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-xl transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText
                                  size={13}
                                  className="text-gray-400 group-hover:text-cyan-500 transition-colors"
                                />
                                <span className="truncate font-semibold">
                                  {page.label}
                                </span>
                              </div>
                              <ChevronRight
                                size={12}
                                className="text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0"
                              />
                            </button>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
