export const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
};

/** Columns the directory may be sorted by. Anything else is rejected before it reaches ORDER BY. */
export const EMPLOYEE_SORT_FIELDS = [
  'employeeCode',
  'lastName',
  'email',
  'jobTitle',
  'countryCode',
  'hireDate',
  'salary',
] as const;
export type EmployeeSortField = (typeof EMPLOYEE_SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/** DECIMAL(14,2) upper bound: 12 integer digits. */
export const MAX_SALARY = 999_999_999_999.99;

export const REPORTING_CURRENCY = 'USD';
