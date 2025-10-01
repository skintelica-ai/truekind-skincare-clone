import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers()
	})
 
	// Check if route requires authentication
	const { pathname } = request.nextUrl;
	const isAdminRoute = pathname.startsWith("/admin");
	
	// Protect admin routes
	if (isAdminRoute) {
		if (!session) {
			return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
		}
		
		// Check for admin or editor role
		const userRole = (session.user as any).role;
		if (userRole !== "admin" && userRole !== "editor") {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}
	
	// Protect other authenticated routes
	if (!isAdminRoute && !session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/checkout", "/orders", "/wishlist", "/admin/:path*"],
};