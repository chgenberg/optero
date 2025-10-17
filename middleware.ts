import { NextResponse, NextRequest } from 'next/server';

// Redirect Swedish browser locales to /sv, keep English as default
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API, static, and already localized routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/sv')
  ) {
    return NextResponse.next();
  }

  // Detect Swedish from Accept-Language
  const acceptLang = req.headers.get('accept-language') || '';
  const isSwedish = /\bsv(-SE)?\b/i.test(acceptLang);

  if (isSwedish) {
    const url = req.nextUrl.clone();
    url.pathname = `/sv${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pages except API and static files
    '/((?!api|_next|.*\\..*).*)'
  ]
};
