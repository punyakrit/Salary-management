import { z } from 'zod';
import { MAX_SALARY } from '../constants';
import { hasAtMostTwoDecimals } from '../money';

/** Query-string values arrive as "" when a filter is cleared; treat that as "not provided". */
export const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const countryCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, 'Must be an ISO 3166-1 alpha-2 country code');

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Must be an ISO 4217 currency code');

export const moneyAmountSchema = z
  .number({ error: 'Enter an amount' })
  .positive('Must be greater than 0')
  .max(MAX_SALARY)
  .refine(hasAtMostTwoDecimals, 'At most 2 decimal places');

export const isoDateSchema = z.iso.date();

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const paginatedSchema = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), meta: paginationMetaSchema });

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
