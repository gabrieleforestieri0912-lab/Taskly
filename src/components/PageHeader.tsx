"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Smile, ImagePlus, Check, X, Link2, MessageSquare, Send } from "lucide-react";
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
      [0x1f3bb], [0x1f4c4], [0x1f3af], [0x1f4c5], [0x1f4da],
      [0x1f4bc],
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
  { label: "Viola", value: "text-(--accent)", dot: "#7b39fc" },
  { label: "Blu", value: "text-blue-500", dot: "#3b82f6" },
  { label: "Smeraldo", value: "text-emerald-500", dot: "#10b981" },
  { label: "Rosa", value: "text-rose-500", dot: "#ec4899" },
  { label: "Ambra", value: "text-amber-500", dot: "#f59e0b" },
  { label: "Rosso", value: "text-red-500", dot: "#ef4444" },
];

/** Copertine sfumate pronte (stile Notion). `gradient:<indice>`. */
const COVER_GRADIENTS = [
  { label: "Viola", css: "linear-gradient(135deg, #7b39fc 0%, #a67cff 100%)" },
  { label: "Oceano", css: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" },
  { label: "Tramonto", css: "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)" },
  { label: "Foresta", css: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)" },
  { label: "Notte", css: "linear-gradient(135deg, #1e1b4b 0%, #7b39fc 100%)" },
  { label: "Rosa", css: "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)" },
  { label: "Sabbia", css: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)" },
  { label: "Abisso", css: "linear-gradient(135deg, #0369a1 0%, #10b981 100%)" },
];

/** `gradient:<i>` o `img:<url>` → stile per il banner. */
function coverStyle(cover: string | null | undefined): React.CSSProperties | undefined {
  if (!cover || typeof cover !== "string") return undefined;
  if (cover.startsWith("gradient:")) {
    const g = COVER_GRADIENTS[Number(cover.slice("gradient:".length))];
    if (g) return { background: g.css };
    return undefined;
  }
  if (cover.startsWith("img:")) {
    const url = cover.slice("img:".length).trim();
    if (!url) return undefined;
    return { backgroundImage: `url("${url}")`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return undefined;
}

export interface PageComment {
  id: string;
  text: string;
  author?: string;
  createdAt?: string;
}

export interface PageHeaderProps {
  page: any;
  title: string;
  onRename: (nextTitle: string) => void;
  onIconChange?: (icon: string, iconColor?: string) => void;
  /** Copertina stile Notion (`gradient:<i>` | `img:<url>` | null). */
  onCoverChange?: (cover: string | null) => void;
  /** Commenti pagina (persistiti in `data.comments` dal chiamante). */
  comments?: PageComment[];
  onCommentsChange?: (comments: PageComment[]) => void;
  userName?: string;
  locked?: boolean;
  /** Riservato: in "minimal" il chiamante nasconde le altre cromature. */
  minimal?: boolean;
}

export default function PageHeader({
  page,
  title,
  onRename,
  onIconChange,
  onCoverChange,
  comments,
  onCommentsChange,
  userName,
  locked,
}: PageHeaderProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<"emoji" | "icons">("icons");
  const [query, setQuery] = useState("");
  const [pendingColor, setPendingColor] = useState("text-gray-400");
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const coverRef = useRef<HTMLDivElement | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const commentList = Array.isArray(comments) ? comments : [];
  const canComment = typeof onCommentsChange === "function";

  const sendComment = () => {
    const text = commentDraft.trim();
    if (!text || !onCommentsChange) return;
    onCommentsChange([
      ...commentList,
      {
        id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        author: userName || "Tu",
        createdAt: new Date().toISOString(),
      },
    ]);
    setCommentDraft("");
  };

  const formatCommentDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    try {
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!pickerOpen && !coverOpen) return;
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
        setQuery("");
      }
      if (coverRef.current && !coverRef.current.contains(e.target as Node)) {
        setCoverOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPickerOpen(false);
        setQuery("");
        setCoverOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen, coverOpen]);

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
    if (onIconChange) onIconChange(normalized, color);
    setPickerOpen(false);
    setQuery("");
  };

  // Applica il colore subito all'icona attuale (se lucide), altrimenti resta
  // in attesa per la prossima icona scelta.
  const applyColor = (color: string) => {
    setPendingColor(color);
    const current = typeof page?.icon === "string" ? page.icon : "";
    if (current && !isEmojiIcon(current)) {
      if (onIconChange) onIconChange(normalizeIconKey(current) ?? current, color);
    }
  };

  const cover = typeof page?.cover === "string" && page.cover ? page.cover : null;
  const canEditCover = Boolean(page && page.id !== undefined && page.id !== null && onCoverChange);
  const openCoverEditor = () => {
    const cur = typeof page?.cover === "string" ? page.cover : "";
    setCoverUrl(cur.startsWith("img:") ? cur.slice("img:".length) : "");
    setCoverOpen((s) => !s);
  };

  return (
    <div className="relative">
      {/* ── Copertina stile Notion ─────────────────────────────────── */}
      {(cover || canEditCover) && (
        <div className="group/cover relative mb-2">
          {cover ? (
            <div
              className="h-36 md:h-44 rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800"
              style={coverStyle(cover)}
              role="img"
              aria-label="Copertina pagina"
            />
          ) : (
            <div className="h-10" aria-hidden="true" />
          )}
          {canEditCover && !locked && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 [@media(hover:none)]:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={openCoverEditor}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-gray-950/90 backdrop-blur text-[11px] font-bold text-gray-700 dark:text-gray-200 shadow-md hover:bg-white dark:hover:bg-gray-900 transition-colors"
              >
                <ImagePlus size={13} aria-hidden="true" />
                {cover ? "Cambia copertina" : "Aggiungi copertina"}
              </button>
              {cover && (
                <button
                  type="button"
                  onClick={() => {
                    onCoverChange && onCoverChange(null);
                    setCoverOpen(false);
                  }}
                  title="Rimuovi copertina"
                  aria-label="Rimuovi copertina"
                  className="p-1.5 rounded-xl bg-white/90 dark:bg-gray-950/90 backdrop-blur text-gray-500 hover:text-red-500 shadow-md transition-colors"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {coverOpen && canEditCover && !locked && (
            <div
              ref={coverRef}
              className="absolute left-0 right-0 sm:right-auto top-full mt-2 z-50 w-full sm:w-80 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl p-3 space-y-3"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Sfumature
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {COVER_GRADIENTS.map((g, i) => {
                    const selected = cover === `gradient:${i}`;
                    return (
                      <button
                        key={g.label}
                        type="button"
                        title={g.label}
                        aria-label={`Copertina ${g.label}`}
                        aria-pressed={selected}
                        onClick={() => {
                          onCoverChange && onCoverChange(`gradient:${i}`);
                          setCoverOpen(false);
                        }}
                        className={`h-10 rounded-lg transition-all hover:scale-105 ${
                          selected ? "ring-2 ring-(--accent) ring-offset-2 dark:ring-offset-gray-950" : ""
                        }`}
                        style={{ background: g.css }}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                  Immagine (URL)
                </p>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && coverUrl.trim()) {
                        onCoverChange && onCoverChange(`img:${coverUrl.trim()}`);
                        setCoverOpen(false);
                      }
                    }}
                    placeholder="https://…"
                    className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-(--accent)/40"
                  />
                  <button
                    type="button"
                    disabled={!coverUrl.trim()}
                    onClick={() => {
                      if (!coverUrl.trim()) return;
                      onCoverChange && onCoverChange(`img:${coverUrl.trim()}`);
                      setCoverOpen(false);
                    }}
                    title="Applica immagine"
                    aria-label="Applica immagine di copertina"
                    className="p-2 rounded-xl bg-(--accent) text-white hover:bg-(--accent-hover) disabled:opacity-40 transition-colors shrink-0"
                  >
                    <Check size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Icona sopra il titolo: solo icona, grande, senza sfondo ─── */}
      <div className={`relative self-start ${cover ? "-mt-9 md:-mt-11 ml-3 md:ml-5 z-10" : "mt-1"}`}>
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
            title={locked ? undefined : hasIcon ? "Cambia icona" : "Aggiungi icona"}
            aria-label="Cambia icona pagina"
            className="grid place-items-center min-w-[76px] min-h-[76px] rounded-2xl transition-colors hover:bg-gray-100 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) disabled:cursor-default"
          >
            {isEmoji ? (
              <span className="text-6xl md:text-7xl leading-none select-none">{page.icon}</span>
            ) : hasIcon && Icon ? (
              // eslint-disable-next-line react-hooks/static-components -- Icon viene dal catalogo statico (resolvePageIcon), non creata nel render
              <Icon size={56} className={iconColor} aria-hidden="true" />
            ) : (
              <span className="grid place-items-center gap-1 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 px-5 py-4 text-gray-300 dark:text-gray-600">
                <Smile size={34} aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Icona</span>
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
                        ? "bg-white dark:bg-gray-900 text-(--accent) shadow-xs"
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
                        {sec.codes.map((c, idx) => {
                          const e = String.fromCodePoint(...c);
                          return (
                            <button key={`${sec.label}-${idx}-${e}`} type="button" onClick={() => pick(e)} title={e} className="w-9 h-9 grid place-items-center text-xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
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
                            ? "ring-2 ring-(--accent) ring-offset-2 dark:ring-offset-gray-950 scale-110"
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
                            ? "bg-(--accent)/15 ring-2 ring-(--accent)/40"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800")
                        }
                      >
                        <o.Icon size={18} aria-hidden="true" className={pendingColor} />
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
        <div className="group/title mt-2 flex items-start gap-1">
          <div className="flex-1 min-w-0">
            <EditableTitle title={title} onSave={onRename} locked={locked} autoEdit={!title} placeholder="Nuova Pagina" className="w-full" />
          </div>
          {/* Azioni titolo all'hover: commenti pagina + copertina */}
          <div className="flex items-center gap-1 pt-2 shrink-0 opacity-0 group-hover/title:opacity-100 [@media(hover:none)]:opacity-100 focus-within:opacity-100 transition-opacity">
            {canComment && (
              <button
                type="button"
                onClick={() => setCommentsOpen((s) => !s)}
                title={commentList.length > 0 ? `Commenti (${commentList.length})` : "Aggiungi commento"}
                aria-label={commentList.length > 0 ? `Commenti della pagina (${commentList.length})` : "Aggiungi commento alla pagina"}
                aria-expanded={commentsOpen}
                className="relative p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <MessageSquare size={16} aria-hidden="true" />
                {commentList.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 grid place-items-center rounded-full bg-(--accent) text-white text-[9px] font-black tabular-nums">
                    {commentList.length > 99 ? "99+" : commentList.length}
                  </span>
                )}
              </button>
            )}
            {canEditCover && !locked && (
              <button
                type="button"
                onClick={openCoverEditor}
                title={cover ? "Cambia copertina" : "Aggiungi copertina"}
                aria-label={cover ? "Cambia copertina" : "Aggiungi copertina alla pagina"}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <ImagePlus size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        {commentsOpen && canComment && (
          <div className="mt-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-white/[0.03] p-3 space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Commenti{commentList.length > 0 ? ` (${commentList.length})` : ""}
            </p>
            {commentList.length > 0 && (
              <ul className="space-y-2 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
                {commentList.map((c) => (
                  <li key={c.id} className="group/comment flex items-start gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-2.5 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400">
                        {c.author || "Tu"}
                        {formatCommentDate(c.createdAt) ? ` · ${formatCommentDate(c.createdAt)}` : ""}
                      </p>
                      <p className="text-xs text-gray-800 dark:text-gray-100 leading-relaxed break-words mt-0.5">
                        {c.text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCommentsChange && onCommentsChange(commentList.filter((x) => x.id !== c.id))}
                      title="Elimina commento"
                      aria-label="Elimina commento"
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 [@media(hover:none)]:opacity-100 transition-all shrink-0"
                    >
                      <X size={12} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentDraft.trim()) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
                placeholder="Scrivi un commento…"
                aria-label="Scrivi un commento"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-(--accent)/40 placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={sendComment}
                disabled={!commentDraft.trim()}
                title="Invia commento"
                aria-label="Invia commento"
                className="p-2 rounded-xl bg-(--accent) text-white hover:bg-(--accent-hover) disabled:opacity-40 transition-colors shrink-0"
              >
                <Send size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
        </div>
    </div>
  );
}
