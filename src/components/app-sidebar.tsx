'use client';

import { UserButton } from '@clerk/nextjs';
import { BarChart3, CirclePlus, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { BrandGlyph } from '@/components/brand-mark';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const NAV = [
  {
    label: 'Workspace',
    items: [
      { title: 'Pay overview', href: '/dashboard', icon: BarChart3, exact: true },
      { title: 'Employees', href: '/employees', icon: Users, exact: false },
    ],
  },
  {
    label: 'Actions',
    items: [{ title: 'Add employee', href: '/employees/new', icon: CirclePlus, exact: true }],
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="h-[76px] justify-center px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="ACME Pay"
              className="hover:bg-transparent"
            >
              <Link href="/dashboard">
                <BrandGlyph className="size-8 shrink-0" />
                <span className="text-lg font-semibold tracking-tight">ACME Pay</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-1 pt-2">
        {/* The active highlight depends on the URL, which is only known at request time. */}
        <Suspense fallback={<NavGroups pathname={null} />}>
          <ActiveNavGroups />
        </Suspense>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger:
                'w-full justify-start rounded-lg px-2 py-2 hover:bg-sidebar-accent focus:shadow-none',
              userButtonBox: 'flex-row-reverse justify-end gap-3 w-full',
              userButtonOuterIdentifier: 'text-sm font-medium text-sidebar-foreground truncate',
              userButtonAvatarBox: 'size-8',
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function ActiveNavGroups() {
  return <NavGroups pathname={usePathname()} />;
}

function NavGroups({ pathname }: { pathname: string | null }) {
  const isActive = (href: string, exact: boolean) =>
    pathname !== null &&
    (exact
      ? pathname === href
      : pathname === href || (pathname.startsWith(`${href}/`) && pathname !== '/employees/new'));

  return NAV.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel className="text-[13px] font-normal text-muted-foreground">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href, item.exact)}
                tooltip={item.title}
                className="h-10 gap-3 rounded-lg px-3 text-[15px] data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium [&>svg]:size-[18px]"
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}
