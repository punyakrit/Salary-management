/**
 * Money helpers. Amounts are always paired with an ISO 4217 currency code;
 * see docs/03-data-model.md ("Why it looks like this").
 */

export function hasAtMostTwoDecimals(value: number): boolean {
  const cents = value * 100;
  return Math.abs(cents - Math.round(cents)) < 1e-6;
}

export function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

interface FormatMoneyOptions {
  locale?: string;
  compact?: boolean;
}

export function formatMoney(
  amount: number,
  currency: string,
  { locale = 'en-US', compact = false }: FormatMoneyOptions = {},
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}
