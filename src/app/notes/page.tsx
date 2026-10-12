"use client";
import DashboardRouteLauncher from "../../components/DashboardRouteLauncher";
import { useLanguage } from "../../lib/LanguageContext";

export default function NotesPage() {
  const { t } = useLanguage();
  return <DashboardRouteLauncher type="notes" title={t("land.pgNotesTitle")} />;
}
