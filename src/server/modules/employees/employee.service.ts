import { toIsoDate } from '@/lib/dates';
import type {
  CreateEmployeeInput,
  Employee,
  EmployeeListResponse,
  ListEmployeesQuery,
  SalaryRevision,
  UpdateEmployeeInput,
} from '@/lib/schemas/employee';
import type { Clock } from '@/server/clock';
import { BusinessRuleError, NotFoundError } from '@/server/errors';
import type { Country } from '@/lib/schemas/reference';
import type { ReferenceRepository } from '../reference/reference.repository';
import type { EmployeeRepository, EmployeeWrite, SalaryRevisionWrite } from './employee.repository';

interface EmployeeServiceDeps {
  employees: EmployeeRepository;
  reference: ReferenceRepository;
  clock: Clock;
}

const INITIAL_SALARY_REASON = 'Initial salary';

/**
 * Business rules for employees and their pay. No Prisma, no Next.js: everything
 * external arrives through `deps`, so this runs in unit tests against fakes.
 */
export function createEmployeeService({ employees, reference, clock }: EmployeeServiceDeps) {
  async function getById(id: string): Promise<Employee> {
    const employee = await employees.findById(id);
    if (!employee) throw new NotFoundError('Employee', id);
    return employee;
  }

  async function requireCountry(code: string): Promise<Country> {
    const country = await reference.findCountry(code);
    if (!country) throw new BusinessRuleError(`Unknown country "${code}"`, 'countryCode');
    return country;
  }

  async function requireDepartment(id: number): Promise<void> {
    if (!(await reference.departmentExists(id))) {
      throw new BusinessRuleError(`Unknown department ${id}`, 'departmentId');
    }
  }

  async function requireSupportedCurrency(code: string): Promise<void> {
    if (!(await reference.isSupportedCurrency(code))) {
      throw new BusinessRuleError(`No exchange rate for currency "${code}"`, 'currency');
    }
  }

  return {
    async list(query: ListEmployeesQuery): Promise<EmployeeListResponse> {
      const { items, total } = await employees.list(query);
      return {
        data: items,
        meta: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    getById,

    async create(input: CreateEmployeeInput): Promise<Employee> {
      const country = await requireCountry(input.countryCode);
      await requireDepartment(input.departmentId);
      const currency = input.currency ?? country.currency;
      await requireSupportedCurrency(currency);

      const data: EmployeeWrite = { ...input, currency };
      return employees.create(data, {
        previousSalary: null,
        previousCurrency: null,
        newSalary: input.salary,
        currency,
        reason: INITIAL_SALARY_REASON,
        effectiveDate: input.hireDate,
      });
    },

    async update(id: string, input: UpdateEmployeeInput): Promise<Employee> {
      const existing = await getById(id);
      const { salaryChangeReason, salaryEffectiveDate, ...changes } = input;

      if (changes.countryCode && changes.countryCode !== existing.country.code) {
        await requireCountry(changes.countryCode);
      }
      if (changes.departmentId && changes.departmentId !== existing.department.id) {
        await requireDepartment(changes.departmentId);
      }
      if (changes.currency && changes.currency !== existing.currency) {
        await requireSupportedCurrency(changes.currency);
      }

      const newSalary = changes.salary ?? existing.salary;
      const newCurrency = changes.currency ?? existing.currency;
      const payChanged = newSalary !== existing.salary || newCurrency !== existing.currency;

      const revision: SalaryRevisionWrite | null = payChanged
        ? {
            previousSalary: existing.salary,
            previousCurrency: existing.currency,
            newSalary,
            currency: newCurrency,
            reason: salaryChangeReason ?? null,
            effectiveDate: salaryEffectiveDate ?? toIsoDate(clock()),
          }
        : null;

      return employees.update(id, changes, revision);
    },

    async delete(id: string): Promise<void> {
      await getById(id);
      await employees.delete(id);
    },

    async listSalaryRevisions(id: string): Promise<SalaryRevision[]> {
      await getById(id);
      return employees.listSalaryRevisions(id);
    },
  };
}

export type EmployeeService = ReturnType<typeof createEmployeeService>;
