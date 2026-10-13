import { connection, NextResponse } from 'next/server';
import { db } from '@/server/db';

/** Liveness + database check for uptime monitors. Public (see src/proxy.ts). */
export async function GET() {
  await connection();
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'up' });
  } catch {
    return NextResponse.json({ status: 'degraded', database: 'down' }, { status: 503 });
  }
}
