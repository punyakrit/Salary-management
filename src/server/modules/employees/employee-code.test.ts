import { describe, expect, it } from 'vitest';
import { formatEmployeeCode, parseEmployeeCode } from './employee-code';

describe('formatEmployeeCode', () => {
  it('zero-pads to six digits', () => {
    expect(formatEmployeeCode(42)).toBe('EMP-000042');
  });
});

describe('parseEmployeeCode', () => {
  it.each([
    ['EMP-000042', 42],
    ['emp42', 42],
    ['42', 42],
    [' EMP-10000 ', 10_000],
  ])('parses %j as %i', (input, expected) => {
    expect(parseEmployeeCode(input)).toBe(expected);
  });

  it.each(['ada', 'EMP-', '0', '-5', '99999999999'])('returns null for %j', (input) => {
    expect(parseEmployeeCode(input)).toBeNull();
  });
});
