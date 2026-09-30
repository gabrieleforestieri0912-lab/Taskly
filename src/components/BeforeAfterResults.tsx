"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";

export default function BeforeAfterResults() {
  const { t } = useLanguage();
  return (
    <section className="px-6 py-20 bg-zinc-50 dark:bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100/50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest mb-5">{t("land.baEyebrow")}</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{t("land.baTitle")}</h2>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/40 p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">{t("land.baBeforeLabel")}</p>
            <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">{t("land.baBeforeTitle")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>- Task in una app, note in un&apos;altra, calendario altrove</li>
              <li>{t("land.baBefore2")}</li>
              <li>{t("land.baBefore3")}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-cyan-200/70 dark:border-cyan-800/50 bg-cyan-50/60 dark:bg-cyan-900/20 p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">{t("land.baAfterLabel")}</p>
            <h3 className="mt-2 text-xl font-black text-gray-900 dark:text-white">{t("land.baAfterTitle")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li>{t("land.baAfter1")}</li>
              <li>{t("land.baAfter2")}</li>
              <li>{t("land.baAfter3")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-4 text-center">
            <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">5h</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.baStat1Label")}</p>
          </div>
          <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-4 text-center">
            <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">2x</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.baStat2Label")}</p>
          </div>
          <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 p-4 text-center">
            <p className="text-2xl font-black text-orange-700 dark:text-orange-300">30s</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.baStat3Label")}</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-7 text-sm font-black text-white dark:text-gray-900 hover:opacity-90 transition-all">{t("land.baCta")}</Link>
        </div>
      </div>
    </section>
  );
}
