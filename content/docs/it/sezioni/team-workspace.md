---
title: "Gestire Team e Workspace"
description: "Crea workspace, aggiungi membri e assegna ruoli dalla pagina Team & Workspaces."
section: "sezioni"
order: 140
route: "/team"
tags: ["team", "workspace", "membri", "ruoli", "collaborazione"]
status: "stable"
updated: "2026-10-05"
---

La pagina **Team & Workspaces** consente di creare workspace e gestire i membri associati. La gestione richiede l'accesso; la schermata mostra un messaggio se l'utente non è autenticato.

## Creare un workspace

1. Apri `/team`.
2. Seleziona **Nuovo Workspace**.
3. Inserisci un nome e seleziona **Crea**.
4. Espandi la scheda del workspace per vedere i membri.

## Aggiungere membri e cambiare ruoli

1. Espandi il workspace.
2. Inserisci l'indirizzo email della persona.
3. Seleziona **Membro**, **Admin** o **Viewer**.
4. Seleziona **Invita**.
5. Per aggiornare un ruolo, usa il menu accanto al membro. Il proprietario è mostrato come tale e non ha un selettore di ruolo.

La schermata mostra messaggi in caso di permessi insufficienti, utente non trovato o errori di rete. I ruoli disponibili nel selettore sono owner, admin, member e viewer; il menu di aggiunta propone member, admin e viewer.

:::callout warning
La presenza della gestione workspace e dei ruoli non implica collaborazione realtime. Il progetto ha rimosso la collaborazione live con cursori remoti e aggiornamenti Socket.IO.
:::

## Board e documenti workspace

Apri un workspace per trovare i collegamenti alla board e al documento `home`. La [board workspace](/docs/sezioni/board-workspace) mostra attualmente colonne di stato e task restituiti dal backend; i controlli per modificare o creare task non sono presenti nella pagina esaminata.
