"use client";
import React from "react";
import { useLanguage } from "../lib/LanguageContext";

export default function Comparison() {
  const { t } = useLanguage();
  const rows = [
    { label: t("land.cmpRow1"), taskly: t("land.cmpRow1Taskly"), other: t("land.cmpRow1Other") },
    { label: t("land.cmpRow2"), taskly: t("land.cmpRow2Taskly"), other: t("land.cmpRow2Other") },
    { label: t("land.cmpRow3"), taskly: t("land.cmpRow3Taskly"), other: t("land.cmpRow3Other") },
    { label: t("land.cmpRow4"), taskly: t("land.cmpRow4Taskly"), other: t("land.cmpRow4Other") },
    { label: t("land.cmpRow5"), taskly: t("land.cmpRow5Taskly"), other: t("land.cmpRow5Other") },
    { label: t("land.cmpRow6"), taskly: t("land.cmpRow6Taskly"), other: t("land.cmpRow6Other") },
    { label: t("land.cmpRow7"), taskly: t("land.cmpRow7Taskly"), other: t("land.cmpRow7Other") },
    { label: t("land.cmpRow8"), taskly: t("land.cmpRow8Taskly"), other: t("land.cmpRow8Other") },
    { label: t("land.cmpRow9"), taskly: t("land.cmpRow9Taskly"), other: t("land.cmpRow9Other") },
    { label: t("land.cmpRow10"), taskly: t("land.cmpRow10Taskly"), other: t("land.cmpRow10Other") },
  ];
  return (
    <section className="landing-section px-4 py-20 bg-white dark:bg-[#151020] sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <div className="landing-eyebrow">
            {t("land.cmpEyebrow")}
          </div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.cmpTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.cmpTitleAccent")}</span>{t("land.cmpTitleSuffix")}
          </h2>
        </div>

        <div className="mt-9 overflow-hidden rounded-2xl border border-[#7b39fc]/10 dark:border-[#a484d7]/20">
          <div className="grid grid-cols-[1.1fr_0.95fr_0.95fr] bg-[#f6f7f9] dark:bg-[#2b2344]/40 text-[10px] font-black uppercase tracking-[0.08em] text-gray-500 dark:text-gray-300 sm:text-xs sm:tracking-[0.12em]">
            <div className="p-4">{t("land.cmpHeaderCriterion")}</div>
            <div className="p-4 text-[#7b39fc] dark:text-[#a67cff]">{t("land.cmpHeaderTaskly")}</div>
            <div className="p-4">{t("land.cmpHeaderOthers")}</div>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[1.1fr_0.95fr_0.95fr] border-t border-[#7b39fc]/10 dark:border-[#a484d7]/15 text-xs sm:text-sm">
              <div className="min-w-0 p-3 font-bold text-gray-900 dark:text-gray-100 sm:p-4">{row.label}</div>
              <div className="min-w-0 p-3 text-gray-700 dark:text-gray-200 sm:p-4">{row.taskly}</div>
              <div className="min-w-0 p-3 text-gray-500 dark:text-gray-400 sm:p-4">{row.other}</div>
            </div>
          ))}
          <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-[#7b39fc]/10 dark:border-[#a484d7]/15 bg-[#f6f7f9]/50 dark:bg-[#2b2344]/20">
            {t("land.cmpFootnote")}
          </div>
        </div>
      </div>
    </section>
  );
}
