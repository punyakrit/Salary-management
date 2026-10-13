/**
 * Seeds reference data and 10,000 deterministic employees.
 * Run with `pnpm db:seed` (uses DIRECT_URL). Idempotent: truncates first.
 * Override the size with SEED_COUNT=500 for a quick local run.
 */
import { createPrismaClient } from '../../src/server/prisma-client';
import { generateEmployees } from './generators';
import { COUNTRY_SEEDS, DEPARTMENT_NAMES, RATES_AS_OF } from './reference-data';

const BATCH_SIZE = 1_000;

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Set DIRECT_URL (or DATABASE_URL) before seeding.');

  const count = Number(process.env.SEED_COUNT ?? 10_000);
  const db = createPrismaClient(connectionString);
  const started = performance.now();

  try {
    await db.$executeRaw`TRUNCATE TABLE salary_revisions, employees, departments, countries, exchange_rates RESTART IDENTITY CASCADE`;

    const rates = new Map(COUNTRY_SEEDS.map((c) => [c.currency, c.usdRate]));
    await db.exchangeRate.createMany({
      data: [...rates].map(([currency, usdRate]) => ({
        currency,
        usdRate,
        asOf: new Date(RATES_AS_OF),
      })),
    });
    await db.country.createMany({
      data: COUNTRY_SEEDS.map(({ code, name, currency }) => ({ code, name, currency })),
    });
    await db.department.createMany({ data: DEPARTMENT_NAMES.map((name) => ({ name })) });

    const departmentIds = new Map(
      (await db.department.findMany()).map((department) => [department.name, department.id]),
    );

    const employees = generateEmployees(count);
    for (let start = 0; start < employees.length; start += BATCH_SIZE) {
      const batch = employees.slice(start, start + BATCH_SIZE);
      await db.employee.createMany({
        data: batch.map(({ department, hireDate, ...employee }) => ({
          ...employee,
          departmentId: departmentIds.get(department)!,
          hireDate: new Date(hireDate),
        })),
      });
      await db.salaryRevision.createMany({
        data: batch.map((employee) => ({
          employeeId: employee.id,
          newSalary: employee.salary,
          currency: employee.currency,
          reason: 'Initial salary',
          effectiveDate: new Date(employee.hireDate),
        })),
      });
      console.log(
        `  inserted ${Math.min(start + BATCH_SIZE, employees.length)}/${employees.length}`,
      );
    }

    const seconds = ((performance.now() - started) / 1000).toFixed(1);
    console.log(
      `Seeded ${employees.length} employees across ${COUNTRY_SEEDS.length} countries in ${seconds}s`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
