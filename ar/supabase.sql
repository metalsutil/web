-- =============================================================
--  Visor AR · configuración de Supabase
--  Pega todo este archivo en Supabase → SQL Editor → Run.
--  Se ejecuta una sola vez.
-- =============================================================

-- 1. Perfiles: guarda quién es administradora
create table if not exists public.perfiles (
  id        uuid primary key references auth.users on delete cascade,
  email     text,
  es_admin  boolean not null default false,
  creado    timestamptz not null default now()
);
alter table public.perfiles enable row level security;

drop policy if exists "ver propio perfil" on public.perfiles;
create policy "ver propio perfil" on public.perfiles
  for select using (auth.uid() = id);

-- Cada cuenta nueva recibe su perfil automáticamente
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create or replace function public.soy_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select es_admin from public.perfiles where id = auth.uid()), false);
$$;

-- 2. Modelos
create table if not exists public.modelos (
  id          uuid primary key default gen_random_uuid(),
  usuario     uuid not null default auth.uid() references auth.users on delete cascade,
  titulo      text not null,
  autor       text,
  taller      text,
  ruta        text not null,
  ajustes     jsonb not null default '{}'::jsonb,
  peso_bytes  bigint,
  creado      timestamptz not null default now()
);
alter table public.modelos enable row level security;

drop policy if exists "ver mis modelos" on public.modelos;
create policy "ver mis modelos" on public.modelos
  for select using (auth.uid() = usuario or public.soy_admin());

drop policy if exists "crear mis modelos" on public.modelos;
create policy "crear mis modelos" on public.modelos
  for insert with check (auth.uid() = usuario);

drop policy if exists "editar mis modelos" on public.modelos;
create policy "editar mis modelos" on public.modelos
  for update using (auth.uid() = usuario or public.soy_admin());

drop policy if exists "borrar mis modelos" on public.modelos;
create policy "borrar mis modelos" on public.modelos
  for delete using (auth.uid() = usuario or public.soy_admin());

-- El visor público lee un modelo por su id, sin poder listar los demás
create or replace function public.modelo_publico(p_id uuid)
returns table (titulo text, autor text, ruta text, ajustes jsonb)
language sql security definer stable set search_path = public as $$
  select titulo, autor, ruta, ajustes from public.modelos where id = p_id;
$$;
grant execute on function public.modelo_publico(uuid) to anon, authenticated;

-- 3. Almacenamiento de archivos .glb (máximo 15 MB por archivo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('modelos', 'modelos', true, 15728640,
        array['model/gltf-binary', 'application/octet-stream'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Cada persona sube solo a su propia carpeta
drop policy if exists "subir a mi carpeta" on storage.objects;
create policy "subir a mi carpeta" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'modelos'
              and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "borrar de mi carpeta" on storage.objects;
create policy "borrar de mi carpeta" on storage.objects
  for delete to authenticated
  using (bucket_id = 'modelos'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.soy_admin()));

-- =============================================================
--  DESPUÉS de crear tu cuenta en la app, ejecuta esta línea
--  (con tu correo) para quedar como administradora:
--
--  update public.perfiles set es_admin = true where email = 'tu@correo.cl';
-- =============================================================
