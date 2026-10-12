"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import { Layers, ListChecks, NotebookPen, Brain, Workflow, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const { t } = useLanguage();
  const features = [
    {
      icon: Layers,
      title: t("land.hiwCard1Title"),
      text: t("land.hiwCard1Text"),
    },
    {
      icon: ListChecks,
      title: t("land.hiwCard2Title"),
      text: t("land.hiwCard2Text"),
    },
    {
      icon: NotebookPen,
      title: t("land.hiwCard3Title"),
      text: t("land.hiwCard3Text"),
    },
    {
      icon: Brain,
      title: t("land.hiwCard4Title"),
      text: t("land.hiwCard4Text"),
    },
    {
      icon: Workflow,
      title: t("land.hiwCard5Title"),
      text: t("land.hiwCard5Text"),
    },
    {
      icon: Sparkles,
      title: t("land.hiwCard6Title"),
      text: t("land.hiwCard6Text"),
    },
  ];
  return (
    <section id="features" className="landing-section-surface py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="landing-eyebrow">{t("land.hiwEyebrow")}</div>
          <h2 className="landing-heading-lg text-gray-900 dark:text-white mb-4">
            {t("land.hiwTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.hiwTitleAccent")}</span>
          </h2>
          <p className="landing-body text-base max-w-2xl mx-auto">
            {t("land.hiwSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="landing-card hover:-translate-y-1"
              >
                <div className="landing-icon-wrap mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            {t("land.hiwCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
