import type { ReactNode } from "react";
import Link from "next/link";

const calloutStyles = {
  note: "border-blue-500/30 bg-blue-500/5 text-blue-950 dark:text-blue-100",
  tip: "border-emerald-500/30 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100",
  warning: "border-amber-500/30 bg-amber-500/5 text-amber-950 dark:text-amber-100",
  danger: "border-red-500/30 bg-red-500/5 text-red-950 dark:text-red-100",
};

export function Callout({
  type = "note",
  children,
}: {
  type?: keyof typeof calloutStyles;
  children: ReactNode;
}) {
  return (
    <aside className={`my-5 rounded-xl border px-4 py-3 text-sm leading-6 ${calloutStyles[type]}`}>
      {children}
    </aside>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <div className="my-5 space-y-3 [counter-reset:doc-step]">{children}</div>;
}

export function Step({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="relative rounded-xl border border-gray-200 p-4 pl-12 dark:border-gray-800 [counter-increment:doc-step] before:absolute before:left-4 before:top-4 before:grid before:size-6 before:place-items-center before:rounded-full before:bg-[#7b39fc]/10 before:text-xs before:font-bold before:text-[#7b39fc] before:content-[counter(doc-step)]">
      <h3 className="mb-1 font-semibold">{title}</h3>
      <div className="text-sm leading-6 text-gray-600 dark:text-gray-300">{children}</div>
    </section>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 font-mono text-[0.8em] text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
      {children}
    </kbd>
  );
}

export function Screenshot({
  alt,
  caption,
}: {
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
      <div
        role="img"
        aria-label={alt}
        className="grid min-h-40 place-items-center px-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Screenshot: {alt}
      </div>
      <figcaption className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Tabs({ children }: { children: ReactNode }) {
  return <div className="my-5 space-y-4">{children}</div>;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[#7b39fc]/10 px-2 py-0.5 text-xs font-semibold text-[#7b39fc] dark:text-[#a67cff]">
      {children}
    </span>
  );
}

export function FeatureTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-semibold">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-800">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 align-top text-gray-600 dark:text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RelatedLinks({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <ul className="my-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="inline-flex rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-[#7b39fc] hover:bg-[#7b39fc]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:border-gray-800 dark:text-[#a67cff]"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
