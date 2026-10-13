import { ArrowLeft, Pencil } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppPage } from '@/components/app-page';
import { CountryFlag } from '@/components/country-flag';
import { FlashToast } from '@/components/flash-toast';
import { Panel, PanelSkeleton } from '@/components/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteEmployeeButton } from '@/features/employees/components/delete-employee-button';
import { PayCard } from '@/features/employees/components/pay-card';
import { SalaryHistory } from '@/features/employees/components/salary-history';
import { getEmployeeOrNotFound } from '@/features/employees/queries';
import { EMPLOYMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate, formatTenure } from '@/lib/dates';
import { services } from '@/server/container';

export const metadata: Metadata = { title: 'Employee' };

const FLASH: Record<string, string> = {
  created: 'Employee added',
  updated: 'Changes saved',
};

export default function EmployeePage(props: PageProps<'/employees/[id]'>) {
  return (
    <AppPage title="Employee profile" caption="Pay, peer comparison and salary history">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
        <Link href="/employees">
          <ArrowLeft />
          All employees
        </Link>
      </Button>
      <Suspense fallback={<EmployeeSkeleton />}>
        <EmployeeDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </AppPage>
  );
}

async function EmployeeDetail({
  params,
  searchParams,
}: Pick<PageProps<'/employees/[id]'>, 'params' | 'searchParams'>) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const employee = await getEmployeeOrNotFound(id);
  const revisions = await services.employees.listSalaryRevisions(employee.id);
  const name = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`;
  const editHref = `/employees/${employee.id}/edit`;
  const flash = typeof saved === 'string' ? FLASH[saved] : undefined;

  return (
    <article className="space-y-6">
      {flash && <FlashToast message={flash} />}

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            {initials}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">{name}</h2>
              <Badge variant="secondary">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</Badge>
            </div>
            <p className="flex flex-wrap items-center gap-x-2 text-muted-foreground">
              {employee.jobTitle}, {employee.department.name}
              <span className="inline-flex items-center gap-1.5">
                <CountryFlag code={employee.country.code} />
                {employee.country.name}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={editHref}>
              <Pencil />
              Edit
            </Link>
          </Button>
          <DeleteEmployeeButton id={employee.id} name={name} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Suspense fallback={<PanelSkeleton rows={5} />}>
          <PayCard employee={employee} />
        </Suspense>

        <Panel title="Details">
          <dl className="divide-y text-sm">
            <Detail label="Employee code" value={employee.employeeCode} />
            <Detail
              label="Work email"
              value={
                <a className="underline-offset-4 hover:underline" href={`mailto:${employee.email}`}>
                  {employee.email}
                </a>
              }
            />
            <Detail label="Department" value={employee.department.name} />
            <Detail
              label="Country"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <CountryFlag code={employee.country.code} />
                  {employee.country.name}
                </span>
              }
            />
            <Detail label="Employment" value={EMPLOYMENT_TYPE_LABELS[employee.employmentType]} />
            <Detail
              label="Hired"
              value={
                <>
                  {formatDate(employee.hireDate)}
                  <span className="ml-1.5 text-muted-foreground">
                    ({formatTenure(employee.hireDate, new Date())})
                  </span>
                </>
              }
            />
            <Detail label="Pay currency" value={employee.currency} />
          </dl>
        </Panel>
      </div>

      <Panel
        title="Salary history"
        description="Newest first. Every change is kept, with its reason."
      >
        <SalaryHistory revisions={revisions} editHref={editHref} />
      </Panel>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  );
}

function EmployeeSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <Skeleton className="h-14 w-96" />
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}
