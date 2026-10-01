"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Globe,
  Moon,
  Palette,
  Sun,
  User,
  LogOut,
  Bell,
  Sliders,
  Shield,
  Download,
  Upload,
  Check,
  Zap,
  Lock,
  Key,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  Trash2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";
import { Theme, readTheme, applyTheme } from "../../lib/theme";

type SettingsTab =
  | "profile"
  | "appearance"
  | "language"
  | "notifications"
  | "workflow"
  | "integrations"
  | "data"
  | "security"
  | "billing";

const TABS: { id: SettingsTab; label: string; icon: any; desc: string }[] = [
  { id: "profile", label: "Profilo & Account", icon: User, desc: "Informazioni personali, avatar e dettagli utente" },
  { id: "appearance", label: "Aspetto & Tema", icon: Palette, desc: "Tema chiaro/scuro, colori accento e font" },
  { id: "language", label: "Lingua & Regione", icon: Globe, desc: "Lingua, formato orario e preferenze calendario" },
  { id: "notifications", label: "Notifiche & Suoni", icon: Bell, desc: "Avvisi scadenze, digest email e suoni completamento" },
  { id: "workflow", label: "Workflow & Produttività", icon: Sliders, desc: "Vista default, Pomodoro timer e opzioni AI" },
  { id: "integrations", label: "Integrazioni App", icon: Layers, desc: "Google Calendar, Slack, Zoom e Webhook" },
  { id: "data", label: "Dati & Backup", icon: Download, desc: "Esportazione, importazione e gestione cache" },
  { id: "security", label: "Sicurezza & Privacy", icon: Shield, desc: "Password, 2FA, sessioni attive e GDPR" },
  { id: "billing", label: "Piano & Fatturazione", icon: CreditCard, desc: "Abbonamento Stripe, quote e ricevute" },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState<string>("#7b39fc");
  const [fontFamily, setFontFamily] = useState<string>("inter");
  const [density, setDensity] = useState<"normal" | "compact">("normal");
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Profile state
  const [user, setUser] = useState<any>({
    name: "Utente",
    email: "utente@esempio.it",
    bio: "Product enthusiast & task manager",
    role: "Productivity Lead",
  });

  // Notification prefs
  const [notifTaskDue, setNotifTaskDue] = useState(true);
  const [notifDailyDigest, setNotifDailyDigest] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [notifMeetings, setNotifMeetings] = useState(true);

  // Workflow prefs
  const [defaultPageView, setDefaultPageView] = useState<"list" | "kanban">("list");
  const [pomodoroWork, setPomodoroWork] = useState(25);
  const [pomodoroBreak, setPomodoroBreak] = useState(5);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);

  // Format prefs
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">("24h");
  const [firstDayMonday, setFirstDayMonday] = useState(true);

  // Billing & Sub
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");

  // Modals & feedback
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tab with URL if changed
  useEffect(() => {
    const tabParam = searchParams.get("tab") as SettingsTab;
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setTheme(readTheme());
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) setUser((prev: any) => ({ ...prev, ...JSON.parse(rawUser) }));
      const savedAccent = localStorage.getItem("taskly_accent");
      if (savedAccent) setAccentColor(savedAccent);
      const savedFont = localStorage.getItem("taskly_font");
      if (savedFont) setFontFamily(savedFont);
      const savedPrefs = localStorage.getItem("taskly_user_preferences");
      if (savedPrefs) {
        const p = JSON.parse(savedPrefs);
        if (p.density) setDensity(p.density);
        if (typeof p.notifSound === "boolean") setNotifSound(p.notifSound);
        if (typeof p.notifTaskDue === "boolean") setNotifTaskDue(p.notifTaskDue);
        if (typeof p.notifDailyDigest === "boolean") setNotifDailyDigest(p.notifDailyDigest);
        if (p.defaultPageView) setDefaultPageView(p.defaultPageView);
        if (p.pomodoroWork) setPomodoroWork(p.pomodoroWork);
        if (typeof p.aiSuggestions === "boolean") setAiSuggestions(p.aiSuggestions);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    apiFetch("/user/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSubscription(data?.subscription || { status: "inactive", plan: "Starter" }))
      .catch(() => setSubscription({ status: "inactive", plan: "Starter" }));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = () => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      showToast("Profilo aggiornato con successo!");
    } catch {
      showToast("Errore nel salvataggio del profilo.");
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem("taskly_accent", accentColor);
      localStorage.setItem("taskly_font", fontFamily);
      localStorage.setItem(
        "taskly_user_preferences",
        JSON.stringify({
          density,
          notifSound,
          notifTaskDue,
          notifDailyDigest,
          notifMeetings,
          defaultPageView,
          pomodoroWork,
          pomodoroBreak,
          aiSuggestions,
          confirmDelete,
          timeFormat,
          firstDayMonday,
        }),
      );
      showToast("Preferenze salvate!");
    } catch {
      showToast("Errore nel salvataggio preferenze.");
    }
  };

  const changeTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next, true);
    showToast(`Tema ${next === "dark" ? "scuro" : "chiaro"} applicato.`);
  };

  const openBillingPortal = async () => {
    setBillingMessage("");
    setLoadingPortal(true);
    try {
      const res = await apiFetch("/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Portale non disponibile.");
      window.location.href = data.url;
    } catch (error: any) {
      setBillingMessage(error.message || "Impossibile aprire il portale.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleExportData = () => {
    try {
      const backup = {
        exportedAt: new Date().toISOString(),
        user,
        theme,
        openTabs: JSON.parse(localStorage.getItem("dashboardOpenTabs") || "[]"),
        expandedPages: JSON.parse(localStorage.getItem("expanded_pages") || "{}"),
        version: "2.0",
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taskly-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Backup JSON scaricato con successo!");
    } catch (e) {
      showToast("Errore durante l'esportazione dei dati.");
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("dashboardOpenTabs");
      localStorage.removeItem("taskly_analytics_widgets_v2");
      showToast("Cache locale svuotata con successo.");
    } catch {
      showToast("Errore nella pulizia della cache.");
    }
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {}
    setShowLogoutConfirm(false);
    router.push("/login");
  };

  const selectTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl border border-gray-800 dark:border-gray-200 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <Check size={16} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#7b39fc] dark:hover:text-[#a67cff] mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{t("backToDashboard") || "Torna alla Dashboard"}</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {t("settingsTitle") || "Impostazioni Taskly"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Personalizza il tuo spazio di lavoro, preferenze, account e integrazioni.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white text-xs font-bold shadow-lg shadow-[#7b39fc]/20 transition-all cursor-pointer"
            >
              <Check size={15} />
              <span>Salva Modifiche</span>
            </button>
          </div>
        </div>

        {/* Layout: Sidebar Tabs + Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Navigation Tabs */}
          <div className="md:col-span-4 space-y-1">
            <div className="p-2 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200/70 dark:border-gray-800/70 shadow-sm space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => selectTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/20 dark:text-[#a67cff] font-extrabold shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-900 text-xs font-medium"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-[#7b39fc] dark:text-[#a67cff]" : "text-gray-400"} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{tab.label}</div>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-[#7b39fc] dark:text-[#a67cff]" />}
                  </button>
                );
              })}
            </div>

            {/* Logout shortcut in sidebar */}
            <div className="p-2 pt-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>{t("logout") || "Disconnetti sessione"}</span>
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          <div className="md:col-span-8">
            <div className="bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 space-y-8">
              {/* TAB 1: PROFILE */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <User size={20} className="text-[#7b39fc]" />
                      <span>Profilo & Account</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Gestisci i dettagli visibili nel tuo spazio e nelle collaborazioni.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-16 h-16 rounded-2xl object-cover border border-[#7b39fc]/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7b39fc] to-[#a67cff] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#7b39fc]/20">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">{user.name || "Utente"}</p>
                      <p className="text-xs text-gray-500">{user.email || "utente@esempio.it"}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Account Verificato
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nome Completo</label>
                      <input
                        type="text"
                        value={user.name || ""}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7b39fc]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Indirizzo Email</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7b39fc]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Ruolo / Professione</label>
                    <input
                      type="text"
                      value={user.role || ""}
                      onChange={(e) => setUser({ ...user, role: e.target.value })}
                      placeholder="es. Product Manager, Ingegnere, Freelance"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7b39fc]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Biografia / Motto</label>
                    <textarea
                      rows={3}
                      value={user.bio || ""}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#7b39fc]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="px-5 py-2.5 rounded-xl bg-[#7b39fc] text-white text-xs font-bold hover:bg-[#8b4dff] transition-all shadow-md shadow-[#7b39fc]/20"
                  >
                    Salva Profilo
                  </button>
                </div>
              )}

              {/* TAB 2: APPEARANCE */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Palette size={20} className="text-purple-500" />
                      <span>Aspetto & Personalizzazione</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Scegli il tema visivo, i font e i colori accento della piattaforma.
                    </p>
                  </div>

                  {/* Theme Mode */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Modalità Tema</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => changeTheme("light")}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                          theme === "light"
                            ? "border-[#7b39fc] bg-[#7b39fc]/10 text-[#7b39fc] ring-2 ring-[#7b39fc]/20"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <Sun size={18} />
                        <div className="text-left">
                          <div>{t("lightMode") || "Tema Chiaro"}</div>
                          <span className="text-[10px] text-gray-400 font-normal">Predefinito con contrasto morbido</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => changeTheme("dark")}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                          theme === "dark"
                            ? "border-[#7b39fc] bg-[#7b39fc]/10 text-[#7b39fc] ring-2 ring-[#7b39fc]/20"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <Moon size={18} />
                        <div className="text-left">
                          <div>{t("darkMode") || "Tema Scuro"}</div>
                          <span className="text-[10px] text-gray-400 font-normal">Nero OLED con riflessi viola</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Colore d&apos;Accento</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { name: "Viola Taskly", color: "#7b39fc" },
                        { name: "Ciano Vertex", color: "#06b6d4" },
                        { name: "Smeraldo", color: "#10b981" },
                        { name: "Rosa Shocking", color: "#ec4899" },
                        { name: "Ambra Solare", color: "#f59e0b" },
                        { name: "Cobalto", color: "#3b82f6" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => {
                            setAccentColor(c.color);
                            localStorage.setItem("taskly_accent", c.color);
                            showToast(`Colore ${c.name} impostato.`);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            accentColor === c.color
                              ? "border-[#7b39fc] bg-gray-50 dark:bg-gray-900 ring-2 ring-offset-2 ring-[#7b39fc]"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography Font */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tipografia Interfaccia</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "inter", name: "Inter (Sans-serif)", preview: "Moderna e pulita" },
                        { id: "serif", name: "Merriweather (Serif)", preview: "Elegante e classica" },
                        { id: "mono", name: "Monospace", preview: "Codice & tecnica" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setFontFamily(f.id);
                            localStorage.setItem("taskly_font", f.id);
                            showToast(`Font ${f.name} salvato.`);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            fontFamily === f.id
                              ? "border-[#7b39fc] bg-[#7b39fc]/10 text-[#7b39fc] font-bold"
                              : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                          }`}
                        >
                          <p className="text-xs font-bold">{f.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{f.preview}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Densità Interfaccia</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDensity("normal")}
                        className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                          density === "normal"
                            ? "border-[#7b39fc] bg-[#7b39fc]/10 text-[#7b39fc]"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        Spaziosa (Normale)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDensity("compact")}
                        className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                          density === "compact"
                            ? "border-[#7b39fc] bg-[#7b39fc]/10 text-[#7b39fc]"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        Compatta (Alta densità)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LANGUAGE & REGION */}
              {activeTab === "language" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe size={20} className="text-cyan-500" />
                      <span>Lingua & Regione</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Imposta la lingua e i formati locali per date, ore e numeri.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Lingua dell&apos;Applicazione</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { code: "it", name: "Italiano", flag: "🇮🇹" },
                        { code: "en", name: "English", flag: "🇬🇧" },
                        { code: "es", name: "Español", flag: "🇪🇸" },
                        { code: "de", name: "Deutsch", flag: "🇩🇪" },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            showToast(`Lingua impostata: ${lang.name}`);
                          }}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                            language === lang.code
                              ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-300 ring-2 ring-cyan-500/20"
                              : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Formato Orario</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setTimeFormat("24h")}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold ${
                            timeFormat === "24h"
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          24 Ore (14:30)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimeFormat("12h")}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold ${
                            timeFormat === "12h"
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          12 Ore (2:30 PM)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Inizio Settimana</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFirstDayMonday(true)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold ${
                            firstDayMonday
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          Lunedì
                        </button>
                        <button
                          type="button"
                          onClick={() => setFirstDayMonday(false)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold ${
                            !firstDayMonday
                              ? "bg-cyan-500 text-white border-cyan-500"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          Domenica
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Bell size={20} className="text-amber-500" />
                      <span>Notifiche & Promemoria</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Controlla quando e come Taskly ti avvisa su impegni e completamenti.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Promemoria Scadenze Task",
                        desc: "Ricevi una notifica in-app all'avvicinarsi della scadenza di un task prioritario.",
                        val: notifTaskDue,
                        set: setNotifTaskDue,
                      },
                      {
                        title: "Daily Digest via Email",
                        desc: "Un riepilogo giornaliero delle attività aperte inviato ogni mattina alle 08:30.",
                        val: notifDailyDigest,
                        set: setNotifDailyDigest,
                      },
                      {
                        title: "Effetti Sonori di Completamento",
                        desc: "Riproduci un feedback sonoro festoso al completamento di una checklist o task.",
                        val: notifSound,
                        set: setNotifSound,
                      },
                      {
                        title: "Avvisi Trascrizione Riunioni",
                        desc: "Notifica istantanea quando l'AI ha terminato di trascrivere una riunione registrata.",
                        val: notifMeetings,
                        set: setNotifMeetings,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="space-y-0.5 pr-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            item.set(!item.val);
                            showToast(`${item.title}: ${!item.val ? "Attivato" : "Disattivato"}`);
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                            item.val ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              item.val ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: WORKFLOW */}
              {activeTab === "workflow" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Sliders size={20} className="text-emerald-500" />
                      <span>Workflow & Produttività</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Configura il comportamento predefinito di editor, timer e viste.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Vista Pagine Predefinita</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDefaultPageView("list")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                          defaultPageView === "list"
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        Elenco Strutturato (List)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDefaultPageView("kanban")}
                        className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                          defaultPageView === "kanban"
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        Bacheca Kanban
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Durata Focus Session (Pomodoro)</label>
                      <select
                        value={pomodoroWork}
                        onChange={(e) => setPomodoroWork(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium"
                      >
                        <option value={20}>20 Minuti</option>
                        <option value={25}>25 Minuti (Standard)</option>
                        <option value={30}>30 Minuti</option>
                        <option value={45}>45 Minuti (Deep Work)</option>
                        <option value={50}>50 Minuti</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Durata Pausa Breve</label>
                      <select
                        value={pomodoroBreak}
                        onChange={(e) => setPomodoroBreak(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium"
                      >
                        <option value={5}>5 Minuti (Standard)</option>
                        <option value={10}>10 Minuti</option>
                        <option value={15}>15 Minuti</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Suggerimenti Proattivi AI</p>
                      <p className="text-[11px] text-gray-500">Mostra analisi e consigli di prioritizzazione nella dashboard.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(!aiSuggestions)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        aiSuggestions ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${aiSuggestions ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: INTEGRATIONS */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Layers size={20} className="text-cyan-500" />
                      <span>Integrazioni App & Connettori</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Connetti i tuoi strumenti di lavoro preferiti direttamente a Taskly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Google Calendar",
                        desc: "Sincronizza automaticamente le scadenze dei task con il tuo calendario personale o aziendale.",
                        connected: true,
                        icon: "📅",
                      },
                      {
                        name: "Slack",
                        desc: "Invia notifiche istantanee e riepiloghi giornalieri sui canali del tuo team.",
                        connected: false,
                        icon: "💬",
                      },
                      {
                        name: "Zoom",
                        desc: "Importa registrazioni cloud audio e video direttamente nella suite di trascrizione AI.",
                        connected: false,
                        icon: "🎥",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[11px] text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push("/integrations")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            item.connected
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {item.connected ? "Connesso" : "Connetti"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-cyan-900 dark:text-cyan-200">Hub Integrazioni Completo</p>
                      <p className="text-[11px] text-cyan-700 dark:text-cyan-400">Esplora tutti i provider webhook e API dedicati.</p>
                    </div>
                    <Link
                      href="/integrations"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                    >
                      <span>Apri Hub</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 7: DATA & BACKUP */}
              {activeTab === "data" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Download size={20} className="text-rose-500" />
                      <span>Dati, Backup & Esportazione</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      I tuoi dati ti appartengono sempre. Esporta, importa o pulisci la cache.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
                        <Download size={18} />
                      </div>
                      <h4 className="text-xs font-bold">Esporta Backup Completo</h4>
                      <p className="text-[11px] text-gray-500">
                        Scarica tutte le pagine, task, note, impostazioni e preferenze in un unico file JSON.
                      </p>
                      <button
                        type="button"
                        onClick={handleExportData}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                      >
                        Scarica Backup JSON
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 w-fit">
                        <RefreshCw size={18} />
                      </div>
                      <h4 className="text-xs font-bold">Pulisci Cache Locale</h4>
                      <p className="text-[11px] text-gray-500">
                        Reimposta le schede aperte e svuota la cache temporanea del browser.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="w-full py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all"
                      >
                        Svuota Cache
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Shield size={16} />
                      <span>Crittografia End-to-End Attiva</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                      Le tue note private e trascrizioni sono protette con cifratura AES-GCM a 256 bit lato client.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 8: SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Shield size={20} className="text-indigo-500" />
                      <span>Sicurezza & Password</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Proteggi il tuo account con credenziali sicure e verifica a due fattori.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Password Attuale</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nuova Password</label>
                      <input
                        type="password"
                        placeholder="Almeno 8 caratteri"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Password aggiornata con successo!")}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                    >
                      Aggiorna Password
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Autenticazione a Due Fattori (2FA)</p>
                      <p className="text-[11px] text-gray-500">Aggiungi un livello di protezione supplementare con Google Authenticator.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast("Configurazione 2FA in corso...")}
                      className="px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold"
                    >
                      Attiva 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 9: BILLING */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={20} className="text-[#7b39fc]" />
                      <span>Abbonamento & Fatturazione</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Gestisci il tuo piano, pagamenti Stripe e cronologia fatture.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7b39fc]/10 to-[#a67cff]/5 border border-[#7b39fc]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#7b39fc]">Piano Attivo</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#7b39fc] text-white text-[9px] font-black uppercase">
                          {subscription?.plan || "Starter"}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        {subscription?.plan === "Pro" ? "Taskly Pro — €5.99 / mese" : "Taskly Starter — Gratuito"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subscription?.plan === "Pro"
                          ? "Accesso illimitato a pagine, IA generativa e trascrizione vocale."
                          : "Piano base con limite di 5 pagine e strumenti essenziali."}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openBillingPortal}
                      disabled={loadingPortal}
                      className="px-5 py-2.5 rounded-xl bg-[#7b39fc] hover:bg-[#8b4dff] text-white text-xs font-bold shadow-lg shadow-[#7b39fc]/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {loadingPortal ? t("loading") || "Caricamento..." : "Gestisci su Stripe"}
                    </button>
                  </div>

                  {billingMessage && (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{billingMessage}</p>
                  )}

                  <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">Confronta tutti i Piani</p>
                      <p className="text-[11px] text-gray-500">Visualizza le opzioni Starter (€0), Pro (€5.99) e Team (€14.99).</p>
                    </div>
                    <Link
                      href="/#pricing"
                      className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Vedi Tabella Prezzi
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {t("confirmLogoutTitle") || "Vuoi davvero uscire?"}
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("confirmLogoutDesc") || "La sessione verrà terminata e tornerai alla pagina di accesso."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel") || "Annulla"}
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-600/20"
              >
                {loggingOut ? t("loading") || "Uscita..." : t("confirmLogout") || "Disconnetti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black" />}>
      <SettingsContent />
    </Suspense>
  );
}