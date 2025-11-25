
"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthService } from "@/lib/supabase/auth-service";
import { useEffect, useState } from "react";
import { fetchAndUpdatePermissions, ModuleKey } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "../ui/unauthorized-access";

// List of valid base routes in the application
const VALID_BASE_ROUTES = [
  "/",
  "/dashboard",
  "/appointments",
  "/clients",
  "/services",
  "/deals",
  "/promotions",
  "/inventory",
  "/procurement",
  "/engage",
  "/hr",
  "/hrm",
  "/roles",
  "/billing",
  "/staff",
  "/branches",
  "/salons",
  "/settings",
  "/profile",
  "/login",
  "/demo-signup",
  "/test-supabase",
  "/onboardRequests",
  "/checkout",
];

// Valid nested routes (routes with sub-paths)
const VALID_NESTED_ROUTES = [
  "/staff/schedule",
  "/staff/[id]",
  "/clients/[email]",
  "/checkout/[email]",
  "/inventory/audit",
  "/inventory/grn",
  "/hr/attendance",
  "/hr/payroll",
  "/hr/performance",
  "/procurement/po",
  "/procurement/po/new",
];

// Check if a route is valid
const isValidRoute = (pathname: string): boolean => {
  // Auth routes are always valid
  if (pathname.startsWith("/auth")) {
    return true;
  }

  // API routes are always valid
  if (pathname.startsWith("/api")) {
    return true;
  }

  // Check exact matches in base routes
  if (VALID_BASE_ROUTES.includes(pathname)) {
    return true;
  }

  // Check exact matches in nested routes
  if (VALID_NESTED_ROUTES.includes(pathname)) {
    return true;
  }

  // Check dynamic routes (e.g., /clients/[email], /staff/[id], /checkout/[email])
  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length === 2) {
    const basePath = `/${pathSegments[0]}`;
    // Check if base path is valid for dynamic routes
    if (basePath === "/clients" || basePath === "/staff" || basePath === "/checkout") {
      return true;
    }
  }

  // Check nested dynamic routes (e.g., /procurement/po/new)
  if (pathSegments.length >= 2) {
    const basePath = `/${pathSegments[0]}`;
    if (VALID_BASE_ROUTES.includes(basePath)) {
      // Check if it matches a nested route pattern
      const nestedPath = `/${pathSegments.slice(0, 2).join("/")}`;
      if (VALID_NESTED_ROUTES.some(route => route.startsWith(nestedPath))) {
        return true;
      }
    }
  }

  return false;
};

// This is a mock user type for the prototype
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'SUPER_ADMIN' | 'SALON_ADMIN';
  salonId: string | null;
};

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  console.log("Check user: ", user)
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, any> | null>(null);
  console.log("Check permissions: ", permissions)
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedModule, setUnauthorizedModule] = useState<string | null>(null);
  console.log("Check unauthorized module: ", unauthorizedModule)
  console.log("Check show unauthorized modal: ", showUnauthorizedModal)

  useEffect(() => {
    // Immediate auth check - no loading delay
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("session");
        if (sessionData) {
          const localUser = JSON.parse(sessionData);
          setUser(localUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("session");
        setUser(null);
      }
      setLoading(false); // Set loading to false immediately
    };

    checkAuth();

    // Listen for auth state changes (for login/logout)
    const handleAuthStateChange = (e: CustomEvent) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        setUser(null);
      }
    };

    window.addEventListener("authStateChanged", handleAuthStateChange as EventListener);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthStateChange as EventListener);
    };
  }, []); // Only run on mount, not on pathname change

  useEffect(() => {
    console.log("In permission effect...")
    const fetchPermissions = async () => {
      if (!user || !user.id) {
        setPermissions(null);
        return;
      }

      if (user.role === "SUPER_ADMIN" || user.role === "SALON_ADMIN") {
        // Admins have all permissions
        setPermissions({ allAccess: true });
        return;
      }

      try {
        const perms = await fetchAndUpdatePermissions(user.id);
        // Always set permissions, even if empty (to reflect cleared permissions)
        setPermissions(perms || {});
      } catch (err) {
        console.error("Failed to fetch permissions", err);
        setPermissions(null);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasModuleAccess = (moduleKey: string): boolean => {
    if (!permissions) return false;
    if ((permissions as any).allAccess) return true; // Admin

    // If permissions object is empty (meaning cleared)
    if (typeof permissions === "object" && Object.keys(permissions).length === 0) {
      return false;
    }

    // Handle the /staff/schedule special route
    let resolvedKey = moduleKey;
    if (pathname === "/staff/schedule" && moduleKey === "staff") {
      resolvedKey = "schedule";
    } else if (
      (pathname === "/appointments" && moduleKey === "appointments") ||
      (pathname.startsWith("/checkout/") && moduleKey === "checkout")
    ) {
      resolvedKey = "clients";
    }

    const modulePermissions = permissions[resolvedKey];
    if (!modulePermissions) return false;

    return modulePermissions.read === true || 
         modulePermissions.create === true || 
         modulePermissions.update === true || 
         modulePermissions.delete === true;
  };



  // useEffect(() => {
  //   if (loading) return; // Don't redirect while checking session

  //   const authRoutes = ["/auth", "/auth/confirm", "/auth/verify"];
  //   const isAuthRoute = authRoutes.includes(pathname);

  //   if (!user && !isAuthRoute) {
  //     // If no user and not on an auth route, redirect to auth immediately
  //     router.replace("/auth");
  //   } else if (user && isAuthRoute) {
  //     console.log("In else if....")
  //     // If user is logged in and tries to access auth routes, redirect to dashboard immediately
  //     router.replace("/dashboard");
  //   }
  // }, [user, pathname, router, loading]);

  useEffect(() => {
    if (loading) return;

    const authRoutes = ["/auth", "/auth/confirm", "/auth/verify"];
    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && !isAuthRoute) {
      router.replace("/auth");
      return;
    }

    if (user && isAuthRoute) {
      router.replace("/dashboard");
      return;
    }

    // Permission check - only for valid routes
    if (user && !isAuthRoute && permissions) {
      // First check if route is valid
      if (!isValidRoute(pathname)) {
        // Invalid route - let Next.js handle 404, don't show unauthorized modal
        setShowUnauthorizedModal(false);
        setUnauthorizedModule(null);
        return;
      }

      // Route is valid, now check permissions
      const moduleKey = pathname.split("/")[1];
      const access = hasModuleAccess(moduleKey);

      if (!access) {
        // Valid route but no permission - show unauthorized modal
        setUnauthorizedModule(moduleKey);
        setShowUnauthorizedModal(true);
      } else {
        setShowUnauthorizedModal(false);
        setUnauthorizedModule(null);
      }
    }
  }, [user, pathname, loading, permissions]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const authRoutes = ["/auth", "/auth/confirm", "/auth/verify"];
  const isAuthRoute = authRoutes.includes(pathname);

  // If no user and not on auth route, show loading while redirecting
  if (!user && !isAuthRoute) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (isAuthRoute || !user) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  const pageContent = (showUnauthorizedModal && unauthorizedModule) ? (
    <UnauthorizedAccess moduleName={unauthorizedModule} />
  ) : (
    children
  );

  // return <AppLayout user={user}>{children}</AppLayout>;
  return <AppLayout user={user}>{pageContent}</AppLayout>
}
