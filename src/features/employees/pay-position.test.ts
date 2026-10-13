import { describe, expect, it } from 'vitest';
import { describePayPosition, payPosition } from './pay-position';

describe('payPosition', () => {
  it('reports how far below typical a salary is, rounded to a whole percent', () => {
    expect(payPosition(62_000, 65_000)).toEqual({ direction: 'below', percent: 5 });
  });

  it('reports how far above typical a salary is', () => {
    expect(payPosition(78_000, 65_000)).toEqual({ direction: 'above', percent: 20 });
  });

  it('treats a tiny difference as being at the typical salary', () => {
    expect(payPosition(65_200, 65_000)).toEqual({ direction: 'at', percent: 0 });
  });
});

describe('describePayPosition', () => {
  it.each([
    [{ direction: 'below', percent: 5 } as const, '5% below typical'],
    [{ direction: 'above', percent: 12 } as const, '12% above typical'],
    [{ direction: 'at', percent: 0 } as const, 'At the typical salary'],
  ])('%j → %s', (position, expected) => {
    expect(describePayPosition(position)).toBe(expected);
  });
});
