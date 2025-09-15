
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  User as UserIcon,
  Users,
  Briefcase,
  Building,
  Sun,
  Moon,
  Tag,
  Package,
  CalendarPlus,
  ChevronsUpDown,
} from "lucide-react";
import { SalonFlowLogo } from "../icons";
import { GlobalClientSearch } from "./GlobalClientSearch";
import { useTheme } from "next-themes";
import { branches as allBranches } from "@/lib/placeholder-data";

// Mock user type for prototype
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'SUPER_ADMIN' | 'SALON_ADMIN';
  salonId: string | null;
};

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/clients", icon: Users, label: "Clients", activeMatch: "/clients" },
  { href: "/appointments", icon: CalendarPlus, label: "Appointments" },
  { href: "/staff/schedule", icon: Calendar, label: "Schedule" },
  { href: "/services", icon: Scissors, label: "Services" },
  { href: "/deals", icon: Package, label: "Deals" },
  { href: "/promotions", icon: Tag, label: "Promotions" },
  { href: "/staff", icon: Briefcase, label: "Staff" },
  // { href: "/billing", icon: CreditCard, label: "Billing" },
  { href: "/branches", icon: Building, label: "Branches", roles: ["SUPER_ADMIN"]},
];

export function AppLayout({ children, user }: { children: React.ReactNode, user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [selectedBranch, setSelectedBranch] = React.useState(
    user.salonId ? allBranches.find(b => b.id === user.salonId)?.name : 'All Branches'
  );


  const handleLogout = () => {
    localStorage.removeItem("session");
    router.refresh();
    router.push('/login');
  };

  const isNavItemActive = (item: any) => {
    if (item.exact) {
      return pathname === item.href;
    }
    if (item.activeMatch) {
      // For Clients, we want to match /clients and /clients/[email]
      return pathname.startsWith(item.activeMatch);
    }
    // For Staff, we want to match /staff but not /staff/schedule
    if (item.href === "/staff") {
      return pathname === "/staff";
    }

    return pathname.startsWith(item.href);
  };
  
  const userIdentifier = user?.email;
  const userInitial = userIdentifier ? userIdentifier.charAt(0).toUpperCase() : '?';
  const visibleNavItems = navItems.filter(item => !item.roles || item.roles.includes(user.role));
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

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
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Button
                  className="w-full justify-start"
                  variant={isNavItemActive(item) ? "default" : "ghost"}
                  size="default"
                  asChild
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        {/* Footer is removed as profile is in the header dropdown */}
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1"></div>
          <GlobalClientSearch />
          
          {user.role === 'SUPER_ADMIN' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between hidden md:flex">
                  {selectedBranch}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[180px]">
                <DropdownMenuLabel>Select a Branch</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSelectedBranch('All Branches')}>
                  All Branches
                </DropdownMenuItem>
                {allBranches.map(branch => (
                  <DropdownMenuItem key={branch.id} onSelect={() => setSelectedBranch(branch.name)}>
                    {branch.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 hidden md:flex"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user?.avatar} alt={userIdentifier} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</span>
                  </DropdownMenuSubTrigger>
              </DropdownMenuSub>
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
              <DropdownMenuItem onClick={handleLogout}>
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
