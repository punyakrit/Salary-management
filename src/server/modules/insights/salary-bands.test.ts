import { describe, expect, it } from 'vitest';
import { toDistribution } from './salary-bands';

describe('toDistribution', () => {
  it('fills empty bands between the lowest and highest so the histogram has no gaps', () => {
    const result = toDistribution(
      [
        { from: 20_000, headcount: 3 },
        { from: 50_000, headcount: 1 },
      ],
      10_000,
    );

    expect(result.bands).toEqual([
      { from: 20_000, to: 30_000, headcount: 3 },
      { from: 30_000, to: 40_000, headcount: 0 },
      { from: 40_000, to: 50_000, headcount: 0 },
      { from: 50_000, to: 60_000, headcount: 1 },
    ]);
  });

  it('sorts bands that arrive out of order', () => {
    const result = toDistribution(
      [
        { from: 30_000, headcount: 2 },
        { from: 10_000, headcount: 5 },
      ],
      10_000,
    );

    expect(result.bands.map((band) => band.from)).toEqual([10_000, 20_000, 30_000]);
  });

  it('returns no bands when there are no employees', () => {
    expect(toDistribution([], 10_000)).toEqual({ bandSizeUsd: 10_000, bands: [] });
  });
});
