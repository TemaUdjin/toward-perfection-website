# website — техническая карта подсистемы

Это **подпроект сайта** в системе Toward to Perfection.

> **Бизнес-контекст и общая карта системы — в родительской папке:**
> `../CLAUDE.md` (карта системы) и `../.business/INDEX.md` (бизнес-контекст).
> **Не дублируй** бизнес-инфу в этом файле — здесь только техника сайта.

## Что это

Next.js сайт онлайн-школы Toward to Perfection. Подписка, прогресс по уровням, видео тренера. Деплой на Railway.

## Структура подпроекта

```
website/
├── CLAUDE.md             ← этот файл (техническая карта сайта)
├── plans/                ← планы фич сайта (один план = одна функция)
│   └── sessions/         ← рефлексия после сессий
├── app/                  ← Next.js приложение (App Router)
│   ├── src/app/          ← страницы и роуты
│   ├── src/lib/          ← клиенты Supabase, общие утилиты
│   └── public/           ← статика
├── src/                  ← общие исходники (вне Next)
├── content/              ← контент сайта (тексты, описания уроков)
├── specs/                ← технические спецификации
├── CONTEXT.md            ← текущий статус (legacy, плавно мигрируем в plans/)
├── DECISIONS.md          ← архитектурные решения и причины
└── ROADMAP.md            ← фазы развития (legacy, дублируется с .business/goals/)
```

### Ключевые файлы

| Файл | Что |
|------|-----|
| `app/src/app/page.tsx` | Лендинг |
| `app/src/app/auth/page.tsx` | Sign in / sign up |
| `app/src/app/dashboard/page.tsx` | Кабинет ученика |
| `app/src/app/course/[slug]/page.tsx` | Страница курса |
| `app/src/app/course/[slug]/LessonPlayer.tsx` | Плеер уроков (accordion + видео + Mark as Done) |
| `app/src/lib/data.ts` | Структура курса (статичные данные) |
| `app/src/lib/supabase/client.ts` + `server.ts` | Supabase SSR клиенты |

## Стек

Next.js 16 (Turbopack, App Router) · React 19 · TypeScript · Tailwind 4 · Supabase SSR · Geist шрифт · Railway (Docker/standalone)

## Дизайн-токены (синхронизировано с `../.business/assets/brand-guidelines.md`)

- Фон: `#0a0a0a`
- Акцент: `#c8a96e` (золото)
- Шрифт: Geist
- Видео: вертикаль 9:16

## Текущее состояние

- Phase 1 MVP задеплоен на Railway
- Готовы: Landing, Auth, Dashboard, Course/[slug] с LessonPlayer
- Supabase подключён (URL + anon key в `.env.local`)
- DB схема ещё не подтверждена

## Что дальше

См. `../.business/goals/quarterly.md` и `plans/`.

Ключевые задачи:
1. Открытие ИП в Грузии (вне репо)
2. Подключение **Paddle** для оплаты подписки (после ИП)
3. DB схема Supabase: users, progress, lessons
4. Съёмка видео для уровня Foundation
5. Добавить видео с перформансом тренера на лендинг

## Команды

```bash
cd app
npm run dev           # дев-сервер
npm run build         # production build
npm run start         # запуск собранного
npm run lint          # eslint
```

## Деплой

Прод: **https://handstand-web-production.up.railway.app**

Хостинг: **Railway** (не Vercel, что бы ни говорил `CONTEXT.md`).
Аккаунт: `tema.udjin@gmail.com`.
Railway-проект: **divine-connection** · service: **handstand-web** · environment: **production**.
Сборка: Docker (`app/Dockerfile`), Next standalone-output.

CLI: `~/bin/railway` (Railway CLI v4+, уже залогинен).
Папка `app/` уже залинкована к сервису — линк хранится в `~/.railway/config.json`.

Команды деплоя из `app/`:
```bash
~/bin/railway up --service handstand-web --ci   # сборка + деплой текущего кода
~/bin/railway logs --build                       # логи последней сборки
~/bin/railway logs --deployment                  # рантайм-логи контейнера
~/bin/railway status                             # проверить, к чему залинкована папка
```

Если линк потеряется (например, после перемещения папки), восстановить:
```bash
cd ~/Projects/toward-perfection/website/app
~/bin/railway link --project divine-connection --environment production --service handstand-web
```

`.railwayignore` в `app/` исключает `node_modules/`, `.next/`, `.env*` — без него `railway up` пытается грузить ~700 МБ и таймаутится.

> ⚠️ **Локально нет git-репозитория.** Деплой идёт через `railway up` напрямую. Это работает, но любой откат возможен только через Railway UI (Deployments → Restore). На будущее имеет смысл подключить GitHub-репо для истории и auto-deploy.

## Правила работы

Всё что описано в `../CLAUDE.md` (план на каждую новую фичу, рефлексия, актуализация плана) применяется здесь.

**Где что класть:**
- Фича только сайта (страница, компонент) → план в этом `plans/`
- Кросс-системная задача (бот ↔ сайт, общие данные) → план в `../plans/`
