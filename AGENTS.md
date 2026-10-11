# Taskly — Memoria progetto (OpenCode)

## Struttura repo
- `/src` — app web Next.js (root, porta 3000 in dev).
- `/desktop` — app Electron: frontend Next.js su `:3333` + backend Express su `:5000`.
  Rewrite Next `/api/:path*` → `http://localhost:5000/api/:path*` (`desktop/next.config.mjs`).
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
   - Renderer `desktop/src/components/GoogleWebLoginButton.tsx` usato da Login/Register;
     apre il browser via `electronAPI.openExternal` (fallback `window.open` in dev).
   - IPC `auth:open-external` in `main.ts`/`preload.ts` (solo URL `https://`).
   - Env server: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
     `GOOGLE_DESKTOP_REDIRECT_URI=http://127.0.0.1:5000/api/auth/google/callback`
     (da registrare nei redirect URI del client OAuth, o client tipo "Desktop app").
   - Dopo modifiche a `main.ts`/`preload.ts`, ricompilare (`npm run build:electron`).

## Convenzioni di lavoro
- Risposte in italiano, brevi e concise; riferimenti al codice come `path:riga`.
- Verifica sempre con `tsc --noEmit` ed `eslint` sui file toccati prima di chiudere.
- Preferisci `edit` su file esistenti; nuovi file solo se necessario.
- Mai indovinare URL o ID modello; mai committare `.env`.

## Bug risolti (non reintrodurre)
- `Sidebar.tsx`: mai usare una variabile prima della sua dichiarazione `const`
  (TDZ ReferenceError scattava solo con ≥1 pagina, cioè a ogni creazione pagina).
  Verificato con Playwright reale su tutti i template prima di chiudere.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
