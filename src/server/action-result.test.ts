import { describe, expect, it } from 'vitest';
import { createEmployeeSchema } from '@/lib/schemas/employee';
import { runAction, validationError } from './action-result';
import { BusinessRuleError, ConflictError } from './errors';

describe('runAction', () => {
  it('wraps a successful result', async () => {
    expect(await runAction(async () => 42)).toEqual({ ok: true, data: 42 });
  });

  it('maps a domain error to a field error the form can show', async () => {
    const result = await runAction(async () => {
      throw new ConflictError('An employee with this email already exists', 'email');
    });

    expect(result).toEqual({
      ok: false,
      message: 'An employee with this email already exists',
      fieldErrors: { email: ['An employee with this email already exists'] },
    });
  });

  it('omits fieldErrors when the domain error has no field', async () => {
    const result = await runAction(async () => {
      throw new BusinessRuleError('Something is off');
    });

    expect(result).toEqual({ ok: false, message: 'Something is off' });
  });

  it('rethrows unexpected errors so they reach error.tsx', async () => {
    await expect(runAction(async () => Promise.reject(new TypeError('bug')))).rejects.toThrow(
      'bug',
    );
  });
});

describe('validationError', () => {
  it('reports zod issues per field', () => {
    const parsed = createEmployeeSchema.safeParse({ salary: -5 });
    if (parsed.success) throw new Error('expected failure');

    const result = validationError(parsed.error);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.fieldErrors?.salary).toBeTruthy();
    expect(!result.ok && result.fieldErrors?.firstName).toBeTruthy();
  });
});
