import { ArrowDown, ArrowUp, ArrowUpDown, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Money } from '@/components/money';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { EmployeeSortField } from '@/lib/constants';
import type { EmployeeListResponse, ListEmployeesQuery } from '@/lib/schemas/employee';
import { employeesHref, nextSort } from '@/lib/url-state';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/dates';

interface EmployeeTableProps {
  query: ListEmployeesQuery;
  result: EmployeeListResponse;
}

export function EmployeeTable({ query, result }: EmployeeTableProps) {
  if (result.data.length === 0)
    return (
      <EmptyState
        filtered={Boolean(query.search || query.country || query.departmentId || query.jobTitle)}
      />
    );

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-[0_1px_2px_rgb(16_24_40/0.04)]">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead query={query} field="lastName" className="pl-5">
              Employee
            </SortableHead>
            <SortableHead query={query} field="jobTitle">
              Role
            </SortableHead>
            <SortableHead query={query} field="countryCode">
              Country
            </SortableHead>
            <SortableHead query={query} field="hireDate">
              Hired
            </SortableHead>
            <SortableHead query={query} field="salary" align="right" className="pr-5">
              Annual salary
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data.map((employee) => (
            <TableRow key={employee.id} className="relative">
              <TableCell className="pl-5">
                <Link
                  href={`/employees/${employee.id}`}
                  className="font-medium after:absolute after:inset-0 hover:underline focus-visible:outline-none"
                >
                  {employee.firstName} {employee.lastName}
                </Link>
                <div className="text-xs text-muted-foreground">{employee.employeeCode}</div>
              </TableCell>
              <TableCell>
                <div>{employee.jobTitle}</div>
                <div className="text-xs text-muted-foreground">{employee.department.name}</div>
              </TableCell>
              <TableCell>{employee.country.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(employee.hireDate)}
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Money
                  amount={employee.salary}
                  currency={employee.currency}
                  className="font-medium"
                />
                {employee.currency !== 'USD' && (
                  <div className="text-xs text-muted-foreground">
                    <Money amount={employee.salaryUsd} currency="USD" />
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination query={query} meta={result.meta} />
    </div>
  );
}

interface SortableHeadProps {
  query: ListEmployeesQuery;
  field: EmployeeSortField;
  align?: 'left' | 'right';
  className?: string;
  children: React.ReactNode;
}

function SortableHead({ query, field, align = 'left', className, children }: SortableHeadProps) {
  const active = query.sortBy === field;
  const Icon = !active ? ArrowUpDown : query.sortOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <TableHead
      className={cn(align === 'right' && 'text-right', className)}
      aria-sort={active ? (query.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <Link
        href={employeesHref(query, { ...nextSort(query, field), page: 1 })}
        scroll={false}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {children}
        <Icon className={cn('size-3.5', !active && 'opacity-50')} aria-hidden />
      </Link>
    </TableHead>
  );
}

function Pagination({
  query,
  meta,
}: {
  query: ListEmployeesQuery;
  meta: EmployeeListResponse['meta'];
}) {
  const first = (meta.page - 1) * meta.pageSize + 1;
  const last = Math.min(meta.page * meta.pageSize, meta.total);
  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm"
    >
      <p className="figures text-muted-foreground">
        Showing {first.toLocaleString('en-US')}–{last.toLocaleString('en-US')} of{' '}
        <span className="font-medium text-foreground">{meta.total.toLocaleString('en-US')}</span>{' '}
        employees
      </p>
      <div className="flex items-center gap-2">
        <span className="figures mr-2 text-muted-foreground">
          Page {meta.page} of {meta.totalPages.toLocaleString('en-US')}
        </span>
        <PageLink enabled={hasPrevious} href={employeesHref(query, { page: meta.page - 1 })}>
          Previous
        </PageLink>
        <PageLink enabled={hasNext} href={employeesHref(query, { page: meta.page + 1 })}>
          Next
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  enabled,
  href,
  children,
}: {
  enabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={href} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <h2 className="font-semibold">
        {filtered ? 'No employees match these filters' : 'No employees yet'}
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {filtered
          ? 'Try a shorter search, or clear a filter to widen the results.'
          : 'Add your first employee, or run the seed script to load sample data.'}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {filtered ? (
          <Button variant="outline" asChild>
            <Link href="/employees">Clear filters</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/employees/new">
              <UserPlus />
              Add employee
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
