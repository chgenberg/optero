import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function authMiddleware(request: NextRequest) {
  // Get token from cookie or header
  const token = request.cookies.get("auth-token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/internal/login", request.url));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user has internal access
    if (!decoded.isInternal) {
      return NextResponse.redirect(new URL("/internal/login", request.url));
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.id);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-company-id", decoded.companyId || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL("/internal/login", request.url));
  }
}

// Check if path requires authentication
export function requiresAuth(pathname: string): boolean {
  return pathname.startsWith("/internal/") && !pathname.startsWith("/internal/login");
}
