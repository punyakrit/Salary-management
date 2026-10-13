'use client';

import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  size?: 'sm' | 'lg';
}

/** A two-or-three way switch. The highlight slides to show what changed. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'sm',
}: SegmentedControlProps<T>) {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex shrink-0 rounded-lg border bg-muted/70 p-0.5',
        size === 'lg' ? 'h-10 text-sm' : 'h-8 text-[13px]',
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
              size === 'lg' ? 'px-4' : 'px-3',
              active
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={`segment-${id}`}
                className="absolute inset-0 rounded-md bg-background shadow-[0_1px_2px_rgb(16_24_40/0.1)]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
