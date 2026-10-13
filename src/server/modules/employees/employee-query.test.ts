import { describe, expect, it } from 'vitest';
import { buildEmployeeOrderBy, buildEmployeeWhere } from './employee-query';

describe('buildEmployeeWhere', () => {
  it('passes exact-match filters through', () => {
    expect(buildEmployeeWhere({ country: 'IN', departmentId: 3, jobTitle: 'Recruiter' })).toEqual({
      countryCode: 'IN',
      departmentId: 3,
      jobTitle: 'Recruiter',
      AND: [],
    });
  });

  it('requires every search term to match some field', () => {
    const where = buildEmployeeWhere({ search: 'ada love' });

    expect(where.AND).toHaveLength(2);
    expect(where.AND).toContainEqual({
      OR: expect.arrayContaining([{ lastName: { contains: 'love', mode: 'insensitive' } }]),
    });
  });

  it('also matches the employee number when a term looks like an employee code', () => {
    const where = buildEmployeeWhere({ search: 'EMP-000042' });

    expect(where.AND).toEqual([{ OR: expect.arrayContaining([{ employeeNumber: 42 }]) }]);
  });
});

describe('buildEmployeeOrderBy', () => {
  it('sorts by last then first name with a stable tie-breaker', () => {
    expect(buildEmployeeOrderBy({ sortBy: 'lastName', sortOrder: 'desc' })).toEqual([
      { lastName: 'desc' },
      { firstName: 'desc' },
      { employeeNumber: 'asc' },
    ]);
  });

  it('maps employeeCode onto the underlying sequential number', () => {
    expect(buildEmployeeOrderBy({ sortBy: 'employeeCode', sortOrder: 'asc' })).toEqual([
      { employeeNumber: 'asc' },
    ]);
  });
});
