
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
  Boxes,
  ShoppingCart,
  MessageSquare,
  Shield,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { cn } from "@/lib/utils";
import { AuthService } from "@/lib/supabase/auth-service";
import { useToast } from "@/hooks/use-toast";
import { usePermissions, hasModuleAccess, ModuleKey, fetchAndUpdatePermissions } from "@/hooks/use-permissions";

// User type that matches session data
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'SUPER_ADMIN' | 'SALON_ADMIN';
  salonId: string | null;
  userType?: "salon" | "customer" | "staff" | "SUPER_ADMIN" | "SALON_ADMIN";
  permissions?: any;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: "dashboard", exact: true },
  { href: "/staff/schedule", icon: Calendar, label: "Schedule", permission: "schedule" },
  { href: "/clients", icon: Users, label: "Clients", activeMatch: "/clients", permission: "clients" },
  { href: "/services", icon: Scissors, label: "Services", permission: "services" },
  { href: "/deals", icon: Package, label: "Deals", permission: "deals" },
  { href: "/promotions", icon: Tag, label: "Promotions", permission: "promotions" },
  { href: "/inventory", icon: Boxes, label: "Inventory", permission: "inventory" },
  { href: "/procurement", icon: ShoppingCart, label: "Procurement", permission: "procurement" },
  { href: "/engage", icon: MessageSquare, label: "Engage", permission: "engage" },
  { href: "/hr", icon: Briefcase, label: "Human Resources", permission: "hr" },
  // { href: "/hrm", icon: Briefcase, label: "Human Resources", permission: "hrm" },
  { href: "/roles", icon: Shield, label: "Roles and Permissions", permission: "rolesPermissions" },
  // { href: "/onboardRequests", icon: Shield, label: "Onboard Requests" },
  // { 
  //   label: "Human Resources", 
  //   icon: Briefcase,
  //   subItems: [
  //     { href: "/staff", label: "Staff" },
  //     { href: "/roles", label: "Roles" },
  //     { href: "/hr/attendance", label: "Attendance" },
  //     { href: "/hr/payroll", label: "Payroll" },
  //     { href: "/hr/performance", label: "Performance" },
  //   ],
  //   roles: ["SUPER_ADMIN", "SALON_ADMIN"]
  // },
  { href: "/branches", icon: Building, label: "Branches", roles: ["SUPER_ADMIN", "SALON_ADMIN"]},
];

