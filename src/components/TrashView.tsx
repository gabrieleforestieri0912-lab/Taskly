"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trash2,
  RotateCw,
  Search,
  AlertTriangle,
  FileText,
  CheckSquare,
  Clock,
  X,
  AlertCircle,
  Folder,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, loadTasksFromStorage, saveTasksToStorage } from "../lib/taskModel";
import {
  TrashItemType,
  buildTrashItems,
  purgeExpiredTasks,
  restoreTaskValue,
} from "../lib/trashUtils";

interface TrashViewProps {
  pages: any[];
  onRestorePage: (pageId: string) => void;
  onPermanentlyDeletePage: (pageId: string) => void;
  onEmptyTrashPages: () => void;
  onPurgeExpiredPages?: () => void;
}

export default function TrashView({
  pages,
  onRestorePage,
  onPermanentlyDeletePage,
  onEmptyTrashPages,
  onPurgeExpiredPages,
}: TrashViewProps) {
  // Filter & Search & Sort states
  const [filterType, setFilterType] = useState<"all" | TrashItemType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  // Tasks in trash (single source of truth via storage + event sync)
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());

  useEffect(() => {
    const sync = () => {
      try {
        setTasks(loadTasksFromStorage());
      } catch {}
    };
    sync();
    // Auto-pulizia task oltre 30 giorni ad ogni apertura del cestino
    try {
      const current = loadTasksFromStorage();
      const { kept, purgedIds } = purgeExpiredTasks(current);
      if (purgedIds.length > 0) {
        saveTasksToStorage(kept);
        setTasks(kept);
      }
    } catch {}
    try {
      onPurgeExpiredPages && onPurgeExpiredPages();
    } catch {}
    window.addEventListener("taskly-tasks-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("taskly-tasks-updated", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirm dialogs
  const [confirmDeleteId, setConfirmDeleteId] = useState<{
    id: string;
    type: TrashItemType;
    title: string;
  } | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [emptyConfirmText, setEmptyConfirmText] = useState("");

  const allDeletedItems = useMemo(() => {
    const items = buildTrashItems(pages || [], tasks);
    items.sort((a, b) => {
      const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
      const db = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
      return sortDir === "desc" ? db - da : da - db;
    });
    return items.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q);
      }
      return true;
    });
  }, [pages, tasks, filterType, searchQuery, sortDir]);

  const counts = useMemo(() => {
    const items = buildTrashItems(pages || [], tasks);
    return {
      total: items.length,
      page: items.filter((i) => i.type === "page").length,
      task: items.filter((i) => i.type === "task").length,
      project: items.filter((i) => i.type === "project").length,
    };
  }, [pages, tasks]);

  // Restore task
  const handleRestoreTask = (taskId: string) => {
    const nextTasks = tasks.map((t) =>
      t.id === taskId ? restoreTaskValue(t) : t,
    );
    setTasks(nextTasks);
    saveTasksToStorage(nextTasks);
  };

  // Permanently delete task
  const handlePermanentDeleteTask = (taskId: string) => {
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(nextTasks);
    saveTasksToStorage(nextTasks);
    setConfirmDeleteId(null);
  };

  // Empty all trash (pages and tasks)
  const handleEmptyAllTrash = () => {
    if (emptyConfirmText.trim().toUpperCase() !== "SVUOTA") return;
    onEmptyTrashPages();
    const nextTasks = tasks.filter((t) => !t.deleted);
    setTasks(nextTasks);
    saveTasksToStorage(nextTasks);
    setShowEmptyConfirm(false);
    setEmptyConfirmText("");
  };

  // Helper for relative date
  const formatRelativeTime = (iso?: string) => {
    if (!iso) return "Data non disponibile";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;

    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Pochi istanti fa";
    if (diffMins < 60) return `${diffMins} minuti fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays === 1) return "Ieri";
    if (diffDays < 30) return `${diffDays} giorni fa`;
    return d.toLocaleDateString("it-IT");
  };

  const totalDeletedCount = counts.total;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                Cestino
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Gli elementi nel cestino verranno eliminati automaticamente dopo 30 giorni.
              </p>
            </div>
          </div>
        </div>

        {totalDeletedCount > 0 && (
          <button
            onClick={() => setShowEmptyConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all self-start sm:self-auto"
          >
            <Trash2 size={14} />
            <span>Svuota cestino ({totalDeletedCount})</span>
          </button>
        )}
      </div>

      {/* ── Toolbar: Filters & Search ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 mb-6">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/60 p-1 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs w-full sm:w-auto">
          {(
            [
              { id: "all", label: `Tutti (${counts.total})` },
              { id: "page", label: `Pagine (${counts.page})` },
              { id: "task", label: `Task (${counts.task})` },
              { id: "project", label: `Progetti (${counts.project})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === tab.id
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cerca nel cestino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          title={sortDir === "desc" ? "Più recenti prima" : "Meno recenti prima"}
          className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all"
        >
          {sortDir === "desc" ? "↓ Recenti" : "↑ Meno recenti"}
        </button>
        </div>
      </div>

      {/* ── List of Deleted Items ─────────────────────────────────────────── */}
      {allDeletedItems.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Trash2 size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
            Il cestino è vuoto
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Gli elementi che elimini dalle pagine o dai task appariranno qui prima di essere rimossi definitivamente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {allDeletedItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-xs transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === "page"
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                      : item.type === "project"
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                        : "bg-purple-50 dark:bg-purple-900/20 text-purple-500"
                  }`}
                >
                  {item.type === "page" ? (
                    <FileText size={18} />
                  ) : item.type === "project" ? (
                    <Folder size={18} />
                  ) : (
                    <CheckSquare size={18} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">
                      {item.type === "page" ? "Pagina" : item.type === "project" ? "Progetto" : "Task"}
                    </span>
                    {item.hasParent && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-gray-400">
                        <Folder size={10} /> Sottopagina
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    <span>Eliminato {formatRelativeTime(item.deletedAt)}</span>
                    {typeof item.daysLeft === "number" && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 font-bold">
                        {item.daysLeft}g rimasti
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (item.type === "task") handleRestoreTask(item.id);
                    else onRestorePage(item.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  title="Ripristina elemento"
                >
                  <RotateCw size={13} />
                  <span className="hidden sm:inline">Ripristina</span>
                </button>
                <button
                  onClick={() =>
                    setConfirmDeleteId({
                      id: item.id,
                      type: item.type,
                      title: item.title,
                    })
                  }
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Elimina definitivamente"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Single Item Permanent Delete Modal ────────────────────────────── */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Eliminare definitivamente?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Stai per eliminare definitivamente «{confirmDeleteId.title}». Questa azione non potrà essere annullata.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    if (confirmDeleteId.type === "task") {
                      handlePermanentDeleteTask(confirmDeleteId.id);
                    } else {
                      onPermanentlyDeletePage(confirmDeleteId.id);
                      setConfirmDeleteId(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  Elimina definitivamente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Empty All Trash Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showEmptyConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmptyConfirm(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-2xl z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Svuotare tutto il cestino?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Tutti i {totalDeletedCount} elementi (pagine, progetti e task) nel cestino verranno rimossi permanentemente. Questa operazione è irreversibile.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  Per confermare digita <span className="font-black text-gray-800 dark:text-gray-100">SVUOTA</span> nel campo qui sotto.
                </p>
                <input
                  type="text"
                  value={emptyConfirmText}
                  onChange={(e) => setEmptyConfirmText(e.target.value)}
                  placeholder="SVUOTA"
                  className="mt-2 w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowEmptyConfirm(false);
                    setEmptyConfirmText("");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Annulla
                </button>
                <button
                  onClick={handleEmptyAllTrash}
                  disabled={emptyConfirmText.trim().toUpperCase() !== "SVUOTA"}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Svuota cestino
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
