"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Edit2,
  FileText,
  Star,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { resolvePageIcon } from "../../lib/pageIcons";
import { isEmojiIcon } from "../../lib/pageTree";
import { formatRelativeTime } from "../../lib/formatRelative";
import { useLanguage } from "../../lib/LanguageContext";

export interface PageTreeItemProps {
  page: any;
  depth?: number;
  indexInParent?: number;
  childrenMap: Map<string | null, any[]>;
  activePageId: string | null;
  expandedPages: Record<string, boolean>;
  onToggleExpand: (id: string, e?: React.MouseEvent) => void;
  onAddSubpage: (parentId: string, e?: React.MouseEvent) => void;
  onDeletePage: (id: string, e?: React.MouseEvent) => void;
  onUpdatePage?: (id: string, updates: any) => void;
  /** Spostamento Notion-style (annida/riordina con rinumerazione). */
  onMovePage?: (draggedId: string, targetParentId: string | null, targetIndex: number) => void;
  onDuplicatePage?: (page: any) => void;
  onStartRename?: (page: any) => void;
  onOpenPage?: (page: any) => void;
  /** Hide the "last modified" hint (used by the Preferiti list). */
  showUpdatedAt?: boolean;
  /** Se false la riga non è trascinabile né zona di drop (es. Preferiti). */
  draggable?: boolean;
}

