-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";     -- pgvector (semantic search)

-- ============================================================================
-- profiles — application data for users (1:1 with auth.users)
-- A row is auto-created by the trigger below whenever a user signs up.
-- ============================================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null default '',
  email         text,
  picture       text,
  subscription  jsonb not null default '{}'::jsonb,
  planner_meta  jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- tasks
-- ============================================================================
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  workspace_id  text not null default 'personal',
  title         text not null,
  description   text not null default '',
  status        text not null default 'todo',
  assignee      text,
  due_date      timestamptz,
  recurrence    jsonb,
  subtasks      jsonb not null default '[]'::jsonb,
  dependencies  uuid[] not null default '{}',
  custom_fields jsonb not null default '{}'::jsonb,
  created_by    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tasks_user_workspace_idx on public.tasks (user_id, workspace_id);
create index if not exists tasks_status_idx on public.tasks (status);

-- ============================================================================
-- workspaces + workspace_members (normalized from the embedded `members` array)
-- ============================================================================
create table if not exists public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_owner_slug_unique unique (owner_id, slug)
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('owner','admin','member','viewer')),
  joined_at    timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists workspace_members_user_idx on public.workspace_members (user_id);

-- ============================================================================
-- documents + doc_versions (+ full-text & vector search support)
-- ============================================================================
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  workspace_id text not null,
  slug         text not null,
  title        text not null default '',
  blocks       jsonb not null default '[]'::jsonb,
  plain_text   text not null default '',
  embedding    vector(768),
  backlinks    text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint documents_user_workspace_slug_unique unique (user_id, workspace_id, slug)
);

-- Generated tsvector for fast full-text search
alter table public.documents
  drop column if exists search_tsv;
alter table public.documents
  add column search_tsv tsvector
  generated always as (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(plain_text,''))) stored;
create index if not exists documents_search_tsv_idx on public.documents using gin (search_tsv);
create index if not exists documents_workspace_slug_idx on public.documents (user_id, workspace_id);

create table if not exists public.doc_versions (
  id         uuid primary key default gen_random_uuid(),
  doc_id     uuid not null references public.documents(id) on delete cascade,
  version    integer not null,
  blocks     jsonb not null default '[]'::jsonb,
  author     text,
  created_at timestamptz not null default now()
);
create index if not exists doc_versions_doc_idx on public.doc_versions (doc_id, version desc);

