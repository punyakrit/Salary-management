import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';

/**
 * Factory without `server-only`, so the seed script (plain Node) can reuse it.
 * App code should import the singleton from `./db` instead.
 */
export function createPrismaClient(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

export type Db = ReturnType<typeof createPrismaClient>;
