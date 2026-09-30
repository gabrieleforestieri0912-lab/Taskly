"use client";

import { useLanguage } from "../../lib/LanguageContext";
import DashboardRouteLauncher from "../../components/DashboardRouteLauncher";

export default function CalendarPage() {
  const { t } = useLanguage();
  return <DashboardRouteLauncher type="calendar" title={t("land.showcaseTabCalendar")} />;
}
