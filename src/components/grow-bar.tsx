import { cn } from '@/lib/utils';

interface GrowBarProps {
  /** 0–1 share of the track to fill. */
  fraction: number;
  index?: number;
  className?: string;
}

/**
 * A horizontal bar rendered at its final width that grows from the baseline on
 * first paint (CSS, so it's never empty while the page hydrates). Remount it
 * via `key` to replay the growth when the data behind it changes.
 */
export function GrowBar({ fraction, index = 0, className }: GrowBarProps) {
  return (
    <div className={cn('h-2.5 overflow-hidden rounded-full bg-muted', className)} aria-hidden>
      <div
        className="h-full origin-left animate-grow-x rounded-full bg-pay"
        style={{
          width: `${Math.max(fraction * 100, 1.5)}%`,
          animationDelay: `${Math.min(index, 12) * 35}ms`,
        }}
      />
    </div>
  );
}
