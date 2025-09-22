# Repository Guidelines

This guide helps contributors navigate and work effectively in this repo.

## Project Structure & Module Organization
- `apps/web/` – Next.js 15 app (TypeScript, App Router). Key areas: `src/app/` (routes + API), `src/components/` (UI + features), `src/lib/` (server actions, DB), `prisma/` (schema).
- `services/langgraph_v10/` – Python LangGraph v10 service. Entry graphs in `src/agent/graphs/`, tools in `src/agent/tools/`.
- `db/` – SQL migrations (also mounted to Postgres in `docker-compose.yml`).
- `scripts/` – Dev utilities (`db-up.sh`, `db-ping.sh`, `web-dev.sh`).

## Build, Test, and Development Commands
- Install deps: `pnpm install`
- Web dev (Next.js): `pnpm web-dev` or `pnpm --filter web dev`
- Web build/start: `pnpm --filter web build` then `pnpm --filter web start`
- Type check + lint: `pnpm check` (TS noEmit + ESLint)
- DB up (Docker): `pnpm db:up` then `pnpm db:ping`
- Migrations (web): `cd apps/web && pnpm db:migrate`
- LangGraph dev: `pnpm langgraph:dev` or `./start-langgraph.sh`

## Coding Style & Naming Conventions
- TypeScript/React: 2‑space indent; components `PascalCase.tsx` in `src/components/`; hooks `useThing.ts`; route handlers `route.ts` per Next.js conventions; utility modules `camelCase.ts` in `src/lib/`.
- Styling: TailwindCSS; prefer utility classes and shadcn/ui patterns.
- Linting: ESLint (`eslint-config-next`). Fix issues before PRs.
- Python (services): PEP8, 4‑space indent; modules `snake_case.py`; classes `PascalCase`.

## Testing Guidelines
- No formal test runner is configured yet. For web changes, at minimum run `pnpm check` and exercise affected routes locally.
- When adding tests, place unit tests under `apps/web/src/__tests__/` using `*.test.ts(x)` and prefer React Testing Library for components.
- PRs that change core logic or APIs should include tests and repro steps.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise subject; scope optional (e.g., "web:", "langgraph:"). Example: `web: refactor document upload flow`.
- PRs: include a clear description, linked issues, setup/repro steps, and screenshots/GIFs for UI changes. Note any schema or env var changes.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` (web) and `.env` in `services/langgraph_v10/`.
- Required envs commonly include `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Azure storage keys, and LLM keys.
- Validate DB connectivity with `pnpm db:ping`; API docs for LangGraph at `http://localhost:2024/docs` when running.

