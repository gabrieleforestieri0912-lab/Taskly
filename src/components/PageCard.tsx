"use client";

import Link from "next/link";
import React from "react";
import { FileText } from "lucide-react";
import { getCatalogIcon } from "../lib/lucideCatalog";

/** Estrae una riga di anteprima dal contenuto di una pagina. */
export function getPagePreviewText(page: any, maxLen = 140): string {
  try {
    if (!page) return "";
    const d = page.data ?? (page as any).initialData;
    const parts: string[] = [];
    if (Array.isArray(d)) {
      for (const it of d.slice(0, 5)) {
        const t = it?.title ?? it?.text ?? "";
        if (t) parts.push(String(t));
      }
    } else if (d && typeof d === "object" && Array.isArray((d as any).blocks)) {
      for (const b of (d as any).blocks) {
        if (!b) continue;
        if (typeof b.content === "string" && b.content.trim()) parts.push(b.content.trim());
        else if (b.type === "tasks-embed" && Array.isArray(b.items)) {
          for (const it of b.items.slice(0, 4)) {
            if (it?.title) parts.push(String(it.title));
          }
        } else if (b.type === "goals-embed" && Array.isArray(b.goals)) {
          for (const g of b.goals.slice(0, 4)) {
            if (g?.title) parts.push(String(g.title));
          }
        }
        if (parts.join(" · ").length >= maxLen) break;
      }
    } else if (d && typeof d === "object" && typeof (d as any).text === "string") {
      parts.push((d as any).text.trim());
    } else if (typeof d === "string" && d.trim()) {
      parts.push(d.trim());
    }
    const joined = parts.filter(Boolean).join(" · ").replace(/\s+/g, " ").trim();
    return joined.length > maxLen ? joined.slice(0, maxLen) + "…" : joined;
  } catch {
    return "";
  }
}

/** Card stile Notion per una pagina dentro un'altra: icona + titolo +
 *  anteprima del contenuto, click per aprire la pagina. */
export default function PageCard({
  pageId,
  label,
  iconName,
  iconColor,
  preview,
}: {
  pageId: string;
  label?: string;
  iconName?: string;
  iconColor?: string;
  preview?: string;
}) {
  const IconComp = getCatalogIcon(iconName) || FileText;
  return (
    <Link
      href={`/dashboard?page=${pageId}`}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        {React.createElement(IconComp, { size: 16, className: iconColor || "text-gray-400" })}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
          {label || "(senza titolo)"}
        </span>
        {preview ? (
          <span className="block truncate text-xs text-gray-400">
            {preview}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
