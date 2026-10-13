import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppPage } from '@/components/app-page';
import { FlashToast } from '@/components/flash-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeFilters } from '@/features/employees/components/employee-filters';
import { EmployeeTable } from '@/features/employees/components/employee-table';
import { getReferenceData } from '@/features/employees/queries';
import { listEmployeesQuerySchema } from '@/lib/schemas/employee';
import { firstValues } from '@/lib/url-state';
import { services } from '@/server/container';

export const metadata: Metadata = { title: 'Employees' };

export default function EmployeesPage(props: PageProps<'/employees'>) {
  return (
    <AppPage
      title="Employees"
      caption="Search, filter and sort everyone at ACME. Select a person to see their pay history."
    >
      <Suspense fallback={<DirectorySkeleton />}>
        <Directory searchParams={props.searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function Directory({
  searchParams,
}: {
  searchParams: PageProps<'/employees'>['searchParams'];
}) {
  const raw = firstValues(await searchParams);
  // A hand-edited URL with bad params falls back to defaults instead of erroring.
  const parsed = listEmployeesQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : listEmployeesQuerySchema.parse({});

  const [reference, result] = await Promise.all([
    getReferenceData(),
    services.employees.list(query),
  ]);

  return (
    <div className="space-y-4">
      {raw.deleted && <FlashToast message="Employee deleted" />}
      <EmployeeFilters query={query} reference={reference} />
      <EmployeeTable query={query} result={result} />
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="space-y-px overflow-hidden rounded-xl border">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-14 rounded-none" />
        ))}
      </div>
    </div>
  );
}
