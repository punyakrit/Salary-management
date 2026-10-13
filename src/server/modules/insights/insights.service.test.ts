import { describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '@/server/errors';
import { COUNTRIES, DEPARTMENTS, USD_RATES } from '../employees/testing/fixtures';
import { InMemoryReferenceRepository } from '../employees/testing/in-memory-reference.repository';
import type { InsightsRepository } from './insights.repository';
import { createInsightsService } from './insights.service';

function setup() {
  const insights: InsightsRepository = {
    overview: vi.fn(),
    byCountry: vi.fn(),
    byDepartment: vi.fn(),
    byJobTitle: vi.fn().mockResolvedValue([]),
    salaryBands: vi.fn().mockResolvedValue([
      { from: 40_000, headcount: 2 },
      { from: 60_000, headcount: 1 },
    ]),
  };
  const reference = new InMemoryReferenceRepository(COUNTRIES, DEPARTMENTS, USD_RATES);
  return { insights, service: createInsightsService({ insights, reference }) };
}

describe('InsightsService.byJobTitle', () => {
  it('queries job-title stats for a known country', async () => {
    const { insights, service } = setup();

    await service.byJobTitle('IN');

    expect(insights.byJobTitle).toHaveBeenCalledWith('IN');
  });

  it('throws NotFoundError for an unknown country instead of returning an empty report', async () => {
    const { insights, service } = setup();

    await expect(service.byJobTitle('ZZ')).rejects.toBeInstanceOf(NotFoundError);
    expect(insights.byJobTitle).not.toHaveBeenCalled();
  });
});

describe('InsightsService.distribution', () => {
  it('asks for $10K bands by default and fills the empty ones', async () => {
    const { insights, service } = setup();

    const result = await service.distribution();

    expect(insights.salaryBands).toHaveBeenCalledWith(10_000);
    expect(result.bands.map((band) => band.headcount)).toEqual([2, 0, 1]);
  });
});
