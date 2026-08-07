/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
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

function FutureLogo({ className = "text-white" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`h-7 w-7 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path d="M1.04356 6.35771L13.6437 0.666504L23.3335 6.35771V17.6423L13.6437 23.3335L1.04356 17.6423V6.35771ZM12.5 4.2L4.5 8.5V15.5L12.5 19.8L20.5 15.5V8.5L12.5 4.2Z" />
    </svg>
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
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    // Reveal the navbar only once the user scrolls past the hero
    // (hero is min-h-[115vh]), so it slides in instead of being
    // stuck at the very top.
    const handleScroll = () =>
      setIsScrolled(window.scrollY > window.innerHeight * 0.85);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

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
      window.removeEventListener("scroll", handleScroll);
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

  /* ── Landing floating navbar ─────────────────────────────────── */
  if (isLanding && !isDashboard) {
    const barSurface =
      isScrolled
        ? "bg-black/70 shadow-[0_18px_50px_rgba(0,0,0,0.45)] border-white/15"
        : "bg-black/35 border-white/10";

    const menuItem =
      "group inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white";

    return (
      <>
        <header
          className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
          style={{ pointerEvents: isScrolled ? "auto" : "none" }}
        >
          <motion.nav
            initial={false}
            animate={{ y: isScrolled ? 0 : -96, opacity: isScrolled ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`mx-auto flex h-16 max-w-5xl items-center justify-between rounded-2xl border px-3 backdrop-blur-2xl transition-all duration-500 sm:px-5 ${barSurface}`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-full px-2 transition-opacity hover:opacity-85"
            >
              <FutureLogo />
              <span className="font-inter text-lg font-semibold text-white">
                Taskly
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
              {landingNavLinks.map((link) => (
                <div
                  key={link.key}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown && setOpenMenu(link.key)
                  }
                  onMouseLeave={() => setOpenMenu((k) => (k === link.key ? null : k))}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((k) => (k === link.key ? null : link.key))
                    }
                    className={menuItem}
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          openMenu === link.key ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {link.hasDropdown && openMenu === link.key && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-full z-50 mt-3 w-[300px] origin-top overflow-hidden rounded-2xl border border-white/12 bg-[#120d20]/95 p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
                      >
                        {link.children.map((child, i) => {
                          const Icon = child.icon;
                          return (
                            <motion.a
                              key={child.name}
                              href={child.href}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.03 * i,
                                duration: 0.2,
                              }}
                              onClick={() => setOpenMenu(null)}
                              className="flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-colors duration-200 hover:bg-[#7b39fc]/15"
                            >
                              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#7b39fc]/15 text-[#a67cff]">
                                <Icon size={17} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-white">
                                  {child.name}
                                </span>
                                <span className="mt-0.5 block text-xs leading-snug text-white/55">
                                  {child.desc}
                                </span>
                              </span>
                            </motion.a>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <Link
                  href="/dashboard"
                  className="font-inter inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#7b39fc] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(123,57,252,0.35)] transition-all duration-300 hover:bg-[#8b4dff] hover:shadow-[0_10px_32px_rgba(123,57,252,0.5)]"
                >
                  <LayoutDashboard size={15} />
                  {t("dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="font-inter inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-[#7b39fc]/60 hover:bg-[#7b39fc]/15"
                  >
                    <LayoutDashboard size={15} />
                    {t("dashboard")}
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
          </motion.nav>
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
                  <FutureLogo />
                  <span className="font-inter text-lg font-semibold text-white">
                    Taskly
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center text-white"
                  aria-label="Chiudi menu"
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
                                  <a
                                    key={child.name}
                                    href={child.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80"
                                  >
                                    <child.icon size={16} className="text-[#a67cff]" />
                                    {child.name}
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        key={link.key}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-xl px-3 py-2.5 font-inter text-2xl font-medium text-white"
                      >
                        {link.name}
                      </a>
                    )}
                  </div>
                ))}
              </nav>

              {!user && (
                <div className="mt-auto flex flex-col gap-3 pb-8">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-inter inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#7b39fc]/40 bg-[#7b39fc]/10 text-sm font-semibold text-[#a67cff]"
                  >
                    <LayoutDashboard size={16} />
                    {t("dashboard")}
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
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── Dashboard / scrolled landing navbar (legacy) ────────────── */
  const surfaceClass =
    isScrolled || isDashboard
      ? "bg-white/90 shadow-[0_12px_44px_rgba(15,23,42,0.10)] backdrop-blur-xl border-[#dfdbea] dark:bg-[#0f1212]/90 dark:shadow-[0_12px_44px_rgba(0,0,0,0.30)] dark:border-white/[0.07]"
      : "border-[#d6d4de]/60 bg-white/55 backdrop-blur-md dark:border-white/[0.06] dark:bg-black/18";

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] dark:text-gray-400 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]";

  const linkBtn =
    "rounded-lg px-3.5 py-2 text-[13px] font-semibold text-gray-500 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] dark:text-gray-400 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5 pointer-events-none">
      <nav
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-xl border px-5 transition-all duration-300 pointer-events-auto sm:px-6 ${surfaceClass}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {isDashboard && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#7b39fc]/20 bg-white text-gray-600 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] hover:scale-105 dark:border-[#a484d7]/20 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
              aria-label="Apri menu laterale"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {isDashboard && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#7b39fc]/20 bg-white text-gray-600 transition-all duration-200 hover:bg-[#7b39fc]/10 hover:text-[#7b39fc] hover:scale-105 dark:border-[#a484d7]/20 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-[#7b39fc]/15 dark:hover:text-[#a67cff]"
              aria-label="Chiudi menu laterale"
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <FutureLogo className="text-[#7b39fc]" />
            <span className="font-inter text-[17px] font-bold tracking-[-0.02em] text-gray-950 dark:text-white">
              Taskly
            </span>
          </Link>
        </div>

        {!isDashboard && (
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className={linkBtn}>
                {link.name}
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isDashboard && (
            <div className="shrink-0">
              <NotificationBell />
            </div>
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
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200/30 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111414e6]"
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
              aria-label="Menu"
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
                >
                  Accedi
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
