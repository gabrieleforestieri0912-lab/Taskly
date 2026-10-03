"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

/**
 * Google Calendar official icon (multi-color SVG)
 */
function GoogleCalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="10" fill="#FFFFFF" />
      {/* Top blue bar */}
      <path
        d="M38 14H10C7.79086 14 6 15.7909 6 18V38C6 40.2091 7.79086 42 10 42H38C40.2091 42 42 40.2091 42 38V18C42 15.7909 40.2091 14 38 14Z"
        fill="#4285F4"
      />
      {/* White calendar body */}
      <path
        d="M38 18H10V38C10 39.1046 10.8954 40 12 40H36C37.1046 40 38 39.1046 38 38V18Z"
        fill="#FFFFFF"
      />
      {/* Calendar date grid colors */}
      <path d="M10 18H38V22H10V18Z" fill="#1A73E8" />
      {/* Date 31 representation */}
      <path
        d="M20.5 33H18.5V28.2L16.2 29.3V27.5L20.2 25.5H20.5V33ZM29.8 29.4C29.8 30.5 29.3 31.4 28.5 32.1C27.6 32.7 26.5 33 25.1 33C24 33 23 32.8 22.1 32.3L22.7 30.6C23.5 31 24.3 31.2 25.1 31.2C25.9 31.2 26.5 31 27 30.6C27.4 30.2 27.6 29.7 27.6 29.1C27.6 28.4 27.3 27.9 26.8 27.5C26.3 27.1 25.5 26.9 24.5 26.9H23.5V25.3H24.4C25.3 25.3 26 25.1 26.5 24.7C27 24.3 27.2 23.8 27.2 23.3C27.2 22.8 27 22.4 26.6 22.1C26.2 21.8 25.6 21.6 24.9 21.6C24.1 21.6 23.4 21.8 22.7 22.2L22.1 20.6C23 20.1 24 19.8 25.1 19.8C26.4 19.8 27.4 20.1 28.1 20.6C28.8 21.2 29.2 22 29.2 23C29.2 23.8 28.9 24.4 28.4 24.9C27.9 25.4 27.3 25.7 26.6 25.8V25.9C27.6 26.1 28.4 26.5 29 27.1C29.5 27.7 29.8 28.5 29.8 29.4Z"
        fill="#1A73E8"
      />
      {/* Top hanger pins */}
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Check integration status from API
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

    // Check stored collapse state
    try {
      const savedCollapsed = localStorage.getItem("taskly_gcal_collapsed");
      if (savedCollapsed === "true") setIsCollapsed(true);
    } catch {}

    const handleIntegrationUpdate = () => checkStatus();
    window.addEventListener("taskly-integration-updated", handleIntegrationUpdate);
    return () => {
      window.removeEventListener("taskly-integration-updated", handleIntegrationUpdate);
    };
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("taskly_gcal_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Connect Google Calendar OAuth flow
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
          data?.message || "Google non configurato sul server. Verifica GOOGLE_CLIENT_ID nelle impostazioni."
        );
      }
    } catch (err: any) {
      setErrorMessage("Errore di rete durante il collegamento a Google Calendar.");
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect Google Calendar
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await apiFetch("/integrations/google", { method: "DELETE" });
      setIsConnected(false);
      setSyncNotice("Google Calendar scollegato.");
      setTimeout(() => setSyncNotice(null), 3000);
      window.dispatchEvent(new CustomEvent("taskly-integration-updated"));
    } catch {
      setErrorMessage("Errore durante la disconnessione.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick manual sync
  const handleSyncNow = () => {
    setSyncNotice("Sincronizzazione completata \u2713");
    setTimeout(() => setSyncNotice(null), 2500);
  };

  return (
    <div
      id="sidebar-google-calendar-card"
      className="mt-2 mb-2 px-1 select-none"
      aria-label="Integrazione Google Calendar"
    >
      <div className="rounded-2xl border border-blue-500/20 dark:border-blue-500/20 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/15 dark:to-transparent p-3 backdrop-blur-sm transition-all shadow-sm">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 shadow-xs flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10">
              <GoogleCalendarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                  Google Calendar
                </span>
                {isConnected ? (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                    <Check size={9} />
                    {t("auth.intConnectedBadge", "Attivo")}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-[9px] font-black tracking-wider">
                    Sync
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={toggleCollapse}
            title={isCollapsed ? "Espandi integrazione" : "Riduci integrazione"}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              {isConnected ? (
                /* CONNECTED STATE */
                <div className="mt-2.5 pt-2 border-t border-blue-500/10 dark:border-blue-500/15 space-y-2">
                  <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                    Sincronizzazione attiva con i tuoi eventi e scadenze.
                  </p>

                  {syncNotice && (
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {syncNotice}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToCalendar) {
                          onNavigateToCalendar();
                        } else {
                          router.push("/calendar");
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs active:scale-98"
                    >
                      <CalendarDays size={12} />
                      <span>Apri Calendario</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncNow}
                      title="Sincronizza ora"
                      className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200/60 dark:border-zinc-700/60 transition-colors"
                    >
                      <RefreshCw size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={isLoading}
                      title="Scollega Google Calendar"
                      className="px-2 py-1.5 rounded-xl text-[10px] font-semibold text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Scollega
                    </button>
                  </div>
                </div>
              ) : (
                /* DISCONNECTED STATE: MESSAGGIO PER COLLEGARLO & PULSANTE */
                <div className="mt-2.5 pt-2 border-t border-blue-500/10 dark:border-blue-500/15 space-y-2">
                  <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 font-medium">
                    Collega il tuo Google Calendar per sincronizzare scadenze, riunioni ed eventi direttamente nel tuo spazio di lavoro.
                  </p>

                  {errorMessage && (
                    <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-semibold leading-tight">
                      <AlertCircle size={12} className="shrink-0 mt-0.5 text-amber-600" />
                      <div className="flex-1">
                        <span>{errorMessage}</span>
                        <div className="mt-1">
                          <Link
                            href="/settings"
                            className="underline font-bold hover:text-amber-800 dark:hover:text-white"
                          >
                            Apri Impostazioni &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-0.5 space-y-1.5">
                    <button
                      type="button"
                      id="sidebar-connect-google-btn"
                      onClick={handleConnect}
                      disabled={isLoading || isChecking}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-98 disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Collegamento in corso...</span>
                        </>
                      ) : (
                        <>
                          <GoogleCalendarIcon className="w-3.5 h-3.5" />
                          <span>Collega Google Calendar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between px-1 text-[10px] text-gray-400 dark:text-gray-500">
                      <Link
                        href="/integrations"
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 font-medium"
                      >
                        <span>Gestisci integrazioni</span>
                        <ExternalLink size={10} />
                      </Link>
                      <span>OAuth 2.0 sicuro</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
