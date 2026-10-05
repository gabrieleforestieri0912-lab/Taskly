# Inventario documentazione Taskly

Fase 1 — inventario iniziale derivato dalle route e dai componenti esaminati.
La mappa è una proposta da revisionare prima di implementare la documentazione.
Le voci `{{DA VERIFICARE: ...}}` indicano comportamenti che non è corretto
descrivere come certi senza ulteriore controllo della schermata o del backend.

## Route dell'app

| Route | File sorgente | Categoria e scopo verificabile | Note per la documentazione |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Landing page, con hero e sezioni marketing | Azioni di registrazione e navigazione verso le sezioni della landing sono presenti. |
| `/login` | `src/app/login/page.ts` → `src/auth/LoginPage.tsx` | Accesso | `{{DA VERIFICARE: metodi di accesso, validazioni, messaggi di errore e recupero password nella schermata.}}` |
| `/register` | `src/app/register/page.ts` → `src/auth/RegisterPage.tsx` | Registrazione | `{{DA VERIFICARE: campi, provider disponibili, conferma email e messaggi mostrati.}}` |
| `/dashboard` | `src/app/dashboard/page.tsx` | Home dell'area di lavoro, pagine private, viste operative e onboarding | Supporta selezione pagina, query `view=mytasks`, `view=inbox`, `trash=1` e modalità AI con query `ai`. |
| `/tasks` | `src/app/tasks/page.tsx` | Route dedicata ai task | `{{DA VERIFICARE: se è un elenco distinto o un reindirizzamento e quali azioni espone.}}` |
| `/notes` | `src/app/notes/page.tsx` | Route dedicata alle note | `{{DA VERIFICARE: contenuto e relazione con le pagine Note della dashboard.}}` |
| `/calendar` | `src/app/calendar/page.tsx` | Route dedicata al calendario | La dashboard può aprire una pagina di tipo Calendario o questa route quando non ne trova una. |
| `/meetings` | `src/app/meetings/page.tsx` | Riunioni | Sono presenti funzioni di riepilogo/recap e stati di caricamento nei relativi componenti; `{{DA VERIFICARE: tutte le azioni e modalità di importazione nella schermata.}}` |
| `/transcription` | `src/app/transcription/page.tsx` | Trascrizione | Sono presenti azioni per riepilogare e salvare; `{{DA VERIFICARE: sorgenti audio supportate, flusso di registrazione e limiti.}}` |
| `/activity` | `src/app/activity/page.tsx` | Attività recenti | `{{DA VERIFICARE: categorie mostrate e azioni disponibili.}}` |
| `/integrations` | `src/app/integrations/page.tsx` | Integrazioni | Il codice mostra flussi per Google e Slack; `{{DA VERIFICARE: integrazioni effettivamente attivabili e relativi permessi.}}` |
| `/templates` | `src/app/templates/page.tsx` | Galleria/area template | La dashboard permette di salvare un template personalizzato e aprire la galleria; `{{DA VERIFICARE: contenuto e azioni della route autonoma.}}` |
| `/team` | `src/app/team/page.tsx` | Area Team | `{{DA VERIFICARE: membri, ruoli e collaborazione realmente funzionanti.}}` |
| `/settings` | `src/app/settings/page.tsx` | Impostazioni | La sidebar collega alle schede profilo, aspetto, notifiche, workflow, dati, sicurezza e fatturazione; `{{DA VERIFICARE: quali schede sono operative e quali preferenze salvano.}}` |
| `/docs` | `src/app/docs/page.tsx`, `src/app/docs/layout.tsx` | Pagina di documentazione attuale | Placeholder semplice: titolo, intro e tre riquadri informativi, senza contenuti navigabili. |
| `/support` | `src/app/support/page.tsx`, `src/app/support/SupportForm.tsx` | Supporto | Modulo di supporto; `{{DA VERIFICARE: campi, validazioni, canale di invio e messaggi.}}` |
| `/privacy` | `src/app/privacy/page.tsx` | Informativa privacy | Pagina legale. |
| `/terms` | `src/app/terms/page.tsx` | Termini di servizio | Pagina legale. |
| `/workspace/[id]` | `src/app/workspace/[id]/page.tsx` | Workspace dinamico per identificatore | `{{DA VERIFICARE: accesso, azioni, ruoli e differenze rispetto alle pagine private della dashboard.}}` |
| `/workspace/[id]/board` | `src/app/workspace/[id]/board/page.tsx` | Board dinamica del workspace | `{{DA VERIFICARE: operazioni board effettivamente disponibili.}}` |
| `/workspace/[id]/doc/[slug]` | `src/app/workspace/[id]/doc/[slug]/page.tsx` | Documento dinamico nel workspace | Il README segnala documenti con backlinks; `{{DA VERIFICARE: azioni dell'editor e comportamento dei backlinks dalla UI.}}` |

