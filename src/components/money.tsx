import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';

interface MoneyProps {
  amount: number;
  currency: string;
  compact?: boolean;
  className?: string;
}

/** Money is never shown without its currency. */
export function Money({ amount, currency, compact, className }: MoneyProps) {
  return (
    <span className={cn('figures whitespace-nowrap', className)}>
      {formatMoney(amount, currency, { compact })}
    </span>
  );
}
