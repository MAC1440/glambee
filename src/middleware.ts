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
    const { supabase, response } = createClient(request);

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = request.nextUrl;

    if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return await updateSession(request);
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
