"use client";

import React from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

function Hero({ onStart, onDiscover }) {
  // Ken Burns effect: slow zoom on the video driven by page scroll
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 900], [1, 1.18]);
  const smoothScale = useSpring(scale, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  return (
    <section className="relative flex min-h-[115vh] flex-col items-center justify-center overflow-hidden">
      {/* Video background */}
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        style={{ scale: smoothScale }}
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </motion.video>

      {/* Blend overlays: tint the video and fade it into the page */}
      <div
        className="absolute inset-0 bg-[#0f0b1f]/45 dark:bg-[#0a0716]/55"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#7b39fc]/20 via-[#7b39fc]/5 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0a0716]/90 to-transparent"
        aria-hidden="true"
      />
      {/* Bottom fade that blends the video into the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/50"
        aria-hidden="true"
      />

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
            className="mb-8 inline-flex h-[38px] items-center gap-2.5 rounded-[10px] border px-3 font-inter text-sm font-medium text-white"
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
          <h1 className="font-instrument-serif text-5xl leading-[1.05] tracking-[-0.02em] text-white md:text-7xl lg:text-[96px]">
            Organizza il tuo lavoro istantaneamente{" "}
            <em className="mx-1 font-instrument-serif italic">e</em> senza stress
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-[662px] font-inter text-lg font-normal leading-[1.75] tracking-[-0.011em] text-white/75">
            Task, note, calendario e obiettivi in un unico workspace intelligente.
            Pianifica con chiarezza, collabora in tempo reale e lascia che l&apos;AI
            ti aiuti ogni giorno.
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
