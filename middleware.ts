import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define access permissions
const routeAccess = {
  public: [
    "/",
    "/login",
    "/auth",
    "/api/auth",
    "/pending-approval",
    "/auth/error",
    "/auth/signin",
    "/auth/signout",
    "/auth/suspended",
    "/auth/rejected",
    "/_next",
    "/favicon.ico",
    "/public"
  ],
  pending: [
    "/pending-approval",
    "/auth/signout",
    "/api/auth"
  ]
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Create response with security headers
  const response = NextResponse.next();
  
  // Add security headers for better authentication handling
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  
  // Add CSRF protection headers for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
  }
  
  // Allow public routes
  if (routeAccess.public.some(route => pathname.startsWith(route))) {
    return response;
  }

  try {
    // Get the token from the request with proper configuration
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      // Use the same cookie name as configured in auth.ts
      cookieName: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token"
  });

  // Redirect unauthenticated users to signin
  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const userRole = token.role as string;
  const userStatus = token.status as string;

  // Handle pending users - redirect to pending approval page
  if (userStatus === "PENDING") {
    // Allow access to pending approval routes
    if (routeAccess.pending.some(route => pathname.startsWith(route))) {
      return response;
    }
    
    // Redirect to pending approval page if trying to access other routes
    if (!pathname.startsWith("/pending-approval")) {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }
    
    return response;
  }

  // Handle rejected users
  if (userStatus === "REJECTED") {
    // Allow access to rejected page only
    if (pathname === "/auth/rejected") {
      return response;
    }
    return NextResponse.redirect(new URL("/auth/rejected", req.url));
  }

    // Handle suspended users
  if (userStatus === "SUSPENDED" || userStatus === "INACTIVE") {
    // Allow access to suspended page only
    if (pathname === "/auth/suspended") {
      return response;
    }
    return NextResponse.redirect(new URL("/auth/suspended", req.url));
  }

    // Handle admin routes
    if (pathname.startsWith("/admin")) {
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

    // Handle super admin routes
    if (pathname.startsWith("/super-admin")) {
      if (userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return response;

  } catch (error) {
    console.error("[Middleware] Token validation error:", error);
    
    // In case of token validation error, redirect to signin
    // Don't throw error that might interfere with auth flow
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 