import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const protectedRoutes = [
  "/",
  "/services",
  "/book-appointment",
  "/staff",
  "/clients",
  "/billing",
  "/inventory",
  "/trends",
  "/profile",
  "/settings",
];
const authRoutes = ["/login", "/signup", "/auth/confirm"];

export async function middleware(request: NextRequest) {
  // The updateSession function is crucial. It refreshes the session cookie,
  // ensuring the server has the latest auth state.
  const response = await updateSession(request);
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // This is the **Auth Guard** for protected routes.
  // If the user is not logged in and tries to access a protected route,
  // they are redirected to the login page.
  if (!session && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // This is the **Guest Guard** you asked about.
  // If the user IS logged in and tries to access a guest-only route
  // (like login or signup), they are redirected to the dashboard.
  if (session && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
};
