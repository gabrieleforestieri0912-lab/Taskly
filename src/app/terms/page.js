import React from "react";

export const metadata = {
  title: "Termini - Taskly",
  description: "Termini e condizioni di Taskly.",
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <div className="landing-eyebrow">Legal</div>
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Termini e condizioni</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Questa è una pagina di esempio per i termini e le condizioni. Inserisci
        qui i termini del servizio.
      </p>
      <section className="text-sm text-gray-600 dark:text-gray-400">
        <h2 className="font-semibold mt-4 text-gray-900 dark:text-white">Uso del servizio</h2>
        <p>Dettagli sui termini d&apos;uso.</p>
      </section>
    </main>
  );
}
