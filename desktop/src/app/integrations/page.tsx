"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  KeyRound,
  Loader2,
  Puzzle,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  INTEGRATIONS,
  type Integration,
  type IntegrationCategory,
} from "../../lib/integrationsCatalog";

const REQUESTS_KEY = "taskly_integration_requests";

type CategoryFilter = "all" | IntegrationCategory;

function loadRequests(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveRequests(slugs: string[]): void {
  try {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(slugs));
  } catch { /* ignore */ }
}

/** Riquadro con il monogramma dell'app (nessun asset di terze parti). */
function AppMark({ item, size = 44 }: { item: Integration; size?: number }): React.JSX.Element {
  return (
    <span
      className="flex items-center justify-center rounded-xl font-black text-white shrink-0 shadow-sm"
      style={{ backgroundColor: item.color, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {item.letter}
    </span>
  );
}

function ComingSoonBadge(): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-300">
      <Clock size={10} />
      Prossimamente
    </span>
  );
}

export default function IntegrationsPage(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [requests, setRequests] = useState<string[]>([]);

  useEffect(() => {
    setRequests(loadRequests());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter((i) => {
      const matchesCategory = category === "all" || i.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        CATEGORY_LABELS[i.category].toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const grouped = useMemo(() => {
    return CATEGORY_ORDER
      .map((c) => ({
        category: c,
        items: filtered.filter((i) => i.category === c),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: INTEGRATIONS.length };
    for (const c of CATEGORY_ORDER) {
      map[c] = INTEGRATIONS.filter((i) => i.category === c).length;
    }
    return map;
  }, []);

  const toggleRequest = (item: Integration): void => {
    setRequests((prev) => {
      const next = prev.includes(item.slug)
        ? prev.filter((s) => s !== item.slug)
        : [...prev, item.slug];
      saveRequests(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <div className="flex-1" />
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca un'integrazione..."
              aria-label="Cerca integrazione"
              className="w-56 sm:w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <section className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
            <Puzzle size={12} />
            Marketplace
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">Integrazioni</h1>
          <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Collega Taskly alle app che gia usi. Stiamo sviluppando le connessioni una dopo
            l&apos;altra: per ora sono tutte in arrivo, ma puoi gia registrarne l&apos;interesse
            per essere avvisato quando saranno disponibili.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          <FilterChip
            label="Tutte"
            count={counts.all}
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {CATEGORY_ORDER.map((c) => (
            <FilterChip
              key={c}
              label={CATEGORY_LABELS[c]}
              count={counts[c] ?? 0}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </section>

        {grouped.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">
            Nessuna integrazione trovata per &quot;{query}&quot;.
          </p>
        ) : (
          grouped.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                {CATEGORY_LABELS[group.category]}
                <span className="ml-2 text-gray-300 dark:text-gray-600">{group.items.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => {
                  const requested = requests.includes(item.slug);
                  return (
                    <button
                      key={item.slug}
                      onClick={() => setSelected(item)}
                      className="group text-left rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <AppMark item={item} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            {requested && (
                              <span title="Richiesta registrata">
                                <Check size={13} className="text-emerald-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <ComingSoonBadge />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600 group-hover:text-purple-400 transition-colors">
                          Dettagli
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}

        <section className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center space-y-2">
          <Bell size={20} className="mx-auto text-purple-500" />
          <h2 className="font-black text-gray-900 dark:text-white">
            Ti serve un&apos;altra integrazione?
          </h2>
          <p className="text-sm text-gray-500">
            Scrivici quale app vorresti collegare: le richieste piu votate entrano nel prossimo
            lotto di sviluppo.
          </p>
          <a
            href="mailto:gabriele.forestieri0912@gmail.com?subject=Richiesta%20integrazione"
            className="inline-block mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-sm font-bold"
          >
            Proponi un&apos;app
          </a>
        </section>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[140] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <AppMark item={selected} size={56} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      {selected.name}
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                      {CATEGORY_LABELS[selected.category]}
                    </p>
                    <div className="mt-2">
                      <ComingSoonBadge />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Chiudi"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selected.description}
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Sparkles size={12} /> Cosa faremo
                  </p>
                  <ul className="space-y-1.5">
                    {selected.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check size={14} className="mt-0.5 text-purple-500 shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <KeyRound size={12} /> Permessi richiesti
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-[11px] font-semibold text-gray-600 dark:text-gray-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                  <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" />
                  <p>
                    Integrazione in sviluppo: il pulsante &quot;Collega&quot; verra attivato
                    quando il collegamento sara disponibile. Nel frattempo puoi registrarne
                    l&apos;interesse.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled
                    className="flex-1 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 px-4 py-2.5 text-sm font-bold cursor-not-allowed"
                  >
                    Collega (non ancora disponibile)
                  </button>
                  <button
                    onClick={() => toggleRequest(selected)}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                      requests.includes(selected.slug)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    {requests.includes(selected.slug) ? "Richiesta registrata" : "Avvisami quando arriva"}
                  </button>
                </div>

                <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Nessun dato viene trasmesso: le richieste sono
                  salvate solo su questo dispositivo.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "bg-purple-600 text-white"
          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-purple-300"
      }`}
    >
      {label}
      <span className={`ml-1.5 ${active ? "text-white/70" : "text-gray-400"}`}>{count}</span>
    </button>
  );
}
