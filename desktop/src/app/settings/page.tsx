
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Globe, LogOut } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

export default function SettingsPage() {
  const [subscription, setSubscription] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [message, setMessage] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) setTimeout(() => setUser(JSON.parse(saved)), 0);
      else setTimeout(() => setUser(null), 0);
    } catch {
      setTimeout(() => setUser(null), 0);
    }
  }, []);

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
    } catch (error) {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLogoutOpen(false);
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600">
          <ArrowLeft size={16} />
          {t("backToDashboard")}
        </Link>
        <h1 className="mt-8 text-3xl font-black text-gray-900 dark:text-white">{t("settingsTitle")}</h1>

        {/* Account */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-purple-500/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{user?.name || t("account")}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={16} />
              {t("logout")}
            </button>
          </div>
        </section>

        {/* Abbonamento */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-purple-500/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
                <CreditCard size={18} className="text-purple-500" />
                {t("subscription")}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t("status")}: <span className="font-bold">{getStatusLabel(subscription?.status)}</span>
              </p>
            </div>
            <button
              onClick={openBillingPortal}
              disabled={loadingPortal}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loadingPortal ? t("loading") : t("manage")}
            </button>
          </div>
          {message && <p className="mt-4 text-sm font-semibold text-amber-600">{message}</p>}
        </section>

        {/* Lingua */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-purple-500/5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-black text-gray-900 dark:text-white">
              <Globe size={18} className="text-purple-500" />
              {t("language")}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("selectLanguageDesc")}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: "it", name: "Italiano" },
                { code: "en", name: "English" },
                { code: "es", name: "Español" },
                { code: "fr", name: "Français" },
                { code: "de", name: "Deutsch" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    language === lang.code
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:text-purple-600 dark:hover:text-purple-300"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Logout confirmation modal */}
      {isLogoutOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsLogoutOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                <LogOut size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("confirmLogoutTitle")}
              </h2>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t("confirmLogoutDesc")}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                {t("confirmLogout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}



