import type { Db } from '@/server/prisma-client';
import type { ReferenceRepository } from './reference.repository';

export function createPrismaReferenceRepository(db: Db): ReferenceRepository {
  return {
    findCountry: (code) => db.country.findUnique({ where: { code } }),

    async departmentExists(id) {
      return (await db.department.count({ where: { id } })) > 0;
    },

    async isSupportedCurrency(code) {
      return (await db.exchangeRate.count({ where: { currency: code } })) > 0;
    },

    listCountries: () => db.country.findMany({ orderBy: { name: 'asc' } }),

    listDepartments: () =>
      db.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),

    async listJobTitles() {
      const rows = await db.employee.findMany({
        distinct: ['jobTitle'],
        select: { jobTitle: true },
        orderBy: { jobTitle: 'asc' },
      });
      return rows.map((row) => row.jobTitle);
    },
  };
}
