"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
  Youtube,
} from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";

const SOCIALS = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const { t } = useLanguage();
  const COLUMNS = [
    {
      title: t("land.footerColProduct"),
      links: [
        { label: t("land.footerLinkFeatures"), href: "/#features" },
        { label: t("land.footerLinkPricing"), href: "/#pricing" },
        { label: t("land.footerLinkTemplates"), href: "/templates" },
        { label: t("land.footerLinkIntegrations"), href: "/integrations" },
        { label: t("land.footerLinkTranscriptions"), href: "/transcription" },
      ],
    },
    {
      title: t("land.footerColResources"),
      links: [
        { label: t("land.footerLinkDocs"), href: "/docs" },
        { label: t("land.footerLinkDemo"), href: "/#demo" },
        { label: t("land.footerLinkHow"), href: "/#getting-started" },
        { label: t("land.footerLinkFaq"), href: "/#faq" },
        { label: t("land.footerLinkSupport"), href: "/support" },
      ],
    },
    {
      title: t("land.footerColCompany"),
      links: [
        { label: t("land.footerLinkContact"), href: "/#contact" },
        { label: t("land.footerLinkRegister"), href: "/register" },
        { label: t("land.footerLinkLogin"), href: "/login" },
        { label: t("land.footerLinkPrivacy"), href: "/privacy" },
        { label: t("land.footerLinkTerms"), href: "/terms" },
      ],
    },
  ];
  return (
    <footer
      id="contact"
      className="relative bg-[#f6f7f9] dark:bg-black text-gray-900 dark:text-gray-100 mt-auto overflow-hidden transition-colors duration-300 border-t border-[#7b39fc]/10 dark:border-white/5"
      role="contentinfo"
      aria-label={t("land.footerAria")}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="h-40 w-[700px] max-w-full rounded-full bg-[#7b39fc]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <Image
                src="/taskly.png"
                alt={t("land.footerLogoAlt")}
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-2xl font-extrabold tracking-tight text-gradient-brand">
                Taskly
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t("land.footerTagline")}
            </p>

            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:gabriele.forestieri0912@gmail.com"
                className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 transition-colors hover:text-[#7b39fc] dark:hover:text-[#a67cff]"
              >
                <Mail size={15} className="shrink-0 text-[#7b39fc]/70" />
                gabriele.forestieri0912@gmail.com
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2" aria-label={t("land.footerSocialAria")}>
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[#7b39fc]/10 bg-white text-gray-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7b39fc]/40 hover:text-[#7b39fc] hover:shadow-lg hover:shadow-[#7b39fc]/15 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-[#a67cff]"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3 text-base">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-gray-600 transition-colors hover:text-[#7b39fc] dark:text-gray-300 dark:hover:text-[#a67cff]"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter removed - footer keeps only navigation links */}
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-gray-100 bg-white/40 dark:border-white/5 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {t("land.footerRights").replace("{year}", String(new Date().getFullYear()))}
          </p>

          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/privacy"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              {t("land.footerLinkPrivacy")}
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              {t("land.footerLinkTerms")}
            </Link>
            <Link
              href="/docs"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              {t("land.footerBottomDocs")}
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {t("land.footerStatus")}
          </div>
        </div>
      </div>
    </footer>
  );
}
