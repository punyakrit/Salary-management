import { describe, expect, it } from 'vitest';
import { formatMoney, hasAtMostTwoDecimals, roundToCents } from './money';

describe('hasAtMostTwoDecimals', () => {
  it.each([100, 100.5, 100.55, 0.1 + 0.2])('accepts %s', (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(true);
  });

  it.each([100.555, 0.001])('rejects %s', (value) => {
    expect(hasAtMostTwoDecimals(value)).toBe(false);
  });
});

describe('roundToCents', () => {
  it('rounds half up to two decimals', () => {
    expect(roundToCents(1.005)).toBe(1.01);
    expect(roundToCents(2.344)).toBe(2.34);
  });
});

describe('formatMoney', () => {
  it('formats whole units with the currency symbol', () => {
    expect(formatMoney(85_000, 'USD')).toBe('$85,000');
  });

  it('uses compact notation for large dashboard figures', () => {
    expect(formatMoney(1_250_000, 'USD', { compact: true })).toBe('$1.3M');
  });
});
