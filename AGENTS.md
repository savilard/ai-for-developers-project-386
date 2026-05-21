# AGENTS.md

## Где работать

- Весь код, зависимости и скрипты находятся в `booking-starter/`. В корне репозитория нет `package.json`.
- Все команды `npm run ...` выполнять из директории `booking-starter/`.

## Стек и архитектура

- **React 19 + TypeScript ~6.0 + Vite 8**.
- **Tailwind CSS v4** с Vite-плагином (`@tailwindcss/vite`). Стили — через `@import "tailwindcss"` и `@theme` в `src/index.css`.
- **shadcn/ui** — `components.json` настроен, `baseColor: "neutral"`. Утилита `cn()` в `src/lib/utils.ts`.
- **Alias `@/*`** настроен на `src/*` в `vite.config.ts` и `tsconfig.app.json`.
- **ESM-only** — `"type": "module"`, все конфиги в формате ESM.

## Правила разработки

- **UI-компоненты берём из shadcn/ui**. Создавать вручную только если shadcn не покрывает кейс.
- **shadcn-компоненты остаются в `src/components/ui/`**. Не перемещать.
- **Собственные компоненты — в `src/components/`**. Не усложнять структуру без необходимости.
- **Не создавать сложную архитектуру** без явной необходимости. Нижний порог для выделения слоёв.
- **После любых изменений запускать `npm run build`**. Сборка (`tsc -b && vite build`) — обязательная проверка.

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
- В `tsconfig.app.json` установлен `ignoreDeprecations: "6.0"`, потому что `baseUrl` deprecated в TS 6.0, но необходим для alias `@/*`.

## Доменная модель

- `docs/call_booking_api.tsp` — спецификация API Call Booking (TypeSpec). Источник правды для сущностей: `Owner`, `EventType`, `Slot`, `GuestContact`, `Booking`.
