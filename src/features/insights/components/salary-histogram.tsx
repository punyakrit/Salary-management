'use client';

import { Bar, BarChart, ReferenceArea, ReferenceLine, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { formatMoney } from '@/lib/money';
import type { SalaryBand } from '@/lib/schemas/insights';

const chartConfig = {
  headcount: { label: 'People', color: 'var(--pay)' },
} satisfies ChartConfig;

const usd = (amount: number) => formatMoney(amount, 'USD', { compact: true });
const TICK_EVERY_USD = 20_000;

interface SalaryHistogramProps {
  bands: SalaryBand[];
  median: number;
  p25: number;
  p75: number;
}

interface LabelViewBox {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}

export function SalaryHistogram({ bands, median, p25, p75 }: SalaryHistogramProps) {
  const data = bands.map((band) => ({ ...band, label: usd(band.from) }));
  const labelFor = (amount: number) => data.find((b) => amount >= b.from && amount < b.to)?.label;
  const firstFrom = data[0]?.from ?? 0;
  const ticks = data.filter((b) => (b.from - firstFrom) % TICK_EVERY_USD === 0).map((b) => b.label);

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[330px] w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="14%">
        <ReferenceArea
          x1={labelFor(p25)}
          x2={labelFor(p75)}
          fill="var(--pay)"
          fillOpacity={0.09}
          ifOverflow="extendDomain"
          label={(props: LabelViewBox) => <AreaLabel {...props} p25={p25} p75={p75} />}
        />
        <XAxis
          dataKey="label"
          ticks={ticks}
          interval={0}
          tickLine={false}
          axisLine={{ stroke: 'var(--border)' }}
          tickMargin={10}
          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
        />
        <YAxis hide domain={[0, (max: number) => Math.ceil(max * 1.32)]} />
        <ChartTooltip
          cursor={{ fill: 'var(--foreground)', fillOpacity: 0.04 }}
          content={({ active, payload }) => {
            const band = payload?.[0]?.payload as SalaryBand | undefined;
            if (!active || !band) return null;
            return (
              <div className="figures rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-lg">
                {usd(band.from)} – {usd(band.to)} · {band.headcount.toLocaleString('en-US')} people
              </div>
            );
          }}
        />
        <Bar
          dataKey="headcount"
          fill="var(--color-headcount)"
          radius={[3, 3, 0, 0]}
          maxBarSize={36}
          animationDuration={700}
          animationEasing="ease-out"
        />
        <ReferenceLine
          x={labelFor(median)}
          stroke="var(--foreground)"
          strokeDasharray="3 3"
          strokeWidth={1.25}
          label={(props: LabelViewBox) => <MedianLabel {...props} median={median} />}
        />
      </BarChart>
    </ChartContainer>
  );
}

function AreaLabel({ viewBox, p25, p75 }: LabelViewBox & { p25: number; p75: number }) {
  // Right-aligned: the median sits left of centre in a right-skewed spread,
  // so a centred label would collide with the "Typical" line.
  const x = (viewBox?.x ?? 0) + (viewBox?.width ?? 0) - 10;
  const y = (viewBox?.y ?? 0) + 20;
  return (
    <text x={x} y={y} textAnchor="end" className="fill-foreground text-[12px]">
      <tspan x={x} fontWeight={500}>
        Middle 50%
      </tspan>
      <tspan x={x} dy={16} className="fill-muted-foreground">
        {usd(p25)} – {usd(p75)}
      </tspan>
    </text>
  );
}

function MedianLabel({ viewBox, median }: LabelViewBox & { median: number }) {
  const x = (viewBox?.x ?? 0) + 8;
  const y = (viewBox?.y ?? 0) + 70;
  return (
    <text x={x} y={y} className="fill-foreground text-[12px]">
      <tspan x={x} fontWeight={500}>
        Typical
      </tspan>
      <tspan x={x} dy={16} fontWeight={600}>
        {usd(median)}
      </tspan>
    </text>
  );
}
