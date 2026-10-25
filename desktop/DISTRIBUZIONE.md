# Distribuzione app desktop

Versione corrente: **0.1.0** — installer NSIS non firmato, generato con
`npm run package` (in `/desktop`). Il pacchetto **NON contiene segreti**:
il filtro `extraResources` esclude ogni `.env*`.

## Due modalità di confezionamento

La modalità si sceglie con `"remoteApi"` in `desktop/appconfig.json`
(già impostato al valore pubblico):

| modalità                    | `remoteApi` in `appconfig.json`            | requisito per l'utente finale               | distribuzione |
| --------------------------- | ------------------------------------------ | ------------------------------------------- | ------------- |
| **pubblica (remoto)**       | `https://taskly-productivity.vercel.app`   | nessuno                                     | a chiunque *  |
| **self-contained (locale)** | `""` (vuoto)                               | `%APPDATA%\Taskly\.env` con tutte le chiavi | SOLO fidati   |

\* La modalità pubblica richiede che il deployment online:
1. sia **attivo** (vedi sezione verifica sotto),
2. contenga il **codice corrente** (eseguire il commit/push con
   `src/app/api/auth/desktop/start` e `.../exchange`),
3. abbia su Vercel le env `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
   (servono a `/api/auth/desktop/exchange` per scambiare il code con la
   sessione Supabase).

## Verifica post-push (deployment online)

Da eseguire DOPO commit/push **e** riattivazione del deployment Vercel
(oggi risponde `402 DEPLOYMENT_DISABLED`). Comandi in PowerShell
(`node` inline, niente segreti in gioco):

```powershell
# 0. Il deployment risponde
node -e "fetch('https://taskly-productivity.vercel.app/api/health').then(r=>r.text().then(t=>console.log('health:',r.status,t.slice(0,60))))"
# atteso: 200 {"status":"ok"}  (se 402: deployment ancora disattivato)

# 1. Endpoint desktop/start: costruzione URL Google (GET, senza segreti)
node -e "fetch('https://taskly-productivity.vercel.app/api/auth/desktop/start?state=1234567890abcdef123456&redirect_uri='+encodeURIComponent('http://127.0.0.1:5000/api/auth/google/callback')).then(r=>r.text().then(t=>console.log('start:',r.status,t.slice(0,220))))"
# atteso: 200 e un url https://accounts.google.com/...client_id=...&redirect_uri=http%3A%2F%2F127.0.0.1%3A5000...

# 1b. Negative test: redirect_uri NON loopback deve rifiutare (400)
node -e "fetch('https://taskly-productivity.vercel.app/api/auth/desktop/start?state=1234567890abcdef123456&redirect_uri='+encodeURIComponent('https://male.example.com/cb')).then(r=>r.text().then(t=>console.log('negative:',r.status,t.slice(0,120))))"
# atteso: 400 {"message":"redirect_uri non è un loopback"}

# 2. Negative test: exchange con code falso
#    401 atteso = GOOGLE_CLIENT_ID/SECRET presenti e scambio provato;
#    500 con "impostare GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET" = env mancanti su Vercel
node -e "fetch('https://taskly-productivity.vercel.app/api/auth/desktop/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'FAKE_CODE',redirect_uri:'http://127.0.0.1:5000/api/auth/google/callback'})}).then(r=>r.text().then(t=>console.log('exchange:',r.status,t.slice(0,120))))"
```

**Test end-to-end dell'app** (dopo i controlli sopra):
1. `cd desktop && npm run package` (l'appconfig punta già al remoto)
2. Installa/avvia l'app **senza** `%APPDATA%\Taskly\.env` (o rinominalo) —
   deve funzionare lo stesso: aggancia "Accedi con Google", il browser si
   apre, completi l'accesso e l'app si logga
3. Creazione pagina / task → i dati si salvano online (le API girano remote
   via rewrite)
4. AI (chat/trascrizioni) e badge: le API AI sono remote → configurazioni
   XKIRO del deployment

## Packaging dell'installer pubblico

```
cd desktop
npm run package          # legge appconfig.json → build remoto + NSIS
# output: dist/Taskly-Setup-0.1.0.exe
```

## SmartScreen (app non firmata)

Al primo avvio Windows mostra "app non riconosciuta" → "Altre informazioni"
→ "Esegui comunque". Sparisce con un certificato di firma codice.

## Modalità self-contained — env per il tester

Se `appconfig.json` ha `remoteApi: ""`, chi installa crea una volta sola
**`%APPDATA%\Taskly\.env`** (cartella `Taskly` in
`C:\Users\<utente>\AppData\Roaming`):

```
# ── essenziali (senza queste l'app non parte) ──
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

# ── login Google via browser esterno (desktop) ──
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_DESKTOP_REDIRECT_URI=http://127.0.0.1:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000

# ── AI (trascrizioni/chat) ──
XKIRO_API_KEY=
XKIRO_BASE_URL=
XKIRO_CHAT_MODEL=
```

Opzionali: `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` (billing),
`RESEND_API_KEY` + `SUPPORT_EMAIL` (support via email), `APP_URL`.
Poi riavviare l'app.

⚠️ In quella modalità chi riceve il `.env` riceve la
`SUPABASE_SERVICE_ROLE_KEY` (accesso totale al DB, supera ogni RLS) e le
chiavi Stripe/AI: distribuire SOLO a fidati.
