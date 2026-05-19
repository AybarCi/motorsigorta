import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Sadece /admin rotasını koru
  if (url.pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_session')?.value;

    if (!token || token !== 'motorsigorta_secure_admin_2026') {
      // Token yoksa veya yanlışsa login sayfasına yönlendir
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
