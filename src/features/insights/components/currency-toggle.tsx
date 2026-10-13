'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { SegmentedControl } from '@/components/segmented-control';
import { CURRENCY_PARAM, parseCurrencyMode, type CurrencyMode } from '../currency-mode';

const OPTIONS = [
  { value: 'usd', label: 'USD' },
  { value: 'local', label: 'Local currency' },
] as const;

export function CurrencyToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const value = parseCurrencyMode(searchParams.get(CURRENCY_PARAM) ?? undefined);

  const onChange = (mode: CurrencyMode) => {
    const params = new URLSearchParams(searchParams);
    if (mode === 'usd') params.delete(CURRENCY_PARAM);
    else params.set(CURRENCY_PARAM, mode);
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  };

  return (
    <SegmentedControl
      label="Show pay in"
      size="lg"
      value={value}
      options={OPTIONS}
      onChange={onChange}
    />
  );
}

/** Static stand-in while the URL is read (it's only known at request time). */
export function CurrencyToggleFallback() {
  return (
    <SegmentedControl
      label="Show pay in"
      size="lg"
      value="usd"
      options={OPTIONS}
      onChange={() => {}}
    />
  );
}
