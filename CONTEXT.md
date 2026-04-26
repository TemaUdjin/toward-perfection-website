# Handstand App — Текущий статус

## Где мы сейчас
**Фаза:** 1 — MVP сайт готов, нужна Supabase и деплой  
**Последняя сессия:** 2026-04-24

---

## Что решено

- Продукт: личный обучающий сайт Юджина — handstand + arm balance + йога
- Формат: подписка, персональная программа, видео тренера, AI анализ формы
- Бренд: личный (не платформа для других тренеров)
- Монетизация: free до уровня 2 → платная подписка дальше
- Дизайн: тёмный фон (#0a0a0a), золотой акцент (#c8a96e), Geist шрифт
- Видео: вертикальный формат (9:16), на ноутбуке — по центру с фоном

---

## Что сделано

- [x] Концепция и структура папки проекта
- [x] Next.js 16 + Tailwind 4 + TypeScript + App Router
- [x] Supabase SSR клиент (client.ts + server.ts)
- [x] Тёмная/светлая тема (next-themes)
- [x] Лендинг (/)
- [x] Авторизация (/auth) — Sign In / Sign Up
- [x] Dashboard (/dashboard) — прогресс, уровни, AI CTA
- [x] Курс (/course/[slug]) — Foundation, Build, Mastery
- [x] LessonPlayer — accordion, видео-плейсхолдер, Mark as Done
- [x] Чистый production build

---

## Следующий шаг

1. **Supabase** — создать проект на supabase.com, вставить URL + key в `.env.local`
2. **Схема БД** — таблицы users, progress, lessons
3. ~~**Деплой** — Vercel (бесплатно, auto-deploy из GitHub)~~ Уже задеплоен на Railway: https://handstand-web-production.up.railway.app (см. `CLAUDE.md` → Деплой)
4. **Контент** — начать снимать видео уровня Foundation

## Структура файлов

```
/Users/yujin/website/app/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← лендинг
│   │   ├── auth/page.tsx     ← sign in / sign up
│   │   ├── dashboard/page.tsx
│   │   └── course/[slug]/
│   │       ├── page.tsx
│   │       └── LessonPlayer.tsx
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── ThemeToggle.tsx
│   └── lib/
│       ├── data.ts            ← структура курса
│       └── supabase/
│           ├── client.ts
│           └── server.ts
└── .env.local                 ← сюда вставить Supabase ключи
```
