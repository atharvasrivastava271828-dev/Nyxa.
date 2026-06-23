import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for route protection.
 *
 * PROTECTED ROUTES:  /dashboard/**  → requires active session cookie
 * AUTH REDIRECTS:    /login, /register → redirects logged-in users away
 *
 * Auth is based on the `sb-access-token` HttpOnly cookie set on login.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;
  const { pathname } = request.nextUrl;

  // Protect the dashboard — redirect unauthenticated users to login
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect already-authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