### Route non-pagina

- `src/app/robots.ts` e `src/app/sitemap.ts` generano metadati per crawler.
- Sono presenti API Route sotto `src/app/api/**/route.ts`; non sono pagine di navigazione utente.
- Raggruppamento delle API individuate: autenticazione (`auth/*`), dati utente e abbonamento (`user/*`), task (`tasks/*`), risorse pagina/idee/obiettivi (`resources/*`), documenti e ricerca (`doc/*`, `search/vector`), workspace e membri (`workspaces/*`), template (`templates/*`), riunioni (`meetings/*`), integrazioni (`integrations/*`), notifiche (`notifications/*`), attività (`activity/*`), analytics (`analytics/*`), supporto (`support`), AI (`ai/chat`), billing (`billing/*`) e health (`health`).
- `src/proxy.ts` tratta le API con rate limiting e audit logging, secondo il README.

## Sidebar della dashboard

File guida: `src/components/Sidebar.tsx`, `src/components/sidebar/PageTreeItem.tsx`,
`src/components/sidebar/SidebarSection.tsx`, `src/components/sidebar/SidebarQuickBar.tsx`.

### Azioni rapide e navigazione

- Ricerca veloce; tooltip indica `Ctrl+K` e la ricerca di pagine, task e azioni.
- Home (`/dashboard`), Task (`/dashboard?view=mytasks`), Inbox (`/dashboard?view=inbox`).
- Creazione rapida di Pagina vuota e Chat; Trascrizione; Riunioni (`/meetings`); Calendario, che apre una pagina di calendario esistente o `/calendar`.
- Scheda Google Calendar nella sidebar.
- Sezione `Privato`, con pagine in albero. Il pulsante `+` della sezione e il CTA nello stato vuoto aprono `AddPageModal`; da qui si può scegliere una tipologia o un template.
- Le pagine possono avere sottopagine annidate. La sidebar include aggiunta di sottopagina, rinomina, duplicazione, eliminazione, espansione/compressione e riordino/spostamento tramite drag-and-drop.
- Eliminazione pagina: dialog di conferma; la UI specifica che l'operazione si può annullare dal Cestino.
- Le pagine eliminate possono essere cercate, ripristinate o eliminate definitivamente dal menu Cestino. La dashboard applica una retention di 30 giorni alle pagine eliminate.
- Menu `Altro`: Impostazioni, Cestino, Aiuto e Invita membri.
- Menu Aiuto: link a Documentazione, Supporto e Termini.
- Menu account: preferenze rapide tema chiaro/scuro e lingua IT/EN; collegamenti a panoramica impostazioni, profilo/account, aspetto/colori/font, notifiche/promemoria, workflow/produttività, integrazioni, dati/backup/esportazione, sicurezza/password/2FA, abbonamento/fatturazione; Disconnetti.

### Comportamenti da non documentare come già disponibili

- Nel menu `Invita membri`, il pulsante `Invia` imposta uno stato locale “Inviato!” e pulisce l'email; non è stato individuato un invio API nel gestore del pulsante. Anche “Copia link” copia l'origine corrente del sito. `{{DA VERIFICARE: l'invito è solo UI dimostrativa o esiste un flusso funzionante altrove?}}`
- La cronologia AI presenta fino a otto messaggi, ma gli elementi sono pulsanti senza gestore di click visibile nel componente. `{{DA VERIFICARE: selezionare un messaggio della cronologia ripristina una conversazione?}}`
- L'etichetta `Sicurezza, Password & 2FA` è presente nel menu; non prova che cambio password o autenticazione a due fattori siano implementati. `{{DA VERIFICARE: funzionalità effettive della scheda Sicurezza.}}`
- Il README descrive la collaborazione realtime con Socket.IO come rimossa; non promettere cursori remoti o aggiornamenti live.

