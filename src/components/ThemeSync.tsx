"use client";

import { useEffect } from "react";

/**
 * Ensures the light theme (default) is applied on every page after
 * hydration. The inline script in layout.js sets it before first paint;
 * this re-applies it once React has mounted so pages that don't manage
 * their own theme (login, settings, …) stay consistent with the user's
 * saved preference.
 */
export default function ThemeSync() {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return null;
}
