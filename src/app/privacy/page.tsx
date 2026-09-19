import React from "react";

export const metadata = {
  title: "Privacy Policy - Taskly",
  description: "Informativa completa sulla privacy di Taskly.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <div>
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Informativa sulla Privacy
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Ultimo aggiornamento: 18 Settembre 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              1. Introduzione
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Benvenuti su Taskly. La tua privacy è fondamentale per noi. Questa Informativa sulla Privacy
              descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni quando utilizzi l'applicazione
              Taskly e i nostri servizi correlati.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              2. Dati che Raccogliamo
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">
                  Informazioni fornite tramite Google OAuth
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Per facilitare l'accesso e la creazione dell'account, Taskly utilizza l'autenticazione Google.
                  Attraverso questo processo, raccogliamo le seguenti informazioni dal tuo profilo Google:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Indirizzo email (per l'identificazione dell'account e comunicazioni di servizio).</li>
                  <li>Nome e Cognome (per personalizzare la tua esperienza all'interno dell'app).</li>
                  <li>Foto del profilo (per la visualizzazione nel tuo workspace).</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">
                  Contenuti generati dall'utente
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Raccogliamo e archiviamo i dati che inserisci attivamente nell'applicazione, tra cui:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Task, note, obiettivi e scadenze.</li>
                  <li>Eventi di calendario e pianificazioni.</li>
                  <li>Eventuali collegamenti o documenti caricati nel workspace.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">
                  Dati tecnici e di utilizzo
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Raccogliamo automaticamente informazioni tecniche limitate per garantire la sicurezza
                  e il corretto funzionamento dell'app, come l'indirizzo IP e il tipo di browser utilizzato.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              3. Come Utilizziamo i tuoi Dati
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Utilizziamo le informazioni raccolte per i seguenti scopi:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Fornitura del Servizio:</strong> Creazione e gestione del tuo account, sincronizzazione dei tuoi dati tra i dispositivi e gestione del workspace.</li>
              <li><strong>Personalizzazione:</strong> Adattare l'interfaccia e le funzionalità in base alle tue preferenze.</li>
              <li><strong>Sicurezza:</strong> Prevenire frodi, abusi e garantire l'integrità dei dati.</li>
              <li><strong>Miglioramento del Prodotto:</strong> Analizzare l'utilizzo aggregato dell'app per sviluppare nuove funzionalità e ottimizzare quelle esistenti.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              4. Condivisione e Protezione dei Dati
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>Non vendiamo, noleggiamo né scambiamo i tuoi dati personali con terze parti per scopi di marketing.</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Condividiamo i tuoi dati esclusivamente con i nostri fornitori di servizi infrastrutturali che
              operano come responsabili del trattamento, tra cui:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Google Cloud Platform:</strong> Per l'hosting, l'autenticazione OAuth e i servizi di database.</li>
              <li><strong>Supabase:</strong> Per la gestione del database in tempo reale e l'autenticazione.</li>
              <li><strong>Vercel:</strong> Per il deployment e l'hosting della nostra applicazione web.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              5. I tuoi Diritti (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              In conformità al Regolamento Generale sulla Protezione dei Dati (GDPR), hai i seguenti diritti:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Diritto di Accesso:</strong> Puoi richiedere una copia dei tuoi dati personali.</li>
              <li><strong>Diritto di Rettifica:</strong> Puoi aggiornare o correggere i tuoi dati in qualsiasi momento.</li>
              <li><strong>Diritto alla Cancellazione:</strong> Puoi richiedere la rimozione completa dei tuoi dati dai nostri sistemi ("diritto all'oblio").</li>
              <li><strong>Diritto alla Portabilità:</strong> Puoi richiedere l'esportazione dei tuoi dati in un formato leggibile.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              6. Modifiche all'Informativa
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Ci riserviamo il diritto di aggiornare questa Informativa sulla Privacy. Qualsiasi modifica
              significativa sarà comunicata tramite l'applicazione o via email all'indirizzo associato al tuo account.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              7. Contatti
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Per domande relative a questa informativa o per esercitare i tuoi diritti, puoi contattarci all'indirizzo:
              <br />
              <a href="mailto:support@taskly-productivity.vercel.app" className="text-blue-600 dark:text-blue-400 underline">
                support@taskly-productivity.vercel.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
