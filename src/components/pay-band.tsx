'use client';

import type { CSSProperties } from 'react';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PayBandProps {
  min: number;
  max: number;
  median: number;
  /** One person's salary, drawn as a dot (peer comparison). */
  value?: number;
  /** Shared scale so bands in the same list are comparable. */
  domain: [number, number];
  currency: string;
  /** Position in a list, for a slight stagger as rows draw in. */
  index?: number;
  className?: string;
}

/**
 * The app's signature mark: a pay range (lowest → highest) with the typical
 * (median) salary as a tick and, optionally, one person as a dot. Painted at
 * its final position and opened outward from the median with CSS, so it's
 * visible before hydration. Every number is also in the tooltip and in
 * screen-reader text. (Client component only for the Radix tooltip.)
 */
export function PayBand({
  min,
  max,
  median,
  value,
  domain,
  currency,
  index = 0,
  className,
}: PayBandProps) {
  const [lo, hi] = domain;
  const span = hi - lo || 1;
  const pct = (n: number) => ((n - lo) / span) * 100;
  const fmt = (n: number) => formatMoney(n, currency, { compact: true });
  const summary = `Lowest ${fmt(min)}, typical ${fmt(median)}, highest ${fmt(max)}${
    value === undefined ? '' : `; this employee ${fmt(value)}`
  }`;
  const delay = `${Math.min(index, 12) * 30}ms`;
  // Grow from the median outward: the transform origin sits at the median's place in the band.
  const originPct = max > min ? ((median - min) / (max - min)) * 100 : 50;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          tabIndex={0}
          aria-label={summary}
          className={cn(
            'relative h-5 w-full min-w-24 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          {/* Keyed by its values so the opening replays when the data changes. */}
          <div
            key={`${min}-${max}`}
            className="absolute top-1/2 h-2.5 -translate-y-1/2 animate-grow-x rounded-full bg-pay-band"
            style={{
              left: `${pct(min)}%`,
              width: `${pct(max) - pct(min)}%`,
              transformOrigin: `${originPct}% 50%`,
              animationDelay: delay,
            }}
          />
          <div
            className="absolute top-1/2 h-[18px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{ left: `${pct(median)}%` }}
          />
          {value !== undefined && (
            <div
              key={value}
              className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 animate-slide-from rounded-full bg-pay ring-2 ring-background"
              style={
                {
                  left: `${pct(value)}%`,
                  '--slide-from': `${pct(median)}%`,
                  animationDelay: '200ms',
                } as CSSProperties
              }
            />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent className="figures">
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5">
          <dt>Lowest</dt>
          <dd className="text-right">{fmt(min)}</dd>
          <dt>Typical</dt>
          <dd className="text-right">{fmt(median)}</dd>
          <dt>Highest</dt>
          <dd className="text-right">{fmt(max)}</dd>
          {value !== undefined && (
            <>
              <dt>This employee</dt>
              <dd className="text-right">{fmt(value)}</dd>
            </>
          )}
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}

/** Explains the mark once per section, for readers new to range charts. */
export function PayBandLegend() {
  return (
    <div aria-hidden className="flex items-center gap-5 text-[13px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-6 rounded-full bg-pay-band" />
        Lowest → highest
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3.5 w-[3px] rounded-full bg-foreground" />
        Typical
      </span>
    </div>
  );
}
