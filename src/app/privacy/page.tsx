import React from "react";

export const metadata = {
  title: "Privacy - Taskly",
  description: "Informativa sulla privacy di Taskly.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Informativa sulla privacy</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Questa è una pagina di esempio per la privacy. Inserisci qui la tua
        informativa completa sulla privacy.
      </p>
      <section className="text-sm text-gray-600 dark:text-gray-400">
        <h2 className="font-semibold mt-4">Dati raccolti</h2>
        <p>Descrivi i dati che raccogli e come li utilizzi.</p>
      </section>
    </main>
  );
}
