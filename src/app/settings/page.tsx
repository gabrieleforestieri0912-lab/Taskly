"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Globe } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { useLanguage } from "../../lib/LanguageContext";

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [message, setMessage] = useState("");
  const { language, setLanguage, t } = useLanguage();

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
      </div>
    </main>
  );
}
