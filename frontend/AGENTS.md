# AGENTS.md

## Project
Frontend for a simplified call-booking app. The actual app is in `booking-starter/`, not the repo root.

There is no auth, no accounts, and no protected routes. The product assumes one predefined calendar owner.

## Commands
Run project commands from `booking-starter/`.

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build and typecheck: `npm run build`
- Lint: `npm run lint`
- Generate OpenAPI: `npm run api:generate`
- Generate OpenAPI plus Prism examples: `npm run api:generate:examples`
- Prism mock with examples: `npm run api:mock`
- Prism mock without custom example patching: `npm run api:mock:clean`

There is no `npm run test` or `npm run typecheck` script; `build` runs `tsc -b`.

## API
Source contract exists in two places: `docs/call_booking_api.tsp` and `booking-starter/docs/call_booking_api.tsp`. Keep them in sync when changing the contract.

The frontend scripts use `booking-starter/docs/call_booking_api.tsp`.

Prism examples are patched by `booking-starter/scripts/add-prism-examples.mjs`; run `npm run api:generate:examples` after changing contract examples or mock behavior.

All frontend API calls go through `src/shared/api`. Do not call `fetch` or `axios` from React components.

API base URL is `VITE_API_BASE_URL`; `src/shared/api/client.ts` falls back to `http://localhost:4010`.

Do not invent endpoints or request/response fields. Check `docs/call_booking_api.tsp` first.

## Architecture
The project uses a lightweight FSD layout under `booking-starter/src`:

- `app/`: router and global styles
- `pages/`: route-level components
- `widgets/`: large reusable UI blocks and layouts
- `features/`, `entities/`: domain/action layers when needed
- `shared/`: UI primitives, API client, utilities

Use the `@/*` alias for `src/*`.

`AppLayout` wraps all `/admin*` routes in `AdminShell`; admin pages must not recreate the sidebar or topbar.

## UI
shadcn/ui components live in `src/shared/ui`; aliases are configured in `components.json`.

Global theme tokens are in `src/app/styles/index.css`. Prefer `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, and existing shadcn components over hardcoded styling.

Keep the established visual direction: light background, white cards, thin borders, rounded corners, orange primary buttons, roomy responsive layouts.

## Workflow
Before frontend API work, inspect the TypeSpec contract and existing `src/shared/api` wrappers.

After code changes, run `npm run build` and `npm run lint` from `booking-starter/`.

After TypeSpec or mock changes, also run `npm run api:generate:examples`.

Do not edit generated `booking-starter/tsp-output/...` as source; regenerate it.
