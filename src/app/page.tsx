import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Suspense } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';

/** Public landing. Everything past it needs a Clerk session (see src/proxy.ts). */
export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <BrandMark className="text-lg" />
        <nav className="flex h-9 items-center gap-2">
          {/* <Show> reads the session cookie, so it streams in after the static shell. */}
          <Suspense>
            <Show when="signed-out">
              <SignInButton forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
                <Button variant="ghost">Sign in</Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard">
                <Button>Create account</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button asChild>
                <Link href="/dashboard">Open workspace</Link>
              </Button>
            </Show>
          </Suspense>
        </nav>
      </header>

      <main className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Every ACME salary, in one place.
          </h1>
          <p className="text-lg text-muted-foreground">
            Look up what anyone is paid, record raises with a reason and date, and see how pay
            compares across countries and roles, without maintaining another spreadsheet.
          </p>
          <div className="flex min-h-10 flex-wrap gap-3">
            <Suspense>
              <Show when="signed-out">
                <SignUpButton forceRedirectUrl="/dashboard" signInForceRedirectUrl="/dashboard">
                  <Button size="lg">Create an HR account</Button>
                </SignUpButton>
                <SignInButton forceRedirectUrl="/dashboard" signUpForceRedirectUrl="/dashboard">
                  <Button size="lg" variant="outline">
                    I already have one
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Go to pay overview</Link>
                </Button>
              </Show>
            </Suspense>
          </div>
        </div>

        <BandIllustration />
      </main>

      <footer className="py-6 text-sm text-muted-foreground">
        Demo workspace with 10,000 synthetic employees. No real personal data.
      </footer>
    </div>
  );
}

/** Decorative preview of the pay-band view. Illustrative only, no real figures. */
function BandIllustration() {
  const rows = [
    { label: 'Staff Engineer', from: 46, to: 92, median: 70 },
    { label: 'Product Manager', from: 34, to: 74, median: 52 },
    { label: 'Software Engineer', from: 24, to: 62, median: 42 },
    { label: 'Account Executive', from: 18, to: 48, median: 30 },
    { label: 'Support Specialist', from: 8, to: 30, median: 17 },
  ];
  return (
    <figure aria-hidden className="rounded-xl border bg-card p-6 shadow-sm">
      <figcaption className="mb-5 text-sm text-muted-foreground">Pay by job title</figcaption>
      <ul className="space-y-4">
        {rows.map((row) => (
          <li key={row.label} className="grid grid-cols-[9rem_1fr] items-center gap-4 text-sm">
            <span className="truncate">{row.label}</span>
            <span className="relative h-5">
              <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <span
                className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[3px] bg-pay-band"
                style={{ left: `${row.from}%`, width: `${row.to - row.from}%` }}
              />
              <span
                className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-foreground"
                style={{ left: `${row.median}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
