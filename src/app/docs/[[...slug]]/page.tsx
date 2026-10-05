import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocContent } from "@/components/docs/DocContent";
import { getAllDocs, getDocBySlug, getSectionLabel } from "@/lib/docs/content";

interface DocsPageProps {
  params: Promise<{ slug?: string[] }>;
}

const docPath = (slug: string) => (slug ? `/docs/${slug}` : "/docs");

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({
    slug: doc.slug ? doc.slug.split("/") : [],
  }));
}

export async function generateMetadata({
  params,
}: DocsPageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug.join("/"));
  if (!doc) return { title: "Pagina non trovata | Documentazione Taskly" };

  const url = docPath(doc.slug);
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "it_IT",
      url,
      title: doc.title,
      description: doc.description,
      siteName: "Taskly",
      publishedTime: `${doc.updated}T00:00:00.000Z`,
      modifiedTime: `${doc.updated}T00:00:00.000Z`,
    },
  };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug.join("/"));
  if (!doc) notFound();

  const allDocs = getAllDocs();
  const sections = Array.from(
    allDocs
      .filter((item) => item.slug)
      .reduce((groups, item) => {
        const current = groups.get(item.section) || [];
        current.push(item);
        groups.set(item.section, current);
        return groups;
      }, new Map<string, typeof allDocs>()),
  );

  return (
    <article>
      <header className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7b39fc] dark:text-[#a67cff]">
            {getSectionLabel(doc.section)}
          </span>
          {doc.status === "coming-soon" && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              Presto disponibile
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
          {doc.description}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Aggiornato il <time dateTime={doc.updated}>{doc.updated}</time>
        </p>
      </header>

      {doc.slug === "" && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {sections.map(([section, pages]) => (
            <section
              key={section}
              className="rounded-2xl border border-gray-200 p-5 transition-colors hover:border-[#7b39fc]/40 dark:border-gray-800"
            >
              <h2 className="text-base font-bold">{getSectionLabel(section)}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {pages.length} {pages.length === 1 ? "guida" : "guide"} in questa sezione.
              </p>
              <ul className="mt-4 space-y-2">
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={docPath(page.slug)}
                      className="text-sm font-medium text-[#7b39fc] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] dark:text-[#a67cff]"
                    >
                      {page.title}
                      <span className="mt-0.5 block text-xs font-normal leading-5 text-gray-500 dark:text-gray-400">
                        {page.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <DocContent markdown={doc.content} />
    </article>
  );
}
