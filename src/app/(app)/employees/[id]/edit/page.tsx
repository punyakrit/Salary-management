import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppPage } from '@/components/app-page';
import { Panel } from '@/components/panel';
import { Skeleton } from '@/components/ui/skeleton';
import { updateEmployee } from '@/features/employees/actions';
import { EmployeeForm } from '@/features/employees/components/employee-form';
import { getEmployeeOrNotFound, getReferenceData } from '@/features/employees/queries';

export const metadata: Metadata = { title: 'Edit employee' };

export default function EditEmployeePage(props: PageProps<'/employees/[id]/edit'>) {
  return (
    <AppPage
      title="Edit employee"
      caption="Changing salary or pay currency adds an entry to the salary history."
    >
      <Panel className="max-w-4xl">
        <Suspense fallback={<Skeleton className="h-[720px]" />}>
          <EditEmployee params={props.params} />
        </Suspense>
      </Panel>
    </AppPage>
  );
}

async function EditEmployee({ params }: Pick<PageProps<'/employees/[id]/edit'>, 'params'>) {
  const { id } = await params;
  const [employee, reference] = await Promise.all([getEmployeeOrNotFound(id), getReferenceData()]);

  return (
    <>
      <h2 className="mb-6 text-lg font-semibold tracking-tight">
        {employee.firstName} {employee.lastName}
        <span className="ml-2 text-sm font-normal text-muted-foreground">
          {employee.employeeCode}
        </span>
      </h2>
      <EmployeeForm
        reference={reference}
        employee={employee}
        action={updateEmployee.bind(null, employee.id)}
      />
    </>
  );
}
