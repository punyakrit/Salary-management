import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AppPage } from '@/components/app-page';
import { PanelSkeleton } from '@/components/panel';
import { CountryPayCard } from '@/features/insights/components/country-pay-card';
import {
  CurrencyToggle,
  CurrencyToggleFallback,
} from '@/features/insights/components/currency-toggle';
import { KpiCards, KpiCardsSkeleton } from '@/features/insights/components/kpi-cards';
import { MoneySplitCard } from '@/features/insights/components/money-split-card';
import { RolePayCard } from '@/features/insights/components/role-pay-card';
import { SalarySpreadCard } from '@/features/insights/components/salary-spread-card';
import { getOverview } from '@/features/insights/queries';
import { formatDate } from '@/lib/dates';

export const metadata: Metadata = { title: 'Pay overview' };

const WIDE_NARROW = 'grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]';

/**
 * Reads top to bottom as the questions an HR manager asks: how much do we pay,
 * how is it spread, where does it go, how do countries and roles compare.
 */
export default function DashboardPage(props: PageProps<'/dashboard'>) {
  return (
    <AppPage
      title="Pay overview"
      caption={
        <Suspense fallback="Annual base salary in USD">
          <RatesCaption />
        </Suspense>
      }
      actions={
        <Suspense fallback={<CurrencyToggleFallback />}>
          <CurrencyToggle />
        </Suspense>
      }
    >
      <div className="space-y-6">
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>

        <div className={WIDE_NARROW}>
          <Suspense fallback={<PanelSkeleton rows={8} />}>
            <SalarySpreadCard />
          </Suspense>
          <Suspense fallback={<PanelSkeleton rows={8} />}>
            <MoneySplitCard />
          </Suspense>
        </div>

        <div className={WIDE_NARROW}>
          <Suspense fallback={<PanelSkeleton rows={10} />}>
            <CountryPayCard />
          </Suspense>
          <Suspense fallback={<PanelSkeleton rows={6} />}>
            <RolePayCard searchParams={props.searchParams} />
          </Suspense>
        </div>
      </div>
    </AppPage>
  );
}

async function RatesCaption() {
  const { ratesAsOf } = await getOverview();
  return (
    <>
      Annual base salary in USD
      {ratesAsOf && ` · exchange rates as of ${formatDate(ratesAsOf)}`}
    </>
  );
}
