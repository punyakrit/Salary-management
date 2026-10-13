import { z } from 'zod';

export const countrySchema = z.object({
  code: z.string(),
  name: z.string(),
  currency: z.string(),
});
export type Country = z.infer<typeof countrySchema>;

export const departmentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type Department = z.infer<typeof departmentSchema>;
