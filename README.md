# Taskly — Personal Productivity Hub

Taskly is a productivity hub (tasks, goals, ideas, notes, docs with backlinks,
workspaces and AI assistance) built with **Next.js 16** (App Router, React 19)
on the frontend and an **Express** API server on the backend.

The database layer is **Supabase** (Postgres + Auth), replacing the original
MongoDB/Mongoose implementation.

## Architecture

Two separate processes, as in a standard Next.js project:

```
Next.js frontend  (npm run dev)     → http://localhost:3000
Express API       (npm run server)  → http://localhost:3001
  ├─ REST API (/api/* — auth, user, tasks, doc, workspaces, ...)
  ├─ Socket.IO (collaboration/realtime)
  ├─ Supabase Auth (email/password + Google)
  ├─ Supabase Postgres (via @supabase/supabase-js)
  ├─ Stripe (billing + webhooks)
  └─ Ollama (AI chat + embeddings, optional)
```

The Next.js dev server proxies every `/api/*` request to the API server via the
rewrites in `next.config.mjs`, so the frontend only ever talks to its own
origin. Socket.IO connects directly to `NEXT_PUBLIC_SOCKET_URL` (WebSocket
upgrades are not proxied by Next.js rewrites).

The API contract the frontend already uses is preserved:
`/api/auth/*`, `/api/user/data`, `/api/tasks`, `/api/doc/*`, `/api/workspaces`,
`/api/notifications`, `/api/activity`, `/api/analytics`, `/api/billing`, `/api/ai`.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the whole file `server/supabase/schema.sql`.
   It creates all tables, indexes, the pgvector extension, the RLS policies and
   a trigger that auto-creates a `profiles` row for every new auth user.
3. Enable the **Google** provider under **Authentication → Providers → Google**
   and use the **same Google Client ID** that the frontend uses
   (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).
4. Under **Authentication → Providers → Email**, you can disable *Confirm email*
   during development so sign-up returns a session immediately.

## 2. Environment variables

Copy `.env.example` into `.env` and fill in:

| Variable | Where to find it |
| --- | --- |
| `SUPABASE_URL` | Dashboard → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Project Settings → API → `service_role` key (server-only!) |
| `SUPABASE_JWT_SECRET` | Dashboard → Project Settings → API → JWT Secret (used to verify tokens) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth client (same as Supabase Google provider) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard |
| `OLLAMA_URL` / `OLLAMA_MODEL` | Local Ollama instance (defaults `http://localhost:11434`, `llama3`) |
| `ENABLE_VECTOR` | `true` to enable semantic search via pgvector (requires Ollama embeddings) |

## 3. Run

Two terminals:

```bash
npm run server       # Express API + Socket.IO on http://localhost:3001
npm run dev          # Next.js frontend on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). `/api/*` requests on the
frontend are proxied to the API server (see the rewrites in `next.config.mjs`).
The API server binds to the `PORT` env var (default `3001`). Note that if your
shell/environment already exports `PORT`, that value wins over `.env` (dotenv
never overrides existing environment variables).

### Production

```bash
npm run build
npm start            # serves the built Next.js app on http://localhost:3000
npm run server       # Express API server (set NODE_ENV=production as needed)
```

The API server listens on `API_PORT` (default `3001`, `PORT` as fallback). When
Next.js and the API run on different hosts, set `API_URL` (or
`NEXT_PUBLIC_API_URL`) to the API origin. The Stripe webhook URL must point
directly at the API server (e.g. `https://api.example.com/api/billing/webhook`),
not through the Next.js proxy.

## Auth notes

- Access tokens issued by Supabase expire (default 1h). The frontend stores the
  `refreshToken` and `src/lib/api.js` automatically exchanges it on a 401.
  You can raise the expiry under Authentication → Settings → JWT expiry.
- Password hashing is handled by Supabase Auth — no bcrypt on the server.

## Semantic search (optional)

1. Install [Ollama](https://ollama.com) and pull `nomic-embed-text`.
2. Run the schema (creates the `vector` extension + `match_documents`).
3. Set `ENABLE_VECTOR=true`. Documents will embed on save; search falls back to
   Postgres full-text (`ILINE`/`tsvector`) when embeddings are missing.

## API contract preserved

The migration preserves the exact shapes the frontend consumes:
- `tasks`, `documents`, `notifications`, `activity`, `workspaces`, `templates`
  expose `_id` (uuid) as in MongoDB.
- `pages`, `goals`, `ideas` keep the client-generated `id` strings.
- Page client-only flags (`locked`, `font`, `deleted`, `deletedAt`) are now
  persisted in the `meta` column (previously lost on reload).
