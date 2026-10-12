"use client";
import React from "react";
import Link from "next/link";
import { GraduationCap, BriefcaseBusiness, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

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

export default function UseCases() {
  const { t } = useLanguage();
  const cases = [
    {
      title: t("land.ucCase1Title"),
      icon: GraduationCap,
      points: [t("land.ucCase1P1"), t("land.ucCase1P2"), t("land.ucCase1P3")],
    },
    {
      title: t("land.ucCase2Title"),
      icon: BriefcaseBusiness,
      points: [t("land.ucCase2P1"), t("land.ucCase2P2"), t("land.ucCase2P3")],
    },
    {
      title: t("land.ucCase3Title"),
      icon: Users,
      points: [t("land.ucCase3P1"), t("land.ucCase3P2"), t("land.ucCase3P3")],
    },
  ];
  return (
    <section className="px-6 py-20 bg-[#f6f7f9] dark:bg-[#1a1528]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="landing-eyebrow">
            {t("land.ucEyebrow")}
          </div>
          <h2 className="landing-heading-lg mt-3">
            {t("land.ucTitlePrefix")}{" "}
            <span className="landing-display-accent">{t("land.ucTitleAccent")}</span>
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 grid md:grid-cols-3 gap-5"
        >
          {cases.map((item) => {
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
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {item.points.map((point) => (
                    <li key={point}>- {point}</li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/register" className="landing-btn-primary">
            {t("land.ucCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
