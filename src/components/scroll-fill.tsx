import { cn } from '@/lib/utils';

interface ScrollFillProps {
  children: React.ReactNode;
  /** Height used when there's no neighbour to match (e.g. single-column on mobile). */
  minHeight?: number;
  className?: string;
}

/**
 * Fills whatever height its card is given and scrolls inside it. The content is
 * absolutely positioned, so a long list never makes its card taller than the
 * card beside it. A soft fade at the bottom hints that there is more.
 */
export function ScrollFill({ children, minHeight = 320, className }: ScrollFillProps) {
  return (
    <div className="relative flex-1" style={{ minHeight }}>
      <div
        className={cn(
          'absolute inset-0 -mr-3 overflow-y-auto pr-3 pb-6 [scrollbar-width:thin]',
          '[mask-image:linear-gradient(to_bottom,black_calc(100%-32px),transparent)]',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
