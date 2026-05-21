# AGENTS.md

## Где работать

- Весь код, зависимости и скрипты находятся в `booking-starter/`. В корне репозитория нет `package.json`.
- Все команды `npm run ...` выполнять из директории `booking-starter/`.

## Команды разработки

- `npm run dev` — запуск dev-сервера Vite.
- `npm run build` — сборка проекта (`tsc -b && vite build`).
- `npm run lint` — запуск ESLint.
- `npm run preview` — preview production-сборки.

## Hexlet-ограничения

- **Не удалять, не редактировать и не переименовывать** файл `.github/workflows/hexlet-check.yml`. Он генерируется автоматически и используется для внешней проверки Hexlet.
- Локальных тестов нет — в `booking-starter/package.json` отсутствует скрипт `test`. Тесты запускаются на стороне Hexlet после пуша.

## TypeScript-специфика

- Проект использует **TypeScript Project References**: корневой `tsconfig.json` ссылается на `tsconfig.app.json` (код приложения, `src/`) и `tsconfig.node.json` (конфиг Vite).
- Сборка запускается через `tsc -b` (build mode).
- `"type": "module"` — все конфиги (`eslint.config.js`, `vite.config.ts`) в формате ESM.

## Доменная модель

- `docs/call_booking_api.tsp` — спецификация API Call Booking (TypeSpec). Источник правды для сущностей: `Owner`, `EventType`, `Slot`, `GuestContact`, `Booking`.
