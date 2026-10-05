---
title: "Contattare il supporto"
description: "Invia una richiesta dal modulo Supporto con messaggio obbligatorio e contatti facoltativi."
section: "riferimenti"
order: 10
route: "/support"
tags: ["supporto", "assistenza", "contatto"]
status: "stable"
updated: "2026-10-05"
---

La pagina **Supporto** contiene un modulo che invia la richiesta al servizio Taskly. Il messaggio è obbligatorio; nome ed email sono facoltativi nel modulo.

## Inviare una richiesta

1. Apri `/support`.
2. Facoltativamente inserisci nome ed email.
3. Scrivi il messaggio.
4. Seleziona **Invia** e attendi l'esito.
5. Se l'invio riesce, la pagina mostra la conferma e permette di inviare un'altra richiesta.

Se si verifica un errore, la pagina mostra **Errore nell'invio. Riprova più tardi.** Controlla la connessione e riprova.

:::callout note
La pagina usa il servizio `/api/support`; l'indirizzo di risposta e i tempi di gestione non sono indicati nel modulo. Per contatti legali, l'informativa privacy mostra un indirizzo email di contatto.
:::
