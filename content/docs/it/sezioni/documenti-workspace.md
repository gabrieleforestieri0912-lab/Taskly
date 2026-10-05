---
title: "Modificare un documento workspace"
description: "Modifica documenti condivisi, menziona membri e collabora con i commenti workspace."
section: "sezioni"
order: 190
route: "/workspace/[id]/doc/[slug]"
tags: ["documento", "workspace", "editor", "menzioni", "commenti"]
status: "stable"
updated: "2026-10-05"
---

Un documento workspace è accessibile all'indirizzo `/workspace/<id>/doc/<slug>`. L'editor consente di modificare il contenuto strutturato e salvarlo nel workspace.

## Modificare e salvare

1. Apri un workspace e il collegamento **Documento**, oppure visita il percorso del documento. Per leggere o modificare il contenuto devi appartenere al workspace.
2. Scrivi nel corpo del documento.
3. Usa la barra strumenti per applicare titoli, elenchi puntati o numerati, citazioni, blocchi di codice, divisori, toggle, callout e liste attività.
4. Seleziona **Salva** per salvare manualmente; l'editor esegue anche un salvataggio automatico dopo le modifiche.
5. Per aggiungere un collegamento, usa lo strumento link e inserisci un URL o un percorso workspace.
6. Digita `@` e seleziona un membro per menzionarlo. Digita `[[` per cercare un altro documento del workspace e inserirne il riferimento.
7. Scorri sotto l'editor per leggere o aggiungere commenti. Seleziona **Menziona un membro** per inviare una notifica Inbox a una persona specifica.

I ruoli **Owner**, **Admin** e **Membro** possono modificare il documento e commentare. **Viewer** può leggere il documento e i commenti, ma non modificarli.

:::callout note
`@` è per i membri; `[[` è per i collegamenti ad altri documenti. Le modifiche non vengono sincronizzate in tempo reale tra gli utenti.
:::
