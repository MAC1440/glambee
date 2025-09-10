import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StoreProvider } from "@/lib/StoreProvider";
import { createClient } from "@/lib/supabase/server";
import { LayoutProvider } from "@/components/layout/layout-provider";

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
  const 
    data = await supabase.auth.getUser();
console.log('session' , data)
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
          <LayoutProvider session={data.data.user}>{children}</LayoutProvider>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}
