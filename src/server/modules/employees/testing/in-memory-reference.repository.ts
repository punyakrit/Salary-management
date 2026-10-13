import type { Country, Department } from '@/lib/schemas/reference';
import type { ReferenceRepository } from '../../reference/reference.repository';

export class InMemoryReferenceRepository implements ReferenceRepository {
  constructor(
    readonly countries: Country[],
    readonly departments: Department[],
    readonly usdRates: Record<string, number>,
    private readonly jobTitles: () => string[] = () => [],
  ) {}

  async findCountry(code: string) {
    return this.countries.find((country) => country.code === code) ?? null;
  }

  async departmentExists(id: number) {
    return this.departments.some((department) => department.id === id);
  }

  async isSupportedCurrency(code: string) {
    return code in this.usdRates;
  }

  async listCountries() {
    return [...this.countries];
  }

  async listDepartments() {
    return [...this.departments];
  }

  async listJobTitles() {
    return [...new Set(this.jobTitles())].sort();
  }
}
