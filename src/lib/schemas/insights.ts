import { z } from 'zod';
import { countryCodeSchema, isoDateSchema } from './common';

export const salaryStatsSchema = z.object({
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  median: z.number(),
});
export type SalaryStats = z.infer<typeof salaryStatsSchema>;

export const insightsOverviewSchema = z.object({
  headcount: z.number().int(),
  countryCount: z.number().int(),
  departmentCount: z.number().int(),
  totalPayrollUsd: z.number(),
  avgSalaryUsd: z.number(),
  medianSalaryUsd: z.number(),
  /** Middle half of salaries: 25th and 75th percentile, USD. */
  p25SalaryUsd: z.number(),
  p75SalaryUsd: z.number(),
  ratesAsOf: isoDateSchema.nullable(),
});
export type InsightsOverview = z.infer<typeof insightsOverviewSchema>;

export const countryInsightSchema = z.object({
  countryCode: z.string(),
  countryName: z.string(),
  currency: z.string(),
  /** 1 unit of the country's currency in USD, for converting local figures. */
  usdRate: z.number(),
  headcount: z.number().int(),
  local: salaryStatsSchema,
  usd: salaryStatsSchema.extend({ totalPayroll: z.number() }),
});
export type CountryInsight = z.infer<typeof countryInsightSchema>;

export const jobTitleInsightsQuerySchema = z.object({ country: countryCodeSchema });
export type JobTitleInsightsQuery = z.infer<typeof jobTitleInsightsQuerySchema>;

export const jobTitleInsightSchema = salaryStatsSchema.extend({
  jobTitle: z.string(),
  currency: z.string(),
  headcount: z.number().int(),
});
export type JobTitleInsight = z.infer<typeof jobTitleInsightSchema>;

export const departmentInsightSchema = z.object({
  departmentId: z.number().int(),
  departmentName: z.string(),
  headcount: z.number().int(),
  totalPayrollUsd: z.number(),
  avgSalaryUsd: z.number(),
  medianSalaryUsd: z.number(),
});
export type DepartmentInsight = z.infer<typeof departmentInsightSchema>;

export const salaryBandSchema = z.object({
  /** Inclusive lower bound, USD. */
  from: z.number(),
  /** Exclusive upper bound, USD. */
  to: z.number(),
  headcount: z.number().int(),
});
export type SalaryBand = z.infer<typeof salaryBandSchema>;

export const salaryDistributionSchema = z.object({
  bandSizeUsd: z.number(),
  bands: z.array(salaryBandSchema),
});
export type SalaryDistribution = z.infer<typeof salaryDistributionSchema>;
