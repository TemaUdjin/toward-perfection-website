-- ============================================================
-- Seed lessons for all 3 courses
-- ============================================================

-- Foundation
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Wrist Preparation',    'Essential wrist mobility and strengthening before any weight-bearing work.',          480,  1, true from public.courses c where c.slug = 'foundation' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Shoulder Opening',     'Open the shoulder girdle and build the elevation pattern needed for handstand.',      720,  2, true from public.courses c where c.slug = 'foundation' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Hollow Body',          'Learn the core shape of every handstand — lying down first.',                         600,  3, true from public.courses c where c.slug = 'foundation' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Wall Kick-Up',         'Safe and controlled entry into your first wall handstand.',                            900,  4, true from public.courses c where c.slug = 'foundation' on conflict do nothing;

-- Build
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Pirouette Drill',      'Find your balance point through controlled rotation away from the wall.',             720,  1, true from public.courses c where c.slug = 'build' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Finger Pressure',      'Learn to steer with your fingers — the key to freestanding balance.',                 600,  2, true from public.courses c where c.slug = 'build' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Freestanding Kick-Up', 'Your first attempts at a freestanding handstand with safe exits.',                   1200,  3, true from public.courses c where c.slug = 'build' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Line Refinement',      'Perfect the straight line from wrists to toes. Fix banana back forever.',             900,  4, true from public.courses c where c.slug = 'build' on conflict do nothing;

-- Mastery
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'L-Sit Foundation',     'Build the compression strength required for press handstand.',                        900,  1, true from public.courses c where c.slug = 'mastery' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Tuck Press',           'First stage of pressing — tucked legs, full shoulder elevation.',                    1200,  2, true from public.courses c where c.slug = 'mastery' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'Straddle Press',       'The full straddle press from floor to handstand.',                                   1500,  3, true from public.courses c where c.slug = 'mastery' on conflict do nothing;
insert into public.lessons (course_id, title, description, duration_seconds, order_index, is_published)
select c.id, 'One Arm Preparation',  'Lateral weight shift drills and one-arm balance conditioning.',                      1200,  4, true from public.courses c where c.slug = 'mastery' on conflict do nothing;
