"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";

const logos = ["Studio Nova", "BrightOps", "Creative Lab", "Focus Team", "Nord Agency"];

export default function SocialProof() {
  const { t } = useLanguage();
  return (
    <section className="landing-section-surface px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t("land.spEyebrow")}</p>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          <div className="landing-stat-card">
            <p className="text-2xl font-black text-[#7b39fc] dark:text-[#a67cff]">10.000+</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.spStat1Label")}</p>
          </div>
          <div className="landing-stat-card">
            <p className="text-2xl font-black text-[#7b39fc] dark:text-[#a67cff]">4.8/5</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.spStat2Label")}</p>
          </div>
          <div className="landing-stat-card">
            <p className="text-2xl font-black text-[#7b39fc] dark:text-[#a67cff]">+120k</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("land.spStat3Label")}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {logos.map((logo) => (
            <span key={logo} className="px-4 py-2 rounded-lg border border-[#7b39fc]/15 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-white/5">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
