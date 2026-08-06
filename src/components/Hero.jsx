"use client";

import React from "react";
import { motion } from "framer-motion";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

function Hero({ onStart, onDiscover }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full min-h-screen w-full object-cover"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>

      {/* Hero content */}
      <div className="relative z-10 mx-auto mt-32 flex w-full max-w-[900px] flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Tagline pill */}
          <div
            className="mb-8 inline-flex h-[38px] items-center gap-2.5 rounded-[10px] border px-3 font-cabin text-sm font-medium text-white"
            style={{
              background: "rgba(85, 80, 110, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(164, 132, 215, 0.5)",
            }}
          >
            <span className="rounded-[6px] bg-[#7b39fc] px-2 py-0.5 text-xs font-semibold leading-none">
              New
            </span>
            <span>Dì ciao a Taskly v3.2</span>
          </div>

          {/* Headline */}
          <h1 className="font-instrument-serif text-5xl leading-[1.1] text-white md:text-7xl lg:text-[96px]">
            Organizza il tuo lavoro istantaneamente{" "}
            <em className="mx-1 font-instrument-serif italic">e</em> senza stress
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-[662px] font-inter text-lg font-normal leading-relaxed text-white/70">
            Task, note, calendario e obiettivi in un unico workspace intelligente.
            Pianifica con chiarezza, collabora in tempo reale e lascia che l&apos;AI
            ti aiuti ogni giorno.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onDiscover}
              className="font-cabin inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-[#7b39fc] px-8 text-base font-medium text-white transition-colors hover:bg-[#8b4dff]"
            >
              Prenota una demo gratuita
            </button>
            <button
              type="button"
              onClick={onStart}
              className="font-cabin inline-flex h-[52px] min-w-[200px] items-center justify-center rounded-[10px] bg-[#2b2344] px-8 text-base font-medium text-[#f6f7f9] transition-colors hover:bg-[#3a3058]"
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
