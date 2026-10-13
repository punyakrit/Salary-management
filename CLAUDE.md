# ACME Salary Management

HR salary management app for 10,000 employees across countries. Single Next.js 16 app + Prisma 7 + Neon Postgres.
Read before changing anything: [requirements](docs/01-requirements.md) · [architecture](docs/02-architecture.md) · [data model](docs/03-data-model.md).

@AGENTS.md

## Commands

```bash
pnpm dev            # Next.js dev server
pnpm test           # Vitest unit tests (no DB, < 1s)
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm db:migrate     # prisma migrate dev (uses DIRECT_URL)
pnpm db:seed        # 10k deterministic employees
```

## Architecture rules

- `src/server/**` is server-only. `container.ts` and `db.ts` import `server-only`.
- Services (`*.service.ts`) hold business rules and depend only on repository **interfaces**: no Prisma, no Next.js imports.
- Only `*.prisma-repository.ts` may use Prisma. Raw SQL only for analytics, via tagged templates.
- Pages and Server Actions get services from `@/server/container`. Never import Prisma in `src/app` or `src/features`.
- `src/lib/**` must run on client and server: zod schemas, money/date helpers, constants. No server imports.
- One zod schema in `src/lib/schemas` validates both the form and the Server Action.
- Money: `DECIMAL` + ISO currency, never floats in storage; format via `formatMoney(amount, currency)`.
- Services throw domain errors from `src/server/errors.ts`; Server Actions turn them into form state.
- Auth (Clerk): `src/proxy.ts` is protected-first. Every Server Action calls `await requireUser()` before anything else.
- Writes call `updateTag(EMPLOYEES_TAG)`; cached reads (`'use cache'`) live in `src/features/*/queries.ts`.
- UI is light-only on white (`forcedTheme="light"`); money uses `<Money>`, ranges use `<PayBand>`.
- Dashboard copy: every section gets a takeaway sentence from `src/features/insights/takeaways.ts` (pure + tested). Say "typical", not "median".
- Layout: every workspace page uses `<AppPage title caption actions>` (sticky top bar with ⌘K search). Cards are `<Panel>`; a long list beside a shorter card goes in `<ScrollFill>` with `Panel fill` so rows match their neighbour instead of stretching it.
- Motion: entrance and growth are CSS (`animate-fade-up`, `animate-grow-x`, `animate-slide-from` in globals.css): content is painted at its final size and never hidden before hydration. `motion/react` only for interaction (toggle slide, list reflow, cross-fades), with `AnimatePresence initial={false}` so server-rendered content stays visible.

## Next.js 16.4 gotchas (this is newer than most training data)

- `cacheComponents` is on: uncached data (Prisma queries, `searchParams`) must sit inside `<Suspense>` or the build fails.
- `params` / `searchParams` are Promises. Use the global `PageProps<'/route'>` type.
- After a write in a Server Action: `updateTag(EMPLOYEES_TAG)`, then `redirect(...)` (redirect throws).
- `usePathname()`/`useSearchParams()` and Clerk's `<Show>`, `<SignIn>`, `<SignUp>` read request data: wrap them in `<Suspense>`.
- `'use client'` files can't export helpers for server use; put pure functions in `src/lib`.
- `error.tsx` receives `{ error, retry }`; `middleware.ts` is now `proxy.ts`.
- When unsure, read `node_modules/next/dist/docs/` instead of guessing.

## Workflow

- Use the project skills in `.claude/skills/` for their tasks (new server module, UI feature, schema change, tests, commit checkpoint).
- Tests first for service logic; keep tests deterministic (fixed clock, fixed seed).
- **Never `git commit` or `git push`.** At the end of each logical unit, run the `commit-checkpoint` skill: verify, stage that unit only, hand the human a commit message.
- Add significant prompts and decisions to `docs/04-ai-usage.md`.
