# Сессия 2026-04-27 — Hero video, auto-deploy, AI upscale

## 1. Какая задача была поставлена

Несколько задач в рамках одной сессии:
1. Разобраться как задеплоить сайт (Railway, не Vercel)
2. Настроить GitHub репо и auto-deploy
3. Сделать hero-видео автовоспроизводящимся на iOS и десктопе
4. Улучшить качество видео, попробовать AI upscale

## 2. Как решал

**Деплой:**
- Нашёл Railway CLI в `~/bin/railway` через историю shell (`railway login --browserless`)
- Проект: `divine-connection`, сервис: `handstand-web`
- Инициализировал git в `website/`, создал приватный GitHub-репо `TemaUdjin/toward-perfection-website` через SSH
- Подключил GitHub→Railway через Railway GraphQL API (`serviceInstanceUpdate`, rootDirectory=app) — дашборд не трогали
- Auto-deploy: push → прод за ~60-90 сек, подтверждено дважды

**Hero видео:**
- Проблема iOS: `autoPlay` атрибут игнорируется Safari. Решение: клиентский компонент `HeroVideo.tsx` с `useEffect → v.muted = true → v.play()`
- Проблема десктоп: `play()` вызывался раньше, чем браузер загрузил данные. Решение: `addEventListener('canplay', play)` + `preload="auto"` + `v.volume = 0`
- Постер: ffmpeg, кадр на 21.94с, для Low Power Mode
- CTA кнопка в светлой теме: `<CtaLink white />` — фиксированный белый цвет в overlay, не зависит от CSS-переменных темы
- CSS filter классы (`lg:blur-[2px]`) — удалены, конфликтовали с видеорендерингом в Tailwind v4
- Решение по видео на десктоп: Overlay для всех экранов (вертикальное видео с object-cover), Split `/?v=a` сохранён как вариант

**AI Upscale:**
- Объяснил разницу между lanczos (интерполяция) и AI upscale (нейросеть, предсказание деталей)
- Установил: PyTorch 2.8 (MPS) + basicsr + realesrgan через pip3 на Python 3.9
- Workaround для `torchvision.transforms.functional_tensor` (удалён в новых версиях): monkey-patch
- Запустил `/tmp/upscale_hero.py` в фоне: 741 кадр, RealESRGAN_x4plus, MPS
- Создал `/tmp/autodeploy.sh` (nohup): ждёт Done!, потом git commit + push → auto-deploy

## 3. Решил ли — да / нет / частично

**Деплой и GitHub:** Да, полностью. Auto-deploy работает.
**iOS autoplay:** Да.
**Десктоп autoplay:** Да (после нескольких итераций).
**CTA кнопка:** Да.
**AI upscale:** Частично — в процессе. Скрипт запущен, автодеплой настроен. Завершится ночью.

## 4. Эффективно ли, что можно было лучше

**Хорошо:**
- Railway rootDirectory через GraphQL API — нестандартно, но элегантно
- nohup + autodeploy script — правильный паттерн для overnight задач
- Monkey-patch torchvision — быстрый workaround без downgrade

**Что можно было лучше:**
- Несколько итераций с `hero-hq.mp4` (апскейл lanczos) которые не дали результата — можно было сразу начать AI upscale
- CSS filter `lg:blur-[2px]` на video-элементе — нужно было проверить Tailwind v4 совместимость раньше
- Проблему с rootDirectory=null нужно было поймать раньше (first GitHub build fail)

## 5. Как было и как стало

**Было:**
- Нет git-репо, нет GitHub, деплой только через `railway up` вручную
- Видео не играло на iOS и частично на десктопе
- Качество 608×1080 пиксельное на десктопе
- CTA кнопка невидима в светлой теме

**Стало:**
- Git репо, GitHub, auto-deploy на push (~90 сек)
- Видео играет на iOS и десктопе
- AI upscale в процессе (RealESRGAN_x4plus, 1080×1920)
- CTA кнопка всегда белая на overlay-герое
- Dev-варианты: `/?v=a` (Split), `/?v=none` (Text)
- ffmpeg, gh, realesrgan-ncnn-vulkan, PyTorch+realesrgan — все инструменты установлены в `~/bin/`
