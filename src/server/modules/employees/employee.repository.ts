import type { EmploymentType } from '@/lib/constants';
import type { Employee, ListEmployeesQuery, SalaryRevision } from '@/lib/schemas/employee';

/** Fully-resolved employee fields as persisted (currency already defaulted). */
export interface EmployeeWrite {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  departmentId: number;
  countryCode: string;
  employmentType: EmploymentType;
  hireDate: string;
  salary: number;
  currency: string;
}

export interface SalaryRevisionWrite {
  previousSalary: number | null;
  previousCurrency: string | null;
  newSalary: number;
  currency: string;
  reason: string | null;
  effectiveDate: string;
}

export interface EmployeePage {
  items: Employee[];
  total: number;
}

/**
 * Persistence port for employees. Implemented by Prisma in production and by an
 * in-memory fake in unit tests (docs/02-architecture.md, Key decisions).
 */
export interface EmployeeRepository {
  list(query: ListEmployeesQuery): Promise<EmployeePage>;
  findById(id: string): Promise<Employee | null>;
  /** Creates the employee and its initial salary revision atomically. */
  create(data: EmployeeWrite, initialRevision: SalaryRevisionWrite): Promise<Employee>;
  /** Applies changes and, when given, appends a salary revision, atomically. */
  update(
    id: string,
    changes: Partial<EmployeeWrite>,
    revision: SalaryRevisionWrite | null,
  ): Promise<Employee>;
  delete(id: string): Promise<void>;
  /** Newest first. */
  listSalaryRevisions(employeeId: string): Promise<SalaryRevision[]>;
}
