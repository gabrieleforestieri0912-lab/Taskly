---
title: "Creare un account e accedere"
description: "Informazioni verificate nel progetto sulle route di registrazione e accesso a Taskly."
section: "per-iniziare"
order: 10
route: "/login"
tags: ["account", "accesso", "registrazione"]
status: "stable"
updated: "2026-10-05"
---

La pagina di accesso invia email e password al servizio di autenticazione. Se Google è configurato nell'app, puoi anche accedere con Google.

## Dove trovi accesso e registrazione

- Accesso: [`/login`](/login).
- Registrazione: [`/register`](/register).

## Accedere a Taskly

:::steps
1. Apri [`/login`](/login).
2. Inserisci email e password e seleziona **Accedi**; se l'opzione Google è disponibile, puoi completare l'accesso da lì.
3. Se la richiesta riesce, Taskly memorizza i token di sessione nel browser e apre la dashboard.
:::

:::callout warning
Il link **Password dimenticata?** nella schermata punta attualmente a `#` e non avvia un flusso di recupero password.
:::

## Creare un account

Per i passaggi dettagliati consulta [Registrarsi](/docs/per-iniziare/registrazione).

:::callout note
La disponibilità del pulsante Google dipende dalla configurazione `NEXT_PUBLIC_GOOGLE_CLIENT_ID`; il server può inoltre richiedere la conferma dell'email.
:::

## Problemi comuni

Se l'accesso fallisce, la schermata mostra il messaggio restituito dal servizio oppure un messaggio generico. Se viene richiesta la conferma dell'email, controlla la casella di posta. {{DA VERIFICARE: criteri password e conferma email variano con la configurazione server.}}
