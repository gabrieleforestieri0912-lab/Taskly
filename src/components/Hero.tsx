"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Clock, Users } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

function Hero({ onStart, onDiscover }) {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Stessa easing usata da ScrollReveal: l'ingresso del Hero deve
  // avere lo stesso ritmo del resto della pagina.
  const ease = [0.16, 1, 0.3, 1];
  const fadeUp = (delay = 0) => ({
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });

  const badges = [
    { icon: Clock, label: t("land.heroBadge1") },
    { icon: Sparkles, label: t("land.heroBadge2") },
    { icon: Users, label: t("land.heroBadge3") },
  ];

  return (
    <section className="landing-section-surface relative isolate flex min-h-[100vh] flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20">
      {/* ── Sfondo: aurora + griglia + luce calda ──────────────────
          Tre strati sovrapposti danno profondità senza sporcare il
          bianco: aurora viola in alto, griglia tecnica al centro,
          alone caldo in basso a destra. */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {/* aurora principale */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1100px 620px at 50% -8%, rgba(123,57,252,0.20), transparent 62%)," +
              "radial-gradient(760px 480px at 88% 12%, rgba(166,124,255,0.16), transparent 60%)," +
              "radial-gradient(700px 520px at 6% 78%, rgba(139,77,255,0.10), transparent 62%)",
          }}
        />
        {/* alone caldo (colore secondario) per spezzare il monocromatismo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(620px 420px at 78% 92%, rgba(56,189,248,0.12), transparent 62%)",
          }}
        />
        {/* griglia tecnica, sfumata verso il basso */}
        <div
          className="absolute inset-0 opacity-[0.55] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(123,57,252,0.07) 1px, transparent 1px)," +
              "linear-gradient(to bottom, rgba(123,57,252,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 78%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, #000 40%, transparent 78%)",
          }}
        />
        {/* bordo inferiore netto: separa l'hero dalla sezione successiva */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7b39fc]/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col items-center text-center">
        <motion.div {...fadeUp(0)} className="flex flex-col items-center">
          {/* Eyebrow */}
          <span className="landing-eyebrow mb-7">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t("land.heroEyebrow")}
          </span>

          {/* Headline con accento in gradiente */}
          <h1 className="font-inter text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-gray-900 dark:text-white sm:text-7xl lg:text-[72px]">
            {t("land.heroTitlePrefix")}{" "}
            <span className="bg-gradient-to-r from-[#7b39fc] via-[#8b4dff] to-[#a67cff] bg-clip-text text-transparent">
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
              onClick={onStart}
              className="landing-btn-primary group gap-2"
            >
              {t("land.heroCtaStart")}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={onDiscover}
              className="landing-btn-secondary"
            >
              {t("land.heroCtaDemo")}
            </button>
          </div>

          {/* Social proof */}
          <p className="mt-6 text-xs font-medium tracking-wide text-gray-500 dark:text-white/50">
            {t("land.heroProof")}
          </p>
        </motion.div>

        {/* Badge di valore: entrano in sequenza, stesso effetto di fade-up */}
        <motion.ul
          {...fadeUp(0.25)}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {badges.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-[#7b39fc]/15 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7b39fc]/35 hover:shadow-md hover:shadow-[#7b39fc]/10 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-[#a67cff]/40"
            >
              <Icon className="h-3.5 w-3.5 text-[#7b39fc] dark:text-[#a67cff]" aria-hidden="true" />
              {label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

export default Hero;
