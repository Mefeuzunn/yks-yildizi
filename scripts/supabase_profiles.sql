-- 1. Profiller Tablosu
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('student', 'teacher', 'parent')),
  grade text,
  field text,
  class_code text,
  branch text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS Politikaları
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Herkes kendi profilini görebilir'
  ) then
    create policy "Herkes kendi profilini görebilir"
      on public.profiles for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Herkes kendi profilini güncelleyebilir'
  ) then
    create policy "Herkes kendi profilini güncelleyebilir"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;

-- 3. Otomatik Profil Oluşturucu Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, grade, field, class_code, branch)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'grade',
    new.raw_user_meta_data->>'field',
    new.raw_user_meta_data->>'class_code',
    new.raw_user_meta_data->>'branch'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    grade = excluded.grade,
    field = excluded.field,
    class_code = excluded.class_code,
    branch = excluded.branch;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
