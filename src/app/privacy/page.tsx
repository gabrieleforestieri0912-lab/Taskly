"use client";

/* eslint-disable react/no-unescaped-entities */

import { useLanguage } from "../../lib/LanguageContext";
import React from "react";

export default function PrivacyPage() {
  const { t } = useLanguage();
  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <div>
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{t("auth.privacyTitle")}</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t("auth.privacyUpdated")}</p>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS1Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Benvenuti su Taskly. La tua privacy è fondamentale per noi. Questa Informativa sulla Privacy
              descrive come raccogliamo, utilizziamo e proteggiamo le tue informazioni quando utilizzi l'applicazione
              Taskly e i nostri servizi correlati.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS2Title")}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{t("auth.privacyS2aTitle")}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Per facilitare l'accesso e la creazione dell'account, Taskly utilizza l'autenticazione Google.
                  Attraverso questo processo, raccogliamo le seguenti informazioni dal tuo profilo Google:
                </p>
                <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>{t("auth.privacyS2aLi1")}</li>
                  <li>{t("auth.privacyS2aLi2")}</li>
                  <li>{t("auth.privacyS2aLi3")}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{t("auth.privacyS2bTitle")}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t("auth.privacyS2bBody")}</p>
                <ul className="list-disc pl-6 mt-2 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>{t("auth.privacyS2bLi1")}</li>
                  <li>{t("auth.privacyS2bLi2")}</li>
                  <li>{t("auth.privacyS2bLi3")}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2 text-gray-800 dark:text-gray-100">{t("auth.privacyS2cTitle")}</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Raccogliamo automaticamente informazioni tecniche limitate per garantire la sicurezza
                  e il corretto funzionamento dell'app, come l'indirizzo IP e il tipo di browser utilizzato.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS3Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{t("auth.privacyS3Intro")}</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{t("auth.privacyS3aLabel")}</strong>{t("auth.privacyS3aText")}</li>
              <li><strong>{t("auth.privacyS3bLabel")}</strong>{t("auth.privacyS3bText")}</li>
              <li><strong>{t("auth.privacyS3cLabel")}</strong>{t("auth.privacyS3cText")}</li>
              <li><strong>{t("auth.privacyS3dLabel")}</strong>{t("auth.privacyS3dText")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS4Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              <strong>{t("auth.privacyS4Bold")}</strong>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Condividiamo i tuoi dati esclusivamente con i nostri fornitori di servizi infrastrutturali che
              operano come responsabili del trattamento, tra cui:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{t("auth.privacyS4aLabel")}</strong>{t("auth.privacyS4aText")}</li>
              <li><strong>{t("auth.privacyS4bLabel")}</strong>{t("auth.privacyS4bText")}</li>
              <li><strong>{t("auth.privacyS4cLabel")}</strong>{t("auth.privacyS4cText")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS5Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{t("auth.privacyS5Intro")}</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>{t("auth.privacyS5aLabel")}</strong>{t("auth.privacyS5aText")}</li>
              <li><strong>{t("auth.privacyS5bLabel")}</strong>{t("auth.privacyS5bText")}</li>
              <li><strong>{t("auth.privacyS5cLabel")}</strong>{t("auth.privacyS5cText")}</li>
              <li><strong>{t("auth.privacyS5dLabel")}</strong>{t("auth.privacyS5dText")}</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS6Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Ci riserviamo il diritto di aggiornare questa Informativa sulla Privacy. Qualsiasi modifica
              significativa sarà comunicata tramite l'applicazione o via email all'indirizzo associato al tuo account.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">{t("auth.privacyS7Title")}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t("auth.privacyS7Body")}<br />
              <a href="mailto:gabriele.forestieri0912@gmail.com" className="text-blue-600 dark:text-blue-400 underline">
                gabriele.forestieri0912@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
