import type { CSSProperties } from 'react';
import { formatMoney } from '@/lib/money';

interface PeerBandProps {
  name: string;
  salary: number;
  min: number;
  max: number;
  typical: number;
  currency: string;
}

/** Keep the middle label inside the track so it never collides with the end labels. */
const clamp = (pct: number) => Math.min(Math.max(pct, 12), 88);

/**
 * The peer range drawn large, with the person and the typical salary labelled
 * on the track. Painted in place and animated with CSS (the range opens from
 * the typical value, then the marker slides to this person), so it is never
 * empty while the page hydrates.
 */
export function PeerBand({ name, salary, min, max, typical, currency }: PeerBandProps) {
  const lo = Math.min(min, salary);
  const hi = Math.max(max, salary);
  const pad = (hi - lo) * 0.04 || 1;
  const at = (n: number) => ((n - (lo - pad)) / (hi - lo + pad * 2)) * 100;
  const fmt = (n: number) => formatMoney(n, currency, { compact: true });
  const originPct = max > min ? ((typical - min) / (max - min)) * 100 : 50;

  return (
    <div
      className="pt-9 pb-1"
      role="img"
      aria-label={`${name} earns ${fmt(salary)}. Peers range from ${fmt(min)} to ${fmt(max)}, typically ${fmt(typical)}.`}
    >
      <div className="relative h-3">
        <div className="absolute inset-0 rounded-full bg-muted" />
        <div
          className="absolute inset-y-0 animate-grow-x rounded-full bg-pay-band"
          style={{
            left: `${at(min)}%`,
            width: `${at(max) - at(min)}%`,
            transformOrigin: `${originPct}% 50%`,
          }}
        />
        <div
          className="absolute top-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
          style={{ left: `${at(typical)}%` }}
        />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 animate-slide-from"
          style={
            {
              left: `${at(salary)}%`,
              '--slide-from': `${at(typical)}%`,
              animationDelay: '250ms',
            } as CSSProperties
          }
        >
          <span className="block size-4 rounded-full bg-pay ring-[3px] ring-card" />
          <span className="figures absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-xs font-medium whitespace-nowrap text-primary-foreground">
            {name} · {fmt(salary)}
          </span>
        </div>
      </div>

      <div className="figures relative mt-3 h-10 text-sm">
        <div className="absolute left-0">
          <div className="text-muted-foreground">Lowest</div>
          <div className="font-medium">{fmt(min)}</div>
        </div>
        <div
          className="absolute -translate-x-1/2 text-center"
          style={{ left: `${clamp(at(typical))}%` }}
        >
          <div className="text-muted-foreground">Typical</div>
          <div className="font-semibold">{fmt(typical)}</div>
        </div>
        <div className="absolute right-0 text-right">
          <div className="text-muted-foreground">Highest</div>
          <div className="font-medium">{fmt(max)}</div>
        </div>
      </div>
    </div>
  );
}
