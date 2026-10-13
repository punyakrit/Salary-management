---
name: db-schema-change
description: Change the database schema — add/alter a Prisma model, field, index or constraint — and carry the change through migration, generated client, seed, schemas and docs. Use whenever prisma/schema.prisma needs to change.
---

# Schema change

1. Edit `prisma/schema.prisma`. Conventions: snake_case columns via `@map`, tables via `@@map`, money as `Decimal @db.Decimal(14, 2)` + a `Char(3)` currency, dates as `@db.Date`, timestamps as `@db.Timestamptz(3)`.
2. Add an index for every new filter/sort column; justify it in `docs/03-data-model.md`.
3. Create the migration:
   - With a database: `pnpm db:migrate --name <change>` (uses `DIRECT_URL`).
   - Offline: `pnpm exec prisma migrate diff --from-schema <old> --to-schema prisma/schema.prisma --script` into a new `prisma/migrations/<timestamp>_<change>/migration.sql`.
   - Hand-add `CHECK` constraints at the end of the SQL when a rule must hold at the DB level.
   - Never edit a migration that has already been committed. Add a new one.
4. `pnpm db:generate` to regenerate `src/server/generated/prisma` (git-ignored).
5. Update, in this order: zod schemas in `src/lib/schemas` → repository interface/fake/Prisma mapper → seed generators + their tests → the ER diagram in `docs/03-data-model.md`.
6. `pnpm test && pnpm typecheck`, then `commit-checkpoint`. Migration + schema + code that depends on it go in **one** commit.
