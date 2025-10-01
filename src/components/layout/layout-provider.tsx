
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
    const checkAuth = async () => {
      try {
        // First check localStorage for quick loading
        const sessionData = localStorage.getItem("session");
        if (sessionData) {
          const localUser = JSON.parse(sessionData);
          setUser(localUser);
        }

        // Then verify with Supabase for security
        const supabaseUser = await AuthService.getCurrentUser();
        if (supabaseUser) {
          // Update user with fresh data from Supabase
          const updatedUser = {
            id: supabaseUser.id,
            name: supabaseUser.fullname || "User",
            email: supabaseUser.email || "",
            avatar: supabaseUser.avatar || "",
            role: supabaseUser.user_type === 'salon' ? "SALON_ADMIN" : "CUSTOMER",
            salonId: supabaseUser.user_type === 'salon' ? "salon_01" : null,
          };
          setUser(updatedUser);
          localStorage.setItem("session", JSON.stringify(updatedUser));
        } else if (sessionData) {
          // If no Supabase user but localStorage exists, clear it
          localStorage.removeItem("session");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear invalid session
        localStorage.removeItem("session");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]); // Re-check on path change

  useEffect(() => {
    if (loading) return; // Don't redirect while checking session

    const authRoutes = ["/login", "/signup", "/auth/confirm", "/auth/verify"];
    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && !isAuthRoute) {
      // If no user and not on an auth route, redirect to signup
      router.push("/signup");
    } else if (user && isAuthRoute) {
      // If user is logged in and tries to access auth routes, redirect to home
      router.push("/");
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
  
  const authRoutes = ["/login", "/signup", "/auth/confirm", "/auth/verify"];
  if (authRoutes.includes(pathname) || !user) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <AppLayout user={user}>{children}</AppLayout>;
}
