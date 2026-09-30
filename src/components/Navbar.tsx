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
import { AnimatePresence, motion } from "framer-motion";
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
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || "";
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const isLanding = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");

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

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
  const scrollToHash = (href) => (e) => {
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

  /* ── Landing floating navbar ─────────────────────────────────── */
  if (isLanding && !isDashboard) {
    // Barra fissa a tutta larghezza: niente effetto "floating" ne' animazione
    // allo scroll, la superficie e' sempre la stessa.
    const barSurface =
      "h-16 border-b border-[#7b39fc]/15 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#120d20]/90";

    const menuItem =
      "group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-[#7b39fc]/10 hover:text-gray-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white";

    return (
      <>
        <header className="sticky top-0 z-50">
          <nav
            className={`mx-auto flex w-full items-center justify-between px-4 sm:px-6 ${barSurface}`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-full px-2 transition-opacity hover:opacity-85"
            >
              <SiteLogo />
              <span className="font-inter text-lg font-semibold text-gray-900 dark:text-white">{t("land.cmpHeaderTaskly")}</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden flex-1 items-center justify-center gap-1 lg:flex min-w-0">
              {landingNavLinks.map((link) => (
                <div
                  key={link.key}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown && setOpenMenu(link.key)
                  }
                  onMouseLeave={() => setOpenMenu((k) => (k === link.key ? null : k))}
                >
                  {link.hasDropdown ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu((k) => (k === link.key ? null : link.key))
                      }
                      className={menuItem}
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
                        className="absolute left-0 top-full z-50 mt-3 w-[300px] origin-top overflow-hidden rounded-2xl border border-[#7b39fc]/15 bg-white/95 p-1.5 shadow-[0_24px_70px_rgba(15,10,30,0.18)] dark:border-white/12 dark:bg-[#120d20]/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
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

              <Link
                href="/docs"
                className={menuItem}
              >{t("auth.docsTitle")}</Link>
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
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
                          className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-[#7b39fc]/15 bg-white/95 p-1.5 shadow-[0_24px_70px_rgba(15,10,30,0.18)] dark:border-white/12 dark:bg-[#120d20]/95 dark:shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                        >
                          <div className="border-b border-gray-200/70 p-4 dark:border-white/10">
                            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 dark:text-white/50">
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
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
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
                    className="font-inter inline-flex h-9 items-center justify-center rounded-full border border-[#7b39fc]/25 bg-[#7b39fc]/5 px-5 text-sm font-semibold text-gray-800 dark:border-white/20 dark:bg-white/5 dark:text-white backdrop-blur-md transition-all duration-300 hover:border-[#7b39fc]/60 hover:bg-[#7b39fc]/15"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="font-inter inline-flex h-9 items-center justify-center rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(123,57,252,0.35)] transition-all duration-300 hover:bg-[#8b4dff] hover:shadow-[0_10px_32px_rgba(123,57,252,0.5)]"
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-[#7b39fc]/10 lg:hidden dark:text-white dark:hover:bg-white/10"
              aria-label={t("land.demoMenu")}
            >
              <Menu size={22} />
            </button>
          </nav>
        </header>

        {/* Full-screen mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 flex flex-col bg-black px-6 py-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <SiteLogo />
                  <span className="font-inter text-lg font-semibold text-gray-900 dark:text-white">{t("land.cmpHeaderTaskly")}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center text-white"
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
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-inter text-2xl font-medium text-white"
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
                              <div className="mt-1 flex flex-col gap-1 rounded-2xl bg-white/5 p-2">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.name}
                                    href={child.href}
                                    onClick={scrollToHash(child.href)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80"
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
                        className="block rounded-xl px-3 py-2.5 font-inter text-2xl font-medium text-white"
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}

                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-inter text-2xl font-medium text-white"
                >{t("auth.docsTitle")}</Link>
              </nav>

              {!user && (
                <div className="mt-auto flex flex-col gap-3 pb-8">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center rounded-full border border-[#7b39fc]/40 bg-[#7b39fc]/10 text-sm font-semibold text-[#a67cff]"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center rounded-full bg-[#7b39fc] text-sm font-semibold text-[#fafafa]"
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
                    className="font-inter inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#7b39fc] text-sm font-semibold text-[#fafafa]"
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
                    className="font-inter inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-white"
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
    "border-b border-[#7b39fc]/15 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#120d20]/90";

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] dark:text-gray-400 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]";

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`flex h-16 w-full items-center justify-between px-4 sm:px-6 ${surfaceClass}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {isDashboard && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#7b39fc]/20 bg-white text-gray-600 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] hover:scale-105 dark:border-[#a484d7]/20 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
              aria-label={t("land.navOpenSidebar")}
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {isDashboard && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#7b39fc]/20 bg-white text-gray-600 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] hover:scale-105 dark:border-[#a484d7]/20 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
              aria-label={t("land.navCloseSidebar")}
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#7b39fc]/20 bg-white px-2.5 pl-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] hover:border-[#7b39fc]/40 dark:border-[#a484d7]/15 dark:bg-white/7 dark:text-gray-200 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
              >
                <span className="hidden max-w-32.5 truncate sm:block">
                  {user.name}
                </span>
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover shrink-0 border border-[#7b39fc]/15"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#7b39fc] text-white shadow-sm">
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
                    className="absolute left-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200/30 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111414e6]"
                  >
                    <div className="border-b border-gray-200/30 p-4 dark:border-white/10">
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
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <LayoutDashboard size={17} />
                        {t("dashboard")}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <Settings size={17} />
                        {t("settings")}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/8"
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
              <span className="font-inter text-[17px] font-bold tracking-[-0.02em] text-gray-950 dark:text-white">{t("land.cmpHeaderTaskly")}</span>
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
                onMouseLeave={() =>
                  setOpenMenu((k) => (k === group.key ? null : k))
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((k) => (k === group.key ? null : group.key))
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-gray-500 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] dark:text-gray-400 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
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
                      className="absolute left-0 top-full z-50 mt-3 w-[300px] origin-top overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#111414f2]"
                    >
                      {group.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <a
                            key={child.name}
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 hover:bg-[#7b39fc]/10 dark:hover:bg-[#7b39fc]/15"
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
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#d4d4d4] bg-white px-3.5 text-sm font-semibold text-[#171717] transition-opacity hover:opacity-90"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#7b39fc] px-5 text-sm font-semibold text-[#fafafa] shadow-sm transition-colors hover:bg-[#8b4dff]"
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
            className="mx-auto mt-2.5 max-w-7xl overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-2xl pointer-events-auto dark:border-white/10 dark:bg-[#111414e6]"
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
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-2 dark:border-white/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d4d4d4] text-sm font-semibold text-[#171717]"
                >{t("auth.signIn")}</Link>
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
