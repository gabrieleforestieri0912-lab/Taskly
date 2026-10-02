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
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { resolvePageIcon } from "../../lib/pageIcons";
import { isEmojiIcon } from "../../lib/pageTree";

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
  onDuplicatePage?: (page: any) => void;
  onStartRename?: (page: any) => void;
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
  onDuplicatePage,
  onStartRename,
}: PageTreeItemProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
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

  // Close context menu on outside click or escape
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
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

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
        router.push(`/dashboard?page=${page.id}`);
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
      {/* Drop indicator before this page */}
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
          onUpdatePage &&
            onUpdatePage(draggedId, {
              parentId: page.parentId || null,
              order: indexInParent,
            });
        }}
        className="h-0.5 transition-all duration-200"
        style={{ marginLeft: `${8 + depth * 14}px` }}
      />

      {/* Main row */}
      <div
        className={`group flex items-center rounded-lg transition-all text-sm font-medium relative h-7 select-none ${
          isActive
            ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-bold"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100"
        }`}
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
              e.currentTarget.classList.add("bg-cyan-50", "dark:bg-cyan-900/10");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-cyan-50", "dark:bg-cyan-900/10");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-cyan-50", "dark:bg-cyan-900/10");
              const draggedId = e.dataTransfer.getData("text/plain");
              if (!draggedId || String(draggedId) === String(page.id)) return;
              const targetChildren = childrenMap.get(page.id) || [];
              onUpdatePage &&
                onUpdatePage(draggedId, {
                  parentId: page.id,
                  order: targetChildren.length,
                });
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

        {/* Hover action buttons (⋯ and +) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pr-1.5 shrink-0">
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
            className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
          >
            <Plus size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

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
              <span>Elimina</span>
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
                    onDuplicatePage={onDuplicatePage}
                    onStartRename={onStartRename}
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
