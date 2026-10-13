import { describe, expect, it } from 'vitest';
import { bandDomain } from './pay-band';

describe('bandDomain', () => {
  it('spans every band with a little padding', () => {
    expect(
      bandDomain([
        { min: 100, max: 200 },
        { min: 150, max: 300 },
      ]),
    ).toEqual([94, 306]);
  });

  it('never goes below zero', () => {
    expect(bandDomain([{ min: 1, max: 1_000 }])[0]).toBe(0);
  });

  it('returns a safe unit domain for an empty list', () => {
    expect(bandDomain([])).toEqual([0, 1]);
  });
});
