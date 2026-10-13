import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PanelProps {
  title?: React.ReactNode;
  /** One plain-language sentence that answers the panel's question. */
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Let the content stretch to the card's full height (for scrolling lists). */
  fill?: boolean;
  children: React.ReactNode;
}

/** The app's card: white, hairline border, near-flat shadow, 24px padding. */
export function Panel({
  title,
  description,
  action,
  className,
  contentClassName,
  fill = false,
  children,
}: PanelProps) {
  return (
    <Card
      className={cn(
        'gap-5 rounded-xl border border-border bg-card shadow-[0_1px_2px_rgb(16_24_40/0.04)] ring-0 [--card-spacing:--spacing(6)]',
        className,
      )}
    >
      {(title || action) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-[17px] font-semibold tracking-tight">{title}</CardTitle>
          )}
          {description && <CardDescription className="text-sm">{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn(fill && 'flex min-h-0 flex-1 flex-col', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export function PanelSkeleton({ className, rows = 6 }: { className?: string; rows?: number }) {
  return (
    <Panel className={className}>
      <div className="space-y-3" aria-hidden>
        <div className="h-4 w-44 rounded bg-muted" />
        <div className="h-3.5 w-72 rounded bg-muted/70" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="h-6 rounded bg-muted/50" />
          ))}
        </div>
      </div>
    </Panel>
  );
}
