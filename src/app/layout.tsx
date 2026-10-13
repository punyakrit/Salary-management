import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const plex = IBM_Plex_Sans({
  variable: '--font-plex',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: { default: 'ACME Pay', template: '%s | ACME Pay' },
  description: 'Manage employee salaries and understand how ACME pays its people.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${plex.variable} h-full antialiased`} suppressHydrationWarning>
      {/* Browser extensions (e.g. ColorZilla) inject attributes on <body>; ignore those diffs. */}
      <body className="min-h-full bg-white" suppressHydrationWarning>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
