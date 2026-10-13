import { describe, expect, it } from 'vitest';
import { createEmployeeSchema, listEmployeesQuerySchema, updateEmployeeSchema } from './employee';

const validEmployee = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@acme.com',
  jobTitle: 'Software Engineer',
  departmentId: 1,
  countryCode: 'GB',
  employmentType: 'FULL_TIME',
  hireDate: '2024-03-01',
  salary: 85_000,
};

describe('createEmployeeSchema', () => {
  it('accepts a valid employee', () => {
    expect(createEmployeeSchema.safeParse(validEmployee).success).toBe(true);
  });

  it('normalises email to lower case and country to upper case', () => {
    const parsed = createEmployeeSchema.parse({
      ...validEmployee,
      email: '  Ada@ACME.com ',
      countryCode: 'gb',
    });

    expect(parsed.email).toBe('ada@acme.com');
    expect(parsed.countryCode).toBe('GB');
  });

  it.each([
    ['zero', 0],
    ['negative', -1],
    ['more than two decimals', 100.001],
  ])('rejects a %s salary', (_label, salary) => {
    expect(createEmployeeSchema.safeParse({ ...validEmployee, salary }).success).toBe(false);
  });

  it('accepts a salary with exactly two decimals', () => {
    expect(createEmployeeSchema.safeParse({ ...validEmployee, salary: 1234.56 }).success).toBe(
      true,
    );
  });

  it('rejects a malformed hire date', () => {
    expect(
      createEmployeeSchema.safeParse({ ...validEmployee, hireDate: '01/03/2024' }).success,
    ).toBe(false);
  });
});

describe('updateEmployeeSchema', () => {
  it('rejects an empty update', () => {
    expect(updateEmployeeSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a salary-only update with a reason', () => {
    const result = updateEmployeeSchema.safeParse({
      salary: 90_000,
      salaryChangeReason: 'Annual review',
    });

    expect(result.success).toBe(true);
  });
});

describe('listEmployeesQuerySchema', () => {
  it('applies defaults when the query string is empty', () => {
    expect(listEmployeesQuerySchema.parse({})).toEqual({
      page: 1,
      pageSize: 25,
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
  });

  it('coerces numeric query-string values', () => {
    const parsed = listEmployeesQuerySchema.parse({ page: '3', pageSize: '50', departmentId: '7' });

    expect(parsed).toMatchObject({ page: 3, pageSize: 50, departmentId: 7 });
  });

  it('treats cleared filters ("") as not provided', () => {
    const parsed = listEmployeesQuerySchema.parse({ search: '', country: '', departmentId: '' });

    expect(parsed.search).toBeUndefined();
    expect(parsed.country).toBeUndefined();
    expect(parsed.departmentId).toBeUndefined();
  });

  it('caps the page size at 100', () => {
    expect(listEmployeesQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });

  it('rejects sorting by a column outside the allowlist', () => {
    expect(listEmployeesQuerySchema.safeParse({ sortBy: 'password' }).success).toBe(false);
  });
});
