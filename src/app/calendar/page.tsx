"use client";
import DashboardRouteLauncher from "../../components/DashboardRouteLauncher";
import { useLanguage } from "../../lib/LanguageContext";

export default function CalendarPage() {
  const { t } = useLanguage();
  return <DashboardRouteLauncher type="calendar" title={t("land.pgCalendarTitle")} />;
}
