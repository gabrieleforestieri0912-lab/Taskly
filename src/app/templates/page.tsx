"use client";
import React from "react";
import TemplateGallery from "../../components/TemplateGallery";
import { useLanguage } from "../../lib/LanguageContext";

export default function TemplatesPage() {
  const { t } = useLanguage();
  return (
    <main className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">{t("land.pgTemplatesTitle")}</h1>
      <TemplateGallery />
    </main>
  );
}
