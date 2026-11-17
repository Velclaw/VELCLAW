Copy từng mục dưới đây thành file riêng tại đúng đường dẫn. Mỗi file cố tình ngắn — chỉ ghi rule của khu đó, phần chung cứ để root `AGENTS.md` lo.

---

## File 1 — `app/AGENTS.md`

# app/ — Next.js App Router

Routes live here (App Router). Dynamic segments in use: `[owner]`, `[repo]` under `app/repos/`.

- Server Components by default. Add `"use client"` only when the component needs state, effects, or event handlers.
- Import app code via the `@/*` alias (maps to repo root).
- Every route segment should have `loading.tsx` and `error.tsx` where a fetch happens.
- `error.tsx` messages shown to users must be generic ('Something went wrong'). Never render `error.message` — it may contain internals. Log details server-side with static strings only.
- Never touch `process.env` in a component that renders on the client, except `NEXT_PUBLIC_*`.
- New pages need tabs or navigation registered in the existing layout (`components/repo-layout.tsx` for the repo pages).

---

## File 2 — `app/api/AGENTS.md`

# app/api/ — API route handlers

- One `route.ts` per resource, one HTTP verb handler per concern. Existing pattern: `app/api/repos/[owner]/[repo]/commits/route.ts` etc.
- Validate every external input (params, query, body) with a zod schema **before** use. Reject with 400 on failure.
- Authenticate first, fetch data second. Never return data the caller is not authorized for.
- Catch all errors inside the handler: respond with a generic message + correct status code. Never return stack traces, provider errors, or internal paths in the response body.
- Logging inside handlers: **static strings only** (root rule — logs reach the UI).

---

## File 3 — `components/AGENTS.md`

# components/ — UI components

- Base primitives live in `components/ui/` (shadcn/ui). Before writing any UI, check there first.
- Add a missing component with the CLI, not by hand: `pnpm dlx shadcn@latest add <name>`.
- Do not restructure the generated shadcn primitives; build your feature as a wrapper/composition around them.
- Merge conditional classes with `cn()` from `@/lib/utils`. Tailwind CSS 4 syntax.
- Shared client state: jotai atoms. Keep atoms close to the feature that owns them.
- Components never log, never fetch secrets, never import from `lib/db` or `server/`.

---

## File 4 — `lib/AGENTS.md`

# lib/ — Application services and integrations

- This directory is server-side by default (GitHub via Octokit, Vercel SDK, agent runtimes, DB). Never import from `lib/` server modules inside a client component.
- Env vars with KEY, TOKEN, SECRET, PASSWORD, TEAM_ID, PROJECT_ID are read only in server code paths.
- Logging goes through `lib/utils/logging.ts`. Reminder: static strings only; `redactSensitiveInfo()` is a backup net, not permission to log dynamic values.
- Co-locate a zod schema with the service/API it validates, and export it for the route handler to reuse.
- New integration = one file per provider, same shape as the existing providers (see how GitHub/Vercel providers are structured).

---

## File 5 — `lib/db/AGENTS.md`

# lib/db/ — Database schema and migrations

This is the real home of the database layer — `drizzle.config.ts` points here (`schema.ts`, `migrations/`), not the `drizzle/` directory the README mentions.

- Change schema in `lib/db/schema.ts` → `pnpm db:generate` → **read the generated SQL** → `pnpm db:migrate`.
- Never hand-edit files in `migrations/`. If a generated migration is wrong, fix the schema and regenerate.
- Destructive changes (DROP TABLE/COLUMN, type narrowing, renames) require explicit user confirmation before generating.
- Access the DB only through drizzle-orm (`lib/db` exports); no raw SQL strings elsewhere in the app.
- Never hardcode a connection string. Config comes from `POSTGRES_URL` env only.

---

## File 6 — `server/AGENTS.md`

# server/ — Server-side runtime

- Runtime pieces that execute workloads (legacy entry: `server/index.js` for `pnpm legacy:start`). The primary app entry is Next.js, not this directory.
- Logging rules are strictest here: static strings only, at every level, no exception — anything this code logs can surface to end users.
- Long-running processes must never be started by an agent (`pnpm start`, `node --watch`, nodemon). Validate changes with `pnpm validate:runtime` instead.

---

## File 7 — `tests/AGENTS.md`

# tests/ — Test files

- Run with `pnpm test` → `tsx --test tests/**/*.test.ts` (Node test runner). Follow existing naming: `*.test.ts`.
- Bug fix = regression test that fails before the fix, passes after.
- No network calls in tests. Mock GitHub/Vercel/DB clients at the boundary; do not mock the function under test.
- Tests run against static data only — never real credentials, real repos, or real user data.
- Do not weaken or delete existing tests to make a change pass.

---

## File 8 — `scripts/AGENTS.md`

# scripts/ — Repo automation

- Plain Node ESM (`.mjs`), standard library preferred; no new dependency without a stated reason.
- `validate:runtime` and `audit:ecosystem` run in CI — never weaken, skip, or short-circuit their checks to make a PR pass.
- Script output follows the same static-string logging rule; scripts feed logs the user can see.