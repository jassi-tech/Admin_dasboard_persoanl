import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'hi'];
const publicPages = ['/login', '/auth/2fa', '/auth/reset-password', '/forgot-password'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a public page (ignoring locale)
  const isPublicPage = publicPages.some(page => 
    pathname.endsWith(page) || pathname.includes(`${page}/`)
  );

  const isAuthenticated = request.cookies.get('auth_token');

  // 1. If not authenticated and trying to access a protected page
  if (!isAuthenticated && !isPublicPage && pathname !== '/') {
    const locale = pathname.split('/')[1] || 'en';
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated and trying to access login page
  if (isAuthenticated && isPublicPage) {
    const locale = pathname.split('/')[1] || 'en';
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
  matcher: ['/((?!api|_next|_static|favicon.ico|sitemap.xml|robots.txt).*)']
};
