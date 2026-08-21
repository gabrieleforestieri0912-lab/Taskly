"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ className = "" }) {
  // Read the theme straight from the DOM instead of syncing it in an effect.
  // The inline script in layout.tsx sets the `dark` class before first paint,
  // so this is accurate at hydration time. On the server we keep the previous
  // default (dark) so the SSR output is unchanged.
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : true,
  );

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (e) {}
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambia tema"
      title={dark ? "Tema chiaro" : "Tema scuro"}
      className={className}
    >
      {dark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
