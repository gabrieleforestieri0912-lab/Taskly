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
  Sparkles,
  Mic,
  Inbox,
  HelpCircle,
} from "lucide-react";
import { SidebarSection } from "./sidebar/SidebarSection";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { PageTreeItem } from "./sidebar/PageTreeItem";
import { getAncestorIds } from "../lib/pageTree";

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

  // Auto-expand ancestors of the active page so deep pages are visible in the tree
  useEffect(() => {
    if (!activePageId || !pages || pages.length === 0) return;
    const ancestorIds = getAncestorIds(pages, activePageId);
    if (ancestorIds.size === 0) return;

    setExpandedPages((prev: Record<string, boolean>) => {
      let changed = false;
      const next = { ...prev };
      for (const id of ancestorIds) {
        if (next[id] !== true) {
          next[id] = true;
          changed = true;
        }
      }
      if (changed) {
        try {
          localStorage.setItem("expanded_pages", JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  }, [activePageId, pages]);

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

  useEffect(() => {
    setIsAIActive(pathname === "/dashboard" && !!searchParams?.get("ai"));
  }, [pathname, searchParams]);

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

  const handleAddSubpage = (parentId: string, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setExpandedPages((prev: Record<string, boolean>) => {
      const next = { ...prev, [parentId]: true };
      try {
        localStorage.setItem("expanded_pages", JSON.stringify(next));
      } catch {}
      return next;
    });
    onAddPage &&
      onAddPage({
        type: "empty",
        label: "Senza titolo",
        parentId,
      });
  };

  const handleDuplicatePage = (pageToDup: any) => {
    const copyLabel = pageToDup.label
      ? `Copia di ${pageToDup.label}`
      : "Copia di Pagina";
    onAddPage &&
      onAddPage({
        type: pageToDup.type || "empty",
        label: copyLabel,
        icon: pageToDup.icon,
        iconColor: pageToDup.iconColor,
        parentId: pageToDup.parentId || null,
        initialData: pageToDup.data,
      });
  };

  // allow dropping on root (make page a root child)
  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId) return;
    onUpdatePage && onUpdatePage(draggedId, { parentId: null });
  };

  // Toggle expand/collapse for a page in the sidebar and persist to localStorage
  const togglePageExpand = (id: string, e?: React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedPages((prev: Record<string, boolean>) => {
      const currentlyExpanded = prev[id] === true;
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
          <span>{t("land.demoNavSettings")}</span>
        </Link>

        <Link
          href="/billing"
          onClick={() => setIsProfileOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <CreditCard size={16} />
          <span>{t("land.sideSubPlan")}</span>
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
          <span>{t("auth.docsTitle")}</span>
        </Link>

        <Link
          href="/support"
          onClick={() => setIsHelpOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <Users size={16} className="text-gray-400" />
          <span>{t("auth.supportTitle")}</span>
        </Link>

        <Link
          href="/terms"
          onClick={() => setIsHelpOpen(false)}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          <FileText size={16} className="text-gray-400" />
          <span>{t("auth.termsTitle")}</span>
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
            <Trash2 size={16} className="text-gray-500" />{t("land.sideTrash")}</h3>
          <button
            onClick={() => setIsTrashOpen(false)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >{t("views.tiptapClose")}</button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={trashSearch}
            onChange={(e) => setTrashSearch(e.target.value)}
            placeholder={t("land.sideTrashSearchPh")}
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
                  >{t("views.notesRestore")}</button>
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
                  >{t("views.habitDelete")}</button>
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
          <h3 className="text-lg font-bold mb-2">{t("land.sideConfirmDeleteTitle")}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Sei sicuro di voler eliminare questa pagina? L&apos;operazione può essere
            annullata soltanto dal Cestino.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelDelete}
              className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-semibold"
            >{t("views.habitCancel")}</button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-bold"
            >{t("views.habitDelete")}</button>
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

  // ── Keyboard shortcut Ctrl+\ to collapse sidebar ──────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "\\") {
        e.preventDefault();
        setIsSidebarOpen((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setIsSidebarOpen]);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          ASIDE — the Notion-style sidebar panel
          ════════════════════════════════════════════════════════════════════ */}
      <aside
        className="relative w-64 h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200/50 dark:border-gray-800/50"
        aria-label="Navigazione sidebar"
      >
        {/* ── Workspace / user header ─────────────────────────────────────────── */}
        <div className="flex items-center px-2 pt-2 pb-1" ref={profileRef}>
          <button
            type="button"
            onClick={(e) => {
              const rect = profileRef.current?.getBoundingClientRect();
              if (rect) {
                setProfileMenuPos({ top: rect.bottom + 8, left: rect.left });
              }
              setIsProfileOpen((s) => !s);
            }}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            aria-label="Menu account"
            className="flex flex-1 items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/5 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#7b39fc]/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 rounded-full flex items-center justify-center shrink-0">
                <User size={13} aria-hidden="true" className="text-[#7b39fc] dark:text-[#a67cff]" />
              </div>
            )}
            <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
              {user.name || "Workspace"}
            </span>
            <ChevronUp
              size={14}
              aria-hidden="true"
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                isProfileOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Portals (rendered outside normal flow) */}
        {profileMenuPortal}
        {helpMenuPortal}
        {trashMenuPortal}
        {pendingDeletePortal}

        {/* ── Scrollable nav body ────────────────────────────────────────────── */}
        <nav
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 pb-2"
          style={{ scrollbarWidth: "thin" }}
          aria-label="Navigazione principale"
        >
          {/* ── Quick actions ──────────────────────────────────────────────── */}
          <div className="mt-1 space-y-0.5" role="list" aria-label="Azioni rapide">
            <SidebarNavItem
              id="sidebar-search-btn"
              icon={Search}
              label={t("search")}
              onClick={() => setIsSearchOpen(true)}
            />
            <SidebarNavItem
              id="sidebar-home-btn"
              icon={LayoutDashboard}
              label={t("homePages")}
              href="/dashboard"
              isActive={!isTranscriptionMode && !isAIActive && !activePageId}
              onClick={() => {
                setIsTranscriptionMode(false);
                setIsAIActive(false);
              }}
            />
            <SidebarNavItem
              id="sidebar-inbox-btn"
              icon={Inbox}
              label="Inbox"
              onClick={() => {
                /* placeholder — Fase 5 */
              }}
            />
            <SidebarNavItem
              id="sidebar-ai-btn"
              icon={Sparkles}
              label={t("aiAssistant")}
              isActive={isAIActive}
              onClick={() => {
                setIsTranscriptionMode(false);
                setIsAIActive(true);
                router.push("/dashboard?ai=1");
                window.dispatchEvent(new Event("open-ai-panel-page"));
              }}
            />
            <SidebarNavItem
              id="sidebar-meetings-btn"
              icon={Mic}
              label={t("meetingsVoice")}
              isActive={isTranscriptionMode}
              onClick={() => {
                setIsTranscriptionMode(true);
                setIsAIActive(false);
                router.push("/meetings");
              }}
            />
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

          {/* ── Private pages section ───────────────────────────────────────── */}
          {isAIActive ? (
            /* AI history list */
            <SidebarSection label={`${t("history")} AI`}>
              {aiMessages.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-gray-400">
                  {t("land.sideNoAiHistory")}
                </div>
              ) : (
                <div className="px-1 space-y-0.5 max-h-64 overflow-y-auto">
                  {aiMessages
                    .slice()
                    .reverse()
                    .slice(0, 8)
                    .map((m, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        <div className="truncate">
                          {String(m.content || m.text || m.summary || "").slice(0, 80)}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{m.role || ""}</div>
                      </button>
                    ))}
                </div>
              )}
            </SidebarSection>
          ) : isTranscriptionMode ? (
            /* Transcription-mode info panel */
            <div className="px-2 py-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Mic size={22} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                {t("meetingRecording")}
              </h4>
              <p className="text-[11px] text-gray-400 mb-4 px-2 leading-relaxed">
                {t("meetingRecordingDesc")}
              </p>
              <button
                onClick={() => router.push("/transcription")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all"
              >
                <Plus size={14} />
                {t("newTranscription")}
              </button>
            </div>
          ) : (
            /* Normal pages section */
            <SidebarSection
              label={t("yourPages") || "Privato"}
              onAdd={() =>
                onAddPage({
                  type: "empty",
                  label: "Senza titolo",
                  parentId: null,
                })
              }
              addLabel={t("newPage") || "Nuova pagina"}
            >
              {loading ? (
                <div className="px-2 space-y-1 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-7 w-full rounded-lg" />
                  ))}
                </div>
              ) : rootNodes.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    {t("land.sideNoPages") || "Nessuna pagina"}
                  </p>
                  <button
                    onClick={() =>
                      onAddPage({
                        type: "empty",
                        label: "Senza titolo",
                        parentId: null,
                      })
                    }
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    {t("newPage") || "Crea una pagina"}
                  </button>
                </div>
              ) : (
                <ul
                  role="tree"
                  aria-label={t("yourPages") || "Pagine private"}
                  className="space-y-0.5"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleRootDrop}
                >
                  {rootNodes.map((page, idx) => (
                    <PageTreeItem
                      key={page.id}
                      page={page}
                      depth={0}
                      indexInParent={idx}
                      childrenMap={childrenMap}
                      activePageId={activePageId}
                      expandedPages={expandedPages}
                      onToggleExpand={togglePageExpand}
                      onAddSubpage={handleAddSubpage}
                      onDeletePage={(id) => setPendingDelete({ id })}
                      onUpdatePage={onUpdatePage}
                      onDuplicatePage={handleDuplicatePage}
                    />
                  ))}
                </ul>
              )}
            </SidebarSection>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </nav>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-2 py-2 space-y-0.5">
          <SidebarNavItem
            id="sidebar-settings-btn"
            icon={Settings}
            label={t("land.demoNavSettings")}
            href="/settings"
          />
          <button
            ref={trashRef}
            type="button"
            onClick={() => {
              setTrashSearch("");
              setIsTrashOpen((s) => !s);
            }}
            title={t("land.sideTrash")}
            className="group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Trash2 size={16} aria-hidden="true" className="shrink-0" />
            <span className="flex-1 truncate">{t("land.sideTrash")}</span>
            {deletedCounts.pages > 0 && (
              <span className="text-[10px] font-bold text-gray-400">
                {deletedCounts.pages}
              </span>
            )}
          </button>
          <button
            ref={helpRef}
            type="button"
            onClick={() => setIsHelpOpen((s) => !s)}
            title={t("land.sideHelpTitle")}
            className="group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <HelpCircle size={16} aria-hidden="true" className="shrink-0" />
            <span className="flex-1 truncate">{t("land.sideHelp")}</span>
          </button>
          <button
            type="button"
            id="sidebar-invite-btn"
            onClick={() => { /* placeholder — Fase 5 */ }}
            className="group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Users size={16} aria-hidden="true" className="shrink-0" />
            <span className="flex-1 truncate">{t("land.sideInviteMembers") || "Invita membri"}</span>
          </button>
        </div>

        <AddPageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(type) => {
            onAddPage(type);
            setIsModalOpen(false);
          }}
        />
      </aside>

      {profileMenuPortal}
      {helpMenuPortal}
      {trashMenuPortal}
      {pendingDeletePortal}

      {/* ── Search modal portal ───────────────────────────────────────────── */}
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
                      >{t("land.sideClear")}</button>
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400/80 dark:text-gray-500 mb-2 px-1">{t("land.sideSearchResults")}</p>
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
