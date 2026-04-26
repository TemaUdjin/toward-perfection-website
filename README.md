# toward-perfection-website

Сайт онлайн-школы **Toward to Perfection** — мобильность, гибкость, хэндстенд.

Прод: https://handstand-web-production.up.railway.app

## Стек

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 4 · Supabase SSR · Geist · Railway (Docker).

## Структура

```
website/
├── CLAUDE.md       ← техническая карта подсистемы (читать первым)
├── DECISIONS.md    ← архитектурные решения и причины
├── ROADMAP.md      ← фазы развития
├── plans/          ← планы фич (один план = одна функция)
│   └── sessions/   ← рефлексия после сессий
├── app/            ← Next.js приложение (исходники)
├── content/        ← контент сайта (тексты, описания уроков)
└── specs/          ← технические спецификации
```

## Разработка

```bash
cd app
npm install
npm run dev
# http://localhost:3000
```

## Деплой

Полная инструкция и команды — в [CLAUDE.md](CLAUDE.md) → раздел «Деплой».

Кратко:
```bash
cd app
~/bin/railway up --service handstand-web --ci
```

## Контекст системы

Этот репозиторий — одна из подсистем проекта Toward to Perfection. Бизнес-контекст и общая карта системы лежат уровнем выше: `~/Projects/toward-perfection/CLAUDE.md` и `~/Projects/toward-perfection/.business/`.
