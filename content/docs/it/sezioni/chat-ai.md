---
title: "Usare la chat AI"
description: "Apri la chat dalla dashboard, prova i suggerimenti e invia richieste all'assistente."
section: "sezioni"
order: 170
route: "/dashboard?ai=1"
tags: ["chat AI", "assistente", "suggerimenti", "pagine"]
status: "stable"
updated: "2026-10-05"
---

La chat AI è accessibile dal pulsante mobile in basso a destra nella dashboard. Puoi aprirla a schermo intero, inviare richieste e copiare le risposte.

## Inviare una richiesta

1. Apri la chat con il pulsante viola **AI Assistant** oppure vai a `/dashboard?ai=1`.
2. Seleziona uno dei suggerimenti iniziali, per esempio “Riassumi le mie note”, oppure scrivi una richiesta.
3. Premi Invio per inviare; usa Maiusc+Invio per andare a capo.
4. Se una risposta è in corso, usa il pulsante di arresto per fermarla.
5. Seleziona l'icona di copia accanto a una risposta per copiarne il testo.

La chat invia la richiesta al servizio AI e può includere un riepilogo delle pagine dell'utente come contesto. Se il servizio non è raggiungibile, la UI mostra un errore.

## Azioni sulle pagine

La chat riconosce anche alcune richieste esplicite:

- `Crea una pagina <nome>`
- `Rinomina pagina <nome attuale> in <nuovo nome>`
- `Cambia icona della pagina <nome> a <icona>`

Per le azioni di rinomina e icona, il nome pagina deve corrispondere a una pagina esistente. Le richieste di modifica non riconosciute vengono inviate al servizio AI come normale messaggio.

## Aprire e chiudere

Usa il controllo di espansione per aprire la chat a pieno schermo. Il parametro `ai` nell'URL apre la modalità estesa; chiudendo la chat, la pagina rimuove il parametro.

:::callout warning
Controlla le risposte AI prima di applicarle o condividerle. La UI include un pulsante `+` per allegati e un'icona input vocale, ma risultano disabilitati nell'interfaccia esaminata.
:::
