import type { SalaryDistribution } from '@/lib/schemas/insights';
import type { SalaryBandCount } from './insights.repository';

/**
 * SQL only returns bands that have people in them; a histogram needs the empty
 * ones too, or a gap in pay would be invisible.
 */
export function toDistribution(rows: SalaryBandCount[], bandSizeUsd: number): SalaryDistribution {
  if (rows.length === 0) return { bandSizeUsd, bands: [] };

  const counts = new Map(rows.map((row) => [row.from, row.headcount]));
  const froms = rows.map((row) => row.from);
  const lowest = Math.min(...froms);
  const highest = Math.max(...froms);

  const bands = [];
  for (let from = lowest; from <= highest; from += bandSizeUsd) {
    bands.push({ from, to: from + bandSizeUsd, headcount: counts.get(from) ?? 0 });
  }
  return { bandSizeUsd, bands };
}
