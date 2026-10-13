import type { JobTitleInsight } from '@/lib/schemas/insights';
import { NotFoundError } from '@/server/errors';
import type { ReferenceRepository } from '../reference/reference.repository';
import type { InsightsRepository } from './insights.repository';
import { toDistribution } from './salary-bands';

/** $10K bands read naturally ("$50K–60K") and give ~25 bars for this org. */
const DEFAULT_BAND_SIZE_USD = 10_000;

interface InsightsServiceDeps {
  insights: InsightsRepository;
  reference: ReferenceRepository;
}

export function createInsightsService({ insights, reference }: InsightsServiceDeps) {
  return {
    overview: () => insights.overview(),
    byCountry: () => insights.byCountry(),
    byDepartment: () => insights.byDepartment(),

    /** "How are salaries spread?" — headcount per USD band, without gaps. */
    async distribution(bandSizeUsd = DEFAULT_BAND_SIZE_USD) {
      return toDistribution(await insights.salaryBands(bandSizeUsd), bandSizeUsd);
    },

    /** "What do we pay each job title in <country>?" (J5) */
    async byJobTitle(countryCode: string): Promise<JobTitleInsight[]> {
      if (!(await reference.findCountry(countryCode))) {
        throw new NotFoundError('Country', countryCode);
      }
      return insights.byJobTitle(countryCode);
    },
  };
}

export type InsightsService = ReturnType<typeof createInsightsService>;
