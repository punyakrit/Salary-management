/**
 * Static reference data for the seed. Pay multipliers are relative to a US
 * baseline and are illustrative, not market data.
 */

export interface CountrySeed {
  code: string;
  name: string;
  currency: string;
  /** 1 unit of currency = usdRate USD */
  usdRate: number;
  /** Share of headcount (relative weight). */
  weight: number;
  /** Local pay level vs US, in USD terms. */
  payMultiplier: number;
  /** Salaries are rounded to this step in local currency. */
  roundingStep: number;
  /** Faker locale used for names. */
  locale: 'en_US' | 'en_IN' | 'en_GB' | 'de' | 'fr' | 'en_CA' | 'en_AU' | 'en' | 'pt_BR' | 'nl';
}

export const RATES_AS_OF = '2026-10-01';

export const COUNTRY_SEEDS: CountrySeed[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    usdRate: 1,
    weight: 30,
    payMultiplier: 1,
    roundingStep: 500,
    locale: 'en_US',
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    usdRate: 0.012,
    weight: 25,
    payMultiplier: 0.28,
    roundingStep: 10_000,
    locale: 'en_IN',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    usdRate: 1.27,
    weight: 10,
    payMultiplier: 0.75,
    roundingStep: 500,
    locale: 'en_GB',
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    usdRate: 1.08,
    weight: 8,
    payMultiplier: 0.75,
    roundingStep: 500,
    locale: 'de',
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    usdRate: 0.73,
    weight: 6,
    payMultiplier: 0.8,
    roundingStep: 500,
    locale: 'en_CA',
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    usdRate: 1.08,
    weight: 5,
    payMultiplier: 0.68,
    roundingStep: 500,
    locale: 'fr',
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    usdRate: 0.66,
    weight: 5,
    payMultiplier: 0.85,
    roundingStep: 500,
    locale: 'en_AU',
  },
  {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    usdRate: 0.74,
    weight: 4,
    payMultiplier: 0.85,
    roundingStep: 500,
    locale: 'en',
  },
  {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    usdRate: 0.18,
    weight: 4,
    payMultiplier: 0.35,
    roundingStep: 1_000,
    locale: 'pt_BR',
  },
  {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    usdRate: 1.08,
    weight: 3,
    payMultiplier: 0.78,
    roundingStep: 500,
    locale: 'nl',
  },
];

export interface JobTitleSeed {
  title: string;
  department: string;
  /** US annual base salary midpoint, in USD. */
  baseUsd: number;
  weight: number;
}

export const JOB_TITLE_SEEDS: JobTitleSeed[] = [
  { title: 'Software Engineer', department: 'Engineering', baseUsd: 115_000, weight: 18 },
  { title: 'Senior Software Engineer', department: 'Engineering', baseUsd: 155_000, weight: 12 },
  { title: 'Staff Engineer', department: 'Engineering', baseUsd: 200_000, weight: 3 },
  { title: 'Engineering Manager', department: 'Engineering', baseUsd: 185_000, weight: 3 },
  { title: 'QA Engineer', department: 'Engineering', baseUsd: 90_000, weight: 5 },
  { title: 'DevOps Engineer', department: 'Engineering', baseUsd: 130_000, weight: 4 },
  { title: 'Data Analyst', department: 'Data', baseUsd: 85_000, weight: 4 },
  { title: 'Data Scientist', department: 'Data', baseUsd: 140_000, weight: 3 },
  { title: 'Product Manager', department: 'Product', baseUsd: 145_000, weight: 4 },
  { title: 'Product Designer', department: 'Design', baseUsd: 115_000, weight: 3 },
  { title: 'Sales Development Representative', department: 'Sales', baseUsd: 60_000, weight: 6 },
  { title: 'Account Executive', department: 'Sales', baseUsd: 95_000, weight: 6 },
  { title: 'Marketing Specialist', department: 'Marketing', baseUsd: 72_000, weight: 4 },
  {
    title: 'Customer Support Specialist',
    department: 'Customer Success',
    baseUsd: 52_000,
    weight: 8,
  },
  { title: 'Customer Success Manager', department: 'Customer Success', baseUsd: 85_000, weight: 4 },
  { title: 'HR Generalist', department: 'People', baseUsd: 68_000, weight: 3 },
  { title: 'Recruiter', department: 'People', baseUsd: 72_000, weight: 3 },
  { title: 'Financial Analyst', department: 'Finance', baseUsd: 88_000, weight: 3 },
  { title: 'Accountant', department: 'Finance', baseUsd: 72_000, weight: 2 },
  { title: 'Operations Manager', department: 'Operations', baseUsd: 98_000, weight: 2 },
  { title: 'Legal Counsel', department: 'Legal', baseUsd: 160_000, weight: 1 },
];

export const DEPARTMENT_NAMES = [...new Set(JOB_TITLE_SEEDS.map((job) => job.department))].sort();

export const EMPLOYMENT_TYPE_WEIGHTS = [
  { value: 'FULL_TIME', weight: 88 },
  { value: 'PART_TIME', weight: 5 },
  { value: 'CONTRACT', weight: 7 },
] as const;

export const HIRE_DATE_RANGE = { from: '2012-01-01', to: '2026-09-30' } as const;
export const EMAIL_DOMAIN = 'acme.example';
