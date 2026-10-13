import type { ListEmployeesQuery } from '@/lib/schemas/employee';
import type { Prisma } from '@/server/generated/prisma/client';
import { parseEmployeeCode } from './employee-code';

const MAX_SEARCH_TERMS = 5;

/**
 * Translates directory filters into a Prisma `where`. Pure, so it's unit-tested
 * without a database. Every search term must match at least one field, which
 * makes "ada love" find Ada Lovelace (docs/02-architecture.md, Key decisions).
 */
export function buildEmployeeWhere(
  query: Pick<ListEmployeesQuery, 'search' | 'country' | 'departmentId' | 'jobTitle'>,
): Prisma.EmployeeWhereInput {
  const terms = (query.search ?? '').split(/\s+/).filter(Boolean).slice(0, MAX_SEARCH_TERMS);

  return {
    countryCode: query.country,
    departmentId: query.departmentId,
    jobTitle: query.jobTitle,
    AND: terms.map((term) => {
      const employeeNumber = parseEmployeeCode(term);
      return {
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          ...(employeeNumber ? [{ employeeNumber }] : []),
        ],
      };
    }),
  };
}

/** Always ends with the unique employee number so pages are stable across requests. */
export function buildEmployeeOrderBy({
  sortBy,
  sortOrder,
}: Pick<ListEmployeesQuery, 'sortBy' | 'sortOrder'>): Prisma.EmployeeOrderByWithRelationInput[] {
  const tieBreaker = { employeeNumber: 'asc' } as const;
  switch (sortBy) {
    case 'employeeCode':
      return [{ employeeNumber: sortOrder }];
    case 'lastName':
      return [{ lastName: sortOrder }, { firstName: sortOrder }, tieBreaker];
    default:
      return [{ [sortBy]: sortOrder }, tieBreaker];
  }
}
