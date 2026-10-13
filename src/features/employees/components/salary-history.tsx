import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Money } from '@/components/money';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/dates';
import type { SalaryRevision } from '@/lib/schemas/employee';
import { cn } from '@/lib/utils';

interface SalaryHistoryProps {
  revisions: SalaryRevision[];
  editHref: string;
}

/** Newest first. Each row shows the change against the revision before it. */
export function SalaryHistory({ revisions, editHref }: SalaryHistoryProps) {
  return (
    <div>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b text-left text-[13px] text-muted-foreground">
              <th className="px-1 pb-2.5 font-medium">Effective from</th>
              <th className="px-1 pb-2.5 text-right font-medium">Annual salary</th>
              <th className="px-1 pb-2.5 text-right font-medium">Change</th>
              <th className="px-4 pb-2.5 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {revisions.map((revision) => (
              <tr key={revision.id}>
                <td className="px-1 py-3 whitespace-nowrap">
                  <time dateTime={revision.effectiveDate}>
                    {formatDate(revision.effectiveDate)}
                  </time>
                </td>
                <td className="px-1 py-3 text-right font-semibold">
                  <Money amount={revision.newSalary} currency={revision.currency} />
                </td>
                <td className="px-1 py-3 text-right">
                  <Change revision={revision} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{revision.reason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {revisions.length <= 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            No pay changes since they joined. Raises you record will appear here with their reason.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={editHref}>
              <TrendingUp />
              Record a raise
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function Change({ revision }: { revision: SalaryRevision }) {
  if (revision.previousSalary === null) {
    return <span className="text-muted-foreground">Starting salary</span>;
  }
  const previousCurrency = revision.previousCurrency ?? revision.currency;
  if (previousCurrency !== revision.currency) {
    return (
      <span className="text-muted-foreground">
        from <Money amount={revision.previousSalary} currency={previousCurrency} compact />
      </span>
    );
  }
  const change = (revision.newSalary - revision.previousSalary) / revision.previousSalary;
  return (
    <span className={cn('figures font-medium', change >= 0 ? 'text-pay' : 'text-destructive')}>
      {change >= 0 ? '+' : '−'}
      {Math.abs(change * 100).toFixed(1)}%
    </span>
  );
}
