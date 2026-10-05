---
title: "Consultare le attività recenti"
description: "La pagina Attività mostra gli eventi recenti recuperati dal servizio dell'app."
section: "sezioni"
order: 120
route: "/activity"
tags: ["attività", "cronologia", "eventi"]
status: "stable"
updated: "2026-10-05"
---

La pagina **Attività** mostra gli eventi recenti recuperati dal servizio dell'app. Per ogni elemento sono visualizzati un titolo (o il tipo di evento), il testo descrittivo e la data.

## Consultare l'elenco

1. Apri `/activity`.
2. Scorri gli elementi visualizzati in ordine restituito dal servizio.
3. Se l'elenco è vuoto, la pagina mostra il messaggio di stato vuoto.

La pagina richiede al backend fino a 200 attività recenti. Non presenta controlli per filtrare, modificare o eliminare gli eventi.

:::callout note
{{DA VERIFICARE: quali eventi vengono registrati e come il backend ordina l'elenco; la pagina non mostra filtri o controlli di paginazione.}}
:::
