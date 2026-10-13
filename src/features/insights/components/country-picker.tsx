'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { CountryFlag } from '@/components/country-flag';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CountryPickerProps {
  value: string;
  countries: Array<{ code: string; name: string }>;
}

/** Picks the country for the role breakdown; keeps other URL state (e.g. currency). */
export function CountryPicker({ value, countries }: CountryPickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      onValueChange={(country) => {
        const params = new URLSearchParams(searchParams);
        params.set('country', country);
        startTransition(() =>
          router.replace(`${pathname}?${params.toString()}`, { scroll: false }),
        );
      }}
    >
      <SelectTrigger className="h-9 w-48" aria-label="Country" data-pending={pending || undefined}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <CountryFlag code={country.code} />
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
