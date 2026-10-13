import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Protected-first: salary data is sensitive, so everything requires a session
// except the landing page, Clerk's auth pages and the health check.
// Server Actions also call `requireUser()` themselves (they're public endpoints).
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/health']);

// Signed-in users have nothing to do here, so send them to the workspace.
// Exact paths only: Clerk's multi-step flows (e.g. /sign-in/sso-callback) must run untouched.
const isSignedOutOnlyRoute = createRouteMatcher(['/', '/sign-in', '/sign-up']);

const WORKSPACE_HOME = '/dashboard';

export default clerkMiddleware(async (auth, request) => {
  if (isSignedOutOnlyRoute(request)) {
    const { isAuthenticated } = await auth();
    if (isAuthenticated) return NextResponse.redirect(new URL(WORKSPACE_HOME, request.url));
    return;
  }
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*',
  ],
};
