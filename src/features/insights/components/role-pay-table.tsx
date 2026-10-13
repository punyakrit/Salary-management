'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Money } from '@/components/money';
import { DURATION, EASE_OUT } from '@/components/motion';
import { PayBand } from '@/components/pay-band';
import { ScrollFill } from '@/components/scroll-fill';

export interface RoleRow {
  jobTitle: string;
  headcount: number;
  min: number;
  max: number;
  median: number;
  href: string;
}

const COLUMNS = 'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_4.5rem] gap-4';

interface RolePayTableProps {
  rows: RoleRow[];
  domain: [number, number];
  currency: string;
}

/**
 * Every role, ranked by typical pay, scrolling inside the card so it lines up
 * with the countries table. Rows reflow when the country changes, so rank
 * moves are visible.
 */
export function RolePayTable({ rows, domain, currency }: RolePayTableProps) {
  return (
    <>
      <div className={`${COLUMNS} border-b pb-2.5 text-[13px] font-medium text-muted-foreground`}>
        <span>Role</span>
        <span className="text-center">Pay range ({currency})</span>
        <span className="text-right">Typical</span>
      </div>
      <ScrollFill minHeight={360}>
        <ul className="divide-y">
          {rows.map((row, index) => (
            <motion.li
              key={row.jobTitle}
              layout="position"
              transition={{ duration: DURATION.base, ease: EASE_OUT }}
              className={`${COLUMNS} items-center py-2 text-sm`}
            >
              <div className="min-w-0">
                <Link
                  href={row.href}
                  title={row.jobTitle}
                  className="block truncate font-semibold underline-offset-4 hover:underline"
                >
                  {row.jobTitle}
                </Link>
                <span className="figures text-xs text-muted-foreground">
                  {row.headcount.toLocaleString('en-US')}{' '}
                  {row.headcount === 1 ? 'person' : 'people'}
                </span>
              </div>
              <PayBand
                min={row.min}
                max={row.max}
                median={row.median}
                domain={domain}
                currency={currency}
                index={index}
              />
              <Money
                amount={row.median}
                currency={currency}
                compact
                className="text-right font-medium"
              />
            </motion.li>
          ))}
        </ul>
      </ScrollFill>
    </>
  );
}
