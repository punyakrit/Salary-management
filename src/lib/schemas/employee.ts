import { z } from 'zod';
import {
  DEFAULT_PAGE_SIZE,
  EMPLOYEE_SORT_FIELDS,
  EMPLOYMENT_TYPES,
  MAX_PAGE_SIZE,
  SORT_ORDERS,
} from '../constants';
import {
  countryCodeSchema,
  currencyCodeSchema,
  emptyToUndefined,
  isoDateSchema,
  moneyAmountSchema,
  paginatedSchema,
} from './common';

const nameSchema = z.string().trim().min(1, 'Required').max(100);

const employeeFields = {
  firstName: nameSchema,
  lastName: nameSchema,
  email: z.string().trim().toLowerCase().pipe(z.email('Must be a valid email')),
  jobTitle: z.string().trim().min(2, 'Required').max(100),
  departmentId: z.number({ error: 'Choose a department' }).int().positive('Choose a department'),
  countryCode: countryCodeSchema,
  employmentType: z.enum(EMPLOYMENT_TYPES),
  hireDate: isoDateSchema,
  salary: moneyAmountSchema,
  /** Defaults to the country's currency when omitted (see EmployeeService). */
  currency: currencyCodeSchema.optional(),
};

// ---------- Requests ----------

export const createEmployeeSchema = z.object(employeeFields);
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z
  .object({
    ...z.object(employeeFields).partial().shape,
    /** Recorded on the salary revision when `salary` changes. */
    salaryChangeReason: z.string().trim().min(1).max(200).optional(),
    salaryEffectiveDate: isoDateSchema.optional(),
  })
  .refine((input) => Object.values(input).some((value) => value !== undefined), {
    message: 'Provide at least one field to update',
  });
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  country: z.preprocess(emptyToUndefined, countryCodeSchema.optional()),
  departmentId: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
  jobTitle: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  sortBy: z.enum(EMPLOYEE_SORT_FIELDS).default('lastName'),
  sortOrder: z.enum(SORT_ORDERS).default('asc'),
});
export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

export const employeeIdParamsSchema = z.object({ id: z.uuid() });

// ---------- Responses ----------

export const employeeSchema = z.object({
  id: z.uuid(),
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  jobTitle: z.string(),
  department: z.object({ id: z.number().int(), name: z.string() }),
  country: z.object({ code: z.string(), name: z.string() }),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  hireDate: isoDateSchema,
  salary: z.number(),
  currency: z.string(),
  /** Salary converted at the stored exchange rate, for cross-country comparison. */
  salaryUsd: z.number(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Employee = z.infer<typeof employeeSchema>;

export const employeeListResponseSchema = paginatedSchema(employeeSchema);
export type EmployeeListResponse = z.infer<typeof employeeListResponseSchema>;

export const salaryRevisionSchema = z.object({
  id: z.uuid(),
  employeeId: z.uuid(),
  previousSalary: z.number().nullable(),
  previousCurrency: z.string().nullable(),
  newSalary: z.number(),
  currency: z.string(),
  reason: z.string().nullable(),
  effectiveDate: isoDateSchema,
  createdAt: z.iso.datetime(),
});
export type SalaryRevision = z.infer<typeof salaryRevisionSchema>;