### Scorciatoie osservate

| Combinazione | Comportamento nel codice | Fonte |
|---|---|---|
| `Ctrl+K` / `Cmd+K` | Porta il focus al primo input `role="search"` o, in fallback, al primo input della pagina. | `src/components/KeyboardShortcuts.tsx`; tooltip in `Sidebar.tsx`. |
| `Ctrl+?` / `Cmd+?` | Mostra un alert testuale con la sola scorciatoia per la ricerca. | `src/components/KeyboardShortcuts.tsx`. |
| Frecce, `F2`, `Enter`, `Spazio` | Navigazione del treeview pagine, espansione/compressione, avvio rinomina e apertura pagina. | `src/components/sidebar/PageTreeItem.tsx`. |
| `Escape` | Chiude diversi menu/dialog della sidebar; nella voce albero chiude il menu contestuale. | `Sidebar.tsx`, `PageTreeItem.tsx`. |

Non è stato trovato un catalogo completo centralizzato delle scorciatoie. Non
presentare altre combinazioni come supportate senza verifica.

## Funzionalità dashboard osservate

Fonte: `src/app/dashboard/page.tsx` e componenti importati.

- Home/dashboard, vista `Task`, vista `Inbox`, pagine private, cestino e pannello AI.
- Pagine per tipologia: task (`ItemList`), obiettivi (`GoalsView`), calendario
  (`CalendarView`), note (`NotesView`), Brain Dump (`BrainDumpView`) e pagina
  vuota (`EmptyPageView`); alcune tipologie/template sono selezionate con
  `AddPageModal` e `TemplateGalleryModal`.
- Onboarding “Inizia da qui” con passi per creare pagina/task, completare task,
  usare template, organizzare lo spazio, provare la ricerca e personalizzare
  Home (`OnboardingChecklist`).
- Pagina attiva: rinomina, modifica icona e colore, menu pagina con salva come
  template, galleria template e copia link. In alcune viste è presente export
  PDF. `{{DA VERIFICARE: disponibilità dell'export in base alla tipologia e
  contenuto effettivamente incluso.}}`
- Il piano utente può limitare il numero di pagine: quando il limite è
  raggiunto la dashboard mostra un avviso con il nome del piano e un link alla
  sezione prezzi. Non documentare soglie o prezzi senza fonte aggiornata.
- La dashboard legge eventi di onboarding e rimuove dal cestino le pagine
  scadute oltre 30 giorni.
- La pagina non trovata è anche un messaggio d'errore delle azioni AI di
  modifica/aggiunta contenuti su pagine Note non risolte; non è l'unico
  significato possibile del messaggio.

## Account, piani, collaborazione, import/export e notifiche

- Autenticazione: Supabase Auth, email/password e provider Google secondo
  README; le schermate effettive e il flusso di conferma email vanno verificati.
- Abbonamenti: la dashboard usa `plan.maxPages`, la sidebar mostra un link
  `Abbonamento & Fatturazione`, e le API includono checkout, portal e webhook
  Stripe. `{{DA VERIFICARE: nomi e prezzi dei piani, limiti, gestione upgrade,
  downgrade e fatture esposti all'utente.}}`
- Integrazioni: route e componenti menzionano Google Calendar, Google e Slack;
  le API includono callback Google e Zoom e webhook Slack. `{{DA VERIFICARE:
  provider disponibili nell'interfaccia e stato di ogni flusso.}}`
- Notifiche: sono presenti API di lista e marcatura letta, `NotificationBell` e
  impostazioni `Notifiche & Promemoria`. `{{DA VERIFICARE: eventi generati,
  frequenza di polling e controlli utente.}}`
- Import/Export: UI di impostazioni etichetta `Dati, Backup & Esportazione`;
  dashboard include export PDF pagina. `{{DA VERIFICARE: formati e operazioni
  di backup/import/export effettivamente implementati.}}`
