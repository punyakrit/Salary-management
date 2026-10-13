import { describe, expect, it } from 'vitest';
import { generateEmployees, localSalary, slugifyName } from './generators';
import { COUNTRY_SEEDS, HIRE_DATE_RANGE } from './reference-data';

describe('localSalary', () => {
  const india = { payMultiplier: 0.28, usdRate: 0.012, roundingStep: 10_000 };

  it('converts a USD band to local currency and rounds to the step', () => {
    // 115,000 × 0.28 / 0.012 = 2,683,333 → 2,680,000
    expect(localSalary({ baseUsd: 115_000, country: india, jitter: 1 })).toBe(2_680_000);
  });

  it('never returns less than one rounding step', () => {
    expect(localSalary({ baseUsd: 1, country: india, jitter: 1 })).toBe(10_000);
  });
});

describe('slugifyName', () => {
  it.each([
    ['João', 'joao'],
    ["O'Brien", 'obrien'],
    ['Müller-Lüdenscheidt', 'mullerludenscheidt'],
  ])('slugifies %s → %s', (input, expected) => {
    expect(slugifyName(input)).toBe(expected);
  });
});

describe('generateEmployees', () => {
  const employees = generateEmployees(2_000, 42);

  it('is deterministic for a given seed', () => {
    expect(generateEmployees(50, 7)).toEqual(generateEmployees(50, 7));
  });

  it('produces unique ids and emails', () => {
    expect(new Set(employees.map((e) => e.id)).size).toBe(employees.length);
    expect(new Set(employees.map((e) => e.email)).size).toBe(employees.length);
  });

  it("pays everyone a positive salary in their country's currency", () => {
    const currencyByCountry = new Map(COUNTRY_SEEDS.map((c) => [c.code, c.currency]));

    for (const employee of employees) {
      expect(employee.salary).toBeGreaterThan(0);
      expect(employee.currency).toBe(currencyByCountry.get(employee.countryCode));
    }
  });

  it('keeps hire dates inside the configured range', () => {
    for (const { hireDate } of employees) {
      expect(hireDate >= HIRE_DATE_RANGE.from && hireDate <= HIRE_DATE_RANGE.to).toBe(true);
    }
  });

  it('roughly follows the configured country mix', () => {
    const totalWeight = COUNTRY_SEEDS.reduce((sum, c) => sum + c.weight, 0);
    const usShare = employees.filter((e) => e.countryCode === 'US').length / employees.length;

    expect(usShare).toBeCloseTo(30 / totalWeight, 1);
  });
});
