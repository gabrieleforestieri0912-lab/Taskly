"use client";

import { useLanguage } from "../../lib/LanguageContext";
import SupportForm from "./SupportForm";

export default function SupportPage() {
  const { t } = useLanguage();
  return (
    <main className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">{t("auth.supportTitle")}</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{t("auth.supportSubtitle")}</p>
      <SupportForm />
    </main>
  );
}
