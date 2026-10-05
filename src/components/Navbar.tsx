/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  PanelLeftOpen,
  PanelLeftClose,
  PlayCircle,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

function SiteLogo({ size = 28 }: { size?: number }) {
  const { t, tWith } = useLanguage();
  return (
    <Image
      src="/taskly.png"
      alt={t("land.cmpHeaderTaskly")}
      width={size}
      height={size}
      className="shrink-0 rounded-lg object-cover"
      priority
    />
  );
}

export default function Navbar({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || "";
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const shouldReduceMotion = useReducedMotion();

  const isLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

  // Navbar "floating": l'ombra si rinforza appena si scrolla, così la pillola
  // si stacca dal contenuto che passa dietro. `false` iniziale = stesso valore
  // in SSR, niente mismatch di idratazione.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  const landingNavLinks = [
    { name: "Home", href: "#", key: "home" },
    {
      name: "Funzionalità",
      href: "#features",
      key: "features",
      hasDropdown: true,
      children: [
        {
          name: t("howItWorks"),
          href: "#getting-started",
          desc: "Scopri il flusso di lavoro passo dopo passo",
          icon: Map,
        },
        {
          name: t("demo"),
          href: "#demo",
          desc: "Guarda Taskly in azione dal vivo",
          icon: PlayCircle,
        },
        {
          name: "Use Cases",
          href: "#use-cases",
          desc: "Casi d'uso per team, freelancer e studenti",
          icon: Users,
        },
        {
          name: "Confronto",
          href: "#comparison",
          desc: "Taskly a confronto con altri strumenti",
          icon: Scale,
        },
      ],
    },
    {
      name: "Recensioni",
      href: "#social-proof",
      key: "reviews",
      hasDropdown: true,
      children: [
        {
          name: "Testimonianze",
          href: "#social-proof",
          desc: "Cosa dicono i nostri utenti",
          icon: Star,
        },
        {
          name: t("pricing"),
          href: "#pricing",
          desc: "Piani flessibili per ogni esigenza",
          icon: Sparkles,
        },
        {
          name: t("faq"),
          href: "#faq",
          desc: "Risposte alle domande più comuni",
          icon: CircleHelp,
        },
      ],
    },
    { name: "Contattaci", href: "#faq", key: "contact" },
  ];

  const navLinks = [
    { name: t("features"), href: "#features" },
    { name: t("howItWorks"), href: "#getting-started" },
    { name: t("demo"), href: "#demo" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("faq"), href: "#faq" },
  ];

  // Gruppi con dropdown per la navbar delle pagine interne (stesse sezioni della landing)
  const groupedNavLinks = [
    {
      name: "Funzionalità",
      key: "features",
      children: [
        {
          name: t("howItWorks"),
          href: "#getting-started",
          desc: "Scopri il flusso di lavoro passo dopo passo",
          icon: Map,
        },
        {
          name: t("demo"),
          href: "#demo",
          desc: "Guarda Taskly in azione dal vivo",
          icon: PlayCircle,
        },
        {
          name: "Use Cases",
          href: "#use-cases",
          desc: "Casi d'uso per team, freelancer e studenti",
          icon: Users,
        },
        {
          name: "Confronto",
          href: "#comparison",
          desc: "Taskly a confronto con altri strumenti",
          icon: Scale,
        },
      ],
    },
    {
      name: "Risorse",
      key: "resources",
      children: [
        {
          name: "Testimonianze",
          href: "#social-proof",
          desc: "Cosa dicono i nostri utenti",
          icon: Star,
        },
        {
          name: t("pricing"),
          href: "#pricing",
          desc: "Piani flessibili per ogni esigenza",
          icon: Sparkles,
        },
        {
          name: t("faq"),
          href: "#faq",
          desc: "Risposte alle domande più comuni",
          icon: CircleHelp,
        },
      ],
    },
  ];

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) setTimeout(() => setUser(JSON.parse(savedUser)), 0);
    } catch {
      setTimeout(() => setUser(null), 0);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen && isLanding ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, isLanding]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  };

  // Smooth-scroll to an in-page section for landing hash links
  const scrollToHash = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const id = href?.replace(/^#/, "").trim();
    if (id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpenMenu(null);
    setMobileMenuOpen(false);
  };

  /* ── Landing navbar ──────────────────────────────────────────── */
  if (isLanding && !isDashboard) {
    const barSurface = scrolled
      ? "border-gray-200 bg-white/95 shadow-md dark:border-gray-800 dark:bg-black/95"
      : "border-transparent bg-white dark:border-transparent dark:bg-black";

    const menuItem =
      "group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-white/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white";

    const navButtonClass =
      "group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-white/60 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc]/40";

    return (
      <>
        <motion.header
          initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${barSurface}`}
        >
          <nav
            className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 transition-[height] duration-300 sm:px-6 lg:px-10 ${
              scrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-full px-2 transition-opacity hover:opacity-85"
            >
              <SiteLogo />
              <span className="font-inter text-lg font-semibold text-gray-900 dark:text-white">
                {t("land.cmpHeaderTaskly")}
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex">
              {landingNavLinks.map((link) => (
                <div
                  key={link.key}
                  className="relative"
                  onMouseEnter={() => (link.hasDropdown ? setOpenMenu(link.key) : null)}
                  onMouseLeave={() => setOpenMenu((k) => (k === link.key ? null : k))}
                >
                  {link.hasDropdown ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((k) => (k === link.key ? null : link.key))
                      }
                      className={navButtonClass}
                    >
                      {link.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          openMenu === link.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      onClick={scrollToHash(link.href)}
                      className={menuItem}
                    >
                      {link.name}
                    </Link>
                  )}

                  <AnimatePresence>
                    {link.hasDropdown && openMenu === link.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-full z-50 mt-3 w-[300px] origin-top overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-black"
                      >
                        {link.children.map((child) => {
                          const Icon = child.icon;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={scrollToHash(child.href)}
                              className="flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 hover:bg-[#7b39fc]/15"
                            >
                              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#7b39fc]/15 text-[#a67cff]">
                                <Icon size={17} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                  {child.name}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-gray-500 dark:text-white/55">
                                  {child.desc}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <Link href="/docs" className={navButtonClass}>
                {t("auth.docsTitle")}
              </Link>
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 xl:flex">
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard"
                    className="font-inter inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(123,57,252,0.35)] transition-all duration-300 hover:bg-[#8b4dff] hover:shadow-[0_10px_32px_rgba(123,57,252,0.5)]"
                  >
                    <LayoutDashboard size={15} />
                    {t("dashboard")}
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((open) => !open)}
                      className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#7b39fc] text-white shadow-sm ring-2 ring-white/20 transition-colors hover:bg-[#8b4dff]"
                      aria-label={t("land.navAccountLabel")}
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="h-9 w-9 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User size={16} />
                      )}
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.97 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-black"
                        >
                          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                              {t("account")}
                            </div>
                            <div className="mt-1.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                              {user.email}
                            </div>
                          </div>
                          <div className="p-1.5">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <LogOut size={17} />
                              {t("logout")}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`font-inter inline-flex h-9 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800`}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="font-inter inline-flex h-9 items-center justify-center rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8b4dff]"
                  >
                    {t("start")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-[#7b39fc]/10 xl:hidden dark:text-white dark:hover:bg-white/10"
              aria-label={t("land.demoMenu")}
            >
              <Menu size={22} />
            </button>
          </nav>
        </motion.header>

        {/* Full-screen mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex flex-col bg-white/90 px-6 py-6 backdrop-blur-xl xl:hidden dark:bg-black/90 dark:backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <SiteLogo />
                  <span className="font-inter text-lg font-semibold text-gray-900 dark:text-white">
                    {t("land.cmpHeaderTaskly")}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                  aria-label={t("land.navCloseMenu")}
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="mt-12 flex flex-col gap-2">
                {landingNavLinks.map((link) => (
                  <div key={link.key}>
                    {link.hasDropdown ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((k) =>
                              k === `m-${link.key}` ? null : `m-${link.key}`,
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-inter text-xl font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5"
                        >
                          {link.name}
                          <ChevronDown
                            size={20}
                            className={`transition-transform duration-300 ${
                              openMenu === `m-${link.key}` ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {openMenu === `m-${link.key}` && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1 flex flex-col gap-1 rounded-2xl bg-white/60 p-2 dark:bg-white/5">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={scrollToHash(child.href)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200"
                                  >
                                    <child.icon size={16} className="text-[#a67cff]" />
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        key={link.key}
                        href={link.href}
                        onClick={scrollToHash(link.href)}
                        className="block rounded-xl px-3 py-2.5 font-inter text-xl font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5"
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}

                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-inter text-xl font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-white/5"
                >
                  {t("auth.docsTitle")}
                </Link>
              </nav>

              {!user && (
                <div className="mt-auto flex flex-col gap-3 pb-8">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center rounded-full border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8b4dff]"
                  >
                    {t("start")}
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-auto flex flex-col gap-3 pb-8">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8b4dff]"
                  >
                    <LayoutDashboard size={16} />
                    {t("dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="font-inter inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    <LogOut size={16} />
                    {t("logout")}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── Dashboard / scrolled landing navbar (legacy) ────────────── */
  const surfaceClass =
    "border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black";

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`flex h-16 w-full items-center justify-between px-4 sm:px-6 ${surfaceClass}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {isDashboard && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={t("land.navOpenSidebar")}
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {isDashboard && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={t("land.navCloseSidebar")}
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 pl-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-gray-600"
              >
                <span className="hidden max-w-32.5 truncate sm:block">
                  {user.name}
                </span>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover shrink-0 border border-gray-300 dark:border-gray-600"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7b39fc] text-white">
                    <User size={14} />
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-black"
                  >
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        {t("account")}
                      </div>
                      <div className="mt-1.5 truncate text-sm font-bold text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <LayoutDashboard size={17} />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Settings size={17} />
                        {t("settings")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <LogOut size={17} />
                        {t("logout")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <SiteLogo />
              <span className="font-inter text-[17px] font-bold tracking-[-0.02em] text-gray-950 dark:text-white">
                {t("land.cmpHeaderTaskly")}
              </span>
            </Link>
          )}
        </div>

        {!isDashboard && (
          <div className="hidden items-center gap-1 lg:flex">
            {groupedNavLinks.map((group) => (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => setOpenMenu(group.key)}
                onMouseLeave={() => setOpenMenu((k) => (k === group.key ? null : k))}
              >
                <button
                  type="button"
                  onClick={() => setOpenMenu((k) => (k === group.key ? null : group.key))}
                  className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {group.name}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      openMenu === group.key ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openMenu === group.key && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full z-50 mt-3 w-[300px] origin-top overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-black"
                    >
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <a
                            key={child.name}
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#7b39fc]/10 text-[#7b39fc] dark:bg-[#7b39fc]/15 dark:text-[#a67cff]">
                              <ChildIcon size={17} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                                {child.name}
                              </span>
                              <span className="mt-0.5 block text-xs leading-snug text-gray-500 dark:text-gray-400">
                                {child.desc}
                              </span>
                            </span>
                          </a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isDashboard && (
            <div className="shrink-0">
              <NotificationBell />
            </div>
          )}

          {!user && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7b39fc] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8b4dff]"
              >
                {t("start")}
              </Link>
            </div>
          )}

          {!isDashboard && (
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 md:hidden"
              aria-label={t("land.demoMenu")}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && !isDashboard && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2.5 max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-black"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300"
              >
                {link.name}
              </a>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-gray-300 text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white"
                >
                  {t("auth.signIn")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[#7b39fc] text-sm font-semibold text-white"
                >
                  Inizia
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
