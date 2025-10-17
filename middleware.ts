import { NextResponse, NextRequest } from 'next/server';

// Keep EN as default. Only switch locale when explicitly requested via query (?lang=sv|en).
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Skip API/static
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || /\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const lang = searchParams.get('lang');
  if (lang === 'sv' && !pathname.startsWith('/sv')) {
    const url = req.nextUrl.clone();
    url.pathname = `/sv${pathname}`;
    url.searchParams.delete('lang');
    return NextResponse.redirect(url);
  }
  if (lang === 'en' && pathname.startsWith('/sv')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace(/^\/sv/, '') || '/';
    url.searchParams.delete('lang');
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
