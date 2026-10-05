---
title: "Registrarsi"
description: "Crea un account Taskly con il modulo email oppure usa la registrazione Google quando è configurata."
section: "per-iniziare"
order: 20
route: "/register"
tags: ["account", "registrazione", "Google"]
status: "stable"
updated: "2026-10-05"
---

La pagina di registrazione richiede nome, email e password. Se Google è configurato per l'app, puoi anche usare il pulsante di registrazione Google.

## Dove la trovi

Apri [Registrati](/register), raggiungibile anche dal link di registrazione nella pagina [Accedi](/login).

## Creare l'account con email

:::steps
:::step "Apri il modulo"
Vai alla pagina **Registrati** e inserisci nome completo, indirizzo email e password.
:::
:::step "Invia la registrazione"
Seleziona **Registrati** e attendi il risultato. Durante l'invio il pulsante indica **Registrazione in corso…**.
:::
:::step "Segui la conferma"
Se la richiesta riesce, la pagina mostra il messaggio ricevuto dal server e dopo due secondi apre la pagina di accesso.
:::
:::

## Registrazione Google

Quando il provider è disponibile nella schermata, seleziona l'opzione Google e completa il passaggio di autenticazione. Se il client Google non è configurato, la pagina mostra un avviso che segnala la mancata disponibilità dell'opzione.

| Risultato | Cosa mostra l'app |
| --- | --- |
| Invio completato | Messaggio di successo e reindirizzamento alla pagina di accesso. |
| Errore del server | Messaggio restituito dal server oppure un messaggio generico di riprova. |
| Errore Google | Messaggio di errore per una registrazione Google annullata o non riuscita. |

## Problemi comuni

Se appare un errore, ricontrolla l'indirizzo email e riprova. `{{DA VERIFICARE: criteri password, verifica dell'indirizzo email e passaggi successivi all'invio dipendono dalla configurazione Supabase e non sono determinabili solo dal modulo client.}}`
