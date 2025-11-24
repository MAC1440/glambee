
"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthService } from "@/lib/supabase/auth-service";
import { useEffect, useState } from "react";
import { fetchAndUpdatePermissions, ModuleKey } from "@/hooks/use-permissions";
import { UnauthorizedAccess } from "../ui/unauthorized-access";

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
        setPermissions(perms);
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
  
    // Replace this with your actual permission shape & check logic
    const modulePermissions = permissions[moduleKey];
    if (!modulePermissions) return false;
  
    return (
      modulePermissions.read === true ||
      modulePermissions.create === true ||
      modulePermissions.update === true ||
      modulePermissions.delete === true
    );
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
  
    // New permission check here:
    if (user && !isAuthRoute && permissions) {
      const moduleKey = pathname.split("/")[1]; // e.g. "/dashboard" => "dashboard"
      const access = hasModuleAccess(moduleKey);
      if (!access) {
        // Instead of redirect, show modal
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
