---
name: server-module
description: Add or change backend logic in src/server — a service with business rules, its repository interface, the Prisma implementation, an in-memory fake, and unit tests. Use for any new domain capability (e.g. bulk salary raise, CSV export query) or a change to existing rules.
---

# Server module

Follow the existing `src/server/modules/employees/` module as the reference.

## Files per feature (`src/server/modules/<feature>/`)

| File | Contains | May import |
|---|---|---|
| `<feature>.repository.ts` | `interface <Feature>Repository` + write types | `@/lib/*` types only |
| `<feature>.service.ts` | `create<Feature>Service(deps)` returning methods; `export type <Feature>Service = ReturnType<…>` | repository interfaces, `@/lib/*`, `@/server/errors`, `@/server/clock` |
| `<feature>.prisma-repository.ts` | `createPrisma<Feature>Repository(db: Db)` | Prisma client, `@/server/errors` |
| `<feature>.service.test.ts` | behaviour tests against fakes | service, fakes, fixtures |
| `testing/in-memory-<feature>.repository.ts` | fake implementing the interface | interface, `@/lib/*` |

## Steps

1. **Write the test first** in `<feature>.service.test.ts`, describing the rule as a sentence (`it('records a revision when salary changes')`). Use the `write-tests` skill conventions.
2. Add/extend the repository **interface** with the smallest method the service needs. Return DTO shapes from `@/lib/schemas` (numbers for money, ISO strings for dates).
3. Implement the rule in the service. Inject everything external via `deps` (repositories, `clock`). Throw `NotFoundError` / `BusinessRuleError(message, field)` / `ConflictError` — never HTTP or Next.js concepts.
4. Implement the fake, then the Prisma repository:
   - Multi-row writes go in one transaction (nested writes or `db.$transaction`).
   - Translate Prisma `P2002` → `ConflictError`, `P2025` → `NotFoundError`.
   - Convert `Decimal` → `number` and `Date` → ISO string at this boundary.
   - Raw SQL only for aggregates, with `db.$queryRaw\`...\`` (parameterised).
5. Wire it in `src/server/container.ts`.
6. `pnpm test && pnpm typecheck`, then run the `commit-checkpoint` skill.

## Don'ts

- No Prisma or `next/*` imports in services.
- Don't mock Prisma; write a fake for the interface instead.
- Don't add a method to the interface "for later".
