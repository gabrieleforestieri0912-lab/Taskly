---
title: "Trascrivere o importare una riunione"
description: "Registra dal microfono con trascrizione del browser oppure importa appunti e file VTT, TXT o SRT."
section: "sezioni"
order: 100
route: "/transcription"
tags: ["trascrizione", "microfono", "Zoom", "Google Meet", "VTT", "SRT"]
status: "stable"
updated: "2026-10-05"
---

La pagina Trascrizione permette di registrare audio dal microfono, visualizzare il testo riconosciuto dal browser, generare un recap e salvare la riunione. Puoi anche importare appunti o trascrizioni da file.

## Registrare dal microfono

1. Apri `/transcription` e consenti l'accesso al microfono quando il browser lo richiede.
2. Seleziona **Avvia registrazione**.
3. Metti in pausa o riprendi quando necessario; seleziona **Stop** per concludere.
4. Ascolta la registrazione con il player audio.
5. Inserisci un titolo facoltativo, genera un recap se desideri e seleziona **Salva trascrizione**.

La trascrizione live dipende dal supporto Speech Recognition del browser. Se non è disponibile, la registrazione audio può essere completata, ma la UI avvisa che la trascrizione live non è disponibile.

## Importare una trascrizione

1. Seleziona la scheda **Importa**.
2. Scegli **Zoom**, **Meet** o **File**.
3. Per File, carica `.vtt`, `.txt` o `.srt`, oppure incolla il testo.
4. Inserisci un titolo e, se necessario, l'URL della riunione o l'ID Zoom.
5. Facoltativamente seleziona **Genera recap**.
6. Seleziona **Importa riunione**.

Per Zoom e Google Meet è disponibile un pulsante di connessione OAuth; i provider devono essere configurati sul server. La UI permette di inserire i dati della trascrizione e importare; la disponibilità di recupero automatico di registrazioni o trascrizioni dipende dall'integrazione configurata.

:::callout warning
La registrazione richiede un browser che supporti `MediaRecorder` e l'autorizzazione al microfono. La trascrizione live usa il riconoscimento vocale integrato nel browser, impostato su italiano; non è garantita su tutti i browser.
:::

:::callout note
Il salvataggio conserva una copia locale e prova a sincronizzare la riunione col server per gli utenti autenticati. L'app torna poi all'[archivio Riunioni](/docs/sezioni/riunioni).
:::
