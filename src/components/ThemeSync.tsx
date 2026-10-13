"use client";

import { useEffect } from "react";
import { applyTheme, readTheme } from "../lib/theme";
import { applyAppFont, readAppFont } from "../lib/appFont";
import { applyAccent, readAccent } from "../lib/accent";
import { applyDensity, readPref } from "../lib/prefs";

/**
 * Riapplica tema, font, accento e densità scelti dall'utente dopo
 * l'hydration: gli script inline in layout.tsx li impostano già prima del
 * primo paint, questo li rende coerenti anche per le pagine che non li
 * gestiscono da sole (login, settings, …).
 */
export default function ThemeSync() {
  useEffect(() => {
    applyTheme(readTheme());
    applyAppFont(readAppFont());
    applyAccent(readAccent());
    applyDensity(readPref("density"));
  }, []);

  return null;
}
