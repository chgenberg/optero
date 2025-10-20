import { NextRequest, NextResponse } from "next/server";

/**
 * Simple admin auth middleware for destructive endpoints.
 * Checks for ADMIN_TOKEN in Authorization header or ?token query param.
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const adminToken = process.env.ADMIN_TOKEN;
  
  // If no ADMIN_TOKEN is set, allow (dev mode)
  if (!adminToken) {
    console.warn('⚠️  ADMIN_TOKEN not set - admin endpoints are unprotected!');
    return null;
  }

  // Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (token === adminToken) {
      return null; // Auth OK
    }
  }

  // Check query param
  const { searchParams } = new URL(req.url);
  const tokenParam = searchParams.get('token');
  if (tokenParam === adminToken) {
    return null; // Auth OK
  }

  // Unauthorized
  return NextResponse.json(
    { error: 'unauthorized', message: 'Admin token required' },
    { status: 401 }
  );
}

