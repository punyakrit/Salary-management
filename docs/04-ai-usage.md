# AI usage

Built with **Claude Code**. The human makes the product and architecture calls, and owns every commit. The agent drafts, scaffolds, and writes code and tests under the rules below.

## How the agent is steered

- [`CLAUDE.md`](../CLAUDE.md) is always loaded. It covers architecture rules, commands, and "never commit".
- [`.claude/skills/`](../.claude/skills) holds playbooks loaded on demand, so every feature follows the same pattern:
  - `server-module`: new backend feature (service, repository, tests)
  - `ui-feature`: page with Server Component reads, Server Action writes, URL state, shadcn
  - `db-schema-change`: schema → migration → client → seed → docs
  - `write-tests`: test conventions (AAA, fakes over mocks, deterministic)
  - `commit-checkpoint`: run checks, stage one unit, hand over a commit message

## Guardrails

1. Requirements first, then architecture, then code.
2. Typechecks and tests must pass before anything is staged.
3. Package versions are checked against npm, not assumed. That's how the Prisma 8 RC was avoided.
4. The agent stages, the human commits.

## Prompt log

| # | Prompt (gist) | Outcome |
|---|---|---|
| 1 | "Read the assessment brief, decide the architecture (Next.js + shadcn, Express + Prisma, Neon), write the docs and a template. Don't commit." | Requirements doc; first architecture draft with a separate Express API |
| 2 | "If we're using Next.js, why do we need a separate backend? Argue it with me." | Agent argued both sides and recommended Next.js only, unless the role is backend-focused. **Human chose Next.js only.** Monorepo and Express API removed; backend became a `src/server/` layer |
| 3 | "Stage changes as you go so I can commit side by side." | Agent stages one logical unit at a time; human commits |
| 4 | "Too many ADR files; keep the docs concise." | Seven ADRs collapsed into one decisions table in `02-architecture.md` |
| 5 | "Start the UI. Here's the Neon URL." | Applied the migration and seeded 10k rows (8 s). Checked every insights query against real data; measured latency and swapped the directory's transaction for parallel queries (700 → 200 ms). Built the "ledger" UI with a pay-band signature mark; chart colours validated with a palette checker |
| 6 | "Add Clerk login, middleware and a proper HR sidebar." (with Clerk's setup prompt) | Clerk CLI linked the app; protected-first `proxy.ts`, `requireUser()` in every Server Action, sign-in/up pages, sidebar with user menu. The human completed the Clerk login; the agent didn't handle credentials |
| 7 | "Make the background completely white." | Forced light theme on white surfaces; removed the dark-mode toggle |
| 8 | "Remake the dashboard so a non-technical HR person understands it. Minimal, not AI-generic, Framer Motion." | Ran a structured critique (design-critique skill) of the old dashboard, then rebuilt it insight-first: an opening sentence built from live data, one computed takeaway per section (unit-tested), a new salary-distribution histogram (it was in the requirements but missing), restrained motion (one entrance, bars grow, toggle slides, rows reflow). Found and fixed an animation bug where `AnimatePresence initial={false}` skipped start states |
| 9 | "It still looks basic. Give me a detailed prompt to generate a reference image." | Agent wrote a mockup prompt with the app's real data, layout, palette and an "avoid" list; the human generated the reference image |
| 10 | "See the new UI, it's much better." (reference image) | Rebuilt the shell and dashboard to match: top bar with ⌘K search and USD/local switch, KPI cards, annotated histogram, payroll split, countries table with SVG flags, roles table |
| 11 | "Make it scrollable; it leaves white space." / "Fix the profile UI too." | Lists scroll inside height-matched cards; profile rebuilt as Pay (labelled peer band) + Details + Salary history table with a "Record a raise" prompt. Verification on a production build exposed that JS-driven entrance animations left content hidden until hydration, so entrances moved to CSS |
| 12 | "Have you built everything the brief asks for? Confirm it." | Audited the brief line by line against the repo and the live database (10,000 employees, 10 countries). Code, seed, tests and artifacts were done; deploy, demo video and incremental commits were still open. Fixed two links to a deleted ADR file |
| 13 | "Stage the commits one by one with messages." | Planned 13 bottom-up commits (lib → db → seed → server → UI → auth → features → docs) and replayed them in a scratch copy, so every commit typechecks and passes its tests on its own. The replay caught one bad split: the seed imported the Prisma client from a later commit. After three commits the human asked for fewer, larger ones, so the rest were merged into four, cut only at boundaries the replay had already verified |
