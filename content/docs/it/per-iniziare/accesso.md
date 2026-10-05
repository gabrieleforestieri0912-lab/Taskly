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

Taskly usa Supabase Auth per l'autenticazione. Il progetto documenta l'accesso con email e password e il provider Google; la schermata consente di registrarsi e accedere dalle route dedicate.

## Dove trovi accesso e registrazione

- Accesso: [`/login`](/login).
- Registrazione: [`/register`](/register).

## Accedere a Taskly

:::steps
1. Apri la pagina di [accesso](/login).
2. Usa il metodo disponibile nella schermata.
3. Dopo l'accesso, apri la dashboard.
:::

:::callout warning
{{DA VERIFICARE: verificare i campi, l'ordine del flusso, i messaggi di errore, la conferma email e il recupero password mostrati nella schermata attuale.}}
:::

## Creare un account

:::steps
1. Apri la pagina di [registrazione](/register).
2. Completa i passaggi presentati dal modulo.
3. Segui le eventuali indicazioni mostrate dopo l'invio.
:::

:::callout note
Il codice del progetto indica email/password e Google come metodi configurati. {{DA VERIFICARE: verificare quali metodi sono effettivamente esposti e attivi nell'interfaccia distribuita.}}
:::

## Problemi comuni

Se il login segnala che l'email non è stata confermata, l'API suggerisce di controllare la casella di posta. Le opzioni di conferma dipendono dalla configurazione del progetto Supabase.
