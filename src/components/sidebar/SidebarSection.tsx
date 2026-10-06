"use client";

import React from "react";
import { Plus } from "lucide-react";

interface SidebarSectionProps {
  /** Short uppercase label shown above the section */
  label: string;
  /** Called when the user clicks the "+" button that appears on hover */
  onAdd?: () => void;
  /** Accessible label for the "+" button */
  addLabel?: string;
  /** Optional id forwarded as data-tour-id to the "+" button for product tours */
  addTourId?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * SidebarSection — a labelled group of sidebar items (Notion-style).
 *
 * The "+" button is visible only on hover and is rendered with full
 * keyboard accessibility. The label itself is purely presentational.
 */
export function SidebarSection({
  label,
  onAdd,
  addLabel = "Crea nuova pagina",
  addTourId,
  children,
  className = "",
}: SidebarSectionProps) {
  return (
    <div className={`mt-3 ${className}`}>
      {/* Section header row */}
      <div className="group/section flex items-center px-3 h-6 mb-0.5">
        <span
          className="flex-1 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 select-none"
          aria-hidden="true"
        >
          {label}
        </span>

        {onAdd && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            aria-label={addLabel}
            title={addLabel}
            data-tour-id={addTourId}
            className="opacity-0 group-hover/section:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 p-0.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200/70 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Section content */}
      {children}
    </div>
  );
}
