---
title: "Collegare le integrazioni"
description: "Collega Google Calendar o un webhook Slack dall'Hub Integrazioni."
section: "sezioni"
order: 130
route: "/integrations"
tags: ["integrazioni", "Google Calendar", "Slack", "webhook"]
status: "stable"
updated: "2026-10-05"
---

L'Hub Integrazioni permette di collegare Google Calendar e Slack. L'interfaccia include anche una sezione informativa per il webhook API Taskly.

## Google Calendar

1. Apri `/integrations`.
2. Seleziona **Connetti** nella scheda Google Calendar.
3. Completa l'autorizzazione Google se il provider è configurato sul server.
4. Per scollegare un account già connesso, seleziona **Scollega**.

Se il server non restituisce un URL di autorizzazione, la pagina mostra un messaggio che segnala la configurazione Google mancante.

## Slack

1. Incolla l'URL del webhook Slack.
2. Seleziona **Collega webhook**.
3. Dopo il collegamento, puoi inserire un messaggio facoltativo e selezionare **Invia test**.
4. Per rimuovere la connessione, seleziona **Disconnetti**.

La scheda **Webhook API** mostra il percorso di esempio `POST /api/webhooks/taskly`; questa documentazione utente non descrive la configurazione tecnica del servizio.

:::callout warning
La scheda Integrazioni nelle Impostazioni contiene etichette e descrizioni promozionali, ma il collegamento operativo è nell'Hub `/integrations`. Non dare per attiva la sincronizzazione automatica delle scadenze solo perché è descritta nella scheda Impostazioni.
:::

:::callout note
Zoom e Google Meet sono mostrati nel flusso di importazione delle riunioni e sono distinti dall'Hub Integrazioni. Per questi provider consulta [Trascrivere o importare una riunione](/docs/sezioni/trascrizioni).
:::
