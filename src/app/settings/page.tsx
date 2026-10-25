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
import { applyAppFont, readAppFont, type AppFontId } from "../../lib/appFont";
import { ACCENTS, applyAccent, readAccent, DEFAULT_ACCENT } from "../../lib/accent";
import { collectEntities, downloadCSV } from "../../lib/exportData";
import {
  PREFS_KEY,
  applyDensity,
  ensureNotifPermission,
  readUserPrefs,
} from "../../lib/prefs";
import GoogleCalendarIcon from "../../components/GoogleCalendarIcon";

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
  { id: "profile", label: "m.tabProfile", icon: User, desc: "m.tabProfileDesc" },
  { id: "appearance", label: "m.tabAppearance", icon: Palette, desc: "m.tabAppearanceDesc" },
  { id: "language", label: "m.tabLanguage", icon: Globe, desc: "m.tabLanguageDesc" },
  { id: "notifications", label: "m.tabNotifications", icon: Bell, desc: "m.tabNotificationsDesc" },
  { id: "workflow", label: "m.tabWorkflow", icon: Sliders, desc: "m.tabWorkflowDesc" },
  { id: "integrations", label: "m.tabIntegrations", icon: Layers, desc: "m.tabIntegrationsDesc" },
  { id: "data", label: "m.tabData", icon: Download, desc: "m.tabDataDesc" },
  { id: "security", label: "m.tabSecurity", icon: Shield, desc: "m.tabSecurityDesc" },
  { id: "billing", label: "m.tabBilling", icon: CreditCard, desc: "m.tabBillingDesc" },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as SettingsTab) || "profile";
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  const { language, setLanguage, t, tWith } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [accentColor, setAccentColor] = useState<string>(DEFAULT_ACCENT);
  const [fontFamily, setFontFamily] = useState<string>("inter");
  const [density, setDensity] = useState<"normal" | "compact">("normal");

  // Profile state (nome sincronizzato col server, email gestita dall'auth)
  const [user, setUser] = useState<any>({
    name: "Utente",
    email: "utente@esempio.it",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification prefs
  const [notifTaskDue, setNotifTaskDue] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [notifMeetings, setNotifMeetings] = useState(true);

  // Workflow prefs
  const [defaultPageView, setDefaultPageView] = useState<"list" | "kanban">("list");
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(true);

  // Format prefs
  const [firstDayMonday, setFirstDayMonday] = useState(true);

  // Integrations live status
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, boolean>>({});

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
      const savedAccent = readAccent();
      setAccentColor(savedAccent);
      applyAccent(savedAccent);
      const savedFont = readAppFont();
      setFontFamily(savedFont);
      applyAppFont(savedFont);
      const p = readUserPrefs();
      setDensity(p.density);
      applyDensity(p.density);
      setNotifSound(p.notifSound);
      setNotifTaskDue(p.notifTaskDue);
      setNotifMeetings(p.notifMeetings);
      setDefaultPageView(p.defaultPageView);
      setAiSuggestions(p.aiSuggestions);
      setConfirmDelete(p.confirmDelete);
      setFirstDayMonday(p.firstDayMonday);
    } catch (e) {}
  }, []);

  useEffect(() => {
    apiFetch("/user/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSubscription(data?.subscription || { status: "inactive", plan: "Starter" }))
      .catch(() => setSubscription({ status: "inactive", plan: "Starter" }));
  }, []);

  // Stato reale delle integrazioni (Google/Slack/Zoom) dal server.
  useEffect(() => {
    apiFetch("/integrations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const it of data?.integrations || []) {
          if (it && it.provider) map[String(it.provider)] = Boolean(it.connected);
        }
        setIntegrationStatus(map);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Nomi dei colori accento in lingua UI (dati lib/accent.ts restano come fallback).
  const ACCENT_KEY: Record<string, string> = {
    "#7b39fc": "m.accViolet",
    "#06b6d4": "m.accCyan",
    "#10b981": "m.accEmerald",
    "#ec4899": "m.accPink",
    "#f59e0b": "m.accAmber",
    "#3b82f6": "m.accBlue",
  };
  // Codici errore API → chiavi i18n (le API non mandano più testi in italiano).
  const API_ERR_KEY: Record<string, string> = {
    name_empty: "m.errNameEmpty",
    profile_save_failed: "m.errProfile",
    password_missing: "m.errPassMissing",
    password_too_short: "m.errPassLen",
    wrong_current_password: "m.errWrongCurrent",
    account_no_email: "m.errNoEmail",
    password_update_failed: "m.errPassword",
  };
  const apiErr = (data: any, key: string) => {
    const code = data?.code;
    return code && API_ERR_KEY[code] ? t(API_ERR_KEY[code]) : t(key);
  };

  const handleSaveProfile = async () => {
    const name = (user.name || "").trim();
    if (!name) {
      showToast(t("m.errNameEmpty"));
      return;
    }
    setSavingProfile(true);
    try {
      const res = await apiFetch("/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErr(data, "m.errProfile"));
      const nextUser = { ...user, name: data?.profile?.name || name };
      setUser(nextUser);
      try {
        localStorage.setItem("user", JSON.stringify(nextUser));
      } catch {}
      showToast(t("m.okProfile"));
    } catch (e: any) {
      showToast(e?.message || t("m.errProfile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast(t("m.errPassMissing"));
      return;
    }
    if (newPassword.length < 8) {
      showToast(t("m.errPassLen"));
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiFetch("/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(apiErr(data, "m.errPassword"));
      setCurrentPassword("");
      setNewPassword("");
      showToast(t("m.okPassword"));
    } catch (e: any) {
      showToast(e?.message || t("m.errPassword"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem("taskly_accent", accentColor);
      localStorage.setItem("taskly_font", fontFamily);
      applyAppFont(fontFamily as AppFontId);
      applyDensity(density);
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({
          density,
          notifSound,
          notifTaskDue,
          notifMeetings,
          defaultPageView,
          aiSuggestions,
          confirmDelete,
          firstDayMonday,
        }),
      );
      showToast(t("m.okPrefs"));
    } catch {
      showToast(t("m.errPrefs"));
    }
  };

  // Toggle notifiche di sistema: all'attivazione chiede il permesso al browser.
  const handleNotifToggle = async (
    key: "notifTaskDue" | "notifMeetings" | "notifSound",
    val: boolean,
    set: (v: boolean) => void,
    title: string,
  ) => {
    if (!val) {
      const ok = await ensureNotifPermission();
      if (!ok) {
        showToast(t("m.errNotifPerm"));
        return;
      }
    }
    set(!val);
    showToast(`${title}: ${!val ? t("m.on") : t("m.off")}`);
  };

  const changeAccent = (color: string, label: string) => {
    setAccentColor(color);
    applyAccent(color, true);
    showToast(tWith("m.toastAccent", { name: label }));
  };

  const changeTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next, true);
    showToast(next === "dark" ? t("m.toastThemeDark") : t("m.toastThemeLight"));
  };

  const changeFont = (next: AppFontId, label: string) => {
    setFontFamily(next);
    applyAppFont(next, true);
    showToast(tWith("m.toastFont", { name: label }));
  };

  const openBillingPortal = async () => {
    setBillingMessage("");
    setLoadingPortal(true);
    try {
      const res = await apiFetch("/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("m.errPortal"));
      window.location.href = data.url;
    } catch (error: any) {
      setBillingMessage(error.message || t("m.errPortalOpen"));
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Server: pagine, task, obiettivi, idee, piano e profilo.
      let server: any = null;
      try {
        const res = await apiFetch("/user/data");
        if (res.ok) server = await res.json();
      } catch {}
      // Locale: preferenze, accento, font, schede, cache viste, meeting.
      const local: Record<string, unknown> = {};
      for (const k of [
        "tasks",
        "taskly_tasks_v1",
        "goals",
        "taskly_pages_v1",
        "meetings_data",
        "taskly_user_preferences",
        "taskly_accent",
        "taskly_font",
        "dashboardOpenTabs",
        "expanded_pages",
        "page_history",
        "taskly_dashboard_custom_widgets_v2",
        "taskly_user_usecase",
      ]) {
        try {
          const raw = localStorage.getItem(k);
          if (raw === null) continue;
          try {
            local[k] = JSON.parse(raw);
          } catch {
            local[k] = raw;
          }
        } catch {}
      }
      const backup = {
        exportedAt: new Date().toISOString(),
        user,
        theme,
        server,
        local,
        version: "2.0",
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taskly-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(server ? t("m.okBackupFull") : t("m.okBackupLocal"));
    } catch (e) {
      showToast(t("m.errExport"));
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem("dashboardOpenTabs");
      localStorage.removeItem("taskly_dashboard_custom_widgets_v2");
      localStorage.removeItem("page_history");
      showToast(t("m.okCache"));
    } catch {
      showToast(t("m.errCache"));
    }
  };

  // ── Export tabellare: vedi lib/exportData.ts ──────────────────────────
  const handleExportCSV = async (entity: "tasks" | "goals" | "ideas" | "pages", label: string) => {
    try {
      const all = await collectEntities();
      const n = downloadCSV(
        `taskly-${label}-${new Date().toISOString().split("T")[0]}.csv`,
        all[entity] || [],
      );
      showToast(n > 0 ? tWith("m.okCsv", { n, file: label }) : tWith("m.okCsvEmpty", { file: label }));
    } catch {
      showToast(t("m.errCsv"));
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
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-(--accent) dark:hover:text-(--accent-300) mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>{t("backToDashboard", "Torna alla Dashboard")}</span>
            </Link>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              {t("settingsTitle", "Impostazioni Taskly")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("m.settingsSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--accent) hover:bg-(--accent-hover) text-white text-xs font-bold shadow-lg shadow-(--accent)/20 transition-all cursor-pointer"
            >
              <Check size={15} />
              <span>{t("m.saveChanges")}</span>
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
                        ? "bg-(--accent)/10 text-(--accent) dark:bg-(--accent)/20 dark:text-(--accent-300) font-extrabold shadow-xs"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-900 text-xs font-medium"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-(--accent) dark:text-(--accent-300)" : "text-gray-400"} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{t(tab.label)}</div>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-(--accent) dark:text-(--accent-300)" />}
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
                <span>{t("logout", "Disconnetti sessione")}</span>
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
                      <User size={20} className="text-(--accent)" />
                      <span>{t("m.tabProfile")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.profileSub")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="w-16 h-16 rounded-2xl object-cover border border-(--accent)/30" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-(--accent) to-(--accent-300) flex items-center justify-center text-white font-black text-xl shadow-lg shadow-(--accent)/20">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-1 flex-1">
                      <p className="font-extrabold text-sm text-gray-900 dark:text-white">{user.name || t("m.userFallback", "Utente")}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {t("m.verified")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.fullName")}</label>
                      <input
                        type="text"
                        value={user.name || ""}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-(--accent)"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.email")}</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        readOnly
                        title={t("m.emailManagedT")}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 text-xs font-medium text-gray-500 focus:outline-none cursor-not-allowed"
                      />
                      <p className="text-[10px] text-gray-400">{t("m.emailManagedD")}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-5 py-2.5 rounded-xl bg-(--accent) text-white text-xs font-bold hover:bg-(--accent-hover) transition-all shadow-md shadow-(--accent)/20 disabled:opacity-50"
                  >
                    {savingProfile ? t("m.saving") : t("m.saveProfile")}
                  </button>
                </div>
              )}

              {/* TAB 2: APPEARANCE */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Palette size={20} className="text-purple-500" />
                      <span>{t("m.tabAppearance")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.appearanceSub")}
                    </p>
                  </div>

                  {/* Theme Mode */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.themeMode")}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => changeTheme("light")}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                          theme === "light"
                            ? "border-(--accent) bg-(--accent)/10 text-(--accent) ring-2 ring-(--accent)/20"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <Sun size={18} />
                        <div className="text-left">
                          <div>{t("lightMode", "Tema Chiaro")}</div>
                          <span className="text-[10px] text-gray-400 font-normal">{t("m.lightDesc")}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => changeTheme("dark")}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                          theme === "dark"
                            ? "border-(--accent) bg-(--accent)/10 text-(--accent) ring-2 ring-(--accent)/20"
                            : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        <Moon size={18} />
                        <div className="text-left">
                          <div>{t("darkMode", "Tema Scuro")}</div>
                          <span className="text-[10px] text-gray-400 font-normal">{t("m.darkDesc")}</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.accentColor")}</label>
                    <div className="flex flex-wrap gap-3">
                      {ACCENTS.map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => changeAccent(c.color, t(ACCENT_KEY[c.color] || "", c.name))}
                          aria-pressed={accentColor === c.color}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            accentColor === c.color
                              ? "border-(--accent) bg-(--accent)/10 ring-2 ring-(--accent)/30"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{t(ACCENT_KEY[c.color] || "", c.name)}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t("m.accentApplied")}
                    </p>
                  </div>

                  {/* Typography Font */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.typography")}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "inter", name: "Inter (Sans-serif)", preview: "m.fontInterPrev" },
                        { id: "serif", name: "Merriweather (Serif)", preview: "m.fontSerifPrev" },
                        { id: "mono", name: "Monospace", preview: "m.fontMonoPrev" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => changeFont(f.id as AppFontId, f.name)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            fontFamily === f.id
                              ? "border-(--accent) bg-(--accent)/10 text-(--accent) font-bold"
                              : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                          }`}
                        >
                          <p className="text-xs font-bold">{f.name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{t(f.preview)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.density")}</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setDensity("normal");
                          applyDensity("normal");
                        }}
                        className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                          density === "normal"
                            ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        {t("m.densityNormal")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDensity("compact");
                          applyDensity("compact");
                        }}
                        className={`flex-1 p-3 rounded-xl border text-xs font-bold ${
                          density === "compact"
                            ? "border-(--accent) bg-(--accent)/10 text-(--accent)"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        {t("m.densityCompact")}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t("m.densityDesc")}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: LANGUAGE & REGION */}
              {activeTab === "language" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Globe size={20} className="text-cyan-500" />
                      <span>{t("m.tabLanguage")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.languageSub")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.appLanguage")}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { code: "it", name: "Italiano", flag: "🇮🇹" },
                        { code: "en", name: "English", flag: "🇬🇧" },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setLanguage(lang.code);
                            showToast(tWith("m.toastLanguage", { name: lang.name }));
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

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.weekStart")}</label>
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
                        {t("m.monday")}
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
                        {t("m.sunday")}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t("m.weekStartDesc")}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Bell size={20} className="text-amber-500" />
                      <span>{t("m.tabNotifications")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.notifSub")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "notifTaskDue" as const,
                        title: "m.ntDue",
                        desc: "m.ntDueDesc",
                        val: notifTaskDue,
                        set: setNotifTaskDue,
                        needsPermission: true,
                      },
                      {
                        key: "notifSound" as const,
                        title: "m.ntSound",
                        desc: "m.ntSoundDesc",
                        val: notifSound,
                        set: setNotifSound,
                        needsPermission: false,
                      },
                      {
                        key: "notifMeetings" as const,
                        title: "m.ntMeet",
                        desc: "m.ntMeetDesc",
                        val: notifMeetings,
                        set: setNotifMeetings,
                        needsPermission: true,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="space-y-0.5 pr-4">
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{t(item.title)}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{t(item.desc)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.needsPermission) {
                              void handleNotifToggle(item.key, item.val, item.set, t(item.title));
                            } else {
                              item.set(!item.val);
                              showToast(`${t(item.title)}: ${!item.val ? t("m.on") : t("m.off")}`);
                            }
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
                      <span>{t("m.tabWorkflow")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.workflowSub")}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.defaultTaskView")}</label>
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
                        {t("m.viewList")}
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
                        {t("m.viewKanban")}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {t("m.defaultTaskViewDesc")}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{t("m.confirmTrash")}</p>
                      <p className="text-[11px] text-gray-500">{t("m.confirmTrashDesc")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(!confirmDelete)}
                      aria-pressed={confirmDelete}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                        confirmDelete ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${confirmDelete ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{t("m.aiSuggestions")}</p>
                      <p className="text-[11px] text-gray-500">{t("m.aiSuggestionsDesc")}</p>
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
                      <span>{t("m.tabIntegrations")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.integrationsSub")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        provider: "google",
                        name: "Google Calendar",
                        desc: "m.glCalDesc",
                        icon: <GoogleCalendarIcon className="w-7 h-7" />,
                      },
                      {
                        provider: "slack",
                        name: "Slack",
                        desc: "m.slackDesc",
                        icon: "💬",
                      },
                      {
                        provider: "zoom",
                        name: "Zoom",
                        desc: "m.zoomDesc",
                        icon: "🎥",
                      },
                    ].map((item) => {
                      const connected = Boolean(integrationStatus[item.provider]);
                      return (
                      <div
                        key={item.provider}
                        className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-[11px] text-gray-500">{t(item.desc)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => router.push("/integrations")}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            connected
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {connected ? t("m.connected") : t("m.connect")}
                        </button>
                      </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/40 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-cyan-900 dark:text-cyan-200">{t("m.hubT")}</p>
                      <p className="text-[11px] text-cyan-700 dark:text-cyan-400">{t("m.hubD")}</p>
                    </div>
                    <Link
                      href="/integrations"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                    >
                      <span>{t("m.openHub")}</span>
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
                      <span>{t("m.tabData")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.dataSub")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
                        <Download size={18} />
                      </div>
                      <h4 className="text-xs font-bold">{t("m.exportBackupT")}</h4>
                      <p className="text-[11px] text-gray-500">
                        {t("m.exportBackupD")}
                      </p>
                      <button
                        type="button"
                        onClick={handleExportData}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                      >
                        {t("m.downloadJSON")}
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
                        <FileText size={18} />
                      </div>
                      <h4 className="text-xs font-bold">{t("m.exportCsvT")}</h4>
                      <p className="text-[11px] text-gray-500">
                        {t("m.exportCsvD")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ["tasks", "m.lblTasks"],
                            ["goals", "m.lblGoals"],
                            ["ideas", "m.lblIdeas"],
                            ["pages", "m.lblPages"],
                          ] as const
                        ).map(([entity, label]) => (
                          <button
                            key={entity}
                            type="button"
                            onClick={() => handleExportCSV(entity, entity)}
                            className="py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all"
                          >
                            {t(label)} CSV
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 w-fit">
                        <RefreshCw size={18} />
                      </div>
                      <h4 className="text-xs font-bold">{t("m.clearCacheT")}</h4>
                      <p className="text-[11px] text-gray-500">
                        {t("m.clearCacheD")}
                      </p>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        className="w-full py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold transition-all"
                      >
                        {t("m.clearCache")}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                      <Shield size={16} />
                      <span>{t("m.e2eT")}</span>
                    </div>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                      {t("m.e2eD")}
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
                      <span>{t("m.tabSecurity")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.securitySub")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.currentPassword")}</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">{t("m.newPassword")}</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("m.passPh")}
                        autoComplete="new-password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {savingPassword ? t("m.updating") : t("m.updatePassword")}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 9: BILLING */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCard size={20} className="text-(--accent)" />
                      <span>{t("m.tabBilling")}</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t("m.billingSub")}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-(--accent)/10 to-(--accent-300)/5 border border-(--accent)/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-(--accent)">{t("m.activePlan")}</span>
                        <span className="px-2 py-0.5 rounded-full bg-(--accent) text-white text-[9px] font-black uppercase">
                          {subscription?.plan || "Starter"}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        {subscription?.plan === "Pro" ? t("m.planPro") : t("m.planStarter")}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subscription?.plan === "Pro"
                          ? t("m.planProDesc")
                          : t("m.planStarterDesc")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openBillingPortal}
                      disabled={loadingPortal}
                      className="px-5 py-2.5 rounded-xl bg-(--accent) hover:bg-(--accent-hover) text-white text-xs font-bold shadow-lg shadow-(--accent)/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {loadingPortal ? t("loading", "Caricamento...") : t("m.manageStripe")}
                    </button>
                  </div>

                  {billingMessage && (
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{billingMessage}</p>
                  )}

                  <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{t("m.comparePlans")}</p>
                      <p className="text-[11px] text-gray-500">{t("m.comparePlansDesc")}</p>
                    </div>
                    <Link
                      href="/#pricing"
                      className="px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {t("m.viewPricing")}
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
              {t("confirmLogoutTitle", "Vuoi davvero uscire?")}
            </h2>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t("confirmLogoutDesc", "La sessione verrà terminata e tornerai alla pagina di accesso.")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel", "Annulla")}
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-600/20"
              >
                {loggingOut ? t("loading", "Uscita...") : t("confirmLogout", "Disconnetti")}
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