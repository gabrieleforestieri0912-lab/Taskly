"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

function Hero({ onStart, onDiscover }) {
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
            <h1 className="font-inter text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_2px_24px_rgba(123,57,252,0.25)] sm:text-7xl lg:text-[72px]">
              Organizza il tuo lavoro,{" "}
              <span className="bg-gradient-to-r from-[#a67cff] to-[#7b39fc] bg-clip-text text-transparent">
                senza stress
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-[662px] font-inter text-lg font-normal leading-[1.75] tracking-[-0.011em] text-white/75">
              Un unico workspace intelligente per task, note, calendario e
              obiettivi. Pianifica con chiarezza, collabora in tempo reale e lascia
              che l&apos;AI semplifichi ogni giornata.
            </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onDiscover}
              className="font-inter inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-[#7b39fc] px-8 text-base font-semibold tracking-[-0.01em] text-white transition-colors hover:bg-[#8b4dff]"
            >
              Prenota una demo gratuita
            </button>
            <button
              type="button"
              onClick={onStart}
              className="font-inter inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-[#2b2344] px-8 text-base font-semibold tracking-[-0.01em] text-[#f6f7f9] transition-colors hover:bg-[#3a3058]"
            >
              Inizia subito
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
