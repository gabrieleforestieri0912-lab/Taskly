"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Card, CardContent, Button } from "./UIComponents";
import { FileText, Plus, Sparkles } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

export default function WelcomeDashboard({ onAddPage }) {
  const { t } = useLanguage();
  return (
    <div className="min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-6 py-4">
      <img src="/taskly.png" alt={t("land.cmpHeaderTaskly")} className="w-16 h-16 rounded-2xl object-cover shadow-xl shadow-cyan-500/20 mb-6 animate-bounce" />

      <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
        {t("views.welcomeTitle1")} <br />
        <span className="text-gradient-cyan animate-gradient">{t("views.welcomeTitle2")}</span>.
      </h2>

      <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">
        {t("views.welcomeDesc")}
      </p>

      <div className="mt-8">
        <Button
          onClick={onAddPage}
          className="px-8 py-4 rounded-xl text-lg font-black shadow-xl shadow-cyan-500/20 gap-2"
        >
          <Plus size={20} /> {t("views.welcomeCreate")}
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-4 gap-3 w-full max-w-sm opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <FileText size={16} className="mx-auto mb-1 text-blue-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">{t("views.welcomeNotes")}</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-cyan-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">{t("views.welcomeTasks")}</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-pink-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">{t("views.welcomeGoals")}</span>
        </div>
        <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <Sparkles size={16} className="mx-auto mb-1 text-orange-500" />
          <span className="text-[8px] font-bold uppercase tracking-widest">{t("views.welcomeEvents")}</span>
        </div>
      </div>
    </div>
  );
}
