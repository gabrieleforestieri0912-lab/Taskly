"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

/** Google Calendar official icon */
function GoogleCalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="#FFFFFF" />
      {/* Top red header */}
      <path
        d="M17.5 2.5H6.5C4.29086 2.5 2.5 4.29086 2.5 6.5V8.5H21.5V6.5C21.5 4.29086 19.7091 2.5 17.5 2.5Z"
        fill="#EA4335"
      />
      {/* Right blue border */}
      <path d="M21.5 8.5H18.5V18.5H21.5V8.5Z" fill="#4285F4" />
      {/* Bottom green bar */}
      <path
        d="M18.5 18.5H5.5V21.5H17.5C19.7091 21.5 21.5 19.7091 21.5 17.5V18.5Z"
        fill="#34A853"
      />
      {/* Left yellow bar */}
      <path d="M2.5 8.5H5.5V18.5H2.5V8.5Z" fill="#FBBC05" />
      {/* Bottom-left corner green overlap */}
      <path
        d="M5.5 18.5H2.5C2.5 19.5 3 21.5 5.5 21.5V18.5Z"
        fill="#188038"
      />
      {/* "31" in Google Blue */}
      <text
        x="12"
        y="16.2"
        fill="#1A73E8"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="Google Sans, Roboto, system-ui, sans-serif"
        textAnchor="middle"
      >
        31
      </text>
    </svg>
  );
}

export function GoogleCalendarSidebarCard({
  onNavigateToCalendar,
}: {
  onNavigateToCalendar?: () => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await apiFetch("/integrations");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.integrations) ? data.integrations : [];
        const googleItem = list.find((it: any) => it.provider === "google");
        setIsConnected(!!googleItem?.connected);
      }
    } catch {
      // offline / guest
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const handleIntegrationUpdate = () => checkStatus();
    window.addEventListener("taskly-integration-updated", handleIntegrationUpdate);
    return () => {
      window.removeEventListener("taskly-integration-updated", handleIntegrationUpdate);
    };
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiFetch("/integrations/google/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(
          data?.message || "Google non configurato. Verifica GOOGLE_CLIENT_ID."
        );
      }
    } catch {
      setErrorMessage("Errore di rete.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setMenuOpen(false);
    setIsLoading(true);
    try {
      await apiFetch("/integrations/google", { method: "DELETE" });
      setIsConnected(false);
      setSyncNotice("Scollegato ✓");
      setTimeout(() => setSyncNotice(null), 2500);
      window.dispatchEvent(new CustomEvent("taskly-integration-updated"));
    } catch {
      setErrorMessage("Errore durante la disconnessione.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = () => {
    setMenuOpen(false);
    setSyncNotice("Sincronizzato ✓");
    setTimeout(() => setSyncNotice(null), 2500);
  };

  return (
    <div
      id="sidebar-google-calendar-card"
      className="px-2 my-2.5 select-none"
      aria-label="Integrazione Google Calendar"
    >
      {/* ── Card layout distanziato e rifinito ─────────────────────────── */}
      <div className="group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-gray-50/90 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/10 hover:border-blue-400/40 dark:hover:border-blue-500/30 transition-all cursor-default shadow-xs">
        {/* Logo Originale Google Calendar */}
        <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-black/8 dark:border-white/10 flex items-center justify-center shrink-0 p-0.5">
          <GoogleCalendarIcon className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">
              Google Calendar
            </span>
            {isConnected && !syncNotice && (
              <span className="flex items-center gap-0.5 text-[9px] font-black text-emerald-500 dark:text-emerald-400">
                <Check size={9} />
                Attivo
              </span>
            )}
            {syncNotice && (
              <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400">
                {syncNotice}
              </span>
            )}
          </div>
          {!isConnected && !isChecking && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">
              Collega per sincronizzare gli eventi
            </p>
          )}
        </div>

        {/* Right-side action */}
        {isConnected ? (
          /* ⋯ menu when connected */
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((s) => !s)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              title="Opzioni"
            >
              <MoreHorizontal size={13} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 w-44 p-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigateToCalendar
                        ? onNavigateToCalendar()
                        : router.push("/calendar");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    <CalendarDays size={12} className="text-blue-500" />
                    Apri Calendario
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncNow}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                  >
                    <RefreshCw size={12} className="text-gray-400" />
                    Sincronizza ora
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                  >
                    Scollega
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Connect button — compact */
          <button
            type="button"
            id="sidebar-connect-google-btn"
            onClick={handleConnect}
            disabled={isLoading || isChecking}
            className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              "Collega"
            )}
          </button>
        )}
      </div>

      {/* Error inline */}
      {errorMessage && (
        <div className="mx-2 mt-1 flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
          <AlertCircle size={11} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