export function PageTreeItem({
  page,
  depth = 0,
  indexInParent = 0,
  childrenMap,
  activePageId,
  expandedPages,
  onToggleExpand,
  onAddSubpage,
  onDeletePage,
  onUpdatePage,
  onMovePage,
  onDuplicatePage,
  onStartRename,
  onOpenPage,
  showUpdatedAt = true,
  draggable = true,
}: PageTreeItemProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { t, language } = useLanguage();

  // Notifica l'apertura PRIMA di navigare, così la scheda esiste già.
  const goToPage = () => {
    try {
      onOpenPage && onOpenPage(page);
    } catch {}
    router.push(`/dashboard?page=${page.id}`);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const itemRef = useRef<HTMLLIElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(page.label || "");

  // Sync internal editLabel if external page.label changes while not editing
  useEffect(() => {
    if (!isEditing) {
      setEditLabel(page.label || "");
    }
  }, [page.label, isEditing]);

  // Autofocus input on entering editing mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleCommitRename = () => {
    setIsEditing(false);
    const trimmed = editLabel.trim();
    const nextLabel = trimmed || "Senza titolo";
    if (nextLabel !== page.label) {
      onUpdatePage && onUpdatePage(page.id, { label: nextLabel });
    }
  };

  const children = childrenMap.get(page.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedPages[page.id] === true;
  const isActive = String(activePageId) === String(page.id);
  const iconColor = page.iconColor || "text-gray-400";
  const isEmoji = isEmojiIcon(page.icon);
  const Icon = !isEmoji ? resolvePageIcon(page) : null;

  // ── Drag & drop stile Notion ─────────────────────────────────────────
  // Una sola zona per riga: in base alla posizione verticale del cursore
  //   - terzo superiore → linea sopra (riordina prima di questa pagina)
  //   - centro         → evidenzia la riga (annida dentro questa pagina)
  //   - terzo inferiore → linea sotto (riordina dopo questa pagina)
  // Come su Notion: sopra = dentro, ai bordi = tra fratelli.
  const [dropPos, setDropPos] = useState<"before" | "inside" | "after" | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const readDraggedId = (e: React.DragEvent) => {
    try {
      return (
        e.dataTransfer.getData("application/x-taskly-page") ||
        e.dataTransfer.getData("text/plain") ||
        ""
      );
    } catch {
      return "";
    }
  };

  // Auto-espansione stile Notion: tenendo una pagina sulla zona centrale di
  // un genitore chiuso, si apre da sola così si vede dove finisce la trascinata.
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (expandTimer.current) clearTimeout(expandTimer.current);
    },
    [],
  );
  const clearExpandTimer = () => {
    if (expandTimer.current) {
      clearTimeout(expandTimer.current);
      expandTimer.current = null;
    }
  };
  const scheduleExpand = () => {
    if (isExpanded || !hasChildren || expandTimer.current) return;
    expandTimer.current = setTimeout(() => {
      expandTimer.current = null;
      onToggleExpand(page.id);
    }, 600);
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    if (!draggable || (!onMovePage && !onUpdatePage)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pos: "before" | "inside" | "after" =
      y < rect.height * 0.25 ? "before" : y > rect.height * 0.75 ? "after" : "inside";
    setDropPos((prev) => (prev === pos ? prev : pos));
    if (pos === "inside") scheduleExpand();
    else clearExpandTimer();
  };
  const handleRowDragLeave = (e: React.DragEvent) => {
    // Ignora i passaggi tra figli della stessa riga (evita sfarfallii).
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropPos(null);
    clearExpandTimer();
  };
  const handleRowDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dropPos;
    setDropPos(null);
    clearExpandTimer();
    if (!draggable) return;
    const draggedId = readDraggedId(e);
    if (!draggedId || String(draggedId) === String(page.id)) return;
    if (onMovePage) {
      if (pos === "before") {
        // Linea sopra → riordina prima di questa pagina.
        onMovePage(String(draggedId), page.parentId || null, indexInParent);
      } else if (pos === "after") {
        // Linea sotto → riordina dopo questa pagina.
        onMovePage(String(draggedId), page.parentId || null, indexInParent + 1);
      } else {
        // Centro riga → dentro (in coda ai figli), come Notion.
        onMovePage(String(draggedId), page.id, children.length);
      }
      return;
    }
    const targetChildren = childrenMap.get(page.id) || [];
    onUpdatePage &&
      onUpdatePage(draggedId, {
        parentId: page.id,
        order: targetChildren.length,
      });
  };

  // Close context menu on outside click or escape.
  // NOTA: il menu è un portal su document.body (fuori dal bottone ⋯), quindi
  // la chiusura deve avvenire su "click" e non su "mousedown": il mousedown
  // scatta prima del click e smonterebbe il menu prima che l'onClick della
  // voce (Rinomina, Duplica, Cestino...) venga eseguito.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const isFavorite = Boolean(page.isFavorite);
  const updatedLabel = formatRelativeTime(
    page.updatedAt || page.createdAt,
    language,
    "",
  );

  // Called from the context-menu item.
  const toggleFavorite = () => {
    onUpdatePage && onUpdatePage(page.id, { isFavorite: !isFavorite });
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const left = Math.min(rect.right + 4, window.innerWidth - 180);
    const top = Math.min(rect.top, window.innerHeight - 200);
    setMenuPos({ top, left });
    setIsMenuOpen(true);
  };

  // Keyboard navigation for WAI-ARIA Treeview
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (!isExpanded && hasChildren) {
        onToggleExpand(page.id);
      } else if (hasChildren) {
        const firstChild = children[0];
        if (firstChild) {
          const el = document.getElementById(`page-treeitem-${firstChild.id}`);
          el?.focus();
        }
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isExpanded) {
        onToggleExpand(page.id);
      } else if (page.parentId) {
        const parentEl = document.getElementById(`page-treeitem-${page.parentId}`);
        parentEl?.focus();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const allTreeItems = Array.from(
        document.querySelectorAll('[role="treeitem"]'),
      ) as HTMLElement[];
      const currentIndex = allTreeItems.indexOf(itemRef.current!);
      if (currentIndex >= 0 && currentIndex < allTreeItems.length - 1) {
        allTreeItems[currentIndex + 1].focus();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const allTreeItems = Array.from(
        document.querySelectorAll('[role="treeitem"]'),
      ) as HTMLElement[];
      const currentIndex = allTreeItems.indexOf(itemRef.current!);
      if (currentIndex > 0) {
        allTreeItems[currentIndex - 1].focus();
      }
    } else if (e.key === "F2") {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === "Enter" || e.key === " ") {
      if ((e.target as HTMLElement).tagName !== "BUTTON" && !isEditing) {
        e.preventDefault();
        goToPage();
      }
    }
  };

  return (
    <li
      ref={itemRef}
      id={`page-treeitem-${page.id}`}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onKeyDown={handleKeyDown}
      className="outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 rounded-lg list-none"
    >
      {/* Linea sopra: riordina prima di questa pagina */}
      {draggable && dropPos === "before" && (
        <div
          className="h-0.5 rounded-full bg-cyan-500"
          style={{ marginLeft: `${8 + depth * 14}px` }}
        />
      )}

      {/* Main row (centro = dentro questa pagina, bordi = tra fratelli) */}
      <div
        onDragOver={handleRowDragOver}
        onDragLeave={handleRowDragLeave}
        onDrop={handleRowDrop}
        className={`group flex items-center rounded-lg transition-all text-sm font-medium relative h-7 select-none ${
          isActive
            ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold"
            : dropPos === "inside"
              ? "bg-cyan-50 dark:bg-cyan-900/10 ring-1 ring-inset ring-cyan-400 text-gray-900 dark:text-gray-100"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100"
        } ${isDragging ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${6 + depth * 14}px` }}
      >
        {/* Notion-style Chevron toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand(page.id, e);
          }}
          aria-label={
            hasChildren
              ? isExpanded
                ? `Comprimi ${page.label || "pagina"}`
                : `Espandi ${page.label || "pagina"}`
              : `Nessuna sottopagina in ${page.label || "pagina"}`
          }
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-gray-200/60 dark:hover:bg-white/10 transition-colors mr-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 ${
            hasChildren
              ? "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight
            size={12}
            className={`transition-transform duration-150 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </button>

        {/* Page link or inline rename input */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2 py-0.5 pr-1 min-w-0 h-full overflow-hidden">
            {isEmoji ? (
              <span className="text-sm shrink-0 leading-none select-none">
                {page.icon}
              </span>
            ) : Icon ? (
              <Icon
                size={15}
                aria-hidden="true"
                className={`${iconColor} shrink-0 transition-colors`}
              />
            ) : (
              <FileText
                size={15}
                aria-hidden="true"
                className="text-gray-400 shrink-0"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCommitRename();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setIsEditing(false);
                  setEditLabel(page.label || "");
                }
              }}
              onBlur={handleCommitRename}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-white dark:bg-zinc-900 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-gray-900 dark:text-gray-100 outline-none ring-1 ring-cyan-500 shadow-sm"
            />
          </div>
        ) : (
          <Link
            href={`/dashboard?page=${page.id}`}
            draggable={draggable}
            onClick={() => {
              try {
                onOpenPage && onOpenPage(page);
              } catch {}
            }}
            onDragStart={(e) => {
              if (!draggable) {
                e.preventDefault();
                return;
              }
              try {
                e.dataTransfer.setData("application/x-taskly-page", String(page.id));
              } catch {}
              e.dataTransfer.setData("text/plain", String(page.id));
              e.dataTransfer.effectAllowed = "move";
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              setDropPos(null);
            }}
            className="flex-1 flex items-center gap-2 py-1 pr-1 min-w-0 h-full overflow-hidden"
          >
            {/* Icon or emoji */}
            {isEmoji ? (
              <span className="text-sm shrink-0 leading-none select-none">
                {page.icon}
              </span>
            ) : Icon ? (
              <Icon
                size={15}
                aria-hidden="true"
                className={`${iconColor} shrink-0 transition-colors`}
              />
            ) : (
              <FileText
                size={15}
                aria-hidden="true"
                className="text-gray-400 shrink-0"
              />
            )}

            {/* Label */}
            <span className="truncate text-xs">
              {page.label?.trim() ? page.label : (
                <span className="text-gray-400 font-normal">Senza titolo</span>
              )}
            </span>
          </Link>
        )}

        {/* Last modification — replaced by the hover actions on hover so the
            two never compete for the same horizontal space. */}
        {showUpdatedAt && updatedLabel && !isEditing && (
          <span className="shrink-0 pr-1.5 text-[9px] font-medium tabular-nums text-gray-400 dark:text-gray-500 opacity-0 transition-opacity group-hover:opacity-0 lg:group-hover:opacity-100">
            {updatedLabel}
          </span>
        )}

        {/* Azioni riga: solo ⋯ (sempre visibile, apre tutte le azioni) e
            + rapido (hover). Il preferito ★ vive solo dentro il menu ⋯. */}
        <div className="flex items-center gap-0.5 pr-1.5 shrink-0">
          {/* Context menu "⋯" */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMenu}
            aria-label={`Opzioni per ${page.label || "pagina"}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          >
            <MoreHorizontal size={13} aria-hidden="true" />
          </button>

          {/* Quick add subpage "+" */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddSubpage(page.id, e);
            }}
            aria-label={`Aggiungi sottopagina a ${page.label || "questa pagina"}`}
            title="Aggiungi sottopagina"
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-within:opacity-100"
          >
            <Plus size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Linea sotto: riordina dopo questa pagina (e dopo il suo sottoalbero) */}
      {draggable && dropPos === "after" && (
        <div
          className="h-0.5 rounded-full bg-cyan-500"
          style={{ marginLeft: `${8 + depth * 14}px` }}
        />
      )}

      {/* ── Context Menu Portal ────────────────────────────────────────── */}
      {isMenuOpen &&
        menuPos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="menu"
            aria-label={`Menu opzioni ${page.label || ""}`}
            style={{
              top: menuPos.top,
              left: menuPos.left,
              position: "fixed",
              zIndex: 999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 p-1 text-xs text-gray-700 dark:text-gray-300 animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                setIsEditing(true);
                onStartRename && onStartRename(page);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors text-left"
            >
              <Edit2 size={13} className="text-gray-400" />
              <span>Rinomina</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                toggleFavorite();
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors text-left"
            >
              <Star
                size={13}
                className={isFavorite ? "text-amber-400" : "text-gray-400"}
                fill={isFavorite ? "currentColor" : "none"}
              />
              <span>
                {t(
                  isFavorite ? "favRemove" : "favAdd",
                  isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti",
                )}
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                setIsMenuOpen(false);
                onAddSubpage(page.id, e);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors text-left"
            >
              <Plus size={13} className="text-gray-400" />
              <span>Aggiungi sottopagina</span>
            </button>

            {onDuplicatePage && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDuplicatePage(page);
                }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors text-left"
              >
                <Copy size={13} className="text-gray-400" />
                <span>Duplica</span>
              </button>
            )}

            <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />

            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                setIsMenuOpen(false);
                onDeletePage(page.id, e);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium"
            >
              <Trash2 size={13} />
              <span>Sposta nel cestino</span>
            </button>
          </div>,
          document.body,
        )}

      {/* ── Children subtree (Framer Motion: opacity & transform only) ─── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`children-${page.id}`}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {hasChildren ? (
              <ul role="group" className="space-y-0.5 mt-0.5">
                {children.map((child: any, idx: number) => (
                  <PageTreeItem
                    key={child.id}
                    page={child}
                    depth={depth + 1}
                    indexInParent={idx}
                    childrenMap={childrenMap}
                    activePageId={activePageId}
                    expandedPages={expandedPages}
                    onToggleExpand={onToggleExpand}
                    onAddSubpage={onAddSubpage}
                    onDeletePage={onDeletePage}
                    onUpdatePage={onUpdatePage}
                    onMovePage={onMovePage}
                    onDuplicatePage={onDuplicatePage}
                    onStartRename={onStartRename}
                    onOpenPage={onOpenPage}
                    draggable={draggable}
                  />
                ))}
              </ul>
            ) : (
              /* Notion-style "Nessuna pagina all'interno" */
              <div
                className="text-[11px] text-gray-400 dark:text-gray-500 py-1 select-none pointer-events-none"
                style={{ paddingLeft: `${8 + (depth + 1) * 14 + 18}px` }}
              >
                Nessuna pagina all&apos;interno
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
