"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Container } from "./Container";
import { BoardMockup } from "./BoardMockup";
import { landingContent } from "@/content/landing";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { headline, headlineAccent, subheadline, ctaPrimary, ctaPrimaryHref, ctaSecondary, ctaSecondaryHref, reassurance } =
    landingContent.hero;

  const parts = headline.split(headlineAccent);
  const beforeAccent = parts[0] ?? "";
  const afterAccent = parts[1] ?? "";

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0e0e0e] pt-12 pb-10 lg:pt-20 lg:pb-16">
      {/* Sfondo gradiente tenue */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(1200px 600px at 50% -100px, rgba(123,57,252,0.12), transparent 60%), radial-gradient(800px 400px at 80% 20%, rgba(166,124,255,0.08), transparent 60%)",
        }}
      />

      <Container className="text-center">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="font-inter text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-gray-900 dark:text-white sm:text-5xl lg:text-[56px]">
            {beforeAccent}
            <span className="bg-gradient-to-r from-[#7b39fc] to-[#a67cff] bg-clip-text text-transparent">
              {headlineAccent}
            </span>
            {afterAccent}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={ctaPrimaryHref}
              className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-[#7b39fc] px-6 text-sm font-semibold text-white shadow-lg shadow-[#7b39fc]/20 transition-colors hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] focus-visible:ring-offset-2"
            >
              {ctaPrimary} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ctaSecondaryHref}
              className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc]"
            >
              <Play className="h-4 w-4" /> {ctaSecondary}
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{reassurance}</p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 lg:mt-14"
        >
          {/* alone dietro mockup */}
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-60 blur-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(123,57,252,0.15), rgba(166,124,255,0.12), transparent)",
              }}
              aria-hidden="true"
            />
            <BoardMockup />
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
