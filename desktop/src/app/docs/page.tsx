
import React from "react";

export const metadata = {
  title: "Documentazione - Taskly",
  description: "Documentazione ufficiale di Taskly.",
};

export default function DocsPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Documentazione</h1>
      <p className="text-gray-700 mb-4">
        Benvenuto nella documentazione ufficiale di Taskly. Qui trovi guide,
        tutorial e riferimenti alle funzionalità principali.
      </p>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Guida Rapida</h2>
          <p className="text-gray-600">Introduzione all'uso di Taskly.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">API & Integrazioni</h2>
          <p className="text-gray-600">
            Informazioni sulle integrazioni e API.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">FAQ</h2>
          <p className="text-gray-600">
            Domande frequenti e risoluzione problemi.
          </p>
        </div>
      </section>

      <div className="mt-8">
        <a href="/" className="text-sm text-purple-600 hover:underline">
          Torna alla home
        </a>
      </div>
    </main>
  );
}


