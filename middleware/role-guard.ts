import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserRole, Permission, hasPermission } from "@/lib/rbac";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface DecodedToken {
  id: string;
  email: string;
  role: UserRole;
  isInternal: boolean;
  companyId?: string;
}

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (request: NextRequest): NextResponse | null => {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      if (!allowedRoles.includes(decoded.role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Role check passed
      return null;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(requiredPermission: Permission) {
  return (request: NextRequest): NextResponse | null => {
    const token = request.cookies.get("auth-token")?.value || 
                  request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      
      // Check if user's role has the required permission
      if (!hasPermission(decoded.role, requiredPermission)) {
        return NextResponse.json(
          { error: `Permission denied: ${requiredPermission}` },
          { status: 403 }
        );
      }

      // Permission check passed
      return null;
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  };
}

/**
 * Extract user info from request
 */
export function getUserFromRequest(request: NextRequest): DecodedToken | null {
  const token = request.cookies.get("auth-token")?.value || 
                request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

/**
 * Check if user can perform action on resource
 */
export function canAccessResource(
  userRole: UserRole,
  resourceOwnerId: string,
  userId: string
): boolean {
  // Admins can access everything
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Users can only access their own resources
  return resourceOwnerId === userId;
}
