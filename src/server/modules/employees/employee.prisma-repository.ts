import { toIsoDate } from '@/lib/dates';
import type { Employee, ListEmployeesQuery, SalaryRevision } from '@/lib/schemas/employee';
import { ConflictError, NotFoundError } from '@/server/errors';
import { Prisma } from '@/server/generated/prisma/client';
import type { Db } from '@/server/prisma-client';
import { formatEmployeeCode } from './employee-code';
import { buildEmployeeOrderBy, buildEmployeeWhere } from './employee-query';
import type { EmployeeRepository, EmployeeWrite, SalaryRevisionWrite } from './employee.repository';

const employeeInclude = {
  department: { select: { id: true, name: true } },
  country: { select: { code: true, name: true } },
  exchangeRate: { select: { usdRate: true } },
} satisfies Prisma.EmployeeInclude;

type EmployeeRow = Prisma.EmployeeGetPayload<{ include: typeof employeeInclude }>;

export function createPrismaEmployeeRepository(db: Db): EmployeeRepository {
  return {
    async list(query: ListEmployeesQuery) {
      const where = buildEmployeeWhere(query);
      // Parallel, not $transaction: a transaction costs BEGIN/COMMIT round trips over
      // Neon's WebSocket driver. A write landing between the two queries can skew the
      // total by one for a moment, which is fine for a paginated directory.
      const [total, rows] = await Promise.all([
        db.employee.count({ where }),
        db.employee.findMany({
          where,
          include: employeeInclude,
          orderBy: buildEmployeeOrderBy(query),
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
      ]);
      return { total, items: rows.map(toEmployee) };
    },

    async findById(id) {
      const row = await db.employee.findUnique({ where: { id }, include: employeeInclude });
      return row ? toEmployee(row) : null;
    },

    async create(data, initialRevision) {
      const row = await translateErrors(() =>
        db.employee.create({
          data: {
            ...data,
            hireDate: new Date(data.hireDate),
            salaryRevisions: { create: toRevisionData(initialRevision) },
          },
          include: employeeInclude,
        }),
      );
      return toEmployee(row);
    },

    async update(id, changes, revision) {
      const row = await translateErrors(
        () =>
          db.employee.update({
            where: { id },
            data: {
              ...toEmployeeChanges(changes),
              ...(revision && { salaryRevisions: { create: toRevisionData(revision) } }),
            },
            include: employeeInclude,
          }),
        id,
      );
      return toEmployee(row);
    },

    async delete(id) {
      await translateErrors(() => db.employee.delete({ where: { id } }), id);
    },

    async listSalaryRevisions(employeeId) {
      const rows = await db.salaryRevision.findMany({
        where: { employeeId },
        orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }],
      });
      return rows.map(toSalaryRevision);
    },
  };
}

function toEmployeeChanges({ hireDate, ...rest }: Partial<EmployeeWrite>) {
  return { ...rest, ...(hireDate !== undefined && { hireDate: new Date(hireDate) }) };
}

function toRevisionData(revision: SalaryRevisionWrite) {
  return { ...revision, effectiveDate: new Date(revision.effectiveDate) };
}

function toEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    employeeCode: formatEmployeeCode(row.employeeNumber),
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    jobTitle: row.jobTitle,
    department: row.department,
    country: row.country,
    employmentType: row.employmentType,
    hireDate: toIsoDate(row.hireDate),
    salary: row.salary.toNumber(),
    currency: row.currency,
    salaryUsd: row.salary.mul(row.exchangeRate.usdRate).toDecimalPlaces(2).toNumber(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toSalaryRevision(row: Prisma.SalaryRevisionModel): SalaryRevision {
  return {
    id: row.id,
    employeeId: row.employeeId,
    previousSalary: row.previousSalary?.toNumber() ?? null,
    previousCurrency: row.previousCurrency,
    newSalary: row.newSalary.toNumber(),
    currency: row.currency,
    reason: row.reason,
    effectiveDate: toIsoDate(row.effectiveDate),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Maps Prisma's error codes onto domain errors so callers never see Prisma types. */
async function translateErrors<T>(operation: () => Promise<T>, id?: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictError('An employee with this email already exists', 'email');
      }
      if (error.code === 'P2025' && id) throw new NotFoundError('Employee', id);
    }
    throw error;
  }
}
