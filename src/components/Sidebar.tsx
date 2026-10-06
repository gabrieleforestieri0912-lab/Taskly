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
  CheckSquare,
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
  ChevronLeft,
  Copy,
  Bell,
  Globe,
  Shield,
  Sliders,
  Download,
  Key,
  Send,
} from "lucide-react";
import { SidebarSection } from "./sidebar/SidebarSection";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { SidebarQuickBar } from "./sidebar/SidebarQuickBar";
import { PageTreeItem } from "./sidebar/PageTreeItem";
import { GoogleCalendarSidebarCard } from "./sidebar/GoogleCalendarSidebarCard";
import { OneTimeTooltip } from "./OnboardingTooltips";
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
  onOpenTemplateGallery = () => {},
  onOpenPage = (..._args: any[]) => {},
  onOpenQuickPage = (pageId: string) => {},
  isSidebarOpen,
  setIsSidebarOpen,
  theme,
  toggleTheme,
  loading = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = pages.find((p) => String(p.id) === String(activePageId));
  const { t, language, setLanguage } = useLanguage();

  // Apri la scheda per la pagina di destinazione PRIMA di navigare, così la
  // tab esiste già quando cambia l'URL (nessun "buco" visivo nell'header).
  const goToPage = (page: any) => {
    if (!page || page.id === undefined || page.id === null) return;
    onOpenPage(page);
    router.push(`/dashboard?page=${page.id}`);
  };

  const [localUser, setLocalUser] = useState({
    name: "Utente",
    email: "utente@esempio.it",
  });
  const user = propUser || localUser;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement | null>(null);
  const [moreMenuPos, setMoreMenuPos] = useState<any>(null);
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
  const activeView = searchParams?.get("view");
  const isMyTasksActive = pathname === "/dashboard" && activeView === "mytasks";

  const [activeTasksCount, setActiveTasksCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const raw = localStorage.getItem("taskly_tasks_v1") || localStorage.getItem("tasks");
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const active = list.filter((t: any) => !t.deleted && t.status !== "done").length;
            setActiveTasksCount(active);
          }
        }
      } catch {}
    };
    updateCount();
    window.addEventListener("taskly-tasks-updated", updateCount);
    return () => window.removeEventListener("taskly-tasks-updated", updateCount);
  }, []);

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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
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

  const handleLogout = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {}
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {}
    setIsProfileOpen(false);
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

  const { rootNodes, childrenMap, favoriteNodes } = React.useMemo(() => {
    const quickPage = pages.find(
      (p) => p && p.id === "new-empty-page",
    );
    const quickChatPage = pages.find(
      (p) => p && p.id === "new-chat-page",
    );
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
    // Starred pages, shown in the "Preferiti" section above the full tree.
    const favoriteNodes = (pages || [])
      .filter((p) => p && !p?.deleted && p.isFavorite)
      .sort((a, b) => {
        const ta = Date.parse(a.updatedAt || a.createdAt || "") || 0;
        const tb = Date.parse(b.updatedAt || b.createdAt || "") || 0;
        return tb - ta;
      });

    return { rootNodes: map.get(null) || [], childrenMap: map, favoriteNodes };
  }, [pages]);

  const handleOpenQuickPage = (pageId: string) => {
    const page = pages.find((p) => String(p.id) === String(pageId));
    if (!page) return;
    onOpenPage(page);
    router.push(`/dashboard?page=${page.id}`);
    onOpenQuickPage(pageId);
  };

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

  // ── "Altro" menu portal ────────────────────────────────────────────────
  // Voci secondarie raccolte in un menu che si apre verso l'alto, accanto
  // all'account in fondo alla sidebar. Stesso pattern del profile menu:
  // posizione in fixed calcolata dal bottone, chiusura su click fuori / Esc.
  let moreMenuPortal: React.ReactNode = null;
  if (isMoreOpen && moreRef.current && typeof document !== "undefined") {
    const rect = moreRef.current.getBoundingClientRect();
    const menuW = 232;
    const left = Math.max(
      8,
      Math.min(rect.right - menuW, (typeof window !== "undefined" ? window.innerWidth : 800) - menuW - 8),
    );
    moreMenuPortal = createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          top: rect.top,
          left,
          position: "fixed",
          zIndex: 80,
          // si apre verso l'alto per restare dentro il viewport
          transform: "translateY(-100%)",
          transformOrigin: "bottom right",
        }}
        role="menu"
        aria-label={t("nav.more", "Altro")}
        className="w-58 p-1.5 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-800/80 text-gray-800 dark:text-gray-100"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setIsMoreOpen(false);
            router.push("/settings");
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors"
        >
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/20 dark:text-[#a67cff]">
            <Settings size={13} aria-hidden="true" />
          </span>
          {t("land.demoNavSettings")}
        </button>

        <button
          ref={trashRef}
          type="button"
          role="menuitem"
          onClick={() => {
            setIsMoreOpen(false);
            setTrashSearch("");
            setIsTrashOpen((s) => !s);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors"
        >
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trash2 size={13} aria-hidden="true" />
          </span>
          <span className="flex-1 text-left">{t("land.sideTrash")}</span>
          {deletedCounts.pages > 0 && (
            <span className="text-[10px] font-bold tabular-nums text-gray-400">
              {deletedCounts.pages}
            </span>
          )}
        </button>

        <button
          ref={helpRef}
          type="button"
          role="menuitem"
          onClick={() => {
            setIsMoreOpen(false);
            setIsHelpOpen((s) => !s);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors"
        >
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <HelpCircle size={13} aria-hidden="true" />
          </span>
          {t("land.sideHelp")}
        </button>

        <button
          type="button"
          role="menuitem"
          id="sidebar-invite-btn"
          onClick={() => {
            setIsMoreOpen(false);
            setIsInviteOpen(true);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-colors"
        >
          <span className="grid place-items-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users size={13} aria-hidden="true" />
          </span>
          {t("land.sideInviteMembers", "Invita membri")}
        </button>
      </div>,
      document.body,
    );
  }

  // profile menu portal: render outside of JSX to avoid parser/context issues
  let profileMenuPortal: React.ReactNode = null;
  if (isProfileOpen && profileMenuPos && typeof document !== "undefined") {
    profileMenuPortal = createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          top: profileMenuPos.top,
          left: Math.max(8, Math.min(profileMenuPos.left, (typeof window !== "undefined" ? window.innerWidth : 800) - 310)),
          position: "fixed",
          zIndex: 80,
          // translateY(-100%) + l'8px di offset fanno aprire il menu
          // VERSO L'ALTO: l'account sta in fondo alla sidebar, quindi
          // un menu che si apre sotto uscirebbe dal viewport.
          transform: "translateY(-100%) translateY(-8px)",
          transformOrigin: "bottom left",
        }}
        className="w-76 p-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-800/80 max-h-[85vh] overflow-y-auto scrollbar-hide text-gray-800 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* User Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/60 mb-2.5">
          {user.picture ? (
            <img
              src={user.picture}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-[#7b39fc]/30 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7b39fc] to-[#a67cff] flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#7b39fc]/20 shrink-0">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="font-extrabold text-xs truncate text-gray-900 dark:text-white">
                {user.name || "Utente"}
              </p>
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/20 dark:text-[#a67cff]">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">
              {user.email || "utente@esempio.it"}
            </p>
          </div>
        </div>

        {/* Quick in-menu settings */}
        <div className="p-2 rounded-2xl bg-gray-50/60 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60 mb-2 space-y-1.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 px-1">
            {t("quickSettings", "Impostazioni Rapide")}
          </span>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Theme Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl p-0.5 border border-gray-200/60 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  if (theme !== "light" && toggleTheme) toggleTheme();
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  theme === "light"
                    ? "bg-[#7b39fc] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
                title="Tema Chiaro"
              >
                <Sun size={12} />
                <span className="text-[10px]">Chiaro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== "dark" && toggleTheme) toggleTheme();
                }}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  theme === "dark"
                    ? "bg-[#7b39fc] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
                title="Tema Scuro"
              >
                <Moon size={12} />
                <span className="text-[10px]">Scuro</span>
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl p-0.5 border border-gray-200/60 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setLanguage("it")}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === "it"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <span className="text-[10px]">IT</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === "en"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                <span className="text-[10px]">EN</span>
              </button>
            </div>
          </div>
        </div>

        {/* All App Settings Links */}
        <div className="space-y-0.5 pt-0.5">
          <p className="px-2 pb-1 text-[9px] font-black uppercase tracking-wider text-gray-400">
            {t("settings", "Tutte le Impostazioni")}
          </p>

          <Link
            href="/settings"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-bold transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/20 dark:text-[#a67cff]">
                <Settings size={13} />
              </div>
              <span>Panoramica Impostazioni</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=profile"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500">
                <User size={13} />
              </div>
              <span>Profilo & Account</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=appearance"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-purple-500/10 text-purple-500">
                <Palette size={13} />
              </div>
              <span>Aspetto, Colori & Font</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=notifications"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500">
                <Bell size={13} />
              </div>
              <span>Notifiche & Promemoria</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=workflow"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Sliders size={13} />
              </div>
              <span>Workflow & Produttività</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/integrations"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500">
                <Layers size={13} />
              </div>
              <span>Integrazioni App (Google, Slack)</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=data"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-rose-500/10 text-rose-500">
                <Download size={13} />
              </div>
              <span>Dati, Backup & Esportazione</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=security"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Shield size={13} />
              </div>
              <span>Sicurezza, Password & 2FA</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/settings?tab=billing"
            onClick={() => setIsProfileOpen(false)}
            className="flex items-center justify-between w-full px-2.5 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/5 rounded-xl text-xs font-medium transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1 rounded-lg bg-[#7b39fc]/10 text-[#7b39fc]">
                <CreditCard size={13} />
              </div>
              <span>Abbonamento & Fatturazione</span>
            </div>
            <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Divider & Logout */}
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>{t("logout", "Disconnetti")}</span>
          </button>
        </div>
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
            <div className="text-sm text-gray-400 text-center py-8">
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
        <div
          className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 w-full max-w-md"
        >
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

  // invite members modal portal
  let inviteModalPortal: React.ReactNode = null;
  if (isInviteOpen && typeof document !== "undefined") {
    inviteModalPortal = createPortal(
      <div className="fixed inset-0 z-500 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setIsInviteOpen(false);
            setInviteSent(false);
          }}
        />
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {t("land.sideInviteMembers", "Invita membri")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Collabora in tempo reale condividendo il tuo workspace
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
                Email della persona da invitare
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="collega@azienda.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (inviteEmail.trim()) {
                      setInviteSent(true);
                      setTimeout(() => setInviteSent(false), 3000);
                      setInviteEmail("");
                    }
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  {inviteSent ? "Inviato!" : "Invia"}
                </button>
              </div>
              {inviteSent && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                  Invito inviato con successo!
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Oppure condividi il link diretto
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.origin);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  {inviteCopied ? (
                    <>
                      <Check size={13} />
                      <span>Copiato!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copia link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => {
                setIsInviteOpen(false);
                setInviteSent(false);
              }}
              className="px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

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

  // close "Altro" menu on outside click or Esc
  useEffect(() => {
    if (!isMoreOpen) return;
    const onDocClick = () => setIsMoreOpen(false);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMoreOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isMoreOpen]);

  // close profile menu on outside click or Esc
  useEffect(() => {
    if (!isProfileOpen) return;
    const onDocClick = () => setIsProfileOpen(false);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isProfileOpen]);

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
        {/* ── Workspace header ──────────────────────────────────────────────────
            L'account si sposta in fondo (vedi blocco "Account + altro"): qui resta
            solo la logo di Taskly che torna alla landing e il chiudi su mobile. */}
        <div className="flex items-center px-3 pt-3 pb-1 gap-1">
          <Link
            href="/"
            aria-label={t("land.cmpHeaderTaskly")}
            className="flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Image
              src="/taskly.png"
              alt={t("land.cmpHeaderTaskly")}
              width={26}
              height={26}
              className="shrink-0 rounded-lg object-cover"
            />
            <span className="font-inter text-[11px] font-bold text-gray-800 dark:text-gray-100">
              Taskly
            </span>
          </Link>

          {/* Close sidebar button on mobile */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Chiudi barra laterale"
            className="md:hidden p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable nav body ────────────────────────────────────────────── */}
        <nav
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-2 pb-2"
          style={{ scrollbarWidth: "thin" }}
          aria-label="Navigazione principale"
        >
          {/* ── Quick actions (barra orizzontale) ───────────────────────── */}
          <div className="relative" role="list" aria-label="Azioni rapide">
            <OneTimeTooltip
              id="tip-sidebar-search"
              title="Ricerca veloce (Ctrl+K)"
              body="Premi Ctrl+K ovunque per cercare pagine, task e azioni."
              whileStepPending="search"
            />
            <SidebarNavItem
              id="sidebar-search-btn"
              icon={Search}
              label={t("search")}
              onClick={() => setIsSearchOpen(true)}
            />
            <SidebarQuickBar
              items={[
                {
                  id: "sidebar-home-btn",
                  icon: LayoutDashboard,
                  label: t("nav.home", "Home"),
                  href: "/dashboard",
                  isActive: !isTranscriptionMode && !isAIActive && !activePageId && !isMyTasksActive,
                  onClick: () => {
                    setIsTranscriptionMode(false);
                    setIsAIActive(false);
                  },
                },
                {
                  id: "sidebar-mytasks-btn",
                  icon: CheckSquare,
                  label: "Task",
                  href: "/dashboard?view=mytasks",
                  badge: activeTasksCount > 0 ? activeTasksCount : undefined,
                  isActive: !isTranscriptionMode && !isAIActive && isMyTasksActive,
                  onClick: () => {
                    setIsTranscriptionMode(false);
                    setIsAIActive(false);
                  },
                },
                {
                  id: "sidebar-inbox-btn",
                  icon: Inbox,
                  label: t("nav.inbox", "Inbox"),
                  href: "/dashboard?view=inbox",
                  isActive: !isTranscriptionMode && !isAIActive && activeView === "inbox",
                  onClick: () => {
                    setIsTranscriptionMode(false);
                    setIsAIActive(false);
                  },
                },
                {
                  id: "sidebar-empty-btn",
                  icon: FileText,
                  label: t("nav.empty", "Pagina vuota"),
                  onClick: () => handleOpenQuickPage("new-empty-page"),
                },
                {
                  id: "sidebar-transcription-btn",
                  icon: Mic,
                  label: t("nav.transcription", "Trascrizione"),
                  isActive: isTranscriptionMode,
                  onClick: () => {
                    setIsTranscriptionMode(true);
                    setIsAIActive(false);
                  },
                },
                {
                  id: "sidebar-chat-btn",
                  icon: Send,
                  label: t("nav.chat", "Chat"),
                  onClick: () => handleOpenQuickPage("new-chat-page"),
                },
                {
                  id: "sidebar-meetings-btn",
                  icon: Mic,
                  label: t("nav.meetings", "Riunioni"),
                  isActive: isTranscriptionMode,
                  onClick: () => {
                    setIsTranscriptionMode(true);
                    setIsAIActive(false);
                    router.push("/meetings");
                  },
                },
                {
                  id: "sidebar-calendar-nav-btn",
                  icon: Calendar,
                  label: t("nav.calendar", "Calendario"),
                  isActive:
                    !isTranscriptionMode &&
                    !isAIActive &&
                    pages.some((p) => String(p.id) === String(activePageId) && p.type === "calendar"),
                  onClick: () => {
                    setIsTranscriptionMode(false);
                    setIsAIActive(false);
                    const calPage = pages.find((p) => !p.deleted && p.type === "calendar");
                    if (calPage) goToPage(calPage);
                    else router.push("/calendar");
                  },
                },
              ]}
            />
          </div>

          {/* ── Google Calendar Integration Card & Connection Message ─────── */}
          <GoogleCalendarSidebarCard
            onNavigateToCalendar={() => {
              setIsTranscriptionMode(false);
              setIsAIActive(false);
              const calPage = pages.find((p) => !p.deleted && p.type === "calendar");
              if (calPage) goToPage(calPage);
              else router.push("/calendar");
            }}
          />

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
            <div className="relative">
            <OneTimeTooltip
              id="tip-sidebar-newpage"
              title="Nuova pagina (+)"
              body="Usa + per creare una pagina vuota o partire da un template."
              whileStepPending="create_page"
            />

            {/* Preferiti: starred pages, most recent first. Rendered above the
                full tree so they stay reachable without scrolling. */}
            {favoriteNodes.length > 0 && (
              <SidebarSection label={t("favorites", "Preferiti")}>
                <ul
                  className="space-y-0.5"
                  role="list"
                  aria-label={t("favorites", "Preferiti")}
                >
                  {favoriteNodes.map((page: any) => (
                    <PageTreeItem
                      key={`fav-${page.id}`}
                      page={page}
                      depth={0}
                      indexInParent={0}
                      childrenMap={new Map()}
                      activePageId={activePageId}
                      expandedPages={{}}
                      onToggleExpand={() => {}}
                      onAddSubpage={handleAddSubpage}
                      onDeletePage={(id: string) => setPendingDelete({ id })}
                      onUpdatePage={onUpdatePage}
                      onDuplicatePage={handleDuplicatePage}
                      onOpenPage={onOpenPage}
                      showUpdatedAt={false}
                    />
                  ))}
                </ul>
              </SidebarSection>
            )}

            <SidebarSection
              label={t("yourPages", "Privato")}
              onAdd={() => setIsModalOpen(true)}
              addLabel={t("newPage", "Nuova pagina")}
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
                    {t("land.sideNoPages", "Nessuna pagina")}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    {t("newPage", "Crea una pagina")}
                  </button>
                </div>
              ) : (
                <ul
                  role="tree"
                  aria-label={t("yourPages", "Pagine private")}
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
                      onOpenPage={onOpenPage}
                    />
                  ))}
                </ul>
              )}
            </SidebarSection>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </nav>

        {/* ── Account + menu "Altro" ───────────────────────────────────────────
            L'account è in fondo alla sidebar; accanto a lui un bottone
            "Altro" raccoglie le voci secondarie che prima occupavano
            quattro righe verticali (Impostazioni, Cestino, Aiuto, Invita). */}
        <div
          className="border-t border-gray-100 dark:border-gray-800 px-2 py-2 flex items-center gap-1.5"
          ref={profileRef}
        >
          {/* Account trigger */}
          <button
            type="button"
            onClick={(e) => {
              const rect = profileRef.current?.getBoundingClientRect();
              if (rect) {
                // il menu si apre sopra l'account, non sotto: resterebbe
                // tagliato dal bordo inferiore della sidebar.
                setProfileMenuPos({ top: rect.top - 8, left: rect.left });
              }
              setIsMoreOpen(false);
              setIsProfileOpen((s) => !s);
            }}
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
            aria-label="Menu account"
            className="flex flex-1 items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-white/5 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 min-w-0"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt=""
                className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#7b39fc]/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 bg-[#7b39fc]/10 dark:bg-[#7b39fc]/20 rounded-full flex items-center justify-center shrink-0">
                <User size={13} aria-hidden="true" className="text-[#7b39fc] dark:text-[#a67cff]" />
              </div>
            )}
            <span className="flex-1 text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
              {user.name || "Account"}
            </span>
            <ChevronUp
              size={14}
              aria-hidden="true"
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                isProfileOpen ? "" : "rotate-180"
              }`}
            />
          </button>

          {/* Menu "Altro" */}
          <button
            ref={moreRef}
            type="button"
            onClick={() => {
              setIsProfileOpen(false);
              setIsMoreOpen((s) => !s);
            }}
            aria-expanded={isMoreOpen}
            aria-haspopup="menu"
            aria-label={t("nav.more", "Altro")}
            title={t("nav.more", "Altro")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Sliders size={16} aria-hidden="true" className="shrink-0" />
            <span className="text-xs font-semibold">{t("nav.more", "Altro")}</span>
          </button>
        </div>

        <AddPageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOpenTemplateGallery={onOpenTemplateGallery}
          onAdd={(type) => {
            onAddPage(type);
            setIsModalOpen(false);
          }}
        />
      </aside>

      {moreMenuPortal}
      {profileMenuPortal}
      {helpMenuPortal}
      {trashMenuPortal}
      {pendingDeletePortal}
      {inviteModalPortal}
    </>
  );
}
