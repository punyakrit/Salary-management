'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListEmployeesQuery } from '@/lib/schemas/employee';
import { employeesHref } from '@/lib/url-state';
import type { ReferenceData } from '../queries';

const ALL = 'all';
const SEARCH_DEBOUNCE_MS = 300;

interface EmployeeFiltersProps {
  query: ListEmployeesQuery;
  reference: ReferenceData;
}

/** Writes filters into the URL; the server re-renders the table from it. */
export function EmployeeFilters({ query, reference }: EmployeeFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search ?? '');

  const navigate = (changes: Partial<ListEmployeesQuery>) =>
    startTransition(() =>
      router.replace(employeesHref(query, { ...changes, page: 1 }), { scroll: false }),
    );

  useEffect(() => {
    if (search === (query.search ?? '')) return;
    const timer = setTimeout(() => navigate({ search: search || undefined }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // Only the typed text should trigger a search; `navigate` changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasFilters = Boolean(query.search || query.country || query.departmentId || query.jobTitle);

  return (
    <div className="flex flex-wrap items-center gap-2" data-pending={pending || undefined}>
      <div className="relative min-w-60 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email or EMP code"
          aria-label="Search employees"
          className="pl-8"
        />
      </div>

      <FilterSelect
        label="Country"
        allLabel="All countries"
        value={query.country}
        options={reference.countries.map((c) => ({ value: c.code, label: c.name }))}
        onChange={(country) => navigate({ country })}
      />
      <FilterSelect
        label="Department"
        allLabel="All departments"
        value={query.departmentId?.toString()}
        options={reference.departments.map((d) => ({ value: String(d.id), label: d.name }))}
        onChange={(id) => navigate({ departmentId: id ? Number(id) : undefined })}
      />
      <FilterSelect
        label="Job title"
        allLabel="All job titles"
        value={query.jobTitle}
        options={reference.jobTitles.map((title) => ({ value: title, label: title }))}
        onChange={(jobTitle) => navigate({ jobTitle })}
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch('');
            startTransition(() => router.replace('/employees', { scroll: false }));
          }}
        >
          <X />
          Clear filters
        </Button>
      )}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  allLabel: string;
  value: string | undefined;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string | undefined) => void;
}

function FilterSelect({ label, allLabel, value, options, onChange }: FilterSelectProps) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : next)}
    >
      <SelectTrigger className="w-44" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
