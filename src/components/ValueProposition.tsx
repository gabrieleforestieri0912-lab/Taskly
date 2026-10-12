"use client";

import { useLanguage } from "../lib/LanguageContext";
import React from "react";
import Link from "next/link";
import { Layers, ListChecks, NotebookPen } from "lucide-react";
import { motion } from "framer-motion";

export default function ValueProposition() {
  const { t } = useLanguage();
  const items = [
    {
      icon: Layers,
      title: t("land.vpCard1Title"),
      text: t("land.vpCard1Text"),
    },
    {
      icon: ListChecks,
      title: t("land.vpCard2Title"),
      text: t("land.vpCard2Text"),
    },
    {
      icon: NotebookPen,
      title: t("land.vpCard3Title"),
      text: t("land.vpCard3Text"),
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="landing-section-surface px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">{t("land.vpEyebrow")}</div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.vpTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.vpTitleAccent")}</span>
          </h2>
          <p className="landing-body mt-3">
            {t("land.vpSubtitle")}
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid md:grid-cols-3 gap-5"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="landing-card"
              >
                <div className="landing-icon-wrap">
                  <Icon size={20} />
                </div>
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.text}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">{t("land.vpCta")}</Link>
        </div>
      </div>
    </section>
  );
}