-- Vector similarity search (used when ENABLE_VECTOR=true)
create or replace function public.match_documents(
  query_embedding vector(768),
  match_count integer,
  p_user_id uuid,
  p_workspace text
) returns table (id uuid, slug text, title text, score double precision)
language sql stable
as $$
  select d.id, d.slug, d.title, 1 - (d.embedding <=> query_embedding) as score
  from public.documents d
  where d.user_id = p_user_id
    and d.workspace_id = p_workspace
    and d.embedding is not null
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================================
-- pages — client-driven dashboard pages (id is the client-generated string)
-- `meta` keeps client-only flags (locked/font/deleted/deletedAt) that the old
-- MongoDB schema never persisted.
-- ============================================================================
create table if not exists public.pages (
  id          text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  label       text not null default '',
  icon        text not null default 'layout-dashboard',
  icon_color  text not null default 'text-gray-400',
  parent_id   text,
  purpose     text,
  is_template boolean not null default false,
  data        jsonb,
  meta        jsonb not null default '{}'::jsonb,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists pages_order_idx on public.pages (user_id, sort_order);

-- ============================================================================
-- ideas / goals — client-generated text ids
-- ============================================================================
create table if not exists public.ideas (
  id         text not null,
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text,
  category   text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.goals (
  id          text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  description text,
  completed   boolean not null default false,
  sub_goals   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  primary key (user_id, id)
);

-- ============================================================================
-- templates / notifications / activity / analytics / analytics_events
-- ============================================================================
create table if not exists public.templates (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  workspace_id text,
  name         text not null,
  type         text not null default 'doc' check (type in ('doc','board','project','task')),
  payload      jsonb,
  created_by   text,
  created_at   timestamptz not null default now()
);
create index if not exists templates_user_idx on public.templates (user_id);

create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  workspace_id text,
  user_id      uuid references auth.users(id) on delete cascade,
  title        text,
  body         text,
  read         boolean not null default false,
  meta         jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

create table if not exists public.workspace_comments (
  id          uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null check (entity_type in ('task', 'document')),
  entity_id   text not null,
  author_id   uuid not null references auth.users(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 5000),
  mention_ids uuid[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists workspace_comments_entity_idx
  on public.workspace_comments (workspace_id, entity_type, entity_id, created_at);
create index if not exists workspace_comments_mentions_idx
  on public.workspace_comments using gin (mention_ids);

create table if not exists public.workspace_document_mentions (
  document_id  uuid not null references public.documents(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  primary key (document_id, user_id)
);
alter table public.workspace_document_mentions enable row level security;
revoke all on public.workspace_document_mentions from public, anon, authenticated;
grant all on public.workspace_document_mentions to service_role;

alter table public.workspace_comments enable row level security;
drop policy if exists workspace_comments_member_read on public.workspace_comments;
create policy workspace_comments_member_read on public.workspace_comments
  for select to authenticated
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = workspace_comments.workspace_id
      and wm.user_id = auth.uid()
  ));
drop policy if exists workspace_comments_member_insert on public.workspace_comments;
create policy workspace_comments_member_insert on public.workspace_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_comments.workspace_id
        and wm.user_id = auth.uid()
        and wm.role <> 'viewer'
    )
  );

create or replace function public.create_workspace_comment_with_mentions(
  p_workspace_id uuid,
  p_entity_type text,
  p_entity_id text,
  p_author_id uuid,
  p_author_name text,
  p_body text,
  p_mention_ids uuid[]
) returns public.workspace_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_comment public.workspace_comments;
begin
  insert into public.workspace_comments (
    workspace_id, entity_type, entity_id, author_id, body, mention_ids
  ) values (
    p_workspace_id, p_entity_type, p_entity_id, p_author_id, p_body,
    coalesce(p_mention_ids, '{}'::uuid[])
  )
  returning * into inserted_comment;

  insert into public.notifications (
    workspace_id, user_id, title, body, read, meta
  )
  select
    p_workspace_id::text,
    mentions.user_id,
    'Sei stato menzionato da ' || p_author_name,
    left(p_body, 240),
    false,
    jsonb_build_object(
      'type', 'mention',
      'entityType', p_entity_type,
      'entityId', p_entity_id,
      'commentId', inserted_comment.id
    )
  from unnest(coalesce(p_mention_ids, '{}'::uuid[])) as mentions(user_id)
  where mentions.user_id <> p_author_id;

  return inserted_comment;
end;
$$;
revoke all on function public.create_workspace_comment_with_mentions(
  uuid, text, text, uuid, text, text, uuid[]
) from public, anon, authenticated;
grant execute on function public.create_workspace_comment_with_mentions(
  uuid, text, text, uuid, text, text, uuid[]
) to service_role;

create or replace function public.sync_workspace_document_mentions(
  p_document_id uuid,
  p_workspace_id uuid,
  p_entity_id text,
  p_author_id uuid,
  p_author_name text,
  p_mention_ids uuid[]
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.workspace_document_mentions
  where document_id = p_document_id
    and user_id <> all(coalesce(p_mention_ids, '{}'::uuid[]));

  with new_mentions as (
    insert into public.workspace_document_mentions (document_id, workspace_id, user_id)
    select p_document_id, p_workspace_id, mentions.user_id
    from unnest(coalesce(p_mention_ids, '{}'::uuid[])) as mentions(user_id)
    where mentions.user_id <> p_author_id
    on conflict (document_id, user_id) do nothing
    returning user_id
  )
  insert into public.notifications (
    workspace_id, user_id, title, body, read, meta
  )
  select
    p_workspace_id::text,
    new_mentions.user_id,
    'Sei stato menzionato in un documento da ' || p_author_name,
    'Sei stato menzionato nel documento "' || p_entity_id || '".',
    false,
    jsonb_build_object(
      'type', 'mention',
      'entityType', 'document',
      'entityId', p_entity_id
    )
  from new_mentions;
end;
$$;
revoke all on function public.sync_workspace_document_mentions(
  uuid, uuid, text, uuid, text, uuid[]
) from public, anon, authenticated;
grant execute on function public.sync_workspace_document_mentions(
  uuid, uuid, text, uuid, text, uuid[]
) to service_role;

create table if not exists public.activity (
  id         uuid primary key default gen_random_uuid(),
  type       text not null,
  user_id    uuid references auth.users(id) on delete cascade,
  title      text,
  body       text,
  payload    jsonb,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists activity_user_idx on public.activity (user_id, created_at desc);

create table if not exists public.analytics (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  payload jsonb,
  url     text,
  ts      timestamptz not null default now()
);
create index if not exists analytics_ts_idx on public.analytics (ts desc);

create table if not exists public.meetings (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  title      text not null default '',
  transcript text,
  summary    text,
  category   text default 'Generale',
  duration   text,
  date       timestamptz default now(),
  source     text not null default 'manual',
  external_id text,
  meeting_url text,
  created_at timestamptz not null default now()
);
create index if not exists meetings_user_idx on public.meetings (user_id, created_at desc);

-- Estendibilità provider riunioni (Zoom / Google Meet): idempotente
alter table public.meetings add column if not exists source text not null default 'manual';
alter table public.meetings add column if not exists external_id text;
alter table public.meetings add column if not exists meeting_url text;

create table if not exists public.integrations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  provider   text not null,
  config     jsonb not null default '{}'::jsonb,
  connected  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.analytics_events (
  id           uuid primary key default gen_random_uuid(),
  workspace_id text,
  event        jsonb not null,
  created_at   timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);

-- ============================================================================
-- Trigger: auto-create a profile row whenever a user is created in auth.users
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, picture)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'picture'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- The Express server uses the service_role key (bypasses RLS). These policies
-- make the tables safe if the client SDK is ever used directly.
-- ============================================================================
-- Membership helpers (SECURITY DEFINER: they bypass RLS internally, which
-- prevents the "infinite recursion detected in policy" error that would occur
-- if workspace_members policies queried workspace_members directly).
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_manager(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid() and role in ('owner','admin')
  );
$$;

alter table public.profiles         enable row level security;
alter table public.tasks            enable row level security;
alter table public.workspaces       enable row level security;
alter table public.workspace_members enable row level security;
alter table public.documents        enable row level security;
alter table public.doc_versions     enable row level security;
alter table public.pages            enable row level security;
alter table public.ideas            enable row level security;
alter table public.goals            enable row level security;
alter table public.templates        enable row level security;
alter table public.notifications    enable row level security;
alter table public.activity         enable row level security;
alter table public.analytics        enable row level security;
alter table public.analytics_events enable row level security;
alter table public.meetings         enable row level security;
alter table public.integrations     enable row level security;

-- Own-row policies ---------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

create policy "pages_select_own" on public.pages
  for select using (auth.uid() = user_id);
create policy "pages_insert_own" on public.pages
  for insert with check (auth.uid() = user_id);
create policy "pages_update_own" on public.pages
  for update using (auth.uid() = user_id);
create policy "pages_delete_own" on public.pages
  for delete using (auth.uid() = user_id);

create policy "ideas_select_own" on public.ideas
  for select using (auth.uid() = user_id);
create policy "ideas_insert_own" on public.ideas
  for insert with check (auth.uid() = user_id);
create policy "ideas_update_own" on public.ideas
  for update using (auth.uid() = user_id);
create policy "ideas_delete_own" on public.ideas
  for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

create policy "doc_versions_select_own" on public.doc_versions
  for select using (
    exists (select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
  );
create policy "doc_versions_insert_own" on public.doc_versions
  for insert with check (
    exists (select 1 from public.documents d where d.id = doc_id and d.user_id = auth.uid())
  );

create policy "workspaces_select_member" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "workspaces_insert_own" on public.workspaces
  for insert with check (auth.uid() = owner_id);
create policy "workspaces_update_owner" on public.workspaces
  for update using (auth.uid() = owner_id);

create policy "workspace_members_select_member" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "workspace_members_insert_manage" on public.workspace_members
  for insert with check (public.is_workspace_manager(workspace_id));
create policy "workspace_members_update_manage" on public.workspace_members
  for update using (public.is_workspace_manager(workspace_id));

create policy "templates_select_own" on public.templates
  for select using (auth.uid() = user_id);
create policy "templates_insert_own" on public.templates
  for insert with check (auth.uid() = user_id);
create policy "templates_delete_own" on public.templates
  for delete using (auth.uid() = user_id);

create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_insert_own" on public.notifications
  for insert with check (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

create policy "activity_select_own" on public.activity
  for select using (auth.uid() = user_id);
create policy "activity_insert_own" on public.activity
  for insert with check (auth.uid() = user_id);
create policy "activity_update_own" on public.activity
  for update using (auth.uid() = user_id);

create policy "meetings_select_own" on public.meetings
  for select using (auth.uid() = user_id);
create policy "meetings_insert_own" on public.meetings
  for insert with check (auth.uid() = user_id);
create policy "meetings_update_own" on public.meetings
  for update using (auth.uid() = user_id);
create policy "meetings_delete_own" on public.meetings
  for delete using (auth.uid() = user_id);

create policy "integrations_select_own" on public.integrations
  for select using (auth.uid() = user_id);
create policy "integrations_insert_own" on public.integrations
  for insert with check (auth.uid() = user_id);
create policy "integrations_update_own" on public.integrations
  for update using (auth.uid() = user_id);
create policy "integrations_delete_own" on public.integrations
  for delete using (auth.uid() = user_id);

-- Everyone may write analytics events (used by the public marketing pages)
create policy "analytics_insert_all" on public.analytics
  for insert with check (true);
create policy "analytics_select_all" on public.analytics
  for select using (true);

create policy "analytics_events_insert_all" on public.analytics_events
  for insert with check (true);
create policy "analytics_events_select_all" on public.analytics_events
  for select using (true);
