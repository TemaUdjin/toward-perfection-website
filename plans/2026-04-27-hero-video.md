# 2026-04-27 — Hero video: autoplay, качество, AI upscale

Цель: сделать hero-видео на лендинге работающим на всех устройствах, улучшить качество, задеплоить через GitHub auto-deploy.

## Фазы

- [x] Фаза 1. Добавить `hero.mp4` (вертикальный, 608×1080) как фоновое видео в HeroOverlay.
- [x] Фаза 2. Починить autoplay на iOS — создан клиентский компонент `HeroVideo.tsx` с `useEffect → v.play()`.
- [x] Фаза 3. Постер на 21.94с (`hero-poster.jpg`) через ffmpeg — показывается при Low Power Mode.
- [x] Фаза 4. Добавить `hero2.mp4` (горизонтальный, 1920×1080, конвертирован в H.264 6.4МБ) для десктоп Split-варианта. Решили оставить Overlay для всех экранов.
- [x] Фаза 5. Настроить GitHub auto-deploy через Railway. Починить `rootDirectory=app` через GraphQL API (`serviceInstanceUpdate`). Проверка: push → прод за 54-90 сек.
- [x] Фаза 6. Починить autoplay на десктопе — добавить `canplay` event listener + `preload="auto"` + `volume=0`.
- [x] Фаза 7. Починить CTA кнопку в светлой теме — `<CtaLink white />` в HeroOverlay, всегда белый цвет независимо от темы.
- [x] Фаза 8. AI Upscale через Real-ESRGAN — **ЗАВЕРШЕНО** (23:08 → 01:01 +07, ~2 часа).
  - Модель: `RealESRGAN_x4plus`, PyTorch 2.8 + MPS (Apple Silicon)
  - Вход: `hero.mp4` (608×1080, 741 кадр)
  - Выход: `hero-ai.mp4` (апскейл 4x → даунскейл до 1080×1920, CRF 18, 39 МБ)
  - Автодеплой сработал в 01:01 — git push → Railway → прод
  - Результат: **потрясающе выглядит**, утверждено

## Итог

Реализовано целиком. Hero-секция полностью завершена для мобильных и десктопа.

**Финальное состояние:**
- Видео: `hero-ai.mp4` (AI upscale RealESRGAN, 1080×1920, 39 МБ)
- Постер: `hero-poster.jpg` (кадр 21.94с, для Low Power Mode)
- Autoplay: работает на iOS и десктопе (canplay listener + MPS)
- CTA кнопка: белая в overlay независимо от темы
- Dev-варианты: `/?v=a` (Split+hero2.mp4), `/?v=none` (Text)

## Файлы, которые изменились

| Файл | Что |
|------|-----|
| `app/src/components/HeroVideo.tsx` | Клиентский компонент, `canplay` listener, `volume=0`, дефолт `hero.mp4` / `hero-ai.mp4` после деплоя |
| `app/src/app/page.tsx` | HeroOverlay дефолт, `CtaLink white`, варианты Text/Split/Overlay по `?v=` |
| `app/public/hero.mp4` | Вертикальное видео 608×1080, 17МБ |
| `app/public/hero-hq.mp4` | Апскейл lanczos 1080×1920 (временный, заменится на hero-ai.mp4) |
| `app/public/hero2.mp4` | Горизонтальное H.264 1280×720, 6.4МБ (Split вариант) |
| `app/public/hero-poster.jpg` | Постер кадр 21.94с, 147КБ |
| `app/public/hero-ai.mp4` | AI upscale RealESRGAN (в процессе создания) |

## Railway / деплой (важно на будущее)

- Прод: https://handstand-web-production.up.railway.app
- Project: `divine-connection` · service: `handstand-web` · environment: `production`
- Аккаунт: `tema.udjin@gmail.com`
- `~/bin/railway` — CLI, залогинен
- `~/bin/gh` — GitHub CLI, не авторизован (SSH работает напрямую)
- `~/bin/ffmpeg` — ffmpeg, установлен
- `~/bin/realesrgan-ncnn-vulkan` — бинарь без моделей (не используется)
- Auto-deploy: `git push origin main` → Railway деплоит за ~60-90 сек
- rootDirectory: `app` (выставлено через GraphQL API)
- Если rootDirectory сбросится: GraphQL mutation `serviceInstanceUpdate` с токеном из `~/.railway/config.json:user.accessToken`

## Dev-варианты лендинга

| URL | Что |
|-----|-----|
| `/` | Overlay (дефолт) — hero.mp4 + текст поверх |
| `/?v=a` | Split — hero2.mp4 справа, текст слева |
| `/?v=none` | Text only — без видео |
