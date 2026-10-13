import 'server-only';
import { createPrismaClient, type Db } from './prisma-client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill in your Neon URLs.');
}

// Reuse one client across hot reloads in dev; each reload would otherwise open a new pool.
const globalForDb = globalThis as unknown as { db?: Db };

export const db: Db = globalForDb.db ?? createPrismaClient(connectionString);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
