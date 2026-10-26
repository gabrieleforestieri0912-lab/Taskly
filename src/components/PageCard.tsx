"use client";

import Link from "next/link";
import React from "react";
import { FileText } from "lucide-react";
import { getCatalogIcon } from "../lib/lucideCatalog";
import { useLanguage } from "../lib/LanguageContext";

/** Link semplice (stile Notion) per una pagina dentro un'altra:
 *  icona + titolo, hover sottolineato, click per aprire la pagina. */
export default function PageCard({
  pageId,
  label,
  iconName,
  iconColor,
}: {
  pageId: string;
  label?: string;
  iconName?: string;
  iconColor?: string;
}) {
  const IconComp = getCatalogIcon(iconName) || FileText;
  const { t } = useLanguage();
  return (
    <Link
      href={`/dashboard?page=${pageId}`}
      className="group flex w-full items-center gap-2 rounded-md px-1.5 py-1 -mx-1.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
    >
      {React.createElement(IconComp, {
        size: 15,
        className: `shrink-0 ${iconColor || "text-gray-400"}`,
      })}
      <span className="min-w-0 truncate text-sm font-medium text-cyan-700 group-hover:underline group-hover:underline-offset-4 dark:text-cyan-300">
        {label || t("views.mtUntitled", "(senza titolo)")}
      </span>
    </Link>
  );
}
