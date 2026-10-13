import 'server-only';
import { auth } from '@clerk/nextjs/server';

/**
 * Guard for Server Actions. The proxy already protects pages, but a Server
 * Action is a public POST endpoint, so each one re-checks the session.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth.protect();
  return userId;
}
