---
title: "Scrivere e organizzare Note"
description: "Usa blocchi, comandi rapidi, tag e versioni per organizzare il contenuto di una pagina Note."
section: "sezioni"
order: 50
route: "/notes"
tags: ["note", "blocchi", "editor", "versioni", "tag"]
status: "stable"
updated: "2026-10-05"
---

Le pagine di tipo **Note** offrono un editor a blocchi. La route `/notes` apre una pagina Note esistente se la trova; se non ne esiste una, propone di tornare alla dashboard.

## Modificare una nota

1. Crea o apri una pagina di tipo **Note**.
2. Scrivi nel blocco. Digita `/` per aprire il menu dei blocchi.
3. Seleziona una tipologia: testo, titoli, checkbox, elenchi, toggle, calendario task, habit tracker, codice, video YouTube, file/documento o divisore.
4. Riordina o rimuovi blocchi usando i controlli del blocco.
5. Aggiungi tag dalla sezione tag della pagina.

## Strumenti disponibili

- I blocchi checkbox possono essere completati.
- I blocchi toggle possono contenere righe annidate.
- Puoi cambiare colore del testo per un blocco.
- Il menu dei comandi permette di creare anche pagine correlate (per esempio lista Task o Obiettivi).
- Per i riferimenti a pagine, digita `[[` e cerca una pagina esistente.
- Puoi usare **Versioni** per salvare uno snapshot manuale, ripristinare una versione o eliminarla.
- **Pubblica** memorizza un flag nei dati della pagina e registra un evento di attività; **Copia link** copia un URL interno `/dashboard?page=…`, non un link pubblico autonomo.

:::callout warning
Il codice esaminato non crea una route pubblica per la nota: il link copiato apre la dashboard e può richiedere l'accesso all'account. Non considerare il flag **Pubblica** come condivisione pubblica verificata.
:::

:::callout note
L'editor può cifrare i blocchi sul client con una password e richiede la stessa password per sbloccarli. Se la password viene dimenticata, il componente non espone un flusso di recupero; conserva la password in modo sicuro prima di attivare la cifratura. La cifratura riguarda i contenuti dei blocchi, non prova che metadati o altre copie siano cifrati.
:::

## Pagina Note vuota

Se non hai ancora una pagina Note, apri la [dashboard](/dashboard) e creane una dal selettore **Privato**.
