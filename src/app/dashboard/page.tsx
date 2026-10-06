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
  Check,
  BookmarkPlus,
  LayoutTemplate,
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
import MyTasksView from "../../components/MyTasksView";
import WorkspaceInbox from "../../components/WorkspaceInbox";
import TrashView from "../../components/TrashView";
import TemplateGalleryModal from "../../components/TemplateGalleryModal";
import OnboardingModal from "../../components/OnboardingModal";
import OnboardingChecklist from "../../components/OnboardingChecklist";
import { motion, AnimatePresence } from "framer-motion";
import AIPanel from "../../components/AIPanel";
import NotificationBell from "../../components/NotificationBell";
import { useUserData } from "../../hooks/useUserData";
import { apiFetch } from "../../lib/api";
import { normalizeIconKey, resolvePageIcon } from "../../lib/pageIcons";
import { getCatalogIcon } from "../../lib/lucideCatalog";
import { useLanguage } from "../../lib/LanguageContext";
import { applyTheme, readTheme } from "../../lib/theme";
import { PageTemplate, saveCustomTemplate } from "../../lib/templates";
import {
  hardDeletePageCascade,
  purgeExpiredPages,
  restorePageCascade,
  softDeletePageCascade,
} from "../../lib/trashUtils";
import { parseNaturalDate, loadTasksFromStorage, saveTasksToStorage, INITIAL_SAMPLE_TASKS, purgeExpiredTasksLocal } from "../../lib/taskModel";
import { trackOnboardingEvent } from "../../hooks/useOnboarding";

