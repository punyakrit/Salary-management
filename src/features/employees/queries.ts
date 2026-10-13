import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { employeeIdParamsSchema } from '@/lib/schemas/employee';
import { EMPLOYEES_TAG } from '@/server/cache-tags';
import { services } from '@/server/container';
import { NotFoundError } from '@/server/errors';

/** Options for filters and forms. Job titles come from employee rows, hence the tag. */
export async function getReferenceData() {
  'use cache';
  cacheLife('hours');
  cacheTag(EMPLOYEES_TAG);
  const [countries, departments, jobTitles] = await Promise.all([
    services.reference.listCountries(),
    services.reference.listDepartments(),
    services.reference.listJobTitles(),
  ]);
  return { countries, departments, jobTitles };
}

export type ReferenceData = Awaited<ReturnType<typeof getReferenceData>>;

/** Loads an employee for a page, turning a bad or unknown id into the 404 page. */
export async function getEmployeeOrNotFound(rawId: string) {
  const parsed = employeeIdParamsSchema.safeParse({ id: rawId });
  if (!parsed.success) notFound();
  try {
    return await services.employees.getById(parsed.data.id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
}
