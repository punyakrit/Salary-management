import type { Country, Department } from '@/lib/schemas/reference';

/** Lookup data: countries, departments, supported currencies, job titles. */
export interface ReferenceRepository {
  findCountry(code: string): Promise<Country | null>;
  departmentExists(id: number): Promise<boolean>;
  /** A currency is supported when we hold an exchange rate for it. */
  isSupportedCurrency(code: string): Promise<boolean>;
  listCountries(): Promise<Country[]>;
  listDepartments(): Promise<Department[]>;
  /** Distinct job titles in use, for filters and form suggestions. */
  listJobTitles(): Promise<string[]>;
}
