import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export function getAllowedOrigin() {
  const env = process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SITE_URL || '';
  return env.split(',')[0].trim();
}

export function corsHeaders(origin?: string) {
  const allow = origin || getAllowedOrigin();
  const headers: Record<string, string> = {};
  if (allow) headers['Access-Control-Allow-Origin'] = allow;
  headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-csrf-token';
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Vary'] = 'Origin';
  return headers;
}

export function assertOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  const allow = getAllowedOrigin();
  if (!origin || !allow) return null; // no external origin or not configured
  if (!origin.includes(allow)) {
    return new NextResponse(JSON.stringify({ error: 'origin_forbidden' }), { status: 403, headers: corsHeaders() });
  }
  return null;
}

export function generateCsrfToken() {
  return crypto.randomBytes(16).toString('hex');
}

export function validateCsrf(req: NextRequest): boolean {
  const header = req.headers.get('x-csrf-token') || '';
  const cookie = req.cookies.get('csrf')?.value || '';
  return Boolean(header) && header === cookie;
}


