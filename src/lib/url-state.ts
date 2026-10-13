import { DEFAULT_PAGE_SIZE, type EmployeeSortField, type SortOrder } from './constants';
import type { ListEmployeesQuery } from './schemas/employee';

type RawSearchParams = Record<string, string | string[] | undefined>;

/** Next gives `string | string[]`; the directory only ever uses the first value. */
export function firstValues(params: RawSearchParams): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}

const DEFAULTS: Partial<Record<keyof ListEmployeesQuery, unknown>> = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: 'lastName',
  sortOrder: 'asc',
};

/**
 * Builds a directory URL from the current query plus changes, dropping defaults
 * and empty values so URLs stay short and shareable. Changing a filter should
 * pass `page: 1` so the user isn't stranded on a page that no longer exists.
 */
export function employeesHref(
  query: Partial<ListEmployeesQuery>,
  changes: Partial<ListEmployeesQuery> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...query, ...changes })) {
    if (
      value === undefined ||
      value === '' ||
      DEFAULTS[key as keyof ListEmployeesQuery] === value
    ) {
      continue;
    }
    params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `/employees?${search}` : '/employees';
}

/** Numbers read best biggest-first; text reads best A→Z. */
const FIRST_ORDER: Record<EmployeeSortField, SortOrder> = {
  employeeCode: 'asc',
  lastName: 'asc',
  email: 'asc',
  jobTitle: 'asc',
  countryCode: 'asc',
  hireDate: 'desc',
  salary: 'desc',
};

/** Clicking the active column flips its order; clicking a new column starts at its natural order. */
export function nextSort(
  current: Pick<ListEmployeesQuery, 'sortBy' | 'sortOrder'>,
  field: EmployeeSortField,
): Pick<ListEmployeesQuery, 'sortBy' | 'sortOrder'> {
  if (current.sortBy !== field) return { sortBy: field, sortOrder: FIRST_ORDER[field] };
  return { sortBy: field, sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' };
}
