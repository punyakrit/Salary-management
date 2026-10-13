'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { GrowBar } from '@/components/grow-bar';
import { DURATION } from '@/components/motion';
import { Panel } from '@/components/panel';
import { ScrollFill } from '@/components/scroll-fill';
import { SegmentedControl } from '@/components/segmented-control';
import { formatMoney } from '@/lib/money';

export interface SplitRow {
  label: string;
  payroll: number;
  headcount: number;
  href: string;
}

type View = 'department' | 'country';

const VIEWS = [
  { value: 'department', label: 'Department' },
  { value: 'country', label: 'Country' },
] as const;

interface MoneySplitProps {
  byDepartment: SplitRow[];
  byCountry: SplitRow[];
  takeaways: Record<View, string | null>;
  className?: string;
}

/**
 * "Where does the payroll go?" Bars compare each slice with the largest one.
 * The list scrolls inside the card so it matches the histogram beside it.
 */
export function MoneySplit({ byDepartment, byCountry, takeaways, className }: MoneySplitProps) {
  const [view, setView] = useState<View>('department');
  const rows = [...(view === 'department' ? byDepartment : byCountry)].sort(
    (a, b) => b.payroll - a.payroll,
  );
  const total = rows.reduce((sum, row) => sum + row.payroll, 0);
  const largest = Math.max(...rows.map((row) => row.payroll), 1);

  return (
    <Panel
      className={className}
      fill
      title="Where the money goes"
      description={
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
            className="block"
          >
            {takeaways[view]}
          </motion.span>
        </AnimatePresence>
      }
      action={
        <SegmentedControl
          label="Group payroll by"
          value={view}
          options={VIEWS}
          onChange={setView}
        />
      }
    >
      <ScrollFill>
        {/* Switching view swaps the list: rows cross-fade and the bars regrow.
            initial={false} keeps the server-rendered list visible before hydration. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.fast }}
            className="divide-y"
          >
            {rows.map((row, index) => (
              <li
                key={row.label}
                className="grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)_4.5rem_2.25rem] items-center gap-4 py-2"
              >
                <div className="min-w-0">
                  <Link
                    href={row.href}
                    className="block truncate text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {row.label}
                  </Link>
                  <span className="figures text-xs text-muted-foreground">
                    {row.headcount.toLocaleString('en-US')} people
                  </span>
                </div>
                <GrowBar fraction={row.payroll / largest} index={index} />
                <span className="figures text-right text-sm font-semibold">
                  {formatMoney(row.payroll, 'USD', { compact: true })}
                </span>
                <span className="figures text-right text-xs text-muted-foreground">
                  {Math.round((row.payroll / total) * 100)}%
                </span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </ScrollFill>
    </Panel>
  );
}
