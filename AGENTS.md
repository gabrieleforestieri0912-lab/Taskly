# Taskly — Memoria progetto (OpenCode)

## Struttura repo
- `/src` — app web Next.js (root, porta 3000 in dev).
- `/desktop` — app Electron: **carica direttamente il progetto web** (frontend = `/src`,
  Next su `:3000`, stesso dev server della root via `npm run dev` in desktop).
  Backend Express locale **minimo** su `:5000`, solo per il flusso login Google
  (`desktop/server/routes/auth.ts` + middleware/supabase lib; niente realtime).
  Electron main/preload: `desktop/main.ts`, `desktop/preload.ts` (compilati in
  `main.js`/`preload.js` via `npm run build:electron`, `tsconfig.electron.json`).
- `/mobile`, `/supabase` — altri target, stesso database Supabase del web.
- `.env*` ovunque sono **gitignored**: mai committare segreti, mai stamparli nei log.

## Decisioni prese (non regredire)
1. **Template/progetti come Pagina Vuota**: template e progetti nascono come pagine
   libere modificabili (`type: "empty"`, blocchi), non come viste strutturate.
   - Convertitore: `src/lib/templateToBlocks.ts` (`toEditableBlocks`,
     `toEditablePageTemplate`, `toEditableQuickTemplate`). Idempotente, rigenera gli id.
   - Toggle "Pagina libera modificabile" (default ON) in `AddPageModal.tsx` e
     `TemplateGalleryModal.tsx`; OFF = vista strutturata originale.
   - `addPage` in `src/app/dashboard/page.tsx` conserva il `label` passato anche per
     le pagine `empty`; l'onboarding converte sempre in pagina modificabile; i dati
     template vanno clonati in profondità prima del `setPages`.
2. **Desktop: login Google via browser web esterno** (il webview Electron è bloccato
   da Google con 403 disallowed_useragent). Flusso OAuth code + redirect loopback:
   - Backend `desktop/server/routes/auth.ts`: `GET /google/start` (JSON `{url,state}` o
     redirect), `GET /google/callback` (scambia il code, pagina HTML di conferma senza
     token), `GET /google/result?state=` (polling renderer, one-shot, TTL 10 min).
     Vecchio `POST /google` (GIS) tenuto per compatibilità.
   - Renderer `src/components/GoogleWebLoginButton.tsx` usato da Login/Register;
     apre il browser via `electronAPI.openExternal` (fallback `window.open` in dev).
   - IPC `auth:open-external` in `main.ts`/`preload.ts` (solo URL `https://`).
   - Env server: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
     `GOOGLE_DESKTOP_REDIRECT_URI=http://127.0.0.1:5000/api/auth/google/callback`
     (da registrare nei redirect URI del client OAuth, o client tipo "Desktop app").
   - Dopo modifiche a `main.ts`/`preload.ts`, ricompilare (`npm run build:electron`).
