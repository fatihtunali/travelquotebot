import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from './lib/constants';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const headers = tokenCookie
    ? (() => {
        const newHeaders = new Headers(request.headers);
        newHeaders.set('authorization', `Bearer ${tokenCookie.value}`);
        return newHeaders;
      })()
    : null;
  const responseInit = headers ? { request: { headers } } : undefined;

  // Get the subdomain from hostname
  // Examples:
  // - funnytourism-ykkq.travelquotebot.com -> funnytourism-ykkq
  // - travelquotebot.com -> null
  // - www.travelquotebot.com -> null
  const subdomain = getSubdomain(hostname);

  // If there's a subdomain and it's not www, rewrite to /request/[subdomain]
  if (subdomain && subdomain !== 'www') {
    const url = request.nextUrl.clone();

    // If already on /request path, don't rewrite
    if (url.pathname.startsWith('/request/')) {
      return NextResponse.next(responseInit);
    }

    // If on root path, rewrite to /request/[subdomain]
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = `/request/${subdomain}`;
      return NextResponse.rewrite(url, responseInit);
    }

    // For other paths like /api, /thank-you, etc., prepend /request/[subdomain]
    if (!url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next')) {
      url.pathname = `/request/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url, responseInit);
    }
  }

  return NextResponse.next(responseInit);
}

function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Split by dots
  const parts = host.split('.');

  // If we have more than 2 parts, the first part is the subdomain
  // Example: subdomain.travelquotebot.com -> ['subdomain', 'travelquotebot', 'com']
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that don't need subdomain handling
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