- Team: route `/team`, workspace members API e invito sidebar sono presenti;
  il README chiarisce che la collaborazione realtime è stata rimossa.
  `{{DA VERIFICARE: flussi di invito e permessi attivi, se esistono.}}`

## Stub e contenuti da verificare

| Elemento | Evidenza | Stato proposto per il contenuto |
|---|---|---|
| Documentazione `/docs` | `src/app/docs/page.tsx` mostra intro e tre riquadri statici (guida rapida, API, FAQ), senza pagine collegate. | Sostituire con contenuti file-based dopo approvazione Fase 2. |
| Invita membri dalla sidebar | Stato locale “Inviato!” senza invocazione API visibile nel pulsante. | `coming-soon` solo se confermato che è stub. |
| Cronologia AI in sidebar | Le voci di messaggio non hanno gestore di selezione visibile. | `coming-soon` solo se confermato che il ripristino conversazione non esiste. |
| Sicurezza / Password / 2FA | Etichetta di menu, ma UI sottostante non verificata. | Non promettere funzionalità prima dell'audit della scheda. |
| Collaborazione realtime | README dice che Socket.IO e cursori/aggiornamenti live sono stati rimossi. | Non documentare come disponibile. |
| API docs | La pagina placeholder presenta un riquadro “API”, senza contenuto documentale verificato. | Non presentare come reference API esistente. |

## Mappa documentazione e copertura Fase 4

La mappa è stata approvata in Fase 2 e realizzata con contenuti Markdown file-based.
Ogni file è disponibile nella navigazione e nella ricerca generate dal registro.

