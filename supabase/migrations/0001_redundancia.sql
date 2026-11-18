-- Redundância do conteúdo e dos currículos no Supabase.
--
-- Rodar no SQL Editor do projeto (Database > SQL Editor > New query) ou com
-- `psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_redundancia.sql`.
--
-- A fonte primária continua sendo o appbackend.io, acessado pelas Cloud
-- Functions. Aqui ficam a cópia do conteúdo e a cópia dos PDFs, usadas quando a
-- fonte primária está fora do ar.

begin;

-- Espelho das linhas de conteúdo: uma linha por seção (home, about, skills, ...).
create table if not exists public.content_rows (
  -- _id do appbackend: é a chave estável entre as duas fontes
  id text primary key,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.content_rows is
  'Espelho do conteúdo do portfólio (fonte primária: appbackend.io via Cloud Functions).';

create index if not exists content_rows_key_idx on public.content_rows (key);

alter table public.content_rows enable row level security;

-- Sem policy de escrita: quem grava é a service role (ignora RLS), e ela nunca
-- sai do servidor das Functions.
--
-- A leitura pública abaixo é do bloco 7 do plano (fallback direto no SPA, sem
-- passar pelas Functions). Descomente junto com VITE_SUPABASE_URL /
-- VITE_SUPABASE_ANON_KEY no front:
--
-- create policy "conteudo leitura publica"
--   on public.content_rows for select to anon using (true);

-- Bucket privado dos currículos (o download passa pela function, que assina com
-- a service role). O bucket `resume` já existe no projeto; o `on conflict`
-- garante que rodar de novo só ajusta limite e MIME. Se o bucket tiver outro
-- nome, defina SUPABASE_STORAGE_BUCKET nas secrets da function.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resume', 'resume', false, 10485760, array['application/pdf'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

commit;

-- Conferência rápida depois de rodar o backfill (functions/scripts/sync-supabase.mjs):
--   select id, key, updated_at from public.content_rows order by key;
