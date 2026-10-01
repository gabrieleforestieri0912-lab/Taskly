"use client";

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Visible label */
  label: string;
  /** If provided, renders as a Next.js <Link> */
  href?: string;
  /** If provided (and no href), renders as a <button> */
  onClick?: () => void;
  /** Highlights the item with the brand accent colour */
  isActive?: boolean;
  /** Optional numeric badge (hidden when 0 or undefined) */
  badge?: number;
  className?: string;
  /** Stable ID for browser testing / accessibility */
  id?: string;
}

/**
 * SidebarNavItem — a single navigation row in the sidebar.
 *
 * Renders as a <Link> when `href` is provided, otherwise as a <button>.
 * Meets WCAG 2.1 AA: visible focus ring, descriptive text, keyboard operable.
 */
export function SidebarNavItem({
  icon: Icon,
  label,
  href,
  onClick,
  isActive = false,
  badge,
  className = "",
  id,
}: SidebarNavItemProps) {
  const baseClass = [
    "group flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg",
    "text-sm font-medium transition-all duration-150 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
    isActive
      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <Icon
        size={16}
        aria-hidden="true"
        className="shrink-0 transition-colors"
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className="ml-auto text-[10px] font-black tabular-nums bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full"
          aria-label={`${badge} elementi`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link id={id} href={href} className={baseClass} aria-current={isActive ? "page" : undefined}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className={baseClass}
      aria-pressed={isActive}
    >
      {inner}
    </button>
  );
}
