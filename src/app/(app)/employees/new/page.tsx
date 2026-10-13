import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppPage } from '@/components/app-page';
import { Panel } from '@/components/panel';
import { Skeleton } from '@/components/ui/skeleton';
import { createEmployee } from '@/features/employees/actions';
import { EmployeeForm } from '@/features/employees/components/employee-form';
import { getReferenceData } from '@/features/employees/queries';

export const metadata: Metadata = { title: 'Add employee' };

export default function NewEmployeePage() {
  return (
    <AppPage
      title="Add employee"
      caption="Their starting salary becomes the first entry in their salary history."
    >
      <Panel className="max-w-4xl">
        <Suspense fallback={<Skeleton className="h-[640px]" />}>
          <NewEmployeeForm />
        </Suspense>
      </Panel>
    </AppPage>
  );
}

async function NewEmployeeForm() {
  const reference = await getReferenceData();
  return <EmployeeForm reference={reference} action={createEmployee} />;
}
