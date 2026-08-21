# Taskly — Personal Productivity Hub

Taskly is a productivity hub (tasks, goals, ideas, notes, docs with backlinks,
workspaces and AI assistance) built with **Next.js 16** (App Router, React 19).
The backend is implemented entirely with **Next.js API routes**
(`src/app/api/**/route.ts`) — there is no separate API server anymore.

The database layer is **Supabase** (Postgres + Auth), replacing the original
MongoDB/Mongoose implementation.

## Architecture

A single Next.js process serves both the frontend and the API:

```
Next.js (npm run dev / npm start)  → http://localhost:3000
  ├─ Pages & components
  ├─ API routes (/api/* — auth, user, tasks, doc, workspaces, ...)
  ├─ proxy.ts (rate limiting + audit logging on /api/*)
  ├─ Supabase Auth (email/password + Google)
  ├─ Supabase Postgres (via @supabase/supabase-js)
  ├─ Stripe (billing + webhooks)
  └─ Ollama (AI chat + embeddings, optional)
```

The API contract the frontend already uses is preserved:
`/api/auth/*`, `/api/user/data`, `/api/tasks`, `/api/doc/*`, `/api/workspaces`,
`/api/notifications`, `/api/activity`, `/api/analytics`, `/api/billing`, `/api/ai`.

> Note: realtime collaboration (Socket.IO — remote cursors, live page updates)
> was removed together with the standalone Express server; notifications and
> dashboards now use polling only.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run the whole file `supabase/schema.sql`.
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
| `RESEND_API_KEY` / `SUPPORT_EMAIL` | Resend (support form emails) — without a key `/api/support` returns 500 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional — accurate global rate limiting on serverless (falls back to in-memory) |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Optional — defaults `200` requests / `900000` ms (15 min). `RATE_LIMIT_DISABLED=1` disables it |

## 3. Run

```bash
npm install
npm run dev     # Next.js frontend + API routes on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000). `/api/*` requests are
handled directly by the Next.js API routes.

### Production

```bash
npm run build
npm start       # serves the built Next.js app on http://localhost:3000
```

The Stripe webhook URL must point at the same origin
(e.g. `https://app.example.com/api/billing/webhook`).

## Auth notes

- Access tokens issued by Supabase expire (default 1h). The frontend stores the
  `refreshToken` and `src/lib/api.ts` automatically exchanges it on a 401.
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
