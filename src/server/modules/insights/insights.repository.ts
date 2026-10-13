import type {
  CountryInsight,
  DepartmentInsight,
  InsightsOverview,
  JobTitleInsight,
} from '@/lib/schemas/insights';

/** Headcount per salary band, keyed by the band's lower bound. Empty bands are omitted. */
export interface SalaryBandCount {
  from: number;
  headcount: number;
}

/** Aggregations over current salaries. USD figures use the stored exchange rates (docs/03-data-model.md). */
export interface InsightsRepository {
  overview(): Promise<InsightsOverview>;
  byCountry(): Promise<CountryInsight[]>;
  byJobTitle(countryCode: string): Promise<JobTitleInsight[]>;
  byDepartment(): Promise<DepartmentInsight[]>;
  /** USD salaries grouped into fixed-width bands. */
  salaryBands(bandSizeUsd: number): Promise<SalaryBandCount[]>;
}
