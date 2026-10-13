import { describe, expect, it } from 'vitest';
import type { CountryInsight, JobTitleInsight } from '@/lib/schemas/insights';
import {
  bandContaining,
  countrySpreadTakeaway,
  payrollShareTakeaway,
  spreadTakeaway,
  topRoleTakeaway,
  withArticle,
} from './takeaways';

const stats = { min: 0, max: 0, avg: 0 };

function aCountry(countryName: string, medianUsd: number): CountryInsight {
  return {
    countryCode: countryName.slice(0, 2).toUpperCase(),
    countryName,
    currency: 'USD',
    usdRate: 1,
    headcount: 1,
    local: { ...stats, median: medianUsd },
    usd: { ...stats, median: medianUsd, totalPayroll: medianUsd },
  };
}

describe('payrollShareTakeaway', () => {
  it('names the biggest slice of payroll and compares it with its share of people', () => {
    const sentence = payrollShareTakeaway([
      { label: 'Sales', payroll: 30, headcount: 50 },
      { label: 'Engineering', payroll: 70, headcount: 50 },
    ]);

    expect(sentence).toBe('Engineering takes 70% of payroll with 50% of the people.');
  });

  it('returns null with no data', () => {
    expect(payrollShareTakeaway([])).toBeNull();
  });
});

describe('spreadTakeaway', () => {
  it('names the band most people fall in', () => {
    const sentence = spreadTakeaway([
      { from: 40_000, to: 50_000, headcount: 10 },
      { from: 50_000, to: 60_000, headcount: 1_234 },
    ]);

    expect(sentence).toBe('The most common salary band is $50K–$60K, with 1,234 people.');
  });

  it('returns null when every band is empty', () => {
    expect(spreadTakeaway([{ from: 0, to: 10_000, headcount: 0 }])).toBeNull();
  });
});

describe('countrySpreadTakeaway', () => {
  it('contrasts the lowest and highest typical pay', () => {
    const sentence = countrySpreadTakeaway([
      aCountry('United States', 101_000),
      aCountry('India', 28_560),
      aCountry('Germany', 77_220),
    ]);

    expect(sentence).toBe('Typical pay runs from $28.6K in India to $101K in the United States.');
  });

  it('needs at least two countries to compare', () => {
    expect(countrySpreadTakeaway([aCountry('India', 1)])).toBeNull();
  });
});

describe('topRoleTakeaway', () => {
  it('names the role with the highest typical pay, in local currency', () => {
    const rows: JobTitleInsight[] = [
      {
        jobTitle: 'Recruiter',
        currency: 'INR',
        headcount: 9,
        min: 0,
        max: 0,
        avg: 0,
        median: 1_200_000,
      },
      {
        jobTitle: 'Staff Engineer',
        currency: 'INR',
        headcount: 9,
        min: 0,
        max: 0,
        avg: 0,
        median: 4_670_000,
      },
    ];

    expect(topRoleTakeaway(rows)).toBe(
      'Staff Engineer is the best-paid role, typically ₹4.7M a year.',
    );
  });
});

describe('withArticle', () => {
  it.each([
    ['United States', 'the United States'],
    ['Netherlands', 'the Netherlands'],
    ['India', 'India'],
  ])('%s → %s', (name, expected) => {
    expect(withArticle(name)).toBe(expected);
  });
});

describe('bandContaining', () => {
  const bands = [
    { from: 60_000, to: 70_000, headcount: 1 },
    { from: 70_000, to: 80_000, headcount: 1 },
  ];

  it('finds the band whose range includes the amount (upper bound exclusive)', () => {
    expect(bandContaining(bands, 70_000)?.from).toBe(70_000);
    expect(bandContaining(bands, 68_580)?.from).toBe(60_000);
  });
});
