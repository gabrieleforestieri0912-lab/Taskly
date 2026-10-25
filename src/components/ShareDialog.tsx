"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../lib/LanguageContext";
import {
  X,
  Link2,
  Check,
  ChevronDown,
  Lock,
  Globe,
  Settings2,
  HelpCircle,
  Trash2,
} from "lucide-react";

export type ShareRole = "full" | "edit" | "view";
export interface PageInvite {
  email: string;
  role: ShareRole;
}
export interface PageSharing {
  invites: PageInvite[];
  /** "invited" = solo invitati · "public" = chiunque abbia il link */
  generalAccess: "invited" | "public";
  published: boolean;
}

const DEFAULT_SHARING: PageSharing = {
  invites: [],
  generalAccess: "invited",
  published: false,
};

const VALID_ROLES: ShareRole[] = ["full", "edit", "view"];

export const ROLE_LABELS: Record<ShareRole, string> = {
  full: "Accesso completo",
  edit: "Può modificare",
  view: "Può visualizzare",
};

export function getPageSharing(page: any): PageSharing {
  const raw = page?.sharing;
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SHARING, invites: [] };
  const invites = Array.isArray(raw.invites)
    ? raw.invites
        .filter((i: any) => i && typeof i.email === "string" && i.email.includes("@"))
        .map((i: any) => ({
          email: String(i.email).toLowerCase(),
          role: VALID_ROLES.includes(i.role) ? (i.role as ShareRole) : ("view" as ShareRole),
        }))
    : [];
  return {
    invites,
    generalAccess: raw.generalAccess === "public" ? "public" : "invited",
    published: Boolean(raw.published),
  };
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function avatarColor(seed: string) {
  const palette = [
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-violet-500",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function RoleSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: ShareRole;
  onChange: (r: ShareRole) => void;
  ariaLabel: string;
}) {
  return (
    <span className="relative inline-flex items-center shrink-0">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value as ShareRole)}
        className="appearance-none bg-transparent text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 pr-4 py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
      >
        {VALID_ROLES.map((r) => (
          <option key={r} value={r} className="text-gray-900">
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        aria-hidden="true"
        className="pointer-events-none absolute right-0 text-gray-400"
      />
    </span>
  );
}

export default function ShareDialog({
  page,
  user,
  onUpdatePage,
  onClose,
}: {
  page: any;
  user?: { name?: string; email?: string; picture?: string } | null;
  onUpdatePage: (id: string, updates: any) => void;
  onClose: () => void;
}) {
  const { t, tWith } = useLanguage();
  const [tab, setTab] = useState<"share" | "publish">("share");
  const [emailInput, setEmailInput] = useState("");
  const [inviteRole, setInviteRole] = useState<ShareRole>("edit");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sharing = getPageSharing(page);
  const organizerEmail = String(user?.email || "").toLowerCase();
  const organizerName = user?.name || "Tu";

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const save = (next: PageSharing) => {
    onUpdatePage(page.id, { sharing: next });
  };

  const handleInvite = () => {
    const rawParts = emailInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (rawParts.length === 0) {
      setInviteError("Inserisci almeno un indirizzo email.");
      return;
    }
    const invalid = rawParts.filter((e) => !isValidEmail(e));
    if (invalid.length > 0) {
      setInviteError(`Indirizzo non valido: ${invalid[0]}`);
      return;
    }
    const known = new Set(sharing.invites.map((i) => i.email));
    const fresh = rawParts.filter((e) => e !== organizerEmail && !known.has(e));
    if (fresh.length === 0) {
      setInviteError("Questi indirizzi sono già stati invitati.");
      return;
    }
    save({
      ...sharing,
      invites: [...sharing.invites, ...fresh.map((email) => ({ email, role: inviteRole }))],
    });
    setEmailInput("");
    setInviteError(null);
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/dashboard?page=${page.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const pageLink = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard?page=${page.id}`;

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-start justify-center p-4 pt-[10vh]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tWith("views.shareAria", { name: page?.label || t("views.mtUntitled") })}
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden text-gray-900 dark:text-gray-100"
      >
        {/* ── Header: tab + help + chiudi ─────────────────────────────── */}
        <div className="flex items-center gap-4 px-4 pt-3.5">
          <div className="flex items-center gap-4 text-sm font-bold">
            <button
              type="button"
              onClick={() => setTab("share")}
              aria-selected={tab === "share"}
              role="tab"
              className={`pb-2.5 border-b-2 transition-colors ${
                tab === "share"
                  ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Condividi
            </button>
            <button
              type="button"
              onClick={() => setTab("publish")}
              aria-selected={tab === "publish"}
              role="tab"
              className={`pb-2.5 border-b-2 transition-colors ${
                tab === "publish"
                  ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              Pubblica
            </button>
          </div>
          <div className="ml-auto flex items-center gap-1 pb-2">
            <button
              type="button"
              title="Scopri la condivisione"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors px-1.5 py-1 rounded-lg"
            >
              <HelpCircle size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Scopri la condivisione</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Chiudi condivisione"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="border-b border-gray-100 dark:border-white/10" />

        {tab === "share" ? (
          <div className="px-4 py-3.5">
            {/* ── Invito ─────────────────────────────────────────── */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setInviteError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleInvite();
                  }
                }}
                placeholder="Email, separate da virgole"
                aria-label="Email da invitare, separate da virgole"
                className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border-2 border-cyan-500 dark:border-cyan-400 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleInvite}
                className="px-4 py-2 rounded-lg bg-[#2383e2] hover:bg-[#1f77cd] text-white text-sm font-bold transition-colors shrink-0"
              >
                Invita
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-gray-400">Ruolo inviti:</span>
              <RoleSelect value={inviteRole} onChange={setInviteRole} ariaLabel="Ruolo per i nuovi inviti" />
            </div>
            {inviteError && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{inviteError}</p>
            )}

            {/* ── Organizzatore ──────────────────────────────────── */}
            <div className="flex items-center gap-2.5 mt-3">
              {user?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(organizerEmail || organizerName)} text-white grid place-items-center text-sm font-black shrink-0`}
                >
                  {(organizerName || "T").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold truncate">
                  {organizerName}{" "}
                  <span className="font-medium text-gray-400">(Tu)</span>
                </span>
                {organizerEmail && (
                  <span className="block text-xs text-gray-400 truncate">{organizerEmail}</span>
                )}
              </span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                Accesso completo
              </span>
            </div>

            {/* ── Invitati ───────────────────────────────────────── */}
            {sharing.invites.length > 0 && (
              <ul className="mt-1.5 space-y-1">
                {sharing.invites.map((inv) => (
                  <li key={inv.email} className="flex items-center gap-2.5 group/inv">
                    <span
                      aria-hidden="true"
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(inv.email)} text-white grid place-items-center text-sm font-black shrink-0`}
                    >
                      {inv.email.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-medium truncate">{inv.email}</span>
                    <RoleSelect
                      value={inv.role}
                      ariaLabel={`Permessi per ${inv.email}`}
                      onChange={(role) =>
                        save({
                          ...sharing,
                          invites: sharing.invites.map((i) =>
                            i.email === inv.email ? { ...i, role } : i,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        save({
                          ...sharing,
                          invites: sharing.invites.filter((i) => i.email !== inv.email),
                        })
                      }
                      aria-label={`Rimuovi ${inv.email}`}
                      title="Rimuovi accesso"
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover/inv:opacity-100 focus-visible:opacity-100 transition-all"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* ── Accesso generale ───────────────────────────────── */}
            <p className="mt-4 mb-1 text-xs font-bold text-gray-500 dark:text-gray-400">
              Accesso generale
            </p>
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 grid place-items-center text-gray-500 dark:text-gray-300 shrink-0">
                {sharing.generalAccess === "public" ? (
                  <Globe size={15} aria-hidden="true" />
                ) : (
                  <Lock size={15} aria-hidden="true" />
                )}
              </span>
              <span className="relative inline-flex items-center flex-1 min-w-0">
                <select
                  value={sharing.generalAccess}
                  aria-label="Accesso generale alla pagina"
                  onChange={(e) =>
                    save({
                      ...sharing,
                      generalAccess: e.target.value as "invited" | "public",
                    })
                  }
                  className="appearance-none w-full bg-transparent text-sm font-bold pr-5 py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                >
                  <option value="invited" className="text-gray-900">
                    Solo persone invitate
                  </option>
                  <option value="public" className="text-gray-900">
                    Chiunque abbia il link
                  </option>
                </select>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 text-gray-400"
                />
              </span>
            </div>
            {sharing.generalAccess === "public" && (
              <p className="mt-1.5 text-[11px] text-gray-400">
                Chiunque abbia il link può visualizzare questa pagina.
              </p>
            )}

            {/* ── Footer: avanzate + copia link ──────────────────── */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors px-1 py-1 rounded-lg"
              >
                <Settings2 size={15} aria-hidden="true" />
                Avanzate
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-white/15 text-sm font-bold text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-emerald-500" />
                    Copiato!
                  </>
                ) : (
                  <>
                    <Link2 size={15} aria-hidden="true" />
                    Copia link
                  </>
                )}
              </button>
            </div>
            {showAdvanced && (
              <div className="mt-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 space-y-2.5">
                <p className="text-[11px] text-gray-400 break-all">
                  ID pagina: <span className="font-mono">{page.id}</span>
                </p>
                <p className="text-[11px] text-gray-400 break-all">
                  Link: <span className="font-mono">{pageLink}</span>
                </p>
                {(sharing.invites.length > 0 || sharing.generalAccess === "public") && (
                  <button
                    type="button"
                    onClick={() => save({ ...DEFAULT_SHARING, invites: [] })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Reimposta condivisione (solo tu)
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Tab Pubblica ─────────────────────────────────────────── */
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 grid place-items-center shrink-0">
                <Globe size={19} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">Pubblica sul web</p>
                <p className="text-xs text-gray-400">
                  Chiunque abbia il link può visualizzare la pagina.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={sharing.published}
                aria-label="Pubblica sul web"
                onClick={() =>
                  save({
                    ...sharing,
                    published: !sharing.published,
                    generalAccess: !sharing.published ? "public" : sharing.generalAccess,
                  })
                }
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                  sharing.published ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/15"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                    sharing.published ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {sharing.published ? (
              <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-3">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium break-all">
                  {pageLink}
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={13} /> Copiato!
                    </>
                  ) : (
                    <>
                      <Link2 size={13} aria-hidden="true" /> Copia link pubblico
                    </>
                  )}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400">
                La pagina non è pubblicata: solo tu e le persone invitate possono vederla.
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
