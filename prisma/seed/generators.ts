import { allLocales, Faker } from '@faker-js/faker';
import type { EmploymentType } from '../../src/lib/constants';
import {
  COUNTRY_SEEDS,
  EMAIL_DOMAIN,
  EMPLOYMENT_TYPE_WEIGHTS,
  HIRE_DATE_RANGE,
  JOB_TITLE_SEEDS,
  type CountrySeed,
} from './reference-data';

/** Pure, deterministic generators. No database access here, so they're unit-tested. */

export interface SeedEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  countryCode: string;
  employmentType: EmploymentType;
  hireDate: string;
  salary: number;
  currency: string;
}

interface LocalSalaryInput {
  baseUsd: number;
  country: Pick<CountrySeed, 'payMultiplier' | 'usdRate' | 'roundingStep'>;
  /** Multiplier around 1, e.g. 0.85–1.15, for natural spread within a band. */
  jitter: number;
}

/** baseUsd × country level × jitter, converted to local currency and rounded to a sensible step. */
export function localSalary({ baseUsd, country, jitter }: LocalSalaryInput): number {
  const local = (baseUsd * country.payMultiplier * jitter) / country.usdRate;
  return Math.max(
    country.roundingStep,
    Math.round(local / country.roundingStep) * country.roundingStep,
  );
}

/** "João" → "joao", "O'Brien" → "obrien": safe for an email local part. */
export function slugifyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function generateEmployees(count: number, seed = 42): SeedEmployee[] {
  const faker = new Faker({ locale: [allLocales.en, allLocales.base] });
  faker.seed(seed);

  const nameFakers = new Map(
    COUNTRY_SEEDS.map((country, index) => {
      const localeFaker = new Faker({
        locale: [allLocales[country.locale], allLocales.en, allLocales.base],
      });
      localeFaker.seed(seed + index + 1);
      return [country.code, localeFaker] as const;
    }),
  );

  const countryPicks = COUNTRY_SEEDS.map((value) => ({ value, weight: value.weight }));
  const jobPicks = JOB_TITLE_SEEDS.map((value) => ({ value, weight: value.weight }));
  const employmentPicks = EMPLOYMENT_TYPE_WEIGHTS.map(({ value, weight }) => ({ value, weight }));

  return Array.from({ length: count }, (_, index) => {
    const country = faker.helpers.weightedArrayElement(countryPicks);
    const job = faker.helpers.weightedArrayElement(jobPicks);
    const names = nameFakers.get(country.code)!;
    const firstName = names.person.firstName();
    const lastName = names.person.lastName();

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      // The running index guarantees uniqueness without retry loops.
      email: `${slugifyName(firstName)}.${slugifyName(lastName)}.${index + 1}@${EMAIL_DOMAIN}`,
      jobTitle: job.title,
      department: job.department,
      countryCode: country.code,
      employmentType: faker.helpers.weightedArrayElement(employmentPicks),
      hireDate: faker.date
        .between({ from: HIRE_DATE_RANGE.from, to: HIRE_DATE_RANGE.to })
        .toISOString()
        .slice(0, 10),
      salary: localSalary({
        baseUsd: job.baseUsd,
        country,
        jitter: faker.number.float({ min: 0.85, max: 1.15, fractionDigits: 3 }),
      }),
      currency: country.currency,
    };
  });
}
