
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Boxes,
  Calendar,
  CalendarPlus,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  TrendingUp,
  User as UserIcon,
  Users,
  Briefcase,
} from "lucide-react";
import { SalonFlowLogo } from "../icons";
import { user } from "@/lib/placeholder-data";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/services", icon: Scissors, label: "Services" },
  { href: "/book-appointment", icon: CalendarPlus, label: "Book Appointment" },
  { href: "/staff/schedule", icon: Calendar, label: "Schedule" },
  { href: "/staff", icon: Briefcase, label: "Staff", activeMatch: "/staff", exact: true },
  { href: "/clients", icon: Users, label: "Clients", activeMatch: "/clients" },
  { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/inventory", icon: Boxes, label: "Inventory" },
  { href: "/trends", icon: TrendingUp, label: "Trends" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNavItemActive = (item: typeof navItems[0]) => {
     if (item.exact) {
      return pathname === item.href;
    }
    const matchPath = item.activeMatch || item.href;
    // For non-exact matches, we need to ensure we're not on a more specific page.
    // For example, if we are on /staff/schedule, /staff should not be active.
    // The most specific match will be handled by picking the one with the longest path.
    return pathname.startsWith(matchPath);
  };
  
  // Find the most specific active item by finding the longest matching path.
  const activeItem = navItems
    .filter(isNavItemActive)
    .sort((a, b) => (b.activeMatch || b.href).length - (a.activeMatch || a.href).length)[0];


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SalonFlowLogo className="h-8 w-8 text-primary" />
            <span className="text-lg font-semibold font-headline">SalonFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item === activeItem}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/profile'}>
                <Link href="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2" /> Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
