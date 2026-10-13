import type { CreateEmployeeInput } from '@/lib/schemas/employee';
import type { Country, Department } from '@/lib/schemas/reference';

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
];

export const DEPARTMENTS: Department[] = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Sales' },
];

/** 1 unit of currency = rate USD. */
export const USD_RATES: Record<string, number> = { USD: 1, INR: 0.012, GBP: 1.27 };

export const FIXED_NOW = new Date('2026-10-13T09:00:00Z');

export function anEmployeeInput(overrides: Partial<CreateEmployeeInput> = {}): CreateEmployeeInput {
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@acme.example',
    jobTitle: 'Software Engineer',
    departmentId: 1,
    countryCode: 'GB',
    employmentType: 'FULL_TIME',
    hireDate: '2024-03-01',
    salary: 85_000,
    ...overrides,
  };
}
