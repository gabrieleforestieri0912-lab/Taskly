"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";
import { MonitorDown, Smartphone, ArrowRight, Check } from "lucide-react";

export default function AppsSection() {
  const { t } = useLanguage();
  return (
    <section id="apps" className="landing-section landing-section-surface px-4 py-20 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <div className="landing-eyebrow">{t("land.appsEyebrow")}</div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.appsTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.appsTitleAccent")}</span>
          </h2>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            {t("land.appsSubtitle")}
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {/* Desktop Windows */}
          <div className="rounded-2xl border border-(--accent)/15 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
              <MonitorDown size={22} />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">
              {t("land.appsDesktopTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("land.appsDesktopDesc")}
            </p>
            <ul className="mt-4 space-y-2">
              {[t("land.appsDesktopF1"), t("land.appsDesktopF2"), t("land.appsDesktopF3")].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/api/download/windows"
                className="inline-flex items-center gap-2 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--accent-hover)"
              >
                <MonitorDown size={16} />
                {t("land.appsDownloadWin")}
              </Link>
              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors hover:border-(--accent) hover:text-(--accent)"
              >
                {t("land.appsDetails")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="rounded-2xl border border-(--accent)/15 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent)">
              <Smartphone size={22} />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-gray-900 dark:text-white">
              {t("land.appsMobileTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("land.appsMobileDesc")}
            </p>
            <ul className="mt-4 space-y-2">
              {[t("land.appsMobileF1"), t("land.appsMobileF2"), t("land.appsMobileF3")].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/download"
                className="inline-flex items-center gap-1.5 rounded-full bg-(--accent) px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--accent-hover)"
              >
                <Smartphone size={16} />
                {t("land.appsMobileCta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
