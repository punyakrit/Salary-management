'use client';

import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <h1 className="text-lg font-semibold">This page couldn&apos;t load</h1>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Something failed on our side, often a dropped database connection. Try again; if it keeps
        happening, share reference {error.digest ?? 'n/a'} with the team.
      </p>
      <Button className="mt-4" onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
