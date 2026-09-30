"use client";

import { useLanguage } from "../../lib/LanguageContext";
import DashboardRouteLauncher from "../../components/DashboardRouteLauncher";

export default function NotesPage() {
  const { t } = useLanguage();
  return <DashboardRouteLauncher type="notes" title={t("views.welcomeNotes")} />;
}
