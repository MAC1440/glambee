import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = [
  "/",
  "/services",
  "/book-appointment",
  "/staff",
  "/staff/schedule",
  "/clients",
  "/billing",
  "/inventory",
  "/trends",
  "/profile",
  "/settings",
];

// Define authentication routes that are only for unauthenticated users
const authRoutes = ["/login", "/signup", "/auth/confirm"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => {
    // Handle nested routes for clients and staff
    if (route === '/clients' || route === '/staff') {
      return pathname.startsWith(route);
    }
    // Exact match for all other protected routes
    return pathname === route;
  });

  // Auth Guard: If the user is not logged in and tries to access a protected route,
  // redirect them to the login page.
  if (!session && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Guest Guard: If the user is logged in and tries to access an auth route,
  // redirect them to the dashboard.
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
