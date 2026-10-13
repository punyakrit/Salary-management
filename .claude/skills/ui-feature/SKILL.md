---
name: ui-feature
description: Build or change a page, form, table or chart in the Next.js app — Server Component reads, Server Action writes, URL search-param state, shadcn/ui components, forms validated by the shared zod schema. Use for anything under src/app, src/features or src/components.
---

# UI feature

## Where things go

- `src/app/<route>/page.tsx`: thin. Read `params`/`searchParams`, parse with a zod schema, render feature components inside `<Suspense>`.
- `src/features/<feature>/components/*`: feature UI. Server Components by default; add `'use client'` only for interactivity.
- `src/features/<feature>/actions.ts`: `'use server'` actions for that feature.
- `src/components/ui/*`: shadcn primitives (generated, don't hand-edit; add with `pnpm dlx shadcn@latest add <name>`).

## Reads (Next 16.4, `cacheComponents` on)

```tsx
export default function Page(props: PageProps<'/employees'>) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <EmployeesTable searchParams={props.searchParams} />
    </Suspense>
  );
}

async function EmployeesTable({ searchParams }: { searchParams: PageProps<'/employees'>['searchParams'] }) {
  const query = listEmployeesQuerySchema.parse(await searchParams);
  const result = await services.employees.list(query);
  // render
}
```

- Filters, search, page and sort live in the URL. Client controls update it with `router.replace` (debounce search ~300 ms).
- Never fetch your own app over HTTP. Call `services` from `@/server/container` directly.

## Writes

```ts
'use server';
import { runAction, validationError, type ActionResult } from '@/server/action-result';

// Server Actions are public endpoints: accept `unknown` and validate.
export async function updateEmployee(id: string, input: unknown): Promise<ActionResult<Employee>> {
  const parsed = updateEmployeeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const result = await runAction(() => services.employees.update(id, parsed.data)); // domain errors → field errors
  if (result.ok) revalidatePath('/employees');
  return result;
}
```

- Forms: `react-hook-form` + `zodResolver(sameSchema)` for instant client feedback, then call the action in `startTransition` and map `result.fieldErrors` onto the form with `setError`.
- Expected errors are **returned** (`{ ok: false, ... }`), not thrown. Unexpected ones bubble to `error.tsx`.
- To navigate after a successful create, call `redirect()` in the action after `revalidatePath` (redirect throws).

## UX checklist (HR Manager persona)

- Money is always shown with its currency via `formatMoney`; show USD alongside local where comparing countries.
- Empty, loading (skeleton) and error states for every data view.
- Destructive actions (delete) need a confirm dialog naming the employee.
- Tables: sortable headers, a visible total count, keyboard-reachable controls.
