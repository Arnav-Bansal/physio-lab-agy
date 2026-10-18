import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PATIENT_SESSION_COOKIE, CRM_SESSION_COOKIE } from '@/lib/auth/session';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Protect Patient Portal routes (/portal/*)
  if (pathname.startsWith('/portal')) {
    const patientCookie = request.cookies.get(PATIENT_SESSION_COOKIE)?.value;
    if (!patientCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect CRM routes (/crm/* except /crm/login)
  if (pathname.startsWith('/crm') && !pathname.startsWith('/crm/login')) {
    const crmCookie = request.cookies.get(CRM_SESSION_COOKIE)?.value;
    if (!crmCookie) {
      const crmLoginUrl = new URL('/crm/login', request.url);
      crmLoginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(crmLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*', '/crm/:path*'],
};
