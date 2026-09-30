"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, translate, translateWith, type LangCode } from "./i18n";

const LanguageContext = createContext<{
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  tWith: (key: string, vars?: Record<string, string | number>) => string;
} | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize to a server-stable default to avoid hydration mismatches.
  // Read `localStorage` only after mount so the initial client render
  // matches the server-rendered HTML.
  const [language, setLanguageState] = useState<LangCode>("it");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("language");
      if (savedLang && translations[savedLang as LangCode] && savedLang !== language) {
        setLanguageState(savedLang as LangCode);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep document language in sync
  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch (e) {}
  }, [language]);

  const setLanguage = (lang: string) => {
    if (translations[lang as LangCode]) {
      setLanguageState(lang as LangCode);
      try {
        localStorage.setItem("language", lang);
      } catch (e) {}
      try {
        document.documentElement.lang = lang;
      } catch (e) {}
      // notify listeners
      try {
        window.dispatchEvent(
          new CustomEvent("language-changed", { detail: { language: lang } }),
        );
      } catch (e) {}
      // Nessun reload: il cambio si applica subito a tutto il tree React.
      // Un reload ripartiva da zero con i testi server-renderizzati in
      // italiano e rendeva il cambio lingua sembrare non funzionante.
    }
  };

  const t = (key: string): string => {
    return translate(language, key);
  };

  const tWith = (key: string, vars?: Record<string, string | number>): string => {
    return translateWith(language, key, vars);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tWith }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};