| Sezione | Guida | Route app collegata | File contenuto | Stato |
|---|---|---|---|---|
| Introduzione | Panoramica Taskly | `/` | `content/docs/it/overview/cose-taskly.md` | Coperta |
| Introduzione | Glossario | Concettuale | `content/docs/it/overview/glossario.md` | Coperta |
| Per iniziare | Registrazione | `/register` | `content/docs/it/per-iniziare/registrazione.md` | Coperta; verifiche Supabase marcate |
| Per iniziare | Accesso | `/login` | `content/docs/it/per-iniziare/accesso.md` | Coperta; verifiche provider marcate |
| Per iniziare | Primo accesso e onboarding | `/dashboard` | `content/docs/it/per-iniziare/primo-accesso.md` | Coperta |
| Workspace | Pagine private e sottopagine | `/dashboard` | `content/docs/it/workspace/pagine-private.md` | Coperta |
| Workspace | Ricerca veloce | `/dashboard` | `content/docs/it/workspace/ricerca.md` | Coperta; risultati da verificare |
| Workspace | Cestino | `/dashboard?trash=1` | `content/docs/it/workspace/cestino.md` | Coperta; tipi ripristinabili da verificare |
| Dashboard | I miei task | `/dashboard?view=mytasks` | `content/docs/it/sezioni/i-miei-task.md` | Coperta |
| Dashboard | Inbox | `/dashboard?view=inbox` | `content/docs/it/sezioni/inbox.md` | Coming soon / comportamento da verificare |
| Dashboard | Pagine Task | `/tasks`, pagina di tipo Task | `content/docs/it/sezioni/task.md` | Coperta |
| Dashboard | Obiettivi | Pagina di tipo Obiettivi | `content/docs/it/sezioni/obiettivi.md` | Coperta |
| Dashboard | Calendario | `/calendar`, pagina di tipo Calendario | `content/docs/it/sezioni/calendario.md` | Coperta; sincronizzazione Google da verificare |
| Dashboard | Note | `/notes`, pagina di tipo Note | `content/docs/it/sezioni/note.md` | Coperta; pubblicazione/blocco da verificare |
| Dashboard | Brain Dump | Pagina di tipo Brain Dump | `content/docs/it/sezioni/brain-dump.md` | Coperta |
| Dashboard | Pagina vuota | Pagina di tipo Pagina vuota | `content/docs/it/sezioni/pagina-vuota.md` | Coperta |
| Dashboard | Home e Analitiche | `/dashboard` | `content/docs/it/sezioni/home-analitiche.md` | Coperta; metriche/widget marcati |
| Dashboard | Chat AI | `/dashboard?ai=1` | `content/docs/it/sezioni/chat-ai.md` | Coperta; risposte dipendono dal servizio AI |
| Dashboard | Riunioni | `/meetings` | `content/docs/it/sezioni/riunioni.md` | Coperta |
| Dashboard | Trascrizioni | `/transcription` | `content/docs/it/sezioni/trascrizioni.md` | Coperta; supporto browser/provider indicato |
| Dashboard | Attività recenti | `/activity` | `content/docs/it/sezioni/attivita-recenti.md` | Coperta; eventi backend da verificare |
| Dashboard | Template | `/templates` | `content/docs/it/sezioni/template.md` | Coperta; galleria copia testo negli appunti |
| Account | Impostazioni | `/settings` | `content/docs/it/account/impostazioni.md` | Coperta; opzioni stub esplicitate |
| Account | Piano e fatturazione | `/settings?tab=billing` | `content/docs/it/account/fatturazione.md` | Coperta; portale/dettagli da verificare |
| Integrazioni | Hub integrazioni | `/integrations` | `content/docs/it/sezioni/integrazioni.md` | Coperta; configurazione server richiesta per OAuth |
| Team | Gestione membri e ruoli | `/team` | `content/docs/it/sezioni/team-workspace.md` | Coperta |
| Workspace | Aprire un workspace | `/workspace/[id]` | `content/docs/it/sezioni/workspace.md` | Coperta; accesso diretto da verificare |
| Workspace | Board workspace | `/workspace/[id]/board` | `content/docs/it/sezioni/board-workspace.md` | Coming soon: vista attualmente solo lettura |
| Workspace | Documento workspace | `/workspace/[id]/doc/[slug]` | `content/docs/it/sezioni/documenti-workspace.md` | Coperta; backlink/permessi da verificare |
| Riferimenti | FAQ | Concettuale | `content/docs/it/overview/faq.md` | Coperta |
| Riferimenti | Scorciatoie | `/dashboard` | `content/docs/it/riferimenti/scorciatoie.md` | Coperta con combinazioni verificate |
| Riferimenti | Supporto | `/support` | `content/docs/it/riferimenti/supporto.md` | Coperta |
| Riferimenti | Privacy | `/privacy` | `content/docs/it/riferimenti/privacy.md` | Coperta; rimanda al testo legale |
| Riferimenti | Termini | `/terms` | `content/docs/it/riferimenti/termini.md` | Coming soon: route contiene testo d'esempio |
| Riferimenti | Novità | Concettuale | `content/docs/it/riferimenti/novita.md` | Coming soon: changelog non presente |
| Documentazione | Indice e navigazione | `/docs` | `content/docs/it/index.md` | Coperta dal motore dinamico Fase 3 |

### Elementi `coming-soon` e verifiche aperte

- `Inbox`: la route è presente nella sidebar, ma non è stata verificata una vista dedicata nel dispatcher dashboard.
- Board dei workspace: elenca i task per stato ma non offre controlli di modifica nella schermata esaminata.
- `/terms`: la pagina contiene testo d'esempio e non termini effettivi.
- Novità: non è stato trovato un changelog utente nel codice.
- Restano marcati `{{DA VERIFICARE: ...}}` i comportamenti per autenticazione e registrazione, onboarding/preset, ricerca, cestino, task assegnati, calendario e sincronizzazione, pubblicazione/blocco Note, widget e metriche, cronologia attività, billing, workspace e documenti. L'elenco puntuale è nei file guida relativi.

### Decisioni approvate in Fase 2

1. Route `/docs` nella stessa app Next.js, contenuti pubblici in italiano sotto `content/docs/it/`.
2. Markdown file-based con frontmatter validato dal registro; non è stato introdotto MDX.
3. Sidebar, breadcrumb, TOC, navigazione precedente/successivo e ricerca derivati dai file; indice JSON rigenerato con `npx tsx scripts/build-docs-index.mts`.
4. Screenshot reali non generati; nessuna integrazione UI aggiunta all'app esistente e nessun helper route-to-doc collegato.
5. I contenuti documentano soltanto comportamenti verificati; le funzioni parziali o incerte sono indicate nel frontmatter o con `{{DA VERIFICARE: ...}}`.
