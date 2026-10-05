"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, Menu, Search, X } from "lucide-react";
import type { DocHeading, DocStatus } from "@/lib/docs/types";
import { getSectionLabel } from "@/lib/docs/labels";

export interface DocNavigationItem {
  slug: string;
  title: string;
  description: string;
  section: string;
  order: number;
  tags: string[];
  status: DocStatus;
  headings: DocHeading[];
  searchText: string;
}

const docHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs");

function Toc({ headings }: { headings: DocHeading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headingElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    headingElements.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;
  return (
    <nav aria-label="Indice della pagina" className="hidden 2xl:block">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        In questa pagina
      </h2>
      <ul className="space-y-2 border-l border-gray-200 dark:border-gray-800">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.depth === 3 ? "pl-4" : "pl-3"}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              className={`block border-l -ml-px py-0.5 text-xs leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] ${
                activeId === heading.id
                  ? "border-[#7b39fc] font-semibold text-[#7b39fc] dark:text-[#a67cff]"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function DocsSidebar({
  docs,
  pathname,
  onNavigate,
}: {
  docs: DocNavigationItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = docs.find((doc) => docHref(doc.slug) === pathname);
  const grouped = useMemo(() => {
    const groups = new Map<string, DocNavigationItem[]>();
    docs.forEach((doc) => {
      const group = groups.get(doc.section) || [];
      group.push(doc);
      groups.set(doc.section, group);
    });
    return Array.from(groups.entries());
  }, [docs]);
  const [openSections, setOpenSections] = useState<string[]>([]);

  return (
    <nav aria-label="Navigazione documentazione" className="space-y-3">
      <Link
        href="/docs"
        onClick={onNavigate}
        aria-current={pathname === "/docs" ? "page" : undefined}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold ${
          pathname === "/docs"
            ? "bg-[#7b39fc]/10 text-[#7b39fc] dark:text-[#a67cff]"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc]`}
      >
        <BookOpen size={16} />
        Inizia dalla documentazione
      </Link>

      {grouped.map(([section, pages]) => {
        const isOpen = openSections.includes(section) || active?.section === section;
        return (
          <details
            key={section}
            open={isOpen}
            onToggle={(event) => {
              const nextOpen = event.currentTarget.open;
              setOpenSections((current) =>
                nextOpen
                  ? Array.from(new Set([...current, section]))
                  : current.filter((item) => item !== section),
              );
            }}
            className="group"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:text-gray-400 dark:hover:bg-white/5">
              {getSectionLabel(section)}
              <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
            </summary>
            <ul className="mt-1 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-800">
              {pages.map((doc) => {
                const href = docHref(doc.slug);
                const isActive = pathname === href;
                return (
                  <li key={doc.slug || "index"}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={`block rounded-md px-2 py-1.5 text-sm ${
                        isActive
                          ? "bg-[#7b39fc]/10 font-semibold text-[#7b39fc] dark:text-[#a67cff]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc]`}
                    >
                      {doc.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </nav>
  );
}

export default function DocsShell({
  docs,
  children,
}: {
  docs: DocNavigationItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/docs";
  const currentDoc = docs.find((doc) => docHref(doc.slug) === pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("it");

  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return docs.filter((doc) =>
      `${doc.title} ${doc.description} ${doc.tags.join(" ")} ${doc.searchText}`
        .toLocaleLowerCase("it")
        .includes(normalizedQuery),
    );
  }, [docs, normalizedQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => document.getElementById("docs-search")?.focus());
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const currentIndex = docs.findIndex((doc) => docHref(doc.slug) === pathname);
  const previous = currentIndex > 0 ? docs[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? docs[currentIndex + 1] : undefined;
  const breadcrumbs = currentDoc
    ? [
        { label: "Documentazione", href: "/docs" },
        { label: getSectionLabel(currentDoc.section) },
        { label: currentDoc.title },
      ]
    : [{ label: "Documentazione" }];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] lg:hidden dark:hover:bg-white/10"
              aria-label="Apri navigazione documentazione"
            >
              <Menu size={18} />
            </button>
            <Link href="/docs" className="text-sm font-bold tracking-tight">
              Taskly <span className="font-normal text-gray-500">/ Documentazione</span>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              requestAnimationFrame(() => document.getElementById("docs-search")?.focus());
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:border-gray-800 dark:hover:bg-white/5"
          >
            <Search size={15} />
            <span className="hidden sm:inline">Cerca nella documentazione</span>
            <kbd className="rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[10px] dark:border-gray-700">
              Ctrl K
            </kbd>
          </button>
        </div>

        {searchOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSearchOpen(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="docs-search-title"
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950"
            >
              <h2 id="docs-search-title" className="sr-only">Cerca nella documentazione</h2>
              <div className="flex items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
                <Search size={18} className="text-gray-400" />
                <input
                  id="docs-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cerca pagine, argomenti e parole chiave"
                  className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7b39fc]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:hover:bg-white/10"
                  aria-label="Chiudi ricerca"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto p-2">
                {!normalizedQuery ? (
                  <p className="px-3 py-8 text-center text-sm text-gray-500">
                    Scrivi per cercare in titoli, descrizioni, tag e testo delle guide.
                  </p>
                ) : results.length ? (
                  <ul className="space-y-1">
                    {results.map((doc) => (
                      <li key={doc.slug || "index"}>
                        <Link
                          href={docHref(doc.slug)}
                          onClick={() => setSearchOpen(false)}
                          className="block rounded-xl px-3 py-3 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:hover:bg-white/5"
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#7b39fc] dark:text-[#a67cff]">
                            {getSectionLabel(doc.section)}
                          </span>
                          <span className="mt-1 block text-sm font-semibold">{doc.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {doc.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-gray-500">
                    Nessun risultato per “{query}”.
                  </p>
                )}
              </div>
            </section>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:py-8 2xl:grid-cols-[250px_minmax(0,1fr)_190px]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2">
              <DocsSidebar docs={docs} pathname={pathname} />
            </div>
          </aside>

          <main id="main-content" className="min-w-0">
            <nav aria-label="Percorso" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 && <span aria-hidden="true">/</span>}
                    {crumb.href && index < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href} className="hover:text-[#7b39fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc]">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            {children}

            {currentIndex >= 0 && currentDoc?.slug !== "" && (
              <nav aria-label="Navigazione tra le guide" className="mt-12 grid grid-cols-1 gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2 dark:border-gray-800">
                {previous ? (
                  <Link href={docHref(previous.slug)} className="rounded-xl border border-gray-200 p-4 hover:border-[#7b39fc]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:border-gray-800">
                    <span className="block text-xs text-gray-500">← Precedente</span>
                    <span className="mt-1 block text-sm font-semibold">{previous.title}</span>
                  </Link>
                ) : <span />}
                {next && (
                  <Link href={docHref(next.slug)} className="rounded-xl border border-gray-200 p-4 text-right hover:border-[#7b39fc]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:border-gray-800">
                    <span className="block text-xs text-gray-500">Successivo →</span>
                    <span className="mt-1 block text-sm font-semibold">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </main>

          <aside className="hidden 2xl:block">
            <div className="sticky top-6">
              <Toc headings={currentDoc?.headings || []} />
            </div>
          </aside>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMobileOpen(false);
          }}
        >
          <aside className="h-full w-[min(88vw,360px)] overflow-y-auto bg-white p-5 shadow-xl dark:bg-gray-950">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-semibold">Indice documentazione</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Chiudi navigazione documentazione"
                className="rounded p-2 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <DocsSidebar docs={docs} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
