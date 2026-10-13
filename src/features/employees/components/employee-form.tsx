'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTransition } from 'react';
import { Controller, useForm, useWatch, type Path } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EMPLOYMENT_TYPE_LABELS, EMPLOYMENT_TYPES } from '@/lib/constants';
import { isoDateSchema } from '@/lib/schemas/common';
import { createEmployeeSchema, type Employee } from '@/lib/schemas/employee';
import type { ActionResult } from '@/server/action-result';
import type { ReferenceData } from '../queries';

// Same field rules as the server; edit adds the optional revision details.
const formSchema = createEmployeeSchema.extend({
  currency: z.string().regex(/^[A-Z]{3}$/, 'Choose a currency'),
  salaryChangeReason: z.string().trim().max(200).optional(),
  salaryEffectiveDate: isoDateSchema.optional().or(z.literal('')),
});
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

interface EmployeeFormProps {
  reference: ReferenceData;
  employee?: Employee;
  /** Bound Server Action: createEmployee, or updateEmployee.bind(null, id). */
  action: (input: unknown) => Promise<ActionResult<never>>;
}

export function EmployeeForm({ reference, employee, action }: EmployeeFormProps) {
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(employee);
  const currencies = [...new Set(reference.countries.map((c) => c.currency))].sort();
  const currencyOf = (code: string) => reference.countries.find((c) => c.code === code)?.currency;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          jobTitle: employee.jobTitle,
          departmentId: employee.department.id,
          countryCode: employee.country.code,
          employmentType: employee.employmentType,
          hireDate: employee.hireDate,
          salary: employee.salary,
          currency: employee.currency,
          salaryChangeReason: '',
          salaryEffectiveDate: '',
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          jobTitle: '',
          employmentType: 'FULL_TIME',
          currency: '',
        },
  });

  const [salary, currency] = useWatch({ control: form.control, name: ['salary', 'currency'] });
  const payChanged =
    isEdit && (Number(salary) !== employee?.salary || currency !== employee?.currency);

  const onSubmit = (values: FormOutput) =>
    startTransition(async () => {
      const { salaryChangeReason, salaryEffectiveDate, ...fields } = values;
      const result = await action({
        ...fields,
        ...(payChanged && {
          salaryChangeReason: salaryChangeReason || undefined,
          salaryEffectiveDate: salaryEffectiveDate || undefined,
        }),
      });
      // Success redirects, so a returned result is always a failure.
      if (result && !result.ok) {
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) form.setError(field as Path<FormInput>, { message: messages[0] });
        }
        toast.error(result.message);
      }
    });

  const err = (name: keyof FormInput) => form.formState.errors[name];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-8">
      <FieldSet>
        <FieldLegend>Person</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!err('firstName')}>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              autoComplete="off"
              {...form.register('firstName')}
              aria-invalid={!!err('firstName')}
            />
            <FieldError errors={[err('firstName')]} />
          </Field>
          <Field data-invalid={!!err('lastName')}>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              autoComplete="off"
              {...form.register('lastName')}
              aria-invalid={!!err('lastName')}
            />
            <FieldError errors={[err('lastName')]} />
          </Field>
          <Field data-invalid={!!err('email')} className="sm:col-span-2">
            <FieldLabel htmlFor="email">Work email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              {...form.register('email')}
              aria-invalid={!!err('email')}
            />
            <FieldError errors={[err('email')]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Role</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!err('jobTitle')}>
            <FieldLabel htmlFor="jobTitle">Job title</FieldLabel>
            <Input
              id="jobTitle"
              list="job-titles"
              autoComplete="off"
              {...form.register('jobTitle')}
              aria-invalid={!!err('jobTitle')}
            />
            <datalist id="job-titles">
              {reference.jobTitles.map((title) => (
                <option key={title} value={title} />
              ))}
            </datalist>
            <FieldDescription>
              Pick an existing title so pay comparisons stay accurate.
            </FieldDescription>
            <FieldError errors={[err('jobTitle')]} />
          </Field>
          <Field data-invalid={!!err('departmentId')}>
            <FieldLabel htmlFor="departmentId">Department</FieldLabel>
            <Controller
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger
                    id="departmentId"
                    aria-invalid={!!err('departmentId')}
                    className="w-full"
                  >
                    <SelectValue placeholder="Choose a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {reference.departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[err('departmentId')]} />
          </Field>
          <Field data-invalid={!!err('employmentType')}>
            <FieldLabel htmlFor="employmentType">Employment type</FieldLabel>
            <Controller
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="employmentType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {EMPLOYMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field data-invalid={!!err('hireDate')}>
            <FieldLabel htmlFor="hireDate">Hire date</FieldLabel>
            <Input
              id="hireDate"
              type="date"
              {...form.register('hireDate')}
              aria-invalid={!!err('hireDate')}
            />
            <FieldError errors={[err('hireDate')]} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend>Pay</FieldLegend>
        <FieldGroup className="grid gap-4 sm:grid-cols-3">
          <Field data-invalid={!!err('countryCode')}>
            <FieldLabel htmlFor="countryCode">Country</FieldLabel>
            <Controller
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={(code) => {
                    field.onChange(code);
                    // Follow the country's currency unless HR deliberately chose another one.
                    const previous = field.value ? currencyOf(field.value) : undefined;
                    const current = form.getValues('currency');
                    if (!current || current === previous) {
                      form.setValue('currency', currencyOf(code) ?? '', { shouldValidate: true });
                    }
                  }}
                >
                  <SelectTrigger
                    id="countryCode"
                    aria-invalid={!!err('countryCode')}
                    className="w-full"
                  >
                    <SelectValue placeholder="Choose a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {reference.countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[err('countryCode')]} />
          </Field>
          <Field data-invalid={!!err('currency')}>
            <FieldLabel htmlFor="currency">Pay currency</FieldLabel>
            <Controller
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id="currency" aria-invalid={!!err('currency')} className="w-full">
                    <SelectValue placeholder="Set by country" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[err('currency')]} />
          </Field>
          <Field data-invalid={!!err('salary')}>
            <FieldLabel htmlFor="salary">Annual base salary</FieldLabel>
            <Input
              id="salary"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="figures"
              {...form.register('salary', { valueAsNumber: true })}
              aria-invalid={!!err('salary')}
            />
            <FieldError errors={[err('salary')]} />
          </Field>
        </FieldGroup>

        {payChanged && (
          <FieldGroup className="grid gap-4 rounded-lg border border-dashed p-4 sm:grid-cols-2">
            <p className="text-sm text-muted-foreground sm:col-span-2">
              Pay is changing. This will be added to {employee?.firstName}&apos;s salary history.
            </p>
            <Field>
              <FieldLabel htmlFor="salaryChangeReason">Reason</FieldLabel>
              <Input
                id="salaryChangeReason"
                placeholder="e.g. Annual review, promotion"
                {...form.register('salaryChangeReason')}
              />
            </Field>
            <Field data-invalid={!!err('salaryEffectiveDate')}>
              <FieldLabel htmlFor="salaryEffectiveDate">Effective from</FieldLabel>
              <Input
                id="salaryEffectiveDate"
                type="date"
                {...form.register('salaryEffectiveDate')}
              />
              <FieldDescription>Leave empty for today.</FieldDescription>
              <FieldError errors={[err('salaryEffectiveDate')]} />
            </Field>
          </FieldGroup>
        )}
      </FieldSet>

      <div className="flex items-center gap-2 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={employee ? `/employees/${employee.id}` : '/employees'}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
