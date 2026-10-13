import { Plus } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from '@/components/global-search';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppPageProps {
  title: string;
  caption?: React.ReactNode;
  /** Page-specific controls, shown before the global "Add employee" button. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Every workspace page: a sticky top bar (title, search, actions) above the content. */
export function AppPage({ title, caption, actions, children }: AppPageProps) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex min-h-[76px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] leading-tight font-semibold tracking-tight">
              {title}
            </h1>
            {caption && <p className="mt-0.5 truncate text-sm text-muted-foreground">{caption}</p>}
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <GlobalSearch />
            {actions}
            <Button asChild className="h-10 px-4">
              <Link href="/employees/new">
                <Plus />
                Add employee
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </>
  );
}
