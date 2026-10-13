import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Suspense } from 'react';
import { BrandMark } from '@/components/brand-mark';
import { Skeleton } from '@/components/ui/skeleton';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" aria-label="ACME Pay home">
        <BrandMark className="text-lg" />
      </Link>
      {/* Clerk's catch-all routing reads the URL, which is only known at request time. */}
      <Suspense fallback={<Skeleton className="h-[420px] w-[400px] max-w-full rounded-xl" />}>
        <SignIn />
      </Suspense>
    </div>
  );
}
