import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/setup', '/api/auth/status', '/api/auth/login', '/api/auth/setup'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const hasToken = req.cookies.has('auth_token');

  if (!isPublic && !hasToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (hasToken && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
