import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/lib/StoreProvider";
import { createClient } from "@/lib/supabase/server";
import { AuthLayout } from "@/components/layout/auth-layout";

export const metadata: Metadata = {
  title: "SalonFlow",
  description: "Manage your salon with ease.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <StoreProvider>
          {user ? (
            <AppLayout user={user}>{children}</AppLayout>
          ) : (
            <AuthLayout>{children}</AuthLayout>
          )}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
