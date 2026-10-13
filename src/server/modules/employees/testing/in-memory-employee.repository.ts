import { randomUUID } from 'node:crypto';
import { roundToCents } from '@/lib/money';
import type { Employee, ListEmployeesQuery, SalaryRevision } from '@/lib/schemas/employee';
import { formatEmployeeCode, parseEmployeeCode } from '../employee-code';
import type {
  EmployeePage,
  EmployeeRepository,
  EmployeeWrite,
  SalaryRevisionWrite,
} from '../employee.repository';
import type { InMemoryReferenceRepository } from './in-memory-reference.repository';

interface StoredEmployee extends EmployeeWrite {
  id: string;
  employeeNumber: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Test double for EmployeeRepository. Mirrors the Prisma implementation's
 * observable behaviour (filters, search, sort, pagination) without a database.
 */
export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly rows = new Map<string, StoredEmployee>();
  private readonly revisions: SalaryRevision[] = [];
  private nextNumber = 1;

  constructor(
    private readonly reference: InMemoryReferenceRepository,
    private readonly now: () => Date,
  ) {}

  async list(query: ListEmployeesQuery): Promise<EmployeePage> {
    const filtered = [...this.rows.values()].filter((row) => matches(row, query));
    filtered.sort(compareBy(query));
    const start = (query.page - 1) * query.pageSize;
    return {
      items: filtered.slice(start, start + query.pageSize).map((row) => this.toEmployee(row)),
      total: filtered.length,
    };
  }

  async findById(id: string) {
    const row = this.rows.get(id);
    return row ? this.toEmployee(row) : null;
  }

  async create(data: EmployeeWrite, initialRevision: SalaryRevisionWrite) {
    const timestamp = this.now().toISOString();
    const row: StoredEmployee = {
      ...data,
      id: randomUUID(),
      employeeNumber: this.nextNumber++,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.rows.set(row.id, row);
    this.addRevision(row.id, initialRevision);
    return this.toEmployee(row);
  }

  async update(id: string, changes: Partial<EmployeeWrite>, revision: SalaryRevisionWrite | null) {
    const row = this.rows.get(id);
    if (!row) throw new Error(`InMemoryEmployeeRepository: no employee ${id}`);
    const updated = { ...row, ...changes, updatedAt: this.now().toISOString() };
    this.rows.set(id, updated);
    if (revision) this.addRevision(id, revision);
    return this.toEmployee(updated);
  }

  async delete(id: string) {
    this.rows.delete(id);
    for (let i = this.revisions.length - 1; i >= 0; i--) {
      if (this.revisions[i]!.employeeId === id) this.revisions.splice(i, 1);
    }
  }

  async listSalaryRevisions(employeeId: string) {
    return this.revisions
      .filter((revision) => revision.employeeId === employeeId)
      .sort(
        (a, b) =>
          b.effectiveDate.localeCompare(a.effectiveDate) || b.createdAt.localeCompare(a.createdAt),
      );
  }

  /** Test helper: distinct job titles currently stored. */
  jobTitles(): string[] {
    return [...this.rows.values()].map((row) => row.jobTitle);
  }

  private addRevision(employeeId: string, revision: SalaryRevisionWrite) {
    this.revisions.push({
      ...revision,
      id: randomUUID(),
      employeeId,
      createdAt: this.now().toISOString(),
    });
  }

  private toEmployee(row: StoredEmployee): Employee {
    const country = this.reference.countries.find((c) => c.code === row.countryCode);
    const department = this.reference.departments.find((d) => d.id === row.departmentId);
    const rate = this.reference.usdRates[row.currency];
    if (!country || !department || rate === undefined) {
      throw new Error(`InMemoryEmployeeRepository: dangling reference on employee ${row.id}`);
    }
    return {
      id: row.id,
      employeeCode: formatEmployeeCode(row.employeeNumber),
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      jobTitle: row.jobTitle,
      department: { id: department.id, name: department.name },
      country: { code: country.code, name: country.name },
      employmentType: row.employmentType,
      hireDate: row.hireDate,
      salary: row.salary,
      currency: row.currency,
      salaryUsd: roundToCents(row.salary * rate),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

function matches(row: StoredEmployee, query: ListEmployeesQuery): boolean {
  if (query.country && row.countryCode !== query.country) return false;
  if (query.departmentId && row.departmentId !== query.departmentId) return false;
  if (query.jobTitle && row.jobTitle !== query.jobTitle) return false;
  if (!query.search) return true;

  const haystack = [row.firstName, row.lastName, row.email].map((s) => s.toLowerCase());
  return query.search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(
      (term) =>
        haystack.some((field) => field.includes(term)) ||
        parseEmployeeCode(term) === row.employeeNumber,
    );
}

function compareBy({ sortBy, sortOrder }: ListEmployeesQuery) {
  const direction = sortOrder === 'asc' ? 1 : -1;
  const key = (row: StoredEmployee): string | number => {
    switch (sortBy) {
      case 'employeeCode':
        return row.employeeNumber;
      case 'lastName':
        return `${row.lastName}\u0000${row.firstName}`;
      default:
        return row[sortBy];
    }
  };
  return (a: StoredEmployee, b: StoredEmployee) => {
    const ka = key(a);
    const kb = key(b);
    const primary =
      typeof ka === 'number' && typeof kb === 'number'
        ? ka - kb
        : String(ka).localeCompare(String(kb));
    return primary * direction || a.employeeNumber - b.employeeNumber;
  };
}
