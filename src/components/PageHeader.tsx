"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { EditableTitle } from "./UIComponents";
import {
  ICON_OPTIONS,
  normalizeIconKey,
  resolvePageIcon,
} from "../lib/pageIcons";
import { isEmojiIcon } from "../lib/pageTree";

/* Emoji di scelta rapida (escape unicode: nessun problema di encoding) */
const EMOJI_CHOICES = [
  "\uD83D\uDCC4", // 📄
  "\uD83D\uDCDD", // 📝
  "\u2705", // ✅
  "\uD83C\uDFAF", // 🎯
  "\uD83D\uDCC5", // 📅
  "\uD83D\uDCA1", // 💡
  "\uD83D\uDCDA", // 📚
  "\uD83D\uDE80", // 🚀
  "\u2B50", // ⭐
  "\uD83D\uDD25", // 🔥
  "\uD83D\uDCBC", // 💼
  "\uD83D\uDCCC", // 📌
];

/** Quante icone renderizzare per volta (il catalogo completo ha ~1500 voci). */
const PAGE_SIZE = 120;

export interface PageHeaderProps {
  page: any;
  title: string;
  onRename: (nextTitle: string) => void;
  onIconChange: (icon: string, iconColor?: string) => void;
  locked?: boolean;
  /** Riservato: in "minimal" il chiamante nasconde le altre cromature. */
  minimal?: boolean;
}

export default function PageHeader({
  page,
  title,
  onRename,
  onIconChange,
  locked,
}: PageHeaderProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickerOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  // Reset della paginazione a ogni nuova ricerca / apertura
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query, pickerOpen]);

  const isEmoji = isEmojiIcon(page?.icon);
  const Icon = !isEmoji ? resolvePageIcon(page) : null;
  const iconColor = page?.iconColor || "text-gray-400";
  const hasIcon = Boolean(page?.icon);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_OPTIONS;
    return ICON_OPTIONS.filter(
      (o) => o.key.includes(q) || o.name.toLowerCase().includes(q),
    );
  }, [query]);

  const shown = filtered.slice(0, visible);

  const pick = (iconKey: string) => {
    const normalized = iconKey ? (normalizeIconKey(iconKey) ?? iconKey) : "";
    onIconChange(normalized);
    setPickerOpen(false);
    setQuery("");
  };
  return (
    <div className="relative">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative shrink-0" ref={pickerRef}>
          <button
            type="button"
            disabled={locked}
            onClick={() => !locked && setPickerOpen((s) => !s)}
            title={locked ? undefined : "Cambia icona"}
            aria-label="Cambia icona pagina"
            className="grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#7b39fc]/50 hover:shadow-lg disabled:cursor-default"
          >
            {isEmoji ? (
              <span className="text-2xl md:text-3xl leading-none">{page.icon}</span>
            ) : hasIcon && Icon ? (
              <Icon size={26} className={iconColor} aria-hidden="true" />
            ) : (
              <span className="grid place-items-center text-gray-300 dark:text-gray-600">
                <Smile size={22} aria-hidden="true" />
              </span>
            )}
          </button>
          {pickerOpen && !locked && (
            <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-3">
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca icona..." className="w-full mb-2 px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Emoji</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {EMOJI_CHOICES.map((e) => (
                  <button key={e} type="button" onClick={() => pick(e)} className="w-9 h-9 grid place-items-center text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">{e}</button>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                Icone ({filtered.length})
              </p>
              <div className="grid grid-cols-7 gap-1 max-h-56 overflow-y-auto pr-0.5">
                {shown.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    title={o.key}
                    onClick={() => pick(o.key)}
                    className={
                      "w-9 h-9 grid place-items-center rounded-xl transition-colors " +
                      (normalizeIconKey(page?.icon) === o.key
                        ? "bg-[#7b39fc]/15 text-[#7b39fc]"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800")
                    }
                  >
                    <o.Icon size={18} aria-hidden="true" />
                  </button>
                ))}
                {shown.length === 0 && (
                  <p className="col-span-7 text-xs text-gray-400 py-3 text-center">
                    Nessuna icona trovata
                  </p>
                )}
              </div>

              {filtered.length > visible && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="mt-2 w-full px-3 py-1.5 text-[11px] font-bold rounded-xl text-[#7b39fc] hover:bg-[#7b39fc]/10"
                >
                  Mostra altre {filtered.length - visible} icone
                </button>
              )}

              {hasIcon && (
                <button
                  type="button"
                  onClick={() => pick("")}
                  className="mt-1 w-full px-3 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Rimuovi icona
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <EditableTitle title={title} onSave={onRename} locked={locked} autoEdit={!title} placeholder="Senza titolo" className="w-full" />
        </div>
      </div>
    </div>
  );
}