export function AppLayout({ children, user }: { children: React.ReactNode, user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = React.useState(
    user.salonId ? allBranches.find(b => b.id === user.salonId)?.name : 'All Branches'
  );

  const handleLogout = async () => {
    try {
      // Clear local storage first
      localStorage.removeItem("session");
      
      // Dispatch custom event to notify layout provider
      window.dispatchEvent(new CustomEvent("authStateChanged", { detail: null }));
      
      // Immediately redirect to auth page
      window.location.href = '/auth';
      
      // Sign out from Supabase in background
      AuthService.signOut().catch(error => {
        console.error('Logout error:', error);
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to auth page
      window.location.href = '/auth';
    }
  };

  const isNavItemActive = (item: any) => {
    if (item.exact) {
      // For exact match, check if pathname exactly matches or is root when href is dashboard
      if (item.href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
      }
      return pathname === item.href;
    }
    if (item.activeMatch) return pathname.startsWith(item.activeMatch);
    if (item.href) {
      // Special handling for dashboard - also match root path
      if (item.href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/";
      }
      return pathname.startsWith(item.href);
    }
    if (item.subItems) {
      return item.subItems.some((sub: any) => pathname.startsWith(sub.href));
    }
    return false;
  };
  
  const userIdentifier = user?.email;
  const userInitial = userIdentifier ? userIdentifier.charAt(0).toUpperCase() : '?';
  const { isAdmin } = usePermissions();
  const [userWithPermissions, setUserWithPermissions] = React.useState(user);
  
  // Update userWithPermissions when user prop changes
  React.useEffect(() => {
    setUserWithPermissions(user);
  }, [user]);
  
  // Fetch permissions for staff members if not in session
  React.useEffect(() => {
    const loadPermissions = async () => {
      // Only fetch for staff members who don't have permissions in session
      if (user && !isAdmin && !user.permissions && user.id) {
        try {
          const permissions = await fetchAndUpdatePermissions(user.id);
          if (permissions) {
            // Update local user state with permissions
            const updatedUser = { ...user, permissions };
            setUserWithPermissions(updatedUser);
          }
        } catch (error) {
          console.error("Error loading permissions:", error);
        }
      }
    };
    
    loadPermissions();
    
    // Listen for session updates
    const handleSessionUpdate = (e: CustomEvent) => {
      if (e.detail) {
        setUserWithPermissions(e.detail);
      }
    };
    
    window.addEventListener("sessionUpdated", handleSessionUpdate as EventListener);
    return () => {
      window.removeEventListener("sessionUpdated", handleSessionUpdate as EventListener);
    };
  }, [user, isAdmin]);
  
  const visibleNavItems = navItems?.filter((item: any) => {
    // Check roles-based access (for backward compatibility)
    console.log("Item: ", item)
    if (item.roles) {
      return item.roles.includes(user.role);
    }
    
    // Check permission-based access
    if (item.permission) {
      // Admins always have access
      if (isAdmin) {
        return true;
      }
      // For staff, check module access (use userWithPermissions which has permissions loaded)
      return hasModuleAccess(item.permission as ModuleKey, userWithPermissions as any);
    }
    
    // Items without permission or roles are visible to all (like HRM, Settings, etc.)
    return true;
  }).map((item: any) => {
    // Handle subItems filtering if needed
    if (item.label === 'Human Resources' && item.subItems) {
      const visibleSubItems = item.subItems.filter((subItem: any) => !subItem.roles || subItem.roles.includes(user.role));
      return { ...item, subItems: visibleSubItems };
    }
    return item;
  });
  
  console.log("Visible nav items: ", visibleNavItems)
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="group-data-[variant=sidebar]:bg-sidebar text-sidebar-foreground">
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <SalonFlowLogo className="h-6 w-6 text-primary" src="/partner app store logo.png" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden text-black dark:text-white">GlamBee</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {visibleNavItems?.map((item: any, index: number) => (
              item.subItems ? (
                <Collapsible key={index} asChild>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                       <SidebarMenuButton
                        className="w-full"
                        isActive={isNavItemActive(item)}
                        tooltip={{
                            children: item.label,
                            side: "right",
                        }}
                        >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                     <CollapsibleContent asChild>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem: any, subIndex: number) => (
                           <SidebarMenuItem key={subIndex}>
                              <SidebarMenuSubButton asChild isActive={isNavItemActive(subItem)}>
                                 <Link href={subItem.href}>{subItem.label}</Link>
                              </SidebarMenuSubButton>
                           </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(item)}
                    tooltip={{
                      children: item.label,
                      side: "right",
                    }}
                  >
                    <Link href={item.href!} className='w-full'>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {/* Show Settings only if user has access */}
            {(() => {
              // Admins always have access
              if (isAdmin) return true;
              // For staff, check if they have settings permission
              return hasModuleAccess("settings" as ModuleKey, userWithPermissions as any);
            })() && (
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
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 py-2 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <SidebarTrigger />
          
          <div className="flex items-center  w-full gap-4">
            <GlobalClientSearch />

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
                    <AvatarImage src={user?.avatar || undefined} alt={userIdentifier} />
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
                {/* Show Settings only if user has access */}
                {(() => {
                  // Admins always have access
                  if (isAdmin) return true;
                  // For staff, check if they have settings permission
                  return hasModuleAccess("settings" as ModuleKey, userWithPermissions as any);
                })() && (
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2" /> Settings
                    </Link>
                  </DropdownMenuItem>
                )}
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
