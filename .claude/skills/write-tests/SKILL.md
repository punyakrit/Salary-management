---
name: write-tests
description: Write or review unit tests in this repo — Vitest, Arrange-Act-Assert, fakes over mocks, deterministic time and data. Use when adding tests for services, schemas, seed generators or helpers, or when a test is slow, flaky or hard to read.
---

# Test conventions

**Goal:** fast (whole suite < 1 s), deterministic, readable as a spec of the business rules.

## Rules

- **Name tests as behaviour:** `it('records the previous currency when pay moves to a new currency')`. A reviewer should learn the rules by reading `describe`/`it` lines only.
- **Arrange / Act / Assert**, separated by blank lines. One behaviour per test.
- **Fakes, not mocks**, for repositories: `testing/in-memory-*.repository.ts`. `vi.fn()` only for pass-through collaborators where the call itself is the behaviour.
- **Builders for data:** `anEmployeeInput({ salary: 90_000 })`. Override only what the test cares about.
- **Pin time and randomness:** inject `clock: () => FIXED_NOW`; seed faker explicitly. No `Date.now()` / `Math.random()` in code under test.
- **No network, no database** in `*.test.ts`. DB-backed tests are `*.int.test.ts` and opt-in.
- Assert on outcomes (returned values, stored state), not on internal calls.
- Use `it.each` for input tables (validation edge cases).

## What to test where

| Layer | Test |
|---|---|
| `src/lib/schemas` | accepts valid input, normalises, rejects each edge case |
| services | every business rule and error path, via fakes |
| pure helpers (`employee-query`, `employee-code`, seed generators) | input → output tables |
| Prisma repositories / raw SQL | `*.int.test.ts` against a throwaway Neon branch |

Run: `pnpm test` (all) · `pnpm test:watch` · `pnpm exec vitest run path/to/file`.
