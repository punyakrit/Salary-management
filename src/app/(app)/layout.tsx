import { AppSidebar } from '@/components/app-sidebar';
import { MotionProvider } from '@/components/motion-provider';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

/**
 * Signed-in workspace shell. Routes in this group are protected by src/proxy.ts.
 * Each page renders its own top bar through <AppPage>.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <MotionProvider>
      <SidebarProvider style={{ '--sidebar-width': '16.5rem' } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </SidebarProvider>
    </MotionProvider>
  );
}
