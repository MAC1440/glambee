
"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AuthService } from "@/lib/supabase/auth-service";
import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);

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
    if (loading) return; // Don't redirect while checking session

    const authRoutes = ["/auth", "/auth/confirm", "/auth/verify"];
    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && !isAuthRoute) {
      // If no user and not on an auth route, redirect to auth immediately
      router.replace("/auth");
    } else if (user && isAuthRoute) {
      // If user is logged in and tries to access auth routes, redirect to dashboard immediately
      router.replace("/dashboard");
    }
  }, [user, pathname, router, loading]);

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

  return <AppLayout user={user}>{children}</AppLayout>;
}
