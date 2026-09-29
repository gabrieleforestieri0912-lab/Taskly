
"use client";
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
  User,
  X,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "../lib/LanguageContext";

function AvatarMenu({ user, t, dropdownRef, dropdownOpen, setDropdownOpen, handleLogout, align }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen((open) => !open)}
        className="flex h-10 items-center gap-2 rounded-xl border border-purple-500/15 bg-white px-2.5 pl-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-500/30 dark:border-purple-400/12 dark:bg-white/7 dark:text-gray-200 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
      >
        <span className="hidden max-w-32.5 truncate sm:block">{user.name}</span>
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-7 w-7 rounded-full object-cover shrink-0 border border-purple-500/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-600 text-white shadow-sm shadow-purple-500/30 dark:bg-purple-500">
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
            className={`absolute mt-2 w-64 overflow-hidden rounded-2xl border border-purple-500/12 bg-white shadow-2xl shadow-purple-500/6 dark:border-purple-400/10 dark:bg-[#111414e6] dark:shadow-purple-900/20 ${align === "left" ? "left-0" : "right-0"}`}
          >
            <div className="border-b border-purple-500/10 p-4 dark:border-purple-400/10">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
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
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors duration-150 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-500/10"
              >
                <LayoutDashboard size={17} />
                {t("dashboard")}
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 transition-colors duration-150 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-500/10"
              >
                <Settings size={17} />
                {t("settings")}
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/8"
              >
                <LogOut size={17} />
                {t("logout")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({
  theme,
  toggleTheme,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname() || "";
  const dropdownRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  const isDashboard = pathname.startsWith("/dashboard");

  const navLinks = [
    { name: t("features"), href: "#features" },
    { name: t("howItWorks"), href: "#getting-started" },
    { name: t("demo"), href: "#demo" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("faq"), href: "#faq" },
    { name: t("documentation"), href: "/docs" },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    router.push("/login");
  };

  const surfaceClass =
    isScrolled || isDashboard
      ? "bg-white/90 shadow-[0_12px_44px_rgba(15,23,42,0.10)] backdrop-blur-xl border-[#dfdbea] dark:bg-[#0f1212]/90 dark:shadow-[0_12px_44px_rgba(0,0,0,0.30)] dark:border-white/[0.07]"
      : "border-[#d6d4de]/60 bg-white/55 backdrop-blur-md dark:border-white/[0.06] dark:bg-black/18";

  const linkBtn =
    "rounded-lg px-3.5 py-2 text-[13px] font-semibold text-gray-500 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-400 dark:hover:bg-purple-500/10 dark:hover:text-purple-300";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-5 pointer-events-none">
      <nav
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-xl border px-5 transition-all duration-300 pointer-events-auto sm:px-6 ${surfaceClass}`}
      >
        {/* ── Logo + sidebar toggle ───────────────── */}
        <div className="flex min-w-0 items-center gap-3">
          {isDashboard && !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-white text-gray-600 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:scale-105 dark:border-purple-400/15 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              aria-label="Apri menu laterale"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
          {isDashboard && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-white text-gray-600 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:scale-105 dark:border-purple-400/15 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              aria-label="Chiudi menu laterale"
            >
              <PanelLeftClose size={18} />
            </button>
          )}

          {isDashboard && user ? (
            <AvatarMenu
              user={user}
              t={t}
              dropdownRef={dropdownRef}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              handleLogout={handleLogout}
              align="left"
            />
          ) : (
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/70 shadow-sm transition-all group-hover:scale-[1.03] dark:border-white/10 dark:bg-white/10">
                <Image
                  src="/taskly.png"
                  alt="Taskly"
                  width={28}
                  height={28}
                  className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ width: "28px", height: "28px" }}
                  priority
                />
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[17px] font-black tracking-[-0.02em] text-gray-950 transition-colors duration-300 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Taskly
                </span>
              </span>
            </Link>
          )}
        </div>

        {/* ── Nav links desktop ────────────────────── */}
        {!isDashboard && (
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className={linkBtn}>
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* ── Azioni destra ────────────────────────── */}
        <div className="flex items-center gap-1.5">
          {/* Notifiche — solo dashboard (componente completo) */}
          {isDashboard && (
            <div className="shrink-0">
              <NotificationBell />
            </div>
          )}

          {/* Logged out → Accedi / Inizia */}
          {!user && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-xl px-3.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#7b39fc] px-5 text-sm font-black text-white shadow-md shadow-[#7b39fc]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8b4dff]"
              >
                {t("start")}
              </Link>
            </div>
          )}

          {/* Landing (logged in) → Dashboard button + avatar */}
          {user && !isDashboard && (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#7b39fc] px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#8b4dff]"
              >
                {t("dashboard")}
              </Link>
              <AvatarMenu
                user={user}
                t={t}
                dropdownRef={dropdownRef}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                handleLogout={handleLogout}
                align="right"
              />
            </>
          )}

          {/* ── Hamburger mobile ──────────────────── */}
          {!isDashboard && (
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-white text-gray-600 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400/15 dark:bg-white/8 dark:text-gray-300 dark:hover:bg-purple-500/10 md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile menu ───────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && !isDashboard && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-2.5 max-w-7xl overflow-hidden rounded-2xl border border-purple-500/15 bg-white/95 p-2 shadow-2xl shadow-purple-500/8 backdrop-blur-xl pointer-events-auto dark:border-purple-400/10 dark:bg-[#111414e6]"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition-colors duration-150 hover:bg-purple-50 hover:text-purple-700 dark:text-gray-300 dark:hover:bg-purple-500/10"
              >
                {link.name}
              </a>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-purple-500/10 pt-2 dark:border-purple-400/10">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-purple-500/25 text-sm font-semibold text-purple-700 transition-colors duration-150 hover:bg-purple-50 dark:border-purple-400/20 dark:text-purple-300"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#7b39fc] text-sm font-black text-white shadow-md shadow-[#7b39fc]/25 transition-all duration-300 hover:bg-[#8b4dff]"
                >
                  {t("start")}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


