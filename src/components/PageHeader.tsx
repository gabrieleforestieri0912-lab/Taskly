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

/* Emoji di scelta rapida raggruppate per categoria.
   Costruite con String.fromCodePoint (niente surrogate scritti a mano:
   impossibile produrre caratteri spezzati). */
const EMOJI_SECTIONS: Array<{ label: string; codes: number[][] }> = [
  {
    label: "Faccine",
    codes: [
      [0x1f600], [0x1f601], [0x1f602], [0x1f923], [0x1f603], [0x1f604],
      [0x1f605], [0x1f606], [0x1f609], [0x1f60a], [0x1f60b], [0x1f60d],
      [0x1f60e], [0x1f610], [0x1f611], [0x1f612], [0x1f613], [0x1f614],
      [0x1f615], [0x1f616], [0x1f617], [0x1f618], [0x1f619], [0x1f61a],
      [0x1f61b], [0x1f61c], [0x1f61d], [0x1f61e], [0x1f61f], [0x1f620],
      [0x1f621], [0x1f622], [0x1f623], [0x1f624], [0x1f625], [0x1f626],
      [0x1f627], [0x1f628], [0x1f629], [0x1f62a], [0x1f62b], [0x1f62c],
      [0x1f62d], [0x1f62e], [0x1f62f], [0x1f630], [0x1f631], [0x1f632],
      [0x1f633], [0x1f634], [0x1f635], [0x1f636], [0x1f637], [0x1f641],
      [0x1f642], [0x1f643], [0x1f644], [0x1f910], [0x1f911], [0x1f912],
      [0x1f913], [0x1f914], [0x1f915], [0x1f916], [0x1f917],
    ],
  },
  {
    label: "Gesti e mani",
    codes: [
      [0x1f44a], [0x1f44b], [0x1f44c], [0x1f44d], [0x1f44e], [0x1f44f],
      [0x1f450], [0x1f446], [0x1f447], [0x1f448], [0x1f449], [0x1f64c],
      [0x1f64f], [0x1f4aa], [0x1f91d], [0x1f91e], [0x1f91f], [0x270c, 0xfe0f],
      [0x261d, 0xfe0f], [0x1f918], [0x1f919],
    ],
  },
  {
    label: "Cuori e simboli",
    codes: [
      [0x2764, 0xfe0f], [0x1f495], [0x1f496], [0x1f497], [0x1f498],
      [0x1f499], [0x1f49a], [0x1f49b], [0x1f49c], [0x1f49d], [0x1f49e],
      [0x1f49f], [0x1f5a4], [0x1f90d], [0x2b50], [0x1f31f], [0x2728],
      [0x1f525], [0x1f4af], [0x2705], [0x274c], [0x2753], [0x2754],
      [0x2755], [0x2714, 0xfe0f], [0x274e], [0x2795], [0x2796], [0x2797],
      [0x1f6ab], [0x26d4, 0xfe0f], [0x26a0, 0xfe0f],
    ],
  },
  {
    label: "Natura",
    codes: [
      [0x1f338], [0x1f339], [0x1f33a], [0x1f33b], [0x1f33c], [0x1f33f],
      [0x1f340], [0x1f341], [0x1f342], [0x1f343], [0x1f344], [0x1f30a],
      [0x1f308], [0x1f319], [0x1f31b], [0x1f31c], [0x1f31d], [0x1f31e],
      [0x2744, 0xfe0f], [0x2600, 0xfe0f],
    ],
  },
  {
    label: "Cibo",
    codes: [
      [0x1f34e], [0x1f34f], [0x1f350], [0x1f351], [0x1f352], [0x1f353],
      [0x1f354], [0x1f355], [0x1f358], [0x1f359], [0x1f35a], [0x1f35c],
      [0x1f35d], [0x1f35e], [0x1f35f], [0x1f366], [0x1f368], [0x1f369],
      [0x1f36a], [0x1f36b], [0x1f370], [0x1f373], [0x1f374], [0x1f375],
      [0x1f377], [0x1f37a], [0x1f37b], [0x2615, 0xfe0f],
    ],
  },
  {
    label: "Animali",
    codes: [
      [0x1f436], [0x1f431], [0x1f42d], [0x1f439], [0x1f430], [0x1f98a],
      [0x1f43b], [0x1f43c], [0x1f428], [0x1f42f], [0x1f981], [0x1f42e],
      [0x1f437], [0x1f438], [0x1f435], [0x1f648], [0x1f649], [0x1f64a],
      [0x1f412], [0x1f414], [0x1f427], [0x1f426], [0x1f424], [0x1f986],
      [0x1f985], [0x1f989], [0x1f987], [0x1f43a], [0x1f434], [0x1f984],
      [0x1f41d], [0x1f41b], [0x1f98b], [0x1f40c], [0x1f422], [0x1f40d],
      [0x1f98e], [0x1f419], [0x1f991], [0x1f980], [0x1f421], [0x1f420],
      [0x1f41f], [0x1f42c], [0x1f433], [0x1f988], [0x1f40a], [0x1f418],
      [0x1f43f, 0xfe0f], [0x1f994],
    ],
  },
  {
    label: "Oggetti",
    codes: [
      [0x1f4cc], [0x1f4cd], [0x1f4d6], [0x1f4dd], [0x270f, 0xfe0f],
      [0x2702, 0xfe0f], [0x1f4ce], [0x1f4cf], [0x1f4d0], [0x1f511],
      [0x1f512], [0x1f513], [0x1f528], [0x2699, 0xfe0f], [0x1f9f2],
      [0x1f50b], [0x1f50c], [0x1f4a1], [0x1f526], [0x1f9fb], [0x1f6bd],
      [0x1f6bf], [0x1f50d], [0x1f50e], [0x1f4f7], [0x1f4f8], [0x1f4de],
      [0x260e, 0xfe0f], [0x1f4f1], [0x1f4bb], [0x1f4be], [0x1f9ee],
      [0x23f0, 0xfe0f], [0x231b, 0xfe0f], [0x23f3, 0xfe0f], [0x1f3ae],
      [0x1f3b2], [0x1f3a8], [0x1f3a4], [0x1f3a7], [0x1f3b9], [0x1f3b8],
      [0x1f3bb], [0x1f4c4], [0x1f4dd], [0x1f3af], [0x1f4c5], [0x1f4da],
      [0x1f4bc], [0x1f4cc],
    ],
  },
  {
    label: "Viaggi e luoghi",
    codes: [
      [0x1f697], [0x1f695], [0x1f699], [0x1f68c], [0x1f693], [0x1f691],
      [0x1f692], [0x1f690], [0x1f69a], [0x1f69c], [0x1f6b2], [0x1f6f4],
      [0x1f6f9], [0x1f68f], [0x26fd, 0xfe0f], [0x1f6a5], [0x1f6a6],
      [0x1f6a7], [0x2693, 0xfe0f], [0x26f5, 0xfe0f], [0x1f6a4],
      [0x2708, 0xfe0f], [0x1f6eb], [0x1f6ec], [0x1f680], [0x1f6f8],
      [0x1f681], [0x1f6f6], [0x26fa, 0xfe0f], [0x1f3e0], [0x1f3e1],
      [0x1f3e2], [0x1f3e5], [0x1f3e8], [0x1f3eb], [0x26ea, 0xfe0f],
      [0x1f54c], [0x1f309], [0x1f3a1], [0x1f3a2], [0x1f3a0],
      [0x1f3d6, 0xfe0f], [0x1f3dd, 0xfe0f], [0x26f0, 0xfe0f],
    ],
  },
];