3. **Il fork desktop/src è stato eliminato**: l'app desktop esegue direttamente il
   progetto web. Profitto:
   - Realtime socket.io rimosso ovunque (backend loopback same-machine-only,
     frontend già polling-only): nessun file socket né evento socket client/server.
   - `desktop/server` ridotto a index.ts + routes/auth + lib/supabase + 4 middleware;
     tutte le altre route Express (tasks/workspaces/billing/…) sono orfane e rimosse
     (le API Next del web le sostituiscono; il `meta` pagine è persistito da
     `src/lib/server/db.ts` `PAGE_META_KEYS`).
   - Lo script `desktop npm run server` deve restare `ts-node -T -P tsconfig.electron.json`
     (`-P` = project, NON `--tsconfig`); senza `-P`, dopo la rimozione di
     `desktop/tsconfig.json`, ts-node risale all' tsconfig root (bundler/esnext) e
     l'avvio muore con TS5011 (rootDir).
   - Dep desktop potate a: express/cors/dotenv/express-rate-limit/jsonwebtoken/
     google-auth-library/@supabase/supabase-js — niente più next/react nel
     desktop dopo il passaggio a standalone (il web c'è già nel bundle).
4. **Packaging prod (`npm run package`)**: il frontend è il build Next
   `output: "standalone"` della root (`next.config.mjs`), avviato come child
   process in prod:
   - `next.config.mjs`: `output: "standalone"` produce `.next/standalone`
     (server.js + node_modules minimi, self-contained).
   - `desktop/package.json` `build.extraResources`: copia
     `../.next/standalone` → `resources/web` (con `filter: ["**/*", "!.env*"]`,
     niente segreti nel pacchetto), `../.next/static` → `web/.next/static`,
     `../public` → `web/public`.
   - `desktop/main.ts` prod: `loadRuntimeEnv()` (env runtime da
     `%APPDATA%/Taskly/.env` o `resources/web/.env`), poi spawn
     `node resources/web/server.js` (via `process.execPath`+
     `ELECTRON_RUN_AS_NODE`, `PORT=3000 HOSTNAME=127.0.0.1`), poi
     `waitForHttp` prima di creare la finestra (niente setTimeout arbitrari).
   - Ordine `npm run package`: build:electron → root `npm run build` (serve il
     build standalone, richiesto) → electron-builder. Non lanciare
     electron-builder senza il build root aggiornato.
   - Runtime non testabile qui: provato `electron-builder --dir` (win-unpacked
     ok, resources/web completo e senza .env) e `node server.js` dalla
     directory pacchettizzata (/dashboard 200). Manca solo il test completo
     Taskly.exe (finestra + login Google + badge) da parte dell'utente.
   - Distribuzione scelta: **"pubblica + backend remoto"** (variante "privata
     controllata" resta possibile):
     - `next.config.mjs`: rewrite `beforeFiles` `/api/*` →
       `DESKTOP_REMOTE_API_URL` (build-time; assente = self-contained).
       ATTENZIONE il default `afterFiles` NON basta: le route /api locali
       farebbero ombra al rewrite.
     - Nuovi endpoint remoti: `src/app/api/auth/desktop/start` (costruisce
       l'URL Google con redirect loopback) e `.../exchange` (scambia il code
       con GOOGLE_CLIENT_SECRET → signInWithIdToken → buildSessionResponse).
     - `desktop/server/routes/auth.ts`: `IS_REMOTE` da `DESKTOP_REMOTE_API_URL`
       env > `appconfig.json` (NB: path `../../appconfig.json` da
       server/routes); in remoto lo scambio delega tutto al deployment,
       in locale resta il flusso con le chiavi.
     - `desktop/appconfig.json`: `remoteApi` (default l'URL Vercel; `""` =
       self-contained privato).
     - `desktop/package.cjs`: `npm run package` legge l'appconfig e imposta
       la env del build root. Build pubbliche NON runtime-testabili finché
       il deployment Vercel è `DEPLOYMENT_DISABLED` (riattivazione sul
       dashboard Vercel + commit/push delle rotte desktop) e finché
       GOOGLE_CLIENT_SECRET non è nelle env Vercel.
     - Istruzioni per i tester: `desktop/DISTRIBUZIONE.md`.
     - Un'app desktop con l'URL remoto funziona per qualsiasi utente senza
       .env; serve il push delle rotte desktop + la riattivazione Vercel.
     - Push env su Vercel ESEGUITO (2026-10-25): 16 variabili dal `.env` root
       (solo le 2 vuote RESEND_API_KEY/SUPPORT_EMAIL saltate) su
       production+preview+development del progetto `vertex-782b/taskly`.
       Ostacoli incontrati: (1) npx.ps1 si rompe se si passa il valore via
       stdin → usare `node <percorso>/vercel/dist/index.js` diretto; (2) la
       CLI ≥65 vuole `--environment ...` ripetuto, NON i positional
       `production preview development`. Token CLI usato poi rimosso dal
       disco: COMUNQUE RUOTARE il token (era transitato in chat).

## Convenzioni di lavoro
- Risposte in italiano, brevi e concise; riferimenti al codice come `path:riga`.
- Verifica sempre con `tsc --noEmit` ed `eslint` sui file toccati prima di chiudere.
- Preferisci `edit` su file esistenti; nuovi file solo se necessario.
- Mai indovinare URL o ID modello; mai committare `.env`.
- File di test temporanei (`scripts/tmp-*`, `e2e-tmp/`, probe Playwright,
  script una-tantum in TEMP): solo se servono, eseguirli e ELIMINARLI subito
  dopo il pass. Mai committarli né lasciarli nel repo.

## Bug risolti (non reintrodurre)
- `Sidebar.tsx`: mai usare una variabile prima della sua dichiarazione `const`
  (TDZ ReferenceError scattava solo con ≥1 pagina, cioè a ogni creazione pagina).
  Verificato con Playwright reale su tutti i template prima di chiudere.
- Mobile web (verifica a 390px con Playwright): sidebar chiusa di default sotto
  768px + auto-chiusura dopo navigazione; toolbar ItemList scrollabili;
  blocchi NotesView con textarea auto-growing (niente più testo tagliato).
- Header pagina (PageHeader: icona + titolo modificabili) presente in tutte le
  viste: notes/empty, tasks, goals, calendar, braindump.
- Architettura pagine: ogni pagina è testo libero + componenti incorporati
  (tasks-embed ItemList, goals-embed GoalsView, planner-embed CalendarView),
  con riga scrivibile finale. Mai appiattire i dati in checkbox: i dati vivono
  nel blocco (items/goals/schedule). Vale per template, progetti, onboarding e
  tipi base (tranne braindump/empty strutturati).
- Pagine ospite in `taskly_pages_v1` (seed solo senza token); analitiche senza
  skeleton (render immediato); MAI hook dopo early return (già causato warning
  Hooks order: gate `loading` sempre dopo tutti gli hook).
- Card blocchi con overflow-visible (menu +/slash non tagliati); pagine a tutta
  larghezza (niente max-w nelle viste).
- Titolo pagina: click diretto sul testo (niente bottone matita); picker icona
  con viste separate Emoji | Icone.
- Niente impostazioni rapide nei menu dashboard (tema/lingua solo in /settings).
- Picker icone: tutte le 1500+ subito (niente paginazione), colore icone
  (7 colori, applicato subito o alla scelta), ~250 emoji in 8 sezioni
  (fromCodePoint, mai surrogate a mano).
- 429 AI = limiter globale /api (non crediti reali): messaggio "Crediti AI
  esauriti" con Retry-After; NotificationBell ogni 60s + stop a tab nascosta;
  budget 600 req/15min per IP.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
