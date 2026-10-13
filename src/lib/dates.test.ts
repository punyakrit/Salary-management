import { describe, expect, it } from 'vitest';
import { formatDate, formatTenure } from './dates';

const NOW = new Date('2026-10-13T09:00:00Z');

describe('formatTenure', () => {
  it.each([
    ['2026-10-01', 'Less than a month'],
    ['2026-09-13', '1 month'],
    ['2026-02-20', '7 months'],
    ['2025-10-13', '1 year'],
    ['2020-09-22', '6 years'],
  ])('hired %s → %s', (hireDate, expected) => {
    expect(formatTenure(hireDate, NOW)).toBe(expected);
  });

  it('does not count a month until its day has passed', () => {
    expect(formatTenure('2026-09-14', NOW)).toBe('Less than a month');
  });
});

describe('formatDate', () => {
  it('formats ISO dates day-first without timezone drift', () => {
    expect(formatDate('2020-09-22')).toBe('22 Sept 2020');
  });
});
