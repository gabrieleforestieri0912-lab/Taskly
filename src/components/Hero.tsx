"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

function Hero({ onStart, onDiscover }) {
  const { t } = useLanguage();

  return (
    <section className="relative flex min-h-[115vh] flex-col items-center justify-start overflow-hidden pt-28">
      {/* Hero content */}
      <div className="relative z-10 mx-auto mt-0 flex w-full max-w-[900px] flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Headline */}
          <h1 className="font-inter text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-gray-900 dark:text-white sm:text-7xl lg:text-[72px]">
            {t("land.heroTitlePrefix")}{" "}
            <span className="text-[#7b39fc] dark:text-[#a67cff]">
              {t("land.heroTitleAccent")}
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-[662px] font-inter text-lg font-normal leading-[1.75] tracking-[-0.011em] text-gray-600 dark:text-white/75">
            {t("land.heroSubtitle")}
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onDiscover}
              className="font-inter inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-[#7b39fc] px-8 text-base font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-[#8b4dff]"
            >
              {t("land.heroCtaDemo")}
            </button>
            <button
              type="button"
              onClick={onStart}
              className="font-inter inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-gray-900 px-8 text-base font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {t("land.heroCtaStart")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
