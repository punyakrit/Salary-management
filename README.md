# ACME Salary Management

Web app for an HR Manager to manage salaries for 10,000 employees across 10 countries, and to answer *"how does the org pay people?"*.

**Stack:** Next.js 16 (App Router, Server Components, Server Actions) · shadcn/ui · Clerk · Prisma 7 · Neon Postgres · Vitest

| Doc | |
|---|---|
| [Requirements](docs/01-requirements.md) | goal, scope, what's deliberately left out |
| [Architecture](docs/02-architecture.md) | structure, rules, key decisions & trade-offs, performance |
| [Data model](docs/03-data-model.md) | ER diagram, indexes, seed strategy |
| [AI usage](docs/04-ai-usage.md) | how Claude Code was steered, prompt log |

## Run locally

Requires Node 24+ and pnpm 9+.

```bash
pnpm install
cp .env.example .env      # Neon pooled + direct URLs; Clerk keys (or run: clerk init --app <app_id>)
pnpm db:deploy            # apply migrations
pnpm db:seed              # 10,000 deterministic employees
pnpm dev                  # http://localhost:3000, then create an account
```

## Scripts

| Command | |
|---|---|
| `pnpm test` | unit tests (no database, < 1 s) |
| `pnpm typecheck` / `pnpm lint` | static checks |
| `pnpm db:migrate` | create a migration from schema changes |
| `pnpm db:studio` | browse data in Prisma Studio |

## Layout

```
src/app        routes        src/server   services · repositories · Prisma
src/features   feature UI    src/lib      zod schemas · money helpers
prisma/        schema · migrations · seed
```