function DashboardContent() {
  const { t, language, setLanguage } = useLanguage();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState("light");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarPeekOpen, setIsSidebarPeekOpen] = useState(false); // kept for future use, not used by hover
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

  const activePageId = searchParams.get("page");
  const activeType = searchParams.get("type");
  const focusTitleParam = searchParams.get("focusTitle");

  // Stat live per l'onboarding dinamico (riletti ad ogni render)
  const [liveOnboardingTasks, setLiveOnboardingTasks] = useState(0);
  const [liveOnboardingDone, setLiveOnboardingDone] = useState(0);
  useEffect(() => {
    const refresh = () => {
      try {
        const raw = localStorage.getItem("taskly_tasks_v1");
        const list = raw ? JSON.parse(raw) : [];
        const active = Array.isArray(list) ? list.filter((t: any) => !t?.deleted) : [];
        setLiveOnboardingTasks(active.length);
        setLiveOnboardingDone(active.filter((t: any) => t?.status === "done").length);
      } catch {}
    };
    refresh();
    window.addEventListener("taskly-tasks-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("taskly-tasks-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const activePage = (pages || []).find(
    (page) => String(page.id) === String(activePageId),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<any[]>([]);
  const [draggingTabId, setDraggingTabId] = useState(null);
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [iconCategory, setIconCategory] = useState("All");
  const syncedPageIdsRef = React.useRef<Record<string, { deleted?: boolean }>>({});
  const pagesSyncedRef = React.useRef(false);
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [templateToast, setTemplateToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pageLinkCopied, setPageLinkCopied] = useState(false);

  const handleCopyPageLink = (pageId: string) => {
    try {
      const url = `${window.location.origin}/dashboard?page=${pageId}`;
      navigator.clipboard.writeText(url);
      setPageLinkCopied(true);
      setTimeout(() => setPageLinkCopied(false), 2000);
    } catch {}
  };

  const handleSaveAsTemplate = (page: any) => {
    if (!page) return;
    try {
      const data = page.data && typeof page.data === "object" ? page.data : { text: "" };
      const cloned = JSON.parse(JSON.stringify(data));
      const saved = saveCustomTemplate({
        title: `${page.label || "Pagina senza titolo"} (template)`,
        category: "Personale",
        description: `Template personalizzato creato da "${page.label || "pagina"}"`,
        icon: typeof page.icon === "string" ? page.icon : "sparkles",
        iconColor: page.iconColor || "text-[#7b39fc]",
        type: page.type === "tasks" ? "tasks" : "notes",
        data: cloned,
      });
      trackOnboardingEvent("template_saved");
      setTemplateToast(`Template "${saved.title}" salvato nella galleria`);
      setTimeout(() => setTemplateToast(null), 3500);
    } catch {
      setTemplateToast("Impossibile salvare il template");
      setTimeout(() => setTemplateToast(null), 3500);
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = readTheme();
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    try {
      const parsed = JSON.parse(
        localStorage.getItem("dashboardOpenTabs") || "[]",
      );
      if (Array.isArray(parsed)) setOpenTabs(parsed);
    } catch {
      // ignore malformed localStorage
    }
  }, []);
  const router = useRouter();

  // Hover preview state for icons
  const [hoverIcon, setHoverIcon] = useState<string | null>(null);
  // Allow applying color without closing menu
  const [pendingIconColor, setPendingIconColor] = useState<string | null>(null);
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
      // (typeof === 'object') ÔÇö accept both function and object export types.
      if (!(typeof exported === "function" || typeof exported === "object"))
        return;
      if (map[name] || map[name.toLowerCase()]) return;
      map[name] = heuristic(name);
    });
    return map;
  }, [ICON_CATEGORY_MAP]);

  // Valid list of lucide exports that are actually renderable components.
  // Object.keys(LucideIcons) also yields non-component exports such as
  // `icons` (a plain map of every icon) and `createLucideIcon`; rendering or
  // iterating those produced the "reading 'map'" crash when opening this menu.
  // Computed once instead of inline so the render path never walks 5000+ keys.
  const ICON_NAMES = React.useMemo(() => {
    const names = Object.keys(LucideIcons);
    const valid = names.filter((name) => {
      if (name === "icons" || name === "createLucideIcon") return false;
      const exported = LucideIcons[name];
      if (typeof exported === "function") return true;
      // forwardRef components are plain objects exposing `render`
      return Boolean(exported && typeof exported === "object" && exported.render);
    });
    // Drop the `FooIcon` aliases when the plain `Foo` export also exists.
    return valid.filter(
      (name) => !(name.endsWith("Icon") && valid.includes(name.slice(0, -4))),
    );
  }, []);

  // Resolve an icon name to a component, with a safe fallback for unknown names.
  // Accetta sia kebab-case ("file-text") sia PascalCase ("FileText") grazie al
  // catalogo completo in lib/lucideCatalog.
  const renderIcon = (name, props) => {
    const Comp = getCatalogIcon(name);
    return React.createElement(Comp || LayoutDashboard, props);
  };

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
    // Chiaro di default: solo themeChoice esplicito abilita il dark.
    applyTheme(readTheme());
  }, []);

  // If focusTitle param is present, remove it shortly after mount so it
  // doesn't persist in the URL after auto-focusing the title input.
  useEffect(() => {
    if (!focusTitleParam) return;
    const id = setTimeout(() => {
      // Drop only focusTitle and preserve every other query param (view,
      // type, trash, ai, ...) so we never kick the user out of the current mode.
      const params = new URLSearchParams(searchParams.toString());
      params.delete("focusTitle");
      const qs = params.toString();
      router.replace(qs ? `/dashboard?${qs}` : "/dashboard");
    }, 300);
    return () => clearTimeout(id);
  }, [focusTitleParam, activePageId, router, searchParams]);

  // Auto-delete trash items after 30 days (pagine + task locali)
  useEffect(() => {
    if (!hasLoadedUserData) return;
    const cleanup = () => {
      setPages((prev) => {
        const cur = Array.isArray(prev) ? prev : [];
        const { kept } = purgeExpiredPages(cur);
        return kept.length === cur.length ? prev : kept;
      });
      try {
        const current = loadTasksFromStorage();
        const { kept } = purgeExpiredTasksLocal(current);
        if (kept.length !== current.length) saveTasksToStorage(kept);
      } catch {}
    };
    cleanup();
    const interval = setInterval(cleanup, 3600000);
    return () => clearInterval(interval);
  }, [hasLoadedUserData]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme, true);
  };

  const addPage = (pageConfig: any = {}) => {
    const pageType = pageConfig.type || "tasks";
    const curPages = Array.isArray(pages) ? pages : [];
    const maxPages = plan && plan.maxPages;
    // Only count non-deleted (active) pages against the plan quota.
    const activePageCount = curPages.filter((p) => !p.deleted).length;
    if (
      maxPages !== null &&
      maxPages !== undefined &&
      activePageCount >= maxPages
    ) {
      setPlanNotice(
        `Hai raggiunto il limite di ${maxPages} pagine del piano ${plan?.name || "Starter"}.`,
      );
      return;
    }
    // For empty pages we want an empty label so the title shows a placeholder
    // and we can enter edit mode immediately.
    const pageLabel =
      pageType === "empty" ? "" : pageConfig.label || "Nuova Pagina";
    const newPageId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `pg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const newPage = {
      id: newPageId,
      type: pageType,
      label: pageLabel,
      // Per la pagina vuota NON impostiamo un'icona di default: così il
      // PageHeader mostra il placeholder neutro e l'utente sceglie la sua.
      icon:
        pageConfig.iconName ||
        pageConfig.icon ||
        (pageType === "empty" ? "" : "layout-dashboard"),
      parentId: pageConfig.parentId || null,
      order: curPages.filter((p) => !p.parentId).length,
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
    trackOnboardingEvent("page_created");
    if (pageConfig.parentId) trackOnboardingEvent("page_nested");
    // If this is a freshly created empty page, add a flag so the view
    // will autofocus the title input.
    if (pageType === "empty") {
      router.push(`/dashboard?page=${newPageId}&focusTitle=1`);
    } else {
      router.push(`/dashboard?page=${newPageId}`);
    }
  };

  const deletePage = (id) => {
    // Soft-delete a cascata: pagina + sottopagine (deletedAt per retention 30gg)
    setPages((prev) => softDeletePageCascade(Array.isArray(prev) ? prev : [], id));
  };

  const restorePage = (id) => {
    // Ripristino a cascata con ricostruzione gerarchia / fallback al primo livello
    setPages((prev) => restorePageCascade(Array.isArray(prev) ? prev : [], id));
  };

  const permanentlyDelete = (id) => {
    // Hard delete a cascata: pagina + discendenti
    setPages((prev) => hardDeletePageCascade(Array.isArray(prev) ? prev : [], id));
  };

  const purgeExpiredTrashPages = () => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      const { kept } = purgeExpiredPages(cur);
      return kept.length === cur.length ? prev : kept;
    });
  };

  const updatePage = (id, updates) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return cur.map((page) =>
        String(page.id) === String(id) ? { ...page, ...updates } : page,
      );
    });
  };

  const updatePageData = (id, nextData) => {
    setPages((prev) => {
      const cur = Array.isArray(prev) ? prev : [];
      return cur.map((page) =>
        String(page.id) === String(id) ? { ...page, data: nextData } : page,
      );
    });
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
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `pg_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
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
          const checked = item.checked ? "Ô£ô " : "";
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
            const checked = block.checked ? "Ôÿæ " : "ÔÿÉ ";
            return `<p>${checked}${escapeHtml(block.content || "")}</p>`;
          }
          return `<p>${escapeHtml(block.content || "")}</p>`;
        })
        .join("");
    }
    return `<p>${escapeHtml(t("pg.noContent"))}</p>`;
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
      const target = pages.find(
        (page) => String(page.id) === String(targetId),
      );

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
        ? pages.find((p) => String(p.id) === String(targetPageId))
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

      updatePageData(
        targetPage.id,
        updateNotesWithBlock(targetPage.data || { blocks: [] }),
      );
      return {
        ok: true,
        message: `Blocco "${blockType || "testo"}" aggiunto alla pagina "${targetPage.label}".`,
      };
    }

    if (action.type === "update_page_content") {
      const { id, content } = action.payload;
      const targetPage = pages.find((p) => String(p.id) === String(id));
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
      updatePageData(id, updateContent(targetPage.data || { blocks: [] }));
      return { ok: true, message: `Contenuto aggiunto alla pagina.` };
    }

    if (action.type === "insert_page_text") {
      const { id, text } = action.payload;
      const targetPage = pages.find((p) => String(p.id) === String(id));
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
      updatePageData(id, insertText(targetPage.data || { blocks: [] }));
      return { ok: true, message: `Testo aggiunto alla pagina.` };
    }

    return { ok: false, message: `Azione "${action.type}" non supportata.` };
  };

  const shouldShowSidebar = isSidebarOpen;

  const breadcrumbs = React.useMemo(() => {
    if (searchParams.get("view") === "inbox") {
      return [{ id: "inbox", label: "Inbox" }];
    }
    if (searchParams.get("view") === "mytasks") {
      return [{ id: "mytasks", label: "I miei task" }];
    }
    const crumbs = [] as any[];
    let cur = activePage;
    while (cur) {
      crumbs.unshift(cur);
      if (!cur.parentId) break;
      cur = pages.find((p) => String(p.id) === String(cur.parentId));
    }
    return crumbs;
  }, [activePage, pages, searchParams]);

  const renderActiveView = () => {
    if (searchParams.get("view") === "inbox") {
      return <WorkspaceInbox />;
    }
    // If view query param is mytasks, show MyTasksView
    if (searchParams.get("view") === "mytasks") {
      return (
        <MyTasksView
          allPages={pages}
          onNavigateToPage={(pId) => router.push(`/dashboard?page=${pId}`)}
        />
      );
    }

    // If trash query param is present, show new TrashView
    if (searchParams.get("trash") === "1") {
      const emptyTrashPages = () => {
        setPages((prev) => {
          const cur = Array.isArray(prev) ? prev : [];
          return cur.filter((p) => !p.deleted);
        });
      };
      return (
        <TrashView
          pages={pages || []}
          onRestorePage={restorePage}
          onPermanentlyDeletePage={permanentlyDelete}
          onEmptyTrashPages={emptyTrashPages}
          onPurgeExpiredPages={purgeExpiredTrashPages}
        />
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
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{t("pg.subpages")}</div>
              <div className="flex flex-wrap gap-2">
                {childPages.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard?page=${c.id}`}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {(() => {
                        const IconComp =
                          resolvePageIcon(c) || LayoutDashboard;
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
            page={effectivePage}
            onIconChange={(icon, iconColor) =>
              updatePage(
                effectivePage.id,
                iconColor ? { icon, iconColor } : { icon },
              )
            }
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
            page={effectivePage}
            onIconChange={(icon, iconColor) =>
              updatePage(
                effectivePage.id,
                iconColor ? { icon, iconColor } : { icon },
              )
            }
          />,
        );
      }
    }

    const liveStats = (() => {
      let tasksCount = 0;
      let completedTasks = 0;
      try {
        const raw = localStorage.getItem("taskly_tasks_v1");
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const active = list.filter((x: any) => !x?.deleted);
            tasksCount = active.length;
            completedTasks = active.filter((x: any) => x?.status === "done").length;
          }
        }
      } catch {}
      const livePages = (pages || []).filter((p) => !p?.deleted);
      let searchUsed = false;
      let dashboardCustomized = false;
      try {
        const ob = localStorage.getItem("taskly_onboarding_state_v2");
        if (ob) {
          const parsed = JSON.parse(ob);
          searchUsed = !!parsed.searchUsed;
          dashboardCustomized = !!(parsed.stepsDone && parsed.stepsDone.customize);
        }
        if (!dashboardCustomized) dashboardCustomized = !!localStorage.getItem("taskly_dashboard_custom_widgets_v2");
      } catch {}
      return {
        pagesCount: livePages.length,
        tasksCount,
        completedTasks,
        hasNestedPage: livePages.some((p) => !!p?.parentId),
        searchUsed,
        dashboardCustomized,
      };
    })();
    const obUseCase = (() => {
      try {
        const raw = localStorage.getItem("taskly_onboarding_state_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.useCase === "work") return "Lavoro";
          if (parsed.useCase === "study") return "Studio";
          if (parsed.useCase === "personal") return "Personale";
        }
        const legacy = localStorage.getItem("taskly_user_usecase");
        if (legacy === "work") return "Lavoro";
        if (legacy === "study") return "Studio";
        if (legacy === "personal") return "Personale";
      } catch {}
      return "";
    })();
    if (searchParams.get("view") === "mytasks") {
      try {
        const raw = localStorage.getItem("taskly_onboarding_state_v2");
        const cur = raw ? JSON.parse(raw) : {};
        localStorage.setItem("taskly_onboarding_state_v2", JSON.stringify({ ...cur, myTasksVisited: true }));
        localStorage.setItem("taskly_mytasks_visited", "true");
      } catch {}
    }
    return (
      <>
        {saveError && (
          <div className="mb-4 max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-sm font-bold text-red-500">
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-400 hover:text-red-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {planNotice && (
          <div className="mb-4 max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-[#a67cff]/10 border border-[#a67cff]/25 text-sm font-bold text-[#a67cff]">
            <span>{planNotice}</span>
            <span className="flex items-center gap-2 shrink-0">
              <Link
                href="/#pricing"
                className="px-3 py-1.5 rounded-lg bg-[#7b39fc] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >{t("pg.upgradePlan")}</Link>
              <button
                onClick={() => setPlanNotice(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </span>
          </div>
        )}
        <OnboardingChecklist
          liveStats={liveStats}
          useCaseLabel={obUseCase}
          onOpenTemplates={() => {
            trackOnboardingEvent("template_opened");
            setIsTemplateGalleryOpen(true);
          }}
          onVisitMyTasks={() => {
            trackOnboardingEvent("mytasks_visited");
            router.push("/dashboard?view=mytasks");
          }}
          onCreatePage={() => setIsModalOpen(true)}
          onCreateTask={() => router.push("/dashboard?view=mytasks")}
          onUseSearch={() => {
            try {
              const el = document.querySelector('input[role="search"]') as HTMLElement | null;
              if (el) el.focus();
            } catch {}
            router.push("/dashboard");
          }}
          onCustomizeDashboard={() => {
            router.push("/dashboard");
            setTimeout(() => {
              const btn = document.getElementById("customize-analytics-btn");
              if (btn) {
                btn.click();
                btn.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }, 400);
          }}
        />
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

  // ── Tab aperte: derivazione + sincronizzazione ────────────────────────
// FLUSSO:
//  - `openTabs` è lo stato persistito (localStorage) delle schede.
//  - `tabs` è la vista effettiva: union di openTabs + pagina attiva quando
//    questa non è ancora stata registrata. In questo modo la scheda appare
//    immediatamente al click, senza aspettare i setState asincroni.
//
// CORREZIONI:
//  1. La tab si apre da [activePageId, activePage] invece che solo
//     [activePage]: con Link client-side la pagina può non essere pronta al
//     primo render, e prima il click non creava mai la scheda.
//  2. Il filtro delle tab rimosse ignora i render con pages vuota: prima,
//     su navigazione con dati non pronti, cancellava le tab persistite
//     (URL con ?page= esistente ma scheda sparita dall'header).
const tabEntryForPage = (page: any) =>
  page && page.id !== undefined && page.id !== null
    ? { id: page.id, type: page.type, label: page.label }
    : null;

const openTabForPage = React.useCallback(() => {
  if (!activePageId) return null;
  if (activePage) return tabEntryForPage(activePage);
  const fromTabs = openTabs.find(
    (tab) => String(tab.id) === String(activePageId),
  );
  if (fromTabs) return tabEntryForPage(fromTabs);
  const fromPages = (pages || []).find(
    (page) => String(page.id) === String(activePageId),
  );
  return tabEntryForPage(fromPages);
}, [activePageId, activePage, openTabs, pages]);

const tabs = React.useMemo(() => {
  const fallback = openTabForPage();
  if (fallback && !openTabs.some((tab) => String(tab.id) === String(fallback.id))) {
    return [...openTabs, fallback];
  }
  return openTabs;
}, [openTabs, openTabForPage]);

// Apre/aggiorna la scheda per una pagina. La Sidebar e le viste figlie la
// chiamano PRIMA di navigare, così la scheda esiste già al cambio URL.
const ensureTab = React.useCallback((page: any) => {
  const entry = tabEntryForPage(page);
  if (!entry) return;
  setOpenTabs((prev) => {
    const idx = prev.findIndex((tab) => String(tab.id) === String(entry.id));
    if (idx === -1) return [...prev, entry];
    // aggiorna label/tipo se la pagina è stata rinominata
    if (prev[idx]?.label === entry.label && prev[idx]?.type === entry.type) return prev;
    const next = [...prev];
    next[idx] = { ...prev[idx], ...entry };
    return next;
  });
}, []);

// Sincronizza lo stato persistito con la pagina attiva.
// Scatta ad ogni cambio di activePageId o activePage: con le navigazioni
// client-side (Link/push) la pagina può non essere pronta al primo render,
// quindi la chiave include entrambi.
  useEffect(() => {
    const entry = openTabForPage();
    if (!entry) return;
    ensureTab(entry);
  }, [activePageId, openTabForPage, ensureTab]);

  // Remove tabs whose page no longer exists. Oltre al gate su
  // hasLoadedUserData, ignora i render con pages vuota: su navigazione con
  // dati non pronti il filtro cancellerebbe le tab persistite.
  useEffect(() => {
    if (!hasLoadedUserData) return;
    const cur = Array.isArray(pages) ? pages : [];
    if (cur.length === 0) return;
    const knownIds = new Set(cur.map((page) => String(page.id)));
    setOpenTabs((prev) => {
      const next = prev.filter((tab) => knownIds.has(String(tab.id)));
      // Keep the previous reference when nothing changed to avoid a re-render loop.
      return next.length === prev.length ? prev : next;
    });
  }, [pages, hasLoadedUserData]);

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
        await Promise.all(
          cur.map(async (p) => {
            const id = String(p.id);
            const prev = snapshot[id];
            try {
              const r = prev
                ? await apiFetch(`/resources/pages/${id}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(p),
                  })
                : await apiFetch("/resources/pages", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(p),
                  });
              if (r.ok) {
                snapshot[id] = { deleted: Boolean(p.deleted) };
              } else {
                // Body non-JSON o status non-2xx: il create/update e' fallito.
                // Prima veniva ignorato e la pagina spariva al reload.
                setSaveError(
                  `Salvataggio pagina fallito (${r.status})${
                    prev ? "" : " durante la creazione"
                  }: ${p.label || "senza titolo"}`,
                );
                console.error(
                  `Persist page ${id} failed (${prev ? "PUT" : "POST"})`,
                  r.status,
                  await r.text().catch(() => ""),
                );
              }
            } catch (e) {
              setSaveError(
                `Salvataggio pagina fallito: ${p.label || "senza titolo"}`,
              );
              console.error(`Persist page ${id} threw`, e);
            }
          }),
        );
      } catch (error) {
        console.error("Error persisting pages:", error);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [pages, hasLoadedUserData]);

  // Closing a tab must also fix the URL when the closed tab is the active one,
  // otherwise we stay on a page whose tab no longer exists in the bar.
  const closeTab = (tabId) => {
    if (String(activePageId) === String(tabId)) {
      const idx = openTabs.findIndex((t) => String(t.id) === String(tabId));
      const remaining = openTabs.filter((t) => String(t.id) !== String(tabId));
      const fallback =
        remaining.length > 0
          ? remaining[Math.min(idx < 0 ? 0 : idx, remaining.length - 1)]
          : null;
      router.push(
        fallback ? `/dashboard?page=${fallback.id}` : "/dashboard",
      );
    }
    setOpenTabs((prev) =>
      prev.filter((t) => String(t.id) !== String(tabId)),
    );
  };

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


      <AnimatePresence mode="wait">
        {shouldShowSidebar && (
          <>
            {/* Mobile backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-35 md:hidden"
              onClick={() => {
                setIsSidebarOpen(false);
                setIsSidebarPeekOpen(false);
              }}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -256, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -256, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-40"
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
                onOpenPage={ensureTab}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
                loading={loading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        className={`transition-all duration-300 ${shouldShowSidebar ? "md:pl-64 pl-0" : "pl-0"}`}
      >
        <div className="sticky top-0 z-50 h-14 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl px-3 flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="shrink-0 p-2 text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t("misc.toggleSidebar")}
          >
            {isSidebarOpen ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
          </button>

          {/* Tabs — scrollable */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0 scrollbar-hide">
            <Link
              href="/dashboard"
              className={`inline-flex shrink-0 items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-bold border whitespace-nowrap transition-colors ${
                !activePageId
                  ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard size={14} className="shrink-0" />
              <span>Analitiche</span>
            </Link>
            {mounted && tabs.length > 0 ? (
              tabs.map((tab) => (
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
                    aria-label={`Chiudi la scheda ${tab.label || ""}`}
                    onClick={(e) => {
                      // Don't trigger the parent Link navigation.
                      e.preventDefault();
                      e.stopPropagation();
                      closeTab(tab.id);
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

          {/* ÔöÇÔöÇ Settings three-dot menu ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ */}
          {/* Notification bell */}
          <div className="shrink-0 mr-1">
            <NotificationBell />
          </div>

        </div>
        <div className={`p-3 md:p-6 ${activePage?.font && activePage.font !== "system-ui" ? activePage.font === "serif" ? "font-serif" : activePage.font === "monospace" ? "font-mono" : "font-serif" : ""}`}>
          {/*
            Header del dashboard (icona + breadcrumbs + titolo + menu azioni).
            NASCOSTO per la pagina vuota ("empty"): quella vista ora ha un
            header proprio (PageHeader: icona+titolo inline) e l'utente non
            vuole le cromature/impostazioni sopra al foglio.
          */}
          {activePageId &&
            activePage &&
            !loading &&
            (activePage.type || activeType || "tasks") !== "empty" && (
            <div className="mb-6 flex items-start gap-4 group relative">
              <div className="relative">
                <button
                  onClick={() => !activePage.locked && setIsIconMenuOpen(!isIconMenuOpen)}
                  className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center ${activePage.iconColor || "text-gray-400"} hover:text-cyan-500 hover:border-cyan-500/50 transition-all shadow-md shadow-cyan-500/5 group-hover:scale-105 ${activePage.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {(() => {
                    const rawIcon = activePage.icon;

                    // A persisted page can carry a non-component value (e.g. the
                    // `icons` map or a stale name): fall back to the default
                    // instead of handing React an invalid element type.
                    if (React.isValidElement(rawIcon)) return rawIcon;

                    const Comp = getCatalogIcon(rawIcon);
                    return React.createElement(Comp || LayoutDashboard, {
                      size: 24,
                    });
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">{t("pg.selectIcon")}</p>
                      <div className="mb-4 flex items-center gap-2">
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          placeholder={t("pg.searchIcons")}
                          className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            // remove icon
                            updatePage(activePage.id, { icon: "" });
                            setIsIconMenuOpen(false);
                          }}
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold"
                        >{t("pg.removeIcon")}</button>
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
                        {ICON_NAMES.filter((name) => {
                            const lower = name.toLowerCase();
                            const needle = iconSearch.trim().toLowerCase();
                            if (needle && !lower.includes(needle)) return false;
                            if (iconCategory === "All") return true;
                            const mapped =
                              FULL_ICON_CATEGORY_MAP[name] ||
                              FULL_ICON_CATEGORY_MAP[lower];
                            if (mapped) return mapped === iconCategory;
                            // fallback heuristics when no manual mapping
                            if (iconCategory === "Arrows")
                              return /arrow|chev|triangle|corner/.test(lower);
                            if (iconCategory === "Media")
                              return /video|play|pause|camera|mic|volume|music|film|picture|image/.test(
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
                              return /user|person|people/.test(lower);
                            if (iconCategory === "Interface")
                              return /menu|more|settings|search|plus|minus|x|check|close|open|panel|layout|moon|sun/.test(
                                lower,
                              );
                            if (iconCategory === "Logos")
                              return /github|gitlab|twitter|facebook|instagram|linkedin|youtube|npm|docker|mastodon/.test(
                                lower,
                              );
                            return true;
                          })
                          .sort()
                          .map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onMouseEnter={() => setHoverIcon(iconName)}
                              onMouseLeave={() => setHoverIcon(null)}
                              onClick={() => {
                                // Salva SEMPRE la chiave kebab normalizzata:
                                // prima veniva salvato il PascalCase ("FileText")
                                // che non combaciava con ICON_MAP → icona persa.
                                const key =
                                  normalizeIconKey(iconName) ?? iconName;
                                updatePage(activePage.id, { icon: key });
                                setIsIconMenuOpen(false);
                              }}
                              title={iconName}
                              className={`h-12 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs p-2 ${
                                normalizeIconKey(activePage.icon) ===
                                normalizeIconKey(iconName)
                                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
                                  : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {renderIcon(iconName, { size: 18 })}
                              <span className="text-[10px] truncate w-full">
                                {iconName}
                              </span>
                            </button>
                          ))}
                      </div>

                      {/* Hover preview */}
                      {hoverIcon && (
                        <div className="p-2 mb-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 border flex items-center justify-center">
                            {renderIcon(hoverIcon, {
                              size: 24,
                              className: `${pendingIconColor || activePage.iconColor || "text-gray-400"}`,
                            })}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Anteprima: {hoverIcon}
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">{t("pg.selectColor")}</p>
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
                <div className="flex items-start justify-between gap-3">
                <EditableTitle
                  title={activePage.label}
                  onSave={(nextTitle) =>
                    updatePage(activePage.id, { label: nextTitle })
                  }
                  className="text-xl md:text-2xl font-extrabold"
                  autoEdit={
                    focusTitleParam === "1" || focusTitleParam === "true"
                  }
                  locked={activePage.locked}
                  placeholder={"nuova pagina"}
                />
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsPageMenuOpen((v) => !v)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Azioni pagina"
                    aria-label="Azioni pagina"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {isPageMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsPageMenuOpen(false)} />
                      <div className="absolute right-0 top-9 z-50 w-60 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPageMenuOpen(false);
                            handleSaveAsTemplate(activePage);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <BookmarkPlus size={14} className="text-[#7b39fc] shrink-0" />
                          <span>Salva come template</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPageMenuOpen(false);
                            setIsTemplateGalleryOpen(true);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <LayoutTemplate size={14} className="text-gray-400 shrink-0" />
                          <span>Da template…</span>
                        </button>
                        <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsPageMenuOpen(false);
                            handleCopyPageLink(activePage.id);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          {pageLinkCopied ? (
                            <Check size={14} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Copy size={14} className="text-gray-400 shrink-0" />
                          )}
                          <span>{pageLinkCopied ? "Link copiato!" : "Copia link pagina"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsPageMenuOpen(false);
                            duplicatePage(activePage.id);
                          }}
                          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <Copy size={14} className="text-gray-400 shrink-0" />
                          <span>Duplica pagina</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                </div>
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
                    <p className="text-sm font-black">{t("pg.movePageUnder")}</p>
                  </div>
                  <div className="p-2 overflow-y-auto max-h-72">
                    <button
                      onClick={() => nestPage(activePage.id, null)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-gray-400">ÔÇö</span>{t("pg.noParentRoot")}</button>
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

          {/* Keying on the active page forces React to unmount/remount the view
              when switching between pages, so per-page local state (search
              text, filters, selection, scroll) never leaks across pages. */}
          <div
            key={activePageId || "dashboard-home"}
            className={activePage?.locked ? "pointer-events-none select-none" : ""}
          >
            {renderActiveView()}
          </div>
          {activePage?.locked && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider rounded-full border border-amber-200 dark:border-amber-700 shadow-lg">
              <Lock size={12} className="inline mr-1.5 -mt-0.5" />
              Pagina bloccata ÔÇö sola lettura
            </div>
          )}
        </div>
      </main>
      <AIPanel
        pages={pages}
        onAction={handleAIAction}
        isSidebarOpen={shouldShowSidebar}
      />

      {/* Onboarding Wizard dinamico */}
      <OnboardingModal
        userName={user?.name || ""}
        liveStats={{ pagesCount: (pages || []).filter((p) => !p?.deleted).length, tasksCount: liveOnboardingTasks, completedTasks: liveOnboardingDone }}
        onComplete={({ useCase, name, selectedTemplate, firstTaskTitle, skippedSteps }) => {
          // Seed primo task solo se l'utente non ne ha gia'
          if (firstTaskTitle && firstTaskTitle.trim() && !skippedSteps.includes("create_task")) {
            const { title: parsedTitle, deadline } = parseNaturalDate(firstTaskTitle.trim());
            const existingTasks = loadTasksFromStorage();
            const firstTask = {
              id: `task_onboarding_${Date.now()}`,
              title: parsedTitle || firstTaskTitle.trim(),
              status: "todo" as const,
              priority: "medium" as const,
              deadline: deadline || "",
              subtasks: [],
              tags: [],
              createdAt: new Date().toISOString(),
            };
            saveTasksToStorage([firstTask, ...existingTasks]);
            trackOnboardingEvent("task_created");
          }
          // Pagina da template solo se l'utente non ha gia' pagine
          if (selectedTemplate && !skippedSteps.includes("create_page")) {
            const newPageId = typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `page_${Date.now()}`;
            const newPage = {
              id: newPageId,
              label: selectedTemplate.title,
              type: selectedTemplate.type,
              icon: selectedTemplate.icon,
              iconColor: selectedTemplate.iconColor,
              parentId: null,
              order: 0,
              data: selectedTemplate.data,
              deleted: false,
              createdAt: new Date().toISOString(),
            };
            setPages((prev) => {
              const cur = Array.isArray(prev) ? prev : [];
              return [...cur, newPage];
            });
            trackOnboardingEvent("template_used");
            trackOnboardingEvent("page_created");
            router.push(`/dashboard?page=${newPageId}`);
          }
        }}
      />

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={(template) => {
          const newPageId = typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `page_${Date.now()}`;
          const newPage = {
            id: newPageId,
            label: template.title,
            type: template.type,
            icon: template.icon,
            iconColor: template.iconColor,
            parentId: null,
            order: Date.now(),
            data: template.data,
            deleted: false,
            createdAt: new Date().toISOString(),
          };
          setPages((prev) => {
            const cur = Array.isArray(prev) ? prev : [];
            return [...cur, newPage];
          });
          trackOnboardingEvent("template_used");
          trackOnboardingEvent("page_created");
          setIsTemplateGalleryOpen(false);
          router.push(`/dashboard?page=${newPageId}`);
        }}
      />

      {/* Toast template salvato */}
      {templateToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold shadow-2xl flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          <span>{templateToast}</span>
        </div>
      )}
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
