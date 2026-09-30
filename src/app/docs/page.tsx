"use client";

import { useLanguage } from "../../lib/LanguageContext";
import React from "react";
import Link from "next/link";

export default function DocsPage() {
  const { t } = useLanguage();
  return (
<main className="max-w-4xl mx-auto py-16 px-4">
      <div className="landing-eyebrow">{t("misc.docsGuides")}</div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t("auth.docsTitle")}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Benvenuto nella documentazione ufficiale di Taskly. Qui trovi guide,
        tutorial e riferimenti alle funzionalità principali.
      </p>

      <section className="space-y-4">
        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("auth.docsQuickTitle")}</h2>
          <p className="text-gray-600 dark:text-gray-400">Introduzione all&apos;uso di Taskly.</p>
        </div>

        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("auth.docsApiTitle")}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t("auth.docsApiBody")}</p>
        </div>

        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("land.faqEyebrow")}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t("auth.docsFaqBody")}</p>
        </div>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm text-[#7b39fc] dark:text-[#a67cff] hover:underline">{t("auth.backToHome")}</Link>
      </div>
    </main>
  );
}
