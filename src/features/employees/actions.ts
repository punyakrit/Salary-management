'use server';

import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createEmployeeSchema,
  employeeIdParamsSchema,
  updateEmployeeSchema,
} from '@/lib/schemas/employee';
import { runAction, validationError, type ActionResult } from '@/server/action-result';
import { requireUser } from '@/server/auth';
import { EMPLOYEES_TAG } from '@/server/cache-tags';
import { services } from '@/server/container';

/*
 * Server Actions are public POST endpoints: every one checks the session and
 * validates `unknown` input with the same schema the form uses. Expected
 * failures come back as values; success redirects (which throws), so the
 * only thing a caller ever receives is a failure.
 */

const INVALID_ID: ActionResult<never> = { ok: false, message: 'Unknown employee' };

export async function createEmployee(input: unknown): Promise<ActionResult<never>> {
  await requireUser();
  const parsed = createEmployeeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const result = await runAction(() => services.employees.create(parsed.data));
  if (!result.ok) return result;

  updateTag(EMPLOYEES_TAG);
  redirect(`/employees/${result.data.id}?saved=created`);
}

export async function updateEmployee(id: string, input: unknown): Promise<ActionResult<never>> {
  await requireUser();
  if (!employeeIdParamsSchema.safeParse({ id }).success) return INVALID_ID;
  const parsed = updateEmployeeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  const result = await runAction(() => services.employees.update(id, parsed.data));
  if (!result.ok) return result;

  updateTag(EMPLOYEES_TAG);
  redirect(`/employees/${id}?saved=updated`);
}

export async function deleteEmployee(id: string): Promise<ActionResult<never>> {
  await requireUser();
  if (!employeeIdParamsSchema.safeParse({ id }).success) return INVALID_ID;

  const result = await runAction(() => services.employees.delete(id));
  if (!result.ok) return result;

  updateTag(EMPLOYEES_TAG);
  redirect('/employees?deleted=1');
}
