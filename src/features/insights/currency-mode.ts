/** How the dashboard shows per-country pay: converted to USD (comparable) or in local currency. */
export type CurrencyMode = 'usd' | 'local';

export const CURRENCY_PARAM = 'currency';

export function parseCurrencyMode(value: string | string[] | undefined): CurrencyMode {
  return value === 'local' ? 'local' : 'usd';
}
