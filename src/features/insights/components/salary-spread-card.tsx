import { Panel } from '@/components/panel';
import { getOverview, getSalaryDistribution } from '../queries';
import { spreadTakeaway } from '../takeaways';
import { SalaryHistogram } from './salary-histogram';

/** "How are salaries spread?" Every employee, in $10K bands. */
export async function SalarySpreadCard({ className }: { className?: string }) {
  const [{ bands }, overview] = await Promise.all([getSalaryDistribution(), getOverview()]);

  return (
    <Panel
      className={className}
      title="How salaries are spread"
      description={spreadTakeaway(bands)}
    >
      <SalaryHistogram
        bands={bands}
        median={overview.medianSalaryUsd}
        p25={overview.p25SalaryUsd}
        p75={overview.p75SalaryUsd}
      />
    </Panel>
  );
}
