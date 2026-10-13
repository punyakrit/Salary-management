import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EmployeeNotFound() {
  return (
    <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <h1 className="text-lg font-semibold">This employee doesn&apos;t exist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        They may have been deleted, or the link is incomplete.
      </p>
      <Button asChild className="mt-4">
        <Link href="/employees">Back to employees</Link>
      </Button>
    </div>
  );
}
