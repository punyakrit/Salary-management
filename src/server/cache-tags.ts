/**
 * Everything derived from employee rows (insights, job-title lists) is cached
 * under this tag. Every employee write calls `updateTag(EMPLOYEES_TAG)`.
 */
export const EMPLOYEES_TAG = 'employees';
