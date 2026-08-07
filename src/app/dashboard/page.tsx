/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
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
  Trash2,
  RotateCw,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  MoreVertical,
  Sun,
  Moon,
  LogOut,
  Settings,
  Lock,
  Unlock,
  Copy,
  Move,
  Type,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { EditableTitle } from "../../components/UIComponents";
import Sidebar from "../../components/Sidebar";
import Dashboard from "../../components/Dashboard";
import ItemList from "../../components/ItemList";
import GoalsView from "../../components/GoalsView";
import NotesView from "../../components/NotesView";
import CalendarView from "../../components/CalendarView";
import BrainDumpView from "../../components/BrainDumpView";
import EmptyPageView from "../../components/EmptyPageView";
import { motion, AnimatePresence } from "framer-motion";
import AIPanel from "../../components/AIPanel";
import NotificationBell from "../../components/NotificationBell";
import { getSocket } from "../../lib/socket";
import { useUserData } from "../../hooks/useUserData";
import { useDashboardSocket } from "../../hooks/useDashboardSocket";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

function DashboardContent() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("theme") || "dark";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPeekOpen, setIsSidebarPeekOpen] = useState(false);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

  const {
    user,
    tasks,
    setTasks,
    goals,
    setGoals,
    ideas,
    setIdeas,
    pages,
    setPages,
    plannerMeta,
    setPlannerMeta,
    plan,
    subscription,
    loading,
    hasLoadedUserData,
  } = useUserData();

  const socket = React.useMemo(() => {
    try {
      return getSocket();
    } catch {
      return null;
    }
  }, []);

  const activePageId = searchParams.get("page");
  const activeType = searchParams.get("type");
  const focusTitleParam = searchParams.get("focusTitle");
  const activePage = (pages || []).find(
    (page) => String(page.id) === String(activePageId),
  );

  const { remoteCursors } = useDashboardSocket(
    socket,
    activePageId,
    user,
    setPages,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const parsed = JSON.parse(
        localStorage.getItem("dashboardOpenTabs") || "[]",
      );
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [draggingTabId, setDraggingTabId] = useState(null);
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [iconCategory, setIconCategory] = useState("All");
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = React.useRef<HTMLDivElement | null>(null);
  const syncedPageIdsRef = React.useRef<Record<string, { deleted?: boolean }>>({});
  const pagesSyncedRef = React.useRef(false);
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const router = useRouter();

  // Hover preview state for icons
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  // Allow applying color without closing menu
  const [pendingIconColor, setPendingIconColor] = useState<string | null>(null);

  const ICON_MAP = {
    "layout-dashboard": LayoutDashboard,
    "list-todo": ListTodo,
    target: Target,
    calendar: Calendar,
    "file-text": FileText,
    lightbulb: Lightbulb,
    "briefcase-business": BriefcaseBusiness,
    users: Users,
    layers: Layers,
    "book-open": BookOpen,
    "clipboard-list": ClipboardList,
    rocket: Rocket,
  };
  const ICON_OPTIONS = Object.keys(ICON_MAP);
  // Manual category mapping for common lucide icon names. If an icon
  // isn't present here we fall back to the heuristic regexes used before.
  const ICON_CATEGORY_MAP = {
    Activity: "Other",
    ArrowRight: "Arrows",
    ArrowLeft: "Arrows",
    ArrowUp: "Arrows",
    ArrowDown: "Arrows",
    ChevronRight: "Arrows",
    ChevronLeft: "Arrows",
    ChevronDown: "Arrows",
    ChevronUp: "Arrows",
    Play: "Media",
    Pause: "Media",
    StopCircle: "Media",
    Video: "Media",
    Camera: "Media",
    Mic: "Media",
    Volume: "Media",
    Music: "Media",
    Film: "Media",
    Image: "Media",
    File: "Files",
    FileText: "Files",
    Folder: "Files",
    Clipboard: "Files",
    Archive: "Files",
    Edit2: "Editors",
    Edit3: "Editors",
    Pen: "Editors",
    Code: "Editors",
    Type: "Editors",
    Heading1: "Editors",
    List: "Editors",
    CheckSquare: "Editors",
    User: "Users",
    Users: "Users",
    UserPlus: "Users",
    UserMinus: "Users",
    Menu: "Interface",
    MoreHorizontal: "Interface",
    MoreVertical: "Interface",
    Settings: "Interface",
    Search: "Interface",
    Plus: "Interface",
    Minus: "Interface",
    X: "Interface",
    Check: "Interface",
    LayoutDashboard: "Interface",
    GitHub: "Logos",
    Twitter: "Logos",
    Linkedin: "Logos",
    Youtube: "Logos",
    Facebook: "Logos",
    Instagram: "Logos",
    Docker: "Logos",
    Npm: "Logos",
    // Legacy mapping for ICON_MAP keys
    "layout-dashboard": "Interface",
    "list-todo": "Editors",
    target: "Interface",
    calendar: "Interface",
    lightbulb: "Other",
    "briefcase-business": "Other",
  };
  // Build a full mapping by filling missing entries with heuristic rules
  const FULL_ICON_CATEGORY_MAP = React.useMemo(() => {
    const map = { ...ICON_CATEGORY_MAP };
    const heuristic = (name) => {
      const lower = name.toLowerCase();
      if (/arrow|chev|triangle|corner/.test(lower)) return "Arrows";
      if (
        /video|play|pause|camera|mic|volume|music|film|image|picture/.test(
          lower,
        )
      )
        return "Media";
      if (/file|folder|document|clipboard|archive|filetext/.test(lower))
        return "Files";
      if (/edit|pen|type|code|heading|list|check/.test(lower)) return "Editors";
      if (/user|person|people|users/.test(lower)) return "Users";
      if (
        /menu|more|settings|search|plus|minus|x|check|close|open|panel|layout|moon|sun/.test(
          lower,
        )
      )
        return "Interface";
      if (
        /github|gitlab|twitter|facebook|instagram|linkedin|youtube|npm|docker|mastodon/.test(
          lower,
        )
      )
        return "Logos";
      return "Other";
    };

    Object.keys(LucideIcons).forEach((name) => {
      const exported = LucideIcons[name];
      // lucide-react sometimes exports components via forwardRef which are objects
      // (typeof === 'object') — accept both function and object export types.
      if (!(typeof exported === "function" || typeof exported === "object"))
        return;
      if (map[name] || map[name.toLowerCase()]) return;
      map[name] = heuristic(name);
    });
    return map;
  }, [ICON_CATEGORY_MAP]);

  const COLOR_OPTIONS = [
    { label: "Default", value: "text-gray-400", bg: "bg-gray-400" },
    { label: "Viola", value: "text-[#7b39fc]", bg: "bg-[#7b39fc]" },
    { label: "Smeraldo", value: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Rosa", value: "text-rose-500", bg: "bg-rose-500" },
    { label: "Ambra", value: "text-amber-500", bg: "bg-amber-500" },
    { label: "Blu", value: "text-blue-500", bg: "bg-blue-500" },
    { label: "Rosso", value: "text-red-500", bg: "bg-red-500" },
  ];

  // Clear transient icon preview states when icon menu closes
  useEffect(() => {
    if (!isIconMenuOpen) {
      setHoverIcon(null);
      setPendingIconColor(null);
    }
  }, [isIconMenuOpen]);

  // Close icon menu when page is locked
  useEffect(() => {
    if (activePage?.locked) setIsIconMenuOpen(false);
  }, [activePage?.locked]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  // If focusTitle param is present, remove it shortly after mount so it
  // doesn't persist in the URL after auto-focusing the title input.
  useEffect(() => {
    if (!focusTitleParam) return;
    const id = setTimeout(() => {
      // navigate to same page without the focusTitle param
      if (activePageId) {
        router.replace(`/dashboard?page=${activePageId}`);
      } else {
        router.replace(`/dashboard`);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [focusTitleParam, activePageId, router]);

  // Close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(e.target)
      ) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-delete trash items after 30 days
  useEffect(() => {
    if (!hasLoadedUserData) return;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cleanup = () => {
      setPages((prev) => {
        const cur = Array.isArray(prev) ? prev : [];
        const now = Date.now();
        const expired = cur.filter((p) => {
          if (!p.deleted || !p.deletedAt) return false;
          return now - new Date(p.deletedAt).getTime() > THIRTY_DAYS;
        });
        if (expired.length === 0) return prev;
        const expiredIds = new Set(expired.map((p) => p.id));
        let changed = true;
        while (changed) {
          changed = false;
          cur.forEach((page) => {
            if (
              page.parentId &&
              expiredIds.has(page.parentId) &&
              !expiredIds.has(page.id)
            ) {
              expiredIds.add(page.id);
              changed = true;
            }
          });
        }
        return cur.filter((page) => !expiredIds.has(page.id));
      });
    };
    cleanup();
    const interval = setInterval(cleanup, 3600000);
    return () => clearInterval(interval);
  }, [hasLoadedUserData]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const addPage = (pageConfig) => {
    const pageType = pageConfig.type || "tasks";
    const curPages = Array.isArray(pages) ? pages : [];
    const maxPages = plan && plan.maxPages;
    if (maxPages !== null && maxPages !== undefined && curPages.length >= maxPages) {
      setPlanNotice(
        `Hai raggiunto il limite di ${maxPages} pagine del piano ${plan?.name || "Starter"}.`,
      );
      return;
    }
    // For empty pages we want an empty label so the title shows a placeholder
    // and we can enter edit mode immediately.
    const pageLabel =
      pageType === "empty" ? "" : pageConfig.label || "Nuova Pagina";
    const newPageId = Date.now();

    const newPage = {
      id: newPageId,
      type: pageType,
      label: pageLabel,
      icon: pageConfig.iconName || pageConfig.icon || "layout-dashboard",
      parentId: pageConfig.parentId || null,
      order: pages.filter((p) => !p.parentId).length,
      purpose: pageConfig.purpose || null,
      isTemplate: Boolean(pageConfig.isTemplate),
      initialData: pageConfig.initialData || null,
      data:
        pageConfig.initialData || (pageType === "empty" ? { text: "" } : []),
    };

    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return [...cur, newPage];
    });
    // If this is a freshly created empty page, add a flag so the view
    // will autofocus the title input.
    if (pageType === "empty") {
      router.push(`/dashboard?page=${newPageId}&focusTitle=1`);
    } else {
      router.push(`/dashboard?page=${newPageId}`);
    }
  };

  const deletePage = (id) => {
    // Soft-delete: mark page and its descendants with `deleted: true`
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      const idsToMark = new Set([id]);
      let changed = true;

      // collect children pages recursively
      while (changed) {
        changed = false;
        cur.forEach((page) => {
          if (
            page.parentId &&
            idsToMark.has(page.parentId) &&
            !idsToMark.has(page.id)
          ) {
            idsToMark.add(page.id);
            changed = true;
          }
        });
      }

      return cur.map((page) =>
        idsToMark.has(page.id)
          ? { ...page, deleted: true, deletedAt: new Date().toISOString() }
          : page,
      );
    });
  };

  const restorePage = (id) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return cur.map((p) =>
        p.id === id ? { ...p, deleted: false, deletedAt: undefined } : p,
      );
    });
  };

  const permanentlyDelete = (id) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      const idsToRemove = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        cur.forEach((page) => {
          if (
            page.parentId &&
            idsToRemove.has(page.parentId) &&
            !idsToRemove.has(page.id)
          ) {
            idsToRemove.add(page.id);
            changed = true;
          }
        });
      }
      return cur.filter((page) => !idsToRemove.has(page.id));
    });
  };

  const updatePage = (id, updates) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return cur.map((page) =>
        page.id === id ? { ...page, ...updates } : page,
      );
    });
  };

  const updatePageData = (id, nextData) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return cur.map((page) =>
        page.id === id ? { ...page, data: nextData } : page,
      );
    });
    if (socket) {
      socket.emit("page-update", {
        pageId: String(id),
        data: nextData,
        source: socket.id,
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (!next) {
        setIsSidebarPeekOpen(false);
      }
      return next;
    });
  };

  const duplicatePage = (id) => {
    const source = pages.find((p) => String(p.id) === String(id));
    if (!source) return;
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newPage = {
      ...source,
      id: newId,
      label: source.label + " (copia)",
      order: pages.filter((p) => !p.parentId).length,
      data: source.data ? JSON.parse(JSON.stringify(source.data)) : null,
    };
    setPages((prev) => [...prev, newPage]);
    router.push(`/dashboard?page=${newId}`);
  };

  const nestPage = (pageId, parentId) => {
    setPages((prev) =>
      prev.map((p) =>
        String(p.id) === String(pageId)
          ? { ...p, parentId: parentId || null }
          : p,
      ),
    );
    setIsNestModalOpen(false);
    setIsSettingsMenuOpen(false);
  };

  const exportPageAsPDF = (page) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = generatePageExportContent(page);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${page.label || "Pagina"}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        .meta { color: #666; font-size: 0.875rem; margin-bottom: 2rem; }
        .content { line-height: 1.6; }
      </style>
      </head>
      <body>
        <h1>${escapeHtml(page.label || "Senza titolo")}</h1>
        <div class="meta">Tipo: ${page.type} | Creato: ${page.createdAt ? new Date(page.createdAt).toLocaleDateString() : "-"}</div>
        <div class="content">${content}</div>
        <script>window.print();<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportPageAsHTML = (page) => {
    const content = generatePageExportContent(page);
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${escapeHtml(page.label || "Pagina")}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px">
  <h1>${escapeHtml(page.label || "Senza titolo")}</h1>
  <div class="content">${content}</div>
</body>
</html>`;
    downloadFile(html, `${page.label || "pagina"}.html`, "text/html");
  };

  const exportPageAsCSV = (page) => {
    const rows = [["Campo", "Valore"]];
    rows.push(["Titolo", page.label || ""]);
    rows.push(["Tipo", page.type || ""]);
    rows.push(["Icona", page.icon || ""]);
    rows.push(["Data creazione", page.createdAt ? new Date(page.createdAt).toLocaleDateString() : ""]);
    if (Array.isArray(page.data)) {
      page.data.forEach((item, i) => {
        rows.push([`Elemento ${i + 1}`, item.title || item.text || JSON.stringify(item)]);
      });
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadFile(csv, `${page.label || "pagina"}.csv`, "text/csv;charset=utf-8");
  };

  const exportPageAsMarkdown = (page) => {
    let md = `# ${page.label || "Senza titolo"}\n\n`;
    md += `- **Tipo:** ${page.type}\n`;
    md += `- **Creato:** ${page.createdAt ? new Date(page.createdAt).toLocaleDateString() : "-"}\n\n`;
    if (Array.isArray(page.data)) {
      page.data.forEach((item) => {
        const title = item.title || item.text || "";
        md += `- ${title}\n`;
      });
    } else if (page.data && typeof page.data === "object") {
      if (page.data.blocks && Array.isArray(page.data.blocks)) {
        page.data.blocks.forEach((block) => {
          if (block.content) md += `${block.content}\n\n`;
        });
      }
    }
    downloadFile(md, `${page.label || "pagina"}.md`, "text/markdown;charset=utf-8");
  };

  function generatePageExportContent(page) {
    if (Array.isArray(page.data)) {
      return page.data
        .map((item) => {
          const title = item.title || item.text || "";
          const checked = item.checked ? "✓ " : "";
          return `<p>${escapeHtml(checked + title)}</p>`;
        })
        .join("");
    }
    if (page.data && page.data.blocks && Array.isArray(page.data.blocks)) {
      return page.data.blocks
        .map((block) => {
          if (block.type === "text") return `<p>${escapeHtml(block.content || "")}</p>`;
          if (block.type === "heading") return `<h2>${escapeHtml(block.content || "")}</h2>`;
          if (block.type === "checkbox") {
            const checked = block.checked ? "☑ " : "☐ ";
            return `<p>${checked}${escapeHtml(block.content || "")}</p>`;
          }
          return `<p>${escapeHtml(block.content || "")}</p>`;
        })
        .join("");
    }
    return "<p>Nessun contenuto</p>";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleAIAction = (action) => {
    if (!action?.type) {
      return { ok: false, message: "Azione AI non valida." };
    }

    if (action.type === "create_page") {
      const label = action.payload?.label || "Nuova Pagina";
      addPage({
        label,
        type: "tasks",
        icon: "layout-dashboard",
        parentId: action.payload?.parentId || null,
      });
      return { ok: true, message: `Pagina "${label}" creata nella dashboard.` };
    }

    if (action.type === "update_page") {
      const targetId = action.payload?.id;
      const updates = action.payload?.updates || {};
      const target = pages.find((page) => page.id === targetId);

      if (!target) {
        return { ok: false, message: "Pagina da aggiornare non trovata." };
      }

      updatePage(targetId, updates);

      if (updates.label) {
        return {
          ok: true,
          message: `Pagina "${target.label}" rinominata in "${updates.label}".`,
        };
      }
      if (updates.icon) {
        return {
          ok: true,
          message: `Icona della pagina "${target.label}" aggiornata.`,
        };
      }
      if (Object.prototype.hasOwnProperty.call(updates, "parentId")) {
        return {
          ok: true,
          message: `Posizione della pagina "${target.label}" aggiornata.`,
        };
      }

      return { ok: true, message: `Pagina "${target.label}" aggiornata.` };
    }

    if (action.type === "add_block") {
      const { blockType, content, targetPageId, targetPageLabel } =
        action.payload;
      const targetPage = targetPageId
        ? pages.find((p) => p.id === targetPageId)
        : null;

      if (!targetPage) {
        return {
          ok: false,
          message: `Pagina "${targetPageLabel || targetPageId}" non trovata.`,
        };
      }

      if (targetPage.type !== "notes") {
        return {
          ok: false,
          message: `La funzione "aggiungi blocco" funziona solo per le pagine di tipo "Note".`,
        };
      }

      const blockToAdd = {
        type: blockType || "text",
        content: content || "",
        checked: blockType === "checkbox" ? false : undefined,
        number: blockType === "numbered" ? 1 : undefined,
        expanded: blockType === "toggle" ? false : undefined,
        children: blockType === "toggle" ? [] : undefined,
      };

      const updateNotesWithBlock = (notesData) => {
        const blocks = notesData.blocks || [];
        const newBlock = {
          id: Math.random().toString(36).substring(2, 9),
          ...blockToAdd,
        };
        return { ...notesData, blocks: [...blocks, newBlock] };
      };

      updatePageData(targetPage.id, updateNotesWithBlock);
      return {
        ok: true,
        message: `Blocco "${blockType || "testo"}" aggiunto alla pagina "${targetPage.label}".`,
      };
    }

    if (action.type === "update_page_content") {
      const { id, content } = action.payload;
      const targetPage = pages.find((p) => p.id === id);
      if (!targetPage) {
        return { ok: false, message: "Pagina non trovata." };
      }
      if (targetPage.type !== "notes") {
        return {
          ok: false,
          message:
            "L'aggiornamento del contenuto funziona solo per le pagine Note.",
        };
      }
      const updateContent = (notesData) => {
        const blocks = notesData.blocks || [];
        const newBlock = {
          id: Math.random().toString(36).substring(2, 9),
          type: "text",
          content: content,
          color: "default",
        };
        return { ...notesData, blocks: [...blocks, newBlock] };
      };
      updatePageData(id, updateContent);
      return { ok: true, message: `Contenuto aggiunto alla pagina.` };
    }

    if (action.type === "insert_page_text") {
      const { id, text } = action.payload;
      const targetPage = pages.find((p) => p.id === id);
      if (!targetPage) {
        return { ok: false, message: "Pagina non trovata." };
      }
      if (targetPage.type !== "notes") {
        return {
          ok: false,
          message: "L'inserimento di testo funziona solo per le pagine Note.",
        };
      }
      const insertText = (notesData) => {
        const blocks = notesData.blocks || [];
        const newBlock = {
          id: Math.random().toString(36).substring(2, 9),
          type: "text",
          content: text,
          color: "default",
        };
        return { ...notesData, blocks: [...blocks, newBlock] };
      };
      updatePageData(id, insertText);
      return { ok: true, message: `Testo aggiunto alla pagina.` };
    }

    return { ok: false, message: `Azione "${action.type}" non supportata.` };
  };

  const shouldShowSidebar = isSidebarOpen || isSidebarPeekOpen;

  const breadcrumbs = React.useMemo(() => {
    const crumbs = [] as any[];
    let cur = activePage;
    while (cur) {
      crumbs.unshift(cur);
      if (!cur.parentId) break;
      cur = pages.find((p) => String(p.id) === String(cur.parentId));
    }
    return crumbs;
  }, [activePage, pages]);

  const renderActiveView = () => {
    // If trash query param is present, show Trash UI
    if (searchParams.get("trash") === "1") {
      const deletedPages = (pages || [])
        .filter((p) => p && p.deleted)
        .slice()
        .sort((a, b) => {
          const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
          const db = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
          return db - da;
        });

      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Cestino</h2>
          </div>

          {deletedPages.length === 0 ? (
            <div className="p-6 text-center text-gray-400 dark:text-gray-500">
              Nessun elemento nel cestino.
            </div>
          ) : (
            <div className="space-y-3">
              {deletedPages.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border rounded-xl"
                >
                  <div>
                    <div className="font-bold text-sm text-gray-800 dark:text-gray-100">
                      {p.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.type || "pagina"} • eliminato{" "}
                      {p.deletedAt
                        ? new Date(p.deletedAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => restorePage(p.id)}
                      title="Ripristina"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <RotateCw size={14} />
                      <span>Ripristina</span>
                    </button>
                    <button
                      onClick={() => permanentlyDelete(p.id)}
                      title="Elimina definitivamente"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                      <span>Elimina definitivamente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    const tabForActivePage = openTabs.find(
      (tab) => String(tab.id) === String(activePageId),
    );
    const effectivePage = activePage || tabForActivePage;

    if (activePageId && (activePage || (loading && tabForActivePage))) {
      const pageType = effectivePage.type || activeType || "tasks";
      const childPages = (pages || []).filter(
        (p) =>
          p && !p.deleted && String(p.parentId) === String(effectivePage.id),
      );

      const withChildren = (view) => (
        <>
          {childPages && childPages.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Sottopagine
              </div>
              <div className="flex flex-wrap gap-2">
                {childPages.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard?page=${c.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {(() => {
                        const rawIcon = c.icon;
                        const IconComp =
                          (typeof rawIcon === "string" && rawIcon
                            ? LucideIcons[rawIcon] || ICON_MAP[rawIcon]
                            : null) || LayoutDashboard;
                        return (
                          <IconComp
                            size={14}
                            className={`${c.iconColor || "text-gray-400"} shrink-0`}
                          />
                        );
                      })()}
                      <span>{c.label || "(senza titolo)"}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {view}
        </>
      );
      const title = effectivePage.label || "Caricamento...";

      if (pageType === "tasks") {
        const defaultView =
          effectivePage.purpose === "project_management" ? "kanban" : "list";
        return withChildren(
          <ItemList
            title={title}
            items={Array.isArray(effectivePage.data) ? effectivePage.data : []}
            setItems={(nextItems) =>
              updatePageData(effectivePage.id, nextItems)
            }
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            allPages={pages}
            defaultView={defaultView}
            loading={loading}
          />,
        );
      }

      if (pageType === "goals") {
        return withChildren(
          <GoalsView
            title={title}
            data={Array.isArray(effectivePage.data) ? effectivePage.data : []}
            setData={(nextData) => updatePageData(effectivePage.id, nextData)}
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            loading={loading}
          />,
        );
      }

      if (pageType === "calendar") {
        // Render a server-stable placeholder until the client mounts to avoid
        // hydration mismatches caused by client-only Date/localStorage usage
        // inside the calendar component.
        if (!mounted) {
          return (
            <div className="space-y-8 pb-12">
              <div className="space-y-2">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-8 w-64" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg h-4 w-96" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-4xl h-20 w-full" />
                    <div className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-[2.5rem] h-100 w-full" />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return withChildren(
          <CalendarView
            title={title}
            tasks={effectivePage.data || { tasks: [], dailyMeta: {} }}
            setTasks={(nextData) => updatePageData(effectivePage.id, nextData)}
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            loading={loading}
          />,
        );
      }

      if (pageType === "notes") {
        return withChildren(
          <NotesView
            title={title}
            data={
              effectivePage.data ||
              effectivePage.initialData || { text: "", tags: [] }
            }
            setData={(nextData) => updatePageData(effectivePage.id, nextData)}
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            loading={loading}
            onAddPage={addPage}
            activePageId={effectivePage.id}
            allPages={pages}
          />,
        );
      }

      if (pageType === "braindump" || pageType === "brain_dump") {
        return withChildren(
          <BrainDumpView
            title={title}
            data={Array.isArray(effectivePage.data) ? effectivePage.data : []}
            setData={(nextData) => updatePageData(effectivePage.id, nextData)}
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            allPages={pages}
            loading={loading}
            onConvertToTask={(idea, targetPageId) => {
              const target = pages.find(
                (page) => String(page.id) === String(targetPageId),
              );
              if (!target || target.type !== "tasks") return;
              const task = {
                id: Math.random().toString(36).substring(2, 9),
                title: idea.title,
                priority: "Media",
                status: "todo",
                deadline: "",
                assignee: "",
                links: [],
                createdAt: new Date().toISOString(),
              };
              const nextTasks = Array.isArray(target.data)
                ? [task, ...target.data]
                : [task];
              updatePageData(target.id, nextTasks);
            }}
          />,
        );
      }

      if (pageType === "empty") {
        return withChildren(
          <EmptyPageView
            title={title}
            data={effectivePage.data || { text: "" }}
            setData={(nextData) => updatePageData(effectivePage.id, nextData)}
            onRename={(nextTitle) =>
              updatePage(effectivePage.id, { label: nextTitle })
            }
            onAddPage={addPage}
            activePageId={effectivePage.id}
            allPages={pages}
            loading={loading}
          />,
        );
      }
    }

    return (
      <>
        {planNotice && (
          <div className="mb-4 max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-[#a67cff]/10 border border-[#a67cff]/25 text-sm font-bold text-[#a67cff]">
            <span>{planNotice}</span>
            <span className="flex items-center gap-2 shrink-0">
              <Link
                href="/#pricing"
                className="px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Aggiorna piano
              </Link>
              <button
                onClick={() => setPlanNotice(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </span>
          </div>
        )}
        <Dashboard
          tasks={tasks}
          goals={goals}
          ideas={ideas}
          plannerMeta={plannerMeta}
          pages={pages}
          loading={loading}
          plan={plan}
        />
      </>
    );
  };

  useEffect(() => {
    if (!activePage) return;
    const timeout = setTimeout(() => {
      setOpenTabs((prev) =>
        prev.some((tab) => String(tab.id) === String(activePage.id))
          ? prev
          : [...prev, activePage],
      );
    }, 0);
    return () => clearTimeout(timeout);
  }, [activePage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpenTabs((prev) =>
        prev.filter((tab) =>
          pages.some((page) => String(page.id) === String(tab.id)),
        ),
      );
    }, 0);
    return () => clearTimeout(timeout);
  }, [pages]);

  useEffect(() => {
    localStorage.setItem(
      "dashboardOpenTabs",
      JSON.stringify(
        openTabs.map((tab) => ({
          id: tab.id,
          type: tab.type,
          label: tab.label,
        })),
      ),
    );
  }, [openTabs]);

  useEffect(() => {
    if (!hasLoadedUserData) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    // First run after load: seed the "known" set with the server state so we
    // never re-create pages that already exist.
    if (!pagesSyncedRef.current) {
      pagesSyncedRef.current = true;
      const snapshot: Record<string, { deleted?: boolean }> = {};
      (Array.isArray(pages) ? pages : []).forEach((p) => {
        snapshot[String(p.id)] = { deleted: Boolean(p.deleted) };
      });
      syncedPageIdsRef.current = snapshot;
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const cur = Array.isArray(pages) ? pages : [];
        const byId = new Map(cur.map((p) => [String(p.id), p]));
        const snapshot = syncedPageIdsRef.current;

        // Hard-delete pages the client no longer holds (permanently removed)
        Object.keys(snapshot).forEach((id) => {
          if (byId.has(id)) return;
          apiFetch(`/resources/pages/${id}`, { method: "DELETE" }).catch(() => {});
          delete snapshot[id];
        });

        // Upsert every known page via structured CRUD
        const headers = { "Content-Type": "application/json" };
        cur.forEach((p) => {
          const id = String(p.id);
          const prev = snapshot[id];
          if (!prev) {
            apiFetch("/resources/pages", {
              method: "POST",
              headers,
              body: JSON.stringify(p),
            })
              .then((r) => {
                if (r.ok) snapshot[id] = { deleted: Boolean(p.deleted) };
              })
              .catch(() => {});
          } else {
            apiFetch(`/resources/pages/${id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify(p),
            })
              .then((r) => {
                if (r.ok) snapshot[id] = { deleted: Boolean(p.deleted) };
              })
              .catch(() => {});
          }
        });
      } catch (error) {
        console.error("Error persisting pages:", error);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [pages, hasLoadedUserData]);

  const reorderTabs = (fromId, toId) => {
    if (!fromId || !toId || String(fromId) === String(toId)) return;
    setOpenTabs((prev) => {
      const fromIndex = prev.findIndex(
        (tab) => String(tab.id) === String(fromId),
      );
      const toIndex = prev.findIndex((tab) => String(tab.id) === String(toId));
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  /* Remove the early return for loading to show skeletons instead */

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {!isSidebarOpen && (
        <div
          onMouseEnter={() => setIsSidebarPeekOpen(true)}
          className="fixed left-0 top-0 bottom-0 w-3 z-30"
          aria-hidden="true"
        />
      )}

      <AnimatePresence mode="wait">
        {shouldShowSidebar && (
          <motion.div
            initial={{ x: -256, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -256, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-40"
            onMouseLeave={() => {
              if (!isSidebarOpen) setIsSidebarPeekOpen(false);
            }}
          >
            <Sidebar
              user={user}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              theme={theme}
              toggleTheme={toggleTheme}
              pages={pages}
              onAddPage={addPage}
              onDeletePage={deletePage}
              onUpdatePage={(id, updates) => updatePage(id, updates)}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`transition-all duration-300 ${shouldShowSidebar ? "pl-64" : "pl-0"}`}
      >
        <div className="sticky top-0 z-50 h-14 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-3 flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>

          {/* Tabs — scrollable */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0 scrollbar-hide">
            {mounted && openTabs.length > 0 ? (
              openTabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/dashboard?page=${tab.id}`}
                  draggable
                  onDragStart={() => setDraggingTabId(tab.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    reorderTabs(draggingTabId, tab.id);
                    setDraggingTabId(null);
                  }}
                  onDragEnd={() => setDraggingTabId(null)}
                  className={`inline-flex shrink-0 items-center gap-2 px-3 h-9 rounded-lg text-xs font-bold border whitespace-nowrap ${
                    String(activePageId) === String(tab.id)
                      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 border-cyan-200 dark:border-cyan-700"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {tab.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenTabs((prev) =>
                        prev.filter((t) => String(t.id) !== String(tab.id)),
                      );
                    }}
                    className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <X size={12} />
                  </button>
                </Link>
              ))
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* ── Settings three-dot menu ─────────────── */}
          {/* Notification bell */}
          <div className="shrink-0 mr-1">
            <NotificationBell />
          </div>

          <div className="relative shrink-0" ref={settingsMenuRef}>
            <button
              onClick={() => setIsSettingsMenuOpen((o) => !o)}
              className="p-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Impostazioni"
            >
              <MoreVertical size={18} />
            </button>

            <AnimatePresence>
              {isSettingsMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl shadow-black/10 dark:shadow-black/40 z-200 overflow-hidden"
                >
                  {/* Header */}
                  <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                      {t("settings")}
                    </p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {/* Tema */}
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsSettingsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                    >
                      {theme === "dark" ? (
                        <Sun size={16} className="text-amber-400" />
                      ) : (
                        <Moon size={16} className="text-gray-500 dark:text-gray-300" />
                      )}
                      {theme === "dark" ? t("lightMode") : t("darkMode")}
                    </button>

                    {/* Impostazioni account */}
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setIsSettingsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings size={16} className="text-gray-400 dark:text-gray-500" />
                      {t("accountSettings")}
                    </button>

                    {/* Quick language selector */}
                    <div className="pt-2 px-1">
                      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {t("language")}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {[
                          { code: "it", label: "IT" },
                          { code: "en", label: "EN" },
                        ].map((lng) => (
                          <button
                            key={lng.code}
                            onClick={() => {
                              setLanguage(lng.code);
                              setIsSettingsMenuOpen(false);
                            }}
                            className={`px-2 py-1 text-xs rounded-md font-semibold transition-colors ${language === lng.code ? "bg-cyan-600 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50"}`}
                          >
                            {lng.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Page settings (solo se c'è una pagina attiva) ── */}
                    {activePage && (
                      <>
                        <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                        <div className="px-4 pt-1 pb-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                            Pagina
                          </p>
                        </div>

                        {/* Esporta */}
                        <div className="pt-1 px-1">
                          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">
                            Esporta
                          </div>
                          <div className="flex flex-wrap gap-1 px-2">
                            <button onClick={() => { exportPageAsPDF(activePage); setIsSettingsMenuOpen(false); }} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 transition-colors">PDF</button>
                            <button onClick={() => { exportPageAsHTML(activePage); setIsSettingsMenuOpen(false); }} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 transition-colors">HTML</button>
                            <button onClick={() => { exportPageAsCSV(activePage); setIsSettingsMenuOpen(false); }} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 transition-colors">CSV</button>
                            <button onClick={() => { exportPageAsMarkdown(activePage); setIsSettingsMenuOpen(false); }} className="px-2.5 py-1.5 text-xs rounded-lg font-semibold bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 transition-colors">MD</button>
                          </div>
                        </div>

                        <button
                          onClick={() => { updatePage(activePage.id, { locked: !activePage.locked }); setIsSettingsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {activePage.locked ? <Unlock size={16} className="text-amber-500" /> : <Lock size={16} className="text-gray-400" />}
                          {activePage.locked ? "Sblocca pagina" : "Blocca pagina"}
                        </button>

                        <button
                          onClick={() => {
                            const fonts = ["system-ui", "serif", "monospace", "cursive"];
                            const current = activePage.font || "system-ui";
                            const next = fonts[(fonts.indexOf(current) + 1) % fonts.length];
                            updatePage(activePage.id, { font: next });
                            setIsSettingsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Type size={16} className="text-gray-400" />
                          Font: {activePage.font || "System UI"}
                        </button>

                        <button
                          onClick={() => { duplicatePage(activePage.id); setIsSettingsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Copy size={16} className="text-gray-400" />
                          Duplica pagina
                        </button>

                        <button
                          onClick={() => { setIsNestModalOpen(true); setIsSettingsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Move size={16} className="text-gray-400" />
                          Sposta sotto...
                        </button>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                        <button
                          onClick={() => { deletePage(activePage.id); setIsSettingsMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={16} />
                          Elimina pagina
                        </button>
                      </>
                    )}
                  </div>

                  {/* Footer logout removed - logout moved to dedicated places */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className={`p-3 md:p-6 ${activePage?.font && activePage.font !== "system-ui" ? activePage.font === "serif" ? "font-serif" : activePage.font === "monospace" ? "font-mono" : "font-serif" : ""}`}>
          {activePageId && activePage && !loading && (
            <div className="mb-8 flex items-start gap-6 group relative">
              <div className="relative">
                <button
                  onClick={() => !activePage.locked && setIsIconMenuOpen(!isIconMenuOpen)}
                  className={`w-20 h-20 rounded-3xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center ${activePage.iconColor || "text-gray-400"} hover:text-cyan-500 hover:border-cyan-500/50 transition-all shadow-xl shadow-cyan-500/5 group-hover:scale-105 ${activePage.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {(() => {
                    const rawIcon = activePage.icon;
                    let IconOrElement: any = null;

                    if (typeof rawIcon === "string" && rawIcon) {
                      IconOrElement =
                        LucideIcons[rawIcon] ||
                        ICON_MAP[rawIcon] ||
                        LayoutDashboard;
                    } else if (React.isValidElement(rawIcon)) {
                      IconOrElement = rawIcon;
                    } else if (
                      typeof rawIcon === "function" ||
                      typeof rawIcon === "object"
                    ) {
                      // component type (including forwardRef objects)
                      IconOrElement = rawIcon;
                    } else {
                      IconOrElement = LayoutDashboard;
                    }

                    return React.isValidElement(IconOrElement)
                      ? IconOrElement
                      : React.createElement(IconOrElement, { size: 36 });
                  })()}
                </button>

                <AnimatePresence>
                  {isIconMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full mt-3 left-0 z-110 w-72 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-2xl p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">
                        Seleziona Icona
                      </p>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder="Cerca icone..."
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            // remove icon
                            updatePage(activePage.id, { icon: "" });
                            setIsIconMenuOpen(false);
                          }}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold"
                        >
                          Rimuovi icona
                        </button>
                      </div>

                      {/* Category tabs */}
                      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                        {[
                          "All",
                          "Arrows",
                          "Media",
                          "Files",
                          "Editors",
                          "Users",
                          "Interface",
                          "Logos",
                          "Other",
                        ].map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setIconCategory(cat)}
                            className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                              iconCategory === cat
                                ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-800"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-6 gap-2 mb-6 max-h-72 overflow-y-auto">
                        {/** Build icon list from lucide-react exports **/}
                        {typeof LucideIcons === "object" && LucideIcons !== null && Object.keys(LucideIcons).length > 0 && Object.keys(LucideIcons)
                          .filter((name) => {
                            const exported = LucideIcons[name];
                            return (
                              typeof exported === "function" ||
                              typeof exported === "object"
                            );
                          })
                          .filter((name) => {
                            const lower = name.toLowerCase();
                            // first try full mapping (manual + generated)
                            const mapped =
                              FULL_ICON_CATEGORY_MAP[name] ||
                              FULL_ICON_CATEGORY_MAP[name.toLowerCase()];
                            if (iconCategory === "All") {
                              return name
                                .toLowerCase()
                                .includes(iconSearch.toLowerCase());
                            }
                            if (mapped) {
                              return (
                                mapped === iconCategory &&
                                name
                                  .toLowerCase()
                                  .includes(iconSearch.toLowerCase())
                              );
                            }
                            // fallback heuristics when no manual mapping
                            const matchesCategory = (() => {
                              if (iconCategory === "Arrows")
                                return /arrow|chev|triangle|corner/.test(lower);
                              if (iconCategory === "Media")
                                return /video|play|pause|camera|mic|volume|music|film|picture|image|video/.test(
                                  lower,
                                );
                              if (iconCategory === "Files")
                                return /file|folder|document|clipboard|filetext/.test(
                                  lower,
                                );
                              if (iconCategory === "Editors")
                                return /edit|pen|type|code|filetext|heading|list|check/.test(
                                  lower,
                                );
                              if (iconCategory === "Users")
                                return /user|person|people|users|user/.test(
                                  lower,
                                );
                              if (iconCategory === "Interface")
                                return /menu|more|settings|search|plus|minus|x|check|close|open|panel|layout|moon|sun/.test(
                                  lower,
                                );
                              if (iconCategory === "Logos")
                                return /github|gitlab|twitter|facebook|instagram|linkedin|youtube|npm|docker|mastodon/.test(
                                  lower,
                                );
                              return true;
                            })();

                            return (
                              matchesCategory &&
                              name
                                .toLowerCase()
                                .includes(iconSearch.toLowerCase())
                            );
                          })
                          .sort()
                          .map((iconName) => {
                            const IconComp = LucideIcons[iconName];
                            const isSelected =
                              String(activePage.icon) === iconName;
                            return (
                              <button
                                key={iconName}
                                type="button"
                                onMouseEnter={() => setHoverIcon(iconName)}
                                onMouseLeave={() => setHoverIcon(null)}
                                onClick={() => {
                                  updatePage(activePage.id, { icon: iconName });
                                  setIsIconMenuOpen(false);
                                }}
                                title={iconName}
                                className={`h-12 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs p-2 ${
                                  isSelected
                                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                                    : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                }`}
                              >
                                <IconComp size={18} />
                                <span className="text-[10px] truncate w-full">
                                  {iconName}
                                </span>
                              </button>
                            );
                          })}
                      </div>

                      {/* Hover preview */}
                      {hoverIcon && (
                        <div className="p-2 mb-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 border flex items-center justify-center">
                            {React.createElement(
                              LucideIcons[hoverIcon] || LayoutDashboard,
                              {
                                size: 24,
                                className: `${pendingIconColor || activePage.iconColor || "text-gray-400"}`,
                              },
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Anteprima: {hoverIcon}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">
                        Seleziona Colore
                      </p>
                      <div className="flex flex-wrap gap-2 px-2">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onMouseEnter={() => setPendingIconColor(c.value)}
                            onMouseLeave={() => setPendingIconColor(null)}
                            onClick={() => {
                              // persist color immediately but keep the menu open
                              updatePage(activePage.id, { iconColor: c.value });
                            }}
                            className={`w-6 h-6 rounded-full ${c.bg} transition-all hover:scale-125 ${
                              activePage.iconColor === c.value
                                ? "ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-gray-900"
                                : ""
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 pt-2">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {breadcrumbs.map((b, idx) => (
                      <span key={b.id} className="inline-flex items-center">
                        <Link
                          href={`/dashboard?page=${b.id}`}
                          className="hover:underline text-gray-700 dark:text-gray-200"
                        >
                          {React.isValidElement(b.label)
                            ? b.label
                            : String(b.label || "")}
                        </Link>
                        {idx < breadcrumbs.length - 1 && (
                          <span className="px-2 text-gray-400">/</span>
                        )}
                      </span>
                    ))}
                  </nav>
                )}
                <EditableTitle
                  title={activePage.label}
                  onSave={(nextTitle) =>
                    updatePage(activePage.id, { label: nextTitle })
                  }
                  className="text-4xl md:text-5xl font-black"
                  autoEdit={
                    focusTitleParam === "1" || focusTitleParam === "true"
                  }
                  locked={activePage.locked}
                  placeholder={"nuova pagina"}
                />
              </div>
            </div>
          )}

          {/* Nest modal */}
          <AnimatePresence>
            {isNestModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={() => setIsNestModalOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-2xl w-80 max-h-96 overflow-hidden"
                >
                  <div className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-black">Sposta pagina sotto</p>
                  </div>
                  <div className="p-2 overflow-y-auto max-h-72">
                    <button
                      onClick={() => nestPage(activePage.id, null)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-gray-400">—</span>
                      Nessuna (radice)
                    </button>
                    {(pages || [])
                      .filter((p) => !p.deleted && String(p.id) !== String(activePageId))
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => nestPage(activePage.id, p.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {p.icon && React.createElement(LucideIcons[p.icon] || LayoutDashboard, { size: 16, className: "text-gray-400 shrink-0" })}
                          <span className="truncate">{p.label || "(senza titolo)"}</span>
                        </button>
                      ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={activePage?.locked ? "pointer-events-none select-none" : ""}>
            {renderActiveView()}
          </div>
          {activePage?.locked && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider rounded-full border border-amber-200 dark:border-amber-700 shadow-lg">
              <Lock size={12} className="inline mr-1.5 -mt-0.5" />
              Pagina bloccata — sola lettura
            </div>
          )}
        </div>
      </main>
      {searchParams.get("ai") === "1" && (
        <AIPanel
          variant="page"
          pages={pages}
          onAction={handleAIAction}
          isSidebarOpen={shouldShowSidebar}
        />
      )}

      {/* Floating Real-Time Collaborative Cursors */}
      {Object.entries(remoteCursors).map(([id, cursor]) => (
        <div
          key={id}
          className="fixed pointer-events-none z-9999 transition-all duration-75"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-cyan-500 drop-shadow-md"
          >
            <path
              d="M5.65376 12.3825L19.2435 5.58763C20.1908 5.11399 21.1326 6.05574 20.6589 7.003L13.864 20.5928C13.4357 21.4494 12.2132 21.4429 11.7937 20.5815L9.36868 15.6025C9.17604 15.207 8.8596 14.8906 8.46407 14.6979L3.48512 12.2729C2.62366 11.8534 2.61719 10.6309 3.47382 10.2026L5.65376 12.3825Z"
              fill="currentColor"
            />
          </svg>
          <span className="ml-4 mt-1 px-2.5 py-1 bg-cyan-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl">
            {cursor.userName}
          </span>
        </div>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-800 p-4 space-y-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </div>
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-4xl"
            />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-[2.5rem] w-full" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
