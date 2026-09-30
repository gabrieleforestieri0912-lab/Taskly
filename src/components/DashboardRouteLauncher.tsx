"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserData } from "../hooks/useUserData";
import { useLanguage } from "../lib/LanguageContext";

export default function DashboardRouteLauncher({ type, title }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { pages, loading } = useUserData();

  const targetPage = useMemo(
    () => pages.find((page) => page.type === type),
    [pages, type],
  );

  useEffect(() => {
    if (loading) return;
    if (targetPage) {
      router.replace(`/dashboard?page=${targetPage.id}`);
    }
  }, [loading, router, targetPage]);

  if (loading || targetPage) {
    return (
      <main className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-black">
        <div className="text-sm font-bold text-gray-500">{t("views.launcherOpening").replace("{name}", title)}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-zinc-50 dark:bg-black px-6">
      <div className="max-w-md text-center space-y-5">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("views.launcherNone")}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 font-semibold text-white shadow-lg shadow-cyan-200 transition-all hover:bg-cyan-700 active:scale-95 dark:shadow-none"
        >
          {t("views.launcherOpen")}
        </Link>
      </div>
    </main>
  );
}
