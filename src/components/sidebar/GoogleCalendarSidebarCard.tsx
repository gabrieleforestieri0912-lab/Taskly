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

/** Google Calendar official "31" icon (compact) */
function GoogleCalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="10" fill="#FFFFFF" />
      <path
        d="M38 14H10C7.79086 14 6 15.7909 6 18V38C6 40.2091 7.79086 42 10 42H38C40.2091 42 42 40.2091 42 38V18C42 15.7909 40.2091 14 38 14Z"
        fill="#4285F4"
      />
      <path
        d="M38 18H10V38C10 39.1046 10.8954 40 12 40H36C37.1046 40 38 39.1046 38 38V18Z"
        fill="#FFFFFF"
      />
      <path d="M10 18H38V22H10V18Z" fill="#1A73E8" />
      <path
        d="M20.5 33H18.5V28.2L16.2 29.3V27.5L20.2 25.5H20.5V33ZM29.8 29.4C29.8 30.5 29.3 31.4 28.5 32.1C27.6 32.7 26.5 33 25.1 33C24 33 23 32.8 22.1 32.3L22.7 30.6C23.5 31 24.3 31.2 25.1 31.2C25.9 31.2 26.5 31 27 30.6C27.4 30.2 27.6 29.7 27.6 29.1C27.6 28.4 27.3 27.9 26.8 27.5C26.3 27.1 25.5 26.9 24.5 26.9H23.5V25.3H24.4C25.3 25.3 26 25.1 26.5 24.7C27 24.3 27.2 23.8 27.2 23.3C27.2 22.8 27 22.4 26.6 22.1C26.2 21.8 25.6 21.6 24.9 21.6C24.1 21.6 23.4 21.8 22.7 22.2L22.1 20.6C23 20.1 24 19.8 25.1 19.8C26.4 19.8 27.4 20.1 28.1 20.6C28.8 21.2 29.2 22 29.2 23C29.2 23.8 28.9 24.4 28.4 24.9C27.9 25.4 27.3 25.7 26.6 25.8V25.9C27.6 26.1 28.4 26.5 29 27.1C29.5 27.7 29.8 28.5 29.8 29.4Z"
        fill="#1A73E8"
      />
      <rect x="13" y="10" width="4" height="7" rx="2" fill="#EA4335" />
      <rect x="31" y="10" width="4" height="7" rx="2" fill="#34A853" />
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
      className="px-2 select-none"
      aria-label="Integrazione Google Calendar"
    >
      {/* ── Compact single-row layout ─────────────────────────────────── */}
      <div className="group flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-100/70 dark:hover:bg-white/5 transition-colors cursor-default">
        {/* Icon */}
        <div className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 shadow-xs border border-black/8 dark:border-white/10 flex items-center justify-center shrink-0">
          <GoogleCalendarIcon className="w-3.5 h-3.5" />
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
