-- ============================================================
-- Community Feed + Gamification
-- Adds: points to profiles, activity_feed table, triggers
-- ============================================================

-- ---------------------------------------------------------------
-- 1. PROFILES — добавляем очки
-- ---------------------------------------------------------------
alter table public.profiles
  add column if not exists points integer not null default 0;

-- ---------------------------------------------------------------
-- 2. ACTIVITY_FEED — лента событий
-- ---------------------------------------------------------------
create table if not exists public.activity_feed (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  type       text        not null check (type in ('lesson_done', 'post_created', 'thread_created', 'joined')),
  payload    jsonb       not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.activity_feed enable row level security;

create index if not exists activity_feed_created_at_idx on public.activity_feed (created_at desc);
create index if not exists activity_feed_user_id_idx    on public.activity_feed (user_id);

do $$ begin
  create policy "activity_feed: authenticated read"
    on public.activity_feed for select to authenticated using (true);
exception when duplicate_object then null;
end $$;

grant select on public.activity_feed to authenticated;

-- ---------------------------------------------------------------
-- 3. GET_LEVEL — вычисляет уровень по очкам
-- ---------------------------------------------------------------
create or replace function public.get_level(p_points integer)
returns text
language sql immutable
as $$
  select case
    when p_points >= 150 then 'Mastery'
    when p_points >= 50  then 'Build'
    else 'Foundation'
  end;
$$;

-- ---------------------------------------------------------------
-- 4. TRIGGER: урок завершён → +10 очков + запись в ленту
-- ---------------------------------------------------------------
create or replace function public.handle_lesson_completed()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_lesson_title text;
  v_course_title text;
begin
  select l.title, c.title
    into v_lesson_title, v_course_title
    from public.lessons l
    join public.courses c on c.id = l.course_id
   where l.id = new.lesson_id;

  update public.profiles
     set points = points + 10
   where id = new.user_id;

  insert into public.activity_feed (user_id, type, payload)
  values (
    new.user_id,
    'lesson_done',
    jsonb_build_object(
      'lesson_id',    new.lesson_id,
      'lesson_title', coalesce(v_lesson_title, ''),
      'course_title', coalesce(v_course_title, '')
    )
  );

  return new;
end;
$$;

drop trigger if exists on_lesson_completed on public.lesson_progress;
create trigger on_lesson_completed
  after insert on public.lesson_progress
  for each row execute function public.handle_lesson_completed();

-- ---------------------------------------------------------------
-- 5. TRIGGER: пост создан → +3 очка + запись в ленту
-- ---------------------------------------------------------------
create or replace function public.handle_post_created()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_thread_title text;
begin
  select title into v_thread_title
    from public.forum_threads
   where id = new.thread_id;

  update public.profiles
     set points = points + 3
   where id = new.user_id;

  insert into public.activity_feed (user_id, type, payload)
  values (
    new.user_id,
    'post_created',
    jsonb_build_object(
      'post_id',      new.id,
      'thread_id',    new.thread_id,
      'thread_title', coalesce(v_thread_title, ''),
      'excerpt',      left(new.body, 120)
    )
  );

  return new;
end;
$$;

drop trigger if exists on_post_created on public.forum_posts;
create trigger on_post_created
  after insert on public.forum_posts
  for each row execute function public.handle_post_created();

-- ---------------------------------------------------------------
-- 6. TRIGGER: тред создан → +3 очка + запись в ленту
-- ---------------------------------------------------------------
create or replace function public.handle_thread_created()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
     set points = points + 3
   where id = new.user_id;

  insert into public.activity_feed (user_id, type, payload)
  values (
    new.user_id,
    'thread_created',
    jsonb_build_object(
      'thread_id', new.id,
      'title',     new.title,
      'excerpt',   left(new.body, 120)
    )
  );

  return new;
end;
$$;

drop trigger if exists on_thread_created on public.forum_threads;
create trigger on_thread_created
  after insert on public.forum_threads
  for each row execute function public.handle_thread_created();

-- ---------------------------------------------------------------
-- 7. HANDLE_NEW_USER — обновляем: добавляем 'joined' в ленту
-- ---------------------------------------------------------------
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

  insert into public.activity_feed (user_id, type, payload)
  values (new.id, 'joined', '{}');

  return new;
end;
$$;
