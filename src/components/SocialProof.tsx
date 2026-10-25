"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";

/**
 * Sezione "social-proof" della landing (ancora #social-proof nel menu).
 * NO metriche inventate (utenti attivi, rating, task/week): carte puramente
 * descrittive di cosa offre il prodotto. Nessun logo di azienda finto.
 */
export default function SocialProof() {
  const { t } = useLanguage();
  const cards = [
    t("land.spStat1Label"),
    t("land.spStat2Label"),
    t("land.spStat3Label"),
  ];
  return (
    <section className="landing-section-surface px-6 py-20">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">{t("land.spEyebrow")}</p>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {cards.map((text) => (
            <div key={text} className="landing-stat-card">
              <p className="text-base font-bold text-gray-900 dark:text-white">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
