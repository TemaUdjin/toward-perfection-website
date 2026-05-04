-- ============================================================
-- Toward to Perfection — Full Schema (safe evolution)
-- Применяется поверх существующих таблиц profiles и progress
-- ============================================================

-- ---------------------------------------------------------------
-- 1. PROFILES — расширяем существующую таблицу
-- ---------------------------------------------------------------
alter table public.profiles
  add column if not exists full_name               text,
  add column if not exists avatar_url              text,
  add column if not exists subscription_status     text not null default 'inactive',
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists paddle_customer_id      text,
  add column if not exists updated_at              timestamptz not null default now();

-- Добавляем check constraint если его нет
do $$ begin
  alter table public.profiles
    add constraint profiles_subscription_status_check
    check (subscription_status in ('active', 'inactive', 'trial'));
exception when duplicate_object then null;
end $$;

-- Политики доступа (пропускаем если уже есть)
do $$ begin
  create policy "profiles: own read" on public.profiles for select using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "profiles: own insert" on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null;
end $$;

-- Trigger: создать профиль при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------
-- 2. COURSES — курсы
-- ---------------------------------------------------------------
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  description   text,
  thumbnail_url text,
  order_index   integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.courses enable row level security;

do $$ begin
  create policy "courses: authenticated read published"
    on public.courses for select to authenticated
    using (is_published = true);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 3. LESSONS — уроки внутри курса
-- ---------------------------------------------------------------
create table if not exists public.lessons (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid not null references public.courses(id) on delete cascade,
  title            text not null,
  description      text,
  vimeo_video_id   text,
  duration_seconds integer,
  order_index      integer not null default 0,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.lessons enable row level security;

-- Уроки видят только активные подписчики
do $$ begin
  create policy "lessons: active subscribers read published"
    on public.lessons for select to authenticated
    using (
      is_published = true
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.subscription_status = 'active'
      )
    );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 4. LESSON_PROGRESS — прогресс (новая схема с UUID FK)
--    Старая таблица progress остаётся для совместимости с текущим кодом
-- ---------------------------------------------------------------
create table if not exists public.lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

do $$ begin
  create policy "lesson_progress: own read"
    on public.lesson_progress for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "lesson_progress: own insert"
    on public.lesson_progress for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "lesson_progress: own delete"
    on public.lesson_progress for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 5. FORUM_THREADS — темы форума
-- ---------------------------------------------------------------
create table if not exists public.forum_threads (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  is_pinned  boolean not null default false,
  is_locked  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_threads enable row level security;

do $$ begin
  create policy "forum_threads: authenticated read"
    on public.forum_threads for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_threads: subscribers insert"
    on public.forum_threads for insert to authenticated
    with check (
      auth.uid() = user_id
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.subscription_status = 'active'
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_threads: own update"
    on public.forum_threads for update
    using (auth.uid() = user_id and is_locked = false);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_threads: own delete"
    on public.forum_threads for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 6. FORUM_POSTS — ответы в темах
-- ---------------------------------------------------------------
create table if not exists public.forum_posts (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.forum_threads(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

do $$ begin
  create policy "forum_posts: authenticated read"
    on public.forum_posts for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_posts: subscribers insert"
    on public.forum_posts for insert to authenticated
    with check (
      auth.uid() = user_id
      and exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
          and profiles.subscription_status = 'active'
      )
      and exists (
        select 1 from public.forum_threads
        where forum_threads.id = thread_id
          and forum_threads.is_locked = false
      )
    );
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_posts: own update"
    on public.forum_posts for update using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "forum_posts: own delete"
    on public.forum_posts for delete using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 7. FORM_ANALYSIS_RESULTS — история анализа формы
-- ---------------------------------------------------------------
create table if not exists public.form_analysis_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  feedback_text text not null,
  video_deleted boolean not null default false,
  analyzed_at   timestamptz not null default now()
);

alter table public.form_analysis_results enable row level security;

do $$ begin
  create policy "form_analysis: own read"
    on public.form_analysis_results for select using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "form_analysis: own insert"
    on public.form_analysis_results for insert with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------
-- 8. GRANTS — доступ через Data API
-- ---------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.courses to authenticated;
grant select on public.lessons to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.forum_threads to authenticated;
grant select, insert, update, delete on public.forum_posts to authenticated;
grant select, insert on public.form_analysis_results to authenticated;

-- ---------------------------------------------------------------
-- 9. Стартовые данные — курсы
-- ---------------------------------------------------------------
insert into public.courses (slug, title, description, order_index, is_published) values
  ('foundation', 'Foundation', 'Build the base — wrists, shoulders, hollow body', 1, true),
  ('build',      'Build',      'Develop balance, lines, and freestanding holds',   2, true),
  ('mastery',    'Mastery',    'Press, one arm, and advanced skills',               3, true)
on conflict (slug) do nothing;
