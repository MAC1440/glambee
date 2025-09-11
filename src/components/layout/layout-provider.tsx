"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import type { Session, User } from "@supabase/supabase-js";

export function LayoutProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const authRoutes = ["/login", "/signup", "/auth/confirm"];

  const user = session?.user || null;

  if (authRoutes.includes(pathname)) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  return <AppLayout user={user as User}>{children}</AppLayout>;
}
