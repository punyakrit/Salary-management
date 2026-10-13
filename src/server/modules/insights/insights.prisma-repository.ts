import { toIsoDate } from '@/lib/dates';
import type { Db } from '@/server/prisma-client';
import type { InsightsRepository } from './insights.repository';

/**
 * Aggregations run in Postgres; Prisma's query builder can't express medians
 * (percentile_cont) or the FX join, so this is the one place with raw SQL.
 * Tagged templates keep every value parameterised.
 *
 * "Local" stats only include employees paid in their country's currency, so an
 * expat paid in USD never gets averaged into rupees.
 */
export function createPrismaInsightsRepository(db: Db): InsightsRepository {
  return {
    async overview() {
      const [row] = await db.$queryRaw<
        Array<{
          headcount: number;
          countryCount: number;
          departmentCount: number;
          totalPayrollUsd: number;
          avgSalaryUsd: number;
          medianSalaryUsd: number;
          p25SalaryUsd: number;
          p75SalaryUsd: number;
          ratesAsOf: Date | null;
        }>
      >`
        SELECT
          count(*)::int                                   AS "headcount",
          count(DISTINCT e.country_code)::int             AS "countryCount",
          count(DISTINCT e.department_id)::int            AS "departmentCount",
          coalesce(round(sum(e.salary * r.usd_rate), 2), 0)::float8 AS "totalPayrollUsd",
          coalesce(round(avg(e.salary * r.usd_rate), 2), 0)::float8 AS "avgSalaryUsd",
          coalesce(round((percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary * r.usd_rate))::numeric, 2), 0)::float8
                                                          AS "medianSalaryUsd",
          coalesce(round((percentile_cont(0.25) WITHIN GROUP (ORDER BY e.salary * r.usd_rate))::numeric, 2), 0)::float8
                                                          AS "p25SalaryUsd",
          coalesce(round((percentile_cont(0.75) WITHIN GROUP (ORDER BY e.salary * r.usd_rate))::numeric, 2), 0)::float8
                                                          AS "p75SalaryUsd",
          (SELECT max(as_of) FROM exchange_rates)         AS "ratesAsOf"
        FROM employees e
        JOIN exchange_rates r ON r.currency = e.currency
      `;
      if (!row) throw new Error('Overview query returned no rows');
      return { ...row, ratesAsOf: row.ratesAsOf ? toIsoDate(row.ratesAsOf) : null };
    },

    async byCountry() {
      const rows = await db.$queryRaw<
        Array<{
          countryCode: string;
          countryName: string;
          currency: string;
          usdRate: number;
          headcount: number;
          localMin: number | null;
          localMax: number | null;
          localAvg: number | null;
          localMedian: number | null;
          usdMin: number;
          usdMax: number;
          usdAvg: number;
          usdMedian: number;
          usdTotal: number;
        }>
      >`
        SELECT
          c.code AS "countryCode", c.name AS "countryName", c.currency,
          cr.usd_rate::float8 AS "usdRate",
          count(*)::int AS "headcount",
          min(e.salary) FILTER (WHERE e.currency = c.currency)::float8 AS "localMin",
          max(e.salary) FILTER (WHERE e.currency = c.currency)::float8 AS "localMax",
          round(avg(e.salary) FILTER (WHERE e.currency = c.currency), 2)::float8 AS "localAvg",
          round((percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary)
                 FILTER (WHERE e.currency = c.currency))::numeric, 2)::float8 AS "localMedian",
          round(min(e.salary * r.usd_rate), 2)::float8 AS "usdMin",
          round(max(e.salary * r.usd_rate), 2)::float8 AS "usdMax",
          round(avg(e.salary * r.usd_rate), 2)::float8 AS "usdAvg",
          round((percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary * r.usd_rate))::numeric, 2)::float8 AS "usdMedian",
          round(sum(e.salary * r.usd_rate), 2)::float8 AS "usdTotal"
        FROM employees e
        JOIN countries c       ON c.code = e.country_code
        JOIN exchange_rates r  ON r.currency = e.currency
        JOIN exchange_rates cr ON cr.currency = c.currency
        GROUP BY c.code, c.name, c.currency, cr.usd_rate
        ORDER BY "headcount" DESC
      `;
      return rows.map((row) => ({
        countryCode: row.countryCode,
        countryName: row.countryName,
        currency: row.currency,
        usdRate: row.usdRate,
        headcount: row.headcount,
        local: {
          min: row.localMin ?? 0,
          max: row.localMax ?? 0,
          avg: row.localAvg ?? 0,
          median: row.localMedian ?? 0,
        },
        usd: {
          min: row.usdMin,
          max: row.usdMax,
          avg: row.usdAvg,
          median: row.usdMedian,
          totalPayroll: row.usdTotal,
        },
      }));
    },

    byJobTitle(countryCode) {
      return db.$queryRaw`
        SELECT
          e.job_title AS "jobTitle",
          e.currency,
          count(*)::int AS "headcount",
          min(e.salary)::float8 AS "min",
          max(e.salary)::float8 AS "max",
          round(avg(e.salary), 2)::float8 AS "avg",
          round((percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary))::numeric, 2)::float8 AS "median"
        FROM employees e
        WHERE e.country_code = ${countryCode}
        GROUP BY e.job_title, e.currency
        ORDER BY "median" DESC
      `;
    },

    byDepartment() {
      return db.$queryRaw`
        SELECT
          d.id AS "departmentId",
          d.name AS "departmentName",
          count(*)::int AS "headcount",
          round(sum(e.salary * r.usd_rate), 2)::float8 AS "totalPayrollUsd",
          round(avg(e.salary * r.usd_rate), 2)::float8 AS "avgSalaryUsd",
          round((percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary * r.usd_rate))::numeric, 2)::float8 AS "medianSalaryUsd"
        FROM employees e
        JOIN departments d    ON d.id = e.department_id
        JOIN exchange_rates r ON r.currency = e.currency
        GROUP BY d.id, d.name
        ORDER BY "totalPayrollUsd" DESC
      `;
    },

    salaryBands(bandSizeUsd) {
      return db.$queryRaw`
        SELECT
          (floor(e.salary * r.usd_rate / ${bandSizeUsd}) * ${bandSizeUsd})::float8 AS "from",
          count(*)::int AS "headcount"
        FROM employees e
        JOIN exchange_rates r ON r.currency = e.currency
        GROUP BY 1
        ORDER BY 1
      `;
    },
  };
}
