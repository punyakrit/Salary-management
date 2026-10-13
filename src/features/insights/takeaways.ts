import { formatMoney } from '@/lib/money';
import type { CountryInsight, JobTitleInsight, SalaryBand } from '@/lib/schemas/insights';

/*
 * One plain sentence per chart, so a reader who doesn't want to decode a
 * visual still gets the answer. Pure functions: easy to test, easy to reword.
 */

export interface ShareRow {
  label: string;
  payroll: number;
  headcount: number;
}

const percent = (part: number, whole: number) => Math.round((part / whole) * 100);

/** "the United States", "the Netherlands", but "India". */
export function withArticle(countryName: string): string {
  return /^(United |Netherlands|Philippines|Czech Republic)/.test(countryName)
    ? `the ${countryName}`
    : countryName;
}
const usd = (amount: number) => formatMoney(amount, 'USD', { compact: true });

/** "Engineering takes 55% of payroll with 44% of the people." */
export function payrollShareTakeaway(rows: ShareRow[]): string | null {
  const top = [...rows].sort((a, b) => b.payroll - a.payroll)[0];
  if (!top) return null;
  const totalPayroll = rows.reduce((sum, row) => sum + row.payroll, 0);
  const totalPeople = rows.reduce((sum, row) => sum + row.headcount, 0);
  return `${top.label} takes ${percent(top.payroll, totalPayroll)}% of payroll with ${percent(
    top.headcount,
    totalPeople,
  )}% of the people.`;
}

/** "The most common salary band is $50K–$60K, with 1,234 people." */
export function spreadTakeaway(bands: SalaryBand[]): string | null {
  const top = [...bands].sort((a, b) => b.headcount - a.headcount)[0];
  if (!top || top.headcount === 0) return null;
  return `The most common salary band is ${usd(top.from)}–${usd(top.to)}, with ${top.headcount.toLocaleString(
    'en-US',
  )} people.`;
}

/** "Typical pay runs from $28.6K in India to $101K in the United States." */
export function countrySpreadTakeaway(countries: CountryInsight[]): string | null {
  if (countries.length < 2) return null;
  const byMedian = [...countries].sort((a, b) => a.usd.median - b.usd.median);
  const lowest = byMedian[0]!;
  const highest = byMedian[byMedian.length - 1]!;
  return `Typical pay runs from ${usd(lowest.usd.median)} in ${withArticle(lowest.countryName)} to ${usd(
    highest.usd.median,
  )} in ${withArticle(highest.countryName)}.`;
}

/**
 * "Staff Engineer is the best-paid role, typically ₹4.7M a year."
 * The country is already shown in the card's picker, so it isn't repeated.
 */
export function topRoleTakeaway(rows: JobTitleInsight[]): string | null {
  const top = [...rows].sort((a, b) => b.median - a.median)[0];
  if (!top) return null;
  return `${top.jobTitle} is the best-paid role, typically ${formatMoney(top.median, top.currency, {
    compact: true,
  })} a year.`;
}

/** The band that contains a salary, for highlighting it in the histogram. */
export function bandContaining(bands: SalaryBand[], amount: number): SalaryBand | undefined {
  return bands.find((band) => amount >= band.from && amount < band.to);
}
