
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
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
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
} from "lucide-react";
import { SalonFlowLogo } from "../icons";
import { GlobalClientSearch } from "./GlobalClientSearch";
import { useTheme } from "next-themes";
import { branches as allBranches } from "@/lib/placeholder-data";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  { href: "/staff/schedule", icon: Calendar, label: "Schedule" },
  { href: "/clients", icon: Users, label: "Clients", activeMatch: "/clients" },
  { href: "/services", icon: Scissors, label: "Services" },
  { href: "/deals", icon: Package, label: "Deals" },
  { href: "/promotions", icon: Tag, label: "Promotions" },
  { href: "/staff", icon: Briefcase, label: "Staff" },
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
    if (item.exact) return pathname === item.href;
    if (item.activeMatch) return pathname.startsWith(item.activeMatch);
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
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="group-data-[variant=sidebar]:bg-sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <SalonFlowLogo className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">SalonFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isNavItemActive(item)}
                  tooltip={{
                    children: item.label,
                    side: "right",
                  }}
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
              <SidebarMenuButton
                  asChild
                  tooltip={{
                    children: "Settings",
                    side: "right",
                  }}
                >
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger className="md:hidden" />
          
          <GlobalClientSearch />
          
          <div className="ml-auto flex items-center gap-2">
            {user.role === 'SUPER_ADMIN' && (
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <Building className="h-4 w-4" />
                          <span className="sr-only">Select Branch</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Branch: {selectedBranch}</p>
                    </TooltipContent>
                    <DropdownMenuContent className="w-56" align="end">
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
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
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
          </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
