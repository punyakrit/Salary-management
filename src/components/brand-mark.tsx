import { cn } from '@/lib/utils';

/** Logo: two pay bars on an ink tile. */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8', className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <rect x="8" y="10" width="16" height="4.5" rx="2.25" className="fill-pay" />
      <rect x="8" y="17.5" width="16" height="4.5" rx="2.25" className="fill-pay" />
    </svg>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('flex items-center gap-2.5 text-lg font-semibold tracking-tight', className)}
    >
      <BrandGlyph />
      ACME Pay
    </span>
  );
}
