import Link from 'next/link';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <BrandMark className="text-lg" />
      <div>
        <h1 className="text-xl font-semibold">There&apos;s no page at this address</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Check the link, or head back to the workspace.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Go to pay overview</Link>
      </Button>
    </div>
  );
}
