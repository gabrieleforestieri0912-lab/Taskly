"use client";

import { useLanguage } from "../../lib/LanguageContext";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import { MonitorDown, Smartphone, Globe, Check, Apple, Play } from "lucide-react";
import { DESKTOP_REQUIREMENTS } from "../../lib/apps";

export default function DownloadPage() {
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <div className="landing-eyebrow">{t("land.dlEyebrow")}</div>
          <h1 className="landing-heading-lg mt-3">
            {t("land.dlTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.dlTitleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            {t("land.dlSubtitle")}
          </p>
        </div>

          {/* Desktop Windows — prossimamente: il download pubblico torna
              quando l'installer è validato (la route /api/download/windows
              resta disponibile per i tester con il link diretto). */}
          <section className="mt-10 rounded-3xl border border-(--accent)/15 dark:border-white/10 bg-[#f6f7f9] dark:bg-white/5 p-6 sm:p-10">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
                <MonitorDown size={22} />
              </div>
              <h2 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-white">
                {t("land.dlDesktopTitle")}
              </h2>
              <span className="mt-3 inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                {t("land.dlComingSoon")}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t("land.dlDesktopDesc")}
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--accent) px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-(--accent-hover)"
              >
                {t("land.appsTryWeb")}
              </Link>
              <div className="mt-6">
                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">
                  {t("land.dlInstallTitle")}
                </h3>
                <ol className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {[t("land.dlStep1"), t("land.dlStep2"), t("land.dlStep3")].map((s, i) => (
                    <li key={s} className="flex items-start gap-2.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-(--accent)/10 text-[11px] font-black text-(--accent)">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="md:w-72 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">
                {t("land.dlReqTitle")}
              </h3>
              <ul className="mt-3 space-y-2">
                {DESKTOP_REQUIREMENTS.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mobile */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
              <Play size={22} />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">
              {t("land.dlAndroidTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("land.dlAndroidDesc")}
            </p>
            <span className="mt-5 inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              {t("land.dlComingSoon")}
            </span>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
              <Apple size={22} />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">
              {t("land.dlIosTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("land.dlIosDesc")}
            </p>
            <span className="mt-5 inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              {t("land.dlComingSoon")}
            </span>
          </div>
        </section>

        {/* Web */}
        <section className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
            <Globe size={22} />
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            <Smartphone size={14} className="mr-1 inline" />
            {t("land.dlWebNote")}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
