import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Documentazione - Taskly",
  description: "Documentazione ufficiale di Taskly.",
};

export default function DocsPage() {
  return (
<main className="max-w-4xl mx-auto py-16 px-4">
      <div className="landing-eyebrow">Guides</div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Documentazione</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Benvenuto nella documentazione ufficiale di Taskly. Qui trovi guide,
        tutorial e riferimenti alle funzionalità principali.
      </p>

      <section className="space-y-4">
        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Guida Rapida</h2>
          <p className="text-gray-600 dark:text-gray-400">Introduzione all&apos;uso di Taskly.</p>
        </div>

        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API & Integrazioni</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Informazioni sulle integrazioni e API.
          </p>
        </div>

        <div className="landing-card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">FAQ</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Domande frequenti e risoluzione problemi.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm text-[#7b39fc] dark:text-[#a67cff] hover:underline">
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
