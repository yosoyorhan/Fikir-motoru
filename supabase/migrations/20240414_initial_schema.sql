-- Drop existing objects first
do $$ 
declare
    r record;
begin
    -- Disable all triggers
    for r in (select trigger_name, event_object_table 
              from information_schema.triggers 
              where trigger_schema = 'public') loop
        execute format('alter table %I disable trigger %I', 
                      r.event_object_table, r.trigger_name);
    end loop;

    -- Drop all tables
    for r in (select tablename from pg_tables where schemaname = 'public') loop
        execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
    end loop;

    -- Drop all functions
    for r in (select proname, oidvectortypes(proargtypes) as args
              from pg_proc 
              inner join pg_namespace ns on (pg_proc.pronamespace = ns.oid)
              where ns.nspname = 'public') loop
        execute 'drop function if exists public.' || quote_ident(r.proname) || 
                '(' || r.args || ') cascade';
    end loop;
end $$;

-- Set up schema permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- Create profiles table with existing and new fields
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  username text unique check (char_length(username) >= 3),
  full_name text,
  avatar_url text,
  points integer not null default 0,
  level text not null default 'Başlangıç'::text,
  theme text not null default 'dark'::text,
  is_public boolean not null default true,
  settings jsonb default '{}'::jsonb
);

-- Create ideas table with existing and new fields
create table public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  title text not null,
  description text not null,
  topic text not null,
  status text not null default 'Havuz (Kasa)'::text,
  conversation jsonb,
  metadata jsonb default '{}'::jsonb,
  is_public boolean default false
);

-- Create collections table
create table public.collections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  description text,
  user_id uuid references public.profiles(id) on delete cascade,
  is_public boolean default false,
  metadata jsonb default '{}'::jsonb
);

-- Create ideas_collections junction table
create table public.ideas_collections (
  idea_id uuid references public.ideas(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete cascade,
  added_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (idea_id, collection_id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.collections enable row level security;
alter table public.ideas_collections enable row level security;

-- Profiles RLS Policies
create policy "Profiles are viewable by users who created them or if public"
  on profiles for select
  using ( auth.uid() = id or is_public = true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );

-- Ideas RLS Policies
create policy "Ideas are viewable by owner or if public"
  on ideas for select
  using ( auth.uid() = user_id or is_public = true );

create policy "Users can insert their own ideas."
  on ideas for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own ideas."
  on ideas for update
  using ( auth.uid() = user_id );

create policy "Users can delete own ideas."
  on ideas for delete
  using ( auth.uid() = user_id );

-- Collections RLS Policies
create policy "Collections are viewable by owner or if public"
  on collections for select
  using ( auth.uid() = user_id or is_public = true );

create policy "Users can insert their own collections."
  on collections for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own collections."
  on collections for update
  using ( auth.uid() = user_id );

create policy "Users can delete own collections."
  on collections for delete
  using ( auth.uid() = user_id );

-- Ideas Collections Junction RLS Policies
create policy "Ideas_collections are viewable by collection owner"
  on ideas_collections for select
  using (
    exists (
      select 1 from collections c
      where c.id = collection_id
      and (c.user_id = auth.uid() or c.is_public = true)
    )
  );

create policy "Users can insert into own collections"
  on ideas_collections for insert
  with check (
    exists (
      select 1 from collections c
      where c.id = collection_id
      and c.user_id = auth.uid()
    )
  );

create policy "Users can delete from own collections"
  on ideas_collections for delete
  using (
    exists (
      select 1 from collections c
      where c.id = collection_id
      and c.user_id = auth.uid()
    )
  );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    points,
    level,
    theme,
    is_public
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    0,
    'Başlangıç',
    'dark',
    true
  );
  return new;
end;
$$ language plpgsql security definer;

-- Auto-update timestamp function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger handle_updated_at_profiles
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger handle_updated_at_ideas
  before update on ideas
  for each row execute procedure handle_updated_at();

create trigger handle_updated_at_collections
  before update on collections
  for each row execute procedure handle_updated_at();

-- Indexes for better performance
create index if not exists ideas_user_id_idx on public.ideas(user_id);
create index if not exists ideas_status_idx on public.ideas(status);
create index if not exists ideas_topic_idx on public.ideas(topic);
create index if not exists collections_user_id_idx on public.collections(user_id);
create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_level_idx on public.profiles(level);