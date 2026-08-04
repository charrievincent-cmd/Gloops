-- À exécuter une fois dans l'éditeur SQL de ton projet Supabase.

create table if not exists public.bottles (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null default gen_random_uuid(),
  nom text,
  annee text,
  type text check (type in ('rouge', 'blanc', 'rosé')),
  igp text,
  aop text,
  vignoble text,
  cepages text,
  gamme text check (gamme in ('basique', 'bon', 'excellent')),
  etagere text,
  conservation text,
  commentaire text,
  photo_url text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);

create index if not exists bottles_lot_id_idx on public.bottles (lot_id);

alter table public.bottles enable row level security;

create policy "authenticated read" on public.bottles
  for select to authenticated using (true);

create policy "authenticated insert" on public.bottles
  for insert to authenticated with check (true);

create policy "authenticated update" on public.bottles
  for update to authenticated using (true);

create policy "authenticated delete" on public.bottles
  for delete to authenticated using (true);

-- Stockage des photos d'étiquettes.
insert into storage.buckets (id, name, public)
values ('bottle-photos', 'bottle-photos', true)
on conflict (id) do nothing;

create policy "public read bottle photos" on storage.objects
  for select using (bucket_id = 'bottle-photos');

create policy "authenticated upload bottle photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'bottle-photos');

create policy "authenticated delete bottle photos" on storage.objects
  for delete to authenticated using (bucket_id = 'bottle-photos');

-- ---------------------------------------------------------------------
-- Migration (projet déjà provisionné avant l'ajout de l'historique) :
-- à exécuter une seule fois si la table public.bottles existe déjà
-- sans la colonne consumed_at.
-- ---------------------------------------------------------------------
alter table public.bottles add column if not exists consumed_at timestamptz;
