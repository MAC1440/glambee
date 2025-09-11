
"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
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
    // For prototyping, we check localStorage for a session.
    const sessionData = localStorage.getItem("session");
    const currentUser = sessionData ? JSON.parse(sessionData) : null;
    setUser(currentUser);
    setLoading(false);
  }, [pathname]); // Re-check on path change

  useEffect(() => {
    if (loading) return; // Don't redirect while checking session

    const authRoutes = ["/login", "/signup", "/auth/confirm"];
    const isAuthRoute = authRoutes.includes(pathname);

    if (!user && !isAuthRoute) {
      // If no user and not on an auth route, redirect to login
      router.push("/login");
    } else if (user && isAuthRoute) {
      // If user is logged in and tries to access auth routes, redirect to home
      router.push("/");
    }
  }, [user, pathname, router, loading]);

  if (loading) {
    // You can return a loading spinner here
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  
  const authRoutes = ["/login", "/signup", "/auth/confirm"];
  if (authRoutes.includes(pathname) || !user) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <AppLayout user={user}>{children}</AppLayout>;
}
