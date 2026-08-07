"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

const COLUMNS = [
  {
    title: "Prodotto",
    links: [
      { label: "Funzionalità", href: "/#features" },
      { label: "Prezzi", href: "/#pricing" },
      { label: "Template", href: "/templates" },
      { label: "Integrazioni", href: "/integrations" },
      { label: "Trascrizioni", href: "/transcription" },
    ],
  },
  {
    title: "Risorse",
    links: [
      { label: "Documentazione", href: "/docs" },
      { label: "Demo", href: "/#demo" },
      { label: "Come funziona", href: "/#getting-started" },
      { label: "FAQ", href: "/#faq" },
      { label: "Supporto", href: "/support" },
    ],
  },
  {
    title: "Azienda",
    links: [
      { label: "Contattaci", href: "/#contact" },
      { label: "Registrati", href: "/register" },
      { label: "Accedi", href: "/login" },
      { label: "Privacy", href: "/privacy" },
      { label: "Termini", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter / X" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative bg-[#f6f7f9] dark:bg-black text-gray-900 dark:text-gray-100 mt-auto overflow-hidden transition-colors duration-300 border-t border-[#7b39fc]/10 dark:border-white/5"
      role="contentinfo"
      aria-label="Footer"
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
              <svg
                viewBox="0 0 24 24"
                fill="#7b39fc"
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M1.04356 6.35771L13.6437 0.666504L23.3335 6.35771V17.6423L13.6437 23.3335L1.04356 17.6423V6.35771ZM12.5 4.2L4.5 8.5V15.5L12.5 19.8L20.5 15.5V8.5L12.5 4.2Z" />
              </svg>
              <span className="text-2xl font-extrabold tracking-tight text-gradient-brand">
                Taskly
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Organizza il tuo tempo, riduci il rumore e rimani concentrato su
              ciò che conta. Il tuo workspace intelligente per task, note,
              obiettivi e riunioni.
            </p>

            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:info@taskly.com"
                className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 transition-colors hover:text-[#7b39fc] dark:hover:text-[#a67cff]"
              >
                <Mail size={15} className="shrink-0 text-[#7b39fc]/70" />
                info@taskly.com
              </a>
              <a
                href="tel:+390234567890"
                className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 transition-colors hover:text-[#7b39fc] dark:hover:text-[#a67cff]"
              >
                <Phone size={15} className="shrink-0 text-[#7b39fc]/70" />
                +39 02 3456 7890
              </a>
              <span className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={15} className="shrink-0 text-[#7b39fc]/70" />
                Milano, Italia
              </span>
            </div>

            <div className="mt-6 flex items-center gap-2" aria-label="Social links">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
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
              <ul className="mt-5 space-y-3 text-sm">
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
            © {new Date().getFullYear()} Taskly. Tutti i diritti riservati.
          </p>

          <div className="flex items-center gap-6 text-xs">
            <Link
              href="/privacy"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              Termini
            </Link>
            <Link
              href="/docs"
              className="text-gray-400 transition-colors hover:text-[#7b39fc] dark:text-gray-500 dark:hover:text-[#a67cff]"
            >
              Documentazione
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Tutti i sistemi operativi
          </div>
        </div>
      </div>
    </footer>
  );
}
