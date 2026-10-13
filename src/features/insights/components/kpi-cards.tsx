import { Panel } from '@/components/panel';
import { formatMoney } from '@/lib/money';
import { getOverview } from '../queries';

const usd = (amount: number) => formatMoney(amount, 'USD', { compact: true });

/** The four numbers an HR manager asks about first. */
export async function KpiCards() {
  const overview = await getOverview();
  const cards = [
    {
      label: 'Headcount',
      value: overview.headcount.toLocaleString('en-US'),
      note: `across ${overview.countryCount} countries, ${overview.departmentCount} departments`,
    },
    {
      label: 'Annual payroll',
      value: usd(overview.totalPayrollUsd),
      note: 'base salary, converted to USD',
    },
    {
      label: 'Typical salary',
      value: usd(overview.medianSalaryUsd),
      note: 'median; half earn more, half less',
    },
    {
      label: 'Middle 50% earn',
      value: `${usd(overview.p25SalaryUsd)} – ${usd(overview.p75SalaryUsd)}`,
      note: '25th to 75th percentile',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        // The page's one entrance: cards rise in reading order (CSS, so never hidden pre-hydration).
        <div
          key={card.label}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <Panel className="h-full" contentClassName="space-y-2">
            <p className="text-[15px] font-medium text-foreground/80">{card.label}</p>
            <p className="figures text-[2rem] leading-none font-bold tracking-tight">
              {card.value}
            </p>
            <p className="text-sm text-muted-foreground">{card.note}</p>
          </Panel>
        </div>
      ))}
    </div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-[142px] rounded-xl border bg-muted/30" />
      ))}
    </div>
  );
}
