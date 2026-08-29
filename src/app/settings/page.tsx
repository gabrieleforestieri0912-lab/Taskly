"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Globe, User, LogOut } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [message, setMessage] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

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
    router.push("/");
  };

  useEffect(() => {
    apiFetch("/user/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setSubscription(data?.subscription || { status: "inactive" }))
      .catch(() => setSubscription({ status: "inactive" }));
  }, []);

  const openBillingPortal = async () => {
    setMessage("");
    setLoadingPortal(true);
    try {
      const res = await apiFetch("/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Portale non disponibile.");
      window.location.href = data.url;
    } catch (error: any) {
      setMessage(error.message || "Impossibile aprire il portale.");
    } finally {
      setLoadingPortal(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return t("loading");
    if (status === "active") return t("active");
    if (status === "inactive") return t("inactive");
    return status;
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400">
          <ArrowLeft size={16} />
          {t("backToDashboard")}
        </Link>
        <h1 className="mt-8 text-3xl font-black text-gray-900 dark:text-white">{t("settingsTitle")}</h1>

        {/* Abbonamento */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-cyan-500/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
                <CreditCard size={18} className="text-cyan-500" />
                {t("subscription")}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t("status")}: <span className="font-bold">{getStatusLabel(subscription?.status)}</span>
              </p>
            </div>
            <button
              onClick={openBillingPortal}
              disabled={loadingPortal}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              {loadingPortal ? t("loading") : t("manage")}
            </button>
          </div>
          {message && <p className="mt-4 text-sm font-semibold text-amber-600 dark:text-amber-400">{message}</p>}
        </section>

        {/* Lingua */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-cyan-500/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
              <Globe size={18} className="text-cyan-500" />
              {t("language")}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("selectLanguageDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "it", name: "Italiano" },
                { code: "en", name: "English" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    language === lang.code
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 hover:text-cyan-600 dark:hover:text-cyan-300"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-cyan-500/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
              <User size={18} className="text-cyan-500" />
              {t("account")}
            </div>
            {user && (
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <img src={user.picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-sm font-bold text-white">
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900 dark:text-white">{user.name || "—"}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut size={16} />
              {t("logout")}
            </button>
          </div>
        </section>
      </div>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{t("confirmLogoutTitle")}</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("confirmLogoutDesc")}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={loggingOut}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loggingOut ? t("loading") : t("confirmLogout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
