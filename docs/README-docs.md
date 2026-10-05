# Documentazione utente Taskly

La documentazione pubblica si trova in `/docs`; i contenuti sono file Markdown in `content/docs/it/`. Il registro carica automaticamente i nuovi file, li raggruppa nella sidebar e li include nella ricerca e nella navigazione tra guide.

## Aggiungere una guida

1. Crea un file `.md` in una cartella di sezione sotto `content/docs/it/`. Il percorso determina lo slug: `sezioni/calendario.md` diventa `/docs/sezioni/calendario`.
2. Inserisci il frontmatter richiesto:

   ```yaml
   ---
   title: "Titolo della guida"
   description: "Descrizione di massimo 160 caratteri."
   section: "sezioni"
   order: 10
   route: "/calendar"
   tags: ["calendario", "date"]
   status: "stable"
   updated: "2026-10-05"
   ---
   ```

   `section` usa uno slug minuscolo, ad esempio `overview`, `per-iniziare`, `workspace`, `sezioni`, `account` o `riferimenti`. `order` deve essere un intero non negativo e univoco nella sezione. `route` è una route app collegata oppure una stringa vuota per una guida concettuale. `status` accetta `stable`, `beta` o `coming-soon`. Le liste `tags` devono usare la sintassi di array JSON, con virgolette doppie.

3. Scrivi contenuti aderenti al comportamento verificabile nell'app. Usa `{{DA VERIFICARE: ...}}` per le incertezze e `status: "coming-soon"` per funzioni presenti nell'interfaccia ma non operative o non completate. Non presentare prezzi, limiti, integrazioni o scorciatoie non confermati.
4. Collega le guide con link Markdown assoluti, per esempio `[Calendario](/docs/sezioni/calendario)`. Il controllo automatico verifica link a `/docs`, ancore e route app.
5. Esegui i controlli descritti di seguito e rigenera l'indice di ricerca se i contenuti sono cambiati.

Il motore supporta il sottoinsieme Markdown implementato in `src/components/docs/DocContent.tsx`, incluse liste, tabelle e direttive come `:::callout note ... :::`, `:::steps`, `:::step`, `:::badge` e `:::screenshot alt="..." caption="..."`. I componenti MDX non sono abilitati: i file sono Markdown semplice.

## Controlli e indice ricerca

```powershell
npm run docs:check
npx eslint docs.config.ts scripts/check-docs.mts src/lib/docs/content.ts src/components/docs
npx tsx scripts/build-docs-index.mts
npm run typecheck
npm run build
```

`npm run docs:check` valida i campi del frontmatter, gli slug e gli ordini unici per sezione, la copertura delle route Next.js, i link interni e alle route app, gli anchor e controlli statici di accessibilità per gerarchia dei titoli e testo alternativo. La allowlist è mantenuta in `docs.config.ts`; ogni eccezione deve avere una motivazione. Al momento esclude le route API e la callback tecnica `/auth/callback`.

`npx tsx scripts/build-docs-index.mts` genera `public/docs-search-index.json` dal registro dei contenuti. Eseguilo dopo aver aggiunto o modificato guide e includi il JSON aggiornato nello stesso commit. Il generatore non è collegato automaticamente a `prebuild`.

La ricerca UI, la sidebar, le breadcrumb, la TOC e i collegamenti precedente/successivo sono derivati dai metadati e dal testo prodotti dal registro in `src/lib/docs/content.ts` e passati dal layout alla UI. Il JSON generato non è attualmente importato dal runtime: è un artefatto derivato da includere e mantenere aggiornato, non la sorgente della ricerca corrente.

## Qualità editoriale e accessibilità

- Usa un solo H1 per pagina (il titolo viene generato dal frontmatter), poi H2 e H3 senza saltare livelli.
- Le immagini Markdown e le direttive Screenshot devono includere testo alternativo descrittivo.
- Per controllare i focus, naviga sidebar, ricerca e link usando Tab, Maiusc+Tab, Invio ed Esc.
- Rispetta i token Taskly e il supporto `prefers-reduced-motion`; non aggiungere animazioni che causano spostamenti del layout.
- Per verificare i comportamenti documentati, apri una pagina di ogni sezione e prova ricerca, TOC e navigazione tra guide.

## Stato e decisioni aperte

La mappa route→guida e gli elementi `coming-soon` sono mantenuti in `docs-inventory.md`. Le incertezze puntuali sono marcate nei contenuti con `{{DA VERIFICARE: ...}}`. Il portale non modifica la UI esistente per aggiungere link contestuali; la route `/docs` è pubblica.
