import { defineConfig } from 'prisma/config';

// Prisma 7 no longer loads .env on its own. Next.js does for the app; this covers the CLI.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the real environment (CI, Vercel).
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/index.ts',
  },
  // The CLI (migrate, studio, seed) needs a session-capable connection: Neon's *direct* endpoint.
  // The running app uses the pooled endpoint instead; see src/server/db.ts and docs/02-architecture.md (Performance).
  // Not using prisma's env() helper: it throws when unset, which would break `prisma generate` in CI.
  datasource: { url: process.env.DIRECT_URL },
});
