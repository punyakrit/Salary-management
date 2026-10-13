import { Panel } from '@/components/panel';
import { bandDomain } from '@/lib/pay-band';
import { employeesHref } from '@/lib/url-state';
import { CURRENCY_PARAM, parseCurrencyMode } from '../currency-mode';
import { getCountryInsights, getJobTitleInsights } from '../queries';
import { topRoleTakeaway } from '../takeaways';
import { CountryPicker } from './country-picker';
import { RolePayTable } from './role-pay-table';

type RawParams = Record<string, string | string[] | undefined>;

/** "What does each role earn in <country>?" In USD or local currency (top-bar toggle). */
export async function RolePayCard({
  searchParams,
  className,
}: {
  searchParams: Promise<RawParams>;
  className?: string;
}) {
  const [params, countries] = await Promise.all([searchParams, getCountryInsights()]);
  const selected = countries.find((c) => c.countryCode === params.country) ?? countries[0];
  if (!selected) return null;

  const mode = parseCurrencyMode(params[CURRENCY_PARAM]);
  const rate = mode === 'usd' ? selected.usdRate : 1;
  const currency = mode === 'usd' ? 'USD' : selected.currency;

  // Only roles paid in the local currency share a scale (expats paid in USD would skew it).
  const rows = (await getJobTitleInsights(selected.countryCode))
    .filter((row) => row.currency === selected.currency)
    .sort((a, b) => b.median - a.median)
    .map((row) => ({
      ...row,
      currency,
      min: row.min * rate,
      max: row.max * rate,
      median: row.median * rate,
    }));

  return (
    <Panel
      className={className}
      fill
      title="What each role earns"
      description={topRoleTakeaway(rows)}
      action={
        <CountryPicker
          value={selected.countryCode}
          countries={countries.map((c) => ({ code: c.countryCode, name: c.countryName }))}
        />
      }
    >
      <RolePayTable
        rows={rows.map((row) => ({
          jobTitle: row.jobTitle,
          headcount: row.headcount,
          min: row.min,
          max: row.max,
          median: row.median,
          href: employeesHref({}, { country: selected.countryCode, jobTitle: row.jobTitle }),
        }))}
        domain={bandDomain(rows)}
        currency={currency}
      />
    </Panel>
  );
}
