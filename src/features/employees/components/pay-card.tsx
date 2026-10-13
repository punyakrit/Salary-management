import { ArrowDownRight, ArrowUpRight, Equal } from 'lucide-react';
import { Money } from '@/components/money';
import { Panel } from '@/components/panel';
import { getJobTitleInsights } from '@/features/insights/queries';
import { withArticle } from '@/features/insights/takeaways';
import type { Employee } from '@/lib/schemas/employee';
import { cn } from '@/lib/utils';
import { describePayPosition, payPosition } from '../pay-position';
import { PeerBand } from './peer-band';

/** The salary, and where it sits among people with the same title, country and currency. */
export async function PayCard({ employee, className }: { employee: Employee; className?: string }) {
  const peers = (await getJobTitleInsights(employee.country.code)).find(
    (row) => row.jobTitle === employee.jobTitle && row.currency === employee.currency,
  );
  const hasPeers = peers !== undefined && peers.headcount >= 2;
  const position = hasPeers ? payPosition(employee.salary, peers.median) : null;
  const Icon =
    position?.direction === 'above'
      ? ArrowUpRight
      : position?.direction === 'below'
        ? ArrowDownRight
        : Equal;

  return (
    <Panel
      className={className}
      title="Pay"
      description="Annual base salary, before bonuses and benefits."
    >
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <Money
          amount={employee.salary}
          currency={employee.currency}
          className="text-4xl leading-none font-bold tracking-tight"
        />
        {employee.currency !== 'USD' && (
          <span className="pb-0.5 text-sm text-muted-foreground">
            about <Money amount={employee.salaryUsd} currency="USD" compact /> in USD
          </span>
        )}
        {position && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
              position.direction === 'above'
                ? 'border-pay/30 bg-pay/10 text-pay'
                : 'text-foreground/80',
            )}
          >
            <Icon className="size-3.5" />
            {describePayPosition(position)}
          </span>
        )}
      </div>

      <div className="mt-8 border-t pt-5">
        {hasPeers ? (
          <>
            <p className="text-sm text-muted-foreground">
              Compared with the {peers.headcount.toLocaleString('en-US')} {employee.jobTitle}s in{' '}
              {withArticle(employee.country.name)} paid in {employee.currency}.
            </p>
            <PeerBand
              name={employee.firstName}
              salary={employee.salary}
              min={peers.min}
              max={peers.max}
              typical={peers.median}
              currency={employee.currency}
            />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No one else is a {employee.jobTitle} paid in {employee.currency} in{' '}
            {withArticle(employee.country.name)}, so there&apos;s nobody to compare with yet.
          </p>
        )}
      </div>
    </Panel>
  );
}
