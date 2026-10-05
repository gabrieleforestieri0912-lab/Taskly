import Link from "next/link";

export default function DocsNotFound() {
  return (
    <main className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm font-semibold text-[#7b39fc] dark:text-[#a67cff]">
        Documentazione Taskly
      </p>
      <h1 className="mt-3 text-3xl font-bold">Pagina non trovata</h1>
      <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
        Questa guida non esiste o potrebbe essere stata spostata.
      </p>
      <Link
        href="/docs"
        className="mt-6 inline-flex rounded-lg bg-[#7b39fc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7b39fc] focus-visible:ring-offset-2"
      >
        Vai alla documentazione
      </Link>
    </main>
  );
}
