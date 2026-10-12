"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";
import { TimerReset, Wrench, LayoutTemplate } from "lucide-react";

export default function GettingStarted() {
  const { t } = useLanguage();
  const steps = [
    {
      icon: TimerReset,
      title: t("land.gsStep1Title"),
      text: t("land.gsStep1Text"),
    },
    {
      icon: Wrench,
      title: t("land.gsStep2Title"),
      text: t("land.gsStep2Text"),
    },
    {
      icon: LayoutTemplate,
      title: t("land.gsStep3Title"),
      text: t("land.gsStep3Text"),
    },
  ];
  return (
    <section className="landing-section-surface px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">{t("land.gsEyebrow")}</div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.gsTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.gsTitleAccent")}</span>
          </h2>
          <p className="landing-body mt-3">{t("land.gsSubtitle")}</p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div key={step.title} className="landing-card">
              <div className="landing-icon-wrap">
                <step.icon size={20} />
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">{t("land.gsCta")}</Link>
        </div>
      </div>
    </section>
  );
}
