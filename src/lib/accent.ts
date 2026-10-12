/**
 * Accent color system — il colore d'accento scelto nelle impostazioni
 * guida davvero l'interfaccia tramite CSS variables:
 *   --accent        colore base (ex #7b39fc)
 *   --accent-hover  hover/active dei bottoni primari
 *   --accent-active stato premuto
 *   --accent-300    variante chiara (testi/glow su dark, ex #a67cff)
 *   --accent-900    variante scura (tinte dark, ex #4c1d95)
 *   --accent-ink    testo leggibile sopra l'accento (bianco o quasi-nero)
 *
 * Le classi Tailwind usano `bg-(--accent)`, `text-(--accent)` ecc. (v4):
 * i modificatori di opacità (`/10`, `/40`) funzionano via color-mix.
 */

export interface AccentOption {
  name: string;
  color: string;
}

export const ACCENTS: AccentOption[] = [
  { name: "Viola Taskly", color: "#7b39fc" },
  { name: "Ciano Vertex", color: "#06b6d4" },
  { name: "Smeraldo", color: "#10b981" },
  { name: "Rosa Shocking", color: "#ec4899" },
  { name: "Ambra Solare", color: "#f59e0b" },
  { name: "Cobalto", color: "#3b82f6" },
];

export const DEFAULT_ACCENT = "#7b39fc";
export const ACCENT_KEY = "taskly_accent";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [123, 57, 252];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mescola un colore verso il bianco (t>0) o il nero (t<0), t in [-1, 1]. */
function shade(hex: string, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = t > 0 ? 255 : 0;
  const k = Math.abs(t);
  return toHex(r + (target - r) * k, g + (target - g) * k, b + (target - b) * k);
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function accentVars(color: string): Record<string, string> {
  const base = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)
    ? color
    : DEFAULT_ACCENT;
  return {
    "--accent": base,
    "--accent-hover": shade(base, -0.1),
    "--accent-active": shade(base, -0.18),
    "--accent-300": shade(base, 0.42),
    "--accent-900": shade(base, -0.48),
    "--accent-ink": luminance(base) > 0.35 ? "#1f2937" : "#ffffff",
  };
}

export function readAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const saved = window.localStorage.getItem(ACCENT_KEY);
    if (saved && /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(saved)) return saved;
  } catch {}
  return DEFAULT_ACCENT;
}

/** Applica l'accento al documento; con `persist` lo salva nelle preferenze. */
export function applyAccent(color: string, persist = false) {
  const vars = accentVars(color);
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  }
  if (persist) {
    try {
      window.localStorage.setItem(ACCENT_KEY, vars["--accent"]);
    } catch {}
  }
}

/** Script inline pre-hydration: applica l'accento prima del primo paint. */
export function accentBootstrapScript() {
  return `
    (function(){
      try{
        var c = localStorage.getItem('${ACCENT_KEY}') || '${DEFAULT_ACCENT}';
        if(!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(c)) c = '${DEFAULT_ACCENT}';
        var root = document.documentElement;
        function shade(hex, t){
          var h = hex.replace('#','');
          if(h.length === 3) h = h.split('').map(function(x){ return x + x; }).join('');
          var n = parseInt(h, 16);
          var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
          var target = t > 0 ? 255 : 0, k = Math.abs(t);
          function ch(v){ return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }
          return '#' + ch(r + (target - r) * k) + ch(g + (target - g) * k) + ch(b + (target - b) * k);
        }
        function lum(hex){
          var h = hex.replace('#','');
          if(h.length === 3) h = h.split('').map(function(x){ return x + x; }).join('');
          var n = parseInt(h, 16);
          function lin(v){ v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
          return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
        }
        root.style.setProperty('--accent', c);
        root.style.setProperty('--accent-hover', shade(c, -0.1));
        root.style.setProperty('--accent-active', shade(c, -0.18));
        root.style.setProperty('--accent-300', shade(c, 0.42));
        root.style.setProperty('--accent-900', shade(c, -0.48));
        root.style.setProperty('--accent-ink', lum(c) > 0.35 ? '#1f2937' : '#ffffff');
      }catch(e){}
    })();
  `;
}
