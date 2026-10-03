"use client";

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface QuickItem {
  id: string;
  icon: LucideIcon;
  /** Label shown under the icon; kept short so it never wraps */
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
}

/**
 * SidebarQuickBar — le voci sotto la ricerca, disposte **orizzontalmente**.
 *
 * Prima erano `SidebarNavItem` in colonna (Search / Dashboard / I miei task /
 * AI / Riunioni / Calendario) e occupavano sei righe verticali. Qui diventano
 * una barra di icone: la navigazione principale si legge d'un colpo d'occhio
 * e la sidebar resta compatta.
 *
 * Le voci sono decorativamente identiche a quelle verticali: stesse azioni,
 * stesso `isActive`, stesso badge. La label resta visibile sotto l'icona,
 * quindi nessuna informazione viene persa (niente icone "misteriose").
 */
export function SidebarQuickBar({ items }: { items: QuickItem[] }) {
  return (
    <div
      className="mt-2 grid grid-cols-3 gap-1"
      role="list"
      aria-label="Azioni rapide"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = !!item.isActive;
        const showBadge = item.badge !== undefined && item.badge > 0;

        const shell = [
          "relative flex flex-col items-center justify-center gap-1",
          "rounded-xl px-1 py-2 transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
          active
            ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100",
        ].join(" ");

        const inner = (
          <>
            <span className="relative">
              <Icon size={17} aria-hidden="true" className="shrink-0" />
              {showBadge && (
                <span
                  className="absolute -right-2.5 -top-1.5 min-w-[15px] px-1 text-center text-[9px] font-black leading-[15px] tabular-nums rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400"
                  aria-label={`${item.badge} elementi`}
                >
                  {item.badge! > 99 ? "99+" : item.badge}
                </span>
              )}
            </span>
            <span className="w-full truncate text-center text-[10px] font-semibold leading-tight">
              {item.label}
            </span>
          </>
        );

        return item.href ? (
          <Link
            key={item.id}
            id={item.id}
            href={item.href}
            onClick={item.onClick}
            className={shell}
            aria-current={active ? "page" : undefined}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={item.id}
            id={item.id}
            type="button"
            onClick={item.onClick}
            className={shell}
            aria-pressed={active}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}