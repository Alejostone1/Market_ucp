import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas de admin
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/dashboard/admin')) {
    const token = request.cookies.get('usuario')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const usuario = JSON.parse(decodeURIComponent(token));
      
      // Verificar si el usuario tiene rol ADMIN
      if (usuario.rol !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/student', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/dashboard/admin/:path*'],
};
