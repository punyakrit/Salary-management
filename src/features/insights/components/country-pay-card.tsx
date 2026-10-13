import Link from 'next/link';
import { CountryFlag } from '@/components/country-flag';
import { Money } from '@/components/money';
import { Panel } from '@/components/panel';
import { PayBand, PayBandLegend } from '@/components/pay-band';
import { bandDomain } from '@/lib/pay-band';
import { employeesHref } from '@/lib/url-state';
import { getCountryInsights } from '../queries';
import { countrySpreadTakeaway } from '../takeaways';

/** "How does pay compare across countries?" One USD scale, so bands line up. */
export async function CountryPayCard({ className }: { className?: string }) {
  const countries = [...(await getCountryInsights())].sort((a, b) => b.usd.median - a.usd.median);
  const domain = bandDomain(countries.map((c) => c.usd));
  const totalPayroll = countries.reduce((sum, c) => sum + c.usd.totalPayroll, 0);

  return (
    <Panel
      className={className}
      title="Pay across countries"
      description={countrySpreadTakeaway(countries)}
      action={<PayBandLegend />}
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-[13px] text-muted-foreground">
              <th className="px-1 pb-2.5 font-medium">Country</th>
              <th className="px-1 pb-2.5 text-right font-medium">People</th>
              <th className="px-1 pb-2.5 text-right font-medium">Typical (local)</th>
              <th className="w-[30%] px-4 pb-2.5 text-center font-medium">Pay range (USD)</th>
              <th className="px-1 pb-2.5 text-right font-medium">Typical (USD)</th>
              <th className="px-1 pb-2.5 text-right font-medium">Share of payroll</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {countries.map((country, index) => (
              <tr key={country.countryCode}>
                <td className="px-1 py-2">
                  <Link
                    href={employeesHref({}, { country: country.countryCode })}
                    className="flex items-center gap-2.5 font-medium underline-offset-4 hover:underline"
                  >
                    <CountryFlag code={country.countryCode} />
                    {country.countryName}
                  </Link>
                </td>
                <td className="figures px-1 py-2 text-right text-muted-foreground">
                  {country.headcount.toLocaleString('en-US')}
                </td>
                <td className="px-1 py-2 text-right">
                  <Money amount={country.local.median} currency={country.currency} compact />
                </td>
                <td className="px-4 py-2">
                  <PayBand
                    min={country.usd.min}
                    max={country.usd.max}
                    median={country.usd.median}
                    domain={domain}
                    currency="USD"
                    index={index}
                  />
                </td>
                <td className="px-1 py-2 text-right font-medium">
                  <Money amount={country.usd.median} currency="USD" compact />
                </td>
                <td className="figures px-1 py-2 text-right">
                  {Math.round((country.usd.totalPayroll / totalPayroll) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
