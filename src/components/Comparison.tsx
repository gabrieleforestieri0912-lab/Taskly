"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Zap, Scale } from "lucide-react";

/**
 * Confronto profondo con Notion / ClickUp / Trello.
 *
 * Regola di contenuto: i limiti citati per i competitor sono qualitativi e
 * ampiamente documentati pubblicamente (setup iniziale di Notion, gerarchia
 * e rizoma di opzioni di ClickUp, kanban "piatto" di Trello). NESSUN dato
 * numerico inventato: le pagine di questo progetto non contengono metriche
 * d'uso finte. Le risposte Taskly citano SOLO funzioni reali del prodotto
 * (pagine a blocchi incorporati, dashboard analitica pronta, widget cliccati,
 * AI inclusa con crediti). La nota finale invita a verificarlo nella demo.
 */

type Symbol = "full" | "half" | "none";

const SYMBOL_CHAR: Record<Symbol, string> = {
  full: "●",
  half: "◐",
  none: "○",
};

const SYMBOL_COLOR: Record<Symbol, string> = {
  full: "text-(--accent) dark:text-(--accent-300)",
  half: "text-amber-500",
  none: "text-gray-300 dark:text-gray-600",
};

export default function Comparison() {
  const { t } = useLanguage();

  const competitors = [
    {
      name: "Notion",
      initial: "N",
      strength: t("land.cxNotionStrength"),
      pains: [t("land.cxNotion1"), t("land.cxNotion2"), t("land.cxNotion3")],
      answer: t("land.cxNotionAnswer"),
    },
    {
      name: "ClickUp",
      initial: "C",
      strength: t("land.cxClickupStrength"),
      pains: [t("land.cxClickup1"), t("land.cxClickup2"), t("land.cxClickup3")],
      answer: t("land.cxClickupAnswer"),
    },
    {
      name: "Trello",
      initial: "T",
      strength: t("land.cxTrelloStrength"),
      pains: [t("land.cxTrello1"), t("land.cxTrello2")],
      answer: t("land.cxTrelloAnswer"),
    },
  ];

  // Celle matrice: Taskly | Notion | ClickUp | Trello.
  // Valutazioni qualitative e dichiarate: vedi legenda.
  const matrix: { label: string; cells: [Symbol, Symbol, Symbol, Symbol] }[] = [
    {
      label: t("land.cxM1Label"),
      cells: ["full", "half", "none", "half"],
    },
    {
      label: t("land.cxM2Label"),
      cells: ["full", "half", "half", "none"],
    },
    {
      label: t("land.cxM3Label"),
      cells: ["full", "none", "none", "none"],
    },
    {
      label: t("land.cxM4Label"),
      cells: ["full", "none", "none", "none"],
    },
    {
      label: t("land.cxM5Label"),
      cells: ["full", "half", "none", "full"],
    },
  ];

  const legend: [Symbol, string][] = [
    ["full", t("land.cxLegendFull")],
    ["half", t("land.cxLegendHalf")],
    ["none", t("land.cxLegendNone")],
  ];

  return (
    <section className="landing-section landing-section-surface px-4 py-24 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">
            <Scale size={12} />
            {t("land.cmpEyebrow")}
          </div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.cmpTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.cmpTitleAccent")}</span>
            {t("land.cmpTitleSuffix")}
          </h2>
          <p className="landing-body mx-auto mt-4 max-w-2xl">
            {t("land.cxIntro")}
          </p>
        </div>

        {/* Card per competitor: punto di forza dichiarato + dolori concreti +
            risposta puntuale di Taskly (solo funzioni reali). */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {competitors.map((c) => (
            <div
              key={c.name}
              className="flex flex-col rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
            >
              {/* Nome */}
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gray-900 text-sm font-black text-white dark:bg-white dark:text-gray-900">
                  {c.initial}
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  {c.name}
                </h3>
              </div>

              {/* Punto di forza: dichiarato per onestà del confronto */}
              <p className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
                <span>{c.strength}</span>
              </p>

              {/* Dolori concreti */}
              <p className="mt-6 text-[11px] font-black uppercase tracking-[0.14em] text-rose-600 dark:text-rose-400">
                {t("land.cxPainsLabel")}
              </p>
              <ul className="mt-3 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                {c.pains.map((pain) => (
                  <li key={pain} className="flex items-start gap-2">
                    <XCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                    <span>{pain}</span>
                  </li>
                ))}
              </ul>

              {/* Risposta Taskly */}
              <div className="mt-auto pt-6">
                <div className="rounded-2xl border border-(--accent)/25 bg-(--accent)/5 p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-(--accent) dark:text-(--accent-300)">
                    <Zap size={13} />
                    {t("land.cxAnswerLabel")}
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">{c.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Matrice qualitativa con legenda dichiarata */}
        <div className="mt-16">
          <h3 className="text-center text-lg font-black text-gray-900 dark:text-white">
            {t("land.cxMatrixTitle")}
          </h3>

          <div className="mt-6 overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-2xl border border-(--accent)/10 dark:border-white/10">
              {/* Header */}
              <div className="grid grid-cols-[1.9fr_1fr_1fr_1fr_1fr] bg-gray-50 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.08em] text-gray-500 dark:text-gray-300 sm:text-xs">
                <div className="p-4">{t("land.cxColAspect")}</div>
                <div className="p-4 text-center text-(--accent) dark:text-(--accent-300)">Taskly</div>
                <div className="p-4 text-center">Notion</div>
                <div className="p-4 text-center">ClickUp</div>
                <div className="p-4 text-center">Trello</div>
              </div>

              {matrix.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.9fr_1fr_1fr_1fr_1fr] border-t border-(--accent)/10 dark:border-white/10"
                >
                  <div className="p-3 text-xs font-bold text-gray-900 dark:text-gray-100 sm:p-4 sm:text-sm">
                    {row.label}
                  </div>
                  {row.cells.map((cell, i) => (
                    <div key={i} className="flex items-center justify-center p-3 text-lg sm:p-4">
                      <span
                        className={SYMBOL_COLOR[cell]}
                        role="img"
                        aria-label={t(
                          cell === "full"
                            ? "land.cxLegendFull"
                            : cell === "half"
                              ? "land.cxLegendHalf"
                              : "land.cxLegendNone",
                        )}
                        title={t(
                          cell === "full"
                            ? "land.cxLegendFull"
                            : cell === "half"
                              ? "land.cxLegendHalf"
                              : "land.cxLegendNone",
                        )}
                      >
                        {SYMBOL_CHAR[cell]}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            {legend.map(([sym, text]) => (
              <span key={text} className="inline-flex items-center gap-1.5">
                <span className={`text-sm ${SYMBOL_COLOR[sym]}`}>{SYMBOL_CHAR[sym]}</span>
                {text}
              </span>
            ))}
          </div>

          {/* Nota di onestà */}
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-gray-400 dark:text-gray-500">
            {t("land.cxFootnote")}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            {t("land.heroCtaStart")}
          </Link>
        </div>
      </div>
    </section>
  );
}
