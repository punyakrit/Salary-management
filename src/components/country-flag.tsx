import { AU, BR, CA, DE, FR, GB, IN, NL, SG, US } from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

// SVG flags (emoji flags don't render on Windows). Only the seeded countries are
// bundled; any other code falls back to a neutral badge with the ISO code.
const FLAGS = { AU, BR, CA, DE, FR, GB, IN, NL, SG, US } as const;

export function CountryFlag({ code, className }: { code: string; className?: string }) {
  const Flag = FLAGS[code as keyof typeof FLAGS];
  if (!Flag) {
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex h-3.5 w-5 items-center justify-center rounded-[2px] bg-muted text-[8px] font-semibold text-muted-foreground',
          className,
        )}
      >
        {code}
      </span>
    );
  }
  return (
    <Flag
      aria-hidden
      className={cn(
        'h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgb(16_24_40/0.08)]',
        className,
      )}
    />
  );
}
