"use client";

import { useEffect } from "react";
import { applyTheme, readTheme } from "../lib/theme";

/**
 * Riapplica il tema scelto dall'utente dopo l'hydration: lo script inline in
 * layout.tsx lo imposta già prima del primo paint, questo lo rende coerente
 * anche per le pagine che non gestiscono il tema da sole
 * (login, settings, …).
 */
export default function ThemeSync() {
  useEffect(() => {
    applyTheme(readTheme());
  }, []);

  return null;
}
