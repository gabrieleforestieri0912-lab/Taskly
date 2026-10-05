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

## Mappa documentazione proposta

La route collegata indica il punto dell'app a cui la guida sarebbe pertinente.
Le pagine sono proposte, non ancora approvate; si documenteranno solo flussi
verificati e gli elementi incerti resteranno marcati.

| Sezione | Pagina proposta | Route app collegata | Copertura |
|---|---|---|---|
| Introduzione | Panoramica di Taskly e glossario dei termini UI | `/` | Concettuale; limitare il glossario a termini riscontrati. |
| Per iniziare | Creare un account e accedere | `/register`, `/login` | `{{DA VERIFICARE: flussi e messaggi.}}` |
| Per iniziare | Completare “Inizia da qui” | `/dashboard` | Passi verificabili in `OnboardingChecklist`. |
| Workspace e sidebar | Navigare Home, Task, Inbox e pagine private | `/dashboard` | Voci presenti nella sidebar. |
| Workspace e sidebar | Creare, rinominare, duplicare e organizzare pagine | `/dashboard` | Include sottopagine e drag-and-drop. |
| Workspace e sidebar | Gestire il Cestino | `/dashboard?trash=1` | Ripristino/eliminazione; verificare la retention e i tipi di record esposti dalla vista. |
| Sezioni dashboard | Gestire i task personali | `/dashboard?view=mytasks` | `MyTasksView`; azioni specifiche `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Usare Inbox | `/dashboard?view=inbox` | `{{DA VERIFICARE: vista e azioni.}}` |
| Sezioni dashboard | Creare e gestire pagine Task | `/dashboard?page=…` | `ItemList`, viste e azioni `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Gestire obiettivi | `/dashboard?page=…` | `GoalsView`; azioni `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Usare il Calendario | `/dashboard?page=…`, `/calendar` | `CalendarView` e integrazione Google Calendar da verificare. |
| Sezioni dashboard | Scrivere e organizzare Note | `/dashboard?page=…`, `/notes` | `NotesView`; dettagli editor `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Catturare idee con Brain Dump | `/dashboard?page=…` | `BrainDumpView`; azioni `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Usare la pagina vuota | `/dashboard?page=…` | `EmptyPageView`; `{{DA VERIFICARE: contenuto e salvataggio.}}` |
| Sezioni dashboard | Personalizzare la Home | `/dashboard` | Widget e ordinamento; verificare preferenze salvate. |
| Sezioni dashboard | Usare la chat AI | `/dashboard?ai=1` | Azioni AI e limiti `{{DA VERIFICARE}}`. |
| Sezioni dashboard | Gestire riunioni e recap | `/meetings` | `{{DA VERIFICARE: import e provider supportati.}}` |
| Sezioni dashboard | Trascrivere audio | `/transcription` | `{{DA VERIFICARE: sorgenti e flusso.}}` |
| Sezioni dashboard | Consultare attività recenti | `/activity` | `{{DA VERIFICARE: contenuto e azioni.}}` |
| Sezioni dashboard | Usare template | `/templates`, `/dashboard` | Galleria e salvataggio custom; selezione/uso da verificare. |
| Account e impostazioni | Modificare profilo e preferenze | `/settings` | Suddivisione in tab dedotta dai link sidebar; dettagli da verificare. |
| Piani e fatturazione | Consultare abbonamento e fatturazione | `/settings?tab=billing` | Limite pagine osservato; dettagli commerciali da verificare. |
| Integrazioni | Collegare Google, Google Calendar e Slack | `/integrations`, `/calendar` | Stato dei flussi da verificare. |
| Workspace | Aprire workspace e documenti | `/workspace/[id]` | Ruoli, permessi e contenuti da verificare. |
| Workspace | Usare board | `/workspace/[id]/board` | `{{DA VERIFICARE: funzionalità.}}` |
| Workspace | Modificare documenti | `/workspace/[id]/doc/[slug]` | Editor/backlinks da verificare. |
| Aiuto | Consultare la documentazione e contattare il supporto | `/docs`, `/support` | Canale di supporto da verificare. |
| Riferimenti | Scorciatoie da tastiera | `/dashboard` | Documentare solo quelle elencate nell'inventario. |
| Riferimenti | FAQ | `/` | FAQ landing; verificare che risposte e prodotto siano attuali. |
| Riferimenti | Risoluzione problemi e Novità | `/dashboard` | Novità non individuata; pagina manuale solo se approvata in Fase 2. |

## Decisioni da riesaminare prima della Fase 2

1. Il prompt propone MDX con `gray-matter` e `next-mdx-remote/rsc`, ricerca client
   side e catch-all. La route `/docs` esistente è oggi un Client Component con
   layout metadata dedicato: la migrazione richiederà sostituire la pagina e
   rivedere quel layout.
2. Il prompt richiede copertura automatica per ogni route app, ma route API,
   authentication callback, legal e pagine interne workspace non sono tutte
   necessariamente utili come guide pubbliche. Approvare una allowlist esplicita.
3. `getDocForRoute(pathname)` non è richiesto dal comportamento corrente e
   implicherebbe aggiungere un helper; nessuna UI esistente va modificata senza
   approvazione.
4. Valutare se il report inventario finale debba rimanere in root (`docs-inventory.md`)
   o essere spostato sotto `docs/`.
