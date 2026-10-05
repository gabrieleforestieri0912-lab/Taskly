---
title: "Impostazioni, profilo e preferenze"
description: "Esplora le schede delle impostazioni per profilo, aspetto, lingua, notifiche, workflow e dati."
section: "account"
order: 10
route: "/settings"
tags: ["impostazioni", "profilo", "tema", "lingua", "preferenze"]
status: "stable"
updated: "2026-10-05"
---

La pagina **Impostazioni** raccoglie schede per Profilo, Aspetto, Lingua, Notifiche, Workflow, Integrazioni, Dati, Sicurezza e Fatturazione. Apri una scheda dal menu laterale della pagina; il parametro `tab` nell'URL può selezionare direttamente alcune schede, ad esempio `/settings?tab=appearance`.

## Profilo

Puoi modificare nome, email, ruolo/professione e biografia, quindi selezionare **Salva Profilo**. La schermata salva questi campi nel `localStorage` del browser: il salvataggio non dimostra una modifica dell'indirizzo email o dei dati account sul server.

## Aspetto e lingua

- Cambia tema chiaro/scuro; la scelta viene applicata immediatamente.
- Scegli un colore d'accento e un font; la schermata salva subito queste preferenze nel browser.
- Scegli la densità dell'interfaccia e salva le preferenze con il pulsante principale.
- Imposta una delle lingue mostrate: Italiano, English, Español o Deutsch.
- Scegli formato orario 12/24 ore e primo giorno della settimana.

## Notifiche e workflow

Le schede mostrano interruttori per promemoria scadenze, digest email, suoni e avvisi riunioni. Nella scheda Workflow puoi impostare la vista predefinita, la durata del focus e della pausa e i suggerimenti proattivi AI. Seleziona **Salva preferenze** per memorizzare le opzioni supportate nel browser.

:::callout warning
La UI espone opzioni di notifica e workflow; non tutte corrispondono a servizi di notifica attivi. {{DA VERIFICARE: quali preferenze sono applicate dall'app e se digest email, avvisi riunioni e promemoria vengono effettivamente inviati.}}
:::

## Dati e sicurezza

La scheda **Dati** offre **Scarica Backup JSON** e **Svuota Cache**. Il backup generato nel codice include data di esportazione, dati profilo, tema, schede aperte e pagine espanse; non include tutte le pagine, task e note dichiarati dal testo promozionale.

La scheda **Sicurezza** mostra campi password e pulsanti per aggiornare la password o attivare 2FA, ma i pulsanti producono solo messaggi locali e non eseguono un flusso di sicurezza verificato.

:::callout danger
Non usare i controlli password/2FA come prova di una modifica delle credenziali o dell'attivazione dell'autenticazione a due fattori. {{DA VERIFICARE: i flussi di sicurezza reali e l'eventuale cancellazione dell'account.}}
:::

Per gestire il piano, consulta [Piano e fatturazione](/docs/account/fatturazione).