/** Colori applicabili alle icone lucide nel picker. */
const ICON_COLORS = [
  { label: "Default", value: "text-gray-400", dot: "#9ca3af" },
  { label: "Viola", value: "text-[#7b39fc]", dot: "#7b39fc" },
  { label: "Blu", value: "text-blue-500", dot: "#3b82f6" },
  { label: "Smeraldo", value: "text-emerald-500", dot: "#10b981" },
  { label: "Rosa", value: "text-rose-500", dot: "#ec4899" },
  { label: "Ambra", value: "text-amber-500", dot: "#f59e0b" },
  { label: "Rosso", value: "text-red-500", dot: "#ef4444" },
];

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
  const [pickerTab, setPickerTab] = useState<"emoji" | "icons">("icons");
  const [query, setQuery] = useState("");
  const [pendingColor, setPendingColor] = useState("text-gray-400");
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

  const pick = (iconKey: string, color?: string) => {
    const normalized = iconKey ? (normalizeIconKey(iconKey) ?? iconKey) : "";
    onIconChange(normalized, color);
    setPickerOpen(false);
    setQuery("");
  };

  // Applica il colore subito all'icona attuale (se lucide), altrimenti resta
  // in attesa per la prossima icona scelta.
  const applyColor = (color: string) => {
    setPendingColor(color);
    const current = typeof page?.icon === "string" ? page.icon : "";
    if (current && !isEmojiIcon(current)) {
      onIconChange(normalizeIconKey(current) ?? current, color);
    }
  };
  return (
    <div className="relative">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative shrink-0" ref={pickerRef}>
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              if (locked) return;
              // Apri sulla vista coerente con l'icona attuale
              setPickerTab(isEmojiIcon(page?.icon) ? "emoji" : "icons");
              setPendingColor(
                typeof page?.iconColor === "string" && page.iconColor
                  ? page.iconColor
                  : "text-gray-400",
              );
              setPickerOpen((s) => !s);
            }}
            title={locked ? undefined : "Cambia icona"}
            aria-label="Cambia icona pagina"
            className="grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#7b39fc]/50 hover:shadow-lg disabled:cursor-default"
          >
            {isEmoji ? (
              <span className="text-2xl md:text-3xl leading-none">{page.icon}</span>
            ) : hasIcon && Icon ? (
              // eslint-disable-next-line react-hooks/static-components -- Icon viene dal catalogo statico (resolvePageIcon), non creata nel render
              <Icon size={26} className={iconColor} aria-hidden="true" />
            ) : (
              <span className="grid place-items-center text-gray-300 dark:text-gray-600">
                <Smile size={22} aria-hidden="true" />
              </span>
            )}
          </button>
          {pickerOpen && !locked && (
            <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-3">
              {/* Viste separate: Emoji | Icone */}
              <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-xl mb-3">
                {(["emoji", "icons"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPickerTab(tab)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors ${
                      pickerTab === tab
                        ? "bg-white dark:bg-gray-900 text-[#7b39fc] shadow-xs"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab === "emoji" ? "Emoji" : "Icone"}
                  </button>
                ))}
              </div>

              {pickerTab === "emoji" ? (
                <div className="max-h-64 overflow-y-auto pr-0.5 custom-scrollbar space-y-2.5">
                  {EMOJI_SECTIONS.map((sec) => (
                    <div key={sec.label}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 px-0.5">
                        {sec.label}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sec.codes.map((c) => {
                          const e = String.fromCodePoint(...c);
                          return (
                            <button key={e} type="button" onClick={() => pick(e)} title={e} className="w-9 h-9 grid place-items-center text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                              {e}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca icona..." className="w-full mb-2 px-3 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none" />
                  {/* Colore icone */}
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Colore
                  </p>
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    {ICON_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        aria-label={`Colore ${c.label}`}
                        onClick={() => applyColor(c.value)}
                        className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
                          pendingColor === c.value
                            ? "ring-2 ring-[#7b39fc] ring-offset-2 dark:ring-offset-gray-950 scale-110"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.dot }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                    Icone ({filtered.length})
                  </p>
                  <div className="grid grid-cols-7 gap-1 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                    {filtered.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        title={o.key}
                        onClick={() => pick(o.key, pendingColor)}
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
                    {filtered.length === 0 && (
                      <p className="col-span-7 text-xs text-gray-400 py-3 text-center">
                        Nessuna icona trovata
                      </p>
                    )}
                  </div>
                </>
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
