# VelClaw — Agent Instructions

VelClaw is a multi-project monorepo containing a web app, a game, a CLI tool, and a mobile app. This file gives coding agents the ground rules for working anywhere in the repo. **Read the nearest `AGENTS.md` to the file you are editing and follow it — it overrides this root file.**

## Project layout

```
VelClaw/
├── apps/
│   ├── web/        # Web app (TypeScript, Next.js)
│   ├── mobile/     # Mobile app (React Native / Expo)
│   └── cli/        # CLI tool (Node.js, TypeScript)
├── game/           # Game project (Godot 4)
├── services/       # Backend services (Python / FastAPI)
├── packages/       # Shared libraries used by apps/ and services/
├── docs/           # Design docs, specs, ADRs
└── scripts/        # Repo automation (bash/python)
```

If you add a new top-level directory, give it its own `AGENTS.md` or update this file.

## Golden rules

1. Never invent commands, paths, or APIs. Verify by reading the code and the nearest `AGENTS.md` first.
2. Make the smallest change that completes the task. Do not refactor unrelated code, rename things, or reformat files you did not touch.
3. Run the relevant checks (below) before declaring a task done. Fix what fails.
4. Never commit secrets, API keys, tokens, or `.env` files. `.env*` files are gitignored; use `.env.example` for structure only.
5. Never push directly to `main`. Work on a feature branch, open a PR.
6. If something is genuinely ambiguous and the wrong guess is expensive, ask instead of guessing.

## Commands

Run everything from the repo root with pnpm workspaces:

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Dev (web) | `pnpm --filter web dev` |
| Dev (cli) | `pnpm --filter cli build && node apps/cli/dist/index.js` |
| Test all | `pnpm test` |
| Test one package | `pnpm --filter <pkg> test` |
| Lint all | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Python services | `uv sync && uv run pytest services/` |
| Godot game | Open in Godot 4.x; headless test: `godot --headless --path game/ --quit` |

If a command in this table is stale, fix this file in the same PR — this file must always match reality.

## Code style

- TypeScript: strict mode, no `any` unless annotated with a reason, prefer `type` over `interface` for unions, named exports only.
- Python (services/): ruff for lint + format, type hints on public functions, no bare `except`.
- Every package keeps its own lint/type/test config; do not hoist package-specific settings to the root.
- Comments explain *why*, not *what*. No commented-out code left behind — delete it.
- No new dependencies without a reason in the PR description.

## Testing expectations

- Bug fixes: add a regression test that fails before the fix and passes after.
- New features: at least one happy-path test; UI changes also need a manual check note in the PR.
- Do not weaken, skip, or delete existing tests to make a change pass. If a test is genuinely wrong, change it and explain in the PR.

## Commits & PRs

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:` — e.g. `fix(web): guard against empty cart on checkout`.
- PR description: what changed, why, how to verify. Link the issue if one exists.
- One logical change per PR. Do not mix unrelated fixes.

## Security

- Never log or commit user data, credentials, or tokens. Redact in logs.
- Validate all external input at service boundaries (API routes, CLI args, websocket payloads).
- Dependency updates that touch auth/crypto/network code require a note in the PR explaining the bump.

## When you are unsure

- Check `docs/` for specs and ADRs before changing behavior.
- If a decision would be hard to reverse (schema changes, public API shape, file formats), stop and ask the user instead of proceeding.