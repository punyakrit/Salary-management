import { z } from 'zod';
import { AppError } from './errors';

export type FieldErrors = Record<string, string[] | undefined>;

/** What every Server Action returns. Expected failures are values, not exceptions. */
export type ActionResult<T = void> =
  { ok: true; data: T } | { ok: false; message: string; fieldErrors?: FieldErrors };

export function validationError(error: z.ZodError): ActionResult<never> {
  return {
    ok: false,
    message: 'Please fix the highlighted fields',
    fieldErrors: z.flattenError(error).fieldErrors as FieldErrors,
  };
}

/**
 * Runs a service call and turns domain errors into a failed result that a form
 * can display. Anything else is a bug and is rethrown to the nearest error.tsx.
 */
export async function runAction<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await operation() };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        ok: false,
        message: error.message,
        ...(error.field && { fieldErrors: { [error.field]: [error.message] } }),
      };
    }
    throw error;
  }
}
