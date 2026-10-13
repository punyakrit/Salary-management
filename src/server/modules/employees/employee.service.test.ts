import { beforeEach, describe, expect, it } from 'vitest';
import { listEmployeesQuerySchema } from '@/lib/schemas/employee';
import { BusinessRuleError, NotFoundError } from '@/server/errors';
import { createEmployeeService, type EmployeeService } from './employee.service';
import { anEmployeeInput, COUNTRIES, DEPARTMENTS, FIXED_NOW, USD_RATES } from './testing/fixtures';
import { InMemoryEmployeeRepository } from './testing/in-memory-employee.repository';
import { InMemoryReferenceRepository } from './testing/in-memory-reference.repository';

const UNKNOWN_ID = '00000000-0000-4000-8000-000000000000';

describe('EmployeeService', () => {
  let service: EmployeeService;

  beforeEach(() => {
    const clock = () => FIXED_NOW;
    const reference = new InMemoryReferenceRepository(COUNTRIES, DEPARTMENTS, USD_RATES);
    const employees = new InMemoryEmployeeRepository(reference, clock);
    service = createEmployeeService({ employees, reference, clock });
  });

  describe('create', () => {
    it("defaults the pay currency to the country's currency", async () => {
      const employee = await service.create(
        anEmployeeInput({ countryCode: 'IN', salary: 2_500_000 }),
      );

      expect(employee.currency).toBe('INR');
      expect(employee.salaryUsd).toBe(30_000);
    });

    it('keeps an explicitly chosen currency (e.g. an expat paid in USD)', async () => {
      const employee = await service.create(
        anEmployeeInput({ countryCode: 'IN', currency: 'USD' }),
      );

      expect(employee.currency).toBe('USD');
    });

    it('records the initial salary as the first revision, effective on the hire date', async () => {
      const employee = await service.create(
        anEmployeeInput({ salary: 85_000, hireDate: '2024-03-01' }),
      );

      const revisions = await service.listSalaryRevisions(employee.id);

      expect(revisions).toEqual([
        expect.objectContaining({
          previousSalary: null,
          newSalary: 85_000,
          currency: 'GBP',
          effectiveDate: '2024-03-01',
          reason: 'Initial salary',
        }),
      ]);
    });

    it.each([
      ['an unknown country', { countryCode: 'ZZ' }, 'countryCode'],
      ['an unknown department', { departmentId: 999 }, 'departmentId'],
      ['a currency without an exchange rate', { currency: 'XYZ' }, 'currency'],
    ])('rejects %s', async (_label, overrides, field) => {
      await expect(service.create(anEmployeeInput(overrides))).rejects.toMatchObject({
        constructor: BusinessRuleError,
        field,
      });
    });
  });

  describe('update', () => {
    it('appends a salary revision when the salary changes', async () => {
      const { id } = await service.create(anEmployeeInput({ salary: 85_000 }));

      await service.update(id, { salary: 95_000, salaryChangeReason: 'Promotion' });

      const [latest] = await service.listSalaryRevisions(id);
      expect(latest).toMatchObject({
        previousSalary: 85_000,
        newSalary: 95_000,
        reason: 'Promotion',
        effectiveDate: '2026-10-13',
      });
    });

    it('uses the given effective date for a backdated raise', async () => {
      const { id } = await service.create(anEmployeeInput());

      await service.update(id, { salary: 90_000, salaryEffectiveDate: '2026-04-01' });

      const [latest] = await service.listSalaryRevisions(id);
      expect(latest?.effectiveDate).toBe('2026-04-01');
    });

    it('records the previous currency when pay moves to a new currency', async () => {
      const { id } = await service.create(anEmployeeInput({ countryCode: 'GB', salary: 85_000 }));

      await service.update(id, { countryCode: 'US', currency: 'USD', salary: 120_000 });

      const [latest] = await service.listSalaryRevisions(id);
      expect(latest).toMatchObject({
        previousSalary: 85_000,
        previousCurrency: 'GBP',
        newSalary: 120_000,
        currency: 'USD',
      });
    });

    it('does not create a revision when only non-pay fields change', async () => {
      const { id } = await service.create(anEmployeeInput());

      const updated = await service.update(id, { jobTitle: 'Senior Software Engineer' });

      expect(updated.jobTitle).toBe('Senior Software Engineer');
      expect(await service.listSalaryRevisions(id)).toHaveLength(1);
    });

    it('rejects moving an employee to an unknown department', async () => {
      const { id } = await service.create(anEmployeeInput());

      await expect(service.update(id, { departmentId: 999 })).rejects.toBeInstanceOf(
        BusinessRuleError,
      );
    });

    it('throws NotFoundError for a missing employee', async () => {
      await expect(service.update(UNKNOWN_ID, { salary: 1 })).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('list', () => {
    it('returns pagination metadata alongside the page', async () => {
      for (let i = 0; i < 5; i++) {
        await service.create(anEmployeeInput({ email: `person${i}@acme.example` }));
      }

      const result = await service.list(
        listEmployeesQuerySchema.parse({ pageSize: '2', page: '3' }),
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 3, pageSize: 2, total: 5, totalPages: 3 });
    });

    it('filters by country and matches multi-word name searches', async () => {
      await service.create(
        anEmployeeInput({ firstName: 'Ada', lastName: 'Lovelace', countryCode: 'GB' }),
      );
      await service.create(
        anEmployeeInput({
          firstName: 'Ada',
          lastName: 'Yonath',
          email: 'ada.y@acme.example',
          countryCode: 'IN',
        }),
      );

      const result = await service.list(
        listEmployeesQuerySchema.parse({ search: 'ada love', country: 'GB' }),
      );

      expect(result.data.map((e) => e.lastName)).toEqual(['Lovelace']);
    });
  });

  describe('delete', () => {
    it('removes the employee', async () => {
      const { id } = await service.create(anEmployeeInput());

      await service.delete(id);

      await expect(service.getById(id)).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws NotFoundError for a missing employee', async () => {
      await expect(service.delete(UNKNOWN_ID)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